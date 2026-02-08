import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

interface KPICardProps {
  label: string;
  value: string;
  change?: number;
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
}

export default function KPICard({ label, value, change, icon: Icon }: KPICardProps) {
  const isPositive = change !== undefined && change >= 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className="relative bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5 overflow-hidden">
      {/* Subtle gradient overlay for glass effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

      <div className="relative flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-400 font-medium truncate">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>

          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {isPositive && <TrendingUp size={14} className="text-emerald-400" />}
              {isNegative && <TrendingDown size={14} className="text-red-400" />}
              <span
                className={clsx(
                  'text-xs font-medium',
                  isPositive && 'text-emerald-400',
                  isNegative && 'text-red-400'
                )}
              >
                {isPositive ? '+' : ''}
                {change.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>

        {Icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-ascent-blue/10 flex items-center justify-center ml-4">
            <Icon size={20} className="text-ascent-blue" />
          </div>
        )}
      </div>
    </div>
  );
}
