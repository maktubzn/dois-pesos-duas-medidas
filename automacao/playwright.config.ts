import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  workers: 1,
  timeout: 300_000,
  expect: {
    timeout: 10_000,
  },
  outputDir: '../docs/sprint-2/harness-9.1/evidencias/automacao/playwright-output',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on',
    video: 'on',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'rtk npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
