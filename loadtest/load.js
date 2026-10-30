import http from 'k6/http';
import { check, sleep } from 'k6';
import encoding from 'k6/encoding';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const SECRET = __ENV.SECRET;
const VUS = Number(__ENV.VUS) || 100;
const HOLD = __ENV.HOLD || '3m';
const RAMP = VUS >= 1000 ? '3m' : VUS >= 500 ? '2m' : '1m';
const MIX = __ENV.MIX || 'all';
const THINK = Number(__ENV.THINK) || 1;
const RATE = Number(__ENV.RATE) || 0;            // capacity mode: requests per second at peak
const HOLD_RATE = __ENV.HOLD_RATE || '90s';

const TINY_PNG = encoding.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');

// Only HTTP 200 counts as success. Everything else shows up in http_req_failed.
http.setResponseCallback(http.expectedStatuses(200));

export const options = {
  stages: [
    { duration: RAMP, target: VUS },   // users arrive gradually
    { duration: HOLD, target: VUS },   // everyone active
    { duration: '30s', target: 0 },    // users leave
  ],
  summaryTrendStats: ['avg', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
    // AI endpoints include a fake wait: article/title 800 ms, image 2000 ms + 500 ms upload
    'http_req_duration{endpoint:list}': ['p(95)<600'],
    'http_req_duration{endpoint:article}': ['p(95)<1500'],
    'http_req_duration{endpoint:title}': ['p(95)<1500'],
    'http_req_duration{endpoint:image}': ['p(95)<3200'],
    'http_req_duration{endpoint:upload}': ['p(95)<1800'],
  },
};

// CAPACITY MODE: -e RATE=1000 sends 1000 requests per second (instead of a fixed number of users).
// Rough guide: users who each act every ~6 s  =>  RATE x 6 simulated active users.
if (RATE) {
  delete options.stages;
  options.scenarios = {
    capacity: {
      executor: 'ramping-arrival-rate',
      startRate: Math.max(1, Math.round(RATE / 5)),
      timeUnit: '1s',
      preAllocatedVUs: Math.min(Math.round(RATE * 0.7), 1500),
      maxVUs: Number(__ENV.MAXVUS) || 4000,
      stages: [
        { duration: '30s', target: RATE },
        { duration: HOLD_RATE, target: RATE },
        { duration: '10s', target: 0 },
      ],
    },
  };
  // stop the run early if the server is clearly failing
  options.thresholds.http_req_failed = [{ threshold: 'rate<0.05', abortOnFail: true, delayAbortEval: '40s' }];
}

const headers = (user, plan, json) => {
  const h = {
    'x-load-test-user': user,
    'x-load-test-secret': SECRET,
    'x-load-test-plan': plan,
  };
  if (json) h['Content-Type'] = 'application/json';
  return h;
};

const isOk = (res, name) =>
  check(res, { [`${name} ok`]: (r) => r.status === 200 && r.json('success') === true });

const postJson = (path, body, user, plan, endpoint) =>
  http.post(`${BASE_URL}${path}`, JSON.stringify(body), {
    headers: headers(user, plan, true),
    tags: { endpoint },
  });

export default function () {
  const premium = __VU % 10 < 3;                      // 30% premium users
  const plan = premium ? 'premium' : 'free';
  const user = premium
    ? `loadtest_prem_${__VU}`
    : `loadtest_free_${__VU}_${Math.floor(__ITER / 8)}`; // new free identity every 8 iterations

    // MIX=all (default), MIX=nolist (never browse creations), MIX=listonly (only browse creations)
  const roll =
    MIX === 'nolist' ? 0.55 + Math.random() * (premium ? 0.45 : 0.40)
    : MIX === 'listonly' || MIX === 'seeded' ? 0
    : Math.random();
  const topic = Math.floor(Math.random() * 1000);

  if (roll < 0.55 || (roll >= 0.95 && !premium)) {
    const res = http.get(`${BASE_URL}/api/user/get-user-creations`, {
      headers: MIX === 'seeded' ? headers(`loadtest_seed_${__VU % 100}`, 'free', false) : headers(user, plan, false),
      tags: { endpoint: 'list' },
    });
    isOk(res, 'list');
  } else if (roll < 0.75) {
    isOk(postJson('/api/ai/generate-article', { prompt: `Write an article about topic ${topic}` }, user, plan, 'article'), 'article');
  } else if (roll < 0.85) {
    isOk(postJson('/api/ai/generate-blog-title', { prompt: `Blog titles about topic ${topic}` }, user, plan, 'title'), 'title');
  } else if (roll < 0.95) {
    isOk(postJson('/api/ai/generate-image', { prompt: `A picture of object ${topic}` }, user, plan, 'image'), 'image');
  } else {
    const res = http.post(
      `${BASE_URL}/api/ai/remove-image-bg`,
      { image: http.file(TINY_PNG, 'test.png', 'image/png') },
      { headers: headers(user, plan, false), tags: { endpoint: 'upload' } }
    );
    isOk(res, 'upload');
  }

  if (!RATE) sleep((3 + Math.random() * 5) * THINK); // think time: 3 to 8 seconds (in RATE mode the arrival rate controls pacing)
}