import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'QA/test-results/html', open: 'never' }],
    ['json', { outputFile: 'QA/test-results/results.json' }],
    ['line'],
  ],
  use: {
    baseURL: 'http://169.58.183.137:8080',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on-first-retry',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  outputDir: 'QA/test-artifacts',
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 12'],
      },
    },
  ],
  globalSetup: './tests/global-setup.ts',
});
