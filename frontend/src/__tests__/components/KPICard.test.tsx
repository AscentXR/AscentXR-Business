import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DollarSign } from 'lucide-react';
import KPICard from '../../components/shared/KPICard';

describe('KPICard', () => {
  it('renders label and value', () => {
    render(<KPICard label="Revenue" value="$47,500" />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$47,500')).toBeInTheDocument();
  });

  it('shows positive change indicator', () => {
    render(<KPICard label="Revenue" value="$47,500" change={12.5} />);
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
    expect(screen.getByText('vs last period')).toBeInTheDocument();
  });

  it('shows negative change indicator', () => {
    render(<KPICard label="Churn" value="3.2%" change={-2.1} />);
    expect(screen.getByText('-2.1%')).toBeInTheDocument();
  });

  it('renders optional icon', () => {
    const { container } = render(
      <KPICard label="Revenue" value="$47,500" icon={DollarSign} />
    );
    // The icon wrapper div should exist
    const iconWrapper = container.querySelector('.flex-shrink-0');
    expect(iconWrapper).toBeInTheDocument();
  });
});
