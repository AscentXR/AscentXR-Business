import { useState } from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import GlobalSearch from '../shared/GlobalSearch';
import NotificationPanel from './NotificationPanel';
import clsx from 'clsx';

export default function Header() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-14 bg-navy-800 border-b border-navy-700 flex items-center justify-between px-6 flex-shrink-0">
      {/* Left: Global Search */}
      <div className="flex-1 max-w-xl">
        <GlobalSearch />
      </div>

      {/* Right: Notifications, User, Logout */}
      <div className="flex items-center gap-4 ml-4">
        {/* Notification Bell */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-navy-700"
          aria-label="Toggle notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Info */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white leading-tight">{user.name}</p>
              <span
                className={clsx(
                  'inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-0.5',
                  user.role === 'admin'
                    ? 'bg-ascent-blue/20 text-ascent-blue'
                    : 'bg-learning-purple/20 text-learning-purple'
                )}
              >
                {user.role === 'admin' ? 'Admin' : 'Viewer'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-ascent-blue flex items-center justify-center text-sm font-bold">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-navy-700"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </header>
  );
}
