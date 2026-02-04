import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Activity, Finance, Habit, Journal, Reminder, UserProfile } from '../backend';
import { FinanceType, JournalAccessType } from '../backend';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';
import { useInternetIdentity } from './useInternetIdentity';
import { normalizeError } from '../utils/errors';

// User Profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

// Setup Status - lightweight query for fast profile setup modal gating
export function useGetSetupStatus() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<boolean>({
    queryKey: ['setupStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSetupStatus();
    },
    enabled: !!actor && !!identity && !actorFetching,
    retry: false,
    staleTime: 0, // Always fresh to catch profile changes immediately
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!identity) {
        throw new Error('Please log in to save your profile.');
      }
      if (!actor) {
        throw new Error('Connection not available. Please try again.');
      }
      return await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['setupStatus'] });
    },
    onError: (error: unknown) => {
      const message = normalizeError(error);
      toast.error(message);
    },
  });
}

// Activities - Single Date
export function useGetActivitiesByDate(date: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Activity[]>({
    queryKey: ['activities', date],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActivitiesByDate(date);
    },
    enabled: !!actor && !isFetching && date !== '',
  });
}

// Activities - Batch Range Query
export function useGetActivitiesForDates(dates: string[]) {
  const { actor, isFetching } = useActor();

  return useQuery<Map<string, Activity[]>>({
    queryKey: ['activitiesRange', dates.join(',')],
    queryFn: async () => {
      if (!actor) return new Map();
      const [, activities] = await actor.getActivitiesForDates(dates);
      
      // Group activities by date
      const activityMap = new Map<string, Activity[]>();
      dates.forEach(date => activityMap.set(date, []));
      
      activities.forEach(activity => {
        const existing = activityMap.get(activity.date) || [];
        activityMap.set(activity.date, [...existing, activity]);
      });
      
      return activityMap;
    },
    enabled: !!actor && !isFetching && dates.length > 0,
  });
}

export function useCreateActivity() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activity: Omit<Activity, 'activityId' | 'author'>) => {
      if (!identity) {
        throw new Error('Please log in to create activities.');
      }
      if (!actor) {
        throw new Error('Connection not available. Please try again.');
      }
      
      return actor.createActivity({
        ...activity,
        activityId: BigInt(0),
        author: Principal.anonymous(),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activities', variables.date] });
      queryClient.invalidateQueries({ queryKey: ['activitiesRange'] });
      toast.success('Activity added');
    },
    onError: (error: unknown) => {
      const message = normalizeError(error);
      toast.error(message);
    },
  });
}

export function useDeleteActivity() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ activityId, date }: { activityId: bigint; date: string }) => {
      if (!identity) {
        throw new Error('Please log in to delete activities.');
      }
      if (!actor) {
        throw new Error('Connection not available. Please try again.');
      }
      await actor.deleteActivity(activityId);
      return date;
    },
    onSuccess: (date) => {
      queryClient.invalidateQueries({ queryKey: ['activities', date] });
      queryClient.invalidateQueries({ queryKey: ['activitiesRange'] });
      toast.success('Activity deleted');
    },
    onError: (error: unknown) => {
      const message = normalizeError(error);
      toast.error(message);
    },
  });
}

// Finance - Single Date
export function useGetFinancesByDate(date: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Finance[]>({
    queryKey: ['finances', date],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFinancesByDate(date);
    },
    enabled: !!actor && !isFetching && date !== '',
  });
}

// Finance - Batch Range Query
export function useGetFinancesForDates(dates: string[]) {
  const { actor, isFetching } = useActor();

  return useQuery<Map<string, Finance[]>>({
    queryKey: ['financesRange', dates.join(',')],
    queryFn: async () => {
      if (!actor) return new Map();
      const [, finances] = await actor.getFinancesForDates(dates);
      
      // Group finances by date
      const financeMap = new Map<string, Finance[]>();
      dates.forEach(date => financeMap.set(date, []));
      
      finances.forEach(finance => {
        const existing = financeMap.get(finance.date) || [];
        financeMap.set(finance.date, [...existing, finance]);
      });
      
      return financeMap;
    },
    enabled: !!actor && !isFetching && dates.length > 0,
  });
}

