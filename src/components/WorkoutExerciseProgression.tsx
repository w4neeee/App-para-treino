import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Dumbbell,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { WorkoutSession, TrainingPlan, Workout, Exercise } from '../types/workout';
import { MUSCLE_COLORS } from '../services/exerciseLibrary';

interface WorkoutExerciseProgressionProps {
  sessions: WorkoutSession[];
  activePlan: TrainingPlan | null;
}

interface SessionExercisePoint {
  sessionId: string;
  sessionIndex: number;
  sessionLabel: string;
  dateStr: string;
  fullDate: string;
  maxWeightKg: number;
  avgWeightKg: number;
  setsCount: number;
  avgReps: number;
  setsDetail: string;
  rawSets: { setNumber: number; reps: number; weight: number }[];
}

export function WorkoutExerciseProgression({
  sessions,
  activePlan,
}: WorkoutExerciseProgressionProps) {
  // 1. Build list of available workouts for dropdown
  const availableWorkouts = useMemo(() => {
    const list: { id: string; name: string; exercises: Exercise[] }[] = [];

    // From active plan
    if (activePlan?.workouts) {
      for (const w of activePlan.workouts) {
        list.push({
          id: w.id,
          name: w.name,
          exercises: w.exercises || [],
        });
      }
    }

    // Also include any other workout names present in sessions
    for (const sess of sessions) {
      if (!list.some((item) => item.id === sess.workoutId || item.name.toLowerCase() === sess.workoutName.toLowerCase())) {
        list.push({
          id: sess.workoutId,
          name: sess.workoutName,
          exercises: [],
        });
      }
    }

    return list;
  }, [activePlan, sessions]);

  // Selected workout ID in the dropdown
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>(() => {
    return availableWorkouts[0]?.id || '';
  });

  // Ensure valid selection if list updates
  const currentWorkout = useMemo(() => {
    return (
      availableWorkouts.find((w) => w.id === selectedWorkoutId) ||
      availableWorkouts[0] ||
      null
    );
  }, [availableWorkouts, selectedWorkoutId]);

  // 2. Identify all exercises for the chosen workout
  const workoutExercises = useMemo(() => {
    if (!currentWorkout) return [];

    const map = new Map<string, { id: string; name: string; targetMuscle: string }>();

    // From workout definition
    for (const ex of currentWorkout.exercises) {
      map.set(ex.name.toLowerCase(), {
        id: ex.id,
        name: ex.name,
        targetMuscle: ex.targetMuscle,
      });
    }

    // From recorded sessions of this workout
    const relatedSessions = sessions.filter(
      (s) =>
        s.workoutId === currentWorkout.id ||
        s.workoutName.toLowerCase() === currentWorkout.name.toLowerCase()
    );

    for (const sess of relatedSessions) {
      for (const ex of sess.exercises) {
        if (!map.has(ex.exerciseName.toLowerCase())) {
          map.set(ex.exerciseName.toLowerCase(), {
            id: ex.exerciseId,
            name: ex.exerciseName,
            targetMuscle: ex.targetMuscle,
          });
        }
      }
    }

    return Array.from(map.values());
  }, [currentWorkout, sessions]);

  // 3. For each exercise, extract session-by-session progression points
  const exercisesProgressionData = useMemo(() => {
    if (!currentWorkout || workoutExercises.length === 0) return [];

    // Filter sessions belonging to this workout and sort chronologically (oldest -> newest)
    const relatedSessions = [...sessions]
      .filter(
        (s) =>
          s.workoutId === currentWorkout.id ||
          s.workoutName.toLowerCase() === currentWorkout.name.toLowerCase()
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return workoutExercises.map((ex) => {
      const progressionPoints: SessionExercisePoint[] = [];

      relatedSessions.forEach((sess, idx) => {
        const found = sess.exercises.find(
          (e) =>
            e.exerciseId === ex.id ||
            e.exerciseName.toLowerCase() === ex.name.toLowerCase()
        );

        if (!found || !found.sets || found.sets.length === 0) return;

        // Completed sets with weight/reps
        const completedSets = found.sets.filter((s) => s.completed && s.weight >= 0 && s.reps > 0);
        if (completedSets.length === 0) return;

        const maxWeight = Math.max(...completedSets.map((s) => s.weight));
        const totalWeight = completedSets.reduce((acc, s) => acc + s.weight, 0);
        const avgWeight = Math.round((totalWeight / completedSets.length) * 10) / 10;
        const totalReps = completedSets.reduce((acc, s) => acc + s.reps, 0);
        const avgReps = Math.round((totalReps / completedSets.length) * 10) / 10;

        const d = new Date(sess.date);
        const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        const fullDate = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

        const rawSets = completedSets.map((s) => ({
          setNumber: s.setNumber,
          reps: s.reps,
          weight: s.weight,
        }));

        const setsDetail = completedSets
          .map((s) => `${s.reps} reps × ${s.weight}kg`)
          .join(' • ');

        progressionPoints.push({
          sessionId: sess.id,
          sessionIndex: progressionPoints.length + 1,
          sessionLabel: `Treino ${progressionPoints.length + 1}`,
          dateStr,
          fullDate,
          maxWeightKg: maxWeight,
          avgWeightKg: avgWeight,
          setsCount: completedSets.length,
          avgReps,
          setsDetail,
          rawSets,
        });
      });

      // Compute progression difference between first and latest session
      let diffWeight = 0;
      let diffPercent = 0;
      let diffReps = 0;
      let initialPoint: SessionExercisePoint | null = null;
      let latestPoint: SessionExercisePoint | null = null;

      if (progressionPoints.length > 0) {
        initialPoint = progressionPoints[0];
        latestPoint = progressionPoints[progressionPoints.length - 1];
        diffWeight = Number((latestPoint.maxWeightKg - initialPoint.maxWeightKg).toFixed(1));
        diffReps = Number((latestPoint.avgReps - initialPoint.avgReps).toFixed(1));
        if (initialPoint.maxWeightKg > 0) {
          diffPercent = Math.round((diffWeight / initialPoint.maxWeightKg) * 100);
        }
      }

      return {
        exercise: ex,
        points: progressionPoints,
        initialPoint,
        latestPoint,
        diffWeight,
        diffPercent,
        diffReps,
      };
    });
  }, [currentWorkout, workoutExercises, sessions]);

  return (
    <div className="space-y-4">
      {/* Selector Header Bar */}
      <div className="rounded-2xl border border-zinc-800 bg-[#141517] p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-[#ff5500]/15 border border-[#ff5500]/30 flex items-center justify-center text-[#ff5500]">
                <Dumbbell className="h-4 w-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white font-display">
                Avanço nos Treinos (Por Exercício)
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Compare a carga e repetições entre cada treino executado
            </p>
          </div>

          {/* Workout Select Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
            <span className="text-xs font-semibold text-zinc-400 font-mono whitespace-nowrap">
              Treino:
            </span>
            <div className="relative flex-1 sm:w-64">
              <select
                value={currentWorkout?.id || ''}
                onChange={(e) => setSelectedWorkoutId(e.target.value)}
                className="w-full appearance-none rounded-xl bg-[#1c1e22] border border-[#2e3137] px-3.5 py-2 pr-9 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-[#ff5500] cursor-pointer"
              >
                {availableWorkouts.map((w) => (
                  <option key={w.id} value={w.id} className="bg-zinc-900 text-white">
                    {w.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Progression Cards */}
      {exercisesProgressionData.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-[#141517] p-8 text-center text-zinc-500 text-xs sm:text-sm">
          <Layers className="h-8 w-8 mx-auto mb-2 text-zinc-600 stroke-[1.5]" />
          Nenhum exercício encontrado para o treino selecionado.
        </div>
      ) : (
        <div className="space-y-4">
          {exercisesProgressionData.map((item) => {
            const { exercise, points, initialPoint, latestPoint, diffWeight, diffPercent } = item;
            const hasData = points.length > 0;
            const hasEvolution = points.length >= 2;

            return (
              <div
                key={exercise.id || exercise.name}
                className="rounded-2xl border border-zinc-800 bg-[#141517] p-4 sm:p-5 shadow-sm space-y-3.5"
              >
                {/* Header of Exercise Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const colorStyle = (MUSCLE_COLORS as any)[exercise.targetMuscle] || {
                        bg: 'bg-zinc-800',
                        text: 'text-zinc-300',
                        border: 'border-zinc-700',
                      };
                      return (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${colorStyle.bg} ${colorStyle.text} ${colorStyle.border}`}
                        >
                          {exercise.targetMuscle || 'Geral'}
                        </span>
                      );
                    })()}
                    <h3 className="text-sm sm:text-base font-bold text-white font-sans">
                      {exercise.name}
                    </h3>
                  </div>

                  {/* Progression Badge */}
                  {hasEvolution && latestPoint && initialPoint && (
                    <div className="flex items-center gap-2">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold font-mono border ${
                          diffWeight > 0
                            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                            : diffWeight < 0
                            ? 'bg-rose-500/10 border-rose-500/25 text-rose-400'
                            : 'bg-zinc-800/80 border-zinc-700 text-zinc-300'
                        }`}
                      >
                        {diffWeight > 0 ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : diffWeight < 0 ? (
                          <TrendingDown className="h-3.5 w-3.5" />
                        ) : (
                          <Minus className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {diffWeight > 0 ? `+${diffWeight} kg` : `${diffWeight} kg`}
                          {diffPercent !== 0 && ` (${diffPercent > 0 ? `+${diffPercent}%` : `${diffPercent}%`})`}
                        </span>
                      </div>

                      <span className="text-[11px] text-zinc-400 font-mono">
                        {initialPoint.maxWeightKg}kg →{' '}
                        <strong className="text-white font-bold">{latestPoint.maxWeightKg}kg</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Body: Chart or Empty/Single State */}
                {!hasData ? (
                  <div className="py-6 text-center text-zinc-500 text-xs">
                    <Dumbbell className="h-6 w-6 mx-auto mb-1.5 text-zinc-600 stroke-[1.5]" />
                    Ainda não há registros de execução para este exercício. Conclua este treino para iniciar o acompanhamento!
                  </div>
                ) : points.length === 1 ? (
                  <div className="py-4 px-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Sparkles className="h-4 w-4 text-[#ff5500] shrink-0" />
                      <span>
                        1º Treino registrado ({points[0].fullDate}):{' '}
                        <strong className="text-white">
                          {points[0].setsCount} séries • {points[0].maxWeightKg} kg
                        </strong>
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 italic">
                      Execute este treino novamente para ver a linha do avanço de carga!
                    </span>
                  </div>
                ) : (
                  <div>
                    {/* Recharts Line Chart: Progression of Load & Reps */}
                    <div className="h-48 w-full mt-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={points} margin={{ top: 10, right: 15, left: -22, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#222428" vertical={false} />
                          <XAxis
                            dataKey="dateStr"
                            stroke="#52525b"
                            fontSize={11}
                            tickLine={false}
                            axisLine={{ stroke: '#27292d' }}
                          />
                          <YAxis
                            stroke="#52525b"
                            fontSize={11}
                            tickLine={false}
                            axisLine={{ stroke: '#27292d' }}
                            unit="kg"
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const d = payload[0].payload as SessionExercisePoint;
                                return (
                                  <div className="rounded-xl bg-[#1b1d21] border border-[#2e3137] p-2.5 shadow-xl text-xs space-y-1">
                                    <div className="flex items-center justify-between gap-3 text-zinc-400 text-[10px]">
                                      <span>{d.sessionLabel}</span>
                                      <span>{d.fullDate}</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                      <span className="text-base font-black text-[#ff5500] font-mono">
                                        {d.maxWeightKg} kg
                                      </span>
                                      <span className="text-zinc-400 text-[10px]">
                                        (média {d.avgWeightKg} kg)
                                      </span>
                                    </div>
                                    <div className="text-zinc-300 text-[11px] border-t border-zinc-800 pt-1">
                                      <span>{d.setsCount} séries executadas</span>
                                    </div>
                                    <div className="text-[10px] text-zinc-400">
                                      {d.rawSets.map((s) => (
                                        <span key={s.setNumber} className="inline-block mr-2">
                                          S{s.setNumber}: {s.reps}r×{s.weight}kg
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="maxWeightKg"
                            stroke="#ff5500"
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: '#ff5500', strokeWidth: 1.5, stroke: '#141517' }}
                            activeDot={{ r: 6, fill: '#ff5500', stroke: '#ffffff', strokeWidth: 2 }}
                            name="Carga Máx"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Timeline Pill List between each workout session */}
                    <div className="mt-3 pt-3 border-t border-zinc-800/80 space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                        Histórico de Execução (Treino a Treino)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {points.map((pt, pIdx) => {
                          const prevPoint = pIdx > 0 ? points[pIdx - 1] : null;
                          const sessionDiff = prevPoint
                            ? Number((pt.maxWeightKg - prevPoint.maxWeightKg).toFixed(1))
                            : 0;

                          return (
                            <div
                              key={pt.sessionId + pIdx}
                              className="rounded-xl bg-zinc-900/60 border border-zinc-800/70 p-2 text-xs flex items-center justify-between"
                            >
                              <div>
                                <span className="font-semibold text-white">
                                  {pt.sessionLabel}{' '}
                                  <span className="text-zinc-400 font-normal text-[11px]">
                                    ({pt.dateStr})
                                  </span>
                                </span>
                                <p className="text-[10px] text-zinc-400 mt-0.5">
                                  {pt.setsCount} séries • {pt.rawSets.map((s) => `${s.reps}r × ${s.weight}kg`).join(', ')}
                                </p>
                              </div>

                              <div className="text-right">
                                <span className="font-mono font-bold text-white block">
                                  {pt.maxWeightKg} kg
                                </span>
                                {sessionDiff !== 0 && (
                                  <span
                                    className={`text-[10px] font-mono font-bold ${
                                      sessionDiff > 0 ? 'text-emerald-400' : 'text-rose-400'
                                    }`}
                                  >
                                    {sessionDiff > 0 ? `+${sessionDiff} kg 🚀` : `${sessionDiff} kg`}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
