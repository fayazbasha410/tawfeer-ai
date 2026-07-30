// ─────────────────────────────────────────
// Tawfeer — k6 Load Test
// Deliberately targets ONLY non-LLM endpoints. /api/chat is excluded on
// purpose — its latency is dominated by Groq's response time, not by
// this server, and hammering it in a load test would just burn API
// quota without measuring anything meaningful about our own code.
//
// Run with:
//   k6 run k6/load-test.js
//   k6 run --env BASE_URL=https://tawfeer-ai.onrender.com k6/load-test.js
// ─────────────────────────────────────────

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Custom metrics so the summary breaks down failure/latency per endpoint,
// not just one blended number across everything.
const errorRate      = new Rate('errors');
const healthTrend     = new Trend('health_duration');
const policyTrend     = new Trend('policy_search_duration');
const finesTrend      = new Trend('fines_check_duration');
const appointmentTrend = new Trend('appointment_duration');
const impactTrend     = new Trend('impact_duration');

export const options = {
  stages: [
    { duration: '20s', target: 10 },  // ramp up to 10 virtual users
    { duration: '40s', target: 25 },  // ramp up to 25 virtual users
    { duration: '30s', target: 25 },  // hold steady at 25
    { duration: '15s', target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_failed:   ['rate<0.02'],   // fewer than 2% of requests should fail
    http_req_duration: ['p(95)<800'],   // 95% of requests under 800ms
    errors:            ['rate<0.02'],
  },
};

const FINE_PLATES = ['AD-1234', 'DXB-9999', 'SHJ-4521'];
const POLICY_QUERIES = [
  'driving license renewal',
  'Salik toll charge',
  'vehicle registration',
  'NOL card recharge',
  'traffic fines'
];
const APPOINTMENT_SERVICES = ['driving-license', 'vehicle-registration', 'emirates-id'];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function () {

  group('Health check', function () {
    const res = http.get(`${BASE_URL}/api/health`);
    healthTrend.add(res.timings.duration);
    const ok = check(res, {
      'health status is 200': (r) => r.status === 200,
      'health reports ok':    (r) => { try { return r.json('status') === 'ok'; } catch (e) { return false; } },
    });
    errorRate.add(!ok);
  });

  sleep(0.5);

  group('Policy search', function () {
    const q = pick(POLICY_QUERIES);
    const res = http.get(`${BASE_URL}/api/policies/search?q=${encodeURIComponent(q)}`);
    policyTrend.add(res.timings.duration);
    const ok = check(res, {
      'policy search status is 200': (r) => r.status === 200,
      'policy search returns results array': (r) => {
        try { return Array.isArray(r.json('results')); } catch (e) { return false; }
      },
    });
    errorRate.add(!ok);
  });

  sleep(0.5);

  group('Fine status check', function () {
    const plate = pick(FINE_PLATES);
    const res = http.get(`${BASE_URL}/api/tools/fines/${encodeURIComponent(plate)}`);
    finesTrend.add(res.timings.duration);
    const ok = check(res, {
      'fines check status is 200': (r) => r.status === 200,
    });
    errorRate.add(!ok);
  });

  sleep(0.5);

  group('Appointment booking', function () {
    const payload = JSON.stringify({
      service: pick(APPOINTMENT_SERVICES),
      date:    '2026-08-15',
    });
    const res = http.post(`${BASE_URL}/api/tools/appointment`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    appointmentTrend.add(res.timings.duration);
    const ok = check(res, {
      'appointment status is 200': (r) => r.status === 200,
    });
    errorRate.add(!ok);
  });

  sleep(0.5);

  group('Impact stats', function () {
    const res = http.get(`${BASE_URL}/api/impact`);
    impactTrend.add(res.timings.duration);
    const ok = check(res, {
      'impact status is 200': (r) => r.status === 200,
      'impact has totalUsers': (r) => {
        try { return typeof r.json('totalUsers') !== 'undefined'; } catch (e) { return false; }
      },
    });
    errorRate.add(!ok);
  });

  sleep(1);
}