export function useCreateFinance() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (finance: Omit<Finance, 'financeId' | 'author'>) => {
      if (!identity) {
        throw new Error('Please log in to create finance entries.');
      }
      if (!actor) {
        throw new Error('Connection not available. Please try again.');
      }
      
      return actor.createFinance({
        ...finance,
        financeId: BigInt(0),
        author: Principal.anonymous(),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['finances'] });
      queryClient.invalidateQueries({ queryKey: ['financesRange'] });
      toast.success('Finance entry added');
    },
    onError: (error: unknown) => {
      const message = normalizeError(error);
      toast.error(message);
    },
  });
}

export function useDeleteFinance() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ financeId, date }: { financeId: bigint; date: string }) => {
      if (!identity) {
        throw new Error('Please log in to delete finance entries.');
      }
      if (!actor) {
        throw new Error('Connection not available. Please try again.');
      }
      await actor.deleteFinance(financeId);
      return date;
    },
    onSuccess: (date) => {
      queryClient.invalidateQueries({ queryKey: ['finances'] });
      queryClient.invalidateQueries({ queryKey: ['financesRange'] });
      toast.success('Finance entry deleted');
    },
    onError: (error: unknown) => {
      const message = normalizeError(error);
      toast.error(message);
    },
  });
}

// Habits - Single Date
export function useGetHabitsByDate(date: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Habit[]>({
    queryKey: ['habits', date],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHabitsByDate(date);
    },
    enabled: !!actor && !isFetching && date !== '',
  });
}

// Habits - Batch Range Query
export function useGetHabitsForDates(dates: string[]) {
  const { actor, isFetching } = useActor();

  return useQuery<Map<string, Habit[]>>({
    queryKey: ['habitsRange', dates.join(',')],
    queryFn: async () => {
      if (!actor) return new Map();
      const [, habits] = await actor.getHabitsForDates(dates);
      
      // Group habits by date
      const habitMap = new Map<string, Habit[]>();
      dates.forEach(date => habitMap.set(date, []));
      
      habits.forEach(habit => {
        const existing = habitMap.get(habit.date) || [];
        habitMap.set(habit.date, [...existing, habit]);
      });
      
      return habitMap;
    },
    enabled: !!actor && !isFetching && dates.length > 0,
  });
}

export function useCreateHabit() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habit: Omit<Habit, 'habitId' | 'author'>) => {
      if (!identity) {
        throw new Error('Please log in to create habits.');
      }
      if (!actor) {
        throw new Error('Connection not available. Please try again.');
      }
      
      return actor.createHabit({
        ...habit,
        habitId: BigInt(0),
        author: Principal.anonymous(),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['habits', variables.date] });
      queryClient.invalidateQueries({ queryKey: ['habitsRange'] });
      toast.success('Habit added');
    },
    onError: (error: unknown) => {
      const message = normalizeError(error);
      toast.error(message);
    },
  });
}

export function useUpdateHabit() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habit: Habit) => {
      if (!identity) {
        throw new Error('Please log in to update habits.');
      }
      if (!actor) {
        throw new Error('Connection not available. Please try again.');
      }
      await actor.updateHabit(habit.habitId, habit);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['habits', variables.date] });
      queryClient.invalidateQueries({ queryKey: ['habitsRange'] });
    },
    onError: (error: unknown) => {
      const message = normalizeError(error);
      toast.error(message);
    },
  });
}

