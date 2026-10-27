//* Libraries imports
import { defineConfig, devices } from "@playwright/test"

const isCi = Boolean(process.env.CI)

function isProjectSelected(name: string) {
  const selected = process.argv.flatMap((arg, index, argv) => {
    if (arg === "--project") {
      const value = argv[index + 1]

      return value ? [value] : []
    }

    if (arg.startsWith("--project=")) {
      return [arg.slice("--project=".length)]
    }

    return []
  })

  return selected.length === 0 || selected.includes(name)
}

export default defineConfig({
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  reporter: isCi ? [["github"], ["html"]] : "html",
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
    ...(isProjectSelected("e2e")
      ? [
          {
            command: "npm run dev -- --port 3000",
            url: "http://localhost:3000",
            reuseExistingServer: !isCi,
          },
        ]
      : []),
    ...(isProjectSelected("components")
      ? [
          {
            command:
              "npx vite --config playwright/vite.config.ts --port 3100 --strictPort",
            url: "http://localhost:3100/playwright/gallery/index.html",
            reuseExistingServer: !isCi,
          },
        ]
      : []),
  ],
})
