import { useState, useMemo } from 'react';
import {
  Play,
  Settings,
  Flame,
  Check,
  RotateCcw,
  Moon,
  Dumbbell,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import {
  TrainingPlan,
  Workout,
  WorkoutSession,
  DayOfWeek,
  DAY_OF_WEEK_NAMES,
  DailyHydration,
  WeightEntry,
} from '../types/workout';
import { getStartOfWeek, getEndOfWeek } from '../services/storage';
import { useAuth } from '../context/AuthContext';

interface HomeScreenProps {
  plan: TrainingPlan;
  sessions: WorkoutSession[];
  onStartWorkout: (workout: Workout) => void;
  onNavigateToWorkouts: () => void;
  // Hydration state & actions
  todayHydration: DailyHydration;
  onAddWater: (amountMl: number) => void;
  onResetWater?: () => void;
  onRemoveWaterLog: (logId: string) => void;
  onUpdateWaterGoal: (goalMl: number) => void;
  // Weight state & actions
  weightEntries: WeightEntry[];
  onAddWeight: (weightKg: number, date?: string, notes?: string) => void;
  onDeleteWeight: (id: string) => void;
  // Settings trigger
  onOpenSettings?: () => void;
}

export function HomeScreen({
  plan,
  sessions,
  onStartWorkout,
  onNavigateToWorkouts,
  todayHydration,
  onAddWater,
  onResetWater,
  weightEntries,
  onAddWeight,
  onOpenSettings,
}: HomeScreenProps) {
  const { user, profile, openProfileModal } = useAuth();

  // User chosen name display (chosen in onboarding form, e.g. "Gustavo", "Lucas", etc.)
  const userDisplayName = useMemo(() => {
    if (profile?.customName && profile.customName.trim()) {
      return profile.customName.trim();
    }
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    return 'Atleta';
  }, [profile, user]);

  // Today's day of week
  const today = new Date();
  const currentDayOfWeek = today.getDay() as DayOfWeek;

  // Current week boundaries
  const weekStart = useMemo(() => getStartOfWeek(today), [today]);
  const weekEnd = useMemo(() => getEndOfWeek(today), [today]);

  // Sessions completed in current week
  const thisWeekSessions = useMemo(() => {
    return sessions.filter((s) => {
      const d = new Date(s.date);
      return d >= weekStart && d <= weekEnd;
    });
  }, [sessions, weekStart, weekEnd]);

  // Weekly volume in kg
  const weeklyVolumeKg = useMemo(() => {
    return thisWeekSessions.reduce((acc, s) => acc + (s.totalVolumeKg || 0), 0);
  }, [thisWeekSessions]);

  // Total de treinos finalizados (contador geral)
  const totalFinishedWorkouts = sessions.length;

  // Treinos finalizados na semana atual
  const weeklyCompletedCount = thisWeekSessions.length;

  // Frequência Semanal: [S, T, Q, Q, S, S, D]
  const weekDaysConfig: { day: DayOfWeek; letter: string }[] = [
    { day: 1, letter: 'S' },
    { day: 2, letter: 'T' },
    { day: 3, letter: 'Q' },
    { day: 4, letter: 'Q' },
    { day: 5, letter: 'S' },
    { day: 6, letter: 'S' },
    { day: 0, letter: 'D' },
  ];

  const targetFrequency = plan.weeklyFrequency || (plan.activeDays?.length || 5);

  const trackerDays = useMemo(() => {
    return weekDaysConfig.map(({ day, letter }) => {
      const isCompleted = thisWeekSessions.some((s) => {
        const sDate = new Date(s.date);
        return sDate.getDay() === day;
      });
      const isToday = currentDayOfWeek === day;
      const isScheduled = plan.activeDays ? plan.activeDays.includes(day) : true;

      return {
        day,
        letter,
        isCompleted,
        isToday,
        isScheduled,
      };
    });
  }, [weekDaysConfig, thisWeekSessions, currentDayOfWeek, plan.activeDays]);

  // Today's programmed workout & rest day state
  const { todayScheduledWorkout, isRestDay } = useMemo(() => {
    if (!plan || !plan.workouts || plan.workouts.length === 0) {
      return { todayScheduledWorkout: null, isRestDay: true };
    }

    // 1. Check if any workout explicitly lists today in scheduledDays
    const exactMatch = plan.workouts.find((w) =>
      w.scheduledDays && w.scheduledDays.includes(currentDayOfWeek)
    );
    if (exactMatch) {
      return { todayScheduledWorkout: exactMatch, isRestDay: false };
    }

    // 2. Check if any workouts in the plan have scheduledDays set
    const anyWorkoutHasScheduledDays = plan.workouts.some(
      (w) => w.scheduledDays && w.scheduledDays.length > 0
    );
    if (anyWorkoutHasScheduledDays) {
      return { todayScheduledWorkout: null, isRestDay: true };
    }

    // 3. Check plan.activeDays
    if (plan.activeDays && plan.activeDays.length > 0) {
      if (!plan.activeDays.includes(currentDayOfWeek)) {
        return { todayScheduledWorkout: null, isRestDay: true };
      }
      const dayIndex = plan.activeDays.indexOf(currentDayOfWeek);
      const workout = plan.workouts[dayIndex % plan.workouts.length];
      return { todayScheduledWorkout: workout, isRestDay: false };
    }

    // 4. Default: Mon-Fri (1-5) workout, weekend (0 & 6) rest
    if (currentDayOfWeek === 0 || currentDayOfWeek === 6) {
      return { todayScheduledWorkout: null, isRestDay: true };
    }

    const workoutIndex = (currentDayOfWeek - 1) % plan.workouts.length;
    return {
      todayScheduledWorkout: plan.workouts[workoutIndex] || plan.workouts[0],
      isRestDay: false,
    };
  }, [plan, currentDayOfWeek]);

  // Check if today's workout has been completed
  const isTodayWorkoutDone = useMemo(() => {
    if (!todayScheduledWorkout) return false;
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const endOfToday = startOfToday + 86400000;

    return sessions.some((s) => {
      const sessTime = new Date(s.date).getTime();
      return (
        s.workoutId === todayScheduledWorkout.id &&
        sessTime >= startOfToday &&
        sessTime <= endOfToday
      );
    });
  }, [todayScheduledWorkout, sessions, today]);

  // Hydration in Liters: "0.00 L / 2.5 L"
  const currentLiters = (todayHydration.totalMl / 1000).toFixed(2);
  const goalLiters = ((todayHydration.goalMl || 2500) / 1000).toFixed(1);
  const waterProgressPercent = Math.min(
    100,
    Math.round((todayHydration.totalMl / (todayHydration.goalMl || 2500)) * 100)
  );

  // Manual custom water input
  const [customWaterInput, setCustomWaterInput] = useState('');
  const handleCustomWaterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customWaterInput.trim(), 10);
    if (!isNaN(val) && val > 0 && val <= 5000) {
      onAddWater(val);
      setCustomWaterInput('');
    }
  };

  // Weight entries: "87.0 kg"
  const latestWeightEntry = weightEntries[0] || null;
  const currentWeightVal = latestWeightEntry ? latestWeightEntry.weightKg.toFixed(1) : '87.0';
  const [inlineWeightInput, setInlineWeightInput] = useState('');
  const [weightSaveSuccess, setWeightSaveSuccess] = useState(false);

  const handleInlineSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inlineWeightInput.replace(',', '.'));
    if (!isNaN(val) && val > 20 && val < 300) {
      onAddWeight(val);
      setInlineWeightInput('');
      setWeightSaveSuccess(true);
      setTimeout(() => setWeightSaveSuccess(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-md w-full flex flex-col justify-start space-y-2 text-white select-none">
      {/* 1. TOP HEADER: "Olá, Gustavo 🔥" & Contador de Treinos Finalizados + Gear Button */}
      <div className="flex items-center justify-between pt-0.5">
        <div
          onClick={openProfileModal}
          className="cursor-pointer group"
          title="Clique para editar seu nome ou idade"
        >
          <span className="text-[11px] text-zinc-400 font-medium block leading-none mb-0.5">Olá,</span>
          <div className="flex items-center gap-1">
            <h1 className="text-xl font-bold tracking-tight text-white font-sans leading-none group-hover:text-[#ff5500] transition-colors">
              {userDisplayName}
            </h1>
            <span className="text-base">🔥</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Contador de Treinos Finalizados */}
          <div
            title={`Total de treinos finalizados: ${totalFinishedWorkouts}`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#18191c] border border-[#27292d] text-xs font-semibold text-zinc-200 shadow-sm"
          >
            <Flame className="h-3.5 w-3.5 text-[#ff5500] fill-[#ff5500] shrink-0" />
            <span className="whitespace-nowrap font-mono text-[11px]">
              {totalFinishedWorkouts} {totalFinishedWorkouts === 1 ? 'treino' : 'treinos'}
            </span>
          </div>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            title="Configurações e Planos"
            className="h-7 w-7 rounded-full bg-[#202226] hover:bg-[#2b2d33] border border-[#2e3137] flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 2. CARD: FREQUÊNCIA DA SEMANA */}
      <div className="rounded-2xl bg-[#141517] border border-[#222428] p-2.5 sm:p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
            FREQUÊNCIA DA SEMANA
          </span>
          <span className="text-xs font-bold font-mono text-[#ff5500]">
            {weeklyCompletedCount}/{targetFrequency}
          </span>
        </div>

        {/* 7 Círculos: S T Q Q S S D */}
        <div className="grid grid-cols-7 gap-1.5 items-center text-center">
          {trackerDays.map((item, idx) => {
            const isClickableToday = item.isToday && todayScheduledWorkout;

            return (
              <div
                key={idx}
                onClick={() => {
                  if (isClickableToday) {
                    onStartWorkout(todayScheduledWorkout);
                  }
                }}
                className={`flex flex-col items-center gap-1 ${
                  isClickableToday ? 'cursor-pointer group' : ''
                }`}
              >
                <div
                  className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center transition-all ${
                    item.isCompleted
                      ? 'bg-[#ff5500] text-black shadow-md shadow-[#ff5500]/30 font-bold'
                      : item.isToday
                      ? 'border-2 border-[#ff5500] bg-[#ff5500]/10 text-white group-hover:bg-[#ff5500]/20'
                      : 'border border-[#2e3137] bg-transparent'
                  }`}
                >
                  {item.isCompleted ? (
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  ) : item.isToday && !item.isCompleted ? (
                    <Play className="h-2.5 w-2.5 fill-white/80 text-white" />
                  ) : null}
                </div>
                <span
                  className={`text-[10px] font-bold ${
                    item.isToday ? 'text-[#ff5500]' : 'text-zinc-400'
                  }`}
                >
                  {item.letter}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2.1 DIV ABAIXO DO CALENDÁRIO SEMANAL: TREINO PROGRAMADO OU DESCANSO */}
      {!isRestDay && todayScheduledWorkout ? (
        <div className="rounded-xl bg-gradient-to-r from-[#1f1712] via-[#161719] to-[#141517] border border-[#ff5500]/35 px-3 py-2 shadow-sm flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-[#ff5500]/15 border border-[#ff5500]/30 flex items-center justify-center text-[#ff5500] shrink-0">
              <Dumbbell className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#ff5500] leading-none">
                  Treino de Hoje
                </span>
                {isTodayWorkoutDone && (
                  <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 leading-none">
                    Concluído ✓
                  </span>
                )}
              </div>
              <h3 className="text-xs font-bold text-white truncate leading-tight mt-0.5">
                {todayScheduledWorkout.name}
              </h3>
            </div>
          </div>

          <button
            onClick={() => onStartWorkout(todayScheduledWorkout)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#ff5500] hover:bg-[#ff6a1a] text-white font-bold text-[11px] shadow-sm shadow-[#ff5500]/25 transition-all active:scale-95 shrink-0"
          >
            <Play className="h-3 w-3 fill-white stroke-[2]" />
            <span>{isTodayWorkoutDone ? 'Refazer' : 'Iniciar'}</span>
          </button>
        </div>
      ) : (
        <div className="rounded-xl bg-[#141517] border border-[#222428] px-3 py-2 shadow-sm flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Moon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-400 leading-none block">
                Descanso Programado
              </span>
              <h3 className="text-xs font-bold text-white leading-tight mt-0.5">
                Hoje é dia de descanso
              </h3>
            </div>
          </div>

          <button
            onClick={onNavigateToWorkouts}
            className="px-2.5 py-1 rounded-lg bg-[#202226] hover:bg-[#2b2d33] border border-[#2e3137] text-[11px] font-semibold text-zinc-300 hover:text-white transition-colors shrink-0"
          >
            Ver treinos
          </button>
        </div>
      )}

      {/* 3. ROW 2 COLUNAS: VOLUME SEMANAL & TOTAL TREINOS */}
      <div className="grid grid-cols-2 gap-2">
        {/* Card: Volume Semanal */}
        <div className="rounded-2xl bg-[#141517] border border-[#222428] p-2.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5 font-mono">
            VOLUME SEMANAL
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-black font-mono text-[#ff5500] leading-none">
              {weeklyVolumeKg.toLocaleString('pt-BR')}
            </span>
            <span className="text-[10px] font-semibold text-zinc-400">kg</span>
          </div>
        </div>

        {/* Card: Total Treinos */}
        <div className="rounded-2xl bg-[#141517] border border-[#222428] p-2.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5 font-mono">
            TOTAL TREINOS
          </span>
          <span className="text-lg sm:text-xl font-black font-mono text-white leading-none block">
            {totalFinishedWorkouts}
          </span>
        </div>
      </div>

      {/* 4. CARD: ÁGUA DE HOJE */}
      <div className="rounded-2xl bg-[#141517] border border-[#222428] p-2.5 sm:p-3 shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded-sm border border-sky-400 bg-sky-400/20 flex items-center justify-center">
              <span className="text-[9px] text-sky-400 font-bold leading-none">💧</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 font-mono">
              ÁGUA DE HOJE
            </span>
          </div>

          <button
            onClick={() => {
              if (onResetWater) onResetWater();
            }}
            className="text-[10px] font-semibold text-[#ff5500] hover:text-[#ff7733] transition-colors"
          >
            Reiniciar
          </button>
        </div>

        {/* Quantidade em Litros: ex: 0.00 L / 2.5 L */}
        <div className="flex items-baseline gap-1 mb-1.5">
          <span className="text-2xl font-black font-mono text-white leading-none">
            {currentLiters}
          </span>
          <span className="text-xs font-bold text-zinc-400 leading-none">
            L / {goalLiters} L
          </span>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full h-1.5 bg-[#202226] rounded-full overflow-hidden mb-2">
          <div
            style={{ width: `${waterProgressPercent}%` }}
            className="h-full bg-sky-400 rounded-full transition-all duration-300"
          />
        </div>

        {/* 3 Botões de Consumo Rápido: +200 ml, +300 ml, +500 ml */}
        <div className="grid grid-cols-3 gap-1.5 mb-1.5">
          <button
            type="button"
            onClick={() => onAddWater(200)}
            className="py-1.5 rounded-xl bg-[#202226] hover:bg-[#2b2d33] border border-[#2e3137] text-[11px] font-bold text-zinc-200 transition-all active:scale-[0.97]"
          >
            +200 ml
          </button>

          <button
            type="button"
            onClick={() => onAddWater(300)}
            className="py-1.5 rounded-xl bg-[#202226] hover:bg-[#2b2d33] border border-[#2e3137] text-[11px] font-bold text-zinc-200 transition-all active:scale-[0.97]"
          >
            +300 ml
          </button>

          <button
            type="button"
            onClick={() => onAddWater(500)}
            className="py-1.5 rounded-xl bg-[#202226] hover:bg-[#2b2d33] border border-[#2e3137] text-[11px] font-bold text-zinc-200 transition-all active:scale-[0.97]"
          >
            +500 ml
          </button>
        </div>

        {/* Campo manual: Adicionar valor livre em ml */}
        <form onSubmit={handleCustomWaterSubmit} className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <input
              type="number"
              min="10"
              max="5000"
              step="10"
              placeholder="Outro valor (ml)"
              value={customWaterInput}
              onChange={(e) => setCustomWaterInput(e.target.value)}
              className="w-full rounded-xl bg-[#1c1e22] border border-[#2e3137] px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-sky-400 font-mono"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 font-mono pointer-events-none">
              ml
            </span>
          </div>

          <button
            type="submit"
            disabled={!customWaterInput || parseInt(customWaterInput, 10) <= 0}
            className="px-3 py-1.5 rounded-xl bg-sky-400 hover:bg-sky-300 disabled:opacity-40 disabled:hover:bg-sky-400 text-black font-bold text-xs transition-all active:scale-95 shadow-sm shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            <span>Adicionar</span>
          </button>
        </form>
      </div>

      {/* 5. CARD: PESO CORPORAL */}
      <div className="rounded-2xl bg-[#141517] border border-[#222428] p-2.5 sm:p-3 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded-sm border border-[#ff5500] bg-[#ff5500]/20 flex items-center justify-center">
              <span className="text-[9px] text-[#ff5500] font-bold leading-none">⚖️</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 font-mono">
              PESO CORPORAL
            </span>
          </div>

          <span className="text-[10px] font-mono text-zinc-400">
            {latestWeightEntry ? `${latestWeightEntry.weightKg.toFixed(1)} kg` : '0.0 kg'}
          </span>
        </div>

        {/* Peso em destaque: 87.0 kg */}
        <div className="flex items-baseline gap-1 mb-1.5">
          <span className="text-2xl font-black font-mono text-white leading-none">
            {currentWeightVal}
          </span>
          <span className="text-xs font-bold text-zinc-400 leading-none">kg</span>
        </div>

        {/* Formulário Inline: Input "Novo peso (kg)" + Botão Laranja "Salvar" */}
        <form onSubmit={handleInlineSaveWeight} className="flex items-center gap-1.5">
          <input
            type="number"
            step="0.1"
            min="30"
            max="300"
            placeholder="Novo peso (kg)"
            value={inlineWeightInput}
            onChange={(e) => setInlineWeightInput(e.target.value)}
            className="flex-1 rounded-xl bg-[#1c1e22] border border-[#2e3137] px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#ff5500]"
          />

          <button
            type="submit"
            className="px-4 py-1.5 rounded-xl bg-[#ff5500] hover:bg-[#ff6a1a] text-white font-bold text-xs transition-all active:scale-95 shadow-sm shrink-0"
          >
            {weightSaveSuccess ? 'Salvo!' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  );
}