export function useDeleteHabit() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habitId, date }: { habitId: bigint; date: string }) => {
      if (!identity) {
        throw new Error('Please log in to delete habits.');
      }
      if (!actor) {
        throw new Error('Connection not available. Please try again.');
      }
      await actor.deleteHabit(habitId);
      return date;
    },
    onSuccess: (date) => {
      queryClient.invalidateQueries({ queryKey: ['habits', date] });
      queryClient.invalidateQueries({ queryKey: ['habitsRange'] });
      toast.success('Habit deleted');
    },
    onError: (error: unknown) => {
      const message = normalizeError(error);
      toast.error(message);
    },
  });
}

// Journal - Single Date
export function useGetJournalByDate(date: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Journal | null>({
    queryKey: ['journal', date],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getJournalByDate(date);
    },
    enabled: !!actor && !isFetching && date !== '',
  });
}

export function useCreateJournal() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (journal: Omit<Journal, 'journalId' | 'author'>) => {
      if (!identity) {
        throw new Error('Please log in to create journal entries.');
      }
      if (!actor) {
        throw new Error('Connection not available. Please try again.');
      }
      
      return actor.createJournal({
        ...journal,
        journalId: BigInt(0),
        author: Principal.anonymous(),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['journal', variables.date] });
      toast.success('Journal saved');
    },
    onError: (error: unknown) => {
      const message = normalizeError(error);
      toast.error(message);
    },
  });
}

export function useUpdateJournal() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (journal: Journal) => {
      if (!identity) {
        throw new Error('Please log in to update journal entries.');
      }
      if (!actor) {
        throw new Error('Connection not available. Please try again.');
      }
      await actor.updateJournal(journal.journalId, journal);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['journal', variables.date] });
      toast.success('Journal updated');
    },
    onError: (error: unknown) => {
      const message = normalizeError(error);
      toast.error(message);
    },
  });
}

// Reminders - Single Date
export function useGetRemindersByDate(date: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Reminder[]>({
    queryKey: ['reminders', date],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRemindersByDate(date);
    },
    enabled: !!actor && !isFetching && date !== '',
  });
}

// Reminders - Range Query for Calendar Indicators
export function useGetRemindersForDates(dates: string[]) {
  const { actor, isFetching } = useActor();

  return useQuery<Set<string>>({
    queryKey: ['reminderDates', dates.join(',')],
    queryFn: async () => {
      if (!actor) return new Set<string>();
      const [, reminders] = await actor.getRemindersForDates(dates);
      
      // Return a Set of dates that have at least one reminder
      const datesWithReminders = new Set<string>();
      reminders.forEach(reminder => {
        datesWithReminders.add(reminder.targetDate);
      });
      
      return datesWithReminders;
    },
    enabled: !!actor && !isFetching && dates.length > 0,
  });
}

export function useCreateReminder() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reminder: Omit<Reminder, 'reminderId' | 'author'>) => {
      if (!identity) {
        throw new Error('Please log in to create reminders.');
      }
      if (!actor) {
        throw new Error('Connection not available. Please try again.');
      }
      
      return actor.createReminder({
        ...reminder,
        reminderId: BigInt(0),
        author: Principal.anonymous(),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reminders', variables.targetDate] });
      queryClient.invalidateQueries({ queryKey: ['reminderDates'] });
      toast.success('Reminder added');
    },
    onError: (error: unknown) => {
      const message = normalizeError(error);
      toast.error(message);
    },
  });
}

export function useDeleteReminder() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reminderId, date }: { reminderId: bigint; date: string }) => {
      if (!identity) {
        throw new Error('Please log in to delete reminders.');
      }
      if (!actor) {
        throw new Error('Connection not available. Please try again.');
      }
      await actor.deleteReminder(reminderId);
      return date;
    },
    onSuccess: (date) => {
      queryClient.invalidateQueries({ queryKey: ['reminders', date] });
      queryClient.invalidateQueries({ queryKey: ['reminderDates'] });
      toast.success('Reminder deleted');
    },
    onError: (error: unknown) => {
      const message = normalizeError(error);
      toast.error(message);
    },
  });
}
