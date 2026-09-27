import { useState } from 'react';
import { X, Layers, Plus, Check, Trash2, Calendar, Repeat } from 'lucide-react';
import { TrainingPlan, DayOfWeek, DAY_OF_WEEK_SHORT } from '../types/workout';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: TrainingPlan[];
  activePlanId: string;
  onSelectPlan: (id: string) => void;
  onCreatePlan: (
    name: string,
    description: string,
    weeklyFrequency: number,
    activeDays: DayOfWeek[]
  ) => void;
  onDeletePlan: (id: string) => void;
}

const ALL_DAYS: { day: DayOfWeek; label: string }[] = [
  { day: 1, label: 'Seg' },
  { day: 2, label: 'Ter' },
  { day: 3, label: 'Qua' },
  { day: 4, label: 'Qui' },
  { day: 5, label: 'Sex' },
  { day: 6, label: 'Sáb' },
  { day: 0, label: 'Dom' },
];

export function PlanModal({
  isOpen,
  onClose,
  plans,
  activePlanId,
  onSelectPlan,
  onCreatePlan,
  onDeletePlan,
}: PlanModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [weeklyFrequency, setWeeklyFrequency] = useState(4);
  const [activeDays, setActiveDays] = useState<DayOfWeek[]>([1, 2, 4, 5]); // default 4 days (Seg, Ter, Qui, Sex)

  if (!isOpen) return null;

  const toggleDay = (day: DayOfWeek) => {
    let updated: DayOfWeek[];
    if (activeDays.includes(day)) {
      if (activeDays.length <= 1) return; // Keep at least one day
      updated = activeDays.filter((d) => d !== day);
    } else {
      updated = [...activeDays, day];
    }
    setActiveDays(updated);
    setWeeklyFrequency(updated.length);
  };

  const handleFrequencyChange = (val: number) => {
    const num = Math.min(7, Math.max(1, val));
    setWeeklyFrequency(num);
    // Auto-select the first N days of the week if user changes frequency directly
    const newDays = ALL_DAYS.slice(0, num).map((d) => d.day);
    setActiveDays(newDays);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreatePlan(
      name.trim(),
      description.trim(),
      weeklyFrequency,
      activeDays.length > 0 ? activeDays : [1, 2, 3, 4]
    );
    setName('');
    setDescription('');
    setWeeklyFrequency(4);
    setActiveDays([1, 2, 4, 5]);
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl p-6 text-zinc-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white font-display">Planos de Treino</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {!isCreating ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Seus Planos Personalizados ({plans.length})
                </span>
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Criar Novo Plano</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {plans.map((p) => {
                  const isActive = p.id === activePlanId;
                  const freq = p.weeklyFrequency || p.activeDays?.length || p.workouts.length || 4;
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                        isActive
                          ? 'border-amber-400/50 bg-amber-500/10'
                          : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                      }`}
                    >
                      <div
                        onClick={() => onSelectPlan(p.id)}
                        className="flex-1 cursor-pointer pr-3"
                      >
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white font-display">{p.name}</h4>
                          {isActive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-black">
                              Ativo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                          {p.description || 'Sem descrição'} · {p.workouts.length} treinos
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-amber-400 font-semibold">
                            Frequência: {freq} dias na semana
                          </span>
                          {p.activeDays && p.activeDays.length > 0 && (
                            <span className="text-[10px] text-zinc-400">
                              ({p.activeDays.map((d) => DAY_OF_WEEK_SHORT[d]).join(', ')})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!isActive && (
                          <button
                            onClick={() => onSelectPlan(p.id)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                          >
                            Ativar
                          </button>
                        )}
                        {plans.length > 1 && (
                          <button
                            onClick={() => onDeletePlan(p.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Excluir Plano"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Nome do Plano
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Plano Hipertrofia ABCD, Foco Pernas..."
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* 🎯 Pergunta de Frequência Semanal */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Repeat className="h-4 w-4 text-amber-400" />
                  <span>Quantos dias por semana você vai treinar neste plano?</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={weeklyFrequency}
                    onChange={(e) => handleFrequencyChange(parseInt(e.target.value) || 1)}
                    className="w-24 rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-sm text-center font-bold text-amber-400 focus:border-amber-400 focus:outline-none font-mono"
                  />
                  <span className="text-xs text-zinc-400">
                    dias por semana ({weeklyFrequency} dias selecionados)
                  </span>
                </div>
              </div>

              {/* 📅 Marcar exatamente quais dias da semana você vai treinar */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-amber-400" />
                  <span>Marque os dias em que você vai treinar:</span>
                </label>
                <p className="text-[11px] text-zinc-400 mb-2">
                  A frequência no topo da tela inicial mostrará apenas os dias que você marcar aqui!
                </p>
                <div className="grid grid-cols-7 gap-1.5">
                  {ALL_DAYS.map((d) => {
                    const isSelected = activeDays.includes(d.day);
                    return (
                      <button
                        key={d.day}
                        type="button"
                        onClick={() => toggleDay(d.day)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold font-mono transition-all flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 font-black'
                            : 'bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        <span>{d.label}</span>
                        {isSelected && <Check className="h-3 w-3 stroke-[3] mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Objetivo / Descrição
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Treinos de 45 a 60 min com foco em progressão de carga"
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-sm text-white focus:border-amber-400 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-white rounded-lg transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-400 text-black hover:bg-amber-300 rounded-xl transition-all shadow-md active:scale-95"
                >
                  Salvar Plano com {weeklyFrequency} dias
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
