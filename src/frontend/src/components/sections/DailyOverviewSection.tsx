import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useGetActivitiesByDate, useGetFinancesByDate, useGetHabitsByDate, useGetJournalByDate } from '../../hooks/useQueries';
import { FinanceType } from '../../backend';
import { useIsMobile } from '../../hooks/useIsMobile';
import { renderPiePercentLabel } from '../charts/PiePercentLabel';

interface DailyOverviewSectionProps {
  selectedDate: string;
}

export default function DailyOverviewSection({ selectedDate }: DailyOverviewSectionProps) {
  const isMobile = useIsMobile();
  const { data: activities = [], isLoading: activitiesLoading } = useGetActivitiesByDate(selectedDate);
  const { data: finances = [], isLoading: financesLoading } = useGetFinancesByDate(selectedDate);
  const { data: habits = [], isLoading: habitsLoading } = useGetHabitsByDate(selectedDate);
  const { data: journal, isLoading: journalLoading } = useGetJournalByDate(selectedDate);

  // Calculate activity time distribution
  const activityData = activities.map((activity) => {
    let duration = 0;
    if (activity.duration) {
      duration = Number(activity.duration);
    } else if (activity.startTime && activity.endTime) {
      const start = new Date(`2000-01-01T${activity.startTime}`);
      const end = new Date(`2000-01-01T${activity.endTime}`);
      duration = (end.getTime() - start.getTime()) / (1000 * 60);
    }
    return {
      name: activity.name,
      value: duration,
    };
  }).filter(item => item.value > 0);

  // Calculate finance totals
  const financeData = finances.reduce(
    (acc, finance) => {
      const amount = Number(finance.amount);
      if (finance.financeType === FinanceType.income) {
        acc.income += amount;
      } else if (finance.financeType === FinanceType.expense) {
        acc.expense += amount;
      } else if (finance.financeType === FinanceType.investment) {
        acc.investment += amount;
      }
      return acc;
    },
    { income: 0, expense: 0, investment: 0 }
  );

  const financeChartData = [
    { name: 'Income', value: financeData.income },
    { name: 'Expenses', value: financeData.expense },
    { name: 'Investments', value: financeData.investment },
  ].filter(item => item.value > 0);

  // Calculate habits completion
  const completedHabits = habits.filter(h => h.isCompleted).length;
  const notCompletedHabits = habits.length - completedHabits;

  const habitsChartData = [
    { name: 'Completed', value: completedHabits },
    { name: 'Not Completed', value: notCompletedHabits },
  ].filter(item => item.value > 0);

  const ACTIVITY_COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];
  const FINANCE_COLORS = ['#10b981', '#f59e0b', '#8b5cf6'];
  const HABITS_COLORS = ['#a855f7', '#c084fc'];

  const isLoading = activitiesLoading || financesLoading || habitsLoading || journalLoading;

  // Mobile-specific chart settings
  const pieOuterRadius = isMobile ? 60 : 80;
  const chartHeight = isMobile ? 220 : 250;
  const chartMargin = isMobile ? { top: 10, right: 10, bottom: 10, left: 10 } : { top: 5, right: 5, bottom: 5, left: 5 };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading overview...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Activities Card */}
      <Card className="dashboard-card dashboard-card-overview">
        <CardHeader>
          <CardTitle>Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {activityData.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No activities logged for this day</p>
          ) : (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <PieChart margin={chartMargin}>
                <Pie
                  data={activityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props) => renderPiePercentLabel({ ...props, isMobile })}
                  outerRadius={pieOuterRadius}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ACTIVITY_COLORS[index % ACTIVITY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value} min`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Finance Card */}
      <Card className="dashboard-card dashboard-card-finance">
        <CardHeader>
          <CardTitle>Finance</CardTitle>
        </CardHeader>
        <CardContent>
          {financeChartData.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No finance entries for this day</p>
          ) : (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <PieChart margin={chartMargin}>
                <Pie
                  data={financeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props) => renderPiePercentLabel({ ...props, isMobile })}
                  outerRadius={pieOuterRadius}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {financeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={FINANCE_COLORS[index % FINANCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Habits Card */}
      <Card className="dashboard-card dashboard-card-habits">
        <CardHeader>
          <CardTitle>Habits</CardTitle>
        </CardHeader>
        <CardContent>
          {habitsChartData.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No habits tracked for this day</p>
          ) : (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <PieChart margin={chartMargin}>
                <Pie
                  data={habitsChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props) => renderPiePercentLabel({ ...props, isMobile })}
                  outerRadius={pieOuterRadius}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {habitsChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={HABITS_COLORS[index % HABITS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Journal Card */}
      <Card className="dashboard-card dashboard-card-journal">
        <CardHeader>
          <CardTitle>Journal</CardTitle>
        </CardHeader>
        <CardContent>
          {!journal ? (
            <p className="text-muted-foreground text-center py-8">No journal entry for this day</p>
          ) : (
            <div className="space-y-3">
              {journal.title && (
                <h4 className="font-semibold text-lg">{journal.title}</h4>
              )}
              <div className="prose prose-sm max-w-none">
                <div
                  className="text-sm text-muted-foreground line-clamp-6"
                  dangerouslySetInnerHTML={{ __html: journal.content }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
