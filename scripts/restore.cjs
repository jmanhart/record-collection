const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Insert order (dependency order)
const INSERT_ORDER = [
  "records",
  "wishlist",
  "discography_targets",
  "nfc_tags",
  "listens",
];

// Delete order (reverse dependency)
const DELETE_ORDER = [
  "listens",
  "nfc_tags",
  "discography_targets",
  "wishlist",
  "records",
];

const BATCH_SIZE = 500;

function findLatestBackup() {
  const backupsDir = path.join(__dirname, "..", "backups");
  if (!fs.existsSync(backupsDir)) return null;

  const dirs = fs
    .readdirSync(backupsDir)
    .filter((d) => fs.statSync(path.join(backupsDir, d)).isDirectory())
    .sort()
    .reverse();

  return dirs.length > 0 ? path.join(backupsDir, dirs[0]) : null;
}

function loadBackupData(backupDir, tableFilter) {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(backupDir, "manifest.json"), "utf8")
  );

  const tables = new Map();
  const tablesToLoad = tableFilter ? [tableFilter] : INSERT_ORDER;

  for (const table of tablesToLoad) {
    const filePath = path.join(backupDir, "data", `${table}.json`);
    if (!fs.existsSync(filePath)) {
      console.warn(`  Warning: ${table}.json not found in backup`);
      continue;
    }
    const rows = JSON.parse(fs.readFileSync(filePath, "utf8"));
    tables.set(table, rows);
  }

  return { manifest, tables };
}

async function countTable(table) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) throw new Error(`Failed to count ${table}: ${error.message}`);
  return count || 0;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function restore() {
  const args = process.argv.slice(2);
  const executeFlag = args.includes("--execute");
  const tableIndex = args.indexOf("--table");
  const tableFilter = tableIndex !== -1 ? args[tableIndex + 1] : null;
  const dirIndex = args.indexOf("--dir");
  const backupDir =
    dirIndex !== -1 ? path.resolve(args[dirIndex + 1]) : findLatestBackup();

  if (!backupDir || !fs.existsSync(backupDir)) {
    console.error("No backup directory found. Use --dir to specify one.");
    process.exit(1);
  }

  if (tableFilter && !INSERT_ORDER.includes(tableFilter)) {
    console.error(
      `Unknown table: ${tableFilter}. Valid: ${INSERT_ORDER.join(", ")}`
    );
    process.exit(1);
  }

  console.log(`Backup source: ${backupDir}`);
  const { manifest, tables } = loadBackupData(backupDir, tableFilter);
  console.log(`Backup timestamp: ${manifest.timestamp}`);
  console.log("");

  // Print plan
  console.log("Restore plan:");
  const deleteList = tableFilter
    ? [tableFilter]
    : DELETE_ORDER.filter((t) => tables.has(t));
  const insertList = tableFilter
    ? [tableFilter]
    : INSERT_ORDER.filter((t) => tables.has(t));

  console.log("  DELETE (in order):");
  for (const t of deleteList) {
    console.log(`    - ${t}`);
  }
  console.log("  INSERT (in order):");
  for (const t of insertList) {
    const rows = tables.get(t);
    console.log(`    - ${t}: ${rows ? rows.length : 0} rows`);
  }
  console.log("");

  if (!executeFlag) {
    console.log("DRY RUN - no changes made.");
    console.log("Run with --execute to perform the restore.");
    return;
  }

  // Countdown
  console.log("EXECUTING RESTORE IN 5 SECONDS... (Ctrl+C to abort)");
  for (let i = 5; i > 0; i--) {
    process.stdout.write(`  ${i}...`);
    await sleep(1000);
  }
  console.log("\n");

  // Delete
  console.log("Deleting existing data...");
  for (const table of deleteList) {
    const { error } = await supabase.from(table).delete().gte("id", "");
    // For tables with non-id PKs, use a broader match
    if (error) {
      // Try alternative delete approach - select all then delete by known column
      const { error: err2 } = await supabase.from(table).delete().not("id", "is", null);
      if (err2) {
        // Last resort: delete with always-true condition based on table
        let deleteResult;
        if (table === "discography_targets") {
          deleteResult = await supabase.from(table).delete().gte("release_id", 0);
        } else if (table === "listens" || table === "nfc_tags") {
          deleteResult = await supabase.from(table).delete().not("id", "is", null);
        } else {
          deleteResult = await supabase.from(table).delete().gte("id", 0);
        }
        if (deleteResult.error) {
          throw new Error(`Failed to delete ${table}: ${deleteResult.error.message}`);
        }
      }
    }
    console.log(`  Deleted: ${table}`);
  }

  // Insert
  console.log("\nInserting backup data...");
  for (const table of insertList) {
    const rows = tables.get(table);
    if (!rows || rows.length === 0) {
      console.log(`  ${table}: 0 rows (skipped)`);
      continue;
    }

    let inserted = 0;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from(table).upsert(batch);
      if (error) {
        throw new Error(
          `Failed to insert into ${table} (batch at offset ${i}): ${error.message}`
        );
      }
      inserted += batch.length;
    }
    console.log(`  ${table}: ${inserted} rows inserted`);
  }

  // Verification
  console.log("\nVerification:");
  let allMatch = true;
  for (const table of insertList) {
    const expected = tables.get(table)?.length || 0;
    const actual = await countTable(table);
    const match = actual === expected ? "OK" : "MISMATCH";
    if (actual !== expected) allMatch = false;
    console.log(`  ${table}: ${actual} rows (expected ${expected}) ${match}`);
  }

  if (allMatch) {
    console.log("\nRestore completed successfully!");
  } else {
    console.log("\nRestore completed with mismatches - verify manually.");
    process.exit(1);
  }
}

restore().catch((err) => {
  console.error("Restore failed:", err.message);
  process.exit(1);
});
