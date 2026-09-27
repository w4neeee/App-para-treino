import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Scale, TrendingDown, TrendingUp, Minus, Calendar, Sparkles } from 'lucide-react';
import { WeightEntry } from '../types/workout';

interface WeightEvolutionChartProps {
  weightEntries: WeightEntry[];
}

export function WeightEvolutionChart({ weightEntries }: WeightEvolutionChartProps) {
  // Sort chronological (oldest to newest) for chart timeline
  const chartData = useMemo(() => {
    if (!weightEntries || weightEntries.length === 0) return [];

    const sorted = [...weightEntries].sort((a, b) => {
      const timeA = new Date(a.date || a.timestamp).getTime();
      const timeB = new Date(b.date || b.timestamp).getTime();
      return timeA - timeB;
    });

    return sorted.map((entry) => {
      const d = new Date(entry.date || entry.timestamp);
      // Format as DD/MM
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const formattedDate = `${day}/${month}`;

      return {
        id: entry.id,
        weight: Number(entry.weightKg.toFixed(1)),
        formattedDate,
        fullDate: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
        notes: entry.notes || '',
      };
    });
  }, [weightEntries]);

  // Statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return null;
    }

    const weights = chartData.map((d) => d.weight);
    const initialWeight = weights[0];
    const latestWeight = weights[weights.length - 1];
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const totalDiff = latestWeight - initialWeight;

    // Y Axis Domain range with cushion
    const yMin = Math.floor(minWeight - 1);
    const yMax = Math.ceil(maxWeight + 1);

    return {
      initialWeight,
      latestWeight,
      minWeight,
      maxWeight,
      totalDiff,
      yMin,
      yMax,
      count: chartData.length,
    };
  }, [chartData]);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#141517] p-4 sm:p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#ff5500]/15 border border-[#ff5500]/30 flex items-center justify-center text-[#ff5500]">
              <Scale className="h-4 w-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white font-display">
              Evolução do Peso Corporal
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Linha do tempo acompanhando a variação do seu peso registrado
          </p>
        </div>

        {/* Quick summary badges */}
        {stats && (
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
              <span className="text-[10px] text-zinc-400 uppercase font-mono block">Atual</span>
              <span className="font-bold text-white font-mono">
                {stats.latestWeight.toFixed(1)} kg
              </span>
            </div>

            {stats.count > 1 && (
              <div
                className={`px-3 py-1.5 rounded-xl border text-xs ${
                  stats.totalDiff < 0
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : stats.totalDiff > 0
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-[10px] uppercase font-mono block text-zinc-400">
                    {stats.totalDiff < 0 ? 'Perda' : stats.totalDiff > 0 ? 'Ganho' : 'Variação'}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-bold font-mono">
                  {stats.totalDiff < 0 ? (
                    <TrendingDown className="h-3.5 w-3.5" />
                  ) : stats.totalDiff > 0 ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <Minus className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {stats.totalDiff > 0 ? `+${stats.totalDiff.toFixed(1)}` : stats.totalDiff.toFixed(1)} kg
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      {chartData.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 text-xs sm:text-sm">
          <Scale className="h-8 w-8 mx-auto mb-2 text-zinc-600 stroke-[1.5]" />
          Nenhum peso registrado ainda. Registre seu primeiro peso na tela inicial!
        </div>
      ) : chartData.length === 1 ? (
        <div className="py-8 text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#ff5500]/10 border border-[#ff5500]/30 text-[#ff5500]">
            <Sparkles className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-white">
            Primeiro registro: {chartData[0].weight} kg ({chartData[0].fullDate})
          </p>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Adicione novos registros ao longo dos dias na tela inicial para visualizar o gráfico de linha completo da sua evolução!
          </p>
        </div>
      ) : (
        <div className="mt-4">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightTimelineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff5500" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#ff5500" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#222428" vertical={false} />

                <XAxis
                  dataKey="formattedDate"
                  stroke="#52525b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#27292d' }}
                />

                <YAxis
                  domain={[stats?.yMin ?? 'auto', stats?.yMax ?? 'auto']}
                  stroke="#52525b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#27292d' }}
                  unit="k"
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl bg-[#1b1d21] border border-[#2e3137] p-2.5 shadow-xl text-xs">
                          <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                            <Calendar className="h-3 w-3" />
                            <span>{data.fullDate}</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-black text-[#ff5500] font-mono">
                              {data.weight}
                            </span>
                            <span className="text-xs font-semibold text-zinc-300">kg</span>
                          </div>
                          {data.notes && (
                            <p className="text-[10px] text-zinc-400 mt-1 italic border-t border-zinc-800 pt-1">
                              {data.notes}
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#ff5500"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#weightTimelineGradient)"
                  dot={{ r: 3.5, fill: '#ff5500', strokeWidth: 1.5, stroke: '#141517' }}
                  activeDot={{ r: 5.5, fill: '#ff5500', stroke: '#ffffff', strokeWidth: 1.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Min / Max Info footer */}
          {stats && (
            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 px-1 border-t border-zinc-800/60 font-mono">
              <span>Mínimo: <strong className="text-zinc-200">{stats.minWeight.toFixed(1)} kg</strong></span>
              <span>Registros: <strong className="text-zinc-200">{stats.count}</strong></span>
              <span>Máximo: <strong className="text-zinc-200">{stats.maxWeight.toFixed(1)} kg</strong></span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
