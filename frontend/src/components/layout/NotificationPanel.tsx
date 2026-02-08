import { useState, useEffect, useRef } from 'react';
import { X, CheckCheck, AlertTriangle, AlertCircle, Info, Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import type { Notification } from '../../types';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type PriorityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';

const severityConfig: Record<
  Notification['severity'],
  {
    color: string;
    bg: string;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
  }
> = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: AlertCircle },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', icon: AlertTriangle },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: Info },
  low: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', icon: Bell },
};

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { notifications, markRead, markAllRead } = useNotifications();
  const [filter, setFilter] = useState<PriorityFilter>('all');
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  const filteredNotifications = notifications.filter(
    (n) => filter === 'all' || n.severity === filter
  );

  function handleNotificationClick(notif: Notification) {
    if (!notif.is_read) {
      markRead(notif.id);
    }
    if (notif.action_url) {
      navigate(notif.action_url);
      onClose();
    }
  }

  function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  }

  const filterOptions: { value: PriorityFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  return (
    <div
      ref={panelRef}
      className={clsx(
        'fixed top-0 right-0 h-full w-96 bg-navy-800 border-l border-navy-700 shadow-2xl z-50',
        'transform transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-navy-700">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => markAllRead()}
            className="p-1.5 text-gray-400 hover:text-ascent-blue transition-colors rounded"
            title="Mark all as read"
          >
            <CheckCheck size={18} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white transition-colors rounded"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-3 border-b border-navy-700 overflow-x-auto">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap',
              filter === opt.value
                ? 'bg-ascent-blue text-white'
                : 'bg-navy-700 text-gray-400 hover:text-white'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="overflow-y-auto" style={{ height: 'calc(100% - 120px)' }}>
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Bell size={40} className="mb-3 opacity-50" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const config = severityConfig[notif.severity];
            const Icon = config.icon;

            return (
              <button
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={clsx(
                  'w-full text-left p-4 border-b border-navy-700 transition-colors hover:bg-navy-700/50',
                  !notif.is_read && 'bg-navy-900/30'
                )}
              >
                <div className="flex gap-3">
                  <div
                    className={clsx(
                      'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border',
                      config.bg
                    )}
                  >
                    <Icon size={16} className={config.color} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={clsx(
                          'text-sm leading-snug',
                          notif.is_read ? 'text-gray-400' : 'text-white font-medium'
                        )}
                      >
                        {notif.title}
                      </p>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-ascent-blue flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    {notif.message && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-gray-600">{notif.section}</span>
                      <span className="text-xs text-gray-600">&middot;</span>
                      <span className="text-xs text-gray-600">
                        {formatTime(notif.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
