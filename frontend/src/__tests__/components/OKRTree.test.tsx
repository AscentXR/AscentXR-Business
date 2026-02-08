import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import OKRTree from '../../components/shared/OKRTree';
import type { Goal } from '../../types';

const goals: Goal[] = [
  {
    id: 'o1',
    title: 'Hit Revenue Target',
    goal_type: 'objective',
    progress: 60,
    status: 'on_track',
    owner: 'Jim',
    description: 'Reach $300K revenue',
    children: [
      { id: 'kr1', title: 'Close 5 Enterprise deals', goal_type: 'key_result', parent_id: 'o1', progress: 40, status: 'behind' },
      { id: 'kr2', title: 'Generate 50 qualified leads', goal_type: 'key_result', parent_id: 'o1', progress: 80, status: 'on_track', target_value: 50, current_value: 40, unit: 'leads' },
    ],
  },
];

describe('OKRTree', () => {
  it('renders objectives and key results', () => {
    render(<OKRTree goals={goals} />);
    expect(screen.getByText('Hit Revenue Target')).toBeInTheDocument();
    expect(screen.getByText('Close 5 Enterprise deals')).toBeInTheDocument();
    expect(screen.getByText('Generate 50 qualified leads')).toBeInTheDocument();
  });

  it('shows empty state when no goals', () => {
    render(<OKRTree goals={[]} />);
    expect(screen.getByText('No goals defined yet')).toBeInTheDocument();
  });

  it('shows status badges', () => {
    render(<OKRTree goals={goals} />);
    const onTrackBadges = screen.getAllByText('on track');
    expect(onTrackBadges.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('behind')).toBeInTheDocument();
  });

  it('displays progress percentages', () => {
    render(<OKRTree goals={goals} />);
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('shows target value display', () => {
    render(<OKRTree goals={goals} />);
    expect(screen.getByText('40/50 leads')).toBeInTheDocument();
  });

  it('shows owner info', () => {
    render(<OKRTree goals={goals} />);
    expect(screen.getByText('Owner: Jim')).toBeInTheDocument();
  });
});
