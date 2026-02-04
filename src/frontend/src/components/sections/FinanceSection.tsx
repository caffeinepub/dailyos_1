import { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import AppButton from '../AppButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useGetFinancesByDate, useCreateFinance, useDeleteFinance } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { FinanceType } from '../../backend';
import { toast } from 'sonner';

interface FinanceSectionProps {
  selectedDate: string;
}

export default function FinanceSection({ selectedDate }: FinanceSectionProps) {
  const { identity } = useInternetIdentity();
  const { data: finances = [], isLoading } = useGetFinancesByDate(selectedDate);
  const { mutate: createFinance, isPending: isCreating } = useCreateFinance();
  const { mutate: deleteFinance } = useDeleteFinance();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    purpose: '',
    financeType: FinanceType.expense,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error('Please log in to create finance entries.');
      return;
    }

    const finance = {
      title: formData.title,
      amount: BigInt(Math.round(parseFloat(formData.amount) * 100)),
      purpose: formData.purpose,
      description: '',
      financeType: formData.financeType,
      date: selectedDate,
      recurring: false,
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
    };

    createFinance(finance, {
      onSuccess: () => {
        setOpen(false);
        setFormData({ title: '', amount: '', purpose: '', financeType: FinanceType.expense });
      },
    });
  };

  const handleDelete = (financeId: bigint) => {
    if (!identity) {
      toast.error('Please log in to delete finance entries.');
      return;
    }
    deleteFinance({ financeId, date: selectedDate });
  };

  const totalIncome = finances
    .filter((f) => f.financeType === FinanceType.income)
    .reduce((sum, f) => sum + Number(f.amount), 0) / 100;

  const totalExpense = finances
    .filter((f) => f.financeType === FinanceType.expense)
    .reduce((sum, f) => sum + Number(f.amount), 0) / 100;

  const totalInvestment = finances
    .filter((f) => f.financeType === FinanceType.investment)
    .reduce((sum, f) => sum + Number(f.amount), 0) / 100;

  const chartData = [
    { name: 'Income', value: totalIncome, color: 'oklch(var(--chart-4))' },
    { name: 'Expense', value: totalExpense, color: 'oklch(var(--chart-1))' },
    { name: 'Investment', value: totalInvestment, color: 'oklch(var(--chart-5))' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="dashboard-card dashboard-card-finance">
          <CardHeader>
            <CardTitle className="text-lg">Daily Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No finance data for this day</p>
            )}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Income</p>
                <p className="text-xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Expense</p>
                <p className="text-xl font-bold text-red-600">${totalExpense.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Investment</p>
                <p className="text-xl font-bold text-blue-600">${totalInvestment.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card dashboard-card-finance">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Transactions</CardTitle>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <AppButton size="sm" disabled={!identity}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </AppButton>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Finance Entry</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="financeType">Type</Label>
                      <Select
                        value={formData.financeType}
                        onValueChange={(value: FinanceType) => setFormData({ ...formData, financeType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={FinanceType.income}>Income</SelectItem>
                          <SelectItem value={FinanceType.expense}>Expense</SelectItem>
                          <SelectItem value={FinanceType.investment}>Investment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purpose">Purpose (Optional)</Label>
                      <Input
                        id="purpose"
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      />
                    </div>
                    <AppButton type="submit" className="w-full" disabled={isCreating}>
                      {isCreating ? 'Adding...' : 'Add Entry'}
                    </AppButton>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : finances.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No transactions</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {finances.map((finance) => (
                  <div
                    key={Number(finance.financeId)}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      {finance.financeType === FinanceType.income ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : finance.financeType === FinanceType.investment ? (
                        <Wallet className="w-5 h-5 text-blue-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">{finance.title}</p>
                        {finance.purpose && (
                          <p className="text-xs text-muted-foreground">{finance.purpose}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold ${
                          finance.financeType === FinanceType.income 
                            ? 'text-green-600' 
                            : finance.financeType === FinanceType.investment
                            ? 'text-blue-600'
                            : 'text-red-600'
                        }`}
                      >
                        ${(Number(finance.amount) / 100).toFixed(2)}
                      </span>
                      {identity && (
                        <AppButton
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(finance.financeId)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </AppButton>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
