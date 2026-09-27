import { useMemo } from 'react';
import { Check, Flame } from 'lucide-react';
import { WorkoutSession, DayOfWeek, TrainingPlan } from '../types/workout';
import { getStartOfWeek, getEndOfWeek } from '../services/storage';

interface WeeklyTrackerProps {
  sessions: WorkoutSession[];
  plan?: TrainingPlan;
}

export function WeeklyTracker({ sessions, plan }: WeeklyTrackerProps) {
  const { trackerDays, targetFrequency } = useMemo(() => {
    const now = new Date();
    const todayIndex = now.getDay() as DayOfWeek;

    // Standard Monday-to-Sunday calendar order for Brazil/fitness
    // Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0
    const allWeekDaysOrdered: { day: DayOfWeek; short: string; abbr: string; fullIndex: number }[] = [
      { day: 1, short: 'S', abbr: 'Seg', fullIndex: 0 },
      { day: 2, short: 'T', abbr: 'Ter', fullIndex: 1 },
      { day: 3, short: 'Q', abbr: 'Qua', fullIndex: 2 },
      { day: 4, short: 'Q', abbr: 'Qui', fullIndex: 3 },
      { day: 5, short: 'S', abbr: 'Sex', fullIndex: 4 },
      { day: 6, short: 'S', abbr: 'Sáb', fullIndex: 5 },
      { day: 0, short: 'D', abbr: 'Dom', fullIndex: 6 },
    ];

    // Determine the active training days for this plan
    let activeDaysFilter = plan?.activeDays;

    // If activeDays wasn't explicitly saved, inspect scheduledDays across the plan's workouts
    if (!activeDaysFilter || activeDaysFilter.length === 0) {
      const scheduledInWorkouts = new Set<DayOfWeek>();
      plan?.workouts.forEach((w) => {
        w.scheduledDays?.forEach((d) => scheduledInWorkouts.add(d));
      });

      if (scheduledInWorkouts.size > 0) {
        activeDaysFilter = Array.from(scheduledInWorkouts);
      } else if (plan?.weeklyFrequency) {
        // Fallback to first N days according to weeklyFrequency
        activeDaysFilter = allWeekDaysOrdered.slice(0, plan.weeklyFrequency).map((d) => d.day);
      }
    }

    // Filter to only display the days programmed for this plan!
    const filteredWeekDays = activeDaysFilter && activeDaysFilter.length > 0
      ? allWeekDaysOrdered.filter((item) => activeDaysFilter!.includes(item.day))
      : allWeekDaysOrdered; // If no filter set, default to all 7 days

    const weekStart = getStartOfWeek(now);
    const weekEnd = getEndOfWeek(now);

    // Filter sessions recorded this current week
    const thisWeekSessions = sessions.filter((s) => {
      const d = new Date(s.date);
      return d >= weekStart && d <= weekEnd;
    });

    const days = filteredWeekDays.map(({ day, short, abbr, fullIndex }) => {
      // Calculate the exact calendar date for this day of current week
      const targetDate = new Date(weekStart);
      targetDate.setDate(weekStart.getDate() + fullIndex);

      // Check which sessions were completed on this specific day of the week
      const daySessions = thisWeekSessions.filter((s) => {
        const d = new Date(s.date);
        return d.getDay() === day;
      });

      const isCompleted = daySessions.length > 0;
      const workoutNames = daySessions.map((s) => s.workoutName);

      return {
        dayIndex: day,
        shortName: short,
        abbr,
        dateString: `${targetDate.getDate()}/${targetDate.getMonth() + 1}`,
        isToday: day === todayIndex,
        isCompleted,
        completedWorkoutsCount: daySessions.length,
        workoutNames,
      };
    });

    return {
      trackerDays: days,
      targetFrequency: filteredWeekDays.length,
    };
  }, [sessions, plan]);

  const completedCount = trackerDays.filter((d) => d.isCompleted).length;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-zinc-950 p-4 sm:p-5 shadow-xl">
      {/* Background Subtle Glow */}
      <div className="absolute top-0 right-0 -mr-10 -mt-10 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-display">
              Frequência da Semana ({plan?.name || 'Meu Plano'})
            </h3>
            <p className="text-[11px] text-zinc-400">
              {completedCount} de {targetFrequency} dias programados concluídos nesta semana
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-bold text-amber-400">
            {completedCount}/{targetFrequency}
          </span>
          <span className="text-zinc-500">dias</span>
        </div>
      </div>

      {/* Bolinhas apenas com os dias configurados para este plano */}
      <div
        className="grid gap-2 sm:gap-3"
        style={{
          gridTemplateColumns: `repeat(${Math.max(1, trackerDays.length)}, minmax(0, 1fr))`,
        }}
      >
        {trackerDays.map((d) => {
          return (
            <div
              key={d.dayIndex}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
                d.isToday
                  ? 'bg-zinc-900/90 border border-amber-500/40 shadow-md shadow-amber-500/5'
                  : 'bg-zinc-950/60 border border-zinc-850 hover:border-zinc-800'
              }`}
            >
              {/* Bolinha Indicadora de Treino Concluído */}
              <div
                className={`relative flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full transition-all duration-500 ${
                  d.isCompleted
                    ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30 scale-105'
                    : d.isToday
                    ? 'border-2 border-dashed border-amber-400/80 bg-amber-400/5 text-amber-400'
                    : 'border border-zinc-800 bg-zinc-900/60 text-zinc-600'
                }`}
                title={
                  d.isCompleted
                    ? `Treino concluído: ${d.workoutNames.join(', ')}`
                    : d.isToday
                    ? 'Dia programado para hoje - pronto para treinar!'
                    : `Dia programado (${d.abbr})`
                }
              >
                {d.isCompleted ? (
                  <Check className="h-5 w-5 sm:h-6 sm:w-6 stroke-[3] animate-in zoom-in-75 duration-300" />
                ) : (
                  <span
                    className={`font-mono text-xs sm:text-sm font-bold ${
                      d.isToday ? 'text-amber-400' : 'text-zinc-600'
                    }`}
                  >
                    {d.shortName}
                  </span>
                )}

                {/* Sub-badge if more than 1 workout in the day */}
                {d.completedWorkoutsCount > 1 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-amber-400 border border-amber-400">
                    {d.completedWorkoutsCount}
                  </span>
                )}
              </div>

              {/* Inicial e Nome do Dia Embaixo da Bolinha */}
              <div className="mt-2 text-center">
                <span
                  className={`block text-[11px] sm:text-xs font-bold font-mono uppercase tracking-wider ${
                    d.isToday
                      ? 'text-amber-400 font-black'
                      : d.isCompleted
                      ? 'text-zinc-200'
                      : 'text-zinc-500'
                  }`}
                >
                  {d.abbr}
                </span>

                <span
                  className={`block text-[9px] font-mono mt-0.5 ${
                    d.isToday ? 'text-amber-400/80' : 'text-zinc-600'
                  }`}
                >
                  {d.dateString}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
