import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CustomerSuccess from '../../pages/CustomerSuccess';

vi.mock('../../hooks/useApi', () => ({
  useApi: vi.fn().mockReturnValue({
    data: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('../../api/endpoints', () => ({
  customerSuccess: {
    getHealthScores: vi.fn().mockResolvedValue({ data: { data: [] } }),
    getTickets: vi.fn().mockResolvedValue({ data: { data: [] } }),
    getRenewals: vi.fn().mockResolvedValue({ data: { data: [] } }),
    createTicket: vi.fn().mockResolvedValue({ data: { data: {} } }),
    updateTicket: vi.fn().mockResolvedValue({ data: { data: {} } }),
  },
}));

vi.mock('../../hooks/useWebSocket', () => ({
  useWebSocket: vi.fn().mockReturnValue({ connected: false, subscribe: vi.fn().mockReturnValue(() => {}) }),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn().mockReturnValue({ user: { username: 'admin', name: 'Admin', role: 'CEO' }, token: 'tok', isAuthenticated: true, login: vi.fn(), logout: vi.fn() }),
}));

vi.mock('../../components/shared/AgentTriggerButton', () => ({
  default: ({ label }: { label: string }) => <button>{label}</button>,
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <CustomerSuccess />
    </MemoryRouter>
  );
}

describe('CustomerSuccess', () => {
  it('renders page title', () => {
    renderPage();
    expect(screen.getByText('Customer Success')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    renderPage();
    expect(screen.getByText('Health scores, support, and renewals')).toBeInTheDocument();
  });

  it('shows tab bar', () => {
    renderPage();
    expect(screen.getByText('Health Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Support Tickets')).toBeInTheDocument();
    expect(screen.getByText('Renewals')).toBeInTheDocument();
  });

  it('displays KPI cards', () => {
    renderPage();
    expect(screen.getByText('Avg Health Score')).toBeInTheDocument();
    expect(screen.getByText('At-Risk Accounts')).toBeInTheDocument();
    expect(screen.getByText('Open Tickets')).toBeInTheDocument();
    expect(screen.getByText('Expansion Opportunities')).toBeInTheDocument();
  });

  it('switches to Support Tickets tab', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByText('Support Tickets'));
    expect(screen.getByText('Support Tickets')).toBeInTheDocument();
  });

  it('switches to Renewals tab', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByText('Renewals'));
    expect(screen.getByText('Renewals')).toBeInTheDocument();
  });

  it('shows new ticket button', () => {
    renderPage();
    expect(screen.getByText('+ New Ticket')).toBeInTheDocument();
  });

  it('renders agent trigger button', () => {
    renderPage();
    expect(screen.getByText('Analyze Churn Risk')).toBeInTheDocument();
  });
});
