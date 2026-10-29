import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Sprout, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Share2, 
  Copy, 
  Calendar,
  Compass,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { CropType, DistrictZone, UserType } from '../types/auth';
import { GeminiTipsService, GeminiAgriculturalTips } from '../services/geminiTips';

interface GeminiTipsSectionProps {
  initialCrop: CropType;
  zone: DistrictZone;
  farmerType: UserType;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

const AVAILABLE_CROPS: CropType[] = [
  'Mandioca',
  'Milho',
  'Amendoim',
  'Feijão nhemba',
  'Mapira',
  'Caju',
  'Hortícolas',
  'Batata-doce',
  'Gergelim',
  'Banana',
  'Coco',
  'Feijão boer'
];

export const GeminiTipsSection: React.FC<GeminiTipsSectionProps> = ({
  initialCrop,
  zone,
  farmerType,
  onShowToast
}) => {
  const [selectedCrop, setSelectedCrop] = useState<CropType>(initialCrop || 'Milho');
  const [tipsData, setTipsData] = useState<GeminiAgriculturalTips | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchTips = async (crop: CropType, force: boolean = false) => {
    if (force) setIsRefreshing(true);
    else setLoading(true);

    try {
      const data = await GeminiTipsService.getWeeklyTips(crop, zone, farmerType, force);
      setTipsData(data);
    } catch (e) {
      console.error('Error fetching Gemini tips:', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTips(selectedCrop);
  }, [selectedCrop, zone]);

  const handleCopyTips = () => {
    if (!tipsData) return;
    const text = `*AgroResiliente Inhambane · Dicas Semanais (${tipsData.crop})*\n\n${tipsData.weekTitle}\n\nFoco: ${tipsData.mainFocus}\n\n` +
      tipsData.tips.map((t, idx) => `${idx + 1}. [${t.category}] ${t.title}: ${t.description}`).join('\n\n') +
      `\n\nAção de Hoje: ${tipsData.recommendedAction}\n\nSabedoria Local: ${tipsData.localLanguageTip}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    onShowToast('Dicas copiadas para partilha via WhatsApp ou SMS!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const getUrgencyBadge = (urgency: string) => {
    if (urgency.toLowerCase().includes('alta')) {
      return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-900/40';
    }
    if (urgency.toLowerCase().includes('média') || urgency.toLowerCase().includes('media')) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900/40';
    }
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40';
  };

  return (
    <div className="space-y-6">
      {/* Header and Crop Switcher Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inteligência Agronómica Gemini</span>
            </span>
            <span className="text-stone-300 dark:text-stone-700">·</span>
            <span className="text-xs text-stone-500">{zone}</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
            Dicas Agrícolas Semanais Personalizadas
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Orientações técnicas personalizadas com base na cultura, solo e época do ano em Inhambane.
          </p>
        </div>

        {/* Crop Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value as CropType)}
              className="pl-8 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-800 dark:text-stone-200 outline-none focus:border-emerald-500 appearance-none cursor-pointer"
            >
              {AVAILABLE_CROPS.map((crop) => (
                <option key={crop} value={crop}>
                  {crop} {crop === initialCrop ? '(Sua cultura)' : ''}
                </option>
              ))}
            </select>
            <Sprout className="w-3.5 h-3.5 text-emerald-600 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          <button
            onClick={() => fetchTips(selectedCrop, true)}
            disabled={isRefreshing}
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            title="Atualizar dicas com Gemini"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Regerar Dicas</span>
          </button>

          <button
            onClick={handleCopyTips}
            className="p-2 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl text-stone-600 dark:text-stone-300 transition-colors"
            title="Copiar dicas para partilhar por WhatsApp ou SMS"
            aria-label="Copiar dicas"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {loading && !tipsData ? (
        <div className="p-16 text-center text-xs text-stone-400 space-y-3">
          <Sparkles className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
          <p>A consultar a inteligência agronómica Gemini para a cultura de {selectedCrop}...</p>
        </div>
      ) : tipsData ? (
        <>
          {/* Main Thematic Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900 via-stone-900 to-stone-950 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="max-w-2xl space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                    Cultura: {tipsData.crop} · {tipsData.seasonStage}
                  </span>
                  <span className="text-white/40">·</span>
                  <span className="text-xs text-stone-300">
                    Distrito de {tipsData.zone}
                  </span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                  {tipsData.weekTitle}
                </h3>

                <p className="text-sm text-stone-200 leading-relaxed pt-1">
                  <strong>Foco da Semana:</strong> {tipsData.mainFocus}
                </p>
              </div>

              {/* Engine badge */}
              <div className="shrink-0 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-right">
                <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-semibold justify-end">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Modelo Gemini 3.8 Flash</span>
                </div>
                <p className="text-[11px] text-stone-300 mt-1">
                  Validação Agrometeorológica MZ
                </p>
              </div>
            </div>

            {/* Inhambane Climate Context Strip */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-xs text-stone-300 leading-relaxed">
                <span className="text-emerald-300 font-semibold">Impacto Climático em Inhambane:</span> {tipsData.climateImpactNote}
              </p>
            </div>
          </div>

          {/* Dicas Práticas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tipsData.tips.map((tip, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      {tip.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getUrgencyBadge(tip.urgency)}`}>
                      Urgência {tip.urgency}
                    </span>
                  </div>

                  <h4 className="font-display text-base font-bold text-stone-900 dark:text-stone-100 mb-2">
                    {tip.title}
                  </h4>

                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    {tip.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span>Prática Recomendada</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Dual Card: Immediate Action & Local Wisdom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Ação Recomendada para Hoje */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <h4 className="font-display text-sm font-bold text-emerald-950 dark:text-emerald-200">
                  Ação Prioritária para Hoje na Machamba
                </h4>
              </div>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                {tipsData.recommendedAction}
              </p>
            </div>

            {/* Sabedoria Local Bitonga / Xitswa */}
            <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <h4 className="font-display text-sm font-bold text-stone-900 dark:text-stone-100">
                  Sabedoria Tradicional & Línguas Locais
                </h4>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 italic leading-relaxed">
                "{tipsData.localLanguageTip}"
              </p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
