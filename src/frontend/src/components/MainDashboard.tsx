import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import AppButton from './AppButton';
import { useGetActivitiesForDates, useGetFinancesForDates, useGetHabitsForDates } from '../hooks/useQueries';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FinanceType } from '../backend';
import { getLastNDays, parseLocalDate } from '../utils/localDate';
import { useIsMobile } from '../hooks/useIsMobile';

export default function MainDashboard() {
  const [timeframe, setTimeframe] = useState<'7days' | '30days'>('7days');
  
  const dates = useMemo(() => {
    return timeframe === '7days' ? getLastNDays(7) : getLastNDays(30);
  }, [timeframe]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-extrabold">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-2 text-base font-medium">View your activity trends</p>
      </div>

      <div className="flex gap-3">
        <AppButton
          variant={timeframe === '7days' ? 'default' : 'outline'}
          onClick={() => setTimeframe('7days')}
        >
          Last 7 days
        </AppButton>
        <AppButton
          variant={timeframe === '30days' ? 'default' : 'outline'}
          onClick={() => setTimeframe('30days')}
        >
          Last 30 days
        </AppButton>
      </div>

      <div className="space-y-8">
        <FinanceTrends dates={dates} />
        <FinancePercentageBreakdown dates={dates} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <IncomeOnlyChart dates={dates} />
          <ExpenseOnlyChart dates={dates} />
        </div>
        <InvestmentsOnlyChart dates={dates} />
        <HabitsTrends dates={dates} />
        <TimeSpentChart dates={dates} />
      </div>
    </div>
  );
}

