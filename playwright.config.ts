import { defineConfig, devices } from '@playwright/test'

const URL = 'http://localhost:4173/mobywatel-dla-kazdego/'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 120_000,
  reporter: 'list',
  use: { baseURL: URL, ...devices['Desktop Chrome'] },
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: URL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
