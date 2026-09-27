import { MuscleGroup } from '../types/workout';
import { PRESET_EXERCISES, MUSCLE_DEFAULT_IMAGES } from './exerciseLibrary';

export interface OnlineExerciseResult {
  id: string;
  name: string;
  targetMuscle: MuscleGroup;
  imageUrl: string;
  secondaryMuscles?: string[];
  equipment: string;
  instructions?: string;
  source: 'wger' | 'exercisedb' | 'library' | 'smart';
}

// Portuguese to English translation map for exercise terms (wger and ExerciseDB are mostly English indexed)
const PT_TO_EN_MAP: Record<string, string> = {
  supino: 'bench press',
  'supino reto': 'barbell bench press',
  'supino inclinado': 'incline dumbbell bench press',
  'supino declinado': 'decline bench press',
  agachamento: 'squat',
  'agachamento livre': 'barbell squat',
  'leg press': 'leg press',
  extensora: 'leg extension',
  'cadeira extensora': 'leg extension',
  flexora: 'leg curl',
  'mesa flexora': 'lying leg curl',
  'cadeira flexora': 'seated leg curl',
  stiff: 'romanian deadlift',
  terra: 'deadlift',
  'levantamento terra': 'barbell deadlift',
  puxada: 'lat pulldown',
  'puxada frontal': 'lat pulldown',
  remada: 'cable row',
  'remada curvada': 'barbell row',
  'remada baixa': 'seated cable row',
  cavalinho: 't-bar row',
  crucifixo: 'chest fly',
  crossover: 'cable crossover',
  voador: 'pec deck',
  'peck deck': 'pec deck',
  desenvolvimento: 'shoulder press',
  'desenvolvimento militar': 'overhead military press',
  'elevacao lateral': 'lateral raise',
  'elevacao frontal': 'front raise',
  'face pull': 'face pull',
  rosca: 'biceps curl',
  'rosca direta': 'barbell curl',
  'rosca alternada': 'dumbbell curl',
  'rosca martelo': 'hammer curl',
  'rosca scott': 'preacher curl',
  triceps: 'triceps',
  'triceps corda': 'cable triceps pushdown rope',
  'triceps testa': 'skull crusher',
  'triceps frances': 'overhead triceps extension',
  'triceps pulley': 'triceps pushdown',
  mergulho: 'dips',
  paralelas: 'parallel bar dips',
  abdominal: 'crunch',
  prancha: 'plank',
  'elevacao pelvica': 'hip thrust',
  panturrilha: 'calf raise',
  gemeos: 'calf raise',
};

// Map English muscle categories to Portuguese MuscleGroup
function mapCategoryToMuscle(cat: string): MuscleGroup {
  const c = cat.toLowerCase();
  if (c.includes('chest') || c.includes('peitor') || c.includes('pectoral')) return 'Peitoral';
  if (c.includes('back') || c.includes('lats') || c.includes('costa') || c.includes('dorsal')) return 'Costas';
  if (c.includes('quad') || c.includes('thigh') || c.includes('leg') || c.includes('coxa') || c.includes('squat')) return 'Quadríceps';
  if (c.includes('hamstring') || c.includes('posterior')) return 'Posterior de Coxa';
  if (c.includes('glute')) return 'Glúteos';
  if (c.includes('shoulder') || c.includes('delt') || c.includes('ombro')) return 'Ombros';
  if (c.includes('bicep') || c.includes('arm')) return 'Bíceps';
  if (c.includes('tricep')) return 'Tríceps';
  if (c.includes('abs') || c.includes('abdom') || c.includes('core')) return 'Abdômen';
  if (c.includes('calf') || c.includes('panturrilha')) return 'Panturrilhas';
  if (c.includes('forearm') || c.includes('antebraço')) return 'Antebraço';
  return 'Peitoral';
}

// Search online exercise API (Wger & Free Exercise DB) with instant local match fallback
export async function searchOnlineExercises(searchTerm: string): Promise<OnlineExerciseResult[]> {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return [];

  const results: OnlineExerciseResult[] = [];

  // 1. First, search high-relevance local presets (instant response, curated Portuguese)
  const localMatches = PRESET_EXERCISES.filter(
    (e) =>
      e.name.toLowerCase().includes(query) ||
      e.keywords.some((k) => k.toLowerCase().includes(query)) ||
      e.targetMuscle.toLowerCase().includes(query)
  );

  for (const m of localMatches) {
    results.push({
      id: `local_${m.name.replace(/\s+/g, '_').toLowerCase()}`,
      name: m.name,
      targetMuscle: m.targetMuscle,
      imageUrl: m.imageUrl,
      equipment: m.equipment,
      instructions: m.notes,
      source: 'library',
    });
  }

  // 2. Query Public API: Wger Exercise API (Free, open source, no API key needed)
  try {
    // Translate search term if possible
    let englishQuery = query;
    for (const [pt, en] of Object.entries(PT_TO_EN_MAP)) {
      if (query.includes(pt)) {
        englishQuery = en;
        break;
      }
    }

    // Call Wger REST API for exercises
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const wgerUrl = `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(
      englishQuery
    )}&language=2`;

    const res = await fetch(wgerUrl, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        for (const item of data.suggestions.slice(0, 5)) {
          const muscle = mapCategoryToMuscle(item.data?.category || query);
          const exerciseId = item.data?.id;

          let imgUrl = MUSCLE_DEFAULT_IMAGES[muscle];
          if (item.data?.image) {
            imgUrl = item.data.image.startsWith('http')
              ? item.data.image
              : `https://wger.de${item.data.image}`;
          } else if (item.data?.image_thumbnail) {
            imgUrl = item.data.image_thumbnail.startsWith('http')
              ? item.data.image_thumbnail
              : `https://wger.de${item.data.image_thumbnail}`;
          }

          // Check if not already added
          const already = results.some(
            (r) => r.name.toLowerCase() === item.value?.toLowerCase()
          );
          if (!already && item.value) {
            results.push({
              id: `wger_${exerciseId || Math.random().toString(36).substring(7)}`,
              name: item.value,
              targetMuscle: muscle,
              imageUrl: imgUrl,
              equipment: 'Academia / Livre',
              instructions: `Exercício identificado via Wger Exercise API. Categoria: ${muscle}.`,
              source: 'wger',
            });
          }
        }
      }
    }
  } catch (err) {
    // Network or CORS issue with external API - graceful fallback to local and smart generator
    console.debug('Wger API query skipped or unreachable:', err);
  }

  // 3. If no exact results found or only 1 result, generate a smart matched entry
  if (results.length === 0) {
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
    } else if (/cardio|esteira|bike|bicicleta|corrida|aerob/i.test(query)) {
      detectedMuscle = 'Cardio / Funcional';
    }

    results.push({
      id: `smart_${Date.now()}`,
      name: searchTerm.trim(),
      targetMuscle: detectedMuscle,
      imageUrl: MUSCLE_DEFAULT_IMAGES[detectedMuscle],
      equipment: 'Halteres / Barra / Máquina',
      instructions: `Exercício personalizado para o grupo muscular ${detectedMuscle}.`,
      source: 'smart',
    });
  }

  return results;
}
