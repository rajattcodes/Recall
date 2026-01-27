/**
 * Centralized error logging utility
 * 
 * In development, logs to console. In production, can be extended
 * to send errors to error tracking services like Sentry.
 */

export function logError(error: Error | unknown, context?: Record<string, unknown>) {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", errorObj.message, {
      error: errorObj,
      stack: errorObj.stack,
      context,
    });
  }
  
  // In production, send to error tracking service
  // Example: Sentry.captureException(errorObj, { extra: context });
}
