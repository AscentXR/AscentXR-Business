import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import KanbanBoard, { type KanbanColumn, type KanbanItem } from '../../components/shared/KanbanBoard';

const columns: KanbanColumn[] = [
  { id: 'todo', title: 'To Do', color: '#3b82f6' },
  { id: 'doing', title: 'In Progress', color: '#f59e0b' },
  { id: 'done', title: 'Done', color: '#10b981' },
];

const items: KanbanItem[] = [
  { id: 'item1', columnId: 'todo', title: 'Task 1', subtitle: 'First task' },
  { id: 'item2', columnId: 'todo', title: 'Task 2' },
  { id: 'item3', columnId: 'doing', title: 'Task 3', metadata: { priority: 'High' } },
  { id: 'item4', columnId: 'done', title: 'Task 4' },
];

describe('KanbanBoard', () => {
  it('renders all column headers', () => {
    render(<KanbanBoard columns={columns} items={items} onMove={vi.fn()} />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders items in correct columns', () => {
    render(<KanbanBoard columns={columns} items={items} onMove={vi.fn()} />);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
    expect(screen.getByText('Task 4')).toBeInTheDocument();
  });

  it('shows item count per column', () => {
    render(<KanbanBoard columns={columns} items={items} onMove={vi.fn()} />);
    // Column headers show count badge
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 items in "To Do"
    const ones = screen.getAllByText('1');
    expect(ones.length).toBeGreaterThanOrEqual(2); // 1 in "In Progress" and 1 in "Done"
  });

  it('renders item subtitle', () => {
    render(<KanbanBoard columns={columns} items={items} onMove={vi.fn()} />);
    expect(screen.getByText('First task')).toBeInTheDocument();
  });

  it('renders item metadata', () => {
    render(<KanbanBoard columns={columns} items={items} onMove={vi.fn()} />);
    expect(screen.getByText('priority: High')).toBeInTheDocument();
  });

  it('calls onItemClick when a card is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<KanbanBoard columns={columns} items={items} onMove={vi.fn()} onItemClick={onClick} />);
    await user.click(screen.getByText('Task 1'));
    expect(onClick).toHaveBeenCalledWith(items[0]);
  });
});
