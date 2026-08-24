import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { resolve, join, dirname } from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Release identifier shared between the build-time source map upload and
// the runtime SDK (src/config/sentry.ts), so uploaded source maps actually
// match what the browser reports at runtime. Vercel provides the commit
// SHA at build time; fall back to reading it from git for local builds.
function resolveRelease(): string {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA;
  try {
    return execSync("git rev-parse HEAD").toString().trim();
  } catch {
    return "dev";
  }
}

const release = resolveRelease();

// Plugin to generate article manifest for production builds
const generateArticleManifest = (): Plugin => {
  const generateManifest = async () => {
    const articlesDir = resolve(__dirname, "src/content/articles");
    const manifestPath = resolve(__dirname, "src/content/articles/index.ts");
    
    try {
      const files = await fs.readdir(articlesDir);
      const articleFiles = files.filter(
        (file) => (file.endsWith(".mdx") || file.endsWith(".md")) && !file.startsWith("README")
      );
      
      const imports = articleFiles.map((file) => {
        const recordId = file.replace(/\.(mdx|md)$/, "");
        return `  "${recordId}": () => import("./${file}"),`;
      });
      
      const manifestContent = `// This file is auto-generated - do not edit manually
// It maps record IDs to their MDX article imports

export const articleImports = {
${imports.join("\n")}
} as const;

export type ArticleId = keyof typeof articleImports;
`;
      
      await fs.writeFile(manifestPath, manifestContent, "utf-8");
      console.log("✅ Generated article manifest");
    } catch (error) {
      console.error("Error generating article manifest:", error);
    }
  };

  return {
    name: "generate-article-manifest",
    buildStart: generateManifest,
    configureServer: (server) => {
      // Generate manifest on server start
      generateManifest();
      
      // Watch for article file changes and regenerate manifest
      server.watcher.on("add", async (path) => {
        if (path.includes("articles") && (path.endsWith(".md") || path.endsWith(".mdx")) && !path.includes("README")) {
          await generateManifest();
        }
      });
      server.watcher.on("unlink", async (path) => {
        if (path.includes("articles") && (path.endsWith(".md") || path.endsWith(".mdx")) && !path.includes("README")) {
          await generateManifest();
        }
      });
    },
  };
};

// Custom plugin to watch article files and copy them on change
const articlesWatcher = (): Plugin => ({
  name: "articles-watcher",
  configureServer(server) {
    const sourceDir = resolve(__dirname, "src/content/articles");
    const targetDir = resolve(__dirname, "public/articles");

    // Ensure target directory exists
    (async () => {
      try {
        await fs.access(targetDir);
      } catch {
        await fs.mkdir(targetDir, { recursive: true });
        console.log("📁 Created public/articles directory");
      }
    })();

    // Watch the articles directory (both .md and .mdx files)
    server.watcher.add(resolve("src/content/articles/**/*.md"));
    server.watcher.add(resolve("src/content/articles/**/*.mdx"));

    // Handle article file changes
    server.watcher.on("change", async (path) => {
      if (path.includes("articles") && (path.endsWith(".md") || path.endsWith(".mdx")) && !path.includes("README")) {
        try {
          // Ensure target directory exists
          try {
            await fs.access(targetDir);
          } catch {
            await fs.mkdir(targetDir, { recursive: true });
          }

          // Extract filename from path
          const fileName = path.split("/").pop();
          if (!fileName) return;

          // Copy file to public directory
          const targetPath = join(targetDir, fileName);
          await fs.copyFile(path, targetPath);
          console.log(`✅ Copied ${fileName} to public/articles/`);

          // Extract record ID from filename (e.g., "387851.md" or "387851.mdx" -> 387851)
          const recordId = fileName.replace(/\.(md|mdx)$/, "");
          
          // Send HMR update to invalidate React Query cache
          server.ws.send({
            type: "custom",
            event: "article-updated",
            data: { recordId },
          });
        } catch (error) {
          console.error("Error copying article file:", error);
        }
      }
    });

    // Also watch for new files
    server.watcher.on("add", async (path) => {
      if (path.includes("articles") && (path.endsWith(".md") || path.endsWith(".mdx")) && !path.includes("README")) {
        try {
          // Ensure target directory exists
          try {
            await fs.access(targetDir);
          } catch {
            await fs.mkdir(targetDir, { recursive: true });
          }

          const fileName = path.split("/").pop();
          if (!fileName) return;

          const targetPath = join(targetDir, fileName);
          await fs.copyFile(path, targetPath);
          console.log(`✅ Copied ${fileName} to public/articles/`);

          const recordId = fileName.replace(/\.(md|mdx)$/, "");
          server.ws.send({
            type: "custom",
            event: "article-updated",
            data: { recordId },
          });
        } catch (error) {
          console.error("Error copying new article file:", error);
        }
      }
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    generateArticleManifest(),
    react(),
    mdx({
      // Treat .md and .mdx files as MDX
      include: ["**/*.mdx", "**/*.md"],
    }),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT || "records",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      release: {
        name: release,
        setCommits: { auto: true },
      },
      sourcemaps: {
        // Upload for symbolication, then remove from the deployed output so
        // unminified source isn't publicly servable.
        filesToDeleteAfterUpload: ["**/*.js.map"],
      },
    }),
    articlesWatcher(),
  ],

  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(release),
    "import.meta.env.VITE_VERCEL_ENV": JSON.stringify(process.env.VERCEL_ENV || ""),
  },

  build: {
    sourcemap: true, // Required for Sentry source maps
    rollupOptions: {
      output: {
        manualChunks: undefined, // Let Vite handle chunking automatically
      },
    },
    // Ensure MDX files are included in the build
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
});
