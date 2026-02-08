import { CheckCircle2, Clock, AlertCircle, Circle } from 'lucide-react';
import clsx from 'clsx';

export interface TimelineItem {
  date: string;
  title: string;
  description?: string;
  status: 'completed' | 'in_progress' | 'pending' | 'overdue';
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
}

interface TimelineProps {
  items: TimelineItem[];
}

const statusConfig: Record<
  TimelineItem['status'],
  {
    dotColor: string;
    lineColor: string;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
    textColor: string;
  }
> = {
  completed: {
    dotColor: 'bg-emerald-500',
    lineColor: 'bg-emerald-500/30',
    icon: CheckCircle2,
    textColor: 'text-emerald-400',
  },
  in_progress: {
    dotColor: 'bg-ascent-blue',
    lineColor: 'bg-ascent-blue/30',
    icon: Clock,
    textColor: 'text-ascent-blue',
  },
  pending: {
    dotColor: 'bg-gray-600',
    lineColor: 'bg-gray-700',
    icon: Circle,
    textColor: 'text-gray-400',
  },
  overdue: {
    dotColor: 'bg-red-500',
    lineColor: 'bg-red-500/30',
    icon: AlertCircle,
    textColor: 'text-red-400',
  },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Timeline({ items }: TimelineProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No timeline items
      </div>
    );
  }

  return (
    <div className="relative">
      {items.map((item, index) => {
        const config = statusConfig[item.status];
        const Icon = item.icon || config.icon;
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex gap-4 relative">
            {/* Vertical line & dot */}
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-navy-800',
                  config.dotColor
                )}
              >
                <Icon size={14} className="text-white" />
              </div>
              {!isLast && (
                <div
                  className={clsx('w-0.5 flex-1 min-h-[2rem]', config.lineColor)}
                />
              )}
            </div>

            {/* Content */}
            <div className={clsx('pb-6 min-w-0 flex-1', isLast && 'pb-0')}>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-white">{item.title}</p>
                <span className={clsx('text-xs font-medium', config.textColor)}>
                  {item.status.replace('_', ' ')}
                </span>
              </div>
              {item.description && (
                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
              )}
              <p className="text-xs text-gray-600 mt-1">{formatDate(item.date)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
