import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HealthScore from '../../components/shared/HealthScore';

describe('HealthScore', () => {
  it('renders the score number', () => {
    render(<HealthScore score={85} />);
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('shows "Healthy" label for scores >= 81', () => {
    render(<HealthScore score={85} />);
    expect(screen.getByText('Healthy')).toBeInTheDocument();
  });

  it('shows "At Risk" label for scores 41-60', () => {
    render(<HealthScore score={55} />);
    expect(screen.getByText('At Risk')).toBeInTheDocument();
  });

  it('shows "Critical" label for scores <= 40', () => {
    render(<HealthScore score={30} />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });
});
