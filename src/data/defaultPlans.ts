import { TrainingPlan, WorkoutSession } from '../types/workout';
import { PRESET_EXERCISES } from '../services/exerciseLibrary';
import chestImg from '../assets/images/gym_chest_workout_1790407578964.jpg';
import backImg from '../assets/images/gym_back_workout_1790407594240.jpg';
import legsImg from '../assets/images/gym_legs_workout_1790407607329.jpg';
import shouldersImg from '../assets/images/gym_arms_shoulders_1790407618915.jpg';

const getPreset = (name: string, id: string) => {
  const match = PRESET_EXERCISES.find((p) => p.name === name) || PRESET_EXERCISES[0];
  return {
    id,
    name: match.name,
    targetMuscle: match.targetMuscle,
    imageUrl: match.imageUrl,
    defaultSets: match.defaultSets,
    defaultReps: match.defaultReps,
    defaultRestSeconds: match.defaultRestSeconds,
    notes: match.notes,
    equipment: match.equipment,
  };
};

export const INITIAL_PLANS: TrainingPlan[] = [
  {
    id: 'plan_hipertrofia_abcd',
    name: 'Plano Hipertrofia & Força ABCD',
    description: 'Divisão balanceada de 4 treinos semanais com foco em progressão de carga e hipertrofia.',
    isActive: true,
    weeklyFrequency: 4,
    activeDays: [1, 2, 4, 5], // Seg, Ter, Qui, Sex
    createdAt: '2026-08-25T10:00:00.000Z',
    workouts: [
      {
        id: 'workout_a',
        name: 'Treino A - Peitoral, Tríceps & Frontal',
        weeklyTarget: 1,
        totalTargetRepeats: 20, // 20 segundas-feiras programadas
        scheduledDays: [1], // Segunda-feira
        coverImage: chestImg,
        colorTheme: 'from-amber-600 to-red-600',
        description: 'Foco no peitoral completo com estímulo pesado e finalização com tríceps.',
        createdAt: '2026-08-25T10:00:00.000Z',
        exercises: [
          getPreset('Supino Reto com Barra', 'ex_supino_reto'),
          getPreset('Supino Inclinado com Halteres', 'ex_supino_inc'),
          getPreset('Crucifixo na Polia (Crossover)', 'ex_crucifixo'),
          getPreset('Desenvolvimento com Halteres', 'ex_desenv_halteres'),
          getPreset('Tríceps Corda na Polia', 'ex_triceps_corda'),
          getPreset('Tríceps Testa com Barra W', 'ex_triceps_testa'),
        ],
      },
      {
        id: 'workout_b',
        name: 'Treino B - Costas, Bíceps & Posterior Ombro',
        weeklyTarget: 1,
        totalTargetRepeats: 20,
        scheduledDays: [2], // Terça-feira
        coverImage: backImg,
        colorTheme: 'from-sky-600 to-indigo-600',
        description: 'Construção de densidade e largura de dorsais com braquiais e bíceps.',
        createdAt: '2026-08-25T10:00:00.000Z',
        exercises: [
          getPreset('Puxada Frontal na Polia', 'ex_puxada_frontal'),
          getPreset('Remada Curvada com Barra', 'ex_remada_curvada'),
          getPreset('Remada Baixa no Triângulo', 'ex_remada_baixa'),
          getPreset('Crucifixo Invertido na Polia / Máquina', 'ex_crucifixo_inv'),
          getPreset('Rosca Direta com Barra W', 'ex_rosca_direta'),
          getPreset('Rosca Martelo', 'ex_rosca_martelo'),
        ],
      },
      {
        id: 'workout_c',
        name: 'Treino C - Pernas Completo & Panturrilhas',
        weeklyTarget: 1,
        totalTargetRepeats: 20,
        scheduledDays: [4], // Quinta-feira
        coverImage: legsImg,
        colorTheme: 'from-emerald-600 to-teal-600',
        description: 'Treino intenso de membros inferiores com ênfase em agachamento e posteriores.',
        createdAt: '2026-08-25T10:00:00.000Z',
        exercises: [
          getPreset('Agachamento Livre com Barra', 'ex_agachamento'),
          getPreset('Leg Press 45°', 'ex_leg_press'),
          getPreset('Cadeira Extensora', 'ex_extensora'),
          getPreset('Mesa Flexora', 'ex_mesa_flexora'),
          getPreset('Elevação Pélvica com Barra', 'ex_elev_pelvica'),
          getPreset('Gêmeos Sentado (Cavalinho)', 'ex_gemeos_sentado'),
        ],
      },
      {
        id: 'workout_d',
        name: 'Treino D - Ombros, Braços & Abdômen',
        weeklyTarget: 1,
        totalTargetRepeats: 20,
        scheduledDays: [5, 6], // Sexta e Sábado
        coverImage: shouldersImg,
        colorTheme: 'from-purple-600 to-pink-600',
        description: 'Lapidação de deltóides laterais, pico de bíceps, tríceps e fortalecimento do core.',
        createdAt: '2026-08-25T10:00:00.000Z',
        exercises: [
          getPreset('Desenvolvimento Militar com Barra', 'ex_militar_barra'),
          getPreset('Elevação Lateral com Halteres', 'ex_elev_lateral'),
          getPreset('Face Pull na Polia', 'ex_face_pull'),
          getPreset('Rosca Scott', 'ex_rosca_scott'),
          getPreset('Tríceps Francês com Halter', 'ex_triceps_frances'),
          getPreset('Abdominal na Polia Alta', 'ex_abdominal_polia'),
        ],
      },
    ],
  },
];

