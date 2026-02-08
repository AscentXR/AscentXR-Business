import clsx from 'clsx';

interface HealthScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

function getScoreColor(score: number): { ring: string; text: string; bg: string; label: string } {
  if (score >= 81) return { ring: 'stroke-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500', label: 'Healthy' };
  if (score >= 61) return { ring: 'stroke-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-500', label: 'Watch' };
  if (score >= 41) return { ring: 'stroke-orange-500', text: 'text-orange-400', bg: 'bg-orange-500', label: 'At Risk' };
  return { ring: 'stroke-red-500', text: 'text-red-400', bg: 'bg-red-500', label: 'Critical' };
}

const sizeConfig = {
  sm: { container: 'w-16 h-16', svgSize: 64, radius: 26, strokeWidth: 4, fontSize: 'text-sm', labelSize: 'text-[9px]' },
  md: { container: 'w-24 h-24', svgSize: 96, radius: 38, strokeWidth: 5, fontSize: 'text-xl', labelSize: 'text-[10px]' },
  lg: { container: 'w-32 h-32', svgSize: 128, radius: 52, strokeWidth: 6, fontSize: 'text-2xl', labelSize: 'text-xs' },
};

export default function HealthScore({ score, size = 'md' }: HealthScoreProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const config = getScoreColor(clampedScore);
  const sizeInfo = sizeConfig[size];

  const circumference = 2 * Math.PI * sizeInfo.radius;
  const offset = circumference - (clampedScore / 100) * circumference;
  const center = sizeInfo.svgSize / 2;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={clsx('relative', sizeInfo.container)}>
        <svg
          width={sizeInfo.svgSize}
          height={sizeInfo.svgSize}
          className="transform -rotate-90"
        >
          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={sizeInfo.radius}
            fill="none"
            stroke="#142d63"
            strokeWidth={sizeInfo.strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={center}
            cy={center}
            r={sizeInfo.radius}
            fill="none"
            className={config.ring}
            strokeWidth={sizeInfo.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={clsx('font-bold', sizeInfo.fontSize, config.text)}>
            {clampedScore}
          </span>
        </div>
      </div>
      {/* Risk label */}
      <span className={clsx('font-medium', sizeInfo.labelSize, config.text)}>
        {config.label}
      </span>
    </div>
  );
}
