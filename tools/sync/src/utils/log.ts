import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs"); // ✅ Store logs in a separate folder
const LOG_FILE = path.join(LOG_DIR, "app.log"); // ✅ Main log file
const MAX_LOG_SIZE = 5 * 1024 * 1024; // ✅ 5MB log rotation limit

// ✅ Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Formats the current timestamp.
 */
function formatTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Handles log rotation (if file exceeds `MAX_LOG_SIZE`).
 */
function rotateLogFile() {
  if (fs.existsSync(LOG_FILE)) {
    const stats = fs.statSync(LOG_FILE);
    if (stats.size >= MAX_LOG_SIZE) {
      const archiveFile = path.join(LOG_DIR, `app-${Date.now()}.log`);
      fs.renameSync(LOG_FILE, archiveFile);
    }
  }
}

/**
 * Writes logs to a file.
 */
function writeToFile(logMessage: string) {
  rotateLogFile(); // ✅ Check if log rotation is needed
  fs.appendFile(LOG_FILE, logMessage + "\n", (err) => {
    if (err) console.error("❌ [ERROR]: Failed to write log to file:", err);
  });
}

/**
 * Logs an informational message.
 */
export function logInfo(message: string) {
  const logMessage = `ℹ️ [INFO] [${formatTimestamp()}]: ${message}`;
  console.log(logMessage);
  writeToFile(logMessage);
}

/**
 * Logs a warning message.
 */
export function logWarn(message: string) {
  const logMessage = `⚠️ [WARN] [${formatTimestamp()}]: ${message}`;
  console.warn(logMessage);
  writeToFile(logMessage);
}

/**
 * Logs an error message with optional details.
 */
export function logError(message: string, error?: any) {
  const errorDetails = error ? `\n   Details: ${error.message || error}` : "";
  const logMessage = `❌ [ERROR] [${formatTimestamp()}]: ${message}${errorDetails}`;
  console.error(logMessage);
  writeToFile(logMessage);
}
