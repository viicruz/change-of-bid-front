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
