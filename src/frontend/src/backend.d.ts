import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Finance {
    title: string;
    date: string;
    createdAt: bigint;
    recurring: boolean;
    financeType: FinanceType;
    description: string;
    author: Principal;
    updatedAt: bigint;
    financeId: FinanceId;
    amount: bigint;
    purpose: string;
}
export type Year = bigint;
export type ReminderId = bigint;
export type Language = {
    __kind__: "custom";
    custom: string;
} | {
    __kind__: "portuguese";
    portuguese: null;
} | {
    __kind__: "japanese";
    japanese: null;
} | {
    __kind__: "chinese";
    chinese: null;
} | {
    __kind__: "italian";
    italian: null;
} | {
    __kind__: "spanish";
    spanish: null;
} | {
    __kind__: "german";
    german: null;
} | {
    __kind__: "arabic";
    arabic: null;
} | {
    __kind__: "french";
    french: null;
} | {
    __kind__: "russian";
    russian: null;
} | {
    __kind__: "dutch";
    dutch: null;
} | {
    __kind__: "english";
    english: null;
} | {
    __kind__: "korean";
    korean: null;
};
export interface Habit {
    isCompleted: boolean;
    date: string;
    name: string;
    createdAt: bigint;
    description: string;
    habitId: HabitId;
    author: Principal;
    updatedAt: bigint;
}
export type Month = bigint;
export type JournalId = bigint;
export type GoalType = {
    __kind__: "habit";
    habit: null;
} | {
    __kind__: "custom";
    custom: string;
} | {
    __kind__: "monthly";
    monthly: null;
} | {
    __kind__: "yearly";
    yearly: null;
} | {
    __kind__: "daily";
    daily: null;
} | {
    __kind__: "project";
    project: null;
} | {
    __kind__: "weekly";
    weekly: null;
};
export interface Activity {
    startTime?: string;
    duration?: bigint;
    endTime?: string;
    goalType: GoalType;
    date: string;
    name: string;
    createdAt: bigint;
    recurring: boolean;
    activityId: ActivityId;
    description: string;
    author: Principal;
    coverImage?: string;
    updatedAt: bigint;
    colorHex?: string;
}
export interface Reminder {
    reminderId: ReminderId;
    name: string;
    createdAt: bigint;
    description: string;
    repeatSchema?: string;
    author: Principal;
    updatedAt: bigint;
    colorHex?: string;
    targetDate: string;
}
export interface Journal {
    title: string;
    content: string;
    date: string;
    createdAt: bigint;
    journalId: JournalId;
    locked: boolean;
    accessType: JournalAccessType;
    author: Principal;
    sharedWith?: Array<string>;
    entropy: bigint;
    coverImage?: string;
    updatedAt: bigint;
    colorHex?: string;
    hasAttachments: boolean;
}
export type FinanceId = bigint;
export type HabitId = bigint;
export type ActivityId = bigint;
export type Theme = {
    __kind__: "red";
    red: null;
} | {
    __kind__: "custom";
    custom: string;
} | {
    __kind__: "blue";
    blue: null;
} | {
    __kind__: "dark";
    dark: null;
} | {
    __kind__: "purple";
    purple: null;
} | {
    __kind__: "light";
    light: null;
} | {
    __kind__: "green";
    green: null;
} | {
    __kind__: "yellow";
    yellow: null;
};
export interface UserProfile {
    theme: Theme;
    username: string;
    createdAt: bigint;
    email?: string;
    language: Language;
    updatedAt: bigint;
}
export enum FinanceType {
    expense = "expense",
    investment = "investment",
    income = "income"
}
export enum JournalAccessType {
    public_journal_access = "public_journal_access",
    private_journal_access = "private_journal_access"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    calendar(month: Month, year: Year): Promise<string>;
    care(): Promise<boolean>;
    createActivity(activity: Activity): Promise<ActivityId>;
    createFinance(finance: Finance): Promise<FinanceId>;
    createHabit(habit: Habit): Promise<HabitId>;
    createJournal(journal: Journal): Promise<JournalId>;
    createReminder(reminder: Reminder): Promise<ReminderId>;
    deleteActivity(activityId: ActivityId): Promise<void>;
    deleteFinance(financeId: FinanceId): Promise<void>;
    deleteHabit(habitId: HabitId): Promise<void>;
    deleteJournal(journalId: JournalId): Promise<void>;
    deleteReminder(reminderId: ReminderId): Promise<void>;
    getActivitiesByDate(date: string): Promise<Array<Activity>>;
    getActivity(activityId: ActivityId): Promise<Activity>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFinancesByDate(date: string): Promise<Array<Finance>>;
    getHabitsByDate(date: string): Promise<Array<Habit>>;
    getJournalByDate(date: string): Promise<Journal | null>;
    getRemindersByDate(date: string): Promise<Array<Reminder>>;
    getSetupStatus(): Promise<boolean>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<UserProfile>;
    updateActivity(activityId: ActivityId, activity: Activity): Promise<void>;
    updateHabit(habitId: HabitId, habit: Habit): Promise<void>;
    updateJournal(journalId: JournalId, journal: Journal): Promise<void>;
    week(): Promise<[Array<string>, boolean, string]>;
}
