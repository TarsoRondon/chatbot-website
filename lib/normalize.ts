export function normalizePathOrUrl(value: string, fallback = ""): string {
  const trimmed = String(value ?? "").trim()
  if (!trimmed) return fallback
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed
  }
  return `/${trimmed}`
}
