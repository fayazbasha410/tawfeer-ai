import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate    = new Rate('error_rate');
const chatDuration = new Trend('chat_duration', true);

export const options = {
  stages: [
    { duration: '10s', target: 3 },
    { duration: '30s', target: 3 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    'http_req_duration{endpoint:health}': ['p(95)<500'],
    'http_req_duration{endpoint:search}': ['p(95)<500'],
    'http_req_duration{endpoint:chat}':   ['p(95)<90000'],
    'error_rate':                         ['rate<0.10'],
  }
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

const CHAT_MESSAGES = [
  'How do I renew my driving license in Dubai?',
  'How do I renew my driving license in Abu Dhabi?',
  'How do I check my traffic fines in Dubai?',
  'What is the Salik toll charge per gate?',
  'What types of NOL cards are available in Dubai?',
  'How do I renew my vehicle registration in Sharjah?',
  'Is health insurance mandatory in Sharjah?',
  'How do I register my Darb account in Abu Dhabi?',
  'What are the Dubai Metro operating hours?',
  'How do I get from Dubai to Abu Dhabi by public transport?',
  'How do I renew my driving license in Ras Al Khaimah?',
  'كيف أجدد رخصة القيادة في دبي؟',
  'كيف أتحقق من مخالفاتي المرورية في دبي؟',
  'كيف أفتح حساب سالك في دبي؟',
  'ما أوقات عمل مترو دبي؟',
  'How do I renew my vehicle registration in Ajman?',
  'What documents are needed to renew a Dubai driving license?',
  'How do I pay traffic fines in Dubai online?',
  'How do I transfer vehicle ownership in Dubai?',
  'How do I renew my driving license in Fujairah?'
];

export default function () {
  const vuIndex = __VU % CHAT_MESSAGES.length;
  const message  = CHAT_MESSAGES[vuIndex];

  const healthRes = http.get(`${BASE_URL}/api/health`, {
    tags: { endpoint: 'health' }
  });

  check(healthRes, {
    'health: status 200': r => r.status === 200,
    'health: returns ok': r => {
      try { return JSON.parse(r.body).status === 'ok'; }
      catch { return false; }
    }
  }) || errorRate.add(1);
  errorRate.add(0);

  sleep(0.5);

  const searchRes = http.get(
    `${BASE_URL}/api/policies/search?q=${encodeURIComponent(message)}`,
    { tags: { endpoint: 'search' } }
  );

  check(searchRes, {
    'search: status 200':  r => r.status === 200,
    'search: has results': r => {
      try { return JSON.parse(r.body).results?.length > 0; }
      catch { return false; }
    }
  }) || errorRate.add(1);
  errorRate.add(0);

  sleep(0.5);

  if (__ITER % 3 === 0) {
    const chatStart = Date.now();
    const chatRes = http.post(
      `${BASE_URL}/api/chat`,
      JSON.stringify({ message, userEmirate: 'Dubai', userArea: '' }),
      {
        headers: { 'Content-Type': 'application/json' },
        tags:    { endpoint: 'chat' },
        timeout: '90s'
      }
    );
    chatDuration.add(Date.now() - chatStart);

    check(chatRes, {
      'chat: status 200':    r => r.status === 200,
      'chat: has reply':     r => {
        try { return JSON.parse(r.body).reply?.length > 0; }
        catch { return false; }
      },
      'chat: has guardrail': r => {
        try { return typeof JSON.parse(r.body).guardrail === 'object'; }
        catch { return false; }
      }
    }) || errorRate.add(1);
    errorRate.add(0);

    sleep(1);
  }
}

export function handleSummary(data) {
  const metrics = data.metrics;

  const healthP95 = metrics['http_req_duration{endpoint:health}']?.values?.['p(95)'] || 0;
  const searchP95 = metrics['http_req_duration{endpoint:search}']?.values?.['p(95)'] || 0;
  const chatP95   = metrics['http_req_duration{endpoint:chat}']?.values?.['p(95)']   || 0;
  const errRate   = metrics['error_rate']?.values?.rate  || 0;
  const totalReqs = metrics['http_reqs']?.values?.count  || 0;
  const reqRate   = metrics['http_reqs']?.values?.rate   || 0;

  const summary = `
════════════════════════════════════════════
  Tawfeer توفير — Load Test Summary
  DAST 2026 · UAE Trip Reduction Platform
════════════════════════════════════════════
Total requests : ${totalReqs}
Throughput     : ${reqRate.toFixed(2)} req/s
Error rate     : ${(errRate * 100).toFixed(2)}%

Latency p95
  Health check : ${healthP95.toFixed(0)}ms
  Policy search: ${searchP95.toFixed(0)}ms
  Chat (LLM)   : ${chatP95.toFixed(0)}ms

Thresholds
  Health  < 500ms  : ${healthP95 < 500   ? '✅ PASS' : '❌ FAIL'}
  Search  < 500ms  : ${searchP95 < 500   ? '✅ PASS' : '❌ FAIL'}
  Chat    < 90000ms: ${chatP95   < 90000 ? '✅ PASS' : '❌ FAIL'}
  Errors  < 10%    : ${errRate   < 0.10  ? '✅ PASS' : '❌ FAIL'}
════════════════════════════════════════════
`;

  console.log(summary);
  return { stdout: summary };
}