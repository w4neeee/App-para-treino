import { useState } from 'react';
import {
  X,
  Dumbbell,
  Repeat,
  Image as ImageIcon,
  Palette,
  FileText,
  Calendar,
} from 'lucide-react';
import { Workout, DayOfWeek, DAY_OF_WEEK_NAMES, DAY_OF_WEEK_SHORT } from '../types/workout';
import chestImg from '../assets/images/gym_chest_workout_1790407578964.jpg';
import backImg from '../assets/images/gym_back_workout_1790407594240.jpg';
import legsImg from '../assets/images/gym_legs_workout_1790407607329.jpg';
import shouldersImg from '../assets/images/gym_arms_shoulders_1790407618915.jpg';

interface WorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workout: Partial<Workout>) => void;
  initialWorkout?: Workout | null;
}

const COVER_OPTIONS = [
  { label: 'Peitoral & Força', image: chestImg },
  { label: 'Costas & Dorsal', image: backImg },
  { label: 'Pernas & Agachamento', image: legsImg },
  { label: 'Ombros & Braços', image: shouldersImg },
];

const ALL_DAYS: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0]; // Seg a Dom

export function WorkoutModal({
  isOpen,
  onClose,
  onSave,
  initialWorkout,
}: WorkoutModalProps) {
  const [name, setName] = useState(initialWorkout?.name || '');
  const [weeklyTarget, setWeeklyTarget] = useState(initialWorkout?.weeklyTarget || 1);
  const [totalTargetRepeats, setTotalTargetRepeats] = useState<number>(
    initialWorkout?.totalTargetRepeats || 20
  );
  const [scheduledDays, setScheduledDays] = useState<DayOfWeek[]>(
    initialWorkout?.scheduledDays || []
  );
  const [coverImage, setCoverImage] = useState(initialWorkout?.coverImage || chestImg);
  const [description, setDescription] = useState(initialWorkout?.description || '');

  if (!isOpen) return null;

  const toggleDay = (day: DayOfWeek) => {
    if (scheduledDays.includes(day)) {
      setScheduledDays(scheduledDays.filter((d) => d !== day));
    } else {
      setScheduledDays([...scheduledDays, day]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      weeklyTarget: Number(weeklyTarget) || 1,
      totalTargetRepeats: Number(totalTargetRepeats) || 20,
      scheduledDays,
      coverImage,
      description: description.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl p-6 text-zinc-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white font-display">
              {initialWorkout ? 'Editar Treino' : 'Criar Novo Treino'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Nome do Treino
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Treino A - Peitoral e Tríceps"
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Selecionar Dias da Semana Programados */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-amber-400" />
              <span>Programar para Dias da Semana (Atalho automático)</span>
            </label>
            <p className="text-[11px] text-zinc-400 mb-2">
              Selecione em quais dias este treino deve ser sugerido automaticamente no botão da tela inicial:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_DAYS.map((d) => {
                const isSelected = scheduledDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-black shadow-sm'
                        : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {DAY_OF_WEEK_SHORT[d]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantidade Total de Repetições Programadas para este Treino */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Repeat className="h-4 w-4 text-amber-400" />
              <span>Quantidade de Vezes para Repetir este Treino (Ciclo Total)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="200"
                value={totalTargetRepeats}
                onChange={(e) =>
                  setTotalTargetRepeats(Math.max(1, parseInt(e.target.value) || 20))
                }
                className="w-28 rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-center font-bold text-amber-400 focus:border-amber-400 focus:outline-none"
              />
              <span className="text-xs text-zinc-400">
                vezes no total (Ex: repetir por 20 segundas-feiras para ver evolução de carga)
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Repeat className="h-4 w-4 text-amber-400" />
              <span>Frequência Semanal Alvo (Meta Semanal)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="7"
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-28 rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-center font-bold text-white focus:border-amber-400 focus:outline-none"
              />
              <span className="text-xs text-zinc-400">vez por semana</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-amber-400" />
              <span>Descrição / Foco do Treino</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Ênfase em progressão de carga e peitoral clavicular"
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Cover image selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-amber-400" />
              <span>Capa do Treino</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {COVER_OPTIONS.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCoverImage(opt.image)}
                  className={`relative flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                    coverImage === opt.image
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                  }`}
                >
                  <img
                    src={opt.image}
                    alt={opt.label}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <span className="text-xs font-medium text-zinc-300 truncate">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-zinc-300 hover:text-white bg-zinc-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              {initialWorkout ? 'Salvar Alterações' : 'Criar Treino'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
