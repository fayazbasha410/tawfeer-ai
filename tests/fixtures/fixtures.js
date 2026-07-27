const { test: base } = require('@playwright/test');
const { GovAssistApiClient } = require('../api/GovAssistApiClient');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const TEST_USER = {
  name:    process.env.TEST_USER_NAME     || 'Test User',
  email:   process.env.TEST_USER_EMAIL    || 'test@test.com',
  password: process.env.TEST_USER_PASSWORD || 'test123',
  emirate: process.env.TEST_USER_EMIRATE  || 'Dubai'
};

// Shared across the entire test process — one login per run
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