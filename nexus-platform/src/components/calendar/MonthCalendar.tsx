import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, isSameMonth, isSameDay } from 'date-fns';

interface Props {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  markedDates?: string[]; // yyyy-MM-dd with meetings
}

// Custom lightweight calendar (no external calendar lib) — keeps bundle small
export const MonthCalendar: React.FC<Props> = ({ selectedDate, onSelectDate, markedDates = [] }) => {
  const [month, setMonth] = useState(selectedDate);

  const start = startOfWeek(startOfMonth(month));
  const end = endOfWeek(endOfMonth(month));
  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setMonth(addMonths(month, -1))} className="p-1.5 hover:bg-gray-100 rounded-md">
          <ChevronLeft size={18} />
        </button>
        <h3 className="font-medium text-gray-900">{format(month, 'MMMM yyyy')}</h3>
        <button onClick={() => setMonth(addMonths(month, 1))} className="p-1.5 hover:bg-gray-100 rounded-md">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map(d => {
          const key = format(d, 'yyyy-MM-dd');
          const hasMeeting = markedDates.includes(key);
          return (
            <button
              key={key}
              onClick={() => onSelectDate(d)}
              className={`relative h-9 text-sm rounded-md transition-colors
                ${!isSameMonth(d, month) ? 'text-gray-300' : 'text-gray-700'}
                ${isSameDay(d, selectedDate) ? 'bg-primary-600 text-white' : 'hover:bg-gray-100'}`}
            >
              {format(d, 'd')}
              {hasMeeting && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
