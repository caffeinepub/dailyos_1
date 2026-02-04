import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import AppButton from '../AppButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { useGetHabitsByDate, useCreateHabit, useUpdateHabit, useDeleteHabit } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { toast } from 'sonner';

interface HabitsSectionProps {
  selectedDate: string;
}

export default function HabitsSection({ selectedDate }: HabitsSectionProps) {
  const { identity } = useInternetIdentity();
  const { data: habits = [], isLoading } = useGetHabitsByDate(selectedDate);
  const { mutate: createHabit, isPending: isCreating } = useCreateHabit();
  const { mutate: updateHabit } = useUpdateHabit();
  const { mutate: deleteHabit } = useDeleteHabit();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error('Please log in to create habits.');
      return;
    }

    const habit = {
      name: formData.name,
      description: formData.description,
      date: selectedDate,
      isCompleted: false,
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
    };

    createHabit(habit, {
      onSuccess: () => {
        setOpen(false);
        setFormData({ name: '', description: '' });
      },
    });
  };

  const handleToggle = (habit: any) => {
    if (!identity) {
      toast.error('Please log in to update habits.');
      return;
    }
    updateHabit({
      ...habit,
      isCompleted: !habit.isCompleted,
      updatedAt: BigInt(Date.now()),
    });
  };

  const handleDelete = (habitId: bigint) => {
    if (!identity) {
      toast.error('Please log in to delete habits.');
      return;
    }
    deleteHabit({ habitId, date: selectedDate });
  };

  const completed = habits.filter((h) => h.isCompleted).length;
  const notCompleted = habits.length - completed;

  const chartData = [
    { name: 'Completed', value: completed, color: 'oklch(var(--chart-4))' },
    { name: 'Not Completed', value: notCompleted, color: 'oklch(var(--chart-1))' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="dashboard-card dashboard-card-habits">
          <CardHeader>
            <CardTitle className="text-lg">Progress</CardTitle>
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
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No habits for this day</p>
            )}
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-3xl font-bold">
                {habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card dashboard-card-habits">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Daily Habits</CardTitle>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <AppButton size="sm" disabled={!identity}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </AppButton>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Habit</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Habit Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <AppButton type="submit" className="w-full" disabled={isCreating}>
                      {isCreating ? 'Adding...' : 'Add Habit'}
                    </AppButton>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : habits.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No habits</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {habits.map((habit) => (
                  <div
                    key={Number(habit.habitId)}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        checked={habit.isCompleted}
                        onCheckedChange={() => handleToggle(habit)}
                        disabled={!identity}
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${habit.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                          {habit.name}
                        </p>
                        {habit.description && (
                          <p className="text-xs text-muted-foreground">{habit.description}</p>
                        )}
                      </div>
                    </div>
                    {identity && (
                      <AppButton
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(habit.habitId)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </AppButton>
                    )}
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
