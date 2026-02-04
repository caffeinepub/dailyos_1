import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import DailyOverviewSection from './sections/DailyOverviewSection';
import OverviewSection from './sections/OverviewSection';
import FinanceSection from './sections/FinanceSection';
import HabitsSection from './sections/HabitsSection';
import JournalSection from './sections/JournalSection';
import { parseLocalDate } from '../utils/localDate';

interface DailyDashboardProps {
  selectedDate: string;
}

export default function DailyDashboard({ selectedDate }: DailyDashboardProps) {
  const displayDate = parseLocalDate(selectedDate);

  return (
    <div className="space-y-6">
      {/* Desktop date header - visible only on large screens */}
      <div className="hidden lg:flex items-center justify-between">
        <h2 className="text-3xl font-bold">
          {displayDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </h2>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <span className="sm:hidden">O</span>
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="activities">
            <span className="sm:hidden">A</span>
            <span className="hidden sm:inline">Activities</span>
          </TabsTrigger>
          <TabsTrigger value="finance">
            <span className="sm:hidden">F</span>
            <span className="hidden sm:inline">Finance</span>
          </TabsTrigger>
          <TabsTrigger value="habits">
            <span className="sm:hidden">H</span>
            <span className="hidden sm:inline">Habits</span>
          </TabsTrigger>
          <TabsTrigger value="journal">
            <span className="sm:hidden">J</span>
            <span className="hidden sm:inline">Journal</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <DailyOverviewSection selectedDate={selectedDate} />
        </TabsContent>
        <TabsContent value="activities" className="mt-6">
          <OverviewSection selectedDate={selectedDate} />
        </TabsContent>
        <TabsContent value="finance" className="mt-6">
          <FinanceSection selectedDate={selectedDate} />
        </TabsContent>
        <TabsContent value="habits" className="mt-6">
          <HabitsSection selectedDate={selectedDate} />
        </TabsContent>
        <TabsContent value="journal" className="mt-6">
          <JournalSection selectedDate={selectedDate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
