import { existsSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const articlesDir = resolve(__dirname, "../src/content/articles");

const id = process.argv[2];
if (!id) {
  console.error("Usage: npm run article:new <record-id>");
  process.exit(1);
}

const filePath = resolve(articlesDir, `${id}.mdx`);

if (!existsSync(filePath)) {
  const template = `I picked this record up...
`;
  writeFileSync(filePath, template, "utf-8");
  console.log(`Created ${filePath}`);
} else {
  console.log(`Article already exists: ${filePath}`);
}

// Try to open the file
try {
  execSync(`code "${filePath}"`, { stdio: "ignore" });
} catch {
  try {
    execSync(`open "${filePath}"`, { stdio: "ignore" });
  } catch {
    console.log(`Open the file manually: ${filePath}`);
  }
}
