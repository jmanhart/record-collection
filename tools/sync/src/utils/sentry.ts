import * as Sentry from "@sentry/node";
import { env } from "./env.js";

/**
 * Initializes Sentry for the sync tool. No-ops (safe to call unconditionally)
 * if SENTRY_DSN isn't set — the sync tool doesn't require error monitoring
 * to run, but every SDK call becomes a no-op without an active client so
 * nothing else needs to guard on this.
 */
export function initSentry(): void {
  if (!env.SENTRY_DSN) {
    console.log("ℹ️  SENTRY_DSN not set — Sentry error monitoring disabled for this run.");
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: process.env.GITHUB_ACTIONS ? "production" : "development",
    enableLogs: true,
    tracesSampleRate: 1.0,
  });
}

export { Sentry };
