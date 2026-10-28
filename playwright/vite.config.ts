//* Node imports
import path from "node:path"
import { fileURLToPath } from "node:url"

//* Libraries imports
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const configDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(configDir, "..")

export default defineConfig({
  root: projectRoot,
  plugins: [react()],
  define: {
    "process.env.NEXT_PUBLIC_BACKEND_URL": JSON.stringify(
      "http://localhost:3001"
    ),
  },
  resolve: {
    alias: {
      "@": projectRoot,
    },
  },
  server: {
    port: 3100,
    strictPort: true,
  },
})
