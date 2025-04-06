import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateReadme() {
  // Get all records
  const { data: records, error } = await supabase
    .from("records")
    .select("*")
    .order("title");

  if (error) throw error;

  // Create the base README content
  const baseContent = `# Record Collection

A simple React app to manage your vinyl record collection.

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

Visit \`http://localhost:5173\` in your browser.

## Environment Variables

Create a \`.env\` file with your Supabase credentials:

\`\`\`
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

## Collection

Total Records: ${records.length}

`;

  // Generate the collection table
  let collectionContent = "";
  const COLUMNS = 3;

  for (let i = 0; i < records.length; i += COLUMNS) {
    const row = records.slice(i, i + COLUMNS);
    const cells = row.map((record) => {
      const imageUrl = `https://${
        supabaseUrl.split("//")[1]
      }/storage/v1/object/public/record-images/covers/${record.id}.jpeg`;
      return `<img src="${imageUrl}" width="200" alt="${record.title}"/><br/>${record.title} - ${record.artist}`;
    });

    while (cells.length < COLUMNS) {
      cells.push(""); // Pad with empty cells if needed
    }

    collectionContent += "| " + cells.join(" | ") + " |\n";

    // Add separator after header or content row
    if (i === 0) {
      collectionContent +=
        "| " + Array(COLUMNS).fill(":---:").join(" | ") + " |\n";
    }
  }

  const fullContent = baseContent + collectionContent;

  // Write to README.md
  await fs.writeFile(
    path.join(dirname(__dirname), "README.md"),
    fullContent,
    "utf-8"
  );

  console.log("README.md has been updated with your collection!");
}

generateReadme().catch(console.error);
