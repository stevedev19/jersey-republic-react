import type { Product } from "./types/product";
import ProductService from "../app/services/ProductService";
import { isCurrentSeason } from "./season";

/** Product slice that can carry an optional API release date */
export type NewDropProductRef = Pick<Product, "createdAt" | "uniformSeason"> & {
  releaseDate?: Date | string | null;
};

// Returns the expiry date for a jersey's "new" status
export function getNewDropExpiry(registeredDate: Date): Date {
  const year = registeredDate.getFullYear();
  const nextYear = year + 1;
  return new Date(nextYear, 5, 30); // June 30 of next year (month is 0-indexed)
}

// Returns true if the jersey is still "new"
export function isNewDrop(registeredDate: Date): boolean {
  if (Number.isNaN(registeredDate.getTime())) return false;
  return new Date() < getNewDropExpiry(registeredDate);
}

// Returns days remaining as a new drop
export function newDropDaysLeft(registeredDate: Date): number {
  const expiry = getNewDropExpiry(registeredDate);
  return Math.max(0, Math.floor((expiry.getTime() - Date.now()) / 86400000));
}

export function getNewDropRegisteredDate(product: NewDropProductRef): Date {
  const raw =
    product.releaseDate != null && product.releaseDate !== ""
      ? product.releaseDate
      : product.createdAt;
  return new Date(raw);
}

function isActiveNewDropProduct(product: NewDropProductRef): boolean {
  if (!isCurrentSeason(product.uniformSeason)) return false;
  return isNewDrop(getNewDropRegisteredDate(product));
}

/**
 * Fetches a recent page of products and returns those still in the "new drop" window,
 * newest first.
 */
export async function getNewDrops(options?: { signal?: AbortSignal }): Promise<Product[]> {
  const service = new ProductService();
  const raw = await service.getProducts(
    { page: 1, limit: 120, order: "createdAt" },
    { signal: options?.signal }
  );
  if (!Array.isArray(raw)) return [];

  const filtered = raw.filter((p) => p && isActiveNewDropProduct(p));
  filtered.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return filtered;
}
