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
  Leaf
} from 'lucide-react';
import { INHAMBANE_CROPS, CropFigure } from '../assets/crops';
import { AriaModal } from './AriaModal';

interface CropFiguresGalleryProps {
  onSelectCrop?: (cropName: string) => void;
  className?: string;
}

export const CropFiguresGallery: React.FC<CropFiguresGalleryProps> = ({
  onSelectCrop,
  className = ''
}) => {
  const [selectedCrop, setSelectedCrop] = useState<CropFigure | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'resiliente' | 'curto'>('all');

  const filteredCrops = INHAMBANE_CROPS.filter(crop => {
    if (activeFilter === 'resiliente') {
      return crop.waterNeed.includes('Resiliente');
    }
    if (activeFilter === 'curto') {
      return crop.cycleDays <= 120;
    }
    return true;
  });

  return (
    <section className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Sprout className="w-4 h-4" />
            <span>Figuras & Fichas Agronómicas · Inhambane</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
            Culturas Agrícolas Estratégicas
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 max-w-2xl mt-1">
            Fotografias reais das principais culturas alimentares e de rendimento cultivadas pelos pequenos produtores da província de Inhambane, com especificações agrotécnicas do SDAE e CITT.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeFilter === 'all'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            Todas ({INHAMBANE_CROPS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('resiliente')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeFilter === 'resiliente'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            Alta Resiliência à Seca
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('curto')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeFilter === 'curto'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            Ciclo Curto (&le;120d)
          </button>
        </div>
      </div>

      {/* Grid of Crop Figures */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCrops.map((crop) => (
          <div
            key={crop.id}
            className="group rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-500/50 dark:hover:border-emerald-600/50 transition-all duration-300 flex flex-col"
          >
            {/* Photographic Figure Container */}
            <div className="relative aspect-4/3 overflow-hidden bg-stone-100 dark:bg-stone-800">
              <img
                src={crop.image}
                alt={`Figura da cultura de ${crop.name} em Inhambane`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/20" />

              {/* Water Need & Cycle Badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px]">
                <span className="px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-emerald-400" />
                  <span>{crop.waterNeed}</span>
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedCrop(crop)}
                  className="w-7 h-7 rounded-full bg-white/80 hover:bg-white text-stone-800 flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                  title="Ampliar figura e ver detalhes"
                  aria-label={`Ver detalhes completos de ${crop.name}`}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bottom Overlay Label */}
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-300 block">
                  {crop.scientificName}
                </span>
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-xl font-bold leading-tight">
                    {crop.name}
                  </h3>
                  <span className="text-xs text-stone-200 italic">
                    {crop.localNameXitswa}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-3 leading-relaxed">
                {crop.description}
              </p>

              {/* Metrics */}
              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Ciclo Vegetativo:</span>
                  </span>
                  <strong className="text-stone-900 dark:text-stone-100 font-semibold">
                    ~{crop.cycleDays} dias
                  </strong>
                </div>

                <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Distritos Chave:</span>
                  </span>
                  <span className="text-stone-800 dark:text-stone-200 font-medium truncate max-w-[130px] text-right">
                    {crop.inhambaneDistricts.slice(0, 2).join(', ')}...
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCrop(crop)}
                  className="flex-1 py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Info className="w-3.5 h-3.5 text-stone-500" />
                  <span>Ficha Técnica</span>
                </button>

                {onSelectCrop && (
                  <button
                    type="button"
                    onClick={() => onSelectCrop(crop.name)}
                    className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center transition-colors shadow-xs"
                    title={`Selecionar cultura ${crop.name} para o plano`}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Accessible Detail Modal via react-aria */}
      <AriaModal
        isOpen={!!selectedCrop}
        onClose={() => setSelectedCrop(null)}
        title={selectedCrop ? `Figura e Ficha Técnica: ${selectedCrop.name}` : undefined}
        maxWidth="max-w-2xl"
      >
        {selectedCrop && (
          <div className="space-y-5">
            {/* Modal Image Banner */}
            <div className="relative rounded-2xl overflow-hidden aspect-16/9 bg-stone-950">
              <img
                src={selectedCrop.image}
                alt={`Figura botânica e agrícola de ${selectedCrop.name}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-300">
                  {selectedCrop.scientificName} · Nome Local: {selectedCrop.localNameXitswa}
                </span>
                <h3 className="font-display text-2xl font-bold mt-0.5">
                  {selectedCrop.name}
                </h3>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
              {selectedCrop.description}
            </p>

            {/* Technical Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 text-xs">
              <div>
                <dt className="text-stone-400 uppercase text-[10px] font-bold">Época de Sementeira</dt>
                <dd className="font-semibold text-stone-800 dark:text-stone-200 mt-0.5">{selectedCrop.plantingSeason}</dd>
              </div>

              <div>
                <dt className="text-stone-400 uppercase text-[10px] font-bold">Duração Média do Ciclo</dt>
                <dd className="font-semibold text-stone-800 dark:text-stone-200 mt-0.5">{selectedCrop.cycleDays} dias até colheita</dd>
              </div>

              <div>
                <dt className="text-stone-400 uppercase text-[10px] font-bold">Solo Recomendado em Inhambane</dt>
                <dd className="font-semibold text-stone-800 dark:text-stone-200 mt-0.5">{selectedCrop.idealSoil}</dd>
              </div>

              <div>
                <dt className="text-stone-400 uppercase text-[10px] font-bold">Necessidade Hídrica</dt>
                <dd className="font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">{selectedCrop.waterNeed}</dd>
              </div>
            </div>

            {/* Varieties */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Variedades Recomendadas pelo IIAM & CITT:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedCrop.recommendedVarieties.map((v) => (
                  <span
                    key={v}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 border border-emerald-200 dark:border-emerald-700 text-stone-800 dark:text-stone-200 text-xs font-semibold"
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
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors"
              >
                Concluir Leitura
              </button>
            </div>
          </div>
        )}
      </AriaModal>
    </section>
  );
};
