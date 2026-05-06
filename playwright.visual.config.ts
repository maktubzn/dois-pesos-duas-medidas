import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e/visual',
  timeout: 45_000,
  expect: {
    timeout: 8_000,
  },
  outputDir: './docs/sprint-2/harness-6/evidencias/playwright-output',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on',
    video: 'on',
    screenshot: 'on',
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
