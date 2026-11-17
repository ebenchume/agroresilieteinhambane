import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Bug,
  Sprout,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Layers
} from 'lucide-react';
import {
  DistrictProvincialSummary,
  INHAMBANE_MAP_GEOMETRIES,
  ProvincialMapService
} from '../../services/provincialMapService';
import { FieldSurveyService } from '../../services/fieldSurveyService';
import { MachambaAreaService } from '../../services/machambaAreaService';
import { InhambaneDistrict } from '../../types/mobileApp';

interface ProvincialPestAreaMapSectionProps {
  onShowToast?: (msg: string, type?: 'success' | 'info') => void;
}

type MapLayerMode = 'pests' | 'areas';

export const ProvincialPestAreaMapSection: React.FC<ProvincialPestAreaMapSectionProps> = ({
  onShowToast
}) => {
  const [refreshTick, setRefreshTick] = useState(0);
  const [layerMode, setLayerMode] = useState<MapLayerMode>('pests');
  const [selectedDistrict, setSelectedDistrict] = useState<InhambaneDistrict>('Homoíne');
  const [cropFilter, setCropFilter] = useState<string>('Todas');
  const [pestFilter, setPestFilter] = useState<string>('Todas');

  useEffect(() => {
    const triggerRefresh = () => setRefreshTick(t => t + 1);
    window.addEventListener(FieldSurveyService.SURVEY_UPDATED_EVENT, triggerRefresh);
    window.addEventListener(MachambaAreaService.MEASUREMENT_UPDATED_EVENT, triggerRefresh);
    return () => {
      window.removeEventListener(FieldSurveyService.SURVEY_UPDATED_EVENT, triggerRefresh);
      window.removeEventListener(MachambaAreaService.MEASUREMENT_UPDATED_EVENT, triggerRefresh);
    };
  }, []);

  const summaries = useMemo(
    () => ProvincialMapService.buildProvincialAggregation(),
    [refreshTick]
  );

  const availableCrops = useMemo(() => {
    const set = new Set<string>();
    summaries.forEach(s => Object.keys(s.cropAreasHa).forEach(c => set.add(c)));
    return ['Todas', ...Array.from(set).sort()];
  }, [summaries]);

  const totals = useMemo(() => {
    let totalHa = 0;
    let criticalDistricts = 0;
    let alertDistricts = 0;
    let totalGpsPoints = 0;
    for (const s of summaries) {
      totalHa += cropFilter === 'Todas' ? s.totalAreaHa : s.cropAreasHa[cropFilter] || 0;
      if (s.maxSeverity === 'Crítico') criticalDistricts += 1;
      else if (s.maxSeverity === 'Alerta') alertDistricts += 1;
      totalGpsPoints += s.gpsPoints.length;
    }
    return {
      totalHa: Number(totalHa.toFixed(2)),
      criticalDistricts,
      alertDistricts,
      totalGpsPoints
    };
  }, [summaries, cropFilter]);

  const activeDistrictSummary: DistrictProvincialSummary = useMemo(() => {
    return summaries.find(s => s.district === selectedDistrict) || summaries[0];
  }, [summaries, selectedDistrict]);

  const maxDistrictArea = useMemo(() => {
    return Math.max(
      1,
      ...summaries.map(s =>
        cropFilter === 'Todas' ? s.totalAreaHa : s.cropAreasHa[cropFilter] || 0
      )
    );
  }, [summaries, cropFilter]);

  const getDistrictFillColor = (d: DistrictProvincialSummary): string => {
    if (layerMode === 'pests') {
      const relevantPests =
        pestFilter === 'Todas'
          ? d.pestHotspots
          : d.pestHotspots.filter(p =>
              p.pestName.toLowerCase().includes(pestFilter.toLowerCase())
            );

      if (pestFilter !== 'Todas' && relevantPests.length === 0) {
        return '#e7e5e4';
      }

      const topSev =
        relevantPests.reduce<'Crítico' | 'Alerta' | 'Moderado' | 'Controlado'>(
          (acc, cur) => {
            const rank = { Crítico: 4, Alerta: 3, Moderado: 2, Controlado: 1 };
            return rank[cur.severity] > rank[acc] ? cur.severity : acc;
          },
          'Controlado'
        );

      if (topSev === 'Crítico') return '#dc2626';
      if (topSev === 'Alerta') return '#d97706';
      if (topSev === 'Moderado') return '#eab308';
      return '#10b981';
    }

    // layerMode === 'areas'
    const val = cropFilter === 'Todas' ? d.totalAreaHa : d.cropAreasHa[cropFilter] || 0;
    if (val <= 0) return '#d6d3d1';
    const ratio = val / maxDistrictArea;
    if (ratio >= 0.7) return '#065f46';
    if (ratio >= 0.4) return '#059669';
    if (ratio >= 0.15) return '#34d399';
    return '#a7f3d0';
  };

  return (
    <div className="space-y-6">
      {/* Header & Excel/CSV Export Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#065f46] dark:text-emerald-400">
            <span>Cartografia SDAE · 14 Distritos da Província de Inhambane</span>
            <span aria-hidden="true" className="opacity-50">
              ·
            </span>
            <span className="text-stone-600 dark:text-stone-400 tabular-nums">
              {totals.totalGpsPoints} pontos GPS georreferenciados
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-stone-950 dark:text-white tracking-tight">
            Mapa Provincial de Pragas &amp; Áreas Cultivadas
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-2xl">
            Cruze em tempo real os focos de pragas (lagarta-do-cartucho, mosaico, oídio) com o total de hectares medidos e inquiridos por distrito e cultura.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              ProvincialMapService.exportProvincialDistrictsCSV(summaries);
              onShowToast?.('Relatório distrital Excel/CSV descarregado com sucesso!', 'success');
            }}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#065f46] hover:bg-[#022c22] text-white text-xs font-extrabold flex items-center gap-2 whitespace-nowrap"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Relatório Excel/CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              ProvincialMapService.exportCropBreakdownCSV(summaries);
              onShowToast?.('Tabela de áreas por cultura (CSV) descarregada!', 'success');
            }}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-100 text-xs font-bold flex items-center gap-2 whitespace-nowrap"
          >
            <Sprout className="w-4 h-4 text-[#065f46] dark:text-emerald-400" />
            <span>CSV por Cultura</span>
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 block">
            Área Total Monitorizada
          </span>
          <p className="font-display text-2xl font-extrabold text-[#065f46] dark:text-emerald-400 mt-1">
            {totals.totalHa.toLocaleString('pt-MZ')} ha
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 block">
            Distritos em Risco Crítico
          </span>
          <p className="font-display text-2xl font-extrabold text-rose-700 dark:text-rose-400 mt-1">
            {totals.criticalDistricts} distritos
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 block">
            Distritos em Vigilância / Alerta
          </span>
          <p className="font-display text-2xl font-extrabold text-amber-700 dark:text-amber-400 mt-1">
            {totals.alertDistricts} distritos
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 block">
            Pontos GPS no Mapa
          </span>
          <p className="font-display text-2xl font-extrabold text-stone-900 dark:text-white mt-1">
            {totals.totalGpsPoints} locais
          </p>
        </div>
      </div>

      {/* Main Map + Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Provincial Map SVG (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
          {/* Layer Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center p-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLayerMode('pests')}
                className={`min-h-[36px] px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors ${
                  layerMode === 'pests'
                    ? 'bg-white dark:bg-stone-900 text-rose-700 dark:text-rose-400 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                <Bug className="w-3.5 h-3.5" />
                <span>Manchas de Pragas</span>
              </button>
              <button
                type="button"
                onClick={() => setLayerMode('areas')}
                className={`min-h-[36px] px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors ${
                  layerMode === 'areas'
                    ? 'bg-white dark:bg-stone-900 text-[#065f46] dark:text-emerald-400 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Áreas por Cultura</span>
              </button>
            </div>

            {layerMode === 'pests' ? (
              <select
                aria-label="Filtrar por praga"
                value={pestFilter}
                onChange={e => setPestFilter(e.target.value)}
                className="min-h-[36px] px-2.5 py-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-bold"
              >
                <option value="Todas">Todas as pragas</option>
                <option value="Lagarta">Lagarta-do-Cartucho</option>
                <option value="Oídio">Oídio do Cajueiro</option>
                <option value="Mosaico">Mosaico da Mandioca</option>
              </select>
            ) : (
              <select
                aria-label="Filtrar por cultura"
                value={cropFilter}
                onChange={e => setCropFilter(e.target.value)}
                className="min-h-[36px] px-2.5 py-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-bold"
              >
                {availableCrops.map(c => (
                  <option key={c} value={c}>
                    {c === 'Todas' ? 'Todas as culturas' : c}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Interactive SVG Map of Inhambane Province */}
          <div className="relative rounded-2xl border border-stone-200 dark:border-stone-800 bg-sky-50/60 dark:bg-stone-950 p-3 flex justify-center">
            <svg
              viewBox="0 0 360 440"
              className="w-full max-w-[400px] h-auto select-none"
              role="img"
              aria-label="Mapa interativo dos 14 distritos da província de Inhambane"
            >
              {/* Indian Ocean Label */}
              <text
                x="306"
                y="110"
                className="fill-sky-700/70 dark:fill-sky-400/60 text-[10px] font-semibold"
                transform="rotate(75, 306, 110)"
              >
                OCEANO ÍNDICO
              </text>
              <text
                x="284"
                y="272"
                className="fill-sky-800/80 dark:fill-sky-300/70 text-[8.5px] font-medium"
              >
                Baía
              </text>

              {/* 14 District Polygons */}
              {summaries.map(summary => {
                const geom = INHAMBANE_MAP_GEOMETRIES[summary.district];
                const isSelected = summary.district === selectedDistrict;
                const fill = getDistrictFillColor(summary);

                return (
                  <g
                    key={summary.district}
                    onClick={() => setSelectedDistrict(summary.district)}
                    className="cursor-pointer transition-opacity hover:opacity-90"
                  >
                    <path
                      d={geom.svgPath}
                      fill={fill}
                      fillOpacity={layerMode === 'pests' ? 0.78 : 0.85}
                      stroke={isSelected ? '#1c1917' : '#ffffff'}
                      strokeWidth={isSelected ? 2.6 : 1.2}
                    />
                    <text
                      x={geom.labelX}
                      y={geom.labelY}
                      textAnchor="middle"
                      className="fill-stone-950 text-[8.5px] font-extrabold pointer-events-none"
                      style={{ paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: '2.5px' }}
                    >
                      {summary.district === 'Inhambane-Cidade' ? 'Inhamb.' : summary.district}
                    </text>
                    {layerMode === 'areas' && (
                      <text
                        x={geom.labelX}
                        y={geom.labelY + 10}
                        textAnchor="middle"
                        className="fill-stone-900 text-[7.5px] font-mono font-bold pointer-events-none"
                        style={{ paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: '2px' }}
                      >
                        {(cropFilter === 'Todas'
                          ? summary.totalAreaHa
                          : summary.cropAreasHa[cropFilter] || 0
                        ).toFixed(1)}
                        ha
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Plotted Real GPS Points from Surveys, Visits & Field Measurements */}
              {summaries.flatMap(s => s.gpsPoints).map(pt => (
                <g
                  key={pt.id}
                  onClick={() => setSelectedDistrict(pt.district)}
                  className="cursor-pointer"
                >
                  <title>{`${pt.district} — ${pt.label}: ${pt.detail}`}</title>
                  <circle
                    cx={pt.svgX}
                    cy={pt.svgY}
                    r={4}
                    className={
                      pt.source === 'medicao'
                        ? 'fill-amber-300 stroke-stone-950'
                        : pt.source === 'visita'
                          ? 'fill-sky-400 stroke-stone-950'
                          : 'fill-white stroke-stone-950'
                    }
                    strokeWidth="1.4"
                  />
                </g>
              ))}
            </svg>
          </div>

          {/* Map Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-stone-600 dark:text-stone-400">
            {layerMode === 'pests' ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#dc2626]" /> Crítico
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#d97706]" /> Alerta
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#eab308]" /> Moderado
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#10b981]" /> Controlado
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#065f46]" /> Maior área (ha)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#34d399]" /> Média
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#d6d3d1]" /> Sem registo
                </span>
              </div>
            )}
            <span className="flex items-center gap-1">
              <Navigation className="w-3 h-3" /> Toque num distrito para detalhar
            </span>
          </div>
        </div>

        {/* Right: District Inspector (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-stone-200 dark:border-stone-800">
            <div>
              <span className="text-xs font-bold text-[#065f46] dark:text-emerald-400">
                {activeDistrictSummary.zoneType}
              </span>
              <h3 className="font-display text-xl font-extrabold text-stone-950 dark:text-white">
                Distrito de {activeDistrictSummary.district}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Localidades: {activeDistrictSummary.localities.join(' · ')}
              </p>
            </div>
            <div className="text-right tabular-nums">
              <span className="text-[11px] text-stone-500 block">Área Levantada</span>
              <strong className="font-display text-xl font-extrabold text-[#065f46] dark:text-emerald-400">
                {activeDistrictSummary.totalAreaHa.toFixed(2)} ha
              </strong>
            </div>
          </div>

          {/* Crop Area Breakdown */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Hectares por Cultura em {activeDistrictSummary.district}</span>
            </h4>

            {Object.keys(activeDistrictSummary.cropAreasHa).length === 0 ? (
              <p className="text-xs text-stone-500 dark:text-stone-400 py-2">
                Ainda sem áreas registadas neste distrito. Adicione um inquérito ou medição de machamba.
              </p>
            ) : (
              <div className="space-y-2 tabular-nums">
                {Object.entries(activeDistrictSummary.cropAreasHa)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cropName, ha]) => {
                    const pct = Math.min(
                      100,
                      Math.round((ha / Math.max(0.1, activeDistrictSummary.totalAreaHa)) * 100)
                    );
                    return (
                      <div key={cropName} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-stone-800 dark:text-stone-200">{cropName}</span>
                          <span className="text-[#065f46] dark:text-emerald-400 font-bold">
                            {ha.toFixed(2)} ha ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                          <div
                            className="h-full bg-[#065f46] dark:bg-emerald-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Pest Hotspots */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Bug className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Situação Fitossanitária &amp; Manchas de Pragas</span>
            </h4>

            <div className="space-y-2">
              {activeDistrictSummary.pestHotspots.map((spot, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2 font-bold">
                    <span className="flex items-center gap-1.5 text-stone-900 dark:text-white">
                      {spot.severity === 'Crítico' || spot.severity === 'Alerta' ? (
                        <AlertTriangle
                          className={`w-3.5 h-3.5 ${
                            spot.severity === 'Crítico' ? 'text-rose-600' : 'text-amber-600'
                          }`}
                        />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span>
                        {spot.pestName} ({spot.crop})
                      </span>
                    </span>
                    <span className="tabular-nums font-extrabold text-stone-700 dark:text-stone-300">
                      {spot.severity} · {spot.affectedPercent}%
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    {spot.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* District GPS Points List */}
          {activeDistrictSummary.gpsPoints.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
              <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#065f46] dark:text-emerald-400" />
                <span>Pontos GPS em {activeDistrictSummary.district}</span>
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1 text-[11px] tabular-nums">
                {activeDistrictSummary.gpsPoints.map(pt => (
                  <div
                    key={pt.id}
                    className="flex items-center justify-between gap-2 text-stone-600 dark:text-stone-400"
                  >
                    <span className="truncate font-medium text-stone-800 dark:text-stone-200">
                      {pt.label} · {pt.detail}
                    </span>
                    <span className="font-mono text-[10px] shrink-0">
                      {pt.lat.toFixed(3)}, {pt.lng.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Consolidated 14-District Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            Quadro Consolidado dos 14 Distritos (Inquéritos, Áreas e Pragas)
          </h3>
          <span className="text-xs text-stone-500">Clique numa linha para inspecionar no mapa</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs tabular-nums">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 text-[11px]">
                <th className="py-2 pr-3">Distrito</th>
                <th className="py-2 pr-3">Zona</th>
                <th className="py-2 pr-3 text-right">Área (ha)</th>
                <th className="py-2 pr-3 text-right">Inquéritos</th>
                <th className="py-2 pr-3 text-right">Medições</th>
                <th className="py-2 pr-3">Praga Principal</th>
                <th className="py-2 text-right">Infestação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {summaries.map(row => (
                <tr
                  key={row.district}
                  onClick={() => setSelectedDistrict(row.district)}
                  className={`cursor-pointer transition-colors ${
                    row.district === selectedDistrict
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 font-semibold'
                      : 'hover:bg-stone-50 dark:hover:bg-stone-800/50'
                  }`}
                >
                  <td className="py-2.5 pr-3 font-bold text-stone-900 dark:text-white">
                    {row.district}
                  </td>
                  <td className="py-2.5 pr-3 text-stone-600 dark:text-stone-400">{row.zoneType}</td>
                  <td className="py-2.5 pr-3 text-right font-mono font-bold text-[#065f46] dark:text-emerald-400">
                    {row.totalAreaHa.toFixed(2)} ha
                  </td>
                  <td className="py-2.5 pr-3 text-right">{row.surveysCount}</td>
                  <td className="py-2.5 pr-3 text-right">{row.measurementsCount}</td>
                  <td className="py-2.5 pr-3 text-stone-700 dark:text-stone-300">
                    {row.pestHotspots[0]?.pestName}
                  </td>
                  <td
                    className={`py-2.5 text-right font-bold ${
                      row.maxSeverity === 'Crítico'
                        ? 'text-rose-700 dark:text-rose-400'
                        : row.maxSeverity === 'Alerta'
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    {row.maxSeverity} ({row.maxInfestationPercent}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
