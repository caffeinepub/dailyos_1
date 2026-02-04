import type { Activity } from '../../backend';
import { getActivityColorByName } from '../../utils/activityColors';
import { getSegmentStyle } from '../../utils/timelineStyles';
import { parseTimeToMinutes, compareActivitiesByTimeDesc } from '../../utils/activityTime';

interface DailyTimelineProps {
  activities: Activity[];
}

/**
 * Convert minutes to percentage of day (0-100)
 */
function minutesToPercent(minutes: number): number {
  return (minutes / 1440) * 100; // 1440 minutes in a day
}

interface TimelineSegment {
  activity: Activity;
  startPercent: number;
  widthPercent: number;
  color: string;
}

export default function DailyTimeline({ activities }: DailyTimelineProps) {
  // Filter activities that have both start and end times
  const validActivities = activities.filter(
    (activity) => activity.startTime && activity.endTime
  );

  // Sort by time-of-day descending (later times first)
  const sortedActivities = [...validActivities].sort(compareActivitiesByTimeDesc);

  // Calculate segments
  const segments: TimelineSegment[] = sortedActivities.map((activity) => {
    const startMinutes = parseTimeToMinutes(activity.startTime!);
    const endMinutes = parseTimeToMinutes(activity.endTime!);
    const durationMinutes = endMinutes - startMinutes;

    return {
      activity,
      startPercent: minutesToPercent(startMinutes),
      widthPercent: minutesToPercent(durationMinutes),
      color: getActivityColorByName(activity.name),
    };
  });

  // Generate hour markers (0-24)
  const hours = Array.from({ length: 25 }, (_, i) => i);

  return (
    <div className="daily-timeline w-full space-y-3 mb-8">
      <h3 className="text-base font-bold text-muted-foreground">Daily Timeline</h3>
      
      {/* Timeline container */}
      <div className="relative w-full">
        {/* Hour markers */}
        <div className="relative h-10 border-b-2 border-border">
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute top-0 h-full flex flex-col items-center"
              style={{ left: `${(hour / 24) * 100}%` }}
            >
              {/* Tick mark */}
              <div className="w-px h-3 bg-border" />
              {/* Hour label - show every 3 hours on mobile, every 2 on tablet+, all on desktop */}
              {(hour % 3 === 0 || (hour % 2 === 0 && window.innerWidth >= 640) || window.innerWidth >= 1024) && (
                <span className="text-xs text-muted-foreground mt-1.5 font-semibold">
                  {hour.toString().padStart(2, '0')}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Activity segments track */}
        <div className="daily-timeline__track relative h-10 mt-3 bg-muted/40 rounded-2xl overflow-hidden shadow-inner">
          {segments.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-muted-foreground font-medium">No timed activities</span>
            </div>
          ) : (
            segments.map((segment, index) => {
              const segmentStyle = getSegmentStyle(segment.color);
              return (
                <div
                  key={`${segment.activity.activityId}-${index}`}
                  className="daily-timeline__segment absolute top-0 h-full rounded-xl cursor-pointer group"
                  style={{
                    left: `${segment.startPercent}%`,
                    width: `${segment.widthPercent}%`,
                    ...segmentStyle,
                  }}
                  title={`${segment.activity.name} (${segment.activity.startTime} - ${segment.activity.endTime})`}
                >
                  {/* Activity name label - only show if segment is wide enough */}
                  {segment.widthPercent > 8 && (
                    <div className="absolute inset-0 flex items-center justify-center px-2">
                      <span className="text-xs font-bold text-white drop-shadow-md truncate">
                        {segment.activity.name}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
