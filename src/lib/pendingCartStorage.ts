import { CartItem } from "./types/search";

export const PENDING_CART_STORAGE_KEY = "jerseyRepublicPendingCartItem";

/** Pending add-to-cart payload (short TTL to avoid surprise adds on later login). */
export type PendingCartPayload = {
  item: CartItem;
  returnPath: string;
  setAt: number;
};

const MAX_AGE_MS = 30 * 60 * 1000;

export function savePendingCartItem(item: CartItem, returnPath: string): void {
  const payload: PendingCartPayload = {
    item,
    returnPath,
    setAt: Date.now(),
  };
  try {
    localStorage.setItem(PENDING_CART_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota */
  }
}

export function clearPendingCartItem(): void {
  try {
    localStorage.removeItem(PENDING_CART_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Read and remove pending item if still valid; otherwise clear storage. */
export function takePendingCartItemIfFresh(): PendingCartPayload | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(PENDING_CART_STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as PendingCartPayload;
    if (!data?.item?._id || !data.setAt) {
      clearPendingCartItem();
      return null;
    }
    if (Date.now() - data.setAt > MAX_AGE_MS) {
      clearPendingCartItem();
      return null;
    }
    clearPendingCartItem();
    return data;
  } catch {
    clearPendingCartItem();
    return null;
  }
}
