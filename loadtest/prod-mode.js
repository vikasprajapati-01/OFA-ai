import http from 'k6/http';
import { check } from 'k6';

// Starts against a server running WITHOUT test mode (like production) and proves the lab hooks are inert.
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3100';
export const options = { vus: 1, iterations: 1, thresholds: { checks: ['rate==1'] } };

export default function () {
  const fake = { headers: { 'Content-Type': 'application/json', 'x-load-test-user': 'loadtest_prem_x', 'x-load-test-secret': 'ci-secret', 'x-load-test-plan': 'premium' } };

  check(http.get(`${BASE_URL}/`), { 'GET / answers Server Live': (r) => r.status === 200 && r.body === 'Server Live' });
  check(http.post(`${BASE_URL}/api/ai/generate-article`, '{"prompt":"x"}', fake), { 'fake login refused on article (401)': (r) => r.status === 401 });
  check(http.get(`${BASE_URL}/api/user/get-user-creations`, fake), { 'fake login refused on history (401)': (r) => r.status === 401 });
  check(http.post(`${BASE_URL}/api/ai/review-resume`, '{}', fake), { 'fake premium refused on resume (401)': (r) => r.status === 401 });
  check(http.get(`${BASE_URL}/metrics`), { '/metrics does not exist (404)': (r) => r.status === 404 });
  check(http.get(`${BASE_URL}/api/health/db`), { '/api/health/db is off (404)': (r) => r.status === 404 });
  check(http.post(`${BASE_URL}/api/queue/generate-article`, '{"prompt":"x"}', fake), { 'queue routes do not exist (404)': (r) => r.status === 404 });
}
