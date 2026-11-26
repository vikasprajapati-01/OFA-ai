# Performance and scaling lab

This guide explains how to run the local lab, what each test does, and the measurements it produced. The short version is in the [README](../README.md#performance-and-scaling-lab).

The lab is **local only**. It uses dummy credentials, simulated AI responses and a throwaway database, so it never touches production data or real AI providers.

## Contents

1. [Quick start](#quick-start)
2. [What runs](#what-runs)
3. [Test-mode switches](#test-mode-switches)
4. [Tests](#tests)
5. [Scaling and failure drills](#scaling-and-failure-drills)
6. [Dashboards](#dashboards)
7. [Results](#results)
8. [Method and caveats](#method-and-caveats)
9. [Versions](#versions)
10. [Troubleshooting](#troubleshooting)

## Quick start

You need Docker Desktop and [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/). Commands below are PowerShell; in bash, set environment variables with `VAR=value command` instead of `$env:VAR = "value"`.

```powershell
docker compose up -d --build --scale app=2
docker compose restart nginx
k6 run -e SECRET=lab-secret -e BASE_URL=http://localhost:8080 loadtest/smoke.js
```

Expected result: **16 of 16 checks passed**. (Five of the 21 HTTP requests in that script fail on purpose, to test the 401, 403 and 400 answers.)

| What | Where |
| --- | --- |
| API through the load balancer | http://localhost:8080 |
| Grafana (no login) | http://localhost:3030 |
| Prometheus | http://localhost:9090 |

Stop the lab with `docker compose down`. Prometheus and Grafana data are kept in Docker volumes; `docker compose down -v` also deletes them. PostgreSQL has no volume, so its data is reset on every start.

### Reset the data between runs

```powershell
docker compose exec -T postgres psql -U postgres -d loadtest -c "TRUNCATE creations, user_usage RESTART IDENTITY;"
docker compose exec -T redis redis-cli FLUSHALL
```

The smoke test expects an empty database (it checks that a free user gets exactly 10 generations), so reset first when you run it a second time.

## What runs

| Service | Purpose |
| --- | --- |
| `postgres` | PostgreSQL 16. Tables are created from `loadtest/schema.sql` on first start. |
| `redis` | Redis 7: history-list cache and job queue. |
| `app` (scalable) | The Express backend in test mode. |
| `worker` | BullMQ worker that processes queued article and title jobs. |
| `nginx` | Reverse proxy and round-robin load balancer in front of `app`. |
| `prometheus` | Scrapes `/metrics` from every app container, and receives k6 results. |
| `grafana` | Dashboards, provisioned from `grafana/provisioning`. |

Nginx looks up the `app` containers when it starts. **After changing the number of app containers, run `docker compose restart nginx`.**

## Test-mode switches

Everything is controlled by environment variables. In the lab they are set in `docker-compose.yml`; in production none of them is set.

| Variable | Effect |
| --- | --- |
| `LOAD_TEST=true` | Turns on test mode: fake logins, simulated AI, image and upload responses, local PostgreSQL pool, extra monitoring logs. |
| `LOAD_TEST_SECRET` | Required in test mode. The server refuses to start without it, on Vercel, or with a live Clerk key. |
| `LOCAL_DATABASE_URL` | Local PostgreSQL connection (instead of Neon). |
| `PG_POOL_MAX` | Connections per container (default `15` in the lab). |
| `RATE_LIMIT_PER_MIN` | API rate limit per user (the lab raises it so tests are not throttled). |
| `METRICS=true` | Exposes `GET /metrics` for Prometheus. |
| `QUEUE_ENABLED=true` | Mounts the async routes under `/api/queue` (needs `REDIS_URL`). |
| `WORKER_CONCURRENCY` | Jobs a worker runs at the same time (default `5`). |
| `FAKE_AI_FAIL_RATE` | Fraction of simulated AI calls that fail (default `0`). |
| `FAKE_AI_DELAY_MS` | Simulated text-generation time in milliseconds (default `800`). |

Fake login uses three request headers: `x-load-test-secret` (the lab value is `lab-secret`), `x-load-test-user` (any id, for example `loadtest_prem_1`), and `x-load-test-plan` (`premium`, otherwise the user is on the free plan). Simulated waits: articles and titles 0.8 s, images 2.5 s, background and object removal 0.5 s.

Test users are named `loadtest_prem_*` and `loadtest_free_*`. To remove their rows:

```sql
DELETE FROM creations WHERE user_id LIKE 'loadtest_%';
DELETE FROM user_usage WHERE user_id LIKE 'loadtest_%';
```

## Tests

All scripts are in `loadtest/`. They read the secret and address from `-e SECRET=lab-secret -e BASE_URL=http://localhost:8080`.

### Smoke test: `smoke.js`

16 checks across login, the AI routes, the history list, plan restrictions, validation and the free limit.

```powershell
k6 run -e SECRET=lab-secret -e BASE_URL=http://localhost:8080 loadtest/smoke.js
```

### Load test: `load.js`

A mix of about 55% history reads, with the rest split between article, title, image and premium background-removal calls. Two modes:

- **Closed loop** (simulated users who think for a moment between actions): `-e VUS=500 -e HOLD=2m`
- **Capacity** (a fixed arrival rate, no matter how slow the server gets): `-e RATE=1500` (add `-e HOLD_RATE=90s` to change the hold time)

Thresholds: p95 limits per endpoint (list 600 ms, article and title 1.5 s, image 3.2 s, upload 1.8 s) and a failure rate below 5%. Note that k6 counts only non-2xx answers as failures, so a server that answers every request slowly shows 0% failed. Look at latency and dropped iterations too.

```powershell
k6 run -e SECRET=lab-secret -e BASE_URL=http://localhost:8080 -e RATE=1000 loadtest/load.js
```

To send k6 results into Prometheus (so they appear in Grafana), add the output flag and two environment variables:

```powershell
$env:K6_PROMETHEUS_RW_SERVER_URL = "http://localhost:9090/api/v1/write"
$env:K6_PROMETHEUS_RW_TREND_STATS = "p(95),p(99),max"
k6 run -o experimental-prometheus-rw --tag testid=my-run -e SECRET=lab-secret -e BASE_URL=http://localhost:8080 -e RATE=600 loadtest/load.js
```

### Job queue: `queue-load.js`

Sends a burst of article requests either the old way (`MODE=sync`, wait for the result) or through the queue (`MODE=queue`, get a job id, then poll every 2 seconds until it is done). Metrics: `accept_ms` (time until the server answers the request) and `done_ms` (time until the user has the text).

```powershell
k6 run -e SECRET=lab-secret -e BASE_URL=http://localhost:8080 -e MODE=queue -e JOBS=600 -e RATE=100 loadtest/queue-load.js
```

### Resume route: `resume.js`

Checks the valid, text-file, missing-file, free-user, over-5-MB, corrupt and over-10-MB cases, then uploads at a steady rate. It needs a small PDF at `loadtest/real.pdf` (any PDF on your computer; the path is git-ignored so a personal file is never committed).

```powershell
Copy-Item "C:\path\to\any.pdf" loadtest/real.pdf
k6 run -e SECRET=lab-secret -e BASE_URL=http://localhost:8080 -e RATE=20 loadtest/resume.js
```

### Production-mode check: `prod-mode.js`

Starts the app **without** test mode, as production would, and proves the lab hooks are inert: fake logins get `401`, and `/metrics`, `/api/queue/*` and `/api/health/db` do not exist. CI runs this on every push. Locally:

```powershell
docker run -d --rm --name ofa-prod-check -p 3100:3000 -e PORT=3000 -e CLERK_PUBLISHABLE_KEY=pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk -e CLERK_SECRET_KEY=sk_test_dummy -e CLOUDINARY_CLOUD_NAME=x -e CLOUDINARY_API_KEY=x -e CLOUDINARY_API_SECRET=x -e GEMINI_API_KEY=x -e CLIPDROP_API_KEY=x -e DATABASE_URL=postgresql://user:pass@localhost.invalid/db ofa-app
k6 run -e BASE_URL=http://localhost:3100 loadtest/prod-mode.js
docker stop ofa-prod-check
```

(The `ofa-app` image exists after the first `docker compose build`.)

## Scaling and failure drills

**More app containers:**

```powershell
docker compose up -d --scale app=3
docker compose restart nginx
```

**Worker concurrency** (jobs run at once per worker), or more workers:

```powershell
$env:WORKER_CONCURRENCY = "20"; docker compose up -d worker
docker compose up -d --scale worker=2
```

**Simulated AI failures** (for retry and refund behaviour):

```powershell
$env:FAKE_AI_FAIL_RATE = "0.7"; docker compose up -d --scale app=2
```

Remove the variable and run the same command again to switch it off.

**Lose a container during a run.** Start a load test, then in a second window:

```powershell
docker kill ofa-app-2      # crash: instant SIGKILL
docker stop ofa-app-2      # planned stop: the app finishes running requests first
docker start ofa-app-2     # bring it back
```

The same two commands work for `ofa-worker-1`.

## Dashboards

Open http://localhost:3030.

- **OFA lab**: requests per second and server-side p95 latency by route, k6 client-side latency by endpoint and virtual users, CPU and memory per container, event-loop lag, and database pool connections.
- **OFA queue**: queue depth by job state (waiting, active, delayed, failed) and the queue routes' request rate and latency.

The server-side p95 is estimated from histogram buckets, so treat the k6 client-side numbers as the reference. The event-loop lag line has a floor of about 10 ms because of the sampling resolution.

## Results

All numbers were measured by the scripts in this repository on the hardware described under [Method and caveats](#method-and-caveats). They are single runs unless stated otherwise.

### 1. Database distance (production, Vercel to Neon)

Vercel functions defaulted to Washington (`iad1`) while the Neon database is in Singapore. Moving the function region to Singapore (`sin1`):

| | Median round trip (second `SELECT 1`) | Range |
| --- | --- | --- |
| `iad1` (before) | 225 ms | 224 to 226 ms (two spikes of about 685 ms) |
| `sin1` (after) | 3 ms | 3 to 4 ms (spikes of 13 and 17 ms) |

15 samples each, about 75 times lower and 222 ms saved per query. Because a request used several queries one after the other, this matters more than any code change.

### 2. 500 simulated users on Neon, one process, simulated AI

| Run | Requests | Failed | History list | Notes |
| --- | --- | --- | --- | --- |
| Local PostgreSQL | 16,500 | 0 | p95 8.4 ms | 59 req/s |
| Neon, no cache | 16,217 | 0 | mean 80.6 ms, p95 103 ms, p99 249 ms | 58.4 req/s, 34 MB received |
| Neon, Redis cache (run 1) | not recorded | 0 | mean 52.8 ms, p95 121 ms, p99 381 ms | hit rate 51.3% |
| Neon, Redis cache (run 2) | not recorded | 0 | mean 40.8 ms, p95 93 ms, p99 145 ms | hit rate 51.4% |

The cache lowered the mean by 35 to 49% but not the p95, and it only helps because this workload is about 55% repeated history reads (an assumption of the test script, not a measured production mix). The median is unreliable at a 50% hit rate. An earlier version that sent the full text in the history list received 185 MB per run instead of 34 MB (p95 296 ms against 103 ms), but the runs had different request counts and the script was edited in between, so treat that comparison as indicative.

### 3. One versus two app containers (capacity mode)

Local PostgreSQL and Redis, simulated AI, about 130 seconds per run.

| | 1 container, 600/s | 1 container, 1,000/s | 1 container, 1,500/s | 2 containers, 1,500/s |
| --- | --- | --- | --- | --- |
| Requests completed | 67,791 | 112,999 | 147,262 of 169,499 | 169,499 of 169,499 |
| Dropped by k6 | 8 | 0 | 22,237 (13.1%) | 0 |
| History list p95 | 15.9 ms | 16.0 ms | 2.67 s | 29 ms |
| Article p95 | 849 ms | 833 ms | 13.4 s | 857 ms |
| Image p95 | 2.54 s | 2.53 s | 15.0 s | 2.55 s |
| App CPU | about 59% | 87 to 100% | 104 to 106% | 84 to 104% each |
| Worst database-pool wait | not measured | not measured | 4,463 queued queries | 0 |

One Node process uses at most about one CPU core, and at about 1,000 requests per second it was at its limit. Two containers share the load evenly and handled the same 1,500 per second cleanly. Two containers are also close to their own limit at that rate; the true ceiling for two was not measured. Nothing returned an error in the overloaded run: the damage showed up only as latency and requests that k6 could not start, which is why latency and dropped iterations are the numbers to read.

### 4. Losing a container at 600 requests per second

Two app containers; one is stopped after 60 seconds and restarted 40 seconds later.

| | Hard kill | Hard kill (repeat) | Planned stop with graceful shutdown |
| --- | --- | --- | --- |
| Requests | 85,714 | 85,791 | 85,740 |
| Failed | 163 (0.19%) | 148 (0.17%) | **0** |
| Failed routes | in-flight POST routes | article 46, title 25, image 75, upload 2, list 0 | none |
| Slowest request | 36.5 s | 38.1 s | 38.3 s |
| Time to stop the container | instant | instant | 3 s |

- Before graceful shutdown was added, stopping a container always took about 10.4 seconds: the Node process ignored the stop signal and Docker force-killed it. The new handler finishes running requests, closes idle connections and exits.
- The failed requests are the POSTs that were in flight when the container died. The history list (a GET) never failed. Nginx can safely retry a GET on the other container but not a POST it already sent; this fits the pattern, but it was not tested separately.
- The surviving container absorbed all the traffic (about 600 requests per second), and the restarted container received traffic again about 15 seconds after it started.
- A handful of requests still waited up to about 38 seconds in every run, graceful or not. Open-source Nginx only notices a dead server passively. In the run with the shortened connect timeout (see below), the Nginx error log showed "timed out while connecting" bursts of 16 at roughly 13-second intervals, which fits Nginx re-testing the missing container every so often. The mechanism behind the 38-second waits with the default settings was not proven, and the default-run logs were no longer available to check.
- An earlier baseline run on the same day dropped 1.55% of iterations for an unknown reason and was not used.

**Tried and reverted:** lowering Nginx's connect timeout to 2 seconds. The failover run got worse (586 failures) but so did a control run with no failure at all (16,283 dropped), so the experiment said more about that day's machine than about the setting, and it was reverted.

### 5. Job queue (600 jobs arriving at 100 per second)

| | Synchronous | Queue, worker concurrency 5 | Queue, worker concurrency 20 |
| --- | --- | --- | --- |
| Time until the server answers the request | median 813 ms | **median 5.7 ms**, p95 53 ms | median 6.8 ms, p95 186 ms |
| Time until the user has the text, median | 0.81 s | 48 s | 12 s |
| Time until the user has the text, p95 | 0.85 s | 88 s | 20 s |
| Last job finished | 0.9 s | 94 s | 21 s |
| HTTP requests sent | 601 | 14,799 (status polling every 2 s) | 3,868 |
| Simultaneous AI calls | about 83 | 5 | 20 |
| Jobs saved | 601 | 601 | 601 |

The queue is **slower to finish a burst** than waiting for the result, because the simulated AI has no rate limit and the worker takes jobs in turn. Its benefits are a fast answer, a cap on simultaneous AI calls, retries and durability. Whether the cap matters in practice depends on the real Gemini and Clipdrop quotas, which were not measured here.

| Worker disturbance during a burst | Saved / distinct prompts | Slowest job |
| --- | --- | --- |
| Hard kill at +15 s, back after 10 s | 601 / 601 | 116 s |
| Graceful stop at +15 s, back after 10 s | 600 / 600 | 102 s |

No job was lost and no duplicate row appeared. Delivery is "at least once", so a crash at exactly the wrong moment (after saving a row but before reporting the job done) could in principle repeat a job; the window is a few milliseconds wide and was not hit. The worker stopped in 1 second when stopped gracefully.

**Retries and refunds.** With `FAKE_AI_FAIL_RATE=0.7`, ten jobs from one free user ended as 6 completed and 4 failed. Each job is tried up to 3 times with a wait of 1 s and then 2 s, and the free-usage counter ended at 6, equal to the 6 saved results: slots of failed jobs were given back.

### 6. Soak test (30 minutes, two containers, 200 requests per second)

364,589 requests, 0 failed, 10 dropped. p95: article 821 ms, title 821 ms, image 2.52 s, upload 513 ms, history list 8.8 ms.

| Minute | Process memory, container A (MiB) | Container B (MiB) | JS heap in use (both) |
| --- | --- | --- | --- |
| 6 | 144 | 139 | 29 to 30 |
| 12 | 148 | 146 | 29 to 31 |
| 18 | 149 | 148 | 29 to 30 |
| 24 | 151 | 150 | 30 to 31 |
| 30 | 152 | 151 | 30 to 31 |

(Lowest value in each 5-minute window.) The JavaScript heap is flat. Process memory is still creeping up by about 1 to 2 MiB per 6 minutes at the end, with the growth slowing; it is outside the JS heap, but whether it stops was not established in 30 minutes. 151,141 rows (56 MB) were written to the database.

### 7. Resume route

- Valid PDF, text file, missing file, free user, over 5 MB, over 10 MB and corrupt PDF all return the intended status (`200`, `400`, `400`, `403`, `413`, `413`, and `400` for an unreadable PDF; a corrupt PDF used to return `500`).
- 401 uploads of a real resume PDF at 20 per second: 0 failed, p95 844 ms.
- Uploaded files are deleted after processing: each container's temp folder held 1 file before and after the runs.
- The lab's Nginx originally rejected anything over 1 MB (its default). It is now set to 12 MB so the application's own limits apply.
- A tiny hand-made 846-byte PDF made with a custom script was rejected by the PDF parser in 23 to 48% of requests, even at one request per second, while its structure checked out in other parsers. The real resume never failed. The parser (`pdf-parse` 1.x, based on a 2017 PDF.js) may reject unusual files.

### 8. Dependencies

`npm audit` after `npm audit fix`: 0 vulnerabilities in production dependencies for both the backend and the frontend. Two moderate findings remain in the backend development tools (`nodemon` through `minimatch`); the suggested fix would downgrade `nodemon`, and those tools are not part of the production install.

## Method and caveats

- **Hardware:** a laptop with an Intel i5-13450HX (16 threads), 16 GB RAM, Windows and Docker Desktop (about 8 GB available to containers). k6, the containers and the database all share it, so results are lower than a dedicated server would give, and runs from different days are not directly comparable. One baseline run on one day was clearly slower than identical runs on other days, for reasons that were not found.
- **Single runs.** Unless stated, each number comes from one run. Differences of a few percent are noise.
- **Simulated AI.** The lab never calls Gemini, Clipdrop or Cloudinary. Nothing here says anything about their latency, quotas or failure behaviour.
- **Workload assumptions.** The 55% history-read mix, the 1-second think time and the burst sizes are choices made in the test scripts, not measurements of real users.
- **Production** runs on Vercel serverless functions, so the queue, the worker, Prometheus and the Redis cache are not part of it. Only the region move, the lighter history list, the atomic usage accounting, rate limiting and the validation fixes apply to production.
- **Not tested:** more than two app containers, runs longer than 30 minutes, a proxy with active health checks, the real AI providers under burst, and a real Clerk login under load.

## Versions

| Component | Version |
| --- | --- |
| Node.js | 22 (Docker image `node:22-slim`; CI uses 22) |
| Express | 5 |
| PostgreSQL / Redis | 16 / 7 |
| Nginx | 1.27 (alpine image) |
| BullMQ | 6.x (`^6.7.8` in `package.json`) |
| prom-client | 15.1.3 (deprecated by its authors in favour of `@prometheus-io/client`) |
| Prometheus / Grafana | 3.16.0 / 13.3.1 (the `latest` images at the time of testing, November 2026) |
| Docker Compose | 5.2.0 |
| k6 | installed locally (version not recorded) |

## Troubleshooting

- **Requests go to only one app container, or some fail right after scaling:** run `docker compose restart nginx`.
- **The smoke test fails on "free user gets exactly 10 generations":** the database is not empty. Reset the data (see above).
- **A port is already in use:** the lab binds 8080 (Nginx), 9090 (Prometheus) and 3030 (Grafana) on `127.0.0.1`. Stop whatever else uses them, or change the port in `docker-compose.yml`.
- **See what a container is doing:** `docker compose logs --tail 50 app`, `docker compose logs worker`, `docker compose ps`.
- **Start from a completely clean state:** `docker compose down -v`, then start again.
- **Grafana panels are empty:** run a load test, and make sure Prometheus targets are healthy at http://localhost:9090/targets.