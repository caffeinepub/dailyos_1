import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useGetRemindersByDate } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { formatLocalDate, parseLocalDate, getTodayLocal, getFirstDayOfMonth } from '../utils/localDate';

interface CalendarViewProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export default function CalendarView({ selectedDate, onDateSelect }: CalendarViewProps) {
  const { identity } = useInternetIdentity();
  const [currentMonth, setCurrentMonth] = useState(() => getFirstDayOfMonth(selectedDate));

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
          <CardTitle className="text-lg">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleToday} className="w-full mt-2">
          Today
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((day, index) => (
            <CalendarDay
              key={index}
              day={day}
              isToday={day ? isToday(day) : false}
              isSelected={day ? isSelected(day) : false}
              onSelect={() => day && onDateSelect(formatLocalDate(day))}
              isAuthenticated={!!identity}
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
  isAuthenticated: boolean;
}

function CalendarDay({ day, isToday, isSelected, onSelect, isAuthenticated }: CalendarDayProps) {
  const dateStr = day ? formatLocalDate(day) : '';
  const { data: reminders } = useGetRemindersByDate(dateStr);
  const hasReminders = isAuthenticated && reminders && reminders.length > 0;

  if (!day) {
    return <div className="aspect-square" />;
  }

  return (
    <button
      onClick={onSelect}
      className={`
        aspect-square rounded-md text-sm font-medium transition-colors relative
        ${isSelected 
          ? 'bg-green-500 text-white hover:bg-green-600' 
          : isToday
          ? 'bg-primary/10 text-primary hover:bg-primary/20'
          : 'hover:bg-accent text-foreground'
        }
      `}
    >
      {day.getDate()}
      {hasReminders && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-chart-1" />
      )}
    </button>
  );
}
