import { Info, AlertTriangle, AlertCircle, CheckCircle2, X } from 'lucide-react';
import clsx from 'clsx';

interface AlertBannerProps {
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  onDismiss?: () => void;
}

const typeConfig: Record<
  AlertBannerProps['type'],
  {
    bg: string;
    border: string;
    text: string;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
    iconColor: string;
  }
> = {
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-300',
    icon: Info,
    iconColor: 'text-blue-400',
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-300',
    icon: AlertTriangle,
    iconColor: 'text-yellow-400',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-300',
    icon: AlertCircle,
    iconColor: 'text-red-400',
  },
  success: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-300',
    icon: CheckCircle2,
    iconColor: 'text-emerald-400',
  },
};

export default function AlertBanner({ type, message, onDismiss }: AlertBannerProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={clsx(
        'flex items-center gap-3 px-4 py-3 rounded-lg border',
        config.bg,
        config.border
      )}
    >
      <Icon size={18} className={clsx('flex-shrink-0', config.iconColor)} />
      <p className={clsx('text-sm flex-1', config.text)}>{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-white transition-colors rounded"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
