import { useState, useEffect } from 'react';
import { User, Sparkles, Check, X, Calendar } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  initialName?: string;
  initialAge?: number | null;
  onSave: (name: string, age: number | null) => void;
  onClose?: () => void;
  isMandatory?: boolean;
}

export function ProfileModal({
  isOpen,
  initialName = '',
  initialAge = null,
  onSave,
  onClose,
  isMandatory = false,
}: ProfileModalProps) {
  const [name, setName] = useState(initialName);
  const [age, setAge] = useState<string>(initialAge ? String(initialAge) : '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(initialName || '');
      setAge(initialAge ? String(initialAge) : '');
      setError('');
    }
  }, [isOpen, initialName, initialAge]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Por favor, informe seu nome ou como prefere ser chamado.');
      return;
    }

    let parsedAge: number | null = null;
    if (age.trim()) {
      const num = parseInt(age.trim(), 10);
      if (isNaN(num) || num < 5 || num > 120) {
        setError('Por favor, insira uma idade válida entre 5 e 120 anos.');
        return;
      }
      parsedAge = num;
    }

    setError('');
    onSave(trimmedName, parsedAge);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-3xl border border-[#2e3137] bg-[#141517] p-6 sm:p-7 shadow-2xl text-white space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-[#ff5500]/15 border border-[#ff5500]/30 flex items-center justify-center text-[#ff5500]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                Seu Perfil
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Personalize seus dados para o IronTrack
              </p>
            </div>
          </div>

          {!isMandatory && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Nome Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
              Como quer ser chamado? *
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Gustavo, Lucas, Beatriz..."
                className="w-full rounded-xl bg-[#1b1d21] border border-[#2e3137] px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff5500] transition-colors font-medium"
              />
            </div>
            <p className="text-[11px] text-zinc-400">
              Este nome aparecerá logo abaixo do <strong>"Olá"</strong> na tela inicial.
            </p>
          </div>

          {/* Idade Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
              Idade (anos)
            </label>
            <div className="relative">
              <input
                type="number"
                min="10"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Ex: 26"
                className="w-full rounded-xl bg-[#1b1d21] border border-[#2e3137] px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff5500] transition-colors font-mono"
              />
            </div>
            <p className="text-[11px] text-zinc-400">
              Sua idade nos ajuda a ajustar seus parâmetros físicos.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-xl bg-[#ff5500] hover:bg-[#ff6a1a] text-white font-bold text-sm shadow-lg shadow-[#ff5500]/25 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="h-4 w-4 stroke-[3]" />
            <span>Salvar e Continuar</span>
          </button>
        </form>
      </div>
    </div>
  );
}
