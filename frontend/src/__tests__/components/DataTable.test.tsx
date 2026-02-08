import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import DataTable, { type Column } from '../../components/shared/DataTable';

interface TestRow {
  id: string;
  name: string;
  value: number;
  status: string;
}

const columns: Column<TestRow>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'value', label: 'Value', sortable: true },
  { key: 'status', label: 'Status' },
];

const data: TestRow[] = [
  { id: '1', name: 'Alpha', value: 100, status: 'active' },
  { id: '2', name: 'Beta', value: 200, status: 'inactive' },
  { id: '3', name: 'Charlie', value: 50, status: 'active' },
];

describe('DataTable', () => {
  it('renders column headers', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('shows empty message when no data', () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('shows loading skeleton', () => {
    const { container } = render(<DataTable columns={columns} data={[]} loading />);
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('sorts data when clicking sortable column header', async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={data} />);

    const nameHeader = screen.getByText('Name');
    await user.click(nameHeader);

    const cells = screen.getAllByRole('cell');
    const nameValues = cells.filter((_, i) => i % 3 === 0).map((c) => c.textContent);
    expect(nameValues).toEqual(['Alpha', 'Beta', 'Charlie']);
  });

  it('reverses sort on second click', async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={data} />);

    const nameHeader = screen.getByText('Name');
    await user.click(nameHeader);
    await user.click(nameHeader);

    const cells = screen.getAllByRole('cell');
    const nameValues = cells.filter((_, i) => i % 3 === 0).map((c) => c.textContent);
    expect(nameValues).toEqual(['Charlie', 'Beta', 'Alpha']);
  });

  it('calls onRowClick when a row is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<DataTable columns={columns} data={data} onRowClick={onClick} />);

    const row = screen.getByText('Alpha').closest('tr')!;
    await user.click(row);
    expect(onClick).toHaveBeenCalledWith(data[0]);
  });

  it('filters data with search input', async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={data} searchable />);

    const searchInput = screen.getByPlaceholderText('Search...');
    await user.type(searchInput, 'Beta');

    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
  });
});
