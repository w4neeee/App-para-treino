import { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Plus,
  Trash2,
  Clock,
  ChevronLeft,
  Flame,
  Award,
  Calendar,
  AlertCircle,
  HelpCircle,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Workout, LoggedExercise, WorkoutSession } from '../types/workout';
import { MUSCLE_COLORS } from '../services/exerciseLibrary';
import { playCheckSetSound, playTimerDoneBeep } from '../utils/sound';

interface WorkoutPlayerProps {
  workout: Workout;
  planId: string;
  onFinishWorkout: (session: WorkoutSession) => void;
  onCancel: () => void;
  previousSessions?: WorkoutSession[];
}

export function WorkoutPlayer({
  workout,
  planId,
  onFinishWorkout,
  onCancel,
  previousSessions = [],
}: WorkoutPlayerProps) {
  // Timer state for overall workout duration
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Rest Timer state
  const [restRemaining, setRestRemaining] = useState<number | null>(null);
  const [restInitial, setRestInitial] = useState<number>(60);
  const [isRestActive, setIsRestActive] = useState(false);

  // Exercise notes modal / info
  const [activeInfoExercise, setActiveInfoExercise] = useState<string | null>(null);

  // Initialize logged exercises from workout definitions & previous session values
  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>(() => {
    const previousSameWorkout = previousSessions.find((s) => s.workoutId === workout.id);

    return workout.exercises.map((ex) => {
      const isExerciseCardio =
        ex.isCardio ||
        ex.targetMuscle === 'Cardio / Funcional' ||
        /esteira|bicicleta|bike|cardio|corrida|eliptico|transport|corda/i.test(ex.name);

      const prevLog = previousSameWorkout?.exercises.find((pe) => pe.exerciseId === ex.id);

      const numSets = ex.defaultSets || (isExerciseCardio ? 1 : 3);
      const parsedReps = parseInt(ex.defaultReps.split('-')[0]) || (isExerciseCardio ? 1 : 10);
      const defDuration = ex.defaultDurationMinutes || 20;

      const sets = Array.from({ length: numSets }, (_, idx) => {
        const prevSet = prevLog?.sets[idx];
        return {
          id: `set_${ex.id}_${idx + 1}`,
          setNumber: idx + 1,
          weight: prevSet?.weight ?? 0,
          reps: prevSet?.reps ?? parsedReps,
          durationMinutes: prevSet?.durationMinutes ?? defDuration,
          completed: false,
          previousWeight: prevSet?.weight,
          previousReps: prevSet?.reps,
          previousDurationMinutes: prevSet?.durationMinutes,
        };
      });

      return {
        exerciseId: ex.id,
        exerciseName: ex.name,
        targetMuscle: ex.targetMuscle,
        imageUrl: ex.imageUrl,
        notes: ex.notes,
        isCardio: isExerciseCardio,
        durationMinutes: defDuration,
        isFinished: false,
        sets,
      };
    });
  });

  // Workout duration counter
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Rest timer countdown
  useEffect(() => {
    if (!isRestActive || restRemaining === null || restRemaining <= 0) return;

    const timer = setInterval(() => {
      setRestRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setIsRestActive(false);
          playTimerDoneBeep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRestActive, restRemaining]);

  const startRestTimer = (seconds: number) => {
    setRestInitial(seconds);
    setRestRemaining(seconds);
    setIsRestActive(true);
  };

  const cancelRestTimer = () => {
    setIsRestActive(false);
    setRestRemaining(null);
  };

  const handleToggleSet = (exerciseId: string, setId: string, restSecs: number) => {
    let nowCompleted = false;

    setLoggedExercises((prev) =>
      prev.map((ex) => {
        if (ex.exerciseId !== exerciseId) return ex;
        const newSets = ex.sets.map((s) => {
          if (s.id === setId) {
            nowCompleted = !s.completed;
            return { ...s, completed: nowCompleted };
          }
          return s;
        });

        // If all sets are checked, auto-mark exercise finished
        const allChecked = newSets.every((s) => s.completed);

        return {
          ...ex,
          sets: newSets,
          isFinished: allChecked ? true : ex.isFinished,
        };
      })
    );

    if (nowCompleted) {
      playCheckSetSound();
      startRestTimer(restSecs || 60);
    }
  };

  // Toggle exercise individual finished status
  const handleToggleExerciseFinished = (exerciseId: string) => {
    playCheckSetSound();
    setLoggedExercises((prev) =>
      prev.map((ex) => {
        if (ex.exerciseId !== exerciseId) return ex;
        const willBeFinished = !ex.isFinished;
        return {
          ...ex,
          isFinished: willBeFinished,
          // If marking finished, ensure at least all currently entered sets are marked completed
          sets: willBeFinished
            ? ex.sets.map((s) => ({ ...s, completed: true }))
            : ex.sets,
        };
      })
    );
  };

  const handleUpdateWeight = (exerciseId: string, setId: string, weight: number) => {
    setLoggedExercises((prev) =>
      prev.map((ex) => {
        if (ex.exerciseId !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, weight } : s)),
        };
      })
    );
  };

  const handleUpdateReps = (exerciseId: string, setId: string, reps: number) => {
    setLoggedExercises((prev) =>
      prev.map((ex) => {
        if (ex.exerciseId !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, reps } : s)),
        };
      })
    );
  };

  const handleUpdateDuration = (exerciseId: string, setId: string, durationMinutes: number) => {
    setLoggedExercises((prev) =>
      prev.map((ex) => {
        if (ex.exerciseId !== exerciseId) return ex;
        return {
          ...ex,
          durationMinutes,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, durationMinutes } : s)),
        };
      })
    );
  };

  const handleAddSet = (exerciseId: string) => {
    setLoggedExercises((prev) =>
      prev.map((ex) => {
        if (ex.exerciseId !== exerciseId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSetNumber = ex.sets.length + 1;
        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              id: `set_${exerciseId}_${newSetNumber}_${Date.now()}`,
              setNumber: newSetNumber,
              weight: lastSet ? lastSet.weight : 0,
              reps: lastSet ? lastSet.reps : 10,
              completed: false,
            },
          ],
        };
      })
    );
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    setLoggedExercises((prev) =>
      prev.map((ex) => {
        if (ex.exerciseId !== exerciseId) return ex;
        const filtered = ex.sets.filter((s) => s.id !== setId);
        return {
          ...ex,
          sets: filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 })),
        };
      })
    );
  };

  // Calculations for summary stats
  const totalCompletedSets = loggedExercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalPlannedSets = loggedExercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  const finishedExercisesCount = loggedExercises.filter((e) => e.isFinished).length;

  const totalVolumeKg = loggedExercises.reduce((acc, ex) => {
    return (
      acc +
      ex.sets
        .filter((s) => s.completed)
        .reduce((sAcc, s) => sAcc + (s.weight || 0) * (s.reps || 0), 0)
    );
  }, 0);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleFinishWorkoutClick = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // Ignore
    }

    const session: WorkoutSession = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      planId,
      workoutId: workout.id,
      workoutName: workout.name,
      date: new Date().toISOString(),
      durationSeconds: secondsElapsed,
      exercises: loggedExercises,
      totalVolumeKg,
      totalCompletedSets,
      notes: `Treino finalizado com sucesso! ${totalCompletedSets} séries e ${totalVolumeKg.toLocaleString()}kg registrados.`,
    };

    onFinishWorkout(session);
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-36 text-zinc-100">
      {/* Sticky Top Bar with Workout Timer & Controls */}
      <div className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Voltar</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full text-xs font-mono font-medium text-amber-400">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTime(secondsElapsed)}</span>
            </div>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors border border-zinc-800"
              title={isPaused ? 'Continuar Treino' : 'Pausar'}
            >
              {isPaused ? (
                <Play className="h-4 w-4 fill-amber-400 text-amber-400" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Botão Finalizar Treino no Header */}
          <button
            onClick={handleFinishWorkoutClick}
            disabled={totalCompletedSets === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 transition-all shadow-md active:scale-95 disabled:opacity-40"
          >
            <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
            <span>Finalizar Treino</span>
          </button>
        </div>
      </div>

      {/* Main workout arena */}
      <div className="mx-auto max-w-4xl px-4 pt-5 sm:px-6 space-y-6">
        {/* Workout header card */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Treino em Andamento
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white font-display mt-0.5">
                {workout.name}
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Adicione as repetições e cargas de cada série. Use o botão{' '}
                <strong className="text-emerald-400">Finalizar Exercício</strong> para concluir cada etapa.
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-end gap-1 text-right">
              <span className="text-xs text-zinc-400">Exercícios Concluídos</span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                {finishedExercisesCount} / {loggedExercises.length}
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-zinc-800/80">
            <div className="bg-zinc-950/60 rounded-xl p-2.5 text-center border border-zinc-800/50">
              <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Séries Feitas</span>
              <span className="text-base sm:text-lg font-bold text-white font-mono">
                {totalCompletedSets} <span className="text-xs text-zinc-500 font-normal">/ {totalPlannedSets}</span>
              </span>
            </div>

            <div className="bg-zinc-950/60 rounded-xl p-2.5 text-center border border-zinc-800/50">
              <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Volume Total</span>
              <span className="text-base sm:text-lg font-bold text-amber-400 font-mono">
                {totalVolumeKg.toLocaleString()} <span className="text-xs text-zinc-400 font-normal">kg</span>
              </span>
            </div>

            <div className="bg-zinc-950/60 rounded-xl p-2.5 text-center border border-zinc-800/50">
              <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Tempo Total</span>
              <span className="text-base sm:text-lg font-bold text-white font-mono">
                {formatTime(secondsElapsed)}
              </span>
            </div>
          </div>
        </div>

        {/* Exercises List */}
        <div className="space-y-5">
          {loggedExercises.map((ex, exIndex) => {
            const muscleColor = MUSCLE_COLORS[ex.targetMuscle] || MUSCLE_COLORS['Peitoral'];
            const origExercise = workout.exercises.find((e) => e.id === ex.exerciseId);
            const isExerciseFinished = ex.isFinished;

            return (
              <div
                key={ex.exerciseId}
                className={`rounded-2xl border transition-all overflow-hidden shadow-sm ${
                  isExerciseFinished
                    ? 'border-emerald-500/40 bg-zinc-900/40'
                    : 'border-zinc-800 bg-zinc-900/70 hover:border-zinc-700/80'
                }`}
              >
                {/* Exercise Header */}
                <div className="flex items-center gap-3 p-4 bg-zinc-900/90 border-b border-zinc-800">
                  <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
                    <img
                      src={ex.imageUrl}
                      alt={ex.exerciseName}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {isExerciseFinished && (
                      <div className="absolute inset-0 bg-emerald-950/70 flex items-center justify-center">
                        <Check className="h-6 w-6 text-emerald-400 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        #{exIndex + 1}
                      </span>
                      <h3
                        className={`text-sm sm:text-base font-bold truncate font-display ${
                          isExerciseFinished ? 'text-zinc-300 line-through' : 'text-white'
                        }`}
                      >
                        {ex.exerciseName}
                      </h3>
                      {isExerciseFinished && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Finalizado
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${muscleColor.bg} ${muscleColor.text} ${muscleColor.border}`}
                      >
                        {ex.targetMuscle}
                      </span>
                      {origExercise?.equipment && (
                        <span className="text-[11px] text-zinc-400 truncate">
                          · {origExercise.equipment}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botão Finalizar Exercício Individual */}
                  <button
                    type="button"
                    onClick={() => handleToggleExerciseFinished(ex.exerciseId)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
                      isExerciseFinished
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-200 border border-zinc-700 hover:border-emerald-500/50 hover:text-emerald-300'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">
                      {isExerciseFinished ? 'Concluído' : 'Finalizar Exercício'}
                    </span>
                  </button>
                </div>

                {/* Sets / Cardio Table */}
                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                        <th className="pb-2 w-12 text-center">
                          {ex.isCardio ? 'Bloco' : 'Série'}
                        </th>
                        <th className="pb-2 text-zinc-400">Anterior</th>
                        {ex.isCardio ? (
                          <>
                            <th className="pb-2 w-36 text-amber-400">
                              Tempo de Exercício (min)
                            </th>
                            <th className="pb-2 w-28">Nível / Carga</th>
                          </>
                        ) : (
                          <>
                            <th className="pb-2 w-28">Carga (kg)</th>
                            <th className="pb-2 w-28">Repetições</th>
                          </>
                        )}
                        <th className="pb-2 w-16 text-center">Check</th>
                        <th className="pb-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {ex.sets.map((set) => (
                        <tr
                          key={set.id}
                          className={`transition-colors ${
                            set.completed ? 'bg-amber-500/5' : 'hover:bg-zinc-800/30'
                          }`}
                        >
                          <td className="py-2.5 text-center font-mono font-bold text-xs text-zinc-400">
                            {set.setNumber}
                          </td>

                          <td className="py-2.5 text-xs text-zinc-400 font-mono">
                            {ex.isCardio ? (
                              set.previousDurationMinutes !== undefined ? (
                                <span>{set.previousDurationMinutes} min</span>
                              ) : (
                                <span className="text-zinc-500">-</span>
                              )
                            ) : set.previousWeight !== undefined ? (
                              <span>
                                {set.previousWeight}kg × {set.previousReps}
                              </span>
                            ) : (
                              <span className="text-zinc-500">-</span>
                            )}
                          </td>

                          {ex.isCardio ? (
                            <>
                              {/* Campo de Tempo de Exercício (minutos) */}
                              <td className="py-2.5 pr-2">
                                <div className="relative flex items-center">
                                  <input
                                    type="number"
                                    min="1"
                                    max="300"
                                    value={set.durationMinutes || ''}
                                    onChange={(e) =>
                                      handleUpdateDuration(
                                        ex.exerciseId,
                                        set.id,
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    placeholder="20 min"
                                    className={`w-full rounded-lg bg-zinc-950 border px-3 py-1.5 text-sm font-mono font-bold text-center focus:outline-none transition-colors ${
                                      set.completed
                                        ? 'border-amber-500/40 text-amber-300'
                                        : 'border-zinc-800 text-white focus:border-amber-400'
                                    }`}
                                  />
                                </div>
                              </td>

                              {/* Opcional: Nível / Carga / Velocidade */}
                              <td className="py-2.5 pr-2">
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  value={set.weight === 0 ? '' : set.weight}
                                  onChange={(e) =>
                                    handleUpdateWeight(
                                      ex.exerciseId,
                                      set.id,
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  placeholder="Nível / Vel"
                                  className={`w-full rounded-lg bg-zinc-950 border px-3 py-1.5 text-sm font-mono text-center focus:outline-none transition-colors ${
                                    set.completed
                                      ? 'border-amber-500/40 text-amber-300'
                                      : 'border-zinc-800 text-white focus:border-amber-400'
                                  }`}
                                />
                              </td>
                            </>
                          ) : (
                            <>
                              {/* Campo para Carga */}
                              <td className="py-2.5 pr-2">
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  value={set.weight === 0 ? '' : set.weight}
                                  onChange={(e) =>
                                    handleUpdateWeight(
                                      ex.exerciseId,
                                      set.id,
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  placeholder="0 kg"
                                  className={`w-full rounded-lg bg-zinc-950 border px-3 py-1.5 text-sm font-mono font-bold text-center focus:outline-none transition-colors ${
                                    set.completed
                                      ? 'border-amber-500/40 text-amber-300'
                                      : 'border-zinc-800 text-white focus:border-amber-400'
                                  }`}
                                />
                              </td>

                              {/* Campo para Repetições */}
                              <td className="py-2.5 pr-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={set.reps === 0 ? '' : set.reps}
                                  onChange={(e) =>
                                    handleUpdateReps(
                                      ex.exerciseId,
                                      set.id,
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  placeholder="10 reps"
                                  className={`w-full rounded-lg bg-zinc-950 border px-3 py-1.5 text-sm font-mono font-bold text-center focus:outline-none transition-colors ${
                                    set.completed
                                      ? 'border-amber-500/40 text-amber-300'
                                      : 'border-zinc-800 text-white focus:border-amber-400'
                                  }`}
                                />
                              </td>
                            </>
                          )}

                          <td className="py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleSet(
                                  ex.exerciseId,
                                  set.id,
                                  origExercise?.defaultRestSeconds || 60
                                )
                              }
                              className={`inline-flex items-center justify-center h-8 w-8 rounded-lg transition-all active:scale-90 ${
                                set.completed
                                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700'
                              }`}
                              title={set.completed ? 'Desmarcar' : 'Concluir'}
                            >
                              <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
                            </button>
                          </td>

                          <td className="py-2.5 text-center">
                            {ex.sets.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSet(ex.exerciseId, set.id)}
                                className="p-1 rounded text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Remover"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Add set button & Finalizar Exercício footer */}
                  <div className="mt-3 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddSet(ex.exerciseId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Adicionar Série</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleExerciseFinished(ex.exerciseId)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isExerciseFinished
                          ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                          : 'text-zinc-300 hover:text-emerald-300 bg-zinc-800/60 border border-zinc-700 hover:border-emerald-500/40'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>{isExerciseFinished ? 'Exercício Concluído' : 'Finalizar Este Exercício'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Big Bottom Action: Finalizar o Treino do Dia */}
        <div className="pt-4 sticky bottom-4 z-30">
          <button
            type="button"
            onClick={handleFinishWorkoutClick}
            disabled={totalCompletedSets === 0}
            className="w-full py-4 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-base shadow-xl shadow-amber-400/25 flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] disabled:opacity-40"
          >
            <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
            <span>FINALIZAR TREINO DO DIA & SALVAR INFORMAÇÕES</span>
          </button>
        </div>
      </div>

      {/* Floating Rest Timer */}
      {isRestActive && restRemaining !== null && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-5 py-3 rounded-2xl bg-zinc-900 border border-amber-500/40 shadow-2xl shadow-black/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-bold text-sm">
              {restRemaining}s
            </div>
            <div>
              <p className="text-xs font-bold text-white">Tempo de Descanso</p>
              <p className="text-[11px] text-zinc-400">Respire e prepare a próxima série</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-800">
            <button
              onClick={() => setRestRemaining((prev) => (prev !== null ? prev + 30 : 30))}
              className="px-2.5 py-1 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
            >
              +30s
            </button>
            <button
              onClick={cancelRestTimer}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title="Pular Descanso"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
