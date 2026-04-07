/**
 * Catalog rules for “New Drops” driven by jersey manufacture year (madeYear).
 */

export const NEW_DROPS_MIN_MADE_YEAR = 2025;

/** End of the catalog new-drops window: June 30 (late-year rolls to next June). */
export function getNewDropsCatalogWindowEnd(now = new Date()): Date {
  const y = now.getFullYear();
  const m = now.getMonth();
  const endYear = m < 6 ? y : y + 1;
  return new Date(endYear, 5, 30, 23, 59, 59, 999);
}

export function newDropsWindowDaysRemaining(now = new Date()): number {
  const end = getNewDropsCatalogWindowEnd(now);
  return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 86400000));
}

export function formatNewDropsExpiryMonthYear(now = new Date()): string {
  const end = getNewDropsCatalogWindowEnd(now);
  return `${end.toLocaleDateString("en-US", { month: "long" })} ${end.getFullYear()}`;
}

export function formatNewDropsAdminMadeYearHelper(now = new Date()): string {
  return `Jerseys from ${NEW_DROPS_MIN_MADE_YEAR}+ will appear in the New Drops section until ${formatNewDropsExpiryMonthYear(now)}`;
}
