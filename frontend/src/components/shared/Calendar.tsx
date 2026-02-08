import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export interface CalendarEvent {
  date: string; // YYYY-MM-DD
  title: string;
  color: string;
  type: string;
}

interface CalendarProps {
  events: CalendarEvent[];
  onDateClick?: (date: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
  month?: number; // 0-11
  year?: number;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function Calendar({
  events,
  onDateClick,
  onEventClick,
  month: initialMonth,
  year: initialYear,
}: CalendarProps) {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(initialMonth ?? now.getMonth());
  const [currentYear, setCurrentYear] = useState(initialYear ?? now.getFullYear());

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: { date: string; day: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const m = currentMonth === 0 ? 11 : currentMonth - 1;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      days.push({
        date: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        day: d,
        isCurrentMonth: false,
      });
    }

    // Current month
    for (let d = 1; d <= totalDays; d++) {
      days.push({
        date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        day: d,
        isCurrentMonth: true,
      });
    }

    // Next month padding (fill to 42 cells = 6 rows)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      days.push({
        date: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        day: d,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentMonth, currentYear]);

  // Index events by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((event) => {
      if (!map[event.date]) map[event.date] = [];
      map[event.date].push(event);
    });
    return map;
  }, [events]);

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  function navigateMonth(delta: number) {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  }

  return (
    <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-navy-700">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-1.5 text-gray-400 hover:text-white transition-colors rounded hover:bg-navy-700"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="text-sm font-semibold text-white">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h3>
        <button
          onClick={() => navigateMonth(1)}
          className="p-1.5 text-gray-400 hover:text-white transition-colors rounded hover:bg-navy-700"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 border-b border-navy-700">
        {DAY_NAMES.map((day) => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((dayInfo, idx) => {
          const dayEvents = eventsByDate[dayInfo.date] || [];
          const isToday = dayInfo.date === todayStr;

          return (
            <div
              key={idx}
              onClick={() => onDateClick?.(dayInfo.date)}
              className={clsx(
                'min-h-[80px] p-1.5 border-b border-r border-navy-700/50 transition-colors',
                dayInfo.isCurrentMonth ? 'bg-transparent' : 'bg-navy-900/30',
                onDateClick && 'cursor-pointer hover:bg-navy-700/20'
              )}
            >
              <span
                className={clsx(
                  'inline-flex items-center justify-center w-6 h-6 text-xs rounded-full',
                  isToday && 'bg-ascent-blue text-white font-bold',
                  !isToday && dayInfo.isCurrentMonth && 'text-gray-300',
                  !isToday && !dayInfo.isCurrentMonth && 'text-gray-600'
                )}
              >
                {dayInfo.day}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 3).map((event, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    className="w-full text-left px-1 py-0.5 rounded text-[10px] leading-tight truncate hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: `${event.color}20`, color: event.color }}
                  >
                    {event.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-[10px] text-gray-500 px-1">+{dayEvents.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
