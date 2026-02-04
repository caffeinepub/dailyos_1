import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import AccessControl "authorization/access-control";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import Iter "mo:core/Iter";

actor {
  type Year = Nat;
  type Day = Nat;
  type Month = Nat;
  type SerialiedMonth = Nat;
  type SerialiedDay = Nat;
  type SerialiedYear = Nat;
  type MonthSource = Nat;
  type DaySource = Nat;
  type YearSource = Nat;

  type ActivityId = Nat;
  type DailyDashboardEntryId = Int;
  type JournalId = Nat;
  type HabitId = Nat;
  type FinanceId = Nat;
  type ReminderId = Nat;
  type ReminderEntryId = Nat;
  type TodoEntryId = Nat;
  type EventId = Nat;

  type AuthorType = {
    #admin : Principal;
    #user : Principal;
    #guest : Principal;
    #bot : Principal;
  };

  public type ReminderEntry = {
    reminderEntryId : ReminderEntryId;
    activityId : ActivityId;
    reminderId : ReminderId;
    entryName : Text;
    createdAt : Int;
    updatedAt : Int;
    author : Principal;
    description : Text;
    title : Text;
    hasAttachments : Bool;
    coverImage : ?Text;
    colorHex : ?Text;
    dueTime : ?Int;
    repeatSchema : ?Nat;
  };

  public type TodoEntry = {
    todoEntryId : TodoEntryId;
    activityId : ActivityId;
    entryName : Text;
    hasAttachments : Bool;
    coverImage : ?Text;
    colorHex : ?Text;
    createdAt : Int;
    updatedAt : Int;
    author : Principal;
    description : ?Text;
    isCompleted : Bool;
    dueTime : ?Int;
    repeatSchema : ?Nat;
  };

  public type Reminder = {
    reminderId : ReminderId;
    name : Text;
    description : Text;
    repeatSchema : ?Text;
    colorHex : ?Text;
    createdAt : Int;
    updatedAt : Int;
    author : Principal;
    targetDate : Text;
  };

  public type Finance = {
    financeId : FinanceId;
    recurring : Bool;
    createdAt : Int;
    updatedAt : Int;
    author : Principal;
    amount : Nat;
    purpose : Text;
    description : Text;
    title : Text;
    financeType : FinanceType;
    date : Text;
  };

  public type FinanceType = {
    #income;
    #investment;
    #expense;
  };

  public type Habit = {
    habitId : HabitId;
    createdAt : Int;
    updatedAt : Int;
    author : Principal;
    name : Text;
    description : Text;
    isCompleted : Bool;
    date : Text;
  };

  public type Journal = {
    journalId : JournalId;
    entropy : Nat;
    locked : Bool;
    createdAt : Int;
    updatedAt : Int;
    author : Principal;
    content : Text;
    title : Text;
    hasAttachments : Bool;
    coverImage : ?Text;
    colorHex : ?Text;
    sharedWith : ?[Text];
    accessType : JournalAccessType;
    date : Text;
  };

  public type JournalAccessType = {
    #public_journal_access;
    #private_journal_access;
  };

  public type DailyDashboardEntry = {
    dailyDashboardEntryId : DailyDashboardEntryId;
    coverImage : ?Text;
    colorHex : ?Text;
    createdAt : Int;
    updatedAt : Int;
    author : Principal;
    title : Text;
  };

  public type UserProfile = {
    username : Text;
    email : ?Text;
    theme : Theme;
    language : Language;
    createdAt : Int;
    updatedAt : Int;
  };

  public type Activity = {
    activityId : ActivityId;
    recurring : Bool;
    coverImage : ?Text;
    colorHex : ?Text;
    createdAt : Int;
    updatedAt : Int;
    author : Principal;
    description : Text;
    name : Text;
    goalType : GoalType;
    date : Text;
    startTime : ?Text;
    endTime : ?Text;
    duration : ?Nat;
  };

  public type Theme = {
    #dark;
    #light;
    #blue;
    #green;
    #red;
    #yellow;
    #purple;
    #custom : Text;
  };

  public type Language = {
    #english;
    #german;
    #french;
    #spanish;
    #italian;
    #portuguese;
    #dutch;
    #chinese;
    #japanese;
    #korean;
    #russian;
    #arabic;
    #custom : Text;
  };

  public type GoalType = {
    #habit;
    #project;
    #daily;
    #weekly;
    #monthly;
    #yearly;
    #custom : Text;
  };

  let activities = Map.empty<ActivityId, Activity>();
  let reminders = Map.empty<ReminderId, Reminder>();
  let financeEntries = Map.empty<FinanceId, Finance>();
  let journals = Map.empty<JournalId, Journal>();
  let habits = Map.empty<HabitId, Habit>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextActivityId = 0;
  var nextReminderId = 0;
  var nextFinanceEntryId = 0;
  var nextJournalId = 0;
  var nextHabitId = 0;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access user profiles. Please log in or complete your profile setup to access this feature.");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func getSetupStatus() : async Bool {
    // Allow any authenticated principal (including guests) to check setup status
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous principals cannot check setup status");
    };
    switch (userProfiles.get(caller)) {
      case (?_profile) { false };
      case (null) { true };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins or the profile owner can view this profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async UserProfile {
    // Check if this is initial profile creation or update
    let isNewProfile = switch (userProfiles.get(caller)) {
      case (?_) { false };
      case (null) { true };
    };

    if (isNewProfile) {
      // For new profile creation, allow any authenticated non-anonymous principal
      if (caller.isAnonymous()) {
        Runtime.trap("Unauthorized: Anonymous principals cannot create profiles. Please log in or register to create a profile.");
      };
    } else {
      // For profile updates, require user permission
      if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
        Runtime.trap("Unauthorized: Only users with an existing profile can update their information. Please complete your profile setup first.");
      };
    };

    let currentProfile = switch (userProfiles.get(caller)) {
      case (?currentProfile) { currentProfile };
      case (null) { profile };
    };

    let updatedProfile = { currentProfile with username = profile.username };
    userProfiles.add(caller, updatedProfile);
    updatedProfile;
  };

  // New -- Batch Range Queries

  public query ({ caller }) func getActivitiesForDates(dates : [Text]) : async (Text, [Activity]) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access multi-date entries");
    };
    // No need to sort -- frontend in control
    let activitiesForDates = activities.values().toArray().filter(
      func(activity) {
        activity.author == caller and dates.findIndex(func(date) { date == activity.date }) != null;
      }
    );
    ("This is a new feature, the array indicates that it returns all activities for a range of days", activitiesForDates);
  };

  public query ({ caller }) func getJournalsForDates(dates : [Text]) : async (Text, [Journal]) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access multi-date entries");
    };
    let journalsForDates = journals.values().toArray().filter(
      func(journal) {
        journal.author == caller and dates.findIndex(func(date) { date == journal.date }) != null;
      }
    );
    ("This is a new feature, the array indicates that it returns all journal entries for a range of days", journalsForDates);
  };

  public query ({ caller }) func getFinancesForDates(dates : [Text]) : async (Text, [Finance]) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access multi-date entries");
    };
    let financesForDates = financeEntries.values().toArray().filter(
      func(finance) {
        finance.author == caller and dates.findIndex(func(date) { date == finance.date }) != null;
      }
    );
    ("This is a new feature, the array indicates that it returns all finances for a range of days", financesForDates);
  };

  public query ({ caller }) func getHabitsForDates(dates : [Text]) : async (Text, [Habit]) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access multi-date entries");
    };
    let habitsForDates = habits.values().toArray().filter(
      func(habit) {
        habit.author == caller and dates.findIndex(func(date) { date == habit.date }) != null;
      }
    );
    ("This is a new feature, the array indicates that it returns all habits for a range of days", habitsForDates);
  };

  public query ({ caller }) func getRemindersForDates(dates : [Text]) : async (Text, [Reminder]) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access multi-date entries");
    };
    let remindersForDates = reminders.values().toArray().filter(
      func(reminder) {
        reminder.author == caller and dates.findIndex(func(date) { date == reminder.targetDate }) != null;
      }
    );
    ("This is a new feature, the array indicates that it returns all reminders for a range of days", remindersForDates);
  };

  // Activity Management
  public shared ({ caller }) func createActivity(activity : Activity) : async ActivityId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Please log in and complete your user profile before creating activities.");
    };
    let activityId = nextActivityId;
    nextActivityId += 1;
    let newActivity = {
      activity with
      activityId;
      author = caller;
    };
    activities.add(activityId, newActivity);
    activityId;
  };

  public query ({ caller }) func getActivity(activityId : ActivityId) : async Activity {
    let activity = switch (activities.get(activityId)) {
      case (?existingActivity) { existingActivity };
      case (null) { Runtime.trap("Activity does not exist") };
    };
    if (activity.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Activity not found or you`'`re not the author. Return to the main list to fetch only activities you published.");
    };
    activity;
  };

  public query ({ caller }) func getActivitiesByDate(date : Text) : async [Activity] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view activities");
    };
    activities.values().toArray().filter(func(act) { act.author == caller and act.date == date });
  };

  public shared ({ caller }) func updateActivity(activityId : ActivityId, activity : Activity) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update activities");
    };
    let existing = switch (activities.get(activityId)) {
      case (?existingActivity) { existingActivity };
      case (null) { Runtime.trap("Activity does not exist") };
    };
    if (existing.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only update your own activities");
    };
    let updated = { activity with activityId; author = existing.author };
    activities.add(activityId, updated);
  };

  public shared ({ caller }) func deleteActivity(activityId : ActivityId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete activities");
    };
    let existing = switch (activities.get(activityId)) {
      case (?existingActivity) { existingActivity };
      case (null) { Runtime.trap("Activity does not exist") };
    };
    if (existing.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete your own activities");
    };
    activities.remove(activityId);
  };

  // Finance Management
  public shared ({ caller }) func createFinance(finance : Finance) : async FinanceId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create finance entries");
    };
    let financeId = nextFinanceEntryId;
    nextFinanceEntryId += 1;
    let newFinance = {
      finance with
      financeId;
      author = caller;
    };
    financeEntries.add(financeId, newFinance);
    financeId;
  };

  public query ({ caller }) func getFinancesByDate(date : Text) : async [Finance] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view finance entries");
    };
    financeEntries.values().toArray().filter(func(fin) { fin.author == caller and fin.date == date });
  };

  public shared ({ caller }) func deleteFinance(financeId : FinanceId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete finance entries");
    };
    let existing = switch (financeEntries.get(financeId)) {
      case (?existingFinance) { existingFinance };
      case (null) { Runtime.trap("Finance entry does not exist") };
    };
    if (existing.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete your own finance entries");
    };
    financeEntries.remove(financeId);
  };

  // Habit Management
  public shared ({ caller }) func createHabit(habit : Habit) : async HabitId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create habits");
    };
    let habitId = nextHabitId;
    nextHabitId += 1;
    let newHabit = {
      habit with
      habitId;
      author = caller;
    };
    habits.add(habitId, newHabit);
    habitId;
  };

  public query ({ caller }) func getHabitsByDate(date : Text) : async [Habit] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view habits");
    };
    habits.values().toArray().filter(func(hab) { hab.author == caller and hab.date == date });
  };

  public shared ({ caller }) func updateHabit(habitId : HabitId, habit : Habit) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update habits");
    };
    let existing = switch (habits.get(habitId)) {
      case (?existingHabit) { existingHabit };
      case (null) { Runtime.trap("Habit does not exist") };
    };
    if (existing.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only update your own habits");
    };
    let updated = { habit with habitId; author = existing.author };
    habits.add(habitId, updated);
  };

  public shared ({ caller }) func deleteHabit(habitId : HabitId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete habits");
    };
    let existing = switch (habits.get(habitId)) {
      case (?existingHabit) { existingHabit };
      case (null) { Runtime.trap("Habit does not exist") };
    };
    if (existing.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete your own habits");
    };
    habits.remove(habitId);
  };

  // Journal Management
  public shared ({ caller }) func createJournal(journal : Journal) : async JournalId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create journal entries");
    };
    let journalId = nextJournalId;
    nextJournalId += 1;
    let newJournal = {
      journal with
      journalId;
      author = caller;
    };
    journals.add(journalId, newJournal);
    journalId;
  };

  public query ({ caller }) func getJournalByDate(date : Text) : async ?Journal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view journal entries. Please sign in to access this content.");
    };
    let journalsFiltered = journals.values().toArray().filter(
      func(jour) {
        jour.date == date and (jour.author == caller or (jour.accessType == #public_journal_access and AccessControl.hasPermission(accessControlState, caller, #user)))
      }
    );
    if (journalsFiltered.size() > 0) {
      ?journalsFiltered[0];
    } else {
      null;
    };
  };

  public shared ({ caller }) func updateJournal(journalId : JournalId, journal : Journal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update journal entries");
    };
    let existing = switch (journals.get(journalId)) {
      case (?existingJournal) { existingJournal };
      case (null) { Runtime.trap("This journal entry could not be found or deleted because the author does not match your identity. Please synchronize your calendar before making further changes."); };
    };
    if (existing.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only update your own journal entries");
    };
    let updated = { journal with journalId; author = existing.author };
    journals.add(journalId, updated);
  };

  public shared ({ caller }) func deleteJournal(journalId : JournalId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete journal entries");
    };
    let existing = switch (journals.get(journalId)) {
      case (?existingJournal) { existingJournal };
      case (null) { Runtime.trap("Journal entry does not exist") };
    };
    if (existing.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete your own journal entries");
    };
    journals.remove(journalId);
  };

  // Reminder Management
  public shared ({ caller }) func createReminder(reminder : Reminder) : async ReminderId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create reminders");
    };
    let reminderId = nextReminderId;
    nextReminderId += 1;
    let newReminder = {
      reminder with
      reminderId;
      author = caller;
    };
    reminders.add(reminderId, newReminder);
    reminderId;
  };

  public query ({ caller }) func getRemindersByDate(date : Text) : async [Reminder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view reminders");
    };
    reminders.values().toArray().filter(func(rem) { rem.author == caller and rem.targetDate == date });
  };

  public shared ({ caller }) func deleteReminder(reminderId : ReminderId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete reminders");
    };
    let existing = switch (reminders.get(reminderId)) {
      case (?existingReminder) { existingReminder };
      case (null) { Runtime.trap("Reminder does not exist") };
    };
    if (existing.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete your own reminders");
    };
    reminders.remove(reminderId);
  };

  // Calendar and Dashboard queries (read-only, available to all including guests for exploration)
  public query func calendar(month : Month, year : Year) : async Text {
    let monthStr = month.toText();
    let yearStr = year.toText();
    monthStr # "-" # yearStr;
  };

  public query func week() : async ([Text], Bool, Text) {
    let days = Array.tabulate(7, func(i : Nat) : Text { (i + 1).toText() });
    (days, true, "");
  };

  public query func care() : async Bool {
    true;
  };
};
