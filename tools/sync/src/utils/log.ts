import fs from "fs";
import path from "path";
import { Sentry } from "./sentry.js";

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
  Sentry.logger.info(message);
}

/**
 * Logs a warning message.
 */
export function logWarn(message: string) {
  const logMessage = `⚠️ [WARN] [${formatTimestamp()}]: ${message}`;
  console.warn(logMessage);
  writeToFile(logMessage);
  Sentry.logger.warn(message);
}

/**
 * Logs an error message with optional details. Forwards to Sentry both as
 * a structured log entry and, when given an Error, as a captured
 * exception so it shows up in Issues with a stack trace.
 */
export function logError(message: string, error?: unknown) {
  const details =
    error instanceof Error
      ? error.message
      : error !== undefined
      ? String(error)
      : undefined;
  const errorDetails = details ? `\n   Details: ${details}` : "";
  const logMessage = `❌ [ERROR] [${formatTimestamp()}]: ${message}${errorDetails}`;
  console.error(logMessage);
  writeToFile(logMessage);

  Sentry.logger.error(message, details ? { details } : undefined);
  if (error instanceof Error) {
    Sentry.captureException(error, { extra: { message } });
  } else if (error !== undefined) {
    Sentry.captureMessage(`${message}: ${details}`, "error");
  }
}