// Helper to generate realistic historical session logs for demonstration
export const INITIAL_SESSIONS: WorkoutSession[] = [
  // SEMANA 1 (Aprox 3 semanas atrás)
  {
    id: 'sess_w1_a',
    planId: 'plan_hipertrofia_abcd',
    workoutId: 'workout_a',
    workoutName: 'Treino A - Peitoral, Tríceps & Frontal',
    date: '2026-09-02T18:30:00.000Z',
    durationSeconds: 3120, // 52 min
    totalVolumeKg: 7840,
    totalCompletedSets: 22,
    notes: 'Treino da primeira semana do mês. Boa adaptação.',
    exercises: [
      {
        exerciseId: 'ex_supino_reto',
        exerciseName: 'Supino Reto com Barra',
        targetMuscle: 'Peitoral',
        imageUrl: chestImg,
        sets: [
          { id: 's1', setNumber: 1, weight: 60, reps: 10, completed: true },
          { id: 's2', setNumber: 2, weight: 60, reps: 10, completed: true },
          { id: 's3', setNumber: 3, weight: 60, reps: 9, completed: true },
          { id: 's4', setNumber: 4, weight: 60, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'ex_supino_inc',
        exerciseName: 'Supino Inclinado com Halteres',
        targetMuscle: 'Peitoral',
        imageUrl: chestImg,
        sets: [
          { id: 's5', setNumber: 1, weight: 20, reps: 12, completed: true },
          { id: 's6', setNumber: 2, weight: 20, reps: 11, completed: true },
          { id: 's7', setNumber: 3, weight: 20, reps: 10, completed: true },
        ],
      },
      {
        exerciseId: 'ex_desenv_halteres',
        exerciseName: 'Desenvolvimento com Halteres',
        targetMuscle: 'Ombros',
        imageUrl: shouldersImg,
        sets: [
          { id: 's8', setNumber: 1, weight: 18, reps: 10, completed: true },
          { id: 's9', setNumber: 2, weight: 18, reps: 9, completed: true },
          { id: 's10', setNumber: 3, weight: 18, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'ex_triceps_corda',
        exerciseName: 'Tríceps Corda na Polia',
        targetMuscle: 'Tríceps',
        imageUrl: shouldersImg,
        sets: [
          { id: 's11', setNumber: 1, weight: 25, reps: 15, completed: true },
          { id: 's12', setNumber: 2, weight: 25, reps: 13, completed: true },
          { id: 's13', setNumber: 3, weight: 25, reps: 12, completed: true },
        ],
      },
    ],
  },
  {
    id: 'sess_w1_b',
    planId: 'plan_hipertrofia_abcd',
    workoutId: 'workout_b',
    workoutName: 'Treino B - Costas, Bíceps & Posterior Ombro',
    date: '2026-09-04T19:00:00.000Z',
    durationSeconds: 3240,
    totalVolumeKg: 8400,
    totalCompletedSets: 20,
    exercises: [
      {
        exerciseId: 'ex_puxada_frontal',
        exerciseName: 'Puxada Frontal na Polia',
        targetMuscle: 'Costas',
        imageUrl: backImg,
        sets: [
          { id: 's14', setNumber: 1, weight: 55, reps: 12, completed: true },
          { id: 's15', setNumber: 2, weight: 55, reps: 10, completed: true },
          { id: 's16', setNumber: 3, weight: 55, reps: 10, completed: true },
          { id: 's17', setNumber: 4, weight: 55, reps: 9, completed: true },
        ],
      },
      {
        exerciseId: 'ex_remada_curvada',
        exerciseName: 'Remada Curvada com Barra',
        targetMuscle: 'Costas',
        imageUrl: backImg,
        sets: [
          { id: 's18', setNumber: 1, weight: 50, reps: 10, completed: true },
          { id: 's19', setNumber: 2, weight: 50, reps: 10, completed: true },
          { id: 's20', setNumber: 3, weight: 50, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'ex_rosca_direta',
        exerciseName: 'Rosca Direta com Barra W',
        targetMuscle: 'Bíceps',
        imageUrl: shouldersImg,
        sets: [
          { id: 's21', setNumber: 1, weight: 22, reps: 12, completed: true },
          { id: 's22', setNumber: 2, weight: 22, reps: 10, completed: true },
          { id: 's23', setNumber: 3, weight: 22, reps: 9, completed: true },
        ],
      },
    ],
  },
  {
    id: 'sess_w1_c',
    planId: 'plan_hipertrofia_abcd',
    workoutId: 'workout_c',
    workoutName: 'Treino C - Pernas Completo & Panturrilhas',
    date: '2026-09-06T11:00:00.000Z',
    durationSeconds: 3600,
    totalVolumeKg: 11200,
    totalCompletedSets: 22,
    exercises: [
      {
        exerciseId: 'ex_agachamento',
        exerciseName: 'Agachamento Livre com Barra',
        targetMuscle: 'Quadríceps',
        imageUrl: legsImg,
        sets: [
          { id: 's24', setNumber: 1, weight: 80, reps: 10, completed: true },
          { id: 's25', setNumber: 2, weight: 80, reps: 10, completed: true },
          { id: 's26', setNumber: 3, weight: 80, reps: 8, completed: true },
          { id: 's27', setNumber: 4, weight: 80, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'ex_leg_press',
        exerciseName: 'Leg Press 45°',
        targetMuscle: 'Quadríceps',
        imageUrl: legsImg,
        sets: [
          { id: 's28', setNumber: 1, weight: 160, reps: 12, completed: true },
          { id: 's29', setNumber: 2, weight: 160, reps: 12, completed: true },
          { id: 's30', setNumber: 3, weight: 160, reps: 10, completed: true },
        ],
      },
    ],
  },

  // SEMANA 2 (Aprox 2 semanas atrás)
  {
    id: 'sess_w2_a',
    planId: 'plan_hipertrofia_abcd',
    workoutId: 'workout_a',
    workoutName: 'Treino A - Peitoral, Tríceps & Frontal',
    date: '2026-09-09T18:15:00.000Z',
    durationSeconds: 3180,
    totalVolumeKg: 8350,
    totalCompletedSets: 22,
    exercises: [
      {
        exerciseId: 'ex_supino_reto',
        exerciseName: 'Supino Reto com Barra',
        targetMuscle: 'Peitoral',
        imageUrl: chestImg,
        sets: [
          { id: 's31', setNumber: 1, weight: 62.5, reps: 10, completed: true },
          { id: 's32', setNumber: 2, weight: 62.5, reps: 10, completed: true },
          { id: 's33', setNumber: 3, weight: 62.5, reps: 9, completed: true },
          { id: 's34', setNumber: 4, weight: 62.5, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'ex_supino_inc',
        exerciseName: 'Supino Inclinado com Halteres',
        targetMuscle: 'Peitoral',
        imageUrl: chestImg,
        sets: [
          { id: 's35', setNumber: 1, weight: 22, reps: 12, completed: true },
          { id: 's36', setNumber: 2, weight: 22, reps: 11, completed: true },
          { id: 's37', setNumber: 3, weight: 22, reps: 10, completed: true },
        ],
      },
      {
        exerciseId: 'ex_desenv_halteres',
        exerciseName: 'Desenvolvimento com Halteres',
        targetMuscle: 'Ombros',
        imageUrl: shouldersImg,
        sets: [
          { id: 's38', setNumber: 1, weight: 18, reps: 11, completed: true },
          { id: 's39', setNumber: 2, weight: 18, reps: 10, completed: true },
          { id: 's40', setNumber: 3, weight: 18, reps: 9, completed: true },
        ],
      },
      {
        exerciseId: 'ex_triceps_corda',
        exerciseName: 'Tríceps Corda na Polia',
        targetMuscle: 'Tríceps',
        imageUrl: shouldersImg,
        sets: [
          { id: 's41', setNumber: 1, weight: 27.5, reps: 15, completed: true },
          { id: 's42', setNumber: 2, weight: 27.5, reps: 14, completed: true },
          { id: 's43', setNumber: 3, weight: 27.5, reps: 12, completed: true },
        ],
      },
    ],
  },
  {
    id: 'sess_w2_b',
    planId: 'plan_hipertrofia_abcd',
    workoutId: 'workout_b',
    workoutName: 'Treino B - Costas, Bíceps & Posterior Ombro',
    date: '2026-09-11T19:20:00.000Z',
    durationSeconds: 3300,
    totalVolumeKg: 8850,
    totalCompletedSets: 21,
    exercises: [
      {
        exerciseId: 'ex_puxada_frontal',
        exerciseName: 'Puxada Frontal na Polia',
        targetMuscle: 'Costas',
        imageUrl: backImg,
        sets: [
          { id: 's44', setNumber: 1, weight: 60, reps: 11, completed: true },
          { id: 's45', setNumber: 2, weight: 60, reps: 10, completed: true },
          { id: 's46', setNumber: 3, weight: 60, reps: 10, completed: true },
          { id: 's47', setNumber: 4, weight: 60, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'ex_remada_curvada',
        exerciseName: 'Remada Curvada com Barra',
        targetMuscle: 'Costas',
        imageUrl: backImg,
        sets: [
          { id: 's48', setNumber: 1, weight: 52.5, reps: 10, completed: true },
          { id: 's49', setNumber: 2, weight: 52.5, reps: 10, completed: true },
          { id: 's50', setNumber: 3, weight: 52.5, reps: 9, completed: true },
        ],
      },
      {
        exerciseId: 'ex_rosca_direta',
        exerciseName: 'Rosca Direta com Barra W',
        targetMuscle: 'Bíceps',
        imageUrl: shouldersImg,
        sets: [
          { id: 's51', setNumber: 1, weight: 24, reps: 12, completed: true },
          { id: 's52', setNumber: 2, weight: 24, reps: 11, completed: true },
          { id: 's53', setNumber: 3, weight: 24, reps: 9, completed: true },
        ],
      },
    ],
  },
  {
    id: 'sess_w2_c',
    planId: 'plan_hipertrofia_abcd',
    workoutId: 'workout_c',
    workoutName: 'Treino C - Pernas Completo & Panturrilhas',
    date: '2026-09-13T10:45:00.000Z',
    durationSeconds: 3720,
    totalVolumeKg: 12100,
    totalCompletedSets: 22,
    exercises: [
      {
        exerciseId: 'ex_agachamento',
        exerciseName: 'Agachamento Livre com Barra',
        targetMuscle: 'Quadríceps',
        imageUrl: legsImg,
        sets: [
          { id: 's54', setNumber: 1, weight: 85, reps: 10, completed: true },
          { id: 's55', setNumber: 2, weight: 85, reps: 9, completed: true },
          { id: 's56', setNumber: 3, weight: 85, reps: 8, completed: true },
          { id: 's57', setNumber: 4, weight: 85, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'ex_leg_press',
        exerciseName: 'Leg Press 45°',
        targetMuscle: 'Quadríceps',
        imageUrl: legsImg,
        sets: [
          { id: 's58', setNumber: 1, weight: 180, reps: 12, completed: true },
          { id: 's59', setNumber: 2, weight: 180, reps: 11, completed: true },
          { id: 's60', setNumber: 3, weight: 180, reps: 10, completed: true },
        ],
      },
    ],
  },

  // SEMANA 3 (Semana passada)
  {
    id: 'sess_w3_a',
    planId: 'plan_hipertrofia_abcd',
    workoutId: 'workout_a',
    workoutName: 'Treino A - Peitoral, Tríceps & Frontal',
    date: '2026-09-16T18:00:00.000Z',
    durationSeconds: 3240,
    totalVolumeKg: 8980,
    totalCompletedSets: 23,
    exercises: [
      {
        exerciseId: 'ex_supino_reto',
        exerciseName: 'Supino Reto com Barra',
        targetMuscle: 'Peitoral',
        imageUrl: chestImg,
        sets: [
          { id: 's61', setNumber: 1, weight: 65, reps: 10, completed: true },
          { id: 's62', setNumber: 2, weight: 65, reps: 10, completed: true },
          { id: 's63', setNumber: 3, weight: 65, reps: 8, completed: true },
          { id: 's64', setNumber: 4, weight: 65, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'ex_supino_inc',
        exerciseName: 'Supino Inclinado com Halteres',
        targetMuscle: 'Peitoral',
        imageUrl: chestImg,
        sets: [
          { id: 's65', setNumber: 1, weight: 24, reps: 11, completed: true },
          { id: 's66', setNumber: 2, weight: 24, reps: 10, completed: true },
          { id: 's67', setNumber: 3, weight: 24, reps: 9, completed: true },
        ],
      },
      {
        exerciseId: 'ex_desenv_halteres',
        exerciseName: 'Desenvolvimento com Halteres',
        targetMuscle: 'Ombros',
        imageUrl: shouldersImg,
        sets: [
          { id: 's68', setNumber: 1, weight: 20, reps: 10, completed: true },
          { id: 's69', setNumber: 2, weight: 20, reps: 9, completed: true },
          { id: 's70', setNumber: 3, weight: 20, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'ex_triceps_corda',
        exerciseName: 'Tríceps Corda na Polia',
        targetMuscle: 'Tríceps',
        imageUrl: shouldersImg,
        sets: [
          { id: 's71', setNumber: 1, weight: 30, reps: 14, completed: true },
          { id: 's72', setNumber: 2, weight: 30, reps: 13, completed: true },
          { id: 's73', setNumber: 3, weight: 30, reps: 12, completed: true },
        ],
      },
    ],
  },
  {
    id: 'sess_w3_b',
    planId: 'plan_hipertrofia_abcd',
    workoutId: 'workout_b',
    workoutName: 'Treino B - Costas, Bíceps & Posterior Ombro',
    date: '2026-09-18T19:00:00.000Z',
    durationSeconds: 3360,
    totalVolumeKg: 9340,
    totalCompletedSets: 22,
    exercises: [
      {
        exerciseId: 'ex_puxada_frontal',
        exerciseName: 'Puxada Frontal na Polia',
        targetMuscle: 'Costas',
        imageUrl: backImg,
        sets: [
          { id: 's74', setNumber: 1, weight: 65, reps: 10, completed: true },
          { id: 's75', setNumber: 2, weight: 65, reps: 10, completed: true },
          { id: 's76', setNumber: 3, weight: 65, reps: 9, completed: true },
          { id: 's77', setNumber: 4, weight: 65, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'ex_remada_curvada',
        exerciseName: 'Remada Curvada com Barra',
        targetMuscle: 'Costas',
        imageUrl: backImg,
        sets: [
          { id: 's78', setNumber: 1, weight: 55, reps: 10, completed: true },
          { id: 's79', setNumber: 2, weight: 55, reps: 10, completed: true },
          { id: 's80', setNumber: 3, weight: 55, reps: 9, completed: true },
        ],
      },
      {
        exerciseId: 'ex_rosca_direta',
        exerciseName: 'Rosca Direta com Barra W',
        targetMuscle: 'Bíceps',
        imageUrl: shouldersImg,
        sets: [
          { id: 's81', setNumber: 1, weight: 26, reps: 11, completed: true },
          { id: 's82', setNumber: 2, weight: 26, reps: 10, completed: true },
          { id: 's83', setNumber: 3, weight: 26, reps: 9, completed: true },
        ],
      },
    ],
  },
  {
    id: 'sess_w3_c',
    planId: 'plan_hipertrofia_abcd',
    workoutId: 'workout_c',
    workoutName: 'Treino C - Pernas Completo & Panturrilhas',
    date: '2026-09-20T10:30:00.000Z',
    durationSeconds: 3780,
    totalVolumeKg: 12900,
    totalCompletedSets: 22,
    exercises: [
      {
        exerciseId: 'ex_agachamento',
        exerciseName: 'Agachamento Livre com Barra',
        targetMuscle: 'Quadríceps',
        imageUrl: legsImg,
        sets: [
          { id: 's84', setNumber: 1, weight: 90, reps: 10, completed: true },
          { id: 's85', setNumber: 2, weight: 90, reps: 9, completed: true },
          { id: 's86', setNumber: 3, weight: 90, reps: 8, completed: true },
          { id: 's87', setNumber: 4, weight: 90, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'ex_leg_press',
        exerciseName: 'Leg Press 45°',
        targetMuscle: 'Quadríceps',
        imageUrl: legsImg,
        sets: [
          { id: 's88', setNumber: 1, weight: 200, reps: 12, completed: true },
          { id: 's89', setNumber: 2, weight: 200, reps: 11, completed: true },
          { id: 's90', setNumber: 3, weight: 200, reps: 10, completed: true },
        ],
      },
    ],
  },

  // SEMANA 4 (Semana atual)
  {
    id: 'sess_w4_a',
    planId: 'plan_hipertrofia_abcd',
    workoutId: 'workout_a',
    workoutName: 'Treino A - Peitoral, Tríceps & Frontal',
    date: '2026-09-23T18:30:00.000Z',
    durationSeconds: 3300,
    totalVolumeKg: 9480,
    totalCompletedSets: 23,
    notes: 'Recorde pessoal (PR) no Supino Reto com 70kg!',
    exercises: [
      {
        exerciseId: 'ex_supino_reto',
        exerciseName: 'Supino Reto com Barra',
        targetMuscle: 'Peitoral',
        imageUrl: chestImg,
        sets: [
          { id: 's91', setNumber: 1, weight: 70, reps: 8, completed: true },
          { id: 's92', setNumber: 2, weight: 70, reps: 8, completed: true },
          { id: 's93', setNumber: 3, weight: 70, reps: 7, completed: true },
          { id: 's94', setNumber: 4, weight: 70, reps: 6, completed: true },
        ],
      },
      {
        exerciseId: 'ex_supino_inc',
        exerciseName: 'Supino Inclinado com Halteres',
        targetMuscle: 'Peitoral',
        imageUrl: chestImg,
        sets: [
          { id: 's95', setNumber: 1, weight: 26, reps: 10, completed: true },
          { id: 's96', setNumber: 2, weight: 26, reps: 10, completed: true },
          { id: 's97', setNumber: 3, weight: 26, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'ex_desenv_halteres',
        exerciseName: 'Desenvolvimento com Halteres',
        targetMuscle: 'Ombros',
        imageUrl: shouldersImg,
        sets: [
          { id: 's98', setNumber: 1, weight: 22, reps: 10, completed: true },
          { id: 's99', setNumber: 2, weight: 22, reps: 9, completed: true },
          { id: 's100', setNumber: 3, weight: 22, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'ex_triceps_corda',
        exerciseName: 'Tríceps Corda na Polia',
        targetMuscle: 'Tríceps',
        imageUrl: shouldersImg,
        sets: [
          { id: 's101', setNumber: 1, weight: 32.5, reps: 14, completed: true },
          { id: 's102', setNumber: 2, weight: 32.5, reps: 12, completed: true },
          { id: 's103', setNumber: 3, weight: 32.5, reps: 11, completed: true },
        ],
      },
    ],
  },
  {
    id: 'sess_w4_b',
    planId: 'plan_hipertrofia_abcd',
    workoutId: 'workout_b',
    workoutName: 'Treino B - Costas, Bíceps & Posterior Ombro',
    date: '2026-09-25T19:00:00.000Z',
    durationSeconds: 3420,
    totalVolumeKg: 9780,
    totalCompletedSets: 22,
    exercises: [
      {
        exerciseId: 'ex_puxada_frontal',
        exerciseName: 'Puxada Frontal na Polia',
        targetMuscle: 'Costas',
        imageUrl: backImg,
        sets: [
          { id: 's104', setNumber: 1, weight: 70, reps: 10, completed: true },
          { id: 's105', setNumber: 2, weight: 70, reps: 9, completed: true },
          { id: 's106', setNumber: 3, weight: 70, reps: 8, completed: true },
          { id: 's107', setNumber: 4, weight: 70, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'ex_remada_curvada',
        exerciseName: 'Remada Curvada com Barra',
        targetMuscle: 'Costas',
        imageUrl: backImg,
        sets: [
          { id: 's108', setNumber: 1, weight: 60, reps: 10, completed: true },
          { id: 's109', setNumber: 2, weight: 60, reps: 9, completed: true },
          { id: 's110', setNumber: 3, weight: 60, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'ex_rosca_direta',
        exerciseName: 'Rosca Direta com Barra W',
        targetMuscle: 'Bíceps',
        imageUrl: shouldersImg,
        sets: [
          { id: 's111', setNumber: 1, weight: 28, reps: 10, completed: true },
          { id: 's112', setNumber: 2, weight: 28, reps: 9, completed: true },
          { id: 's113', setNumber: 3, weight: 28, reps: 8, completed: true },
        ],
      },
    ],
  },
];
