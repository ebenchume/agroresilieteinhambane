import React, { useState } from 'react';
import { 
  ClipboardList, 
  Calculator, 
  Bug, 
  ArrowRight, 
  MapPin, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Radio, 
  CheckCircle2,
  FileText,
  Calendar
} from 'lucide-react';
import { MachambaVisitModal } from './MachambaVisitModal';
import { SeedCalculatorModal } from './SeedCalculatorModal';
import { PestReportModal } from './PestReportModal';
import { MobileService } from '../../services/mobileService';

interface ExtensionistModeProps {
  onOpenCropGallery?: () => void;
}

export const ExtensionistMode: React.FC<ExtensionistModeProps> = ({
  onOpenCropGallery
}) => {
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [pestReportOpen, setPestReportOpen] = useState(false);
  const [visitsCount, setVisitsCount] = useState(() => MobileService.getVisits().length);

  const refreshVisits = () => {
    setVisitsCount(MobileService.getVisits().length);
  };

  return (
    <div className="space-y-6">
      {/* Extensionist Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-900 to-stone-900 text-white border-2 border-sky-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-extrabold text-sky-300">
                Painel do Técnico Extensionista
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-800 text-sky-100 font-bold">
                SDAE · CITT Inhambane
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">
              Ferramentas de campo para assistência aos produtores familiares e vigilância agronómica.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold px-3 py-1 bg-sky-800/80 rounded-xl text-sky-200">
            {visitsCount} visitas arquivadas offline
          </span>
        </div>
      </div>

      {/* THREE MAIN EXTENSIONIST ACTION PANELS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        
        {/* CARD 1: Registar Visita à Machamba */}
        <button
          type="button"
          onClick={() => setVisitModalOpen(true)}
          className="group p-6 rounded-3xl border-3 border-emerald-500/80 bg-white dark:bg-stone-900 text-left transition-all transform active:scale-[0.98] shadow-md hover:shadow-xl hover:border-emerald-600 flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
                <ClipboardList className="w-8 h-8" />
              </div>

              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Caderno de Campo
              </span>
            </div>

            <h3 className="font-display text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight leading-snug">
              Registar Visita à Machamba
            </h3>

            <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
              Formulário rápido com <strong>captura automática de GPS</strong>, estado da cultura, pragas observadas e recomendações offline.
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <span>Abrir Formulário de Visita</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="text-[10px] text-stone-400">{visitsCount} Registos</span>
          </div>
        </button>

        {/* CARD 2: Calculadora de Sementes/Área */}
        <button
          type="button"
          onClick={() => setCalculatorOpen(true)}
          className="group p-6 rounded-3xl border-3 border-sky-500/80 bg-white dark:bg-stone-900 text-left transition-all transform active:scale-[0.98] shadow-md hover:shadow-xl hover:border-sky-600 flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-700 text-white flex items-center justify-center shadow-md">
                <Calculator className="w-8 h-8" />
              </div>

              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
                Agronomia Exata
              </span>
            </div>

            <h3 className="font-display text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight leading-snug">
              Calculadora de Sementes/Área
            </h3>

            <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
              Cálculo de sementes (kg ou estacas), compasso, população de plantas e colheita prevista para <strong>Milho, Mandioca, Amendoim e Caju</strong>.
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <span className="text-xs font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
              <span>Calcular Insumos por Hectare</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="text-[10px] text-stone-400">Por Canteiro ou Ha</span>
          </div>
        </button>

        {/* CARD 3: Relatório de Pragas na Zona */}
        <button
          type="button"
          onClick={() => setPestReportOpen(true)}
          className="group p-6 rounded-3xl border-3 border-amber-500/80 bg-white dark:bg-stone-900 text-left transition-all transform active:scale-[0.98] shadow-md hover:shadow-xl hover:border-amber-600 flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                <Bug className="w-8 h-8" />
              </div>

              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                Vigilância Fitossanitária
              </span>
            </div>

            <h3 className="font-display text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight leading-snug">
              Relatório de Pragas na Zona
            </h3>

            <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
              Quadro de alertas por distrito (Homoíne, Panda, Massinga, Zavala) com taxas de infestação e <strong>emissão de alertas por SMS</strong>.
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <span>Ver Mapa de Alertas</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="text-[10px] text-stone-400">5 Distritos Monitorizados</span>
          </div>
        </button>

      </div>

      {/* Extensionist Field Activity Stats */}
      <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Indicadores de Campo · Província de Inhambane</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white dark:bg-stone-800/70 rounded-xl border border-stone-200 dark:border-stone-700">
            <span className="text-[10px] font-semibold text-stone-500 uppercase block">Machambas Monitorizadas</span>
            <p className="text-base font-bold text-stone-900 dark:text-stone-100 mt-0.5">342 machambas</p>
          </div>

          <div className="p-3 bg-white dark:bg-stone-800/70 rounded-xl border border-stone-200 dark:border-stone-700">
            <span className="text-[10px] font-semibold text-stone-500 uppercase block">Área Coberta</span>
            <p className="text-base font-bold text-stone-900 dark:text-stone-100 mt-0.5">485 hectares</p>
          </div>

          <div className="p-3 bg-white dark:bg-stone-800/70 rounded-xl border border-stone-200 dark:border-stone-700">
            <span className="text-[10px] font-semibold text-stone-500 uppercase block">Alerta Ativo Mais Severo</span>
            <p className="text-base font-bold text-red-600 dark:text-red-400 mt-0.5">Lagarta (Panda 36%)</p>
          </div>

          <div className="p-3 bg-white dark:bg-stone-800/70 rounded-xl border border-stone-200 dark:border-stone-700">
            <span className="text-[10px] font-semibold text-stone-500 uppercase block">Adoção de Mulching</span>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">68% dos produtores</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <MachambaVisitModal
        isOpen={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
        onVisitSaved={refreshVisits}
      />

      <SeedCalculatorModal
        isOpen={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
      />

      <PestReportModal
        isOpen={pestReportOpen}
        onClose={() => setPestReportOpen(false)}
      />
    </div>
  );
};
