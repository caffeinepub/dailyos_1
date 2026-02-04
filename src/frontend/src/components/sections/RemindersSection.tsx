import { useState } from 'react';
import { Plus, Trash2, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import AppButton from '../AppButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useGetRemindersByDate, useCreateReminder, useDeleteReminder } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';

interface RemindersSectionProps {
  selectedDate: string;
}

export default function RemindersSection({ selectedDate }: RemindersSectionProps) {
  const { identity } = useInternetIdentity();
  const { data: reminders = [], isLoading } = useGetRemindersByDate(selectedDate);
  const { mutate: createReminder, isPending: isCreating } = useCreateReminder();
  const { mutate: deleteReminder } = useDeleteReminder();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error('Please log in to create reminders.');
      return;
    }

    const reminder = {
      name: formData.name,
      description: formData.description,
      targetDate: selectedDate,
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
      repeatSchema: undefined,
      colorHex: undefined,
    };

    createReminder(reminder, {
      onSuccess: () => {
        setOpen(false);
        setFormData({ name: '', description: '' });
      },
    });
  };

  const handleDelete = (reminderId: bigint) => {
    if (!identity) {
      toast.error('Please log in to delete reminders.');
      return;
    }
    deleteReminder({ reminderId, date: selectedDate });
  };

  return (
    <Card className="border-chart-1 bg-chart-1/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-chart-1" />
            <CardTitle className="text-lg">Reminders for this day</CardTitle>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <AppButton size="sm" variant="outline" disabled={!identity}>
                <Plus className="w-4 h-4 mr-2" />
                Add Reminder
              </AppButton>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Reminder</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Reminder Title</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <AppButton type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? 'Adding...' : 'Add Reminder'}
                </AppButton>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-center py-4">Loading reminders...</p>
        ) : reminders.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No reminders for this day</p>
        ) : (
          <div className="space-y-2">
            {reminders.map((reminder) => (
              <div
                key={Number(reminder.reminderId)}
                className="flex items-start justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex-1">
                  <p className="font-medium">{reminder.name}</p>
                  {reminder.description && (
                    <p className="text-sm text-muted-foreground mt-1">{reminder.description}</p>
                  )}
                </div>
                {identity && (
                  <AppButton
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(reminder.reminderId)}
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
  );
}
