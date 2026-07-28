import { defineConfig, devices } from '@playwright/test';


export default defineConfig({
  testDir: './tests/specs',
  timeout: 120000,
  retries: 2,
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