import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Sales from '../../pages/Sales';

vi.mock('../../hooks/useApi', () => ({
  useApi: vi.fn().mockReturnValue({
    data: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('../../api/endpoints', () => ({
  crm: {
    getContacts: vi.fn().mockResolvedValue({ data: { data: { contacts: [], total: 0 } } }),
    getDeals: vi.fn().mockResolvedValue({ data: { data: [] } }),
    createContact: vi.fn().mockResolvedValue({ data: { data: {} } }),
    updateContact: vi.fn().mockResolvedValue({ data: { data: {} } }),
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
      <Sales />
    </MemoryRouter>
  );
}

describe('Sales', () => {
  it('renders page title', () => {
    renderPage();
    expect(screen.getByText('Sales')).toBeInTheDocument();
  });

  it('shows tab bar with Pipeline, Contacts, Deals, Proposals', () => {
    renderPage();
    expect(screen.getByText('Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Contacts')).toBeInTheDocument();
    expect(screen.getByText('Deals')).toBeInTheDocument();
    expect(screen.getByText('Proposals')).toBeInTheDocument();
  });

  it('shows Pipeline tab as default with stage columns', () => {
    renderPage();
    expect(screen.getByText('Discovery')).toBeInTheDocument();
    expect(screen.getByText('Needs Assessment')).toBeInTheDocument();
    expect(screen.getByText('Proposal')).toBeInTheDocument();
    expect(screen.getByText('Negotiation')).toBeInTheDocument();
    expect(screen.getByText('Contract Review')).toBeInTheDocument();
  });

  it('switches to Contacts tab', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByText('Contacts'));
    expect(screen.getByText('+ Add Contact')).toBeInTheDocument();
  });

  it('switches to Deals tab', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByText('Deals'));
    expect(screen.getByText('Deals')).toBeInTheDocument();
  });

  it('shows subtitle', () => {
    renderPage();
    expect(screen.getByText('CRM & Pipeline Management')).toBeInTheDocument();
  });

  it('renders agent trigger buttons', () => {
    renderPage();
    expect(screen.getByText('Research District')).toBeInTheDocument();
  });

  it('shows add contact button on Contacts tab', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByText('Contacts'));
    expect(screen.getByText('+ Add Contact')).toBeInTheDocument();
  });
});
