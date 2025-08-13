import React from "react";
import { Link } from "react-router-dom";
import * as Sentry from "@sentry/react";
import styles from "./Testing.module.css";

export function Testing() {
  const triggerError = () => {
    throw new Error("This is a test error for Sentry!");
  };

  const triggerAsyncError = async () => {
    throw new Error("This is an async test error for Sentry!");
  };

  const triggerSentryError = () => {
    Sentry.captureException(new Error("This is a Sentry captured error!"));
  };

  const triggerSentryMessage = () => {
    Sentry.captureMessage("This is a test message for Sentry!", "info");
  };

  const triggerPerformanceIssue = () => {
    const transaction = Sentry.startTransaction({
      name: "Test Transaction",
      op: "test",
    });

    // Simulate some work
    setTimeout(() => {
      transaction.finish();
    }, 100);
  };

  const triggerUnhandledRejection = () => {
    Promise.reject(new Error("This is an unhandled promise rejection!"));
  };

  // New testing functions
  const testCustomContext = () => {
    Sentry.setContext("test_context", {
      testData: "This is custom context data",
      timestamp: new Date().toISOString(),
      randomValue: Math.random(),
    });

    Sentry.captureMessage("Custom context set and message sent!", "info");
  };

  const testUserIdentification = () => {
    Sentry.setUser({
      id: "test-user-123",
      email: "test@example.com",
      username: "testuser",
      ip_address: "127.0.0.1",
    });

    Sentry.captureMessage("User identified and message sent!", "info");
  };

  const testBreadcrumbs = () => {
    Sentry.addBreadcrumb({
      category: "test",
      message: "Test breadcrumb added",
      level: "info",
      data: {
        action: "button_click",
        timestamp: Date.now(),
      },
    });

    Sentry.captureMessage("Breadcrumb added and message sent!", "info");
  };

  const testPerformanceMonitoring = () => {
    const transaction = Sentry.startTransaction({
      name: "Complex Test Transaction",
      op: "test.complex",
    });

    // Add child spans
    const span1 = transaction.startChild({
      op: "test.span1",
      description: "First test span",
    });

    setTimeout(() => {
      span1.finish();

      const span2 = transaction.startChild({
        op: "test.span2",
        description: "Second test span",
      });

      setTimeout(() => {
        span2.finish();
        transaction.finish();
      }, 200);
    }, 150);
  };

  const testErrorWithTags = () => {
    Sentry.setTag("test_type", "tagged_error");
    Sentry.setTag("environment", "testing");
    Sentry.setTag("component", "testing_page");

    Sentry.captureException(new Error("This is a tagged error for Sentry!"));
  };

  const testMemoryLeak = () => {
    const largeArray = new Array(1000000).fill("test data");
    Sentry.captureMessage("Memory leak test - large array created!", "warning");
  };

  const testNetworkError = () => {
    fetch("/non-existent-endpoint")
      .then((response) => response.json())
      .catch((error) => {
        Sentry.captureException(error);
      });
  };

  const testConsoleLogging = () => {
    console.log("Test console log");
    console.warn("Test console warning");
    console.error("Test console error");

    Sentry.captureMessage("Console logs generated!", "info");
  };

  const clearUserContext = () => {
    Sentry.setUser(null);
    Sentry.captureMessage("User context cleared!", "info");
  };

  const clearTags = () => {
    Sentry.setTag("test_type", null);
    Sentry.setTag("environment", null);
    Sentry.setTag("component", null);

    Sentry.captureMessage("Tags cleared!", "info");
  };

  return (
    <div className={styles.container}>
      <h1>Sentry Testing Page</h1>
      <p>
        Use these buttons to test different types of Sentry error reporting and
        monitoring:
      </p>

      <div className={styles.section}>
        <h3>Basic Error Testing</h3>
        <div className={styles.buttonGrid}>
          <button onClick={triggerError} className={styles.errorButton}>
            Trigger Synchronous Error
          </button>

          <button onClick={triggerAsyncError} className={styles.errorButton}>
            Trigger Async Error
          </button>

          <button onClick={triggerSentryError} className={styles.sentryButton}>
            Capture Sentry Exception
          </button>

          <button
            onClick={triggerSentryMessage}
            className={styles.sentryButton}
          >
            Capture Sentry Message
          </button>

          <button
            onClick={triggerUnhandledRejection}
            className={styles.errorButton}
          >
            Trigger Unhandled Rejection
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Performance & Monitoring</h3>
        <div className={styles.buttonGrid}>
          <button
            onClick={triggerPerformanceIssue}
            className={styles.performanceButton}
          >
            Test Basic Performance
          </button>

          <button
            onClick={testPerformanceMonitoring}
            className={styles.performanceButton}
          >
            Test Complex Performance
          </button>

          <button onClick={testMemoryLeak} className={styles.performanceButton}>
            Test Memory Usage
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Context & Metadata</h3>
        <div className={styles.buttonGrid}>
          <button onClick={testCustomContext} className={styles.contextButton}>
            Test Custom Context
          </button>

          <button
            onClick={testUserIdentification}
            className={styles.contextButton}
          >
            Test User Identification
          </button>

          <button onClick={testBreadcrumbs} className={styles.contextButton}>
            Test Breadcrumbs
          </button>

          <button onClick={testErrorWithTags} className={styles.contextButton}>
            Test Error with Tags
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Advanced Testing</h3>
        <div className={styles.buttonGrid}>
          <button onClick={testNetworkError} className={styles.advancedButton}>
            Test Network Error
          </button>

          <button
            onClick={testConsoleLogging}
            className={styles.advancedButton}
          >
            Test Console Logging
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Cleanup & Reset</h3>
        <div className={styles.buttonGrid}>
          <button onClick={clearUserContext} className={styles.cleanupButton}>
            Clear User Context
          </button>

          <button onClick={clearTags} className={styles.cleanupButton}>
            Clear Tags
          </button>
        </div>
      </div>

      <div className={styles.info}>
        <h3>What Each Test Does:</h3>
        <ul>
          <li>
            <strong>Basic Errors:</strong> Test different error types and Sentry
            capture
          </li>
          <li>
            <strong>Performance:</strong> Test transaction monitoring and spans
          </li>
          <li>
            <strong>Context:</strong> Test user data, tags, breadcrumbs, and
            custom context
          </li>
          <li>
            <strong>Advanced:</strong> Test network errors, console logging, and
            edge cases
          </li>
          <li>
            <strong>Cleanup:</strong> Reset Sentry context and tags
          </li>
        </ul>
      </div>

      <Link to="/" className={styles.backLink}>
        ← Back to Records
      </Link>
    </div>
  );
}
