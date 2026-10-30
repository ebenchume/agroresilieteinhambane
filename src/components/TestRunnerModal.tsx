import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCw, 
  X, 
  ShieldCheck, 
  Sparkles,
  Layers
} from 'lucide-react';
import { TestResult } from '../types/auth';
import { AutomatedTestSuite } from '../services/testSuite';

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const executeTests = async () => {
    setIsRunning(true);
    setResults([]);
    try {
      const finalResults = await AutomatedTestSuite.runAllTests((currentProgress) => {
        setResults([...currentProgress]);
      });
      setResults(finalResults);
    } catch (e) {
      console.error('Test execution error:', e);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      executeTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const passedCount = results.filter(r => r.status === 'passed').length;
  const failedCount = results.filter(r => r.status === 'failed').length;
  const totalAssertions = results.reduce((acc, r) => acc + r.assertions, 0);
  const totalDuration = results.reduce((acc, r) => acc + r.durationMs, 0);

  const filteredResults = activeFilter === 'all' 
    ? results 
    : results.filter(r => r.category.toLowerCase() === activeFilter.toLowerCase());

  const progressPercent = results.length > 0 ? Math.round((results.length / 9) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 max-h-[90vh] flex flex-col relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>Ciclo de Testes Automatizados</span>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  CI/CD Integrado
                </span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Verificação contínua de segurança, biometria, 2FA, persistência offline e geração de PDF.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top KPI Metrics Strip */}
        <div className="grid grid-cols-4 gap-2.5 py-4 border-b border-stone-100 dark:border-stone-800">
          <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 text-center">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">Sucesso</span>
            <span className="font-display text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {passedCount}/{results.length}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 text-center">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">Falhas</span>
            <span className={`font-display text-lg font-bold tabular-nums ${failedCount > 0 ? 'text-red-600' : 'text-stone-400'}`}>
              {failedCount}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 text-center">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">Asserções</span>
            <span className="font-display text-lg font-bold text-stone-800 dark:text-stone-200 tabular-nums">
              {totalAssertions}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 text-center">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">Duração</span>
            <span className="font-display text-lg font-bold text-stone-800 dark:text-stone-200 tabular-nums">
              {totalDuration}ms
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-3 pb-1">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5 font-medium">
            <span>Progresso da Execução</span>
            <span className="tabular-nums font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
            <div 
              className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 py-3 overflow-x-auto text-xs no-scrollbar">
          {['all', 'Acessibilidade', 'Segurança', 'Clima', 'Agronomia', 'Biometria', '2FA', 'Offline', 'Social', 'Relatórios'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeFilter === cat 
                  ? 'bg-emerald-700 text-white dark:bg-emerald-600' 
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              {cat === 'all' ? 'Todos os Testes' : cat}
            </button>
          ))}
        </div>

        {/* Tests List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
          {filteredResults.map(test => (
            <div
              key={test.id}
              className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-900 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  {test.status === 'passed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : test.status === 'failed' ? (
                    <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-4 h-4 text-stone-400 animate-spin shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                        {test.title}
                      </span>
                      <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500">
                        · {test.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                      {test.message}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono font-medium text-stone-500 dark:text-stone-400 tabular-nums block">
                    {test.durationMs}ms
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                    {test.assertions} asserções
                  </span>
                </div>
              </div>
            </div>
          ))}

          {isRunning && results.length < 9 && (
            <div className="p-3 text-center text-xs text-stone-400 animate-pulse">
              A executar testes de segurança em sandbox...
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="text-xs text-stone-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Compatibilidade total com navegadores modernos (Chrome, Firefox, Safari, Edge)</span>
          </div>

          <button
            onClick={executeTests}
            disabled={isRunning}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>Executar Novamente</span>
          </button>
        </div>
      </div>
    </div>
  );
};
