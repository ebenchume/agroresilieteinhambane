import React, { useState } from 'react';
import { 
  Sprout, 
  Droplets, 
  Calendar, 
  MapPin, 
  Sparkles, 
  Info, 
  ArrowRight, 
  CheckCircle2, 
  Maximize2,
  X,
  Layers,
  Leaf,
  Sun,
  ShieldCheck,
  TrendingUp,
  Award
} from 'lucide-react';
import { INHAMBANE_CROPS, CropFigure } from '../assets/crops';
import { AriaModal } from './AriaModal';

interface CropFiguresGalleryProps {
  onSelectCrop?: (cropName: string) => void;
  className?: string;
}

type FilterType = 'all' | 'homoine' | 'tradicional' | 'rendimento' | 'curto';

export const CropFiguresGallery: React.FC<CropFiguresGalleryProps> = ({
  onSelectCrop,
  className = ''
}) => {
  const [selectedCrop, setSelectedCrop] = useState<CropFigure | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredCrops = INHAMBANE_CROPS.filter(crop => {
    if (activeFilter === 'homoine') {
      return crop.category === 'Sugerida para Clima de Homoíne' || crop.inhambaneDistricts.includes('Homoíne');
    }
    if (activeFilter === 'tradicional') {
      return crop.category === 'Tradicional de Inhambane';
    }
    if (activeFilter === 'rendimento') {
      return crop.category === 'Cultura de Rendimento' || crop.name.includes('Caju') || crop.name.includes('Gergelim');
    }
    if (activeFilter === 'curto') {
      return crop.cycleDays <= 100;
    }
    return true;
  });

  return (
    <section className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider mb-1 text-emerald-800 dark:text-emerald-400">
            <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Figuras & Fichas Agronómicas · Inhambane & Homoíne</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-950 dark:text-stone-50">
            Culturas da Região & Sugestões para Homoíne
          </h2>
          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 max-w-2xl mt-1 leading-relaxed">
            Fotografias reais das culturas tradicionais e opções agroecológicas com alta resiliência à seca, ideais para os solos arenosos e clima de Homoíne, Panda e litoral de Inhambane.
          </p>
        </div>

        {/* Filter buttons with High-Contrast outdoor pill style */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-stone-100 dark:bg-stone-800/90 rounded-2xl border border-stone-200 dark:border-stone-700 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all ${
              activeFilter === 'all'
                ? 'bg-emerald-900 text-white shadow-sm border border-emerald-950'
                : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
            }`}
          >
            Todas ({INHAMBANE_CROPS.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('homoine')}
            className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all flex items-center gap-1 ${
              activeFilter === 'homoine'
                ? 'bg-emerald-800 text-white shadow-sm border border-emerald-900'
                : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sugeridas p/ Homoíne</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('tradicional')}
            className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all ${
              activeFilter === 'tradicional'
                ? 'bg-emerald-800 text-white shadow-sm border border-emerald-900'
                : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
            }`}
          >
            Tradicionais
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('rendimento')}
            className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all flex items-center gap-1 ${
              activeFilter === 'rendimento'
                ? 'bg-amber-700 text-white shadow-sm border border-amber-800'
                : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
            <span>Rendimento / Mercado</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('curto')}
            className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all ${
              activeFilter === 'curto'
                ? 'bg-emerald-800 text-white shadow-sm border border-emerald-900'
                : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
            }`}
          >
            Ciclo Curto (&le;100d)
          </button>
        </div>
      </div>

      {/* Responsive Grid of Crop Figures */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredCrops.map((crop) => {
          const isHomoineSuggested = crop.category === 'Sugerida para Clima de Homoíne';
          const isCashCrop = crop.category === 'Cultura de Rendimento';

          return (
            <div
              key={crop.id}
              className="group rounded-3xl bg-white dark:bg-stone-900 border-2 border-stone-200/90 dark:border-stone-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-600 dark:hover:border-emerald-500 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Photographic Figure Container */}
              <div>
                <div className="relative aspect-4/3 overflow-hidden bg-stone-900">
                  <img
                    src={crop.image}
                    alt={`Figura da cultura de ${crop.name} em Inhambane`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/25 to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px]">
                    <span className="px-2.5 py-1 rounded-full bg-stone-950/90 backdrop-blur-md text-emerald-300 border border-emerald-500/50 font-black flex items-center gap-1 shadow-sm">
                      <Droplets className="w-3 h-3 text-emerald-400" />
                      <span>{crop.waterNeed}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedCrop(crop)}
                      className="w-7 h-7 rounded-full bg-white text-stone-950 flex items-center justify-center transition-transform hover:scale-110 shadow-md font-bold"
                      title="Ampliar figura e ver detalhes"
                      aria-label={`Ver detalhes completos de ${crop.name}`}
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Homoíne Special Tag */}
                  {isHomoineSuggested && (
                    <div className="absolute top-10 left-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-amber-400 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span>Sugerida p/ Homoíne</span>
                      </span>
                    </div>
                  )}

                  {isCashCrop && (
                    <div className="absolute top-10 left-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-400 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>Cultura Comercial</span>
                      </span>
                    </div>
                  )}

                  {/* Bottom Overlay Label */}
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-300 block font-bold">
                      {crop.scientificName}
                    </span>
                    <div className="flex items-baseline justify-between gap-1">
                      <h3 className="font-display text-lg font-black leading-tight text-white drop-shadow-sm">
                        {crop.name}
                      </h3>
                      <span className="text-[11px] text-amber-200 font-semibold italic shrink-0">
                        {crop.localNameXitswa}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <p className="text-xs text-stone-700 dark:text-stone-300 line-clamp-2 leading-relaxed">
                    {crop.description}
                  </p>

                  {/* Homoíne suitability highlight */}
                  {crop.homoineSuitability && (
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-[11px] text-emerald-950 dark:text-emerald-200 leading-tight">
                      <strong className="text-emerald-800 dark:text-emerald-300 font-bold block mb-0.5">
                        Em Homoíne:
                      </strong>
                      <span>{crop.homoineSuitability}</span>
                    </div>
                  )}

                  {/* Metrics */}
                  <div className="space-y-1.5 pt-1 border-t border-stone-200 dark:border-stone-800 text-xs">
                    <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                      <span className="flex items-center gap-1.5 text-[11px] font-medium">
                        <Calendar className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        <span>Ciclo de Colheita:</span>
                      </span>
                      <strong className="text-stone-950 dark:text-stone-100 font-black text-xs tabular-nums">
                        ~{crop.cycleDays} dias
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                      <span className="flex items-center gap-1.5 text-[11px] font-medium">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        <span>Zonas Chave:</span>
                      </span>
                      <span className="text-stone-900 dark:text-stone-200 font-bold truncate max-w-[130px] text-right text-[11px]">
                        {crop.inhambaneDistricts.slice(0, 2).join(', ')}...
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCrop(crop)}
                  className="flex-1 py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 text-xs font-black flex items-center justify-center gap-1.5 transition-colors border border-stone-300 dark:border-stone-700"
                >
                  <Info className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  <span>Ver Ficha Técnica</span>
                </button>

                {onSelectCrop && (
                  <button
                    type="button"
                    onClick={() => onSelectCrop(crop.name)}
                    className="py-2 px-3.5 rounded-xl bg-[#065f46] hover:bg-[#022c22] text-white text-xs font-black flex items-center justify-center transition-all shadow-sm"
                    title={`Selecionar cultura ${crop.name} para o plano agrícola`}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Accessible Detail Modal via react-aria */}
      <AriaModal
        isOpen={!!selectedCrop}
        onClose={() => setSelectedCrop(null)}
        title={selectedCrop ? `Ficha Técnica: ${selectedCrop.name}` : undefined}
        maxWidth="max-w-2xl"
      >
        {selectedCrop && (
          <div className="space-y-4">
            {/* Modal Image Banner */}
            <div className="relative rounded-2xl overflow-hidden aspect-16/9 bg-stone-950">
              <img
                src={selectedCrop.image}
                alt={`Fotografia agronómica de ${selectedCrop.name}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-300 font-bold">
                  {selectedCrop.scientificName} · Nome em Xitswa/Bitonga: {selectedCrop.localNameXitswa}
                </span>
                <h3 className="font-display text-2xl font-black mt-0.5">
                  {selectedCrop.name}
                </h3>
              </div>
            </div>

            {/* Homoíne Agronomic Recommendation Box */}
            {selectedCrop.homoineSuitability && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-300 dark:border-amber-700 text-xs space-y-1">
                <span className="font-black text-amber-950 dark:text-amber-200 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Porquê plantar no Clima de Homoíne?
                </span>
                <p className="text-amber-900 dark:text-amber-100 font-medium leading-relaxed">
                  {selectedCrop.homoineSuitability}
                </p>
              </div>
            )}

            {/* Description & Key Benefit */}
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-sans">
                {selectedCrop.description}
              </p>
              <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs">
                <strong className="text-stone-900 dark:text-stone-100 font-bold">Vantagem Principal: </strong>
                <span className="text-stone-700 dark:text-stone-300">{selectedCrop.keyBenefit}</span>
              </div>
            </div>

            {/* Technical Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs">
              <div>
                <dt className="text-stone-500 uppercase text-[10px] font-black">Época de Sementeira</dt>
                <dd className="font-bold text-stone-900 dark:text-stone-100 mt-0.5">{selectedCrop.plantingSeason}</dd>
              </div>

              <div>
                <dt className="text-stone-500 uppercase text-[10px] font-black">Duração do Ciclo</dt>
                <dd className="font-bold text-stone-900 dark:text-stone-100 mt-0.5">{selectedCrop.cycleDays} dias até à colheita</dd>
              </div>

              <div>
                <dt className="text-stone-500 uppercase text-[10px] font-black">Solos Recomendados</dt>
                <dd className="font-bold text-stone-900 dark:text-stone-100 mt-0.5">{selectedCrop.idealSoil}</dd>
              </div>

              <div>
                <dt className="text-stone-500 uppercase text-[10px] font-black">Tolerância Hídrica / Seca</dt>
                <dd className="font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">{selectedCrop.waterNeed}</dd>
              </div>
            </div>

            {/* Varieties */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                Variedades Recomendadas pelo IIAM, CITT e SDAE:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedCrop.recommendedVarieties.map((v) => (
                  <span
                    key={v}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 border border-emerald-300 dark:border-emerald-700 text-stone-900 dark:text-stone-100 text-xs font-bold shadow-xs"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>

            {/* Close button at bottom */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedCrop(null)}
                className="px-5 py-2.5 rounded-xl bg-[#065f46] hover:bg-[#022c22] text-white text-xs font-black transition-colors shadow-sm"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        )}
      </AriaModal>
    </section>
  );
};
