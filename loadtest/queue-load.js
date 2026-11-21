import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';

// MODE=queue : POST /api/queue/generate-article, then poll until the job is completed
// MODE=sync  : POST /api/ai/generate-article and wait for the answer (the old way)
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const SECRET = __ENV.SECRET;
const MODE = __ENV.MODE || 'queue';
const JOBS = Number(__ENV.JOBS) || 600;
const RATE = Number(__ENV.RATE) || 100;
const POLL_MS = Number(__ENV.POLL_MS) || 2000;   // like a frontend polling every 2 s
const GIVE_UP_MS = 170000;

const acceptMs = new Trend('accept_ms', true);   // time until the server answered the POST
const doneMs = new Trend('done_ms', true);       // time until the user actually has the text
const notDone = new Counter('jobs_not_completed');

export const options = {
  scenarios: {
    burst: {
      executor: 'constant-arrival-rate',
      rate: RATE,
      timeUnit: '1s',
      duration: `${Math.ceil(JOBS / RATE)}s`,
      preAllocatedVUs: Math.min(JOBS, 700),
      maxVUs: 2000,
      gracefulStop: '200s',   // let polling finish after the burst ends
    },
  },
};

const headers = (user) => ({
  'Content-Type': 'application/json',
  'x-load-test-user': user,
  'x-load-test-secret': SECRET,
  'x-load-test-plan': 'premium',
});

export default function () {
  const user = `loadtest_prem_q${__VU % 50}`;
  const body = JSON.stringify({ prompt: `Write an article about topic ${__VU}-${__ITER}` });
  const start = Date.now();

  if (MODE === 'sync') {
    const res = http.post(`${BASE_URL}/api/ai/generate-article`, body, { headers: headers(user), tags: { endpoint: 'sync' } });
    const ok = check(res, { 'sync 200': (r) => r.status === 200 });
    acceptMs.add(res.timings.duration);
    if (ok) doneMs.add(res.timings.duration); else notDone.add(1);
    return;
  }

  const res = http.post(`${BASE_URL}/api/queue/generate-article`, body, { headers: headers(user), tags: { endpoint: 'enqueue' } });
  acceptMs.add(res.timings.duration);
  if (!check(res, { 'accepted 202': (r) => r.status === 202 })) { notDone.add(1); return; }

  const id = res.json('jobId');
  while (Date.now() - start < GIVE_UP_MS) {
    sleep(POLL_MS / 1000);
    const s = http.get(`${BASE_URL}/api/queue/jobs/${id}`, { headers: headers(user), tags: { endpoint: 'poll' } });
    const state = s.status === 200 ? s.json('state') : null;
    if (state === 'completed') { doneMs.add(Date.now() - start); return; }
    if (state === 'failed') { notDone.add(1); return; }
  }
  notDone.add(1);
}