interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'purple' | 'green' | 'red' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
  warning?: boolean;
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = 'blue',
  size = 'md',
  warning,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));

  const colorMap: Record<string, string> = {
    blue: 'bg-[#2563EB]',
    purple: 'bg-[#7C3AED]',
    green: 'bg-emerald-500',
    red: 'bg-red-500',
    yellow: 'bg-amber-500',
  };

  const sizeMap: Record<string, string> = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const barColor = warning && pct >= 80 ? 'bg-amber-500' : (pct >= 100 ? 'bg-emerald-500' : colorMap[color]);

  return (
    <div>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-gray-400">{label}</span>}
          {showPercentage && <span className="text-xs text-gray-400">{pct}%</span>}
        </div>
      )}
      <div className={`w-full bg-navy-700 rounded-full overflow-hidden ${sizeMap[size]}`}>
        <div
          className={`${barColor} ${sizeMap[size]} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
