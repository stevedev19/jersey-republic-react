import { ProductCollection } from "../../../lib/enums/product.enum";

/** Stock at or below this value shows the low-stock (red) badge. */
export const LOW_STOCK_THRESHOLD = 10;

/** Left accent / row border / league dot — matches product spec */
export function leagueAccentColor(collection: ProductCollection | string): string {
  const c = String(collection);
  const map: Record<string, string> = {
    [ProductCollection.PREMIER_LEAGUE]: "#7c3aed",
    [ProductCollection.SERIE_A]: "#2563eb",
    [ProductCollection.LIGUE_1]: "#dc2626",
    [ProductCollection.BUNDESLIGA]: "#ca8a04",
    [ProductCollection.NATIONAL_TEAMS]: "#16a34a",
  };
  return map[c] || "#94a3b8";
}

export function kitTypeLabel(
  productVolume: number | string | undefined | null
): string {
  if (productVolume === undefined || productVolume === null || productVolume === "") {
    return "—";
  }
  const n = Number(productVolume);
  if (!Number.isNaN(n)) {
      const byNum: Record<number, string> = {
        0: "Home",
        1: "Away",
        2: "Third",
        3: "Training",
        4: "Special",
      };
      if (byNum[n] !== undefined) return byNum[n];
  }
  return String(productVolume).replace(/_/g, " ");
}
