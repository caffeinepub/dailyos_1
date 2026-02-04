import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useGetRemindersForDates } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { formatLocalDate, parseLocalDate, getTodayLocal, getFirstDayOfMonth, getMonthDates } from '../utils/localDate';

interface CalendarViewProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export default function CalendarView({ selectedDate, onDateSelect }: CalendarViewProps) {
  const { identity } = useInternetIdentity();
  const [currentMonth, setCurrentMonth] = useState(() => getFirstDayOfMonth(selectedDate));

  // Get all dates in the current month for the reminder indicator query
  const monthDates = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return getMonthDates(year, month);
  }, [currentMonth]);

  // Single query for all reminder indicators in the month
  const { data: reminderDates } = useGetRemindersForDates(monthDates);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    onDateSelect(getTodayLocal());
  };

  const isToday = (date: Date): boolean => {
    return formatLocalDate(date) === getTodayLocal();
  };

  const isSelected = (date: Date): boolean => {
    return formatLocalDate(date) === selectedDate;
  };

  return (
    <Card className="calendar-highlight">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-extrabold">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </CardTitle>
          <div className="flex gap-1.5">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="rounded-lg hover:scale-105 transition-transform">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNextMonth} className="rounded-lg hover:scale-105 transition-transform">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleToday} className="w-full mt-3 font-semibold rounded-lg hover:scale-[1.02] transition-transform">
          Today
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1.5 mb-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-bold text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {daysInMonth.map((day, index) => (
            <CalendarDay
              key={index}
              day={day}
              isToday={day ? isToday(day) : false}
              isSelected={day ? isSelected(day) : false}
              onSelect={() => day && onDateSelect(formatLocalDate(day))}
              hasReminders={day && !!identity ? reminderDates?.has(formatLocalDate(day)) || false : false}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface CalendarDayProps {
  day: Date | null;
  isToday: boolean;
  isSelected: boolean;
  onSelect: () => void;
  hasReminders: boolean;
}

function CalendarDay({ day, isToday, isSelected, onSelect, hasReminders }: CalendarDayProps) {
  if (!day) {
    return <div className="aspect-square" />;
  }

  return (
    <button
      onClick={onSelect}
      className={`
        aspect-square rounded-xl text-sm font-bold transition-all duration-200 relative
        ${isSelected 
          ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg scale-105' 
          : isToday
          ? 'bg-primary/15 text-primary hover:bg-primary/25 ring-2 ring-primary/30'
          : 'hover:bg-accent text-foreground hover:scale-105'
        }
      `}
    >
      {day.getDate()}
      {hasReminders && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-chart-1 shadow-sm" />
      )}
    </button>
  );
}
