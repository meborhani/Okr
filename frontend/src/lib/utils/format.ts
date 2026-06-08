export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fa-IR');
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
}

export function formatNumber(n?: number | null): string {
  if (n === null || n === undefined) return '۰';
  return n.toLocaleString('fa-IR');
}

export const quarterNames: Record<number, string> = {
  1: 'بهار',
  2: 'تابستان',
  3: 'پاییز',
  4: 'زمستان',
};

export function periodLabel(year: number, quarter: number): string {
  return `${quarterNames[quarter]} ${year}`;
}
