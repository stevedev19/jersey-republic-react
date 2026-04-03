/** 8 segments; pointer fixed at top; CSS rotate(+) is clockwise on the wheel element */
export const ROULETTE_SEGMENT_COUNT = 8;

export function getWinningIndexFromRotation(cumulativeDeg: number, n = ROULETTE_SEGMENT_COUNT): number {
  const slice = 360 / n;
  const r = ((cumulativeDeg % 360) + 360) % 360;
  return Math.floor(r / slice) % n;
}
