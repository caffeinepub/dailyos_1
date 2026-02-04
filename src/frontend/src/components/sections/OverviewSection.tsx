import { useState } from 'react';
import { Plus, Clock, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import AppButton from '../AppButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useGetActivitiesByDate, useCreateActivity, useDeleteActivity } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';

interface OverviewSectionProps {
  selectedDate: string;
}

export default function OverviewSection({ selectedDate }: OverviewSectionProps) {
  const { identity } = useInternetIdentity();
  const { data: activities = [], isLoading } = useGetActivitiesByDate(selectedDate);
  const { mutate: createActivity, isPending: isCreating } = useCreateActivity();
  const { mutate: deleteActivity } = useDeleteActivity();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    duration: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error('Please log in to create activities.');
      return;
    }

    const activity = {
      name: formData.name,
      description: formData.description,
      date: selectedDate,
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      duration: formData.duration ? BigInt(parseInt(formData.duration)) : undefined,
      goalType: { __kind__: 'daily' as const, daily: null },
      recurring: false,
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
      coverImage: undefined,
      colorHex: undefined,
    };

    createActivity(activity, {
      onSuccess: () => {
        setOpen(false);
        setFormData({ name: '', description: '', startTime: '', endTime: '', duration: '' });
      },
    });
  };

  const handleDelete = (activityId: bigint) => {
    if (!identity) {
      toast.error('Please log in to delete activities.');
      return;
    }
    deleteActivity({ activityId, date: selectedDate });
  };

  const calculateDuration = (startTime?: string, endTime?: string, duration?: bigint): string => {
    if (duration) {
      const hours = Number(duration) / 60;
      return `${hours.toFixed(1)}h`;
    }
    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      const diff = (end.getTime() - start.getTime()) / (1000 * 60);
      return `${(diff / 60).toFixed(1)}h`;
    }
    return 'N/A';
  };

  return (
    <Card className="dashboard-card dashboard-card-overview">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Time-Based Activities</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <AppButton size="sm" disabled={!identity}>
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </AppButton>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Activity</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Activity Name</Label>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Or Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 60"
                  />
                </div>
                <AppButton type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? 'Adding...' : 'Add Activity'}
                </AppButton>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">Loading activities...</p>
        ) : activities.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No activities logged for this day</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={Number(activity.activityId)}
                className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{activity.name}</h4>
                  {activity.description && (
                    <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.startTime && activity.endTime
                        ? `${activity.startTime} - ${activity.endTime}`
                        : activity.duration
                        ? `${Number(activity.duration)} min`
                        : 'No time set'}
                    </div>
                    <div className="font-medium">
                      {calculateDuration(activity.startTime, activity.endTime, activity.duration)}
                    </div>
                  </div>
                </div>
                {identity && (
                  <AppButton
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(activity.activityId)}
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
