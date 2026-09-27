import { useState, useMemo } from 'react';
import {
  Trophy,
  Award,
  Flame,
  Droplets,
  Shield,
  Zap,
  CheckCircle2,
  Lock,
  Sparkles,
  Star,
  ChevronRight,
} from 'lucide-react';
import { WorkoutSession, TrainingPlan, DailyHydration } from '../types/workout';
import { loadHydrationHistory, loadWaterGoal } from '../services/storage';

interface AchievementsSectionProps {
  sessions: WorkoutSession[];
  activePlan: TrainingPlan | null;
  todayHydration?: DailyHydration;
}

type CategoryFilter = 'todas' | 'treino' | 'agua';

interface Achievement {
  id: string;
  category: 'treino' | 'agua';
  title: string;
  description: string;
  tier: 'bronze' | 'prata' | 'ouro' | 'diamante';
  icon: typeof Trophy;
  accentColor: string;
  borderGlow: string;
  bgGradient: string;
  isUnlocked: boolean;
  currentValue: number;
  targetValue: number;
  unit: string;
  unlockedAtText?: string;
}

export function AchievementsSection({
  sessions,
  activePlan,
  todayHydration,
}: AchievementsSectionProps) {
  const [filter, setFilter] = useState<CategoryFilter>('todas');

  // 1. Calculate Hydration Metrics
  const hydrationStats = useMemo(() => {
    const history = loadHydrationHistory();
    const defaultGoal = loadWaterGoal() || 2500;

    // Combine history with today's hydration
    const allDays = { ...history };
    if (todayHydration?.date) {
      allDays[todayHydration.date] = todayHydration;
    }

    const sortedDates = Object.keys(allDays).sort();
    let totalDaysGoalReached = 0;
    let maxSingleDayMl = 0;

    sortedDates.forEach((dateKey) => {
      const entry = allDays[dateKey];
      const goal = entry.goalMl || defaultGoal;
      if (entry.totalMl >= goal) {
        totalDaysGoalReached++;
      }
      if (entry.totalMl > maxSingleDayMl) {
        maxSingleDayMl = entry.totalMl;
      }
    });

    // Calculate consecutive days streak ending at today or yesterday
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    // Sort chronologically and measure consecutive days
    for (let i = 0; i < sortedDates.length; i++) {
      const entry = allDays[sortedDates[i]];
      const goal = entry.goalMl || defaultGoal;
      if (entry.totalMl >= goal) {
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    // Check recent streak up to today
    const today = new Date();
    for (let d = 0; d < 30; d++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - d);
      const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      const entry = allDays[key];
      const goal = entry?.goalMl || defaultGoal;
      if (entry && entry.totalMl >= goal) {
        currentStreak++;
      } else if (d === 0) {
        // Today might still be ongoing, so don't break streak if today isn't done yet but yesterday was
        continue;
      } else {
        break;
      }
    }

    return {
      totalDaysGoalReached,
      maxSingleDayMl,
      currentStreak: Math.max(currentStreak, maxStreak),
    };
  }, [todayHydration]);

  // 2. Calculate Weekly Workout Streaks
  const workoutStats = useMemo(() => {
    const totalSessions = sessions.length;
    const weeklyTarget = activePlan?.weeklyFrequency || 3;

    // Helper: get Monday of week
    const getWeekKey = (d: Date) => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date.setDate(diff));
      return `${monday.getFullYear()}-W${Math.ceil((monday.getTime() - new Date(monday.getFullYear(), 0, 1).getTime()) / (7 * 24 * 3600 * 1000))}`;
    };

    // Group sessions by week
    const weekMap: Record<string, number> = {};
    sessions.forEach((s) => {
      const d = new Date(s.date);
      const weekKey = getWeekKey(d);
      weekMap[weekKey] = (weekMap[weekKey] || 0) + 1;
    });

    // Check current week count
    const now = new Date();
    const currentWeekKey = getWeekKey(now);
    const thisWeekCount = weekMap[currentWeekKey] || 0;

    // Count consecutive weeks
    let consecutiveWeeks = 0;
    let maxConsecutiveWeeks = 0;

    // Scan backwards from current week
    for (let w = 0; w < 52; w++) {
      const checkDate = new Date();
      checkDate.setDate(now.getDate() - w * 7);
      const key = getWeekKey(checkDate);
      const count = weekMap[key] || 0;

      // Allow current week to be in-progress if it's week 0 and already has at least 1 workout
      const isTargetMet = count >= Math.min(2, weeklyTarget);
      if (isTargetMet) {
        consecutiveWeeks++;
        if (consecutiveWeeks > maxConsecutiveWeeks) {
          maxConsecutiveWeeks = consecutiveWeeks;
        }
      } else if (w === 0) {
        // Current week in progress, check if previous week was good
        continue;
      } else {
        break;
      }
    }

    // Best consecutive streak
    const bestStreak = Math.max(consecutiveWeeks, maxConsecutiveWeeks, thisWeekCount >= weeklyTarget ? 1 : 0);

    return {
      totalSessions,
      thisWeekCount,
      weeklyTarget,
      bestStreak,
    };
  }, [sessions, activePlan]);

  // 3. Build Achievements Definition
  const achievements: Achievement[] = useMemo(() => {
    return [
      // --- HIDRATAÇÃO ---
      {
        id: 'water_1',
        category: 'agua',
        title: 'Primeiro Gole',
        description: 'Bata sua meta de água diária pela 1ª vez',
        tier: 'bronze',
        icon: Droplets,
        accentColor: 'text-sky-400',
        borderGlow: 'border-sky-500/30 group-hover:border-sky-400/60 shadow-sky-500/10',
        bgGradient: 'from-sky-500/15 via-[#141517] to-[#141517]',
        isUnlocked: hydrationStats.totalDaysGoalReached >= 1,
        currentValue: hydrationStats.totalDaysGoalReached,
        targetValue: 1,
        unit: 'dia',
        unlockedAtText: 'Meta batida!',
      },
      {
        id: 'water_3_streak',
        category: 'agua',
        title: 'Hábito Cristalino',
        description: 'Bata sua meta de água por 3 dias consecutivos',
        tier: 'prata',
        icon: Sparkles,
        accentColor: 'text-cyan-300',
        borderGlow: 'border-cyan-500/30 group-hover:border-cyan-400/60 shadow-cyan-500/10',
        bgGradient: 'from-cyan-500/15 via-[#141517] to-[#141517]',
        isUnlocked: hydrationStats.currentStreak >= 3,
        currentValue: Math.min(3, hydrationStats.currentStreak),
        targetValue: 3,
        unit: 'dias seguidos',
      },
      {
        id: 'water_7_streak',
        category: 'agua',
        title: 'Semana Hidratada',
        description: 'Bata sua meta de água por 7 dias seguidos',
        tier: 'ouro',
        icon: Award,
        accentColor: 'text-amber-400',
        borderGlow: 'border-amber-500/30 group-hover:border-amber-400/60 shadow-amber-500/15',
        bgGradient: 'from-amber-500/15 via-[#141517] to-[#141517]',
        isUnlocked: hydrationStats.currentStreak >= 7 || hydrationStats.totalDaysGoalReached >= 7,
        currentValue: Math.min(7, Math.max(hydrationStats.currentStreak, hydrationStats.totalDaysGoalReached)),
        targetValue: 7,
        unit: 'dias',
      },
      {
        id: 'water_super',
        category: 'agua',
        title: 'Super Hidratação',
        description: 'Beba 3.000 ml ou mais em um único dia',
        tier: 'diamante',
        icon: Zap,
        accentColor: 'text-blue-400',
        borderGlow: 'border-blue-500/30 group-hover:border-blue-400/60 shadow-blue-500/15',
        bgGradient: 'from-blue-500/15 via-[#141517] to-[#141517]',
        isUnlocked: hydrationStats.maxSingleDayMl >= 3000,
        currentValue: Math.min(3000, hydrationStats.maxSingleDayMl),
        targetValue: 3000,
        unit: 'ml em 1 dia',
      },

      // --- TREINOS SEMANAIS CONSECUTIVOS & CONSTÂNCIA ---
      {
        id: 'workout_first',
        category: 'treino',
        title: 'Primeiro Passo',
        description: 'Conclua seu 1º treino registrado no app',
        tier: 'bronze',
        icon: Flame,
        accentColor: 'text-orange-400',
        borderGlow: 'border-orange-500/30 group-hover:border-orange-400/60 shadow-orange-500/10',
        bgGradient: 'from-orange-500/15 via-[#141517] to-[#141517]',
        isUnlocked: workoutStats.totalSessions >= 1,
        currentValue: Math.min(1, workoutStats.totalSessions),
        targetValue: 1,
        unit: 'treino',
      },
      {
        id: 'workout_week_1',
        category: 'treino',
        title: 'Semana Firme',
        description: 'Cumpra a meta de treinos programados em 1 semana',
        tier: 'prata',
        icon: Shield,
        accentColor: 'text-amber-400',
        borderGlow: 'border-amber-500/30 group-hover:border-amber-400/60 shadow-amber-500/15',
        bgGradient: 'from-amber-500/15 via-[#141517] to-[#141517]',
        isUnlocked: workoutStats.thisWeekCount >= workoutStats.weeklyTarget || workoutStats.bestStreak >= 1,
        currentValue: Math.min(workoutStats.weeklyTarget, workoutStats.thisWeekCount),
        targetValue: workoutStats.weeklyTarget,
        unit: 'treinos/sem',
      },
      {
        id: 'workout_streak_2',
        category: 'treino',
        title: 'Chama Dupla (2 Semanas)',
        description: '2 semanas consecutivas cumprindo seus treinos',
        tier: 'ouro',
        icon: Flame,
        accentColor: 'text-[#ff5500]',
        borderGlow: 'border-[#ff5500]/40 group-hover:border-[#ff5500]/70 shadow-[#ff5500]/20',
        bgGradient: 'from-[#ff5500]/20 via-[#141517] to-[#141517]',
        isUnlocked: workoutStats.bestStreak >= 2,
        currentValue: Math.min(2, workoutStats.bestStreak),
        targetValue: 2,
        unit: 'semanas seguidas',
      },
      {
        id: 'workout_streak_4',
        category: 'treino',
        title: 'Titã da Constância (4 Semanas)',
        description: '4 semanas consecutivas mantendo o ritmo de treinos',
        tier: 'diamante',
        icon: Trophy,
        accentColor: 'text-emerald-400',
        borderGlow: 'border-emerald-500/40 group-hover:border-emerald-400/70 shadow-emerald-500/20',
        bgGradient: 'from-emerald-500/20 via-[#141517] to-[#141517]',
        isUnlocked: workoutStats.bestStreak >= 4,
        currentValue: Math.min(4, workoutStats.bestStreak),
        targetValue: 4,
        unit: 'semanas seguidas',
      },
    ];
  }, [hydrationStats, workoutStats]);

  // Filtered achievements
  const filteredAchievements = useMemo(() => {
    if (filter === 'todas') return achievements;
    return achievements.filter((a) => a.category === filter);
  }, [achievements, filter]);

  const unlockedCount = useMemo(() => {
    return achievements.filter((a) => a.isUnlocked).length;
  }, [achievements]);

  const percentUnlocked = Math.round((unlockedCount / achievements.length) * 100);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#141517] p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header with Title and Global Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="h-4 w-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white font-display">
              Conquistas & Emblemas
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Libere emblemas ao cumprir suas metas de água e treinos semanais
          </p>
        </div>

        {/* Global Level Indicator Badge */}
        <div className="flex items-center gap-2.5 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block leading-none">
              Progresso
            </span>
            <span className="text-xs font-bold font-mono text-amber-400">
              {unlockedCount} de {achievements.length} liberados ({percentUnlocked}%)
            </span>
          </div>
          <div className="w-10 h-1.5 bg-zinc-800 rounded-full overflow-hidden shrink-0">
            <div
              style={{ width: `${percentUnlocked}%` }}
              className="h-full bg-gradient-to-r from-amber-500 to-[#ff5500] rounded-full transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(
          [
            { id: 'todas', label: 'Todas as Conquistas' },
            { id: 'treino', label: '🔥 Treinos Consecutivos' },
            { id: 'agua', label: '💧 Hidratação' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filter === tab.id
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                : 'bg-zinc-900/50 text-zinc-400 border border-transparent hover:text-white hover:bg-zinc-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Achievement Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {filteredAchievements.map((item) => {
          const Icon = item.icon;
          const progressPercent = Math.min(
            100,
            Math.round((item.currentValue / item.targetValue) * 100)
          );

          return (
            <div
              key={item.id}
              className={`relative rounded-2xl p-4 transition-all duration-300 border group ${
                item.isUnlocked
                  ? `bg-gradient-to-b ${item.bgGradient} ${item.borderGlow} shadow-lg`
                  : 'bg-zinc-900/40 border-zinc-800/80 opacity-75'
              }`}
            >
              {/* Top row: Icon Badge & Tier Pill */}
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                    item.isUnlocked
                      ? 'bg-zinc-950/80 border border-white/10 shadow-md'
                      : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50'
                  }`}
                >
                  {item.isUnlocked ? (
                    <Icon className={`h-6 w-6 ${item.accentColor}`} />
                  ) : (
                    <Lock className="h-5 w-5 text-zinc-500" />
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-mono border ${
                      item.tier === 'diamante'
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        : item.tier === 'ouro'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : item.tier === 'prata'
                        ? 'bg-slate-300/10 text-slate-300 border-slate-400/30'
                        : 'bg-amber-800/10 text-amber-600 border-amber-700/30'
                    }`}
                  >
                    {item.tier}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1 mb-3">
                <h3
                  className={`text-sm font-bold leading-tight font-sans ${
                    item.isUnlocked ? 'text-white' : 'text-zinc-300'
                  }`}
                >
                  {item.title}
                </h3>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  {item.description}
                </p>
              </div>

              {/* Status and Progress Bar */}
              <div className="pt-2 border-t border-zinc-800/60">
                {item.isUnlocked ? (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Liberado!
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {item.targetValue} {item.unit}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <span>Progresso</span>
                      <span>
                        {item.currentValue} / {item.targetValue} {item.unit}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${progressPercent}%` }}
                        className="h-full bg-zinc-500 rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
