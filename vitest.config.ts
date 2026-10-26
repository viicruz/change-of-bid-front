//* Node imports
import path from "node:path"
import { fileURLToPath } from "node:url"

//* Libraries imports
import { defineConfig } from "vitest/config"

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      "@": projectRoot,
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    env: {
      NEXT_PUBLIC_BACKEND_URL: "http://localhost:3001",
    },
  },
})
