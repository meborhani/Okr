export const quarterNames: Record<number, string> = {
  1: 'بهار', 2: 'تابستان', 3: 'پاییز', 4: 'زمستان',
};

// Approximate Shamsi quarter → Gregorian date ranges
// Shamsi year Y maps to Gregorian Y+621 (for months 1-9) or Y+622 (month 10-12 overlaps)
export function getQuarterDates(shamsiYear: number, quarter: number) {
  const g = shamsiYear + 621; // base Gregorian year
  const ranges: Record<number, { start: string; end: string }> = {
    1: { start: `${g}-03-21`, end: `${g}-06-21` },
    2: { start: `${g}-06-22`, end: `${g}-09-22` },
    3: { start: `${g}-09-23`, end: `${g}-12-21` },
    4: { start: `${g}-12-22`, end: `${g + 1}-03-20` },
  };
  return ranges[quarter];
}

export function getQuarterTitle(shamsiYear: number, quarter: number) {
  return `${quarterNames[quarter]} ${shamsiYear}`;
}

export const currentShamsiYear = (): number => {
  // Approximate: Gregorian year - 621 if before March 21, else - 621
  const now = new Date();
  const g = now.getFullYear();
  const monthDay = now.getMonth() * 100 + now.getDate(); // e.g. 220 for Feb 20
  return monthDay >= 320 ? g - 621 : g - 622; // after Mar 20 → subtract 621
};

export const currentQuarter = (): number => {
  const now = new Date();
  const m = now.getMonth() + 1; // 1-12 Gregorian
  if (m >= 3 && m <= 6) return 1;
  if (m >= 6 && m <= 9) return 2;
  if (m >= 9 && m <= 12) return 3;
  return 4;
};
