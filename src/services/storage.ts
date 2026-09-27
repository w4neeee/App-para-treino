import {
  TrainingPlan,
  WorkoutSession,
  ExerciseProgressionPoint,
  WeeklySummary,
  DailyHydration,
  WaterLogEntry,
  WeightEntry,
} from '../types/workout';
import { INITIAL_PLANS, INITIAL_SESSIONS } from '../data/defaultPlans';

const STORAGE_KEYS = {
  PLANS: 'irontrack_plans_v1',
  ACTIVE_PLAN_ID: 'irontrack_active_plan_v1',
  SESSIONS: 'irontrack_sessions_v1',
  WATER_HISTORY: 'irontrack_water_history_v1',
  WATER_GOAL: 'irontrack_water_goal_v1',
  WEIGHT_ENTRIES: 'irontrack_weight_entries_v1',
};

export function loadPlans(): TrainingPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLANS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(INITIAL_PLANS));
      return INITIAL_PLANS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PLANS;
  } catch (e) {
    console.error('Error loading plans from storage', e);
    return INITIAL_PLANS;
  }
}

export function savePlans(plans: TrainingPlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  } catch (e) {
    console.error('Error saving plans', e);
  }
}

export function loadActivePlanId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_PLAN_ID);
    if (id) return id;
    const plans = loadPlans();
    const active = plans.find((p) => p.isActive) || plans[0];
    if (active) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PLAN_ID, active.id);
      return active.id;
    }
    return INITIAL_PLANS[0].id;
  } catch (e) {
    return INITIAL_PLANS[0].id;
  }
}

export function saveActivePlanId(planId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PLAN_ID, planId);
    const plans = loadPlans();
    const updated = plans.map((p) => ({
      ...p,
      isActive: p.id === planId,
    }));
    savePlans(updated);
  } catch (e) {
    console.error('Error setting active plan', e);
  }
}

export function loadSessions(): WorkoutSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
      return INITIAL_SESSIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SESSIONS;
  } catch (e) {
    console.error('Error loading sessions', e);
    return INITIAL_SESSIONS;
  }
}

export function saveSessions(sessions: WorkoutSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error('Error saving sessions', e);
  }
}

export function saveNewSession(session: WorkoutSession): WorkoutSession[] {
  const existing = loadSessions();
  const updated = [session, ...existing];
  saveSessions(updated);
  return updated;
}

export function deleteSession(sessionId: string): WorkoutSession[] {
  const existing = loadSessions();
  const updated = existing.filter((s) => s.id !== sessionId);
  saveSessions(updated);
  return updated;
}

