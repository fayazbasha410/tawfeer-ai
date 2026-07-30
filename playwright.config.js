import { defineConfig, devices } from '@playwright/test';


export default defineConfig({
  testDir: './tests/specs',
  timeout: 120000,
  // callGroq() already retries internally on rate limits — stacking Playwright's
  // own retries on top of that was compounding wall-clock time (up to 3x test
  // attempts × up to 18s internal backoff each = ~54s worst case per flaky test).
  // Cut to 1 retry in CI; keep 2 locally for convenience during dev.
  retries: process.env.CI ? 1 : 2,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 3 : 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
});