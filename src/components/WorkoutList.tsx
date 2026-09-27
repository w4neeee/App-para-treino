import { useState, useMemo } from 'react';
import {
  Play,
  Plus,
  Edit2,
  Trash2,
  Repeat,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  Info,
  Clock,
  Dumbbell,
  LogIn,
  LogOut,
  User as UserIcon,
  Flame,
  CloudCheck,
  Cloud,
} from 'lucide-react';
import {
  TrainingPlan,
  Workout,
  Exercise,
  WorkoutSession,
  DayOfWeek,
  DAY_OF_WEEK_NAMES,
  DAY_OF_WEEK_SHORT,
} from '../types/workout';
import { getWorkoutCompletionStats } from '../services/storage';
import { MUSCLE_COLORS } from '../services/exerciseLibrary';
import { useAuth } from '../context/AuthContext';

interface WorkoutListProps {
  plan: TrainingPlan;
  sessions: WorkoutSession[];
  onStartWorkout: (workout: Workout) => void;
  onOpenAddExercise: (workout: Workout) => void;
  onOpenEditExercise: (workout: Workout, exercise: Exercise) => void;
  onDeleteExercise: (workoutId: string, exerciseId: string) => void;
  onOpenEditWorkout: (workout: Workout) => void;
  onDeleteWorkout: (workoutId: string) => void;
  onOpenNewWorkout: () => void;
  onOpenPlans: () => void;
}

