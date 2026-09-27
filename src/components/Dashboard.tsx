import { WorkoutSession, TrainingPlan, WeightEntry, DailyHydration } from '../types/workout';
import { WeightEvolutionChart } from './WeightEvolutionChart';
import { WaterEvolutionChart } from './WaterEvolutionChart';
import { WorkoutExerciseProgression } from './WorkoutExerciseProgression';
import { AchievementsSection } from './AchievementsSection';

interface DashboardProps {
  sessions: WorkoutSession[];
  activePlan: TrainingPlan | null;
  onSelectWorkoutToStart?: (workoutId: string) => void;
  weightEntries?: WeightEntry[];
  todayHydration?: DailyHydration;
}

export function Dashboard({
  sessions,
  activePlan,
  weightEntries = [],
  todayHydration,
}: DashboardProps) {
  return (
    <div className="mx-auto max-w-4xl w-full space-y-5 pb-20 text-white select-none">
      {/* 1. SISTEMA DE CONQUISTAS & EMBLEMAS VISUAIS */}
      <section aria-label="Conquistas e Emblemas">
        <AchievementsSection
          sessions={sessions}
          activePlan={activePlan}
          todayHydration={todayHydration}
        />
      </section>

      {/* 2. GRÁFICO 1: AVANÇO DA PERDA OU GANHO DE PESO */}
      <section aria-label="Evolução do Peso">
        <WeightEvolutionChart weightEntries={weightEntries} />
      </section>

      {/* 3. GRÁFICO 2: AVANÇO DE CONSUMO DE ÁGUA (DIA, SEMANA, MÊS) */}
      <section aria-label="Consumo de Água">
        <WaterEvolutionChart todayHydration={todayHydration} />
      </section>

      {/* 4. GRÁFICO 3: AVANÇO NOS TREINOS POR EXERCÍCIO COM LISTA SUSPENSA DE TREINOS */}
      <section aria-label="Avanço nos Treinos">
        <WorkoutExerciseProgression
          sessions={sessions}
          activePlan={activePlan}
        />
      </section>
    </div>
  );
}
