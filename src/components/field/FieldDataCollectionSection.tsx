import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardCheck,
  Smartphone,
  MapPin,
  Download,
  RefreshCw,
  Wifi,
  WifiOff,
  Sprout,
  Users,
  BarChart3,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  FileJson,
  Filter
} from 'lucide-react';
import {
  FieldSurveyService,
  INHAMBANE_DISTRICTS_CATALOG
} from '../../services/fieldSurveyService';
import { FieldSurveyRecord, InhambaneDistrict } from '../../types/mobileApp';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { FieldSurveyModal } from './FieldSurveyModal';
import { AndroidDownloadModal } from '../AndroidDownloadModal';

interface FieldDataCollectionSectionProps {
  onShowToast?: (msg: string, type?: 'success' | 'info') => void;
}

export const FieldDataCollectionSection: React.FC<FieldDataCollectionSectionProps> = ({
  onShowToast
}) => {
  const isOnline = useOnlineStatus();
  const { isInstalled } = usePWAInstall();

  const [surveys, setSurveys] = useState<FieldSurveyRecord[]>(() => FieldSurveyService.getSurveys());
  const [districtFilter, setDistrictFilter] = useState<'Todos' | InhambaneDistrict>('Todos');
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [androidModalOpen, setAndroidModalOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const reloadSurveys = () => {
    setSurveys(FieldSurveyService.getSurveys());
  };

  useEffect(() => {
    window.addEventListener(FieldSurveyService.SURVEY_UPDATED_EVENT, reloadSurveys);
    return () => {
      window.removeEventListener(FieldSurveyService.SURVEY_UPDATED_EVENT, reloadSurveys);
    };
  }, []);

  const filteredSurveys = useMemo(() => {
    if (districtFilter === 'Todos') return surveys;
    return surveys.filter(s => s.district === districtFilter);
  }, [surveys, districtFilter]);

  const pendingCount = useMemo(
    () => surveys.filter(s => s.syncStatus === 'pendente_offline').length,
    [surveys]
  );

  const stats = useMemo(() => {
    const target = filteredSurveys;
    const districtsCovered = new Set(surveys.map(s => s.district)).size;
    const totalArea = target.reduce((sum, s) => sum + (s.totalAreaHa || 0), 0);
    const totalYield = target.reduce((sum, s) => sum + (s.estimatedYieldKg || 0), 0);
    const resilientAdopters = target.filter(s => s.conservationPractices.length >= 2).length;
    const resilienceRate = target.length > 0 ? Math.round((resilientAdopters / target.length) * 100) : 0;

    // Crop frequency breakdown
    const cropCounts: Record<string, number> = {};
    target.forEach(s => {
      s.primaryCrops.forEach(c => {
        cropCounts[c] = (cropCounts[c] || 0) + 1;
      });
    });

    const topCrops = Object.entries(cropCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return {
      totalSurveys: target.length,
      districtsCovered,
      totalArea: Number(totalArea.toFixed(1)),
      totalYield,
      resilienceRate,
      topCrops
    };
  }, [filteredSurveys, surveys]);

  const handleSyncAll = async () => {
    if (!isOnline) {
      onShowToast?.('Sem ligação à rede. Os inquéritos continuam guardados com segurança no Android.', 'info');
      return;
    }
    setSyncing(true);
    const res = await FieldSurveyService.syncPendingSurveys();
    setSyncing(false);
    reloadSurveys();
    if (res.failed) {
      onShowToast?.('Não foi possível sincronizar agora. Os dados permanecem guardados offline.', 'info');
    } else if (res.syncedCount > 0) {
      onShowToast?.(`${res.syncedCount} inquérito(s) sincronizado(s) com o servidor provincial!`, 'success');
    } else {
      onShowToast?.('Todos os inquéritos já estão sincronizados.', 'info');
    }
  };

  const handleDelete = (id: string) => {
    FieldSurveyService.deleteSurvey(id);
    reloadSurveys();
    onShowToast?.('Registo de inquérito removido.', 'info');
  };

  return (
    <section className="space-y-6">
      {/* Top Mobile Field Kit Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#022c22] text-white border border-emerald-700/60 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="text-emerald-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                <span>App de Campo · iPhone, iPad &amp; Android</span>
              </span>
              <span aria-hidden="true" className="text-emerald-600">·</span>
              <span className={`flex items-center gap-1 ${isOnline ? 'text-emerald-200' : 'text-amber-300'}`}>
                {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                <span>{isOnline ? 'Rede Disponível' : 'Modo Offline Ativo'}</span>
              </span>
            </div>

            <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Recolha de Dados de Campo &amp; Inquéritos Agrícolas
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              Levantamento georreferenciado de culturas, áreas, solos e desafios climáticos em <strong>Homoíne</strong> e nos <strong>14 distritos de Inhambane</strong>. Instale no iPhone, iPad ou Android para inquirir sem internet e sincronizar ao regressar à sede.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setSurveyModalOpen(true)}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-extrabold text-xs shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Novo Inquérito de Campo</span>
            </button>

            {!isInstalled && (
              <button
                type="button"
                onClick={() => setAndroidModalOpen(true)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold text-xs transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Smartphone className="w-4 h-4 text-emerald-300" />
                <span>Instalar no iOS / Android</span>
              </button>
            )}
          </div>
        </div>

        {/* Sync Bar */}
        <div className="mt-4 pt-3.5 border-t border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-100">
            {pendingCount > 0 ? (
              <>
                <Clock className="w-4 h-4 text-amber-300 shrink-0" />
                <span>
                  <strong className="text-amber-300">{pendingCount} inquérito(s)</strong> guardados localmente no dispositivo a aguardar sincronização.
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#3ddc84] shrink-0" />
                <span>Todos os {surveys.length} inquéritos locais estão sincronizados e prontos para exportação.</span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={handleSyncAll}
                disabled={syncing}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'A sincronizar...' : `Sincronizar (${pendingCount})`}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                FieldSurveyService.exportCSV(filteredSurveys);
                onShowToast?.('Relatório CSV descarregado para Excel / Kobo.', 'success');
              }}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#3ddc84]" />
              <span>Exportar CSV</span>
            </button>

            <button
              type="button"
              onClick={() => {
                FieldSurveyService.exportJSON(filteredSurveys);
                onShowToast?.('Ficheiro JSON descarregado com sucesso.', 'success');
              }}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <FileJson className="w-3.5 h-3.5 text-emerald-200" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">
            Inquéritos ({districtFilter})
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-display text-2xl font-black text-stone-950 dark:text-white">
              {stats.totalSurveys}
            </span>
            <ClipboardCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          </div>
          <span className="text-[11px] text-stone-600 dark:text-stone-400">
            Produtores familiares recenseados
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">
            Cobertura Provincial
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-display text-2xl font-black text-stone-950 dark:text-white">
              {stats.districtsCovered} / 14
            </span>
            <MapPin className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          </div>
          <span className="text-[11px] text-stone-600 dark:text-stone-400">
            Distritos de Inhambane ativos
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">
            Área Levantada
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-display text-2xl font-black text-stone-950 dark:text-white">
              {stats.totalArea} ha
            </span>
            <Sprout className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          </div>
          <span className="text-[11px] text-stone-600 dark:text-stone-400">
            ~{stats.totalYield.toLocaleString('pt-MZ')} kg estimados
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">
            Adoção AgroResiliente
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-display text-2xl font-black text-emerald-800 dark:text-emerald-400">
              {stats.resilienceRate}%
            </span>
            <BarChart3 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          </div>
          <span className="text-[11px] text-stone-600 dark:text-stone-400">
            Usam 2+ práticas de conservação
          </span>
        </div>
      </div>

      {/* District Filter Bar & Crop Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Crop Frequency Distribution */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-black text-stone-950 dark:text-white">
                Culturas Mais Registadas
              </h3>
              <p className="text-[11px] text-stone-500">
                Baseado nos inquéritos de {districtFilter === 'Todos' ? 'toda a província' : districtFilter}
              </p>
            </div>
            <Sprout className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          </div>

          {stats.topCrops.length === 0 ? (
            <p className="text-xs text-stone-500 py-6 text-center">
              Ainda sem inquéritos para este distrito.
            </p>
          ) : (
            <div className="space-y-2.5">
              {stats.topCrops.map(([cropName, count]) => {
                const pct = Math.round((count / Math.max(1, filteredSurveys.length)) * 100);
                return (
                  <div key={cropName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-stone-800 dark:text-stone-200">{cropName}</span>
                      <span className="text-emerald-800 dark:text-emerald-400">
                        {count} machambas ({pct}%)
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#065f46] to-[#10b981] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: District Filters + Survey Cards */}
        <div className="lg:col-span-7 space-y-4">
          {/* Quick Filter Row */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-black text-stone-500 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Distrito:</span>
              </span>
              {(['Todos', 'Homoíne', 'Panda', 'Maxixe', 'Massinga', 'Zavala'] as const).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDistrictFilter(d)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    districtFilter === d
                      ? 'bg-[#065f46] text-white shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <select
              value={districtFilter}
              onChange={e => setDistrictFilter(e.target.value as any)}
              aria-label="Selecionar qualquer distrito de Inhambane"
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            >
              <option value="Todos">Todos os 14 Distritos</option>
              {INHAMBANE_DISTRICTS_CATALOG.map(item => (
                <option key={item.district} value={item.district}>
                  {item.district}
                </option>
              ))}
            </select>
          </div>

          {/* Survey List */}
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {filteredSurveys.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border-2 border-dashed border-stone-300 dark:border-stone-700 text-center space-y-3">
                <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
                  Nenhum inquérito registado em {districtFilter} ainda.
                </p>
                <button
                  type="button"
                  onClick={() => setSurveyModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#065f46] text-white text-xs font-black inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Iniciar Levantamento em {districtFilter === 'Todos' ? 'Homoíne' : districtFilter}</span>
                </button>
              </div>
            ) : (
              filteredSurveys.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 hover:border-emerald-500/60 transition-all shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-black text-stone-950 dark:text-white">
                          {item.respondentName}
                        </h4>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300">
                          {item.district} · {item.locality}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            item.syncStatus === 'sincronizado'
                              ? 'bg-stone-100 dark:bg-stone-800 text-emerald-800 dark:text-emerald-400'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300'
                          }`}
                        >
                          {item.syncStatus === 'sincronizado' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Sincronizado</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>Offline (Android)</span>
                            </>
                          )}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                        {item.communityOrAssociation} · {item.totalAreaHa} ha · Solo {item.soilType} · {item.irrigationAccess}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                      title="Eliminar registo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Crops chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {item.primaryCrops.map(crop => (
                      <span
                        key={crop}
                        className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 text-[11px] font-bold"
                      >
                        {crop}
                      </span>
                    ))}
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 italic">
                      "{item.notes}"
                    </p>
                  )}

                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-[10px] text-stone-500">
                    <span>
                      Por: <strong>{item.interviewerName}</strong> ({item.devicePlatform})
                    </span>
                    <span>
                      {item.gpsCoords
                        ? `GPS: ${item.gpsCoords.lat}, ${item.gpsCoords.lng}`
                        : 'Sem GPS'}{' '}
                      · {new Date(item.createdAt).toLocaleDateString('pt-MZ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Field Survey Modal */}
      <FieldSurveyModal
        isOpen={surveyModalOpen}
        onClose={() => setSurveyModalOpen(false)}
        defaultDistrict={districtFilter === 'Todos' ? 'Homoíne' : districtFilter}
        onSurveySaved={rec => {
          reloadSurveys();
          onShowToast?.(
            rec.syncStatus === 'sincronizado'
              ? `Inquérito de ${rec.district} sincronizado com sucesso!`
              : `Inquérito guardado offline no dispositivo Android.`,
            'success'
          );
        }}
      />

      {/* Android Install Modal */}
      <AndroidDownloadModal
        isOpen={androidModalOpen}
        onClose={() => setAndroidModalOpen(false)}
      />
    </section>
  );
};