export function WorkoutList({
  plan,
  sessions,
  onStartWorkout,
  onOpenAddExercise,
  onOpenEditExercise,
  onDeleteExercise,
  onOpenEditWorkout,
  onDeleteWorkout,
  onOpenNewWorkout,
  onOpenPlans,
}: WorkoutListProps) {
  const { user, profile, openProfileModal, signOut } = useAuth();

  // Current day of week (0: Domingo, 1: Segunda, ..., 6: Sábado)
  const currentDayOfWeek = new Date().getDay() as DayOfWeek;
  const currentDayName = DAY_OF_WEEK_NAMES[currentDayOfWeek];

  // Find workout programmed for today (or fallback to first workout)
  const todayScheduledWorkout = useMemo(() => {
    // 1. Look for explicit scheduledDays match
    const match = plan.workouts.find((w) =>
      w.scheduledDays ? w.scheduledDays.includes(currentDayOfWeek) : false
    );
    if (match) return match;

    // 2. If no explicit day mapped, rotate based on day of week or pick first
    return plan.workouts[0] || null;
  }, [plan.workouts, currentDayOfWeek]);

  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>(
    todayScheduledWorkout?.id || plan.workouts[0]?.id || ''
  );

  const selectedWorkout = useMemo(() => {
    return (
      plan.workouts.find((w) => w.id === selectedWorkoutId) ||
      todayScheduledWorkout ||
      plan.workouts[0]
    );
  }, [plan.workouts, selectedWorkoutId, todayScheduledWorkout]);

  const selectedWorkoutStats = useMemo(() => {
    if (!selectedWorkout) return { thisWeekCount: 0, totalCount: 0, lastSessionDate: null };
    return getWorkoutCompletionStats(selectedWorkout.id, sessions);
  }, [selectedWorkout, sessions]);

  const isTodayWorkoutSelected = selectedWorkout?.id === todayScheduledWorkout?.id;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner with Plan name & User Login Status */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                <Sparkles className="h-3 w-3" />
                Plano Ativo
              </span>
              <button
                onClick={onOpenPlans}
                className="text-xs text-zinc-400 hover:text-white underline"
              >
                Trocar plano
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display mt-1">
              {plan.name}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              {plan.description ||
                'Gerencie seus treinos personalizados, adicione exercícios com fotos automáticas da internet e acompanhe sua repetição semanal.'}
            </p>
          </div>

          {/* User Profile / Cloud Sync Info (Always authenticated, cloud sync automatic) */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-zinc-950/80 p-2 rounded-2xl border border-zinc-800">
            {user && (
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={profile?.customName || user.displayName || 'Usuário'}
                    className="h-8 w-8 rounded-full object-cover border border-amber-500/40"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
                <div
                  onClick={openProfileModal}
                  className="hidden xs:block text-left cursor-pointer group"
                  title="Editar perfil (nome e idade)"
                >
                  <p className="text-xs font-bold text-white truncate max-w-[120px] group-hover:text-amber-400 transition-colors">
                    {profile?.customName || user.displayName?.split(' ')[0] || 'Atleta'}
                  </p>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                    <CloudCheck className="h-3 w-3" />
                    <span>Nuvem sincronizada</span>
                  </p>
                </div>
                <button
                  onClick={signOut}
                  title="Sair da conta"
                  className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Workouts selector pills */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {plan.workouts.map((w) => {
            const isSelected = selectedWorkout?.id === w.id;
            const isToday = todayScheduledWorkout?.id === w.id;
            const stats = getWorkoutCompletionStats(w.id, sessions);
            const target = w.weeklyTarget || 1;
            const met = stats.thisWeekCount >= target;

            return (
              <button
                key={w.id}
                onClick={() => setSelectedWorkoutId(w.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-400/20'
                    : 'bg-zinc-950/80 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <span className="truncate max-w-[150px]">{w.name}</span>
                {isToday && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      isSelected ? 'bg-black text-amber-400' : 'bg-amber-400/20 text-amber-400'
                    }`}
                  >
                    HOJE
                  </span>
                )}
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isSelected
                      ? 'bg-black/20 text-black'
                      : met
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {stats.thisWeekCount}/{target} sem
                </span>
              </button>
            );
          })}

          <button
            onClick={onOpenNewWorkout}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Treino</span>
          </button>
        </div>
      </div>

      {/* Selected Workout Detail View */}
      {selectedWorkout ? (
        <div className="space-y-6">
          {/* Workout Card Hero */}
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                {selectedWorkout.coverImage && (
                  <img
                    src={selectedWorkout.coverImage}
                    alt={selectedWorkout.name}
                    className="h-20 w-24 sm:h-24 sm:w-32 rounded-xl object-cover border border-zinc-800 shrink-0"
                  />
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                      {selectedWorkout.name}
                    </h2>
                    <button
                      onClick={() => onOpenEditWorkout(selectedWorkout)}
                      className="p-1 text-zinc-500 hover:text-amber-400 rounded-lg transition-colors"
                      title="Editar Treino"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    {plan.workouts.length > 1 && (
                      <button
                        onClick={() => onDeleteWorkout(selectedWorkout.id)}
                        className="p-1 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                        title="Excluir Treino"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 mt-1 max-w-md">
                    {selectedWorkout.description || 'Treino com foco em intensidade e hipertrofia.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      <Repeat className="h-3.5 w-3.5" />
                      <span>
                        Progresso do Treino: {selectedWorkoutStats.totalCount} de{' '}
                        {selectedWorkout.totalTargetRepeats || 20} vezes realizadas (
                        {Math.round(
                          (selectedWorkoutStats.totalCount /
                            (selectedWorkout.totalTargetRepeats || 20)) *
                            100
                        )}
                        %)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>
                        Nesta semana: <strong>{selectedWorkoutStats.thisWeekCount}</strong>/
                        {selectedWorkout.weeklyTarget || 1}
                      </span>
                    </div>

                    {selectedWorkout.scheduledDays && selectedWorkout.scheduledDays.length > 0 && (
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <Calendar className="h-3.5 w-3.5 text-amber-400" />
                        <span>
                          Programado:{' '}
                          {selectedWorkout.scheduledDays
                            .map((d) => DAY_OF_WEEK_SHORT[d])
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action: Iniciar Treino */}
              <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-2 shrink-0">
                <button
                  onClick={() => onStartWorkout(selectedWorkout)}
                  className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all active:scale-[0.98]"
                >
                  <Play className="h-4 w-4 fill-black" />
                  <span>INICIAR ESTE TREINO</span>
                </button>

                <button
                  onClick={() => onOpenAddExercise(selectedWorkout)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-zinc-700 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 text-amber-400" />
                  <span>Adicionar Exercício</span>
                </button>
              </div>
            </div>
          </div>

          {/* Exercises in This Workout */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Exercícios deste Treino ({selectedWorkout.exercises.length})
                </h3>
                <p className="text-xs text-zinc-400">
                  Imagens e dados obtidos automaticamente pela busca online
                </p>
              </div>

              <button
                onClick={() => onOpenAddExercise(selectedWorkout)}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/20 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Novo Exercício</span>
              </button>
            </div>

            {selectedWorkout.exercises.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-900/30">
                <Dumbbell className="h-10 w-10 text-zinc-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white">Nenhum exercício neste treino ainda</h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  Clique no botão abaixo para adicionar exercícios. O aplicativo buscará imagens e detalhes automaticamente na internet!
                </p>
                <button
                  onClick={() => onOpenAddExercise(selectedWorkout)}
                  className="mt-4 px-4 py-2 text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-xl transition-all"
                >
                  Adicionar Primeiro Exercício
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedWorkout.exercises.map((ex, index) => {
                  const muscleColor = MUSCLE_COLORS[ex.targetMuscle] || MUSCLE_COLORS['Peitoral'];

                  return (
                    <div
                      key={ex.id}
                      className="group rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 transition-all hover:border-zinc-700 flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Exercise photo */}
                        <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700/80 shrink-0">
                          <img
                            src={ex.imageUrl}
                            alt={ex.name}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-zinc-300 font-bold">
                            #{index + 1}
                          </span>
                        </div>

                        {/* Exercise Meta */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-sm font-bold text-white truncate font-display group-hover:text-amber-400 transition-colors">
                              {ex.name}
                            </h4>

                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onOpenEditExercise(selectedWorkout, ex)}
                                className="p-1 text-zinc-500 hover:text-amber-400 rounded transition-colors"
                                title="Editar Exercício"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteExercise(selectedWorkout.id, ex.id)}
                                className="p-1 text-zinc-500 hover:text-red-400 rounded transition-colors"
                                title="Remover Exercício"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${muscleColor.bg} ${muscleColor.text} ${muscleColor.border}`}
                            >
                              {ex.targetMuscle}
                            </span>
                            {ex.equipment && (
                              <span className="text-[11px] text-zinc-400 truncate">
                                {ex.equipment}
                              </span>
                            )}
                          </div>

                          {ex.notes && (
                            <p className="text-[11px] text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                              {ex.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Sets & Reps / Cardio bar at bottom of card */}
                      <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 font-mono">
                        <div className="flex items-center gap-2">
                          {ex.isCardio || ex.targetMuscle === 'Cardio / Funcional' ? (
                            <>
                              <span className="text-zinc-200 font-bold">{ex.defaultSets} bloco(s)</span>
                              <span>·</span>
                              <span className="text-amber-400 font-bold">
                                {ex.defaultDurationMinutes || 20} minutos
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-zinc-200 font-bold">{ex.defaultSets} séries</span>
                              <span>·</span>
                              <span className="text-amber-400 font-semibold">{ex.defaultReps} reps</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                          <Clock className="h-3 w-3 text-amber-400" />
                          <span>
                            {ex.isCardio || ex.targetMuscle === 'Cardio / Funcional'
                              ? 'Cardio'
                              : `${ex.defaultRestSeconds}s descanso`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
