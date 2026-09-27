import { Dumbbell, Flame, Sparkles, ShieldCheck, Cloud, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginGate() {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <div className="min-h-screen w-full bg-[#0a0b0c] text-white flex flex-col justify-center items-center p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#ff5500]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-[#ff5500] to-amber-500 text-black shadow-lg shadow-[#ff5500]/25 mx-auto mb-2">
            <Flame className="h-9 w-9 stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white font-display">
            IronTrack
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Treinos • Hidratação • Sobrecarga Progressiva
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-[#27292d] bg-[#141517]/90 backdrop-blur-xl p-6 sm:p-7 shadow-2xl space-y-6">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff5500]/10 border border-[#ff5500]/25 text-[#ff5500] text-[11px] font-bold">
              <Cloud className="h-3 w-3" />
              <span>Conexão Obrigatória</span>
            </div>
            <h2 className="text-lg font-bold text-white">
              Entre com sua conta Google
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Para utilizar o aplicativo, conecte-se com sua conta Google. Seus treinos, cargas e histórico serão salvos automaticamente na nuvem.
            </p>
          </div>

          {/* Google Sign-In Button */}
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-sm transition-all duration-200 shadow-lg shadow-white/10 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {/* Google Icon SVG */}
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.99 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Conectar com Google</span>
            <ArrowRight className="h-4 w-4 ml-1 opacity-70" />
          </button>

          {/* Feature Highlights */}
          <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
            <div className="flex items-center gap-3 text-xs text-zinc-300">
              <div className="h-6 w-6 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                <Cloud className="h-3.5 w-3.5" />
              </div>
              <span>Sincronização 100% automática na nuvem</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-300">
              <div className="h-6 w-6 rounded-lg bg-[#ff5500]/10 border border-[#ff5500]/25 flex items-center justify-center text-[#ff5500] shrink-0">
                <Dumbbell className="h-3.5 w-3.5" />
              </div>
              <span>Histórico de sobrecarga e repetições treino a treino</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-300">
              <div className="h-6 w-6 rounded-lg bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 shrink-0">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <span>Seus dados salvos com segurança para sempre</span>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-zinc-500">
          Ao conectar, você terá acesso imediato a todos os seus planos e estatísticas.
        </p>
      </div>
    </div>
  );
}
