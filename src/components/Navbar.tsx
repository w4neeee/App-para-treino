import { Dumbbell, Layers, Plus } from 'lucide-react';

interface NavbarProps {
  currentTab: 'home' | 'workouts' | 'dashboard' | 'history';
  onSelectTab: (tab: 'home' | 'workouts' | 'dashboard' | 'history') => void;
  activePlanName: string;
  onOpenPlans: () => void;
  onOpenNewWorkout: () => void;
}

export function Navbar({
  onSelectTab,
  activePlanName,
  onOpenPlans,
  onOpenNewWorkout,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-3 sm:px-6">
        {/* Logo / Brand */}
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div>
            <span className="font-display text-xl font-bold tracking-tight text-white block">
              IronTrack
            </span>
          </div>
        </div>

        {/* Action Controls & Active Plan Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPlans}
            title="Gerenciar Planos de Treino"
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors max-w-[190px] truncate"
          >
            <Layers className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{activePlanName}</span>
          </button>

          <button
            onClick={onOpenNewWorkout}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm whitespace-nowrap active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Novo Treino</span>
          </button>
        </div>
      </div>
    </header>
  );
}
