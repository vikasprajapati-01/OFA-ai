import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const VUS = Number(__ENV.VUS) || 10;

export const options = {
  // Ramp up to VUS users, hold, then ramp down
  stages: [
    { duration: '20s', target: VUS },
    { duration: '40s', target: VUS },
    { duration: '10s', target: 0 },
  ],
  // The test "fails" if these are not met
  thresholds: {
    http_req_failed: ['rate<0.01'],     // less than 1% errors
    http_req_duration: ['p(95)<300'],   // 95% of requests under 300 ms
  },
};

// Each virtual user (VU) repeats this function in a loop
export default function () {
  const res = http.get(`${BASE_URL}/`);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'body is Server Live': (r) => r.body === 'Server Live',
  });

  sleep(1); // "think time": a real user pauses between actions
}