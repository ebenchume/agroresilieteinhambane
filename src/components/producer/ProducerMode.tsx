import React, { useState } from 'react';
import { 
  Camera, 
  MessageSquare, 
  Sun, 
  Droplets, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Volume2, 
  Eye, 
  CloudSun,
  Flame,
  CheckCircle2,
  Sprout
} from 'lucide-react';
import { PlantDiagnosisModal } from './PlantDiagnosisModal';
import { AskAgronomistModal } from './AskAgronomistModal';
import { DroughtTipsModal } from './DroughtTipsModal';

interface ProducerModeProps {
  sunlightMode: boolean;
  onToggleSunlightMode: () => void;
  onOpenCropGallery?: () => void;
}

export const ProducerMode: React.FC<ProducerModeProps> = ({
  sunlightMode,
  onToggleSunlightMode,
  onOpenCropGallery
}) => {
  const [diagnosisOpen, setDiagnosisOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [droughtOpen, setDroughtOpen] = useState(false);

  return (
    <div className={`space-y-6 ${sunlightMode ? 'font-medium' : ''}`}>
      {/* Sunlight High-Contrast Banner Toggle */}
      <div className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm ${
        sunlightMode
          ? 'bg-yellow-400 text-black border-yellow-500 font-bold'
          : 'bg-emerald-800 text-white border-emerald-700'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            sunlightMode ? 'bg-black text-yellow-400' : 'bg-emerald-900 text-white'
          }`}>
            <Sun className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-extrabold">
                {sunlightMode ? 'Modo Leitura ao Sol Ativado' : 'Painel do Produtor Familiar'}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                sunlightMode ? 'bg-black text-white' : 'bg-emerald-700 text-emerald-100'
              }`}>
                Inhambane
              </span>
            </div>
            <p className="text-xs opacity-90 mt-0.5">
              {sunlightMode 
                ? 'Cores de alto contraste e fontes ampliadas para visualização sob luz solar direta na machamba.'
                : 'Acesso rápido com botões grandes para o trabalho diário no campo.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleSunlightMode}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all shadow-xs flex items-center gap-2 shrink-0 ${
            sunlightMode
              ? 'bg-black text-yellow-400 hover:bg-stone-900 border border-black'
              : 'bg-white text-emerald-900 hover:bg-emerald-50'
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>{sunlightMode ? 'Desativar Modo Sol' : 'Ativar Modo Leitura ao Sol'}</span>
        </button>
      </div>

      {/* THREE HUGE ACTION BUTTONS FOR THE PRODUCER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        
        {/* BUTTON 1: Diagnosticar Planta por Foto */}
        <button
          type="button"
          onClick={() => setDiagnosisOpen(true)}
          className={`group p-6 rounded-3xl border-3 text-left transition-all transform active:scale-[0.98] shadow-md flex flex-col justify-between min-h-[220px] ${
            sunlightMode
              ? 'bg-stone-950 border-yellow-400 text-white hover:bg-black focus:ring-4 focus:ring-yellow-400'
              : 'bg-white dark:bg-stone-900 border-emerald-500/80 hover:border-emerald-600 dark:border-emerald-700 hover:shadow-xl'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${
                sunlightMode
                  ? 'bg-yellow-400 text-black font-black'
                  : 'bg-emerald-600 text-white'
              }`}>
                <Camera className="w-8 h-8" />
              </div>

              <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full ${
                sunlightMode
                  ? 'bg-yellow-400 text-black font-black'
                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
              }`}>
                Gemini IA
              </span>
            </div>

            <h3 className={`font-display text-xl sm:text-2xl font-black tracking-tight leading-snug ${
              sunlightMode ? 'text-yellow-400' : 'text-stone-900 dark:text-stone-100'
            }`}>
              Diagnosticar Planta por Foto
            </h3>

            <p className={`text-xs mt-2 leading-relaxed ${
              sunlightMode ? 'text-stone-200 font-semibold' : 'text-stone-600 dark:text-stone-400'
            }`}>
              Tire uma foto na machamba de <strong>Milho, Mandioca, Amendoim ou Caju</strong> para detetar pragas, doenças ou falta de água.
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <span className={`text-xs font-bold flex items-center gap-1.5 ${
              sunlightMode ? 'text-yellow-300 font-black' : 'text-emerald-700 dark:text-emerald-400'
            }`}>
              <span>Tirar ou Carregar Foto</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="text-[10px] text-stone-400">Áudio em Português</span>
          </div>
        </button>

        {/* BUTTON 2: Perguntar ao Agrónomo */}
        <button
          type="button"
          onClick={() => setAskOpen(true)}
          className={`group p-6 rounded-3xl border-3 text-left transition-all transform active:scale-[0.98] shadow-md flex flex-col justify-between min-h-[220px] ${
            sunlightMode
              ? 'bg-stone-950 border-yellow-400 text-white hover:bg-black focus:ring-4 focus:ring-yellow-400'
              : 'bg-white dark:bg-stone-900 border-sky-500/80 hover:border-sky-600 dark:border-sky-700 hover:shadow-xl'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${
                sunlightMode
                  ? 'bg-yellow-400 text-black font-black'
                  : 'bg-sky-600 text-white'
              }`}>
                <MessageSquare className="w-8 h-8" />
              </div>

              <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full ${
                sunlightMode
                  ? 'bg-yellow-400 text-black font-black'
                  : 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300'
              }`}>
                Voz ou Texto
              </span>
            </div>

            <h3 className={`font-display text-xl sm:text-2xl font-black tracking-tight leading-snug ${
              sunlightMode ? 'text-yellow-400' : 'text-stone-900 dark:text-stone-100'
            }`}>
              Perguntar ao Agrónomo
            </h3>

            <p className={`text-xs mt-2 leading-relaxed ${
              sunlightMode ? 'text-stone-200 font-semibold' : 'text-stone-600 dark:text-stone-400'
            }`}>
              Tire qualquer dúvida sobre sementes, remédios de cinza, adubos, épocas de plantio e problemas na machamba.
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <span className={`text-xs font-bold flex items-center gap-1.5 ${
              sunlightMode ? 'text-yellow-300 font-black' : 'text-sky-700 dark:text-sky-400'
            }`}>
              <span>Fazer Pergunta Agora</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="text-[10px] text-stone-400">Resposta Imediata</span>
          </div>
        </button>

        {/* BUTTON 3: Dicas para Seca */}
        <button
          type="button"
          onClick={() => setDroughtOpen(true)}
          className={`group p-6 rounded-3xl border-3 text-left transition-all transform active:scale-[0.98] shadow-md flex flex-col justify-between min-h-[220px] ${
            sunlightMode
              ? 'bg-stone-950 border-yellow-400 text-white hover:bg-black focus:ring-4 focus:ring-yellow-400'
              : 'bg-white dark:bg-stone-900 border-amber-500/80 hover:border-amber-600 dark:border-amber-700 hover:shadow-xl'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${
                sunlightMode
                  ? 'bg-yellow-400 text-black font-black'
                  : 'bg-amber-600 text-white'
              }`}>
                <Sun className="w-8 h-8" />
              </div>

              <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full ${
                sunlightMode
                  ? 'bg-yellow-400 text-black font-black'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
              }`}>
                Resiliência
              </span>
            </div>

            <h3 className={`font-display text-xl sm:text-2xl font-black tracking-tight leading-snug ${
              sunlightMode ? 'text-yellow-400' : 'text-stone-900 dark:text-stone-100'
            }`}>
              Dicas para Seca
            </h3>

            <p className={`text-xs mt-2 leading-relaxed ${
              sunlightMode ? 'text-stone-200 font-semibold' : 'text-stone-600 dark:text-stone-400'
            }`}>
              Técnicas de <strong>mulching</strong>, covas de retenção de orvalho, consórcios e variedades resistentes para Inhambane.
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <span className={`text-xs font-bold flex items-center gap-1.5 ${
              sunlightMode ? 'text-yellow-300 font-black' : 'text-amber-700 dark:text-amber-400'
            }`}>
              <span>Ver Técnicas de Água</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="text-[10px] text-stone-400">Sem Custos</span>
          </div>
        </button>

      </div>

      {/* Field status ticker */}
      <div className={`p-4 rounded-2xl border ${
        sunlightMode
          ? 'bg-stone-950 border-stone-800 text-stone-100'
          : 'bg-stone-100 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <span className="font-bold text-stone-900 dark:text-stone-100">Homoíne & Panda Hoje:</span>
              <span className="text-stone-600 dark:text-stone-400 ml-1">29°C · Céu limpo com sol forte · Perda de humidade alta (4.2 mm/dia).</span>
            </div>
          </div>

          {onOpenCropGallery && (
            <button
              type="button"
              onClick={onOpenCropGallery}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
            >
              <Sprout className="w-4 h-4" />
              <span>Ver Figuras e Perfis das Culturas</span>
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <PlantDiagnosisModal
        isOpen={diagnosisOpen}
        onClose={() => setDiagnosisOpen(false)}
        sunlightMode={sunlightMode}
      />

      <AskAgronomistModal
        isOpen={askOpen}
        onClose={() => setAskOpen(false)}
        sunlightMode={sunlightMode}
      />

      <DroughtTipsModal
        isOpen={droughtOpen}
        onClose={() => setDroughtOpen(false)}
        sunlightMode={sunlightMode}
      />
    </div>
  );
};
