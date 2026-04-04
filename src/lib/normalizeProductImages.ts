function pathFromEntry(x: unknown): string {
  if (typeof x === "string") return x.trim();
  if (x && typeof x === "object") {
    const o = x as Record<string, unknown>;
    for (const k of ["url", "path", "src", "image"]) {
      const v = o[k];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return "";
}

/** Coerce API productImages (array, JSON string, or single path) into a clean URL path list */
export function normalizeProductImages(raw: unknown): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.map(pathFromEntry).filter(Boolean);
  }
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return [];
    if (t.startsWith("[") || t.startsWith('["')) {
      try {
        const parsed = JSON.parse(t) as unknown;
        if (Array.isArray(parsed)) {
          return parsed.map(pathFromEntry).filter(Boolean);
        }
      } catch {
        /* fall through */
      }
    }
    return [t];
  }
  return [];
}
