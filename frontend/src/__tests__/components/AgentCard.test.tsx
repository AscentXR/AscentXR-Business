import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import AgentCard from '../../components/shared/AgentCard';
import type { Agent, AgentTask } from '../../types';

const activeAgent: Agent = {
  id: 'a1',
  name: 'SDR Agent',
  description: 'Handles sales development outreach',
  status: 'active',
  progress: 75,
  tasks_completed: 15,
  total_tasks: 20,
  capabilities: ['outreach', 'research', 'email', 'linkedin', 'analysis'],
};

const pausedAgent: Agent = {
  ...activeAgent,
  id: 'a2',
  name: 'Content Agent',
  status: 'paused',
  progress: 50,
};

const runningTask: AgentTask = {
  id: 't1',
  agent_id: 'a1',
  title: 'Research leads',
  status: 'running',
  priority: 1,
  created_at: '2026-02-01T10:00:00Z',
};

describe('AgentCard', () => {
  it('renders agent name, description, and status', () => {
    render(<AgentCard agent={activeAgent} onTrigger={vi.fn()} />);
    expect(screen.getByText('SDR Agent')).toBeInTheDocument();
    expect(screen.getByText('Handles sales development outreach')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders capabilities with overflow indicator', () => {
    render(<AgentCard agent={activeAgent} onTrigger={vi.fn()} />);
    expect(screen.getByText('outreach')).toBeInTheDocument();
    expect(screen.getByText('research')).toBeInTheDocument();
    // 5 caps total, shows first 4 + "+1"
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('shows progress bar and task count', () => {
    render(<AgentCard agent={activeAgent} onTrigger={vi.fn()} />);
    expect(screen.getByText('Tasks: 15/20')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('shows running state when active tasks exist', () => {
    render(<AgentCard agent={activeAgent} onTrigger={vi.fn()} activeTasks={[runningTask]} />);
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText('Research leads')).toBeInTheDocument();
    expect(screen.getByText('Running...')).toBeInTheDocument();
  });

  it('calls onTrigger when button clicked', async () => {
    const user = userEvent.setup();
    const onTrigger = vi.fn();
    render(<AgentCard agent={activeAgent} onTrigger={onTrigger} />);
    await user.click(screen.getByText('Trigger'));
    expect(onTrigger).toHaveBeenCalledWith('a1');
  });
});
