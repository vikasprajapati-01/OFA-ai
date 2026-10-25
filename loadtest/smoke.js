import http from 'k6/http';
import { check, group } from 'k6';
import encoding from 'k6/encoding';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const SECRET = __ENV.SECRET;

// 1x1 PNG, enough for the fake upload endpoints
const TINY_PNG = encoding.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: { checks: ['rate==1'] }, // any failed check fails the whole run
};

const authHeaders = (user, plan) => ({
  'x-load-test-user': user,
  'x-load-test-secret': SECRET,
  'x-load-test-plan': plan,
});

const jsonHeaders = (user, plan) =>
  Object.assign({ 'Content-Type': 'application/json' }, authHeaders(user, plan));

const postJson = (path, body, user, plan) =>
  http.post(`${BASE_URL}${path}`, JSON.stringify(body), { headers: jsonHeaders(user, plan) });

export default function () {
  const runId = Date.now();
  const premium = `loadtest_premium_${runId}`;
  const free = `loadtest_free_${runId}`;

  group('login is required', () => {
    const none = http.get(`${BASE_URL}/api/user/get-user-creations`);
    check(none, { 'no login -> 401': (r) => r.status === 401 });

    const wrong = http.get(`${BASE_URL}/api/user/get-user-creations`, {
      headers: { 'x-load-test-user': premium, 'x-load-test-secret': 'wrong-secret', 'x-load-test-plan': 'premium' },
    });
    check(wrong, { 'wrong secret -> 401': (r) => r.status === 401 });
  });

  group('premium user: AI endpoints', () => {
    const article = postJson('/api/ai/generate-article', { prompt: 'Write about load testing' }, premium, 'premium');
    check(article, {
      'article 200': (r) => r.status === 200,
      'article success': (r) => r.json('success') === true,
      'article has text': (r) => String(r.json('data')).length > 100,
    });

    const title = postJson('/api/ai/generate-blog-title', { prompt: 'Titles about load testing' }, premium, 'premium');
    check(title, { 'title 200 + success': (r) => r.status === 200 && r.json('success') === true });

    const image = postJson('/api/ai/generate-image', { prompt: 'A red robot' }, premium, 'premium');
    check(image, {
      'image 200 + success': (r) => r.status === 200 && r.json('success') === true,
      'image returns url': (r) => String(r.json('data')).startsWith('https://'),
    });
  });

  group('premium user: upload endpoints', () => {
    const bg = http.post(
      `${BASE_URL}/api/ai/remove-image-bg`,
      { image: http.file(TINY_PNG, 'test.png', 'image/png') },
      { headers: authHeaders(premium, 'premium') }
    );
    check(bg, { 'remove-bg 200 + success': (r) => r.status === 200 && r.json('success') === true });

    const obj = http.post(
      `${BASE_URL}/api/ai/remove-image-object`,
      { image: http.file(TINY_PNG, 'test.png', 'image/png'), object: 'chair' },
      { headers: authHeaders(premium, 'premium') }
    );
    check(obj, { 'remove-object 200 + success': (r) => r.status === 200 && r.json('success') === true });
  });

  group('premium user: creations list', () => {
    const list = http.get(`${BASE_URL}/api/user/get-user-creations`, { headers: authHeaders(premium, 'premium') });
    check(list, {
      'list 200 + success': (r) => r.status === 200 && r.json('success') === true,
      'list has 5 creations': (r) => r.json('total') === 5,
    });
  });

  group('free user: rules', () => {
    const blocked = http.post(
      `${BASE_URL}/api/ai/remove-image-bg`,
      { image: http.file(TINY_PNG, 'test.png', 'image/png') },
      { headers: authHeaders(free, 'free') }
    );
    check(blocked, { 'free user on premium feature -> 403': (r) => r.status === 403 });

    const bad = postJson('/api/ai/generate-article', { prompt: '' }, free, 'free');
    check(bad, { 'empty prompt -> 400': (r) => r.status === 400 });

    let ok = 0;
    for (let i = 0; i < 10; i++) {
      const r = postJson('/api/ai/generate-article', { prompt: `Free request ${i}` }, free, 'free');
      if (r.status === 200 && r.json('success') === true) ok++;
    }
    check(ok, { 'free user gets exactly 10 generations': (n) => n === 10 });

    const eleventh = postJson('/api/ai/generate-article', { prompt: 'One too many' }, free, 'free');
    check(eleventh, { '11th request -> 403': (r) => r.status === 403 });
  });
}