import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import AppButton from './AppButton';
import { useGetActivitiesByDate, useGetFinancesByDate, useGetHabitsByDate } from '../hooks/useQueries';
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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-1">View your activity trends</p>
      </div>

      <div className="flex gap-2">
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

      <div className="space-y-6">
        <FinanceTrends dates={dates} />
        <FinancePercentageBreakdown dates={dates} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
  
  // Call all hooks at the top level
  const finance0 = useGetFinancesByDate(dates[0] || '');
  const finance1 = useGetFinancesByDate(dates[1] || '');
  const finance2 = useGetFinancesByDate(dates[2] || '');
  const finance3 = useGetFinancesByDate(dates[3] || '');
  const finance4 = useGetFinancesByDate(dates[4] || '');
  const finance5 = useGetFinancesByDate(dates[5] || '');
  const finance6 = useGetFinancesByDate(dates[6] || '');
  const finance7 = useGetFinancesByDate(dates[7] || '');
  const finance8 = useGetFinancesByDate(dates[8] || '');
  const finance9 = useGetFinancesByDate(dates[9] || '');
  const finance10 = useGetFinancesByDate(dates[10] || '');
  const finance11 = useGetFinancesByDate(dates[11] || '');
  const finance12 = useGetFinancesByDate(dates[12] || '');
  const finance13 = useGetFinancesByDate(dates[13] || '');
  const finance14 = useGetFinancesByDate(dates[14] || '');
  const finance15 = useGetFinancesByDate(dates[15] || '');
  const finance16 = useGetFinancesByDate(dates[16] || '');
  const finance17 = useGetFinancesByDate(dates[17] || '');
  const finance18 = useGetFinancesByDate(dates[18] || '');
  const finance19 = useGetFinancesByDate(dates[19] || '');
  const finance20 = useGetFinancesByDate(dates[20] || '');
  const finance21 = useGetFinancesByDate(dates[21] || '');
  const finance22 = useGetFinancesByDate(dates[22] || '');
  const finance23 = useGetFinancesByDate(dates[23] || '');
  const finance24 = useGetFinancesByDate(dates[24] || '');
  const finance25 = useGetFinancesByDate(dates[25] || '');
  const finance26 = useGetFinancesByDate(dates[26] || '');
  const finance27 = useGetFinancesByDate(dates[27] || '');
  const finance28 = useGetFinancesByDate(dates[28] || '');
  const finance29 = useGetFinancesByDate(dates[29] || '');
  const finance30 = useGetFinancesByDate(dates[30] || '');

  const financeQueries = [
    finance0, finance1, finance2, finance3, finance4, finance5, finance6,
    finance7, finance8, finance9, finance10, finance11, finance12, finance13,
    finance14, finance15, finance16, finance17, finance18, finance19, finance20,
    finance21, finance22, finance23, finance24, finance25, finance26, finance27,
    finance28, finance29, finance30
  ];
  
  const chartData = useMemo(() => {
    return dates.map((date, index) => {
      const finances = financeQueries[index]?.data || [];
      const income = finances
        .filter((f) => f.financeType === FinanceType.income)
        .reduce((sum, f) => sum + Number(f.amount), 0) / 100;
      const expense = finances
        .filter((f) => f.financeType === FinanceType.expense)
        .reduce((sum, f) => sum + Number(f.amount), 0) / 100;
      const investment = finances
        .filter((f) => f.financeType === FinanceType.investment)
        .reduce((sum, f) => sum + Number(f.amount), 0) / 100;
      
      // For 30-day view, show day number only; for 7-day view, show month + day
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
  }, [dates, financeQueries]);

  // Mobile-specific chart margins to maximize width
  const chartMargin = isMobile 
    ? { top: 5, right: 5, bottom: 5, left: 0 }
    : { top: 5, right: 30, bottom: 5, left: 20 };

  return (
    <Card className="dashboard-card dashboard-card-finance">
      <CardHeader>
        <CardTitle>Finance Trends</CardTitle>
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
              tick={{ fontSize: dates.length > 7 ? 11 : 12 }}
            />
            <YAxis 
              stroke="oklch(var(--muted-foreground))" 
              width={isMobile ? 35 : 60}
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(var(--card))',
                border: '1px solid oklch(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => `$${value.toFixed(2)}`}
            />
            <Legend wrapperStyle={{ fontSize: isMobile ? '11px' : '14px' }} />
            <Line type="monotone" dataKey="net" stroke="oklch(var(--chart-3))" strokeWidth={2} name="Net Balance" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function FinancePercentageBreakdown({ dates }: { dates: string[] }) {
  // Call all hooks at the top level
  const finance0 = useGetFinancesByDate(dates[0] || '');
  const finance1 = useGetFinancesByDate(dates[1] || '');
  const finance2 = useGetFinancesByDate(dates[2] || '');
  const finance3 = useGetFinancesByDate(dates[3] || '');
  const finance4 = useGetFinancesByDate(dates[4] || '');
  const finance5 = useGetFinancesByDate(dates[5] || '');
  const finance6 = useGetFinancesByDate(dates[6] || '');
  const finance7 = useGetFinancesByDate(dates[7] || '');
  const finance8 = useGetFinancesByDate(dates[8] || '');
  const finance9 = useGetFinancesByDate(dates[9] || '');
  const finance10 = useGetFinancesByDate(dates[10] || '');
  const finance11 = useGetFinancesByDate(dates[11] || '');
  const finance12 = useGetFinancesByDate(dates[12] || '');
  const finance13 = useGetFinancesByDate(dates[13] || '');
  const finance14 = useGetFinancesByDate(dates[14] || '');
  const finance15 = useGetFinancesByDate(dates[15] || '');
  const finance16 = useGetFinancesByDate(dates[16] || '');
  const finance17 = useGetFinancesByDate(dates[17] || '');
  const finance18 = useGetFinancesByDate(dates[18] || '');
  const finance19 = useGetFinancesByDate(dates[19] || '');
  const finance20 = useGetFinancesByDate(dates[20] || '');
  const finance21 = useGetFinancesByDate(dates[21] || '');
  const finance22 = useGetFinancesByDate(dates[22] || '');
  const finance23 = useGetFinancesByDate(dates[23] || '');
  const finance24 = useGetFinancesByDate(dates[24] || '');
  const finance25 = useGetFinancesByDate(dates[25] || '');
  const finance26 = useGetFinancesByDate(dates[26] || '');
  const finance27 = useGetFinancesByDate(dates[27] || '');
  const finance28 = useGetFinancesByDate(dates[28] || '');
  const finance29 = useGetFinancesByDate(dates[29] || '');
  const finance30 = useGetFinancesByDate(dates[30] || '');

  const financeQueries = [
    finance0, finance1, finance2, finance3, finance4, finance5, finance6,
    finance7, finance8, finance9, finance10, finance11, finance12, finance13,
    finance14, finance15, finance16, finance17, finance18, finance19, finance20,
    finance21, finance22, finance23, finance24, finance25, finance26, finance27,
    finance28, finance29, finance30
  ];

  const { incomeTotal, expenseTotal, investmentTotal, total, incomePercent, expensePercent, investmentPercent } = useMemo(() => {
    let incomeTotal = 0;
    let expenseTotal = 0;
    let investmentTotal = 0;

    dates.forEach((_, index) => {
      const finances = financeQueries[index]?.data || [];
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
  }, [dates, financeQueries]);

  return (
    <Card className="dashboard-card dashboard-card-finance">
      <CardHeader>
        <CardTitle>Finance Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {total > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-green-500/30 bg-green-500/5">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{incomePercent}%</div>
              <div className="text-sm text-muted-foreground mt-1">Income</div>
              <div className="text-xs text-muted-foreground mt-1">${incomeTotal.toFixed(2)}</div>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-orange-500/30 bg-orange-500/5">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{expensePercent}%</div>
              <div className="text-sm text-muted-foreground mt-1">Expenses</div>
              <div className="text-xs text-muted-foreground mt-1">${expenseTotal.toFixed(2)}</div>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-purple-500/30 bg-purple-500/5">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{investmentPercent}%</div>
              <div className="text-sm text-muted-foreground mt-1">Investments</div>
              <div className="text-xs text-muted-foreground mt-1">${investmentTotal.toFixed(2)}</div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No finance data available for the selected period</p>
        )}
      </CardContent>
    </Card>
  );
}

function IncomeOnlyChart({ dates }: { dates: string[] }) {
  // Call all hooks at the top level
  const finance0 = useGetFinancesByDate(dates[0] || '');
  const finance1 = useGetFinancesByDate(dates[1] || '');
  const finance2 = useGetFinancesByDate(dates[2] || '');
  const finance3 = useGetFinancesByDate(dates[3] || '');
  const finance4 = useGetFinancesByDate(dates[4] || '');
  const finance5 = useGetFinancesByDate(dates[5] || '');
  const finance6 = useGetFinancesByDate(dates[6] || '');
  const finance7 = useGetFinancesByDate(dates[7] || '');
  const finance8 = useGetFinancesByDate(dates[8] || '');
  const finance9 = useGetFinancesByDate(dates[9] || '');
  const finance10 = useGetFinancesByDate(dates[10] || '');
  const finance11 = useGetFinancesByDate(dates[11] || '');
  const finance12 = useGetFinancesByDate(dates[12] || '');
  const finance13 = useGetFinancesByDate(dates[13] || '');
  const finance14 = useGetFinancesByDate(dates[14] || '');
  const finance15 = useGetFinancesByDate(dates[15] || '');
  const finance16 = useGetFinancesByDate(dates[16] || '');
  const finance17 = useGetFinancesByDate(dates[17] || '');
  const finance18 = useGetFinancesByDate(dates[18] || '');
  const finance19 = useGetFinancesByDate(dates[19] || '');
  const finance20 = useGetFinancesByDate(dates[20] || '');
  const finance21 = useGetFinancesByDate(dates[21] || '');
  const finance22 = useGetFinancesByDate(dates[22] || '');
  const finance23 = useGetFinancesByDate(dates[23] || '');
  const finance24 = useGetFinancesByDate(dates[24] || '');
  const finance25 = useGetFinancesByDate(dates[25] || '');
  const finance26 = useGetFinancesByDate(dates[26] || '');
  const finance27 = useGetFinancesByDate(dates[27] || '');
  const finance28 = useGetFinancesByDate(dates[28] || '');
  const finance29 = useGetFinancesByDate(dates[29] || '');
  const finance30 = useGetFinancesByDate(dates[30] || '');

  const financeQueries = [
    finance0, finance1, finance2, finance3, finance4, finance5, finance6,
    finance7, finance8, finance9, finance10, finance11, finance12, finance13,
    finance14, finance15, finance16, finance17, finance18, finance19, finance20,
    finance21, finance22, finance23, finance24, finance25, finance26, finance27,
    finance28, finance29, finance30
  ];

  const chartData = useMemo(() => {
    return dates.map((date, index) => {
      const finances = financeQueries[index]?.data || [];
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
  }, [dates, financeQueries]);

  return (
    <Card className="dashboard-card dashboard-card-finance">
      <CardHeader>
        <CardTitle>Income Trend</CardTitle>
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
              tick={{ fontSize: dates.length > 7 ? 11 : 12 }}
            />
            <YAxis stroke="oklch(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(var(--card))',
                border: '1px solid oklch(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => `$${value.toFixed(2)}`}
            />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="oklch(0.75 0.19 142)" strokeWidth={2} name="Income" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ExpenseOnlyChart({ dates }: { dates: string[] }) {
  // Call all hooks at the top level
  const finance0 = useGetFinancesByDate(dates[0] || '');
  const finance1 = useGetFinancesByDate(dates[1] || '');
  const finance2 = useGetFinancesByDate(dates[2] || '');
  const finance3 = useGetFinancesByDate(dates[3] || '');
  const finance4 = useGetFinancesByDate(dates[4] || '');
  const finance5 = useGetFinancesByDate(dates[5] || '');
  const finance6 = useGetFinancesByDate(dates[6] || '');
  const finance7 = useGetFinancesByDate(dates[7] || '');
  const finance8 = useGetFinancesByDate(dates[8] || '');
  const finance9 = useGetFinancesByDate(dates[9] || '');
  const finance10 = useGetFinancesByDate(dates[10] || '');
  const finance11 = useGetFinancesByDate(dates[11] || '');
  const finance12 = useGetFinancesByDate(dates[12] || '');
  const finance13 = useGetFinancesByDate(dates[13] || '');
  const finance14 = useGetFinancesByDate(dates[14] || '');
  const finance15 = useGetFinancesByDate(dates[15] || '');
  const finance16 = useGetFinancesByDate(dates[16] || '');
  const finance17 = useGetFinancesByDate(dates[17] || '');
  const finance18 = useGetFinancesByDate(dates[18] || '');
  const finance19 = useGetFinancesByDate(dates[19] || '');
  const finance20 = useGetFinancesByDate(dates[20] || '');
  const finance21 = useGetFinancesByDate(dates[21] || '');
  const finance22 = useGetFinancesByDate(dates[22] || '');
  const finance23 = useGetFinancesByDate(dates[23] || '');
  const finance24 = useGetFinancesByDate(dates[24] || '');
  const finance25 = useGetFinancesByDate(dates[25] || '');
  const finance26 = useGetFinancesByDate(dates[26] || '');
  const finance27 = useGetFinancesByDate(dates[27] || '');
  const finance28 = useGetFinancesByDate(dates[28] || '');
  const finance29 = useGetFinancesByDate(dates[29] || '');
  const finance30 = useGetFinancesByDate(dates[30] || '');

  const financeQueries = [
    finance0, finance1, finance2, finance3, finance4, finance5, finance6,
    finance7, finance8, finance9, finance10, finance11, finance12, finance13,
    finance14, finance15, finance16, finance17, finance18, finance19, finance20,
    finance21, finance22, finance23, finance24, finance25, finance26, finance27,
    finance28, finance29, finance30
  ];

  const chartData = useMemo(() => {
    return dates.map((date, index) => {
      const finances = financeQueries[index]?.data || [];
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
  }, [dates, financeQueries]);

  return (
    <Card className="dashboard-card dashboard-card-finance">
      <CardHeader>
        <CardTitle>Expense Trend</CardTitle>
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
              tick={{ fontSize: dates.length > 7 ? 11 : 12 }}
            />
            <YAxis stroke="oklch(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(var(--card))',
                border: '1px solid oklch(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => `$${value.toFixed(2)}`}
            />
            <Legend />
            <Line type="monotone" dataKey="expense" stroke="oklch(0.65 0.22 41)" strokeWidth={2} name="Expenses" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function InvestmentsOnlyChart({ dates }: { dates: string[] }) {
  // Call all hooks at the top level
  const finance0 = useGetFinancesByDate(dates[0] || '');
  const finance1 = useGetFinancesByDate(dates[1] || '');
  const finance2 = useGetFinancesByDate(dates[2] || '');
  const finance3 = useGetFinancesByDate(dates[3] || '');
  const finance4 = useGetFinancesByDate(dates[4] || '');
  const finance5 = useGetFinancesByDate(dates[5] || '');
  const finance6 = useGetFinancesByDate(dates[6] || '');
  const finance7 = useGetFinancesByDate(dates[7] || '');
  const finance8 = useGetFinancesByDate(dates[8] || '');
  const finance9 = useGetFinancesByDate(dates[9] || '');
  const finance10 = useGetFinancesByDate(dates[10] || '');
  const finance11 = useGetFinancesByDate(dates[11] || '');
  const finance12 = useGetFinancesByDate(dates[12] || '');
  const finance13 = useGetFinancesByDate(dates[13] || '');
  const finance14 = useGetFinancesByDate(dates[14] || '');
  const finance15 = useGetFinancesByDate(dates[15] || '');
  const finance16 = useGetFinancesByDate(dates[16] || '');
  const finance17 = useGetFinancesByDate(dates[17] || '');
  const finance18 = useGetFinancesByDate(dates[18] || '');
  const finance19 = useGetFinancesByDate(dates[19] || '');
  const finance20 = useGetFinancesByDate(dates[20] || '');
  const finance21 = useGetFinancesByDate(dates[21] || '');
  const finance22 = useGetFinancesByDate(dates[22] || '');
  const finance23 = useGetFinancesByDate(dates[23] || '');
  const finance24 = useGetFinancesByDate(dates[24] || '');
  const finance25 = useGetFinancesByDate(dates[25] || '');
  const finance26 = useGetFinancesByDate(dates[26] || '');
  const finance27 = useGetFinancesByDate(dates[27] || '');
  const finance28 = useGetFinancesByDate(dates[28] || '');
  const finance29 = useGetFinancesByDate(dates[29] || '');
  const finance30 = useGetFinancesByDate(dates[30] || '');

  const financeQueries = [
    finance0, finance1, finance2, finance3, finance4, finance5, finance6,
    finance7, finance8, finance9, finance10, finance11, finance12, finance13,
    finance14, finance15, finance16, finance17, finance18, finance19, finance20,
    finance21, finance22, finance23, finance24, finance25, finance26, finance27,
    finance28, finance29, finance30
  ];

  const chartData = useMemo(() => {
    return dates.map((date, index) => {
      const finances = financeQueries[index]?.data || [];
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
  }, [dates, financeQueries]);

  return (
    <Card className="dashboard-card dashboard-card-finance">
      <CardHeader>
        <CardTitle>Investment Trend</CardTitle>
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
              tick={{ fontSize: dates.length > 7 ? 11 : 12 }}
            />
            <YAxis stroke="oklch(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(var(--card))',
                border: '1px solid oklch(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => `$${value.toFixed(2)}`}
            />
            <Legend />
            <Line type="monotone" dataKey="investment" stroke="oklch(0.60 0.20 270)" strokeWidth={2} name="Investments" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function HabitsTrends({ dates }: { dates: string[] }) {
  const isMobile = useIsMobile();
  
  // Call all hooks at the top level
  const habits0 = useGetHabitsByDate(dates[0] || '');
  const habits1 = useGetHabitsByDate(dates[1] || '');
  const habits2 = useGetHabitsByDate(dates[2] || '');
  const habits3 = useGetHabitsByDate(dates[3] || '');
  const habits4 = useGetHabitsByDate(dates[4] || '');
  const habits5 = useGetHabitsByDate(dates[5] || '');
  const habits6 = useGetHabitsByDate(dates[6] || '');
  const habits7 = useGetHabitsByDate(dates[7] || '');
  const habits8 = useGetHabitsByDate(dates[8] || '');
  const habits9 = useGetHabitsByDate(dates[9] || '');
  const habits10 = useGetHabitsByDate(dates[10] || '');
  const habits11 = useGetHabitsByDate(dates[11] || '');
  const habits12 = useGetHabitsByDate(dates[12] || '');
  const habits13 = useGetHabitsByDate(dates[13] || '');
  const habits14 = useGetHabitsByDate(dates[14] || '');
  const habits15 = useGetHabitsByDate(dates[15] || '');
  const habits16 = useGetHabitsByDate(dates[16] || '');
  const habits17 = useGetHabitsByDate(dates[17] || '');
  const habits18 = useGetHabitsByDate(dates[18] || '');
  const habits19 = useGetHabitsByDate(dates[19] || '');
  const habits20 = useGetHabitsByDate(dates[20] || '');
  const habits21 = useGetHabitsByDate(dates[21] || '');
  const habits22 = useGetHabitsByDate(dates[22] || '');
  const habits23 = useGetHabitsByDate(dates[23] || '');
  const habits24 = useGetHabitsByDate(dates[24] || '');
  const habits25 = useGetHabitsByDate(dates[25] || '');
  const habits26 = useGetHabitsByDate(dates[26] || '');
  const habits27 = useGetHabitsByDate(dates[27] || '');
  const habits28 = useGetHabitsByDate(dates[28] || '');
  const habits29 = useGetHabitsByDate(dates[29] || '');
  const habits30 = useGetHabitsByDate(dates[30] || '');

  const habitsQueries = [
    habits0, habits1, habits2, habits3, habits4, habits5, habits6,
    habits7, habits8, habits9, habits10, habits11, habits12, habits13,
    habits14, habits15, habits16, habits17, habits18, habits19, habits20,
    habits21, habits22, habits23, habits24, habits25, habits26, habits27,
    habits28, habits29, habits30
  ];
  
  const chartData = useMemo(() => {
    return dates.map((date, index) => {
      const habits = habitsQueries[index]?.data || [];
      const completed = habits.filter((h) => h.isCompleted).length;
      const total = habits.length;
      const rate = total > 0 ? (completed / total) * 100 : 0;
      
      // For 30-day view, show day number only; for 7-day view, show month + day
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
  }, [dates, habitsQueries]);

  // Mobile-specific chart margins to maximize width
  const chartMargin = isMobile 
    ? { top: 5, right: 5, bottom: 5, left: 0 }
    : { top: 5, right: 30, bottom: 5, left: 20 };

  return (
    <Card className="dashboard-card dashboard-card-habits">
      <CardHeader>
        <CardTitle>Habits Completion</CardTitle>
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
              tick={{ fontSize: dates.length > 7 ? 11 : 12 }}
            />
            <YAxis 
              stroke="oklch(var(--muted-foreground))" 
              domain={[0, 100]} 
              width={isMobile ? 35 : 60}
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(var(--card))',
                border: '1px solid oklch(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => `${value}%`}
            />
            <Legend wrapperStyle={{ fontSize: isMobile ? '11px' : '14px' }} />
            <Line type="monotone" dataKey="rate" stroke="oklch(var(--chart-2))" strokeWidth={2} name="Completion Rate (%)" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function TimeSpentChart({ dates }: { dates: string[] }) {
  // Call all hooks at the top level
  const activities0 = useGetActivitiesByDate(dates[0] || '');
  const activities1 = useGetActivitiesByDate(dates[1] || '');
  const activities2 = useGetActivitiesByDate(dates[2] || '');
  const activities3 = useGetActivitiesByDate(dates[3] || '');
  const activities4 = useGetActivitiesByDate(dates[4] || '');
  const activities5 = useGetActivitiesByDate(dates[5] || '');
  const activities6 = useGetActivitiesByDate(dates[6] || '');
  const activities7 = useGetActivitiesByDate(dates[7] || '');
  const activities8 = useGetActivitiesByDate(dates[8] || '');
  const activities9 = useGetActivitiesByDate(dates[9] || '');
  const activities10 = useGetActivitiesByDate(dates[10] || '');
  const activities11 = useGetActivitiesByDate(dates[11] || '');
  const activities12 = useGetActivitiesByDate(dates[12] || '');
  const activities13 = useGetActivitiesByDate(dates[13] || '');
  const activities14 = useGetActivitiesByDate(dates[14] || '');
  const activities15 = useGetActivitiesByDate(dates[15] || '');
  const activities16 = useGetActivitiesByDate(dates[16] || '');
  const activities17 = useGetActivitiesByDate(dates[17] || '');
  const activities18 = useGetActivitiesByDate(dates[18] || '');
  const activities19 = useGetActivitiesByDate(dates[19] || '');
  const activities20 = useGetActivitiesByDate(dates[20] || '');
  const activities21 = useGetActivitiesByDate(dates[21] || '');
  const activities22 = useGetActivitiesByDate(dates[22] || '');
  const activities23 = useGetActivitiesByDate(dates[23] || '');
  const activities24 = useGetActivitiesByDate(dates[24] || '');
  const activities25 = useGetActivitiesByDate(dates[25] || '');
  const activities26 = useGetActivitiesByDate(dates[26] || '');
  const activities27 = useGetActivitiesByDate(dates[27] || '');
  const activities28 = useGetActivitiesByDate(dates[28] || '');
  const activities29 = useGetActivitiesByDate(dates[29] || '');
  const activities30 = useGetActivitiesByDate(dates[30] || '');

  const activitiesQueries = [
    activities0, activities1, activities2, activities3, activities4, activities5, activities6,
    activities7, activities8, activities9, activities10, activities11, activities12, activities13,
    activities14, activities15, activities16, activities17, activities18, activities19, activities20,
    activities21, activities22, activities23, activities24, activities25, activities26, activities27,
    activities28, activities29, activities30
  ];
  
  const chartData = useMemo(() => {
    const activityTotals: Record<string, number> = {};
    
    dates.forEach((_, index) => {
      const activities = activitiesQueries[index]?.data || [];
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
  }, [dates, activitiesQueries]);

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
        <CardTitle>Time Spent by Activity</CardTitle>
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
              <Tooltip formatter={(value: number) => `${value} hours`} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-center py-8">No activity data available</p>
        )}
      </CardContent>
    </Card>
  );
}
