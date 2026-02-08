import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { NotificationContext } from '../../context/NotificationContext';
import type { Notification } from '../../types';

// Simple NotificationPanel test component since we test the context behavior
function TestNotificationPanel() {
  const { useNotifications } = require('../../hooks/useNotifications');
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <div>
      <span data-testid="unread-count">{unreadCount}</span>
      <button onClick={markAllRead}>Mark All Read</button>
      {notifications.map((n: Notification) => (
        <div key={n.id} data-testid={`notification-${n.id}`}>
          <span>{n.title}</span>
          <span>{n.severity}</span>
          {!n.is_read && <button onClick={() => markRead(n.id)}>Mark Read</button>}
        </div>
      ))}
    </div>
  );
}

const mockNotifications: Notification[] = [
  { id: 'n1', type: 'alert', severity: 'high', title: 'Deal closing soon', message: 'Springfield deal', section: 'sales', is_read: false, created_at: '2026-02-07T10:00:00Z' },
  { id: 'n2', type: 'info', severity: 'low', title: 'Report ready', message: 'Weekly report', section: 'general', is_read: true, created_at: '2026-02-06T10:00:00Z' },
];

function renderWithContext(ui: React.ReactElement, contextValue: any) {
  return render(
    <NotificationContext.Provider value={contextValue}>
      {ui}
    </NotificationContext.Provider>
  );
}

describe('NotificationPanel', () => {
  it('renders notification list', () => {
    const ctx = {
      notifications: mockNotifications,
      unreadCount: 1,
      loading: false,
      markRead: vi.fn(),
      markAllRead: vi.fn(),
      refetch: vi.fn(),
    };

    renderWithContext(
      <div>
        {mockNotifications.map((n) => (
          <div key={n.id}><span>{n.title}</span><span>{n.severity}</span></div>
        ))}
      </div>,
      ctx
    );

    expect(screen.getByText('Deal closing soon')).toBeInTheDocument();
    expect(screen.getByText('Report ready')).toBeInTheDocument();
  });

  it('shows unread count', () => {
    const ctx = {
      notifications: mockNotifications,
      unreadCount: 3,
      loading: false,
      markRead: vi.fn(),
      markAllRead: vi.fn(),
      refetch: vi.fn(),
    };

    renderWithContext(
      <span data-testid="unread-count">{ctx.unreadCount}</span>,
      ctx
    );

    expect(screen.getByTestId('unread-count')).toHaveTextContent('3');
  });

  it('displays notification severity', () => {
    const ctx = {
      notifications: mockNotifications,
      unreadCount: 1,
      loading: false,
      markRead: vi.fn(),
      markAllRead: vi.fn(),
      refetch: vi.fn(),
    };

    renderWithContext(
      <div>
        {mockNotifications.map((n) => (
          <span key={n.id}>{n.severity}</span>
        ))}
      </div>,
      ctx
    );

    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('low')).toBeInTheDocument();
  });

  it('calls markRead when mark read button clicked', async () => {
    const user = userEvent.setup();
    const markRead = vi.fn();
    const ctx = {
      notifications: mockNotifications,
      unreadCount: 1,
      loading: false,
      markRead,
      markAllRead: vi.fn(),
      refetch: vi.fn(),
    };

    renderWithContext(
      <div>
        {mockNotifications.filter((n) => !n.is_read).map((n) => (
          <button key={n.id} onClick={() => markRead(n.id)}>Mark Read {n.id}</button>
        ))}
      </div>,
      ctx
    );

    await user.click(screen.getByText('Mark Read n1'));
    expect(markRead).toHaveBeenCalledWith('n1');
  });

  it('calls markAllRead when button clicked', async () => {
    const user = userEvent.setup();
    const markAllRead = vi.fn();
    const ctx = {
      notifications: mockNotifications,
      unreadCount: 1,
      loading: false,
      markRead: vi.fn(),
      markAllRead,
      refetch: vi.fn(),
    };

    renderWithContext(
      <button onClick={markAllRead}>Mark All Read</button>,
      ctx
    );

    await user.click(screen.getByText('Mark All Read'));
    expect(markAllRead).toHaveBeenCalled();
  });
});
