import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { resolve } from "path";

// Custom plugin to watch article files
const articlesWatcher = (): Plugin => ({
  name: "articles-watcher",
  configureServer(server) {
    // Watch the articles directory
    server.watcher.add(resolve("src/content/articles/**/*.md"));

    // Reload on article changes
    server.watcher.on("change", (path) => {
      if (path.includes("articles") && path.endsWith(".md")) {
        server.ws.send({ type: "full-reload" });
      }
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: "your-org",
      project: "records",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
    articlesWatcher(),
  ],

  build: {
    sourcemap: true, // Required for Sentry source maps
  },
});
