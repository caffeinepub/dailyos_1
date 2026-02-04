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
import DailyTimeline from '../activities/DailyTimeline';
import type { Activity } from '../../backend';
import { compareActivitiesByTimeDesc } from '../../utils/activityTime';
import { getActivityColorByName } from '../../utils/activityColors';

interface OverviewSectionProps {
  selectedDate: string;
}

interface ActivityGroup {
  name: string;
  activities: Activity[];
  color: string;
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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error('Please log in to create activities.');
      return;
    }

    // Validate that both start and end times are provided
    if (!formData.startTime || !formData.endTime) {
      toast.error('Please provide both start and end times.');
      return;
    }

    // Calculate duration in minutes
    const start = new Date(`2000-01-01T${formData.startTime}`);
    const end = new Date(`2000-01-01T${formData.endTime}`);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    // Validate that end time is after start time
    if (durationMinutes <= 0) {
      toast.error('End time must be after start time.');
      return;
    }

    const activity = {
      name: formData.name,
      description: formData.description,
      date: selectedDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      duration: BigInt(Math.round(durationMinutes)),
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
        setFormData({ name: '', description: '', startTime: '', endTime: '' });
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

  // Group activities by name and sort by time-of-day
  const groupedActivities: ActivityGroup[] = (() => {
    // Filter only time-based activities
    const timeBasedActivities = activities.filter(
      (activity) => activity.startTime && activity.endTime
    );

    // Group by name
    const groupMap = new Map<string, Activity[]>();
    timeBasedActivities.forEach((activity) => {
      const existing = groupMap.get(activity.name) || [];
      existing.push(activity);
      groupMap.set(activity.name, existing);
    });

    // Convert to array and sort each group's activities by time-of-day (descending)
    const groups: ActivityGroup[] = Array.from(groupMap.entries()).map(([name, acts]) => ({
      name,
      activities: [...acts].sort(compareActivitiesByTimeDesc),
      color: getActivityColorByName(name),
    }));

    // Sort groups by their latest (first after time-desc sort) activity time
    groups.sort((a, b) => {
      const aLatest = a.activities[0];
      const bLatest = b.activities[0];
      return compareActivitiesByTimeDesc(aLatest, bLatest);
    });

    return groups;
  })();

  return (
    <Card className="dashboard-card dashboard-card-overview">
      <CardHeader>
        {/* Daily Timeline - positioned above the title and Add Activity button */}
        {!isLoading && <DailyTimeline activities={activities} />}
        
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
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                    />
                  </div>
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
        ) : groupedActivities.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No activities logged for this day</p>
        ) : (
          <div className="space-y-4">
            {groupedActivities.map((group) => (
              <div key={group.name} className="space-y-2">
                {/* Group header with color indicator */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  <h4 className="font-semibold text-sm">{group.name}</h4>
                  <span className="text-xs text-muted-foreground">
                    ({group.activities.length} {group.activities.length === 1 ? 'entry' : 'entries'})
                  </span>
                </div>
                
                {/* Individual time range entries */}
                <div className="space-y-2 pl-5">
                  {group.activities.map((activity) => (
                    <div
                      key={Number(activity.activityId)}
                      className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        {activity.description && (
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
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
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