function FinanceTrends({ dates }: { dates: string[] }) {
  const isMobile = useIsMobile();
  const { data: financeMap } = useGetFinancesForDates(dates);
  
  const chartData = useMemo(() => {
    if (!financeMap) return [];
    
    return dates.map((date) => {
      const finances = financeMap.get(date) || [];
      const income = finances
        .filter((f) => f.financeType === FinanceType.income)
        .reduce((sum, f) => sum + Number(f.amount), 0) / 100;
      const expense = finances
        .filter((f) => f.financeType === FinanceType.expense)
        .reduce((sum, f) => sum + Number(f.amount), 0) / 100;
      const investment = finances
        .filter((f) => f.financeType === FinanceType.investment)
        .reduce((sum, f) => sum + Number(f.amount), 0) / 100;
      
      const parsedDate = parseLocalDate(date);
      const dateLabel = dates.length > 7 
        ? parsedDate.getDate().toString()
        : parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      return {
        date: dateLabel,
        isoDate: date,
        income,
        expense,
        investment,
        net: income - expense - investment,
      };
    });
  }, [dates, financeMap]);

  const chartMargin = isMobile 
    ? { top: 5, right: 5, bottom: 5, left: 0 }
    : { top: 5, right: 30, bottom: 5, left: 20 };

  return (
    <Card className="dashboard-card dashboard-card-finance">
      <CardHeader>
        <CardTitle className="text-2xl font-extrabold">Finance Trends</CardTitle>
      </CardHeader>
      <CardContent className={isMobile ? 'px-1' : 'px-6'}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={chartMargin}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="oklch(var(--muted-foreground))"
              angle={dates.length > 7 ? 0 : -45}
              textAnchor={dates.length > 7 ? 'middle' : 'end'}
              height={dates.length > 7 ? 30 : 60}
              interval={0}
              tick={{ fontSize: dates.length > 7 ? 11 : 12, fontWeight: 600 }}
            />
            <YAxis 
              stroke="oklch(var(--muted-foreground))" 
              width={isMobile ? 35 : 60}
              tick={{ fontSize: isMobile ? 10 : 12, fontWeight: 600 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(var(--card))',
                border: '1px solid oklch(var(--border))',
                borderRadius: '12px',
                fontWeight: 600,
              }}
              formatter={(value: number) => `$${value.toFixed(2)}`}
            />
            <Legend wrapperStyle={{ fontSize: isMobile ? '11px' : '14px', fontWeight: 600 }} />
            <Line type="monotone" dataKey="net" stroke="oklch(var(--chart-3))" strokeWidth={3} name="Net Balance" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function FinancePercentageBreakdown({ dates }: { dates: string[] }) {
  const { data: financeMap } = useGetFinancesForDates(dates);

  const { incomeTotal, expenseTotal, investmentTotal, total, incomePercent, expensePercent, investmentPercent } = useMemo(() => {
    if (!financeMap) {
      return {
        incomeTotal: 0,
        expenseTotal: 0,
        investmentTotal: 0,
        total: 0,
        incomePercent: 0,
        expensePercent: 0,
        investmentPercent: 0,
      };
    }

    let incomeTotal = 0;
    let expenseTotal = 0;
    let investmentTotal = 0;

    dates.forEach((date) => {
      const finances = financeMap.get(date) || [];
      finances.forEach((f) => {
        const amount = Math.abs(Number(f.amount));
        if (f.financeType === FinanceType.income) {
          incomeTotal += amount;
        } else if (f.financeType === FinanceType.expense) {
          expenseTotal += amount;
        } else if (f.financeType === FinanceType.investment) {
          investmentTotal += amount;
        }
      });
    });

    const total = incomeTotal + expenseTotal + investmentTotal;
    const incomePercent = total > 0 ? Math.round((incomeTotal / total) * 100) : 0;
    const expensePercent = total > 0 ? Math.round((expenseTotal / total) * 100) : 0;
    const investmentPercent = total > 0 ? Math.round((investmentTotal / total) * 100) : 0;

    return {
      incomeTotal: incomeTotal / 100,
      expenseTotal: expenseTotal / 100,
      investmentTotal: investmentTotal / 100,
      total: total / 100,
      incomePercent,
      expensePercent,
      investmentPercent,
    };
  }, [dates, financeMap]);

  return (
    <Card className="dashboard-card dashboard-card-finance">
      <CardHeader>
        <CardTitle className="text-2xl font-extrabold">Finance Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {total > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-green-500/40 bg-green-500/8 transition-all hover:scale-105 hover:shadow-lg">
              <div className="metric-number text-green-600 dark:text-green-400">{incomePercent}%</div>
              <div className="text-base font-semibold text-muted-foreground mt-2">Income</div>
              <div className="text-sm font-medium text-muted-foreground mt-1">${incomeTotal.toFixed(2)}</div>
            </div>
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-orange-500/40 bg-orange-500/8 transition-all hover:scale-105 hover:shadow-lg">
              <div className="metric-number text-orange-600 dark:text-orange-400">{expensePercent}%</div>
              <div className="text-base font-semibold text-muted-foreground mt-2">Expenses</div>
              <div className="text-sm font-medium text-muted-foreground mt-1">${expenseTotal.toFixed(2)}</div>
            </div>
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-purple-500/40 bg-purple-500/8 transition-all hover:scale-105 hover:shadow-lg">
              <div className="metric-number text-purple-600 dark:text-purple-400">{investmentPercent}%</div>
              <div className="text-base font-semibold text-muted-foreground mt-2">Investments</div>
              <div className="text-sm font-medium text-muted-foreground mt-1">${investmentTotal.toFixed(2)}</div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8 font-medium">No finance data available for the selected period</p>
        )}
      </CardContent>
    </Card>
  );
}

function IncomeOnlyChart({ dates }: { dates: string[] }) {
  const { data: financeMap } = useGetFinancesForDates(dates);

  const chartData = useMemo(() => {
    if (!financeMap) return [];
    
    return dates.map((date) => {
      const finances = financeMap.get(date) || [];
      const income = finances
        .filter((f) => f.financeType === FinanceType.income)
        .reduce((sum, f) => sum + Number(f.amount), 0) / 100;
      
      const parsedDate = parseLocalDate(date);
      const dateLabel = dates.length > 7 
        ? parsedDate.getDate().toString()
        : parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      return {
        date: dateLabel,
        isoDate: date,
        income,
      };
    });
  }, [dates, financeMap]);

  return (
    <Card className="dashboard-card dashboard-card-finance">
      <CardHeader>
        <CardTitle className="text-2xl font-extrabold">Income Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="oklch(var(--muted-foreground))"
              angle={dates.length > 7 ? 0 : -45}
              textAnchor={dates.length > 7 ? 'middle' : 'end'}
              height={dates.length > 7 ? 30 : 60}
              interval={0}
              tick={{ fontSize: dates.length > 7 ? 11 : 12, fontWeight: 600 }}
            />
            <YAxis stroke="oklch(var(--muted-foreground))" tick={{ fontWeight: 600 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(var(--card))',
                border: '1px solid oklch(var(--border))',
                borderRadius: '12px',
                fontWeight: 600,
              }}
              formatter={(value: number) => `$${value.toFixed(2)}`}
            />
            <Legend wrapperStyle={{ fontWeight: 600 }} />
            <Line type="monotone" dataKey="income" stroke="oklch(0.75 0.19 142)" strokeWidth={3} name="Income" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ExpenseOnlyChart({ dates }: { dates: string[] }) {
  const { data: financeMap } = useGetFinancesForDates(dates);

  const chartData = useMemo(() => {
    if (!financeMap) return [];
    
    return dates.map((date) => {
      const finances = financeMap.get(date) || [];
      const expense = finances
        .filter((f) => f.financeType === FinanceType.expense)
        .reduce((sum, f) => sum + Number(f.amount), 0) / 100;
      
      const parsedDate = parseLocalDate(date);
      const dateLabel = dates.length > 7 
        ? parsedDate.getDate().toString()
        : parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      return {
        date: dateLabel,
        isoDate: date,
        expense,
      };
    });
  }, [dates, financeMap]);

  return (
    <Card className="dashboard-card dashboard-card-finance">
      <CardHeader>
        <CardTitle className="text-2xl font-extrabold">Expense Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="oklch(var(--muted-foreground))"
              angle={dates.length > 7 ? 0 : -45}
              textAnchor={dates.length > 7 ? 'middle' : 'end'}
              height={dates.length > 7 ? 30 : 60}
              interval={0}
              tick={{ fontSize: dates.length > 7 ? 11 : 12, fontWeight: 600 }}
            />
            <YAxis stroke="oklch(var(--muted-foreground))" tick={{ fontWeight: 600 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(var(--card))',
                border: '1px solid oklch(var(--border))',
                borderRadius: '12px',
                fontWeight: 600,
              }}
              formatter={(value: number) => `$${value.toFixed(2)}`}
            />
            <Legend wrapperStyle={{ fontWeight: 600 }} />
            <Line type="monotone" dataKey="expense" stroke="oklch(0.65 0.22 41)" strokeWidth={3} name="Expenses" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function InvestmentsOnlyChart({ dates }: { dates: string[] }) {
  const { data: financeMap } = useGetFinancesForDates(dates);

  const chartData = useMemo(() => {
    if (!financeMap) return [];
    
    return dates.map((date) => {
      const finances = financeMap.get(date) || [];
      const investment = finances
        .filter((f) => f.financeType === FinanceType.investment)
        .reduce((sum, f) => sum + Number(f.amount), 0) / 100;
      
      const parsedDate = parseLocalDate(date);
      const dateLabel = dates.length > 7 
        ? parsedDate.getDate().toString()
        : parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      return {
        date: dateLabel,
        isoDate: date,
        investment,
      };
    });
  }, [dates, financeMap]);

  return (
    <Card className="dashboard-card dashboard-card-finance">
      <CardHeader>
        <CardTitle className="text-2xl font-extrabold">Investment Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="oklch(var(--muted-foreground))"
              angle={dates.length > 7 ? 0 : -45}
              textAnchor={dates.length > 7 ? 'middle' : 'end'}
              height={dates.length > 7 ? 30 : 60}
              interval={0}
              tick={{ fontSize: dates.length > 7 ? 11 : 12, fontWeight: 600 }}
            />
            <YAxis stroke="oklch(var(--muted-foreground))" tick={{ fontWeight: 600 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(var(--card))',
                border: '1px solid oklch(var(--border))',
                borderRadius: '12px',
                fontWeight: 600,
              }}
              formatter={(value: number) => `$${value.toFixed(2)}`}
            />
            <Legend wrapperStyle={{ fontWeight: 600 }} />
            <Line type="monotone" dataKey="investment" stroke="oklch(0.60 0.20 270)" strokeWidth={3} name="Investments" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function HabitsTrends({ dates }: { dates: string[] }) {
  const isMobile = useIsMobile();
  const { data: habitMap } = useGetHabitsForDates(dates);
  
  const chartData = useMemo(() => {
    if (!habitMap) return [];
    
    return dates.map((date) => {
      const habits = habitMap.get(date) || [];
      const completed = habits.filter((h) => h.isCompleted).length;
      const total = habits.length;
      const rate = total > 0 ? (completed / total) * 100 : 0;
      
      const parsedDate = parseLocalDate(date);
      const dateLabel = dates.length > 7 
        ? parsedDate.getDate().toString()
        : parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      return {
        date: dateLabel,
        isoDate: date,
        rate: Math.round(rate),
      };
    });
  }, [dates, habitMap]);

  const chartMargin = isMobile 
    ? { top: 5, right: 5, bottom: 5, left: 0 }
    : { top: 5, right: 30, bottom: 5, left: 20 };

  return (
    <Card className="dashboard-card dashboard-card-habits">
      <CardHeader>
        <CardTitle className="text-2xl font-extrabold">Habits Completion</CardTitle>
      </CardHeader>
      <CardContent className={isMobile ? 'px-1' : 'px-6'}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={chartMargin}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="oklch(var(--muted-foreground))"
              angle={dates.length > 7 ? 0 : -45}
              textAnchor={dates.length > 7 ? 'middle' : 'end'}
              height={dates.length > 7 ? 30 : 60}
              interval={0}
              tick={{ fontSize: dates.length > 7 ? 11 : 12, fontWeight: 600 }}
            />
            <YAxis 
              stroke="oklch(var(--muted-foreground))" 
              domain={[0, 100]} 
              width={isMobile ? 35 : 60}
              tick={{ fontSize: isMobile ? 10 : 12, fontWeight: 600 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(var(--card))',
                border: '1px solid oklch(var(--border))',
                borderRadius: '12px',
                fontWeight: 600,
              }}
              formatter={(value: number) => `${value}%`}
            />
            <Legend wrapperStyle={{ fontSize: isMobile ? '11px' : '14px', fontWeight: 600 }} />
            <Line type="monotone" dataKey="rate" stroke="oklch(var(--chart-2))" strokeWidth={3} name="Completion Rate (%)" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function TimeSpentChart({ dates }: { dates: string[] }) {
  const { data: activityMap } = useGetActivitiesForDates(dates);
  
  const chartData = useMemo(() => {
    if (!activityMap) return [];
    
    const activityTotals: Record<string, number> = {};
    
    dates.forEach((date) => {
      const activities = activityMap.get(date) || [];
      activities.forEach((activity) => {
        const duration = activity.duration ? Number(activity.duration) : 0;
        const name = activity.name;
        activityTotals[name] = (activityTotals[name] || 0) + duration;
      });
    });

    return Object.entries(activityTotals)
      .map(([name, value]) => ({
        name,
        value: Math.round(value / 60 * 10) / 10,
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [dates, activityMap]);

  const COLORS = [
    'oklch(var(--chart-1))',
    'oklch(var(--chart-2))',
    'oklch(var(--chart-3))',
    'oklch(var(--chart-4))',
    'oklch(var(--chart-5))',
  ];

  return (
    <Card className="dashboard-card dashboard-card-overview">
      <CardHeader>
        <CardTitle className="text-2xl font-extrabold">Time Spent by Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}h`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value} hours`} contentStyle={{ fontWeight: 600, borderRadius: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-center py-8 font-medium">No activity data available</p>
        )}
      </CardContent>
    </Card>
  );
}