// Helpers for dates and weeks
export function getStartOfWeek(d = new Date()): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sun, 1 is Mon
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function getEndOfWeek(d = new Date()): Date {
  const start = getStartOfWeek(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function getWeekKey(date: Date): string {
  const start = getStartOfWeek(date);
  const year = start.getFullYear();
  // Get ISO week number
  const oneJan = new Date(year, 0, 1);
  const numberOfDays = Math.floor((start.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
}

export function formatWeekLabel(date: Date): string {
  const start = getStartOfWeek(date);
  const end = getEndOfWeek(date);
  const startDay = start.getDate();
  const endDay = end.getDate();
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const month = monthNames[end.getMonth()];
  return `Semana ${startDay} a ${endDay} ${month}`;
}

// Workout counts: this week vs total historical
export function getWorkoutCompletionStats(workoutId: string, sessions: WorkoutSession[]) {
  const now = new Date();
  const weekStart = getStartOfWeek(now);
  const weekEnd = getEndOfWeek(now);

  let thisWeekCount = 0;
  let totalCount = 0;
  let lastSessionDate: string | null = null;

  // Sessions sorted descending by date
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (const session of sorted) {
    if (session.workoutId === workoutId) {
      totalCount++;
      if (!lastSessionDate) {
        lastSessionDate = session.date;
      }
      const sessDate = new Date(session.date);
      if (sessDate >= weekStart && sessDate <= weekEnd) {
        thisWeekCount++;
      }
    }
  }

  return {
    thisWeekCount,
    totalCount,
    lastSessionDate,
  };
}

// Compute Weekly summaries for the dashboard
export function computeWeeklySummaries(sessions: WorkoutSession[]): WeeklySummary[] {
  const map: Record<string, { sessions: WorkoutSession[]; date: Date }> = {};

  for (const sess of sessions) {
    const d = new Date(sess.date);
    const key = getWeekKey(d);
    if (!map[key]) {
      map[key] = { sessions: [], date: d };
    }
    map[key].sessions.push(sess);
  }

  // Sort chronological
  const sortedKeys = Object.keys(map).sort();

  return sortedKeys.map((key) => {
    const entry = map[key];
    const weekStart = getStartOfWeek(entry.date);
    const weekEnd = getEndOfWeek(entry.date);
    const sessList = entry.sessions;

    const totalWorkouts = sessList.length;
    const totalVolumeKg = sessList.reduce((acc, s) => acc + (s.totalVolumeKg || 0), 0);
    const totalSets = sessList.reduce((acc, s) => acc + (s.totalCompletedSets || 0), 0);
    const totalDurationMinutes = Math.round(
      sessList.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / 60
    );

    const workoutsCompleted: { [workoutId: string]: number } = {};
    for (const s of sessList) {
      workoutsCompleted[s.workoutId] = (workoutsCompleted[s.workoutId] || 0) + 1;
    }

    return {
      weekKey: key,
      weekLabel: formatWeekLabel(entry.date),
      startDate: weekStart.toISOString(),
      endDate: weekEnd.toISOString(),
      totalWorkouts,
      totalVolumeKg,
      totalSets,
      totalDurationMinutes,
      workoutsCompleted,
    };
  });
}

// Compute progression for a specific exercise across sessions
export function getExerciseProgression(
  exerciseNameOrId: string,
  sessions: WorkoutSession[]
): ExerciseProgressionPoint[] {
  // Sort chronological (oldest to newest)
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const points: ExerciseProgressionPoint[] = [];

  for (const sess of sorted) {
    const exLog = sess.exercises.find(
      (e) =>
        e.exerciseId === exerciseNameOrId ||
        e.exerciseName.toLowerCase() === exerciseNameOrId.toLowerCase()
    );

    if (exLog && exLog.sets && exLog.sets.length > 0) {
      const completedSets = exLog.sets.filter((s) => s.completed && s.weight > 0 && s.reps > 0);
      if (completedSets.length === 0) continue;

      let maxWeight = 0;
      let totalWeight = 0;
      let maxReps = 0;
      let totalVol = 0;
      let best1RM = 0;

      for (const set of completedSets) {
        if (set.weight > maxWeight) maxWeight = set.weight;
        if (set.reps > maxReps) maxReps = set.reps;
        totalWeight += set.weight;
        totalVol += set.weight * set.reps;

        // Brzycki 1RM estimate: weight / (1.0278 - 0.0278 * reps)
        const est1RM =
          set.reps === 1
            ? set.weight
            : Math.round(set.weight / (1.0278 - 0.0278 * Math.min(set.reps, 15)));
        if (est1RM > best1RM) best1RM = est1RM;
      }

      const avgWeight = Math.round((totalWeight / completedSets.length) * 10) / 10;

      points.push({
        date: sess.date,
        sessionDate: new Date(sess.date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        }),
        workoutName: sess.workoutName,
        maxWeightKg: maxWeight,
        avgWeightKg: avgWeight,
        maxReps,
        totalVolumeKg: totalVol,
        estimated1RM: best1RM,
        setsCount: completedSets.length,
      });
    }
  }

  return points;
}

// Reset data to initial demo
export function resetToDemoData() {
  localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(INITIAL_PLANS));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PLAN_ID, INITIAL_PLANS[0].id);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
  return { plans: INITIAL_PLANS, sessions: INITIAL_SESSIONS };
}

// ----------------------------------------------------
// HYDRATION (WATER INTAKE) TRACKING
// ----------------------------------------------------

export function getTodayDateKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadWaterGoal(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WATER_GOAL);
    if (!raw) return 2500;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) || parsed < 500 ? 2500 : parsed;
  } catch {
    return 2500;
  }
}

export function saveWaterGoal(goalMl: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WATER_GOAL, goalMl.toString());
  } catch (e) {
    console.error('Error saving water goal', e);
  }
}

export function loadHydrationHistory(): Record<string, DailyHydration> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WATER_HISTORY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveHydrationHistory(history: Record<string, DailyHydration>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WATER_HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Error saving hydration history', e);
  }
}

