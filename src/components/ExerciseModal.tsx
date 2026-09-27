import { useState, useEffect, useRef } from 'react';
import {
  X,
  Search,
  Loader2,
  Globe,
  Dumbbell,
  Check,
  Sparkles,
  Info,
  Clock,
  Repeat,
  Layers,
} from 'lucide-react';
import { Exercise, MuscleGroup } from '../types/workout';
import { MUSCLE_COLORS, MUSCLE_DEFAULT_IMAGES } from '../services/exerciseLibrary';
import { searchOnlineExercises, OnlineExerciseResult } from '../services/onlineExerciseApi';

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exercise: Exercise) => void;
  workoutName: string;
  initialExercise?: Exercise | null;
}

const MUSCLE_LIST: MuscleGroup[] = [
  'Peitoral',
  'Costas',
  'Quadríceps',
  'Posterior de Coxa',
  'Glúteos',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Abdômen',
  'Panturrilhas',
  'Antebraço',
  'Cardio / Funcional',
];

export function ExerciseModal({
  isOpen,
  onClose,
  onSave,
  workoutName,
  initialExercise,
}: ExerciseModalProps) {
  const [name, setName] = useState('');
  const [targetMuscle, setTargetMuscle] = useState<MuscleGroup>('Peitoral');
  const [imageUrl, setImageUrl] = useState('');
  const [defaultSets, setDefaultSets] = useState(4);
  const [defaultReps, setDefaultReps] = useState('8-12');
  const [defaultRestSeconds, setDefaultRestSeconds] = useState(60);
  const [isCardio, setIsCardio] = useState(false);
  const [defaultDurationMinutes, setDefaultDurationMinutes] = useState(20);
  const [equipment, setEquipment] = useState('Academia');
  const [notes, setNotes] = useState('');

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<OnlineExerciseResult[]>([]);
  const [imgError, setImgError] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const debounceTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (initialExercise) {
      setName(initialExercise.name);
      setTargetMuscle(initialExercise.targetMuscle);
      setImageUrl(initialExercise.imageUrl);
      setDefaultSets(initialExercise.defaultSets);
      setDefaultReps(initialExercise.defaultReps);
      setDefaultRestSeconds(initialExercise.defaultRestSeconds);
      setIsCardio(
        initialExercise.isCardio ||
          initialExercise.targetMuscle === 'Cardio / Funcional' ||
          /esteira|bicicleta|bike|cardio|corrida|eliptico|transport|corda/i.test(initialExercise.name)
      );
      setDefaultDurationMinutes(initialExercise.defaultDurationMinutes || 20);
      setEquipment(initialExercise.equipment || 'Academia');
      setNotes(initialExercise.notes || '');
      setSearchResults([]);
      setImgError(false);
    } else {
      setName('');
      setTargetMuscle('Peitoral');
      setImageUrl(MUSCLE_DEFAULT_IMAGES['Peitoral']);
      setDefaultSets(4);
      setDefaultReps('8-12');
      setDefaultRestSeconds(60);
      setIsCardio(false);
      setDefaultDurationMinutes(20);
      setEquipment('Academia');
      setNotes('');
      setSearchResults([]);
      setImgError(false);
    }
  }, [initialExercise, isOpen]);

  if (!isOpen) return null;

  // Handle typing name: automatic internet / database search
  const handleNameChange = (val: string) => {
    setName(val);
    setImgError(false);

    if (debounceTimeout.current) {
      window.clearTimeout(debounceTimeout.current);
    }

    if (val.trim().length >= 2) {
      debounceTimeout.current = window.setTimeout(async () => {
        setIsSearching(true);
        try {
          const results = await searchOnlineExercises(val);
          setSearchResults(results);

          // If no initial exercise or user is typing fresh, auto-apply top match
          if (!initialExercise && results.length > 0) {
            const top = results[0];
            setTargetMuscle(top.targetMuscle);
            setImageUrl(top.imageUrl);
            if (top.equipment) setEquipment(top.equipment);
            if (top.instructions) setNotes(top.instructions);
          }
        } finally {
          setIsSearching(false);
        }
      }, 400);
    } else {
      setSearchResults([]);
    }
  };

  // Explicit online search button trigger
  const handleManualSearch = async () => {
    if (!name.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchOnlineExercises(name);
      setSearchResults(results);
      if (results.length > 0) {
        const top = results[0];
        setTargetMuscle(top.targetMuscle);
        setImageUrl(top.imageUrl);
        if (top.equipment) setEquipment(top.equipment);
        if (top.instructions) setNotes(top.instructions);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (res: OnlineExerciseResult) => {
    setName(res.name);
    setTargetMuscle(res.targetMuscle);
    setImageUrl(res.imageUrl);
    if (res.equipment) setEquipment(res.equipment);
    if (res.instructions) setNotes(res.instructions);
    if (
      res.targetMuscle === 'Cardio / Funcional' ||
      /esteira|bicicleta|bike|cardio|corrida|eliptico|transport|corda/i.test(res.name)
    ) {
      setIsCardio(true);
      setDefaultDurationMinutes(20);
    }
    setImgError(false);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const finalImage = imageUrl || MUSCLE_DEFAULT_IMAGES[targetMuscle];
    const isCardioDetected =
      isCardio ||
      targetMuscle === 'Cardio / Funcional' ||
      /esteira|bicicleta|bike|cardio|corrida|eliptico|transport|corda/i.test(name);

    const exercise: Exercise = {
      id: initialExercise?.id || `ex_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name: name.trim(),
      targetMuscle,
      imageUrl: finalImage,
      defaultSets: Number(defaultSets) || 1,
      defaultReps: isCardioDetected ? `${defaultDurationMinutes} min` : defaultReps.trim() || '10',
      defaultRestSeconds: Number(defaultRestSeconds) || 60,
      isCardio: isCardioDetected,
      defaultDurationMinutes: Number(defaultDurationMinutes) || 20,
      equipment: equipment.trim() || 'Academia',
      notes: notes.trim(),
    };

    onSave(exercise);
    onClose();
  };

  const activeColor = MUSCLE_COLORS[targetMuscle] || MUSCLE_COLORS['Peitoral'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl p-6 text-zinc-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-white font-display">
              {initialExercise ? 'Editar Exercício' : 'Adicionar Exercício'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Destino: <span className="text-amber-400 font-medium">{workoutName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-5 max-h-[75vh] overflow-y-auto pr-1">
          {/* Exercise Name with Online Search Integration */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Nome do Exercício (Busca Automática com Imagem)
            </label>
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleManualSearch();
                    }
                  }}
                  placeholder="Ex: Supino Reto, Agachamento, Rosca Scott, Puxada..."
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 pl-11 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition-colors"
                />
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                {isSearching && (
                  <Loader2 className="absolute right-3.5 top-3.5 h-4 w-4 text-amber-400 animate-spin" />
                )}
              </div>

              <button
                type="button"
                onClick={handleManualSearch}
                disabled={isSearching || !name.trim()}
                className="px-3.5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-amber-400 border border-zinc-700 flex items-center gap-1.5 transition-colors whitespace-nowrap disabled:opacity-50"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Buscar Imagem</span>
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1.5 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-400" />
              Ao digitar, o aplicativo consulta a base online (ExerciseDB/Wger) e localiza a imagem e grupo muscular correspondente.
            </p>
          </div>

          {/* Online Search Suggestions Carousel / List */}
          {searchResults.length > 0 && (
            <div className="p-3 bg-zinc-950/70 rounded-xl border border-zinc-800 space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Sugestões Encontradas na Internet & Biblioteca ({searchResults.length}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                {searchResults.map((res) => {
                  const isCurrent = res.name.toLowerCase() === name.toLowerCase();
                  return (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => handleSelectResult(res)}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-colors ${
                        isCurrent
                          ? 'border-amber-400 bg-amber-400/10 text-white'
                          : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300'
                      }`}
                    >
                      <img
                        src={res.imageUrl}
                        alt={res.name}
                        referrerPolicy="no-referrer"
                        className="h-10 w-10 rounded-md object-cover bg-zinc-800 shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{res.name}</p>
                        <p className="text-[10px] text-zinc-400 truncate">
                          {res.targetMuscle} · {res.source === 'wger' ? 'Wger API' : 'Catálogo'}
                        </p>
                      </div>
                      {isCurrent && <Check className="h-4 w-4 text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Exercise Image Preview & Muscle Group Tag */}
          <div className="flex flex-col sm:flex-row gap-4 items-start p-3 bg-zinc-950/50 rounded-xl border border-zinc-800/80">
            <div className="relative h-28 w-36 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0 mx-auto sm:mx-0">
              {!imgError && imageUrl ? (
                <img
                  src={imageUrl}
                  alt={name || 'Exercício'}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center bg-zinc-800 text-zinc-400 p-2 text-center">
                  <Dumbbell className="h-8 w-8 mb-1 text-zinc-500" />
                  <span className="text-[10px] text-zinc-400">{targetMuscle}</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2.5 w-full">
              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">Músculo Alvo Identificado:</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${activeColor.bg} ${activeColor.text} ${activeColor.border}`}
                  >
                    {targetMuscle}
                  </span>
                  <select
                    value={targetMuscle}
                    onChange={(e) => {
                      const newM = e.target.value as MuscleGroup;
                      setTargetMuscle(newM);
                      // Update default image if using fallback
                      if (!imageUrl || imageUrl === MUSCLE_DEFAULT_IMAGES[targetMuscle]) {
                        setImageUrl(MUSCLE_DEFAULT_IMAGES[newM]);
                      }
                    }}
                    className="text-xs bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1 text-zinc-300 focus:outline-none focus:border-amber-400"
                  >
                    {MUSCLE_LIST.map((m) => (
                      <option key={m} value={m}>
                        Alterar: {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Globe className="h-3 w-3" />
                  <span>{showUrlInput ? 'Ocultar URL da imagem' : 'Personalizar link da imagem'}</span>
                </button>
                {showUrlInput && (
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImgError(false);
                    }}
                    placeholder="Cole aqui a URL direta da imagem (https://...)"
                    className="mt-1.5 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200 focus:border-amber-400 focus:outline-none"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Cardio Type Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
            <div>
              <span className="text-xs font-bold text-white block">Exercício do Tipo Cardio?</span>
              <span className="text-[11px] text-zinc-400">
                (Esteira, bicicleta, elíptico, corda) — Permite registrar tempo de exercício (minutos)
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !isCardio;
                setIsCardio(next);
                if (next) {
                  setTargetMuscle('Cardio / Funcional');
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isCardio
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {isCardio ? 'Sim (Cardio Ativo)' : 'Não (Musculação)'}
            </button>
          </div>

          {/* Sets, Reps & Rest Parameters (or Cardio Duration) */}
          {isCardio ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-amber-400 mb-1.5 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Tempo Alvo de Exercício (minutos)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={defaultDurationMinutes}
                  onChange={(e) =>
                    setDefaultDurationMinutes(Math.max(1, parseInt(e.target.value) || 20))
                  }
                  placeholder="Ex: 20 min"
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-amber-400" />
                  <span>Quantidade de Blocos / Tiros</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={defaultSets}
                  onChange={(e) => setDefaultSets(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-amber-400" />
                  <span>Séries Padrão</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={defaultSets}
                  onChange={(e) => setDefaultSets(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 flex items-center gap-1">
                  <Repeat className="h-3.5 w-3.5 text-amber-400" />
                  <span>Faixa de Repetições</span>
                </label>
                <input
                  type="text"
                  value={defaultReps}
                  onChange={(e) => setDefaultReps(e.target.value)}
                  placeholder="Ex: 8-12, 10, 15"
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>Descanso (segundos)</span>
                </label>
                <input
                  type="number"
                  min="15"
                  max="300"
                  step="15"
                  value={defaultRestSeconds}
                  onChange={(e) => setDefaultRestSeconds(Math.max(15, parseInt(e.target.value) || 60))}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Equipment & Execution Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Equipamento / Máquina
              </label>
              <input
                type="text"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                placeholder="Ex: Barra, Halteres, Polia, Máquina..."
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 flex items-center gap-1">
                <Info className="h-3.5 w-3.5 text-amber-400" />
                <span>Observação / Dica de Execução</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Banco inclinado 30°, amplitude máxima"
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-5 py-2 text-xs sm:text-sm font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {initialExercise ? 'Salvar Alterações' : 'Adicionar ao Treino'}
          </button>
        </div>
      </div>
    </div>
  );
}
