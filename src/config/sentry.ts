import * as Sentry from "@sentry/react";

export const sentryConfig = {
  dsn:
    import.meta.env.VITE_SENTRY_DSN ||
    "https://8083211186186ef765078486adc736af@o4508215900766208.ingest.us.sentry.io/4509834064166912",

  // Environment configuration
  environment: import.meta.env.MODE || "development",

  // Performance monitoring - 100% sampling for all environments
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,

  // Session replay - 100% sampling for all environments
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,

  // PII handling - enabled for comprehensive data
  sendDefaultPii: true,

  // Debug mode - enabled for development
  debug: import.meta.env.MODE === "development",

  // Release tracking
  release: import.meta.env.VITE_APP_VERSION || "1.0.0",

  // Performance monitoring options
  maxBreadcrumbs: 100,
  attachStacktrace: true,

  // Enable all features
  enableTracing: true,
  autoSessionTracking: true,
};

export const initSentry = () => {
  Sentry.init(sentryConfig);
};

export default Sentry;
