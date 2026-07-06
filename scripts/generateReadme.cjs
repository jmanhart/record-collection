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
    "pnpm install       # Install dependencies",
    "pnpm run dev       # Start dev server",
    "```",
    "",
    "## Scripts",
    "",
    "| Command | Description |",
    "|---------|-------------|",
    "| `pnpm run dev` | Start local dev server |",
    "| `pnpm run build` | Production build |",
    "| `pnpm run lint` | ESLint (strict, zero warnings) |",
    "| `pnpm run sync:discogs` | Sync records from Discogs to Supabase |",
    "| `pnpm run sync:discography` | Sync discography targets with Discogs metadata |",
    "| `pnpm run sync:readme` | Regenerate this README with album covers |",
    "| `pnpm run sync:all` | Run discogs + readme syncs |",
    "| `pnpm run backup` | Backup all tables locally to `backups/` |",
    "| `pnpm run backup:push` | Backup locally + push to GitHub backup repo |",
    "| `pnpm run restore` | Dry-run restore (prints plan, no changes) |",
    "| `pnpm run restore:execute` | Restore from most recent backup |",
    "| `pnpm run article:new` | Scaffold a new MDX article |",
    "",
    "## Collection",
    "",
    `Total Records: ${records.length}`,
    ""
  );

  // Album grid using HTML table for even column widths
  const COLUMNS = 3;
  sections.push('<table>', '<tbody>');

  for (let i = 0; i < records.length; i += COLUMNS) {
    const row = records.slice(i, i + COLUMNS);
    sections.push('  <tr>');
    for (let j = 0; j < COLUMNS; j++) {
      const record = row[j];
      if (record) {
        const imageUrl = `https://${
          supabaseUrl.split("//")[1]
        }/storage/v1/object/public/record-images/covers/${record.id}.jpeg`;
        const alt = record.title.replace(/"/g, '&quot;');
        const title = record.title.replace(/</g, '&lt;');
        const artist = record.artist.replace(/</g, '&lt;');
        sections.push(
          `    <td width="33%" align="center" valign="top">`,
          `      <img src="${imageUrl}" width="200" alt="${alt}"/><br/>`,
          `      <sub>${title} - ${artist}</sub>`,
          `    </td>`
        );
      } else {
        sections.push('    <td width="33%"></td>');
      }
    }
    sections.push('  </tr>');
  }

  sections.push('</tbody>', '</table>');

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
