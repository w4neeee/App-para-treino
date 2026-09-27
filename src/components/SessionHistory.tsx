import { Calendar, Clock, Dumbbell, Flame, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { WorkoutSession } from '../types/workout';
import { MUSCLE_COLORS } from '../services/exerciseLibrary';

interface SessionHistoryProps {
  sessions: WorkoutSession[];
  onDeleteSession: (sessionId: string) => void;
}

export function SessionHistory({ sessions, onDeleteSession }: SessionHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (sessions.length === 0) {
    return (
      <div className="py-20 text-center rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
        <Dumbbell className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white">Nenhum treino finalizado ainda</h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
          Ao iniciar um treino e clicar em &quot;Concluir&quot;, todas as séries, cargas e repetições ficarão gravadas aqui.
        </p>
      </div>
    );
  }

  const formatDuration = (secs: number) => {
    const mins = Math.round(secs / 60);
    return `${mins} min`;
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4 pb-16">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-lg font-bold text-white font-display">
          Histórico de Sessões ({sessions.length})
        </h2>
        <span className="text-xs text-zinc-400">Em ordem cronológica inversa</span>
      </div>

      <div className="space-y-3">
        {sessions.map((sess) => {
          const isExpanded = expandedId === sess.id;

          return (
            <div
              key={sess.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/70 overflow-hidden transition-all hover:border-zinc-700/80"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : sess.id)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                    <h3 className="text-base font-bold text-white font-display">
                      {sess.workoutName}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-zinc-500" />
                      {formatDate(sess.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-zinc-500" />
                      {formatDuration(sess.durationSeconds)}
                    </span>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-800">
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <div className="bg-zinc-950/80 px-2.5 py-1.5 rounded-lg border border-zinc-800 text-center">
                      <span className="text-[10px] text-zinc-400 block uppercase">Volume</span>
                      <span className="font-bold text-amber-400">
                        {sess.totalVolumeKg.toLocaleString()}kg
                      </span>
                    </div>

                    <div className="bg-zinc-950/80 px-2.5 py-1.5 rounded-lg border border-zinc-800 text-center">
                      <span className="text-[10px] text-zinc-400 block uppercase">Séries</span>
                      <span className="font-bold text-white">{sess.totalCompletedSets}x</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(sess.id);
                      }}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Excluir Registro"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-zinc-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-zinc-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 sm:px-5 border-t border-zinc-800/80 bg-zinc-950/50 pt-4 space-y-4">
                  {sess.notes && (
                    <p className="text-xs text-amber-300/90 italic bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                      &quot;{sess.notes}&quot;
                    </p>
                  )}

                  <div className="space-y-3">
                    {sess.exercises.map((ex) => {
                      const completedSets = ex.sets.filter((s) => s.completed);
                      const muscleColor = MUSCLE_COLORS[ex.targetMuscle] || MUSCLE_COLORS['Peitoral'];

                      return (
                        <div
                          key={ex.exerciseId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-zinc-900 border border-zinc-800/80"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={ex.imageUrl}
                              alt={ex.exerciseName}
                              className="h-10 w-10 rounded-lg object-cover bg-zinc-800"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-white font-display">
                                {ex.exerciseName}
                              </p>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.2 rounded border ${muscleColor.bg} ${muscleColor.text} ${muscleColor.border}`}
                              >
                                {ex.targetMuscle}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 sm:justify-end">
                            {completedSets.map((s) => (
                              <span
                                key={s.id}
                                className="px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300"
                              >
                                {s.durationMinutes ? `${s.durationMinutes} min` : `${s.weight}kg × ${s.reps}`}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
