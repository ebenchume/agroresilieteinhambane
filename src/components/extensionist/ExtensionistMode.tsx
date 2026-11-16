import React, { useState } from 'react';
import { 
  ClipboardList, 
  Calculator, 
  Bug, 
  ArrowRight, 
  TrendingUp,
  ClipboardCheck,
  Smartphone
} from 'lucide-react';
import { MachambaVisitModal } from './MachambaVisitModal';
import { SeedCalculatorModal } from './SeedCalculatorModal';
import { PestReportModal } from './PestReportModal';
import { FieldSurveyModal } from '../field/FieldSurveyModal';
import { MobileService } from '../../services/mobileService';
import { FieldSurveyService } from '../../services/fieldSurveyService';

interface ExtensionistModeProps {
  onOpenCropGallery?: () => void;
  onOpenFieldSurveys?: () => void;
}

export const ExtensionistMode: React.FC<ExtensionistModeProps> = ({
  onOpenFieldSurveys
}) => {
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [pestReportOpen, setPestReportOpen] = useState(false);
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [visitsCount, setVisitsCount] = useState(() => MobileService.getVisits().length);
  const [surveysCount, setSurveysCount] = useState(() => FieldSurveyService.getSurveys().length);

  const refreshVisits = () => {
    setVisitsCount(MobileService.getVisits().length);
  };

  const refreshSurveys = () => {
    setSurveysCount(FieldSurveyService.getSurveys().length);
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
              Ferramentas de campo offline para recolha de inquéritos agrícolas, visitas e vigilância fitossanitária.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-xs font-semibold px-3 py-1 bg-sky-800/80 rounded-xl text-sky-200">
            {visitsCount} visitas · {surveysCount} inquéritos
          </span>
        </div>
      </div>

      {/* FOUR MAIN EXTENSIONIST ACTION PANELS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* CARD 1: Recolha de Dados & Inquéritos de Campo */}
        <button
          type="button"
          onClick={() => (onOpenFieldSurveys ? onOpenFieldSurveys() : setSurveyModalOpen(true))}
          className="group p-5 rounded-3xl border-2 border-emerald-500/70 bg-[#022c22] text-white text-left transition-all active:scale-[0.985] shadow-sm hover:shadow-lg flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-stone-950 flex items-center justify-center shadow-sm">
                <ClipboardCheck className="w-6 h-6" />
              </div>

              <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5" />
                <span>iOS &amp; Android Offline</span>
              </span>
            </div>

            <h3 className="font-display text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
              Inquéritos & Recolha de Campo
            </h3>

            <p className="text-xs text-emerald-100/90 mt-2 leading-relaxed">
              Levantamento de culturas, áreas e clima nos <strong>14 distritos de Inhambane</strong> (Homoíne, Panda, Massinga...) com GPS offline.
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-emerald-500/30 flex items-center justify-between">
            <span className="text-xs font-black text-[#3ddc84] flex items-center gap-1.5">
              <span>Abrir Painel / Inquirir</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="text-[10px] text-emerald-200">{surveysCount} Inquéritos</span>
          </div>
        </button>

        {/* CARD 2: Registar Visita à Machamba */}
        <button
          type="button"
          onClick={() => setVisitModalOpen(true)}
          className="group p-5 rounded-3xl border-2 border-emerald-500/80 bg-white dark:bg-stone-900 text-left transition-all transform active:scale-[0.98] shadow-md hover:shadow-xl hover:border-emerald-600 flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-13 h-13 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
                <ClipboardList className="w-7 h-7" />
              </div>

              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Caderno de Campo
              </span>
            </div>

            <h3 className="font-display text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 tracking-tight leading-snug">
              Registar Visita à Machamba
            </h3>

            <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
              Formulário rápido com <strong>captura automática de GPS</strong>, estado da cultura, pragas observadas e recomendações offline.
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <span>Nova Visita</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="text-[10px] text-stone-400">{visitsCount} Registos</span>
          </div>
        </button>

        {/* CARD 3: Calculadora de Sementes/Área */}
        <button
          type="button"
          onClick={() => setCalculatorOpen(true)}
          className="group p-5 rounded-3xl border-2 border-sky-500/80 bg-white dark:bg-stone-900 text-left transition-all transform active:scale-[0.98] shadow-md hover:shadow-xl hover:border-sky-600 flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-13 h-13 rounded-2xl bg-sky-700 text-white flex items-center justify-center shadow-md">
                <Calculator className="w-7 h-7" />
              </div>

              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
                Agronomia Exata
              </span>
            </div>

            <h3 className="font-display text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 tracking-tight leading-snug">
              Calculadora de Sementes/Área
            </h3>

            <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
              Cálculo de sementes (kg ou estacas), compasso, população de plantas e colheita prevista para <strong>Milho, Mandioca, Amendoim e Caju</strong>.
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <span className="text-xs font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
              <span>Calcular Insumos</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="text-[10px] text-stone-400">Canteiro / Ha</span>
          </div>
        </button>

        {/* CARD 4: Relatório de Pragas na Zona */}
        <button
          type="button"
          onClick={() => setPestReportOpen(true)}
          className="group p-5 rounded-3xl border-2 border-amber-500/80 bg-white dark:bg-stone-900 text-left transition-all transform active:scale-[0.98] shadow-md hover:shadow-xl hover:border-amber-600 flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-13 h-13 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                <Bug className="w-7 h-7" />
              </div>

              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                Vigilância
              </span>
            </div>

            <h3 className="font-display text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 tracking-tight leading-snug">
              Relatório de Pragas na Zona
            </h3>

            <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
              Quadro de alertas por distrito (Homoíne, Panda, Massinga, Zavala) com taxas de infestação e <strong>alertas SMS</strong>.
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <span>Ver Alertas</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="text-[10px] text-stone-400">5 Distritos</span>
          </div>
        </button>

      </div>

      {/* Extensionist Field Activity Stats */}
      <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Indicadores de Campo · Província de Inhambane</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs tabular-nums">
          <div className="p-3 bg-white dark:bg-stone-800/70 rounded-xl border border-stone-200 dark:border-stone-700">
            <span className="text-[10px] font-semibold text-stone-500 uppercase block">Machambas Monitorizadas</span>
            <p className="text-base font-bold text-stone-900 dark:text-stone-100 mt-0.5">342 machambas</p>
          </div>

          <div className="p-3 bg-white dark:bg-stone-800/70 rounded-xl border border-stone-200 dark:border-stone-700">
            <span className="text-[10px] font-semibold text-stone-500 uppercase block">Inquéritos Recolhidos</span>
            <p className="text-base font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{surveysCount} inquéritos</p>
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
      <FieldSurveyModal
        isOpen={surveyModalOpen}
        onClose={() => setSurveyModalOpen(false)}
        onSurveySaved={refreshSurveys}
      />

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
