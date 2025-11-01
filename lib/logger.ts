/* Minimal logger that avoids logging PII or secrets. */

type LogLevel = "info" | "warn" | "error"

const redact = (s: unknown): string => {
  const str = String(s ?? "")
  return str
    .replace(/\b(AIza[0-9A-Za-z\-_]{20,})\b/g, "[redacted]")
    .replace(/\b(hf_[A-Za-z0-9\-_]{10,})\b/g, "[redacted]")
    .replace(/\b(GOCSPX-[0-9A-Za-z\-_]{10,})\b/g, "[redacted]")
}

function log(level: LogLevel, msg: string, meta?: Record<string, unknown>) {
  const safeMeta: Record<string, unknown> | undefined = meta
    ? Object.fromEntries(
        Object.entries(meta)
          .filter(([k]) => !/content|message|prompt|token|password|secret/i.test(k))
          .map(([k, v]) => [k, typeof v === "string" ? redact(v) : v])
      )
    : undefined
  const line = `[${new Date().toISOString()}] ${level.toUpperCase()} ${msg}`
  if (level === "error") console.error(line, safeMeta ?? "")
  else if (level === "warn") console.warn(line, safeMeta ?? "")
  else console.log(line, safeMeta ?? "")
}

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => log("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log("error", msg, meta),
}
