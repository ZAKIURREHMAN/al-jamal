type Level = "info" | "warn" | "error";

function write(level: Level, message: string, meta?: unknown) {
  const entry = {
    time: new Date().toISOString(),
    level,
    message,
    ...(meta instanceof Error
      ? { error: meta.message, stack: process.env.NODE_ENV === "production" ? undefined : meta.stack }
      : meta !== undefined
        ? { meta }
        : {}),
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (m: string, meta?: unknown) => write("info", m, meta),
  warn: (m: string, meta?: unknown) => write("warn", m, meta),
  error: (m: string, meta?: unknown) => write("error", m, meta),
};
