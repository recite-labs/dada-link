import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { contentSecurityPolicy } from "./csp.ts"
import { API_PATH_PREFIXES } from "./src/api/paths.ts"

/** Where `pnpm dev` forwards API calls (apps/server-node by default). */
const apiTarget = process.env.DADALINK_API_URL ?? "http://127.0.0.1:3000"

export default defineConfig({
  plugins: [react(), tailwindcss(), contentSecurityPolicy()],
  server: {
    port: 5173,
    // Same-origin in development too: the API is proxied, so no CORS and no absolute URLs in the bundle.
    proxy: Object.fromEntries(API_PATH_PREFIXES.map((prefix) => [prefix, { target: apiTarget, changeOrigin: false }]))
  },
  build: {
    target: "es2022",
    sourcemap: true,
    rolldownOptions: {
      output: {
        // Stable, cache-friendly vendor chunks: the app code changes far more often than these.
        codeSplitting: {
          groups: [
            { name: "effect", test: /node_modules[\\/]effect[\\/]/ },
            { name: "react", test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: "tanstack", test: /node_modules[\\/]@tanstack[\\/]/ }
          ]
        }
      }
    }
  }
})
