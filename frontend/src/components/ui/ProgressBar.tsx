interface ProgressBarProps {
  value: number;
  colorClass?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function ProgressBar({
  value,
  colorClass = 'bg-primary-500',
  showLabel = false,
  size = 'md',
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>پیشرفت</span>
          <span className="font-semibold text-gray-700">{Math.round(clamped)}٪</span>
        </div>
      )}
      <div className={`w-full bg-surface-200 rounded-full ${height} overflow-hidden`}>
        <div
          className={`${height} ${colorClass} rounded-full transition-all duration-500`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
