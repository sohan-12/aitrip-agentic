import { existsSync } from 'node:fs'
import { defineConfig } from '@playwright/test'

const api = 'http://127.0.0.1:48123'
const baseURL = 'http://127.0.0.1:45173'
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  ?? (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined)

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL,
    browserName: 'chromium',
    launchOptions: { executablePath },
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: '../backend/.venv/bin/python tests/e2e/serve_api.py',
      url: api + '/api/health',
      gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 45173 --strictPort',
      env: { AITRIP_API_TARGET: api },
      url: baseURL,
    },
  ],
})
