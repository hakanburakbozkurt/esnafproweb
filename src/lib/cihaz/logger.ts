export function logCihazAction(
  action: string,
  message: string,
  context?: Record<string, unknown>
) {
  console.error(`[cihaz:${action}] ${message}`, context ?? "");
}
