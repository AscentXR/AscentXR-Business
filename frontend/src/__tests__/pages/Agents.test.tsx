import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Agents from '../../pages/Agents';
import { AgentContext } from '../../context/AgentContext';

// recharts ResponsiveContainer requires ResizeObserver in jsdom
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

let apiCallCount = 0;
vi.mock('../../hooks/useApi', () => ({
  useApi: vi.fn().mockImplementation(() => {
    apiCallCount++;
    if (apiCallCount % 2 === 1) {
      // useApi auto-unwraps objects with array keys, so mock returns Agent[] directly
      return {
        data: [
          { id: 'a1', name: 'SDR Agent', status: 'active', progress: 75, tasks_completed: 15, total_tasks: 20, capabilities: ['outreach'], description: 'Sales development' },
          { id: 'a2', name: 'Content Agent', status: 'paused', progress: 50, tasks_completed: 5, total_tasks: 10, capabilities: ['writing'], description: 'Content creation' },
        ],
        loading: false, error: null, refetch: vi.fn(),
      };
    }
    return { data: [], loading: false, error: null, refetch: vi.fn() };
  }),
}));

vi.mock('../../api/endpoints', () => ({
  agents: {
    list: vi.fn().mockResolvedValue({ data: { data: { agents: [], systemMetrics: {} } } }),
    getTasks: vi.fn().mockResolvedValue({ data: { data: [] } }),
    execute: vi.fn().mockResolvedValue({ data: { data: {} } }),
    control: vi.fn().mockResolvedValue({ data: { data: {} } }),
    reviewTask: vi.fn().mockResolvedValue({ data: { data: {} } }),
  },
}));

vi.mock('../../hooks/useWebSocket', () => ({
  useWebSocket: vi.fn().mockReturnValue({ connected: false, subscribe: vi.fn().mockReturnValue(() => {}) }),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn().mockReturnValue({ user: { uid: 'test-uid', email: 'admin@ascentxr.com', name: 'Admin', role: 'admin' }, isAuthenticated: true, loading: false, login: vi.fn(), logout: vi.fn() }),
}));

const mockAgentCtx = {
  activeTasks: [] as any[],
  executeTask: vi.fn(),
  reviewTask: vi.fn(),
};

function renderPage() {
  apiCallCount = 0;
  return render(
    <MemoryRouter>
      <AgentContext.Provider value={mockAgentCtx}>
        <Agents />
      </AgentContext.Provider>
    </MemoryRouter>
  );
}

describe('Agents', () => {
  it('renders page title', () => {
    renderPage();
    expect(screen.getByText('Agent Coordination')).toBeInTheDocument();
  });

  it('shows subtitle', () => {
    renderPage();
    expect(screen.getByText('Manage AI agents and their tasks')).toBeInTheDocument();
  });

  it('shows agent cards with names', () => {
    renderPage();
    expect(screen.getByText('SDR Agent')).toBeInTheDocument();
    expect(screen.getByText('Content Agent')).toBeInTheDocument();
  });

  it('shows execute task button', () => {
    renderPage();
    expect(screen.getByText('+ Execute Task')).toBeInTheDocument();
  });

  it('displays agent descriptions', () => {
    renderPage();
    expect(screen.getByText('Sales development')).toBeInTheDocument();
    expect(screen.getByText('Content creation')).toBeInTheDocument();
  });

  it('opens execution modal when button clicked', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByText('+ Execute Task'));
    await waitFor(() => {
      const modalContent = screen.queryByText('Execute Agent Task') || screen.queryByText(/prompt/i) || screen.queryByRole('dialog');
      expect(modalContent || screen.queryByPlaceholderText(/prompt/i) || screen.queryByText('Execute')).toBeTruthy();
    });
  });
});
