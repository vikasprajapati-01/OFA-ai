import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const SECRET = __ENV.SECRET;
const RATE = Number(__ENV.RATE) || 20;
const URL = `${BASE_URL}/api/ai/review-resume`;

const pdf = open(__ENV.FILE || './real.pdf', 'b');
const over5mb = new Uint8Array(6 * 1024 * 1024).buffer;    // over the 5 MB rule in the controller
const over10mb = new Uint8Array(11 * 1024 * 1024).buffer;  // over the 10 MB upload limit

const hdr = (plan, user) => ({ 'x-load-test-secret': SECRET, 'x-load-test-user': user, 'x-load-test-plan': plan });

export const options = {
  scenarios: {
    cases: { executor: 'shared-iterations', vus: 1, iterations: 1, exec: 'cases' },
    load: { executor: 'constant-arrival-rate', exec: 'load', rate: RATE, timeUnit: '1s', duration: '20s',
            startTime: '15s', preAllocatedVUs: 50, maxVUs: 200 },
  },
  thresholds: {
    checks: ['rate==1'],
    'http_req_duration{scenario:load}': ['p(95)<1800'],
    'http_req_failed{scenario:load}': ['rate<0.01'],
  },
};

export function cases() {
  const prem = hdr('premium', 'loadtest_prem_resume');

  let r = http.post(URL, { resume: http.file(pdf, 'resume.pdf', 'application/pdf') }, { headers: prem });
  check(r, { 'valid pdf -> 200': (x) => x.status === 200, 'valid pdf -> success': (x) => x.json('success') === true });
  console.log(`valid pdf -> HTTP ${r.status}  ${String(r.body).slice(0, 100)}`);

  r = http.post(URL, { resume: http.file('plain text', 'resume.txt', 'text/plain') }, { headers: prem });
  check(r, { 'text file -> 400': (x) => x.status === 400 });

  r = http.post(URL, {}, { headers: prem });
  check(r, { 'no file -> 400': (x) => x.status === 400 });

  r = http.post(URL, { resume: http.file(pdf, 'resume.pdf', 'application/pdf') }, { headers: hdr('free', 'loadtest_free_resume') });
  check(r, { 'free user -> 403': (x) => x.status === 403 });

  r = http.post(URL, { resume: http.file(over5mb, 'big.pdf', 'application/pdf') }, { headers: prem });
  check(r, { '6 MB pdf -> 413': (x) => x.status === 413 });

  // Not asserted: just report what comes back
  r = http.post(URL, { resume: http.file('this is not a pdf', 'bad.pdf', 'application/pdf') }, { headers: prem });
  console.log(`corrupt pdf -> HTTP ${r.status}  ${String(r.body).slice(0, 100)}`);
  r = http.post(URL, { resume: http.file(over10mb, 'huge.pdf', 'application/pdf') }, { headers: prem });
  console.log(`11 MB file  -> HTTP ${r.status}  ${String(r.body).slice(0, 100)}`);
}

export function load() {
  const r = http.post(URL, { resume: http.file(pdf, 'resume.pdf', 'application/pdf') }, { headers: hdr('premium', `loadtest_prem_r${__VU % 20}`) });
  check(r, { 'load upload 200': (x) => x.status === 200 });
  if (r.status !== 200 && __ITER < 2) console.log(`load failure -> HTTP ${r.status}  ${String(r.body).slice(0, 100)}`);
}
