import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart
} from 'recharts';
import { 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  Droplets, 
  Coins, 
  Sprout, 
  ArrowUpRight, 
  Award,
  Layers,
  Filter,
  Info
} from 'lucide-react';
import { User, CropType } from '../types/auth';

interface ProductivityChartSectionProps {
  user: User;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

interface MonthlyData {
  month: string;
  shortMonth: string;
  season: '1ª Época (Chuvosa)' | '2ª Época (Fresca/Baixas)' | 'Preparação';
  milho: number;
  mandioca: number;
  amendoim: number;
  horticolas: number;
  feijao: number;
  totalProduction: number;
  districtAverage: number;
  rainfallMm: number;
  revenueMt: number;
}

// 12-month Inhambane historical agricultural data
const MONTHLY_PRODUCTIVITY_DATA: MonthlyData[] = [
  {
    month: 'Janeiro 2026',
    shortMonth: 'Jan',
    season: '1ª Época (Chuvosa)',
    milho: 320,
    mandioca: 450,
    amendoim: 0,
    horticolas: 120,
    feijao: 180,
    totalProduction: 1070,
    districtAverage: 820,
    rainfallMm: 165,
    revenueMt: 28400
  },
  {
    month: 'Fevereiro 2026',
    shortMonth: 'Fev',
    season: '1ª Época (Chuvosa)',
    milho: 680,
    mandioca: 510,
    amendoim: 120,
    horticolas: 150,
    feijao: 310,
    totalProduction: 1770,
    districtAverage: 1250,
    rainfallMm: 185,
    revenueMt: 49500
  },
  {
    month: 'Março 2026',
    shortMonth: 'Mar',
    season: '1ª Época (Chuvosa)',
    milho: 1450,
    mandioca: 620,
    amendoim: 420,
    horticolas: 210,
    feijao: 440,
    totalProduction: 3140,
    districtAverage: 2300,
    rainfallMm: 120,
    revenueMt: 92300
  },
  {
    month: 'Abril 2026',
    shortMonth: 'Abr',
    season: '1ª Época (Chuvosa)',
    milho: 1980,
    mandioca: 700,
    amendoim: 890,
    horticolas: 280,
    feijao: 520,
    totalProduction: 4370,
    districtAverage: 3100,
    rainfallMm: 65,
    revenueMt: 135800
  },
  {
    month: 'Maio 2025',
    shortMonth: 'Mai',
    season: '1ª Época (Chuvosa)',
    milho: 1150,
    mandioca: 850,
    amendoim: 680,
    horticolas: 390,
    feijao: 250,
    totalProduction: 3320,
    districtAverage: 2450,
    rainfallMm: 35,
    revenueMt: 106200
  },
  {
    month: 'Junho 2025',
    shortMonth: 'Jun',
    season: '2ª Época (Fresca/Baixas)',
    milho: 280,
    mandioca: 920,
    amendoim: 150,
    horticolas: 680,
    feijao: 120,
    totalProduction: 2150,
    districtAverage: 1680,
    rainfallMm: 22,
    revenueMt: 71400
  },
  {
    month: 'Julho 2025',
    shortMonth: 'Jul',
    season: '2ª Época (Fresca/Baixas)',
    milho: 180,
    mandioca: 980,
    amendoim: 80,
    horticolas: 940,
    feijao: 90,
    totalProduction: 2270,
    districtAverage: 1720,
    rainfallMm: 18,
    revenueMt: 78500
  },
  {
    month: 'Agosto 2025',
    shortMonth: 'Ago',
    season: '2ª Época (Fresca/Baixas)',
    milho: 120,
    mandioca: 1050,
    amendoim: 50,
    horticolas: 1120,
    feijao: 60,
    totalProduction: 2400,
    districtAverage: 1810,
    rainfallMm: 15,
    revenueMt: 84200
  },
  {
    month: 'Setembro 2025',
    shortMonth: 'Set',
    season: '2ª Época (Fresca/Baixas)',
    milho: 90,
    mandioca: 880,
    amendoim: 40,
    horticolas: 850,
    feijao: 40,
    totalProduction: 1900,
    districtAverage: 1420,
    rainfallMm: 28,
    revenueMt: 64800
  },
  {
    month: 'Outubro 2025',
    shortMonth: 'Out',
    season: 'Preparação',
    milho: 60,
    mandioca: 650,
    amendoim: 30,
    horticolas: 420,
    feijao: 30,
    totalProduction: 1190,
    districtAverage: 950,
    rainfallMm: 72,
    revenueMt: 39100
  },
  {
    month: 'Novembro 2025',
    shortMonth: 'Nov',
    season: '1ª Época (Chuvosa)',
    milho: 80,
    mandioca: 520,
    amendoim: 40,
    horticolas: 280,
    feijao: 60,
    totalProduction: 980,
    districtAverage: 780,
    rainfallMm: 115,
    revenueMt: 31200
  },
  {
    month: 'Dezembro 2025',
    shortMonth: 'Dez',
    season: '1ª Época (Chuvosa)',
    milho: 180,
    mandioca: 480,
    amendoim: 60,
    horticolas: 190,
    feijao: 110,
    totalProduction: 1020,
    districtAverage: 810,
    rainfallMm: 142,
    revenueMt: 32600
  }
];

export const ProductivityChartSection: React.FC<ProductivityChartSectionProps> = ({
  user,
  onShowToast
}) => {
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('total');
  const [chartView, setChartView] = useState<'composed' | 'financial' | 'stacked'>('composed');

  // Total annual metrics
  const totalAnnualKg = MONTHLY_PRODUCTIVITY_DATA.reduce((acc, curr) => acc + curr.totalProduction, 0);
  const totalAnnualRevenueMt = MONTHLY_PRODUCTIVITY_DATA.reduce((acc, curr) => acc + curr.revenueMt, 0);
  const districtAnnualAvgKg = MONTHLY_PRODUCTIVITY_DATA.reduce((acc, curr) => acc + curr.districtAverage, 0);
  const aboveDistrictPercent = Math.round(((totalAnnualKg - districtAnnualAvgKg) / districtAnnualAvgKg) * 100);

  // Peak month
  const peakMonth = [...MONTHLY_PRODUCTIVITY_DATA].sort((a, b) => b.totalProduction - a.totalProduction)[0];

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as MonthlyData;
      return (
        <div className="bg-stone-900/95 text-white p-3.5 rounded-xl shadow-xl border border-stone-700 text-xs space-y-1.5 backdrop-blur-md min-w-[210px]">
          <div className="flex items-center justify-between border-b border-stone-800 pb-1.5 mb-1.5">
            <span className="font-bold text-stone-200">{dataPoint.month}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-medium">
              {dataPoint.season}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-emerald-300 font-semibold">
              <span>Produção da Machamba:</span>
              <span>{dataPoint.totalProduction.toLocaleString('pt-MZ')} kg</span>
            </div>
            <div className="flex justify-between items-center text-stone-400">
              <span>Média Distrital (Homoíne):</span>
              <span>{dataPoint.districtAverage.toLocaleString('pt-MZ')} kg</span>
            </div>
            <div className="flex justify-between items-center text-amber-300">
              <span>Receita Comercializada:</span>
              <span>{dataPoint.revenueMt.toLocaleString('pt-MZ')} MT</span>
            </div>
            <div className="flex justify-between items-center text-sky-300">
              <span>Precipitação Pluvial:</span>
              <span>{dataPoint.rainfallMm} mm</span>
            </div>
          </div>

          {/* Breakdown if total */}
          {selectedCropFilter === 'total' && (
            <div className="pt-2 border-t border-stone-800 text-[10px] text-stone-400 grid grid-cols-2 gap-x-2 gap-y-0.5">
              <span>🌽 Milho: {dataPoint.milho} kg</span>
              <span>🍠 Mandioca: {dataPoint.mandioca} kg</span>
              <span>🥜 Amendoim: {dataPoint.amendoim} kg</span>
              <span>🥬 Hortícolas: {dataPoint.horticolas} kg</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-stone-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-emerald-200 border border-white/10">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Painel de Produtividade Agrária · Recharts Analytics</span>
            </div>
            <h2 className="text-2xl font-bold font-serif">
              Histórico de Produtividade Mensal dos Produtores Familiares
            </h2>
            <p className="text-sm text-emerald-100 max-w-2xl leading-relaxed">
              Acompanhamento mensal da produção da machamba (kg), rendimento financeiro (MT) e comparação com a média do distrito de Homoíne ao longo do ciclo das chuvas e da época fresca.
            </p>
          </div>

          {/* Chart View Switcher */}
          <div className="flex items-center gap-1.5 bg-white/10 p-1.5 rounded-xl border border-white/15 self-start md:self-auto text-xs">
            <button
              onClick={() => {
                setChartView('composed');
                onShowToast('Visualização: Produção vs Média Distrital', 'info');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
                chartView === 'composed'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Produção & Chuva
            </button>
            <button
              onClick={() => {
                setChartView('financial');
                onShowToast('Visualização: Produção vs Receita em Meticais', 'info');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
                chartView === 'financial'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Receita (MT)
            </button>
            <button
              onClick={() => {
                setChartView('stacked');
                onShowToast('Visualização: Composição por Cultura', 'info');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
                chartView === 'stacked'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Culturas
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Annual Yield */}
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Produção Acumulada</span>
            <Sprout className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {totalAnnualKg.toLocaleString('pt-MZ')} <span className="text-xs font-medium text-stone-400">kg</span>
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{aboveDistrictPercent}% acima da média distrital</span>
          </div>
        </div>

        {/* Peak Harvest Month */}
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Pico de Colheita</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {peakMonth.shortMonth} / {peakMonth.totalProduction.toLocaleString('pt-MZ')} <span className="text-xs font-medium text-stone-400">kg</span>
          </p>
          <span className="text-[11px] text-stone-400 block">
            Milho & Mandioca em pleno vigor
          </span>
        </div>

        {/* Total Generated Revenue */}
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Receita Anual Estimada</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {totalAnnualRevenueMt.toLocaleString('pt-MZ')} <span className="text-xs font-medium text-stone-400">MT</span>
          </p>
          <span className="text-[11px] text-stone-400 block">
            Vendas no mercado da Maxixe e Homoíne
          </span>
        </div>

        {/* Agroecological Resilience Score */}
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Índice de Resiliência</span>
            <Droplets className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">
            92 / 100
          </p>
          <span className="text-[11px] text-stone-400 block">
            Produção contínua na 1ª e 2ª época
          </span>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-5">
        {/* Top Control Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              {chartView === 'composed' && 'Evolução Mensal da Produção da Machamba vs Média de Homoíne'}
              {chartView === 'financial' && 'Comparação entre Volume de Colheita (kg) e Rendimento Bruto (MT)'}
              {chartView === 'stacked' && 'Distribuição das Colheitas por Cultura e Época Agrícola'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Dados consolidados de {user.name} ({user.zone}) com validação do SDAE.
            </p>
          </div>

          {/* Quick Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={selectedCropFilter}
              onChange={(e) => setSelectedCropFilter(e.target.value)}
              className="text-xs font-semibold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-1.5 text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="total">Todas as Culturas Combinadas</option>
              <option value="milho">Milho</option>
              <option value="mandioca">Mandioca</option>
              <option value="amendoim">Amendoim</option>
              <option value="horticolas">Hortícolas de Baixa</option>
              <option value="feijao">Feijão Nhemba</option>
            </select>
          </div>
        </div>

        {/* RECHARTS CHART RENDERING */}
        <div className="h-[360px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'composed' ? (
              <ComposedChart
                data={MONTHLY_PRODUCTIVITY_DATA}
                margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis 
                  dataKey="shortMonth" 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis 
                  yAxisId="left" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  unit=" kg"
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{ fontSize: 11, fill: '#0284c7' }} 
                  unit=" mm"
                  axisLine={{ stroke: '#bae6fd' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }}
                />
                
                {/* Area for Family Farmer Production */}
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="totalProduction"
                  name="Produção da Machamba (kg)"
                  fill="#10b981"
                  fillOpacity={0.25}
                  stroke="#059669"
                  strokeWidth={2.5}
                />

                {/* Line for District Average */}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="districtAverage"
                  name="Média Distrital Homoíne (kg)"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3 }}
                />

                {/* Line for Rainfall */}
                <Bar
                  yAxisId="right"
                  dataKey="rainfallMm"
                  name="Chuva Mensal (mm)"
                  fill="#38bdf8"
                  opacity={0.5}
                  radius={[4, 4, 0, 0]}
                  barSize={16}
                />
              </ComposedChart>
            ) : chartView === 'financial' ? (
              <ComposedChart
                data={MONTHLY_PRODUCTIVITY_DATA}
                margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis 
                  dataKey="shortMonth" 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                />
                <YAxis 
                  yAxisId="left" 
                  tick={{ fontSize: 11, fill: '#059669' }} 
                  unit=" kg"
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{ fontSize: 11, fill: '#d97706' }} 
                  unit=" MT"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }}
                />

                <Bar
                  yAxisId="left"
                  dataKey="totalProduction"
                  name="Colheita Total (kg)"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />

                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenueMt"
                  name="Receita de Venda (MT)"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#d97706' }}
                />
              </ComposedChart>
            ) : (
              <BarChart
                data={MONTHLY_PRODUCTIVITY_DATA}
                margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="shortMonth" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" kg" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />

                <Bar dataKey="milho" name="Milho" stackId="a" fill="#eab308" />
                <Bar dataKey="mandioca" name="Mandioca" stackId="a" fill="#10b981" />
                <Bar dataKey="amendoim" name="Amendoim" stackId="a" fill="#f97316" />
                <Bar dataKey="horticolas" name="Hortícolas" stackId="a" fill="#06b6d4" />
                <Bar dataKey="feijao" name="Feijão Nhemba" stackId="a" fill="#8b5cf6" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Agronomic Seasonal Insights Box */}
        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 dark:text-stone-100">
                Padrão Sazonal de Inhambane Observado
              </h4>
              <p className="text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                O pico de produção de grãos (Milho e Feijão) ocorre entre Março e Maio logo após o regime de chuvas. Nos meses secos (Junho a Setembro), o rendimento é sustentado pela mandioca perene e pelas hortícolas de regadio nas baixas de Homoíne.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px]">
              Taxa de Sucesso: 88.4%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
