/** Coerce API productImages (array, JSON string, or single path) into a clean URL path list */
export function normalizeProductImages(raw: unknown): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((x) => (typeof x === "string" ? x.trim() : ""))
      .filter(Boolean);
  }
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return [];
    if (t.startsWith("[") || t.startsWith('["')) {
      try {
        const parsed = JSON.parse(t) as unknown;
        if (Array.isArray(parsed)) {
          return parsed
            .map((x) => (typeof x === "string" ? x.trim() : ""))
            .filter(Boolean);
        }
      } catch {
        /* fall through */
      }
    }
    return [t];
  }
  return [];
}
