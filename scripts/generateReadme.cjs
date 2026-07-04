const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateReadme() {
  console.log("Fetching records...");
  // Get all records
  const { data: records, error } = await supabase
    .from("records")
    .select("*")
    .order("title");

  if (error) {
    console.error("Error fetching records:", error);
    throw error;
  }

  console.log(`Found ${records.length} records`);

  // Create the base README content
  const sections = [];

  // Header section
  sections.push(
    "# Record Collection",
    "",
    "A simple React app to manage your vinyl record collection.",
    "",
    "## Quick Start",
    "",
    "```bash",
    "npm install        # Install dependencies",
    "npm run dev        # Start dev server",
    "```",
    "",
    "## Scripts",
    "",
    "| Command | Description |",
    "|---------|-------------|",
    "| `npm run dev` | Start local dev server |",
    "| `npm run build` | Production build |",
    "| `npm run lint` | ESLint (strict, zero warnings) |",
    "| `npm run sync:discogs` | Sync records from Discogs to Supabase |",
    "| `npm run sync:discography` | Sync discography targets with Discogs metadata |",
    "| `npm run sync:readme` | Regenerate this README with album covers |",
    "| `npm run sync:all` | Run discogs + readme syncs |",
    "| `npm run backup` | Backup all tables locally to `backups/` |",
    "| `npm run backup:push` | Backup locally + push to GitHub backup repo |",
    "| `npm run restore` | Dry-run restore (prints plan, no changes) |",
    "| `npm run restore:execute` | Restore from most recent backup |",
    "| `npm run article:new` | Scaffold a new MDX article |",
    "",
    "## Collection",
    "",
    `Total Records: ${records.length}`,
    ""
  );

  // Table header
  sections.push("| Album 1 | Album 2 | Album 3 |", "|:---:|:---:|:---:|");

  // Generate rows
  const COLUMNS = 3;
  for (let i = 0; i < records.length; i += COLUMNS) {
    const row = records.slice(i, i + COLUMNS);
    const cells = row.map((record) => {
      const imageUrl = `https://${
        supabaseUrl.split("//")[1]
      }/storage/v1/object/public/record-images/covers/${record.id}.jpeg`;
      return `<img src="${imageUrl}" width="130" alt="${record.title.replace(
        /"/g,
        '\\"'
      )}"/><br>${record.title.replace(/\|/g, "\\|")} - ${record.artist.replace(
        /\|/g,
        "\\|"
      )}`;
    });

    // Pad with empty cells if needed
    while (cells.length < COLUMNS) {
      cells.push("&nbsp;");
    }

    sections.push(`|${cells.join("|")}|`);
  }

  // Join all sections with newlines and add a final newline
  const fullContent = sections.join("\n") + "\n";

  console.log("Writing to README.md...");
  console.log(`Content length: ${fullContent.length} bytes`);
  console.log(`Number of lines: ${fullContent.split("\n").length}`);

  try {
    // Use synchronous write
    fs.writeFileSync(path.join(__dirname, "..", "README.md"), fullContent, {
      encoding: "utf8",
      flag: "w",
    });
    console.log("README.md has been updated successfully!");
  } catch (err) {
    console.error("Error with README:", err);
    throw err;
  }
}

generateReadme().catch(console.error);
