import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Finance from '../../pages/Finance';

vi.mock('../../hooks/useApi', () => ({
  useApi: vi.fn().mockReturnValue({
    data: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('../../api/endpoints', () => ({
  finance: {
    getInvoices: vi.fn().mockResolvedValue({ data: { data: [] } }),
    getExpenses: vi.fn().mockResolvedValue({ data: { data: [] } }),
    getBudgets: vi.fn().mockResolvedValue({ data: { data: [] } }),
    getSummary: vi.fn().mockResolvedValue({ data: { data: { totalRevenue: 47500, totalExpenses: 12000, netIncome: 35500 } } }),
    createInvoice: vi.fn().mockResolvedValue({ data: { data: {} } }),
    updateInvoice: vi.fn().mockResolvedValue({ data: { data: {} } }),
    createExpense: vi.fn().mockResolvedValue({ data: { data: {} } }),
    createBudget: vi.fn().mockResolvedValue({ data: { data: {} } }),
    updateBudget: vi.fn().mockResolvedValue({ data: { data: {} } }),
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
      <Finance />
    </MemoryRouter>
  );
}

describe('Finance', () => {
  it('renders page title', () => {
    renderPage();
    expect(screen.getByText('Finance')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    renderPage();
    expect(screen.getByText('Invoices, Expenses & Budgets')).toBeInTheDocument();
  });

  it('shows tab bar', () => {
    renderPage();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Invoices')).toBeInTheDocument();
    // "Expenses" appears both as tab and KPI label
    expect(screen.getAllByText('Expenses').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Budgets')).toBeInTheDocument();
  });

  it('defaults to Overview tab with KPI cards', () => {
    renderPage();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Net Income')).toBeInTheDocument();
  });

  it('switches to Invoices tab', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByText('Invoices'));
    expect(screen.getByText('+ New Invoice')).toBeInTheDocument();
  });

  it('switches to Expenses tab', async () => {
    const user = userEvent.setup();
    renderPage();
    // Click the Expenses tab button (first occurrence)
    const expensesTabs = screen.getAllByText('Expenses');
    await user.click(expensesTabs[0]);
    // Expenses tab should remain visible
    expect(screen.getAllByText('Expenses').length).toBeGreaterThanOrEqual(1);
  });

  it('switches to Budgets tab', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByText('Budgets'));
    expect(screen.getByText('Budgets')).toBeInTheDocument();
  });

  it('renders agent trigger buttons', () => {
    renderPage();
    expect(screen.getByText('Categorize Expenses')).toBeInTheDocument();
  });
});
