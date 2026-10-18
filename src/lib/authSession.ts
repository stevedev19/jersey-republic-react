import Cookies from "universal-cookie";
import { Member } from "./types/member";
import { clearPendingCartItem } from "./pendingCartStorage";

export const ACCESS_TOKEN_KEY = "accessToken";
export const MEMBER_DATA_KEY = "memberData";
export const CART_DATA_KEY = "cartData";

/** Token from the JS-readable cookie (same host as API) or localStorage (cross-site API). */
export function getAccessToken(): string | undefined {
  try {
    const fromCookie = new Cookies().get(ACCESS_TOKEN_KEY);
    if (fromCookie) return String(fromCookie);
    return localStorage.getItem(ACCESS_TOKEN_KEY) || undefined;
  } catch {
    return undefined;
  }
}

/** Stored member, only if a token is also present (otherwise the session is stale). */
export function readStoredMember(): Member | null {
  try {
    const raw = localStorage.getItem(MEMBER_DATA_KEY);
    if (!raw) return null;
    if (!getAccessToken()) {
      localStorage.removeItem(MEMBER_DATA_KEY);
      return null;
    }
    return JSON.parse(raw) as Member;
  } catch {
    return null;
  }
}

/** Remove every trace of the member session from the browser. Never throws. */
export function clearAuthSession(): void {
  try {
    const cookies = new Cookies();
    cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
    cookies.remove(ACCESS_TOKEN_KEY);
  } catch {
    /* ignore */
  }
  for (const storage of [localStorage, sessionStorage]) {
    try {
      storage.removeItem(ACCESS_TOKEN_KEY);
      storage.removeItem(MEMBER_DATA_KEY);
      storage.removeItem(CART_DATA_KEY);
    } catch {
      /* ignore */
    }
  }
  clearPendingCartItem();
}
