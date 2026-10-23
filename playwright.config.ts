//* Libraries imports
import { defineConfig, devices } from "@playwright/test"

const isCi = Boolean(process.env.CI)

export default defineConfig({
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  reporter: "html",
  use: {
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "e2e",
      testDir: "./tests/e2e",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:3000",
      },
    },
    {
      name: "components",
      testDir: "./tests/components",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:3100/playwright/gallery/index.html",
        serviceWorkers: "block",
        reuseContext: true,
      },
    },
  ],
  webServer: [
    {
      command: "npm run dev -- --port 3000",
      url: "http://localhost:3000",
      reuseExistingServer: !isCi,
    },
    {
      command:
        "npx vite --config playwright/vite.config.ts --port 3100 --strictPort",
      url: "http://localhost:3100/playwright/gallery/index.html",
      reuseExistingServer: !isCi,
    },
  ],
})
