/**
 * Football uniform season labels (e.g. "2025-26").
 * getCurrentSeason() is the single source of truth for the active season string.
 */

function uniformSeasonLabelForShift(shift: number, referenceDate: Date): string {
  const year = referenceDate.getFullYear() - shift;
  const month = referenceDate.getMonth();
  const startYear = month >= 7 ? year : year - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
}

/** Current season from the calendar (season starts in August = month index 7). */
export function getCurrentSeason(referenceDate: Date = new Date()): string {
  return uniformSeasonLabelForShift(0, referenceDate);
}

/**
 * Last `length` seasons including the current one (auto-shifts each year).
 * Matches: year = refYear - i, then startYear from month threshold.
 */
export function uniformSeasonSelectOptions(length = 5, referenceDate: Date = new Date()): string[] {
  return Array.from({ length }, (_, i) => uniformSeasonLabelForShift(i, referenceDate));
}

/** True when the product is tagged for the current uniform season. */
export function isCurrentSeason(
  uniformSeason: string | null | undefined,
  referenceDate: Date = new Date()
): boolean {
  if (uniformSeason == null) return false;
  const s = String(uniformSeason).trim();
  if (!s) return false;
  return s === getCurrentSeason(referenceDate);
}
