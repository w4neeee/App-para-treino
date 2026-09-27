import { Home, ClipboardList, TrendingUp, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'home' | 'workouts' | 'dashboard' | 'history';
  onSelectTab: (tab: 'home' | 'workouts' | 'dashboard' | 'history') => void;
  onOpenProfile?: () => void;
  onOpenNewWorkout?: () => void;
}

export function BottomNav({
  currentTab,
  onSelectTab,
  onOpenProfile,
}: BottomNavProps) {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'workouts' as const, label: 'Planos', icon: ClipboardList },
    { id: 'dashboard' as const, label: 'Progresso', icon: TrendingUp },
    { id: 'history' as const, label: 'Perfil', icon: User },
  ];

  return (
    <nav
      aria-label="Navegação Principal"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#1f2125] bg-[#0c0d0e]/98 backdrop-blur-md px-2 safe-area-pb"
    >
      <div className="mx-auto flex h-14 max-w-md items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all active:scale-95 ${
                isActive ? 'text-[#ff5500]' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className="relative mb-0.5">
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? 'stroke-[2.4] text-[#ff5500]' : 'stroke-[1.8] text-zinc-500'
                  }`}
                />
              </div>

              <span
                className={`text-[11px] font-medium tracking-tight ${
                  isActive ? 'text-[#ff5500] font-semibold' : 'text-zinc-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
