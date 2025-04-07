import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const sourceDir = join(__dirname, "../src/content/articles");
const targetDir = join(__dirname, "../public/articles");

// Create target directory if it doesn't exist
try {
  await fs.access(targetDir);
} catch {
  await fs.mkdir(targetDir, { recursive: true });
}

// Copy all .md files from source to target
const files = await fs.readdir(sourceDir);
for (const file of files) {
  if (file.endsWith(".md") && !file.startsWith("README")) {
    const sourcePath = join(sourceDir, file);
    const targetPath = join(targetDir, file);
    await fs.copyFile(sourcePath, targetPath);
    console.log(`Copied ${file} to public/articles/`);
  }
}
