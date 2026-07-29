const { test: base } = require('@playwright/test');
const { GovAssistApiClient } = require('../api/GovAssistApiClient');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Playwright sets TEST_PARALLEL_INDEX per worker process (0, 1, 2...).
// Give each worker its own isolated test account so concurrent workers
// never act as the same user at the same time — without this, parallel
// workers were sharing one account and corrupting each other's impact
// totals / trip counts / session state mid-test.
const WORKER_INDEX = process.env.TEST_PARALLEL_INDEX || '0';
const BASE_TEST_EMAIL = process.env.TEST_USER_EMAIL || 'test@test.com';
const WORKER_TEST_EMAIL = BASE_TEST_EMAIL.includes('@')
  ? BASE_TEST_EMAIL.replace('@', `+w${WORKER_INDEX}@`)
  : `${BASE_TEST_EMAIL}+w${WORKER_INDEX}`;

const TEST_USER = {
  name:    process.env.TEST_USER_NAME     || 'Test User',
  email:   WORKER_TEST_EMAIL,
  password: process.env.TEST_USER_PASSWORD || 'test123',
  emirate: process.env.TEST_USER_EMIRATE  || 'Dubai'
};

// Shared across this worker's tests only — one login per worker, not per run.
// Each worker is a separate process, so this is already isolated per worker;
// what changed above is that each worker now also has its own ACCOUNT.
let _sharedToken = null;
let _sharedUser  = null;

async function getOrCreateTestUser(request) {
  if (_sharedToken && _sharedUser) {
    return { token: _sharedToken, user: _sharedUser };
  }

  // Try login first — reuse existing user
  const loginRes = await request.post(`${BASE_URL}/api/auth/login`, {
    data: { email: TEST_USER.email, password: TEST_USER.password }
  });
  const loginData = await loginRes.json();

  if (loginData.success) {
    _sharedToken = loginData.token;
    _sharedUser  = loginData.user;
    return { token: _sharedToken, user: _sharedUser };
  }

  // User doesn't exist yet — register once
  const regRes = await request.post(`${BASE_URL}/api/auth/register`, {
    data: TEST_USER
  });
  const regData = await regRes.json();

  if (!regData.success) {
    throw new Error(`Could not login or register test user: ${JSON.stringify(regData)}`);
  }

  _sharedToken = regData.token;
  _sharedUser  = regData.user;
  return { token: _sharedToken, user: _sharedUser };
}

const test = base.extend({
  api: async ({ request }, use) => {
    const client = new GovAssistApiClient(request);
    await use(client);
  },

  // Authenticated page — reuses shared test user, never creates duplicates
  authenticatedPage: async ({ page }, use) => {
    const { token, user } = await getOrCreateTestUser(page.request);

    await page.evaluate(
      ([t, u]) => {
        localStorage.setItem('tawfeer_token', t);
        localStorage.setItem('tawfeer_user', JSON.stringify(u));
      },
      [token, user]
    );

    await use(page);
  },

  // Chat page — authenticated and navigated
  chatPage: async ({ page }, use) => {
    const { token, user } = await getOrCreateTestUser(page.request);
  
  
    await page.goto(`${BASE_URL}/pages/chat.html`);
    await page.evaluate(
      ([t, u]) => {
        localStorage.setItem('tawfeer_token', t);
        localStorage.setItem('tawfeer_user', JSON.stringify(u));
      },
      [token, user]
    );
    await page.goto(`${BASE_URL}/pages/chat.html`);
    await page.waitForSelector('.message.assistant', { timeout: 15000 });
    await use(page);
  },
  
});

const { expect } = base;

module.exports = { test, expect, TEST_USER };