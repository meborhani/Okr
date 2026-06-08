export function calculateProgress(
  currentValue: number,
  startValue: number,
  targetValue: number,
): number {
  if (targetValue === startValue) {
    throw new Error('مقدار هدف نمی‌تواند برابر با مقدار شروع باشد');
  }
  const progress = ((currentValue - startValue) / (targetValue - startValue)) * 100;
  return Math.min(100, Math.max(0, Math.round(progress * 100) / 100));
}

export function calculateObjectiveProgress(keyResultProgresses: number[]): number {
  if (keyResultProgresses.length === 0) return 0;
  const sum = keyResultProgresses.reduce((acc, p) => acc + p, 0);
  return Math.round((sum / keyResultProgresses.length) * 100) / 100;
}
