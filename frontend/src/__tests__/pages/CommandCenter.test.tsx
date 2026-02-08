import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CommandCenter from '../../pages/CommandCenter';

// recharts ResponsiveContainer requires ResizeObserver in jsdom
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

vi.mock('../../hooks/useApi', () => ({
  useApi: vi.fn().mockReturnValue({
    data: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('../../api/endpoints', () => ({
  metrics: { all: vi.fn().mockResolvedValue({ data: { data: { revenue: 47500, pipelineValue: 285000, activeDeals: 12, activeAgents: 6, revenueHistory: [{ month: 'Jan', value: 35000 }, { month: 'Feb', value: 47500 }] } } }) },
  goals: { list: vi.fn().mockResolvedValue({ data: { data: [] } }) },
  agents: { getTasks: vi.fn().mockResolvedValue({ data: { data: [] } }) },
  notifications: { list: vi.fn().mockResolvedValue({ data: { data: [] } }) },
}));

vi.mock('../../hooks/useWebSocket', () => ({
  useWebSocket: vi.fn().mockReturnValue({ connected: false, subscribe: vi.fn().mockReturnValue(() => {}) }),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn().mockReturnValue({ user: { username: 'admin', name: 'Admin', role: 'CEO' }, token: 'tok', isAuthenticated: true, login: vi.fn(), logout: vi.fn() }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <CommandCenter />
    </MemoryRouter>
  );
}

describe('CommandCenter', () => {
  it('renders the page title', () => {
    renderPage();
    expect(screen.getByText('Command Center')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    renderPage();
    expect(screen.getByText('Mission Control for Ascent XR')).toBeInTheDocument();
  });

  it('displays KPI cards', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('Pipeline Value')).toBeInTheDocument();
      expect(screen.getByText('Active Deals')).toBeInTheDocument();
      expect(screen.getByText('Active Agents')).toBeInTheDocument();
    });
  });

  it('shows milestone timeline', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Company Founded')).toBeInTheDocument();
    });
  });

  it('shows revenue target reference', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('$300K Revenue Target')).toBeInTheDocument();
    });
  });

  it('displays revenue progress section', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Revenue Progress/i)).toBeInTheDocument();
    });
  });
});
