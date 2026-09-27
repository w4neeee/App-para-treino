import { Exercise, MuscleGroup } from '../types/workout';

// Local generated gym photos
import chestImg from '../assets/images/gym_chest_workout_1790407578964.jpg';
import backImg from '../assets/images/gym_back_workout_1790407594240.jpg';
import legsImg from '../assets/images/gym_legs_workout_1790407607329.jpg';
import shouldersImg from '../assets/images/gym_arms_shoulders_1790407618915.jpg';

export interface ExerciseTemplate {
  name: string;
  targetMuscle: MuscleGroup;
  imageUrl: string;
  defaultSets: number;
  defaultReps: string;
  defaultRestSeconds: number;
  equipment: string;
  notes?: string;
  keywords: string[];
}

export const MUSCLE_COLORS: Record<MuscleGroup, { bg: string; text: string; border: string }> = {
  Peitoral: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  Costas: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
  Quadríceps: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  'Posterior de Coxa': { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
  Glúteos: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  Ombros: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  Bíceps: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  Tríceps: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  Abdômen: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  Panturrilhas: { bg: 'bg-lime-500/10', text: 'text-lime-400', border: 'border-lime-500/20' },
  Antebraço: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  'Cardio / Funcional': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
};

// Muscle group default representative images
export const MUSCLE_DEFAULT_IMAGES: Record<MuscleGroup, string> = {
  Peitoral: chestImg,
  Costas: backImg,
  Quadríceps: legsImg,
  'Posterior de Coxa': legsImg,
  Glúteos: legsImg,
  Ombros: shouldersImg,
  Bíceps: shouldersImg,
  Tríceps: shouldersImg,
  Abdômen: chestImg,
  Panturrilhas: legsImg,
  Antebraço: shouldersImg,
  'Cardio / Funcional': legsImg,
};

export const PRESET_EXERCISES: ExerciseTemplate[] = [
  // --- PEITORAL ---
  {
    name: 'Supino Reto com Barra',
    targetMuscle: 'Peitoral',
    imageUrl: chestImg,
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRestSeconds: 90,
    equipment: 'Barra e Banco Reto',
    notes: 'Desça a barra controladamente até o terço inferior do peito. Mantenha as escápulas aduzidas.',
    keywords: ['supino', 'reto', 'barra', 'peito', 'peitoral', 'bench press'],
  },
  {
    name: 'Supino Inclinado com Halteres',
    targetMuscle: 'Peitoral',
    imageUrl: chestImg,
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSeconds: 75,
    equipment: 'Halteres e Banco Inclinado (30°-45°)',
    notes: 'Foco na porção clavicular (superior) do peito. Amplitude completa sem bater os halteres no topo.',
    keywords: ['supino', 'inclinado', 'halteres', 'peito superior', 'incline dumbbell press'],
  },
  {
    name: 'Crucifixo na Polia (Crossover)',
    targetMuscle: 'Peitoral',
    imageUrl: chestImg,
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    equipment: 'Polia Dupla / Crossover',
    notes: 'Braços levemente flexionados, aperte o peitoral no ponto máximo de contração.',
    keywords: ['crucifixo', 'crossover', 'polia', 'cable fly', 'cross'],
  },
  {
    name: 'Voador / Peck Deck',
    targetMuscle: 'Peitoral',
    imageUrl: chestImg,
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    equipment: 'Máquina Peck Deck',
    notes: 'Mantenha cotovelos alinhados com o meio do peito. Controle a fase excêntrica.',
    keywords: ['peck deck', 'voador', 'peitoral maquina', 'flyer'],
  },
  {
    name: 'Supino Declinado',
    targetMuscle: 'Peitoral',
    imageUrl: chestImg,
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 75,
    equipment: 'Banco Declinado e Barra/Halteres',
    notes: 'Foco na porção inferior do peitoral.',
    keywords: ['declinado', 'supino', 'peitoral inferior'],
  },
  {
    name: 'Flexão de Braço',
    targetMuscle: 'Peitoral',
    imageUrl: chestImg,
    defaultSets: 3,
    defaultReps: '15-20',
    defaultRestSeconds: 60,
    equipment: 'Peso Corporal',
    notes: 'Corpo em linha reta, abdômen contraído.',
    keywords: ['flexao', 'push up', 'peso corporal'],
  },

  // --- COSTAS ---
  {
    name: 'Puxada Frontal na Polia',
    targetMuscle: 'Costas',
    imageUrl: backImg,
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSeconds: 75,
    equipment: 'Polia Alta (Lat Pulldown)',
    notes: 'Puxe a barra em direção à clavícula superior inclinando o tronco levemente para trás.',
    keywords: ['puxada', 'frontal', 'lat pulldown', 'costas', 'dorsal'],
  },
  {
    name: 'Remada Curvada com Barra',
    targetMuscle: 'Costas',
    imageUrl: backImg,
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRestSeconds: 90,
    equipment: 'Barra Olímpica',
    notes: 'Tronco inclinado a 45°-60°, coluna neutra. Puxe a barra na linha do umbigo.',
    keywords: ['remada', 'curvada', 'barra', 'bent over row', 'dorsais'],
  },
  {
    name: 'Remada Baixa no Triângulo',
    targetMuscle: 'Costas',
    imageUrl: backImg,
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSeconds: 60,
    equipment: 'Cabo Baixo com Triângulo',
    notes: 'Alongue bem a dorsal à frente e contraia trazendo os cotovelos para trás do corpo.',
    keywords: ['remada baixa', 'triangulo', 'seated cable row', 'polia baixa'],
  },
  {
    name: 'Barra Fixa (Pull-up)',
    targetMuscle: 'Costas',
    imageUrl: backImg,
    defaultSets: 4,
    defaultReps: '6-10',
    defaultRestSeconds: 90,
    equipment: 'Barra Fixa',
    notes: 'Pegada pronada, puxe o queixo acima da barra com amplitude total.',
    keywords: ['barra fixa', 'pull up', 'costas peso corporal'],
  },
  {
    name: 'Remada Cavalinho',
    targetMuscle: 'Costas',
    imageUrl: backImg,
    defaultSets: 3,
    defaultReps: '8-12',
    defaultRestSeconds: 75,
    equipment: 'Barra T / Máquina Cavalinho',
    notes: 'Excelente para espessura e densidade de costas.',
    keywords: ['remada cavalinho', 't-bar row', 'barra t'],
  },
  {
    name: 'Levantamento Terra',
    targetMuscle: 'Costas',
    imageUrl: backImg,
    defaultSets: 4,
    defaultReps: '6-8',
    defaultRestSeconds: 120,
    equipment: 'Barra Olímpica e Anilhas',
    notes: 'Exercício composto para cadeia posterior. Coluna reta, empurre o chão com os pés.',
    keywords: ['levantamento terra', 'deadlift', 'terra', 'força'],
  },

  // --- PERNAS & QUADRÍCEPS ---
  {
    name: 'Agachamento Livre com Barra',
    targetMuscle: 'Quadríceps',
    imageUrl: legsImg,
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRestSeconds: 120,
    equipment: 'Rack de Agachamento e Barra',
    notes: 'Pés na largura dos ombros, desça até que as coxas quebrem o paralelo do chão.',
    keywords: ['agachamento', 'livre', 'barra', 'squat', 'pernas'],
  },
  {
    name: 'Leg Press 45°',
    targetMuscle: 'Quadríceps',
    imageUrl: legsImg,
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSeconds: 90,
    equipment: 'Máquina Leg Press 45°',
    notes: 'Não tire a lombar do encosto e não trave totalmente os joelhos na extensão.',
    keywords: ['leg press', 'leg 45', 'maquina perna'],
  },
  {
    name: 'Cadeira Extensora',
    targetMuscle: 'Quadríceps',
    imageUrl: legsImg,
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    equipment: 'Máquina Extensora',
    notes: 'Pausa isométrica de 1 segundo no topo da contração.',
    keywords: ['cadeira extensora', 'extensora', 'quadriceps isolado'],
  },
  {
    name: 'Agachamento Búlgaro',
    targetMuscle: 'Quadríceps',
    imageUrl: legsImg,
    defaultSets: 3,
    defaultReps: '10 cada perna',
    defaultRestSeconds: 60,
    equipment: 'Banco e Halteres',
    notes: 'Um pé apoiado atrás no banco. Excelente estímulo unilateral.',
    keywords: ['bulgaro', 'agachamento bulgaro', 'bulgarian split squat'],
  },
  {
    name: 'Hack Squat',
    targetMuscle: 'Quadríceps',
    imageUrl: legsImg,
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 90,
    equipment: 'Máquina Hack',
    notes: 'Seguro para a coluna, isola fortemente o quadríceps.',
    keywords: ['hack', 'hack squat', 'agachamento hack'],
  },

  // --- POSTERIOR DE COXA & GLÚTEOS ---
  {
    name: 'Mesa Flexora',
    targetMuscle: 'Posterior de Coxa',
    imageUrl: legsImg,
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSeconds: 60,
    equipment: 'Máquina Mesa Flexora',
    notes: 'Flexione os joelhos controlando o retorno sem deixar o quadril subir.',
    keywords: ['mesa flexora', 'flexora', 'posterior', 'isquiotibiais', 'hamstring'],
  },
  {
    name: 'Cadeira Flexora',
    targetMuscle: 'Posterior de Coxa',
    imageUrl: legsImg,
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    equipment: 'Máquina Cadeira Flexora',
    notes: 'Excelente contração máxima dos isquiotibiais na posição sentada.',
    keywords: ['cadeira flexora', 'seated leg curl'],
  },
  {
    name: 'Stiff com Halteres ou Barra',
    targetMuscle: 'Posterior de Coxa',
    imageUrl: legsImg,
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSeconds: 75,
    equipment: 'Halteres ou Barra',
    notes: 'Empurre o quadril para trás mantendo os joelhos levemente flexionados e coluna ereta.',
    keywords: ['stiff', 'stiff halteres', 'posterior de coxa', 'gluteo'],
  },
  {
    name: 'Elevação Pélvica com Barra',
    targetMuscle: 'Glúteos',
    imageUrl: legsImg,
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSeconds: 90,
    equipment: 'Banco, Barra e Protetor de Barra',
    notes: 'Pausa de 2 segundos no ponto mais alto contraindo o glúteo.',
    keywords: ['elevacao pelvica', 'hip thrust', 'gluteos'],
  },
  {
    name: 'Cadeira Abdutora',
    targetMuscle: 'Glúteos',
    imageUrl: legsImg,
    defaultSets: 3,
    defaultReps: '15-20',
    defaultRestSeconds: 60,
    equipment: 'Máquina Abdutora',
    notes: 'Foco no glúteo médio e estabilidade de quadril.',
    keywords: ['abdutora', 'gluteo medio'],
  },

  // --- OMBROS ---
  {
    name: 'Desenvolvimento com Halteres',
    targetMuscle: 'Ombros',
    imageUrl: shouldersImg,
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRestSeconds: 75,
    equipment: 'Banco 80° e Halteres',
    notes: 'Empurre os halteres para cima sem tocar um no outro no topo. Desça até a altura das orelhas.',
    keywords: ['desenvolvimento', 'halteres', 'ombro', 'deltoide', 'shoulder press'],
  },
  {
    name: 'Desenvolvimento Militar com Barra',
    targetMuscle: 'Ombros',
    imageUrl: shouldersImg,
    defaultSets: 4,
    defaultReps: '6-8',
    defaultRestSeconds: 90,
    equipment: 'Barra Olímpica',
    notes: 'Em pé ou sentado, empurre a barra verticalmente passando rente ao rosto.',
    keywords: ['desenvolvimento militar', 'overhead press', 'militar barra'],
  },
  {
    name: 'Elevação Lateral com Halteres',
    targetMuscle: 'Ombros',
    imageUrl: shouldersImg,
    defaultSets: 4,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    equipment: 'Halteres',
    notes: 'Cotovelos levemente flexionados, eleve até a altura dos ombros sem dar tranco com o corpo.',
    keywords: ['elevacao lateral', 'lateral', 'deltoide lateral', 'ombro largura'],
  },
  {
    name: 'Elevação Lateral na Polia',
    targetMuscle: 'Ombros',
    imageUrl: shouldersImg,
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    equipment: 'Polia Baixa',
    notes: 'Tensão constante em toda a amplitude de movimento.',
    keywords: ['elevacao lateral polia', 'cable lateral raise'],
  },
  {
    name: 'Crucifixo Invertido na Polia / Máquina',
    targetMuscle: 'Ombros',
    imageUrl: shouldersImg,
    defaultSets: 4,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    equipment: 'Polia Dupla ou Peck Deck Invertido',
    notes: 'Foco no deltoide posterior para harmonia postural dos ombros.',
    keywords: ['crucifixo invertido', 'posterior ombro', 'face pull', 'deltoide posterior'],
  },
  {
    name: 'Face Pull na Polia',
    targetMuscle: 'Ombros',
    imageUrl: shouldersImg,
    defaultSets: 3,
    defaultReps: '15',
    defaultRestSeconds: 60,
    equipment: 'Polia Alta e Corda',
    notes: 'Puxe a corda em direção ao nariz girando os punhos para fora. Saúde do manguito rotador.',
    keywords: ['face pull', 'manguito', 'posterior ombro'],
  },

  // --- BÍCEPS ---
  {
    name: 'Rosca Direta com Barra W',
    targetMuscle: 'Bíceps',
    imageUrl: shouldersImg,
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSeconds: 60,
    equipment: 'Barra W',
    notes: 'Cotovelos colados ao lado do tronco, sem balançar o corpo para impulsionar a carga.',
    keywords: ['rosca direta', 'barra w', 'biceps', 'biceps curl'],
  },
  {
    name: 'Rosca Alternada com Halteres',
    targetMuscle: 'Bíceps',
    imageUrl: shouldersImg,
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 60,
    equipment: 'Halteres',
    notes: 'Gire o punho (supinação) enquanto sobe o halter para máxima contração do pico do bíceps.',
    keywords: ['rosca alternada', 'halteres', 'supinada'],
  },
  {
    name: 'Rosca Martelo',
    targetMuscle: 'Bíceps',
    imageUrl: shouldersImg,
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 60,
    equipment: 'Halteres ou Corda na Polia',
    notes: 'Pegada neutra (palmas voltadas uma para a outra). Trabalha braquial e antebraço.',
    keywords: ['rosca martelo', 'martelo', 'braquial', 'hammer curl'],
  },
  {
    name: 'Rosca Scott',
    targetMuscle: 'Bíceps',
    imageUrl: shouldersImg,
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 60,
    equipment: 'Banco Scott e Barra W / Máquina',
    notes: 'Elimina o impulso do corpo e isola completamente a porção inferior do bíceps.',
    keywords: ['rosca scott', 'banco scott', 'preacher curl'],
  },

  // --- TRÍCEPS ---
  {
    name: 'Tríceps Corda na Polia',
    targetMuscle: 'Tríceps',
    imageUrl: shouldersImg,
    defaultSets: 4,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    equipment: 'Polia Alta e Corda',
    notes: 'Abra a corda para fora no final da extensão para máxima contração da cabeça lateral.',
    keywords: ['triceps corda', 'corda', 'triceps', 'triceps pushdown'],
  },
  {
    name: 'Tríceps Testa com Barra W',
    targetMuscle: 'Tríceps',
    imageUrl: shouldersImg,
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 60,
    equipment: 'Banco Reto e Barra W',
    notes: 'Desça a barra em direção à testa ou ligeiramente atrás da cabeça, mantendo cotovelos fechados.',
    keywords: ['triceps testa', 'skull crusher', 'testa barra w'],
  },
  {
    name: 'Tríceps Francês com Halter',
    targetMuscle: 'Tríceps',
    imageUrl: shouldersImg,
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 60,
    equipment: 'Halter',
    notes: 'Excelente para alongamento e hipertrofia da cabeça longa do tríceps.',
    keywords: ['triceps frances', 'frances halter'],
  },
  {
    name: 'Tríceps Pulley Barra Reta',
    targetMuscle: 'Tríceps',
    imageUrl: shouldersImg,
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSeconds: 60,
    equipment: 'Polia Alta e Barra Reta',
    notes: 'Cotovelos fixos ao lado do corpo, empurre a barra até a extensão completa.',
    keywords: ['triceps pulley', 'barra reta'],
  },
  {
    name: 'Mergulho nas Paralelas',
    targetMuscle: 'Tríceps',
    imageUrl: shouldersImg,
    defaultSets: 3,
    defaultReps: '8-12',
    defaultRestSeconds: 90,
    equipment: 'Barras Paralelas',
    notes: 'Corpo mais ereto foca no tríceps; levemente inclinado recruta mais peito.',
    keywords: ['paralelas', 'mergulho', 'dips'],
  },

  // --- ABDÔMEN & PANTURRILHAS ---
  {
    name: 'Abdominal na Polia Alta',
    targetMuscle: 'Abdômen',
    imageUrl: chestImg,
    defaultSets: 3,
    defaultReps: '15-20',
    defaultRestSeconds: 60,
    equipment: 'Polia Alta e Corda',
    notes: 'Flexione a coluna vertebral enrolando o tronco em direção aos joelhos.',
    keywords: ['abdominal polia', 'crunch cabo', 'cable crunch'],
  },
  {
    name: 'Prancha Isométrica',
    targetMuscle: 'Abdômen',
    imageUrl: chestImg,
    defaultSets: 3,
    defaultReps: '45-60s',
    defaultRestSeconds: 60,
    equipment: 'Colchonete',
    notes: 'Mantenha o abdômen e glúteos contraídos sem deixar o quadril cair.',
    keywords: ['prancha', 'isometrica', 'core', 'plank'],
  },
  {
    name: 'Elevação de Pernas na Barra',
    targetMuscle: 'Abdômen',
    imageUrl: chestImg,
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    equipment: 'Barra Fixa',
    notes: 'Puxe as pernas enrolando a bacia para cima, sem balançar o corpo.',
    keywords: ['elevacao pernas', 'hanging leg raise', 'infra'],
  },
  {
    name: 'Gêmeos Sentado (Cavalinho)',
    targetMuscle: 'Panturrilhas',
    imageUrl: legsImg,
    defaultSets: 4,
    defaultReps: '15-20',
    defaultRestSeconds: 45,
    equipment: 'Máquina Gêmeos Sentado',
    notes: 'Foco no músculo sóleo. Faça uma pausa de 1s na posição baixa de máximo alongamento.',
    keywords: ['gemeos sentado', 'panturrilha sentado', 'cavalinho', 'soleo'],
  },
  {
    name: 'Gêmeos em Pé no Smith / Degrau',
    targetMuscle: 'Panturrilhas',
    imageUrl: legsImg,
    defaultSets: 4,
    defaultReps: '12-15',
    defaultRestSeconds: 60,
    equipment: 'Smith Machine e Degrau',
    notes: 'Foco nos gastrocnêmios. Joelhos estendidos, amplitude máxima de subida e descida.',
    keywords: ['gemeos em pe', 'panturrilha em pe', 'panturrilha degrau'],
  },

  // --- CARDIO / FUNCIONAL ---
  {
    name: 'Esteira (Corrida / Caminhada)',
    targetMuscle: 'Cardio / Funcional',
    imageUrl: legsImg,
    defaultSets: 1,
    defaultReps: '20 min',
    defaultRestSeconds: 0,
    equipment: 'Esteira Ergométrica',
    notes: 'Controle o ritmo cardíaco e mantenha a postura alinhada durante o tempo programado.',
    keywords: ['esteira', 'corrida', 'treadmill', 'caminhada', 'cardio esteira'],
  },
  {
    name: 'Bicicleta Ergométrica',
    targetMuscle: 'Cardio / Funcional',
    imageUrl: legsImg,
    defaultSets: 1,
    defaultReps: '20 min',
    defaultRestSeconds: 0,
    equipment: 'Bicicleta / Spin',
    notes: 'Ajuste a altura do banco para que o joelho mantenha leve flexão no ponto mais baixo do pedal.',
    keywords: ['bicicleta', 'bike', 'ergometrica', 'spinning', 'pedalar', 'ciclo'],
  },
  {
    name: 'Elíptico (Transport)',
    targetMuscle: 'Cardio / Funcional',
    imageUrl: legsImg,
    defaultSets: 1,
    defaultReps: '20 min',
    defaultRestSeconds: 0,
    equipment: 'Aparelho Elíptico',
    notes: 'Baixo impacto articular, excelente para aquecimento ou condicionamento cardiorrespiratório.',
    keywords: ['eliptico', 'transport', 'cardio eliptico'],
  },
  {
    name: 'Pular Corda',
    targetMuscle: 'Cardio / Funcional',
    imageUrl: legsImg,
    defaultSets: 3,
    defaultReps: '5 min',
    defaultRestSeconds: 60,
    equipment: 'Corda de Pular',
    notes: 'Coordenação e gasto calórico elevado em intervalos.',
    keywords: ['corda', 'pular corda', 'jump rope'],
  },
];

// Internet / AI Exercise Resolver: searches library or infers target muscle and returns exercise details + image
export function resolveExercise(nameInput: string): {
  name: string;
  targetMuscle: MuscleGroup;
  imageUrl: string;
  defaultSets: number;
  defaultReps: string;
  defaultRestSeconds: number;
  equipment: string;
  notes?: string;
} {
  const query = nameInput.trim().toLowerCase();

  // 1. Direct match or fuzzy keyword match in presets
  const exactMatch = PRESET_EXERCISES.find(
    (e) => e.name.toLowerCase() === query
  );
  if (exactMatch) {
    return {
      name: exactMatch.name,
      targetMuscle: exactMatch.targetMuscle,
      imageUrl: exactMatch.imageUrl,
      defaultSets: exactMatch.defaultSets,
      defaultReps: exactMatch.defaultReps,
      defaultRestSeconds: exactMatch.defaultRestSeconds,
      equipment: exactMatch.equipment,
      notes: exactMatch.notes,
    };
  }

  // 2. Keyword score matching
  let bestPreset: ExerciseTemplate | null = null;
  let highestScore = 0;

  for (const preset of PRESET_EXERCISES) {
    let score = 0;
    const nameWords = preset.name.toLowerCase().split(/\s+/);
    const queryWords = query.split(/\s+/);

    for (const qWord of queryWords) {
      if (qWord.length < 3) continue;
      if (nameWords.some((w) => w.includes(qWord) || qWord.includes(w))) {
        score += 3;
      }
      if (preset.keywords.some((k) => k.includes(qWord) || qWord.includes(k))) {
        score += 2;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestPreset = preset;
    }
  }

  if (bestPreset && highestScore >= 2) {
    return {
      name: nameInput.trim(), // Keep user's exact name
      targetMuscle: bestPreset.targetMuscle,
      imageUrl: bestPreset.imageUrl,
      defaultSets: bestPreset.defaultSets,
      defaultReps: bestPreset.defaultReps,
      defaultRestSeconds: bestPreset.defaultRestSeconds,
      equipment: bestPreset.equipment,
      notes: bestPreset.notes,
    };
  }

  // 3. Fallback: Deduce target muscle from common gym terms
  let detectedMuscle: MuscleGroup = 'Peitoral';
  if (/costa|dorsal|puxad|remad|barra fixa|serrote|pulldown|row|pullover|lat|trapezio/i.test(query)) {
    detectedMuscle = 'Costas';
  } else if (/perna|agacha|squat|leg|extensor|quadriceps|afundo|passada|hack/i.test(query)) {
    detectedMuscle = 'Quadríceps';
  } else if (/flexor|stiff|posterior|isquio|gluteo|pelvic|hip thrust|abdut/i.test(query)) {
    detectedMuscle = /gluteo|pelvic|thrust|abdut/i.test(query) ? 'Glúteos' : 'Posterior de Coxa';
  } else if (/ombro|deltoid|desenvolv|militar|lateral|frontal|press|shoulder/i.test(query)) {
    detectedMuscle = 'Ombros';
  } else if (/biceps|rosca|martelo|scott|curl|branquial/i.test(query)) {
    detectedMuscle = 'Bíceps';
  } else if (/triceps|corda|testa|frances|pulley|mergulho|dips|pushdown/i.test(query)) {
    detectedMuscle = 'Tríceps';
  } else if (/abdom|crunch|prancha|infra|obliquo|core/i.test(query)) {
    detectedMuscle = 'Abdômen';
  } else if (/panturrilha|gemeos|calves/i.test(query)) {
    detectedMuscle = 'Panturrilhas';
  } else if (/antebra|punho/i.test(query)) {
    detectedMuscle = 'Antebraço';
  } else if (/corrida|esteira|bike|bicicleta|corda|cardio|eliptico/i.test(query)) {
    detectedMuscle = 'Cardio / Funcional';
  }

  const defaultImg = MUSCLE_DEFAULT_IMAGES[detectedMuscle];

  return {
    name: nameInput.trim(),
    targetMuscle: detectedMuscle,
    imageUrl: defaultImg,
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSeconds: 60,
    equipment: 'Academia',
    notes: `Exercício focado em ${detectedMuscle}. Execute com amplitude controlada e boa respiração.`,
  };
}
