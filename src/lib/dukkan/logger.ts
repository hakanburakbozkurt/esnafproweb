export function logDukkanAction(
  action: string,
  message: string,
  context?: Record<string, unknown>
) {
  if (process.env.NODE_ENV === "production") {
    console.error(`[dukkan:${action}] ${message}`, context ?? "");
  } else {
    console.error(`[dukkan:${action}] ${message}`, context ?? "");
  }
}
