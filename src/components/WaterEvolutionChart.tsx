import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';
import { Droplets, Calendar, Award, TrendingUp, CheckCircle2 } from 'lucide-react';
import { DailyHydration } from '../types/workout';
import { loadHydrationHistory, loadWaterGoal } from '../services/storage';

interface WaterEvolutionChartProps {
  todayHydration?: DailyHydration;
}

type ViewMode = 'dia' | 'semana' | 'mes';

export function WaterEvolutionChart({ todayHydration }: WaterEvolutionChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('semana');

  // Load history & goal
  const history = useMemo(() => {
    return loadHydrationHistory();
  }, [todayHydration]);

  const dailyGoalMl = useMemo(() => {
    return todayHydration?.goalMl || loadWaterGoal() || 2500;
  }, [todayHydration]);

  const dailyGoalL = dailyGoalMl / 1000;

  // ----------------------------------------------------
  // DATA FOR 'DIA' (Today's progression)
  // ----------------------------------------------------
  const dayData = useMemo(() => {
    const todayLogs = todayHydration?.logs || [];
    if (todayLogs.length === 0) {
      return [
        { time: '08:00', amountL: 0, cumulativeL: 0 },
        { time: '12:00', amountL: 0, cumulativeL: 0 },
        { time: '16:00', amountL: 0, cumulativeL: 0 },
        { time: '20:00', amountL: 0, cumulativeL: 0 },
      ];
    }

    // Sort logs chronologically
    const sorted = [...todayLogs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let cumulative = 0;
    return sorted.map((log) => {
      cumulative += log.amountMl;
      return {
        time: log.timeStr || new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        amountL: Number((log.amountMl / 1000).toFixed(2)),
        cumulativeL: Number((cumulative / 1000).toFixed(2)),
        goalL: dailyGoalL,
      };
    });
  }, [todayHydration, dailyGoalL]);

  // ----------------------------------------------------
  // DATA FOR 'SEMANA' (7 Days of current week: Seg -> Dom)
  // ----------------------------------------------------
  const weekData = useMemo(() => {
    const now = new Date();
    // Monday as start of week
    const currentDay = now.getDay();
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);

    const daysShort = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const result = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      const entry = history[dateKey];
      const totalMl = entry?.totalMl || (dateKey === todayHydration?.date ? todayHydration?.totalMl || 0 : 0);
      const liters = Number((totalMl / 1000).toFixed(2));
      const isReached = liters >= dailyGoalL;

      result.push({
        dayLabel: daysShort[i],
        dateFormatted: `${day}/${month}`,
        liters,
        isReached,
        goalL: dailyGoalL,
      });
    }

    return result;
  }, [history, todayHydration, dailyGoalL]);

  // ----------------------------------------------------
  // DATA FOR 'MES' (Days of the current month)
  // ----------------------------------------------------
  const monthData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const result = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = String(day).padStart(2, '0');
      const monthStr = String(month + 1).padStart(2, '0');
      const dateKey = `${year}-${monthStr}-${dayStr}`;

      const entry = history[dateKey];
      const totalMl = entry?.totalMl || (dateKey === todayHydration?.date ? todayHydration?.totalMl || 0 : 0);
      const liters = Number((totalMl / 1000).toFixed(2));

      result.push({
        dayNumber: String(day),
        dateFormatted: `${dayStr}/${monthStr}`,
        liters,
        goalL: dailyGoalL,
        isReached: liters >= dailyGoalL,
      });
    }

    return result;
  }, [history, todayHydration, dailyGoalL]);

  // Statistics depending on view mode
  const summary = useMemo(() => {
    if (viewMode === 'dia') {
      const totalL = Number(((todayHydration?.totalMl || 0) / 1000).toFixed(2));
      const percent = Math.min(100, Math.round((totalL / dailyGoalL) * 100));
      return {
        mainLabel: 'Total Hoje',
        mainValue: `${totalL.toFixed(2)} L`,
        secondaryLabel: 'Meta Diária',
        secondaryValue: `${dailyGoalL.toFixed(1)} L`,
        status: percent >= 100 ? 'Meta atingida!' : `${percent}% da meta`,
        isSuccess: percent >= 100,
      };
    } else if (viewMode === 'semana') {
      const totalWeekL = weekData.reduce((acc, d) => acc + d.liters, 0);
      const avgDailyL = totalWeekL / 7;
      const daysReached = weekData.filter((d) => d.isReached).length;
      return {
        mainLabel: 'Total na Semana',
        mainValue: `${totalWeekL.toFixed(1)} L`,
        secondaryLabel: 'Média Diária',
        secondaryValue: `${avgDailyL.toFixed(2)} L`,
        status: `${daysReached}/7 dias com meta`,
        isSuccess: daysReached >= 4,
      };
    } else {
      const totalMonthL = monthData.reduce((acc, d) => acc + d.liters, 0);
      const daysWithData = monthData.filter((d) => d.liters > 0).length || 1;
      const avgDailyL = totalMonthL / daysWithData;
      const daysReached = monthData.filter((d) => d.isReached).length;
      return {
        mainLabel: 'Total no Mês',
        mainValue: `${totalMonthL.toFixed(1)} L`,
        secondaryLabel: 'Média Diária',
        secondaryValue: `${avgDailyL.toFixed(2)} L`,
        status: `${daysReached} dias de meta batida`,
        isSuccess: daysReached > 0,
      };
    }
  }, [viewMode, todayHydration, dailyGoalL, weekData, monthData]);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#141517] p-4 sm:p-5 shadow-sm">
      {/* Header with Title and Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Droplets className="h-4 w-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white font-display">
              Consumo de Água
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Acompanhe sua hidratação e constância ao longo do tempo
          </p>
        </div>

        {/* View Mode Switcher: [ Dia | Semana | Mês ] */}
        <div className="inline-flex rounded-xl bg-zinc-900 border border-zinc-800 p-1 self-start sm:self-auto">
          {(['dia', 'semana', 'mes'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all capitalize ${
                viewMode === mode
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {mode === 'dia' ? 'Dia' : mode === 'semana' ? 'Semana' : 'Mês'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 my-4">
        <div className="rounded-xl bg-zinc-900/80 border border-zinc-800/90 p-2.5 sm:p-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
            {summary.mainLabel}
          </span>
          <span className="text-lg sm:text-xl font-bold font-mono text-sky-400">
            {summary.mainValue}
          </span>
        </div>

        <div className="rounded-xl bg-zinc-900/80 border border-zinc-800/90 p-2.5 sm:p-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
            {summary.secondaryLabel}
          </span>
          <span className="text-lg sm:text-xl font-bold font-mono text-zinc-200">
            {summary.secondaryValue}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-xl bg-zinc-900/80 border border-zinc-800/90 p-2.5 sm:p-3 flex items-center justify-between sm:block">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
            Consistência
          </span>
          <span className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {summary.status}
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-56 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'dia' ? (
            <AreaChart data={dayData} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="waterDayGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222428" vertical={false} />
              <XAxis dataKey="time" stroke="#52525b" fontSize={11} tickLine={false} />
              <YAxis stroke="#52525b" fontSize={11} tickLine={false} unit="L" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-xl bg-[#1b1d21] border border-[#2e3137] p-2.5 shadow-xl text-xs">
                        <span className="text-zinc-400 block mb-1">Horário: {d.time}</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-bold text-sky-400 font-mono">
                            {d.cumulativeL} L
                          </span>
                          <span className="text-zinc-400 text-[10px]">acumulado</span>
                        </div>
                        {d.amountL > 0 && (
                          <span className="text-[10px] text-zinc-400 block mt-0.5">
                            Dose: +{(d.amountL * 1000).toFixed(0)} ml
                          </span>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={dailyGoalL}
                stroke="#38bdf8"
                strokeDasharray="4 4"
                label={{
                  value: `Meta ${dailyGoalL}L`,
                  fill: '#38bdf8',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulativeL"
                stroke="#38bdf8"
                strokeWidth={2.5}
                fill="url(#waterDayGradient)"
                dot={{ r: 3.5, fill: '#38bdf8', strokeWidth: 1.5, stroke: '#141517' }}
              />
            </AreaChart>
          ) : viewMode === 'semana' ? (
            <BarChart data={weekData} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222428" vertical={false} />
              <XAxis dataKey="dayLabel" stroke="#52525b" fontSize={11} tickLine={false} />
              <YAxis stroke="#52525b" fontSize={11} tickLine={false} unit="L" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-xl bg-[#1b1d21] border border-[#2e3137] p-2.5 shadow-xl text-xs">
                        <span className="text-zinc-400 block mb-0.5">
                          {d.dayLabel} ({d.dateFormatted})
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-bold text-sky-400 font-mono">
                            {d.liters} L
                          </span>
                          <span className="text-zinc-400 text-[10px]">/ {dailyGoalL} L</span>
                        </div>
                        <span
                          className={`text-[10px] font-semibold mt-1 block ${
                            d.isReached ? 'text-emerald-400' : 'text-zinc-400'
                          }`}
                        >
                          {d.isReached ? '✓ Meta alcançada' : `${Math.round((d.liters / dailyGoalL) * 100)}% da meta`}
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={dailyGoalL}
                stroke="#38bdf8"
                strokeDasharray="4 4"
                label={{
                  value: `Meta ${dailyGoalL}L`,
                  fill: '#38bdf8',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
              <Bar dataKey="liters" radius={[6, 6, 0, 0]} fill="#0284c7" />
            </BarChart>
          ) : (
            <BarChart data={monthData} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222428" vertical={false} />
              <XAxis dataKey="dayNumber" stroke="#52525b" fontSize={10} tickLine={false} interval={2} />
              <YAxis stroke="#52525b" fontSize={11} tickLine={false} unit="L" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-xl bg-[#1b1d21] border border-[#2e3137] p-2.5 shadow-xl text-xs">
                        <span className="text-zinc-400 block mb-0.5">Dia {d.dateFormatted}</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-bold text-sky-400 font-mono">
                            {d.liters} L
                          </span>
                          <span className="text-zinc-400 text-[10px]">/ {dailyGoalL} L</span>
                        </div>
                        <span
                          className={`text-[10px] font-semibold mt-1 block ${
                            d.isReached ? 'text-emerald-400' : 'text-zinc-400'
                          }`}
                        >
                          {d.isReached ? '✓ Meta atingida' : 'Abaixo da meta'}
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={dailyGoalL}
                stroke="#38bdf8"
                strokeDasharray="4 4"
                label={{
                  value: `Meta ${dailyGoalL}L`,
                  fill: '#38bdf8',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
              <Bar dataKey="liters" radius={[4, 4, 0, 0]} fill="#0ea5e9" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
