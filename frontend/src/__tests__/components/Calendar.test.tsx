import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Calendar, { type CalendarEvent } from '../../components/shared/Calendar';

const events: CalendarEvent[] = [
  { date: '2026-02-10', title: 'Team Meeting', color: '#3b82f6', type: 'meeting' },
  { date: '2026-02-15', title: 'Deadline', color: '#ef4444', type: 'deadline' },
];

describe('Calendar', () => {
  it('renders the specified month and year', () => {
    render(<Calendar events={[]} month={1} year={2026} />);
    expect(screen.getByText('February 2026')).toBeInTheDocument();
  });

  it('renders day names header', () => {
    render(<Calendar events={[]} month={1} year={2026} />);
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
  });

  it('renders events on their dates', () => {
    render(<Calendar events={events} month={1} year={2026} />);
    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.getByText('Deadline')).toBeInTheDocument();
  });

  it('navigates to next month', async () => {
    const user = userEvent.setup();
    render(<Calendar events={[]} month={1} year={2026} />);

    expect(screen.getByText('February 2026')).toBeInTheDocument();

    // Click the right chevron (next month)
    const buttons = screen.getAllByRole('button');
    const nextBtn = buttons[buttons.length - 1]; // Last button in header is next
    await user.click(nextBtn);

    expect(screen.getByText('March 2026')).toBeInTheDocument();
  });

  it('calls onEventClick when event is clicked', async () => {
    const user = userEvent.setup();
    const onEventClick = vi.fn();
    render(<Calendar events={events} month={1} year={2026} onEventClick={onEventClick} />);

    await user.click(screen.getByText('Team Meeting'));
    expect(onEventClick).toHaveBeenCalledWith(events[0]);
  });
});
