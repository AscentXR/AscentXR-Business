import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Goals from '../../pages/Goals';

vi.mock('../../hooks/useApi', () => ({
  useApi: vi.fn().mockReturnValue({
    data: [
      {
        id: 'g1', title: 'Revenue Target', goal_type: 'objective', progress: 50, status: 'on_track',
        business_area: 'Sales', quarter: 'Q1 2026',
        children: [
          { id: 'g2', title: 'Close 5 deals', goal_type: 'key_result', parent_id: 'g1', progress: 40, status: 'behind' },
        ],
      },
    ],
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('../../api/endpoints', () => ({
  goals: {
    getTree: vi.fn().mockResolvedValue({ data: { data: [] } }),
    create: vi.fn().mockResolvedValue({ data: { data: {} } }),
    update: vi.fn().mockResolvedValue({ data: { data: {} } }),
    delete: vi.fn().mockResolvedValue({ data: { data: {} } }),
  },
}));

vi.mock('../../hooks/useWebSocket', () => ({
  useWebSocket: vi.fn().mockReturnValue({ connected: false, subscribe: vi.fn().mockReturnValue(() => {}) }),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn().mockReturnValue({ user: { uid: 'test-uid', email: 'admin@ascentxr.com', name: 'Admin', role: 'admin' }, isAuthenticated: true, loading: false, login: vi.fn(), logout: vi.fn() }),
}));

vi.mock('../../components/shared/AgentTriggerButton', () => ({
  default: ({ label }: { label: string }) => <button>{label}</button>,
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <Goals />
    </MemoryRouter>
  );
}

describe('Goals', () => {
  it('renders page title', () => {
    renderPage();
    expect(screen.getByText('Goals & OKRs')).toBeInTheDocument();
  });

  it('shows quarter selector buttons', () => {
    renderPage();
    expect(screen.getByText('Q1 2026')).toBeInTheDocument();
    expect(screen.getByText('Q2 2026')).toBeInTheDocument();
  });

  it('renders goal items', () => {
    renderPage();
    expect(screen.getByText('Revenue Target')).toBeInTheDocument();
    expect(screen.getByText('Close 5 deals')).toBeInTheDocument();
  });

  it('shows New Goal button', () => {
    renderPage();
    expect(screen.getByText('+ New Goal')).toBeInTheDocument();
  });

  it('shows business area filter buttons', () => {
    renderPage();
    // The area filter buttons include All, Sales, Marketing, Finance, Product, Customer Success
    // Some labels may appear in both filters and summary, so use getAllByText
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getAllByText('Sales').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Marketing').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Finance').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Product').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Customer Success').length).toBeGreaterThanOrEqual(1);
  });

  it('displays area summary section', () => {
    renderPage();
    // Area summary cards show objective counts
    expect(screen.getAllByText(/objectives/i).length).toBeGreaterThan(0);
  });
});