export function loadTodayHydration(): DailyHydration {
  const dateKey = getTodayDateKey();
  const history = loadHydrationHistory();
  const goal = loadWaterGoal();

  if (history[dateKey]) {
    return history[dateKey];
  }

  // Create new day entry
  const newDay: DailyHydration = {
    date: dateKey,
    totalMl: 0,
    goalMl: goal,
    logs: [],
  };
  return newDay;
}

export function addWaterIntake(amountMl: number): DailyHydration {
  const dateKey = getTodayDateKey();
  const history = loadHydrationHistory();
  const goal = loadWaterGoal();

  const currentDay = history[dateKey] || {
    date: dateKey,
    totalMl: 0,
    goalMl: goal,
    logs: [],
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const newLog: WaterLogEntry = {
    id: `water_${Date.now()}`,
    amountMl,
    timestamp: now.toISOString(),
    timeStr,
  };

  const updatedLogs = [newLog, ...currentDay.logs];
  const updatedTotal = Math.max(0, currentDay.totalMl + amountMl);

  const updatedDay: DailyHydration = {
    ...currentDay,
    totalMl: updatedTotal,
    goalMl: goal,
    logs: updatedLogs,
  };

  history[dateKey] = updatedDay;
  saveHydrationHistory(history);
  return updatedDay;
}

export function resetTodayWaterIntake(): DailyHydration {
  const dateKey = getTodayDateKey();
  const history = loadHydrationHistory();
  const goal = loadWaterGoal();

  const resetDay: DailyHydration = {
    date: dateKey,
    totalMl: 0,
    goalMl: goal,
    logs: [],
  };

  history[dateKey] = resetDay;
  saveHydrationHistory(history);
  return resetDay;
}

export function removeWaterLog(logId: string): DailyHydration {
  const dateKey = getTodayDateKey();
  const history = loadHydrationHistory();
  const currentDay = history[dateKey];

  if (!currentDay) return loadTodayHydration();

  const targetLog = currentDay.logs.find((l) => l.id === logId);
  const updatedLogs = currentDay.logs.filter((l) => l.id !== logId);
  const updatedTotal = Math.max(0, currentDay.totalMl - (targetLog?.amountMl || 0));

  const updatedDay: DailyHydration = {
    ...currentDay,
    totalMl: updatedTotal,
    logs: updatedLogs,
  };

  history[dateKey] = updatedDay;
  saveHydrationHistory(history);
  return updatedDay;
}

// ----------------------------------------------------
// BODY WEIGHT TRACKING
// ----------------------------------------------------

const INITIAL_WEIGHT_ENTRIES: WeightEntry[] = [
  {
    id: 'w_init_1',
    weightKg: 78.5,
    date: getTodayDateKey(),
    timestamp: new Date().toISOString(),
    notes: 'Peso inicial de referência',
  },
];

export function loadWeightEntries(): WeightEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEIGHT_ENTRIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WEIGHT_ENTRIES, JSON.stringify(INITIAL_WEIGHT_ENTRIES));
      return INITIAL_WEIGHT_ENTRIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return INITIAL_WEIGHT_ENTRIES;
  } catch {
    return INITIAL_WEIGHT_ENTRIES;
  }
}

export function saveWeightEntries(entries: WeightEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WEIGHT_ENTRIES, JSON.stringify(entries));
  } catch (e) {
    console.error('Error saving weight entries', e);
  }
}

export function addWeightEntry(weightKg: number, date?: string, notes?: string): WeightEntry[] {
  const entries = loadWeightEntries();
  const now = new Date();
  const dateStr = date || getTodayDateKey();

  const newEntry: WeightEntry = {
    id: `weight_${Date.now()}`,
    weightKg: Math.round(weightKg * 10) / 10,
    date: dateStr,
    timestamp: now.toISOString(),
    notes: notes?.trim() || undefined,
  };

  const updated = [newEntry, ...entries].sort(
    (a, b) => new Date(b.date + 'T23:59:59').getTime() - new Date(a.date + 'T23:59:59').getTime()
  );

  saveWeightEntries(updated);
  return updated;
}

export function deleteWeightEntry(id: string): WeightEntry[] {
  const entries = loadWeightEntries();
  const updated = entries.filter((e) => e.id !== id);
  saveWeightEntries(updated);
  return updated;
}
