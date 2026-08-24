import * as Sentry from "@sentry/react";

export const sentryConfig: Sentry.BrowserOptions = {
  dsn:
    import.meta.env.VITE_SENTRY_DSN ||
    "https://8083211186186ef765078486adc736af@o4508215900766208.ingest.us.sentry.io/4509834064166912",

  // Distinguishes Vercel's per-PR preview deploys from production. Falls
  // back to Vite's build mode for local dev, where VERCEL_ENV isn't set.
  environment:
    import.meta.env.VITE_VERCEL_ENV || import.meta.env.MODE || "development",

  // Tracing, Session Replay, and console-log capture all require their
  // integration explicitly registered as of SDK v9 — the sample-rate
  // options below do nothing on their own without these.
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],

  // Performance tracing (spans) - 100% sampling for all environments
  tracesSampleRate: 1.0,

  // Session replay - 100% sampling for all environments
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,

  // Structured logs (Sentry.logger.*), plus the console integration above
  enableLogs: true,

  // PII handling - enabled for comprehensive data
  sendDefaultPii: true,

  // Debug mode - enabled for development
  debug: import.meta.env.MODE === "development",

  // Set at build time from the git commit SHA (see vite.config.ts) so it
  // matches the release the Sentry Vite plugin uploads source maps under.
  release: import.meta.env.VITE_APP_VERSION || "dev",

  // Performance monitoring options
  maxBreadcrumbs: 100,
  attachStacktrace: true,

  autoSessionTracking: true,
};

export const initSentry = () => {
  Sentry.init(sentryConfig);
};

export default Sentry;
