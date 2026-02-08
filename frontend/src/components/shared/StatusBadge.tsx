interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const STATUS_COLORS: Record<string, string> = {
  // General
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  // Success states
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  paid: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  compliant: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  released: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  published: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  resolved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  won: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  healthy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  on_track: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  verified: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  claimed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  connected: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  // Warning states
  sent: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  running: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  streaming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  review: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  needs_review: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  watch: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  behind: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  waiting: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  prospect: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  planned: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  queued: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  // Danger states
  overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
  at_risk: 'bg-red-500/20 text-red-400 border-red-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  non_compliant: 'bg-red-500/20 text-red-400 border-red-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  lost: 'bg-red-500/20 text-red-400 border-red-500/30',
  churned: 'bg-red-500/20 text-red-400 border-red-500/30',
  stopped: 'bg-red-500/20 text-red-400 border-red-500/30',
  not_started: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  // Priority
  low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center rounded-full border font-medium capitalize ${colorClass} ${sizeClass}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
