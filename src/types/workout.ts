export type MuscleGroup =
  | 'Peitoral'
  | 'Costas'
  | 'Quadríceps'
  | 'Posterior de Coxa'
  | 'Glúteos'
  | 'Ombros'
  | 'Bíceps'
  | 'Tríceps'
  | 'Abdômen'
  | 'Panturrilhas'
  | 'Antebraço'
  | 'Cardio / Funcional';

// 0: Domingo, 1: Segunda, 2: Terça, 3: Quarta, 4: Quinta, 5: Sexta, 6: Sábado
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_OF_WEEK_NAMES: Record<DayOfWeek, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
};

export const DAY_OF_WEEK_SHORT: Record<DayOfWeek, string> = {
  0: 'Dom',
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sáb',
};

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: MuscleGroup;
  imageUrl: string;
  defaultSets: number;
  defaultReps: string; // e.g. "8-12" or "10"
  defaultRestSeconds: number; // e.g. 60 or 90
  defaultDurationMinutes?: number; // Para exercícios cardio (ex: 20 min)
  isCardio?: boolean;
  notes?: string;
  secondaryMuscles?: string[];
  equipment?: string;
}

export interface Workout {
  id: string;
  name: string; // e.g. "Treino A - Peitoral & Tríceps"
  weeklyTarget: number; // Quantidade de vezes para se repetir semanalmente (e.g. 1, 2)
  totalTargetRepeats?: number; // Quantidade total de vezes programadas para repetir este treino (ex: 20 segundas-feiras)
  scheduledDays?: DayOfWeek[]; // Dias da semana programados (ex: [1, 4] = Seg e Qui)
  coverImage?: string;
  colorTheme?: string;
  description?: string;
  exercises: Exercise[];
  createdAt: string;
}

export interface TrainingPlan {
  id: string;
  userId?: string;
  name: string; // e.g. "Plano Hipertrofia ABCD"
  description: string;
  isActive: boolean;
  weeklyFrequency?: number; // Ex: 3, 4, 5 dias por semana
  activeDays?: DayOfWeek[]; // Ex: [1, 2, 4, 5] (Seg, Ter, Qui, Sex)
  workouts: Workout[];
  createdAt: string;
}

export interface LoggedSet {
  id: string;
  setNumber: number;
  reps: number;
  weight: number; // in kg
  durationMinutes?: number; // Para cardio: tempo em minutos (ex: 15, 20, 30)
  completed: boolean;
  previousWeight?: number;
  previousReps?: number;
  previousDurationMinutes?: number;
}

export interface LoggedExercise {
  exerciseId: string;
  exerciseName: string;
  targetMuscle: MuscleGroup;
  imageUrl: string;
  isCardio?: boolean;
  durationMinutes?: number; // Tempo total em minutos caso cardio
  sets: LoggedSet[];
  isFinished?: boolean; // Novo: botão para finalizar o exercício individualmente
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  userId?: string;
  planId: string;
  workoutId: string;
  workoutName: string;
  date: string; // ISO date string e.g. "2026-09-26T14:30:00Z"
  durationSeconds: number;
  exercises: LoggedExercise[];
  totalVolumeKg: number; // sum of (reps * weight) for completed sets
  totalCompletedSets: number;
  notes?: string;
}

export interface ExerciseProgressionPoint {
  date: string;
  sessionDate: string;
  workoutName: string;
  maxWeightKg: number;
  avgWeightKg: number;
  maxReps: number;
  totalVolumeKg: number;
  estimated1RM: number; // Brzycki formula: weight / (1.0278 - (0.0278 * reps))
  setsCount: number;
}

export interface WeeklySummary {
  weekKey: string; // e.g. "2026-W38"
  weekLabel: string; // e.g. "Semana 15 a 21/Set"
  startDate: string;
  endDate: string;
  totalWorkouts: number;
  totalVolumeKg: number;
  totalSets: number;
  totalDurationMinutes: number;
  workoutsCompleted: { [workoutId: string]: number };
}

export interface WaterLogEntry {
  id: string;
  amountMl: number;
  timestamp: string; // ISO
  timeStr: string;   // e.g. "14:30"
}

export interface DailyHydration {
  date: string; // YYYY-MM-DD
  totalMl: number;
  goalMl: number;
  logs: WaterLogEntry[];
}

export interface WeightEntry {
  id: string;
  weightKg: number;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO
  notes?: string;
}
