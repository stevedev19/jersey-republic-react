import { serverApiBase } from "./config";
import { Product } from "./types/product";

export interface NewDropsWindow {
  start: string;
  end: string;
  startYear: number;
  endYear: number;
  daysRemaining: number;
}

function normalizeWindow(raw: Record<string, unknown>): NewDropsWindow | null {
  const startYear = Number(raw.startYear);
  const endYear = Number(raw.endYear);
  const daysRemaining = Number(raw.daysRemaining);
  if (
    !Number.isFinite(startYear) ||
    !Number.isFinite(endYear) ||
    !Number.isFinite(daysRemaining)
  ) {
    return null;
  }
  const start = raw.start != null ? String(raw.start) : "";
  const end = raw.end != null ? String(raw.end) : "";
  return {
    start,
    end,
    startYear,
    endYear,
    daysRemaining: Math.max(0, Math.floor(daysRemaining)),
  };
}

/** Parse GET /api/products/new-drops JSON (wrapped or legacy array). */
export function parseNewDropsApiPayload(data: unknown): {
  products: Product[];
  window: NewDropsWindow | null;
} {
  if (Array.isArray(data)) {
    return { products: data as Product[], window: null };
  }
  if (!data || typeof data !== "object") {
    return { products: [], window: null };
  }
  const o = data as Record<string, unknown>;
  let products: Product[] = [];
  if (Array.isArray(o.products)) {
    products = o.products as Product[];
  } else if (Array.isArray(o.data)) {
    products = o.data as Product[];
  }

  let window: NewDropsWindow | null = null;
  if (o.window && typeof o.window === "object" && !Array.isArray(o.window)) {
    window = normalizeWindow(o.window as Record<string, unknown>);
  }

  return { products, window };
}

export function newDropsApiUrl(): string {
  return serverApiBase
    ? `${serverApiBase}/api/products/new-drops`
    : "/api/products/new-drops";
}

export async function fetchNewDropsPageData(options?: {
  signal?: AbortSignal;
}): Promise<{ products: Product[]; window: NewDropsWindow | null }> {
  try {
    const res = await fetch(newDropsApiUrl(), { signal: options?.signal });
    if (!res.ok) {
      return { products: [], window: null };
    }
    const data = await res.json();
    return parseNewDropsApiPayload(data);
  } catch {
    return { products: [], window: null };
  }
}
