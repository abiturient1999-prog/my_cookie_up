/**
 * Детерминированный выбор "ежедневной" фортуны по (fid, date UTC).
 * Один и тот же (fid, date) всегда даёт один и тот же индекс.
 * Дата в формате YYYY-MM-DD (UTC).
 */
export function getTodayFortuneIndex(fid: number, dateUtc: string): number {
  const seed = `fid:${fid}:date:${dateUtc}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i);
    hash = (hash << 5) - hash + c;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Индекс в массиве фортуны (0 .. fortunesLength-1).
 * Использует getTodayFortuneIndex и модуль по длине массива.
 */
export function getTodayFortuneIndexInArray(
  fid: number,
  dateUtc: string,
  fortunesLength: number
): number {
  if (fortunesLength <= 0) return 0;
  const h = getTodayFortuneIndex(fid, dateUtc);
  return h % fortunesLength;
}

/** Текущая дата в UTC YYYY-MM-DD */
export function getTodayUtc(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
