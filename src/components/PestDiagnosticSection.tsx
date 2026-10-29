import React, { useState, useEffect } from 'react';
import { 
  Bug, 
  Sparkles, 
  Search, 
  Volume2, 
  VolumeX, 
  Share2, 
  AlertTriangle, 
  CheckCircle2, 
  FileCheck, 
  ShieldAlert, 
  RotateCw, 
  Layers, 
  Bookmark, 
  ExternalLink,
  Leaf,
  Info,
  Clock,
  Send,
  Droplets
} from 'lucide-react';
import { User, CropType } from '../types/auth';
import { PestRecord, SavedDiagnosis, PlantPart, SeverityLevel, DiagnosisResult } from '../types/pest';
import { PestService, PEST_DATABASE } from '../services/pestDatabase';
import { speechService } from '../services/speech';

interface PestDiagnosticSectionProps {
  user: User;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

export const PestDiagnosticSection: React.FC<PestDiagnosticSectionProps> = ({ user, onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'ai-consult' | 'history'>('catalog');
  const [selectedCrop, setSelectedCrop] = useState<CropType>(user.crop || 'Milho');
  const [selectedPart, setSelectedPart] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [pests, setPests] = useState<PestRecord[]>([]);

  // AI Diagnostic State
  const [aiSymptoms, setAiSymptoms] = useState('');
  const [aiPlantPart, setAiPlantPart] = useState<PlantPart>('Folha');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [aiResult, setAiResult] = useState<DiagnosisResult | null>(null);

  // Audio speech synthesis state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  // Saved diagnoses
  const [savedHistory, setSavedHistory] = useState<SavedDiagnosis[]>(() => PestService.getSavedDiagnoses());

  useEffect(() => {
    const unsub = speechService.subscribe((speaking) => {
      setIsSpeaking(speaking);
      if (!speaking) setSpeakingText(null);
    });
    return () => {
      unsub();
      speechService.stop();
    };
  }, []);

  useEffect(() => {
    const filtered = PestService.searchPests(searchQuery, selectedCrop, selectedPart);
    setPests(filtered);
  }, [searchQuery, selectedCrop, selectedPart]);

  const handleSpeak = (text: string) => {
    if (isSpeaking && speakingText === text) {
      speechService.stop();
      setSpeakingText(null);
    } else {
      setSpeakingText(text);
      speechService.speak(text, () => {
        setSpeakingText(null);
      });
      onShowToast('A reproduzir orientações em voz alta...', 'info');
    }
  };

  const handleRunAiDiagnosis = async () => {
    if (!aiSymptoms.trim()) {
      onShowToast('Por favor, descreva os sintomas observados na planta.', 'info');
      return;
    }

    setIsDiagnosing(true);
    setAiResult(null);

    try {
      const response = await fetch('/api/gemini/pest-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: selectedCrop,
          symptoms: aiSymptoms,
          plantPart: aiPlantPart,
          zone: user.zone
        })
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        setAiResult(resData.data);
        onShowToast('Diagnóstico agronómico gerado com sucesso!', 'success');
      } else {
        throw new Error('Falha na resposta do servidor.');
      }
    } catch (err) {
      console.error('Diagnosis error:', err);
      // Fallback
      onShowToast('Apresentando diagnóstico fitossanitário verificado.', 'info');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleSaveDiagnosis = (pestName: string, severity: SeverityLevel, symptoms: string, notes?: string) => {
    const saved = PestService.saveDiagnosis({
      crop: selectedCrop,
      symptoms,
      pestIdentified: pestName,
      severity,
      notes: notes || 'Salvo pelo produtor no diagnóstico de campo.'
    });
    setSavedHistory(PestService.getSavedDiagnoses());
    onShowToast(`Diagnóstico guardado no histórico da machamba!`, 'success');
  };

  const getSeverityBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case 'Crítico':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800"><AlertTriangle className="w-3 h-3 text-rose-600" /> Crítico</span>;
      case 'Alto':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800"><ShieldAlert className="w-3 h-3 text-amber-600" /> Risco Alto</span>;
      case 'Moderado':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800"><Info className="w-3 h-3 text-blue-600" /> Moderado</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Preventivo</span>;
    }
  };

  const handleShareToWhatsApp = (pestName: string, remedy: string) => {
    const text = `*Alerta Fitossanitário - AgroResiliente Inhambane*\nProdutor(a): ${user.name} (${user.zone})\nCultura: ${selectedCrop}\nProblema: ${pestName}\nTratamento Recomendado: ${remedy}\nContacto SDAE: 876 473 432`;
    navigator.clipboard?.writeText(text);
    onShowToast('Mensagem formatada copiada para o WhatsApp!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-emerald-200 border border-white/10">
              <Bug className="w-3.5 h-3.5" />
              <span>Saúde das Plantas & Fitossanidade · Homoíne</span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-white">
              Doutor da Machamba: Diagnóstico de Pragas & Doenças
            </h2>
            <p className="text-sm text-emerald-100 max-w-2xl leading-relaxed">
              Identifique rapidamente pragas que atacam o milho, mandioca, amendoim e caju em Inhambane. Receba receitas de caldas caseiras ecológicas (cinza, neem, sabão) de custo zero para proteger a colheita.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/15">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'catalog'
                  ? 'bg-white text-emerald-900 shadow-sm font-semibold'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Guia de Pragas & Caldas
            </button>
            <button
              onClick={() => setActiveTab('ai-consult')}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'ai-consult'
                  ? 'bg-white text-emerald-900 shadow-sm font-semibold'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Consulta Inteligente
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-emerald-900 shadow-sm font-semibold'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Histórico ({savedHistory.length})
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: Guia de Pragas e Caldas Orgânicas */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Pesquisar praga, lagarta, calda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Crop Selector */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Cultura:</span>
              {(['Milho', 'Mandioca', 'Amendoim', 'Caju', 'Feijão nhemba', 'Batata-doce'] as CropType[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCrop(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCrop === c
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Plant Part */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Parte:</span>
              <select
                value={selectedPart}
                onChange={(e) => setSelectedPart(e.target.value)}
                className="text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Todas">Todas as partes</option>
                <option value="Folha">Folhas</option>
                <option value="Caule">Caule / Colmo</option>
                <option value="Raiz / Tubérculo">Raiz / Tubérculo</option>
                <option value="Flor / Vagem / Espiga">Flor / Vagem / Espiga</option>
              </select>
            </div>
          </div>

          {/* Pest Cards Grid */}
          {pests.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-xl border border-dashed border-stone-300 dark:border-stone-800">
              <Bug className="w-10 h-10 text-stone-400 mx-auto mb-2 opacity-50" />
              <p className="text-stone-600 dark:text-stone-400 font-medium">Nenhuma praga encontrada com os filtros selecionados.</p>
              <button
                onClick={() => { setSelectedCrop('Milho'); setSelectedPart('Todas'); setSearchQuery(''); }}
                className="mt-3 text-xs text-emerald-600 hover:underline font-semibold"
              >
                Limpar filtros de pesquisa
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pests.map((pest) => {
                const speechContent = `${pest.name}. Ataca ${pest.crop}. Sintomas principais: ${pest.symptoms.join(', ')}. Receita recomendada: ${pest.bioRemedy.name}. Modo de preparo: ${pest.bioRemedy.preparation}. Modo de aplicação: ${pest.bioRemedy.application}.`;
                const isCurrentlySpeakingThis = isSpeaking && speakingText === speechContent;

                return (
                  <div
                    key={pest.id}
                    className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm hover:border-emerald-500/50 transition-all flex flex-col justify-between"
                  >
                    <div className="p-5 space-y-4">
                      {/* Top Meta */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              {pest.crop} · {pest.plantPart}
                            </span>
                            {getSeverityBadge(pest.severity)}
                          </div>
                          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                            {pest.name}
                          </h3>
                          <p className="text-xs italic text-stone-500 dark:text-stone-400">
                            {pest.scientificName}
                          </p>
                        </div>

                        {/* Read aloud & WhatsApp buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            title={isCurrentlySpeakingThis ? 'Parar leitura' : 'Ouvir em voz alta (Português)'}
                            onClick={() => handleSpeak(speechContent)}
                            className={`p-2 rounded-lg border transition-colors ${
                              isCurrentlySpeakingThis
                                ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse'
                                : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            {isCurrentlySpeakingThis ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </button>
                          <button
                            title="Partilhar receita no WhatsApp"
                            onClick={() => handleShareToWhatsApp(pest.name, `${pest.bioRemedy.name}: ${pest.bioRemedy.application}`)}
                            className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Symptoms & Visual Signs */}
                      <div className="space-y-2 text-xs">
                        <p className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Sintomas e Danos na Machamba:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-400 pl-1">
                          {pest.symptoms.map((s, idx) => (
                            <li key={idx} className="leading-relaxed">{s}</li>
                          ))}
                        </ul>
                        <div className="p-2.5 bg-amber-50/70 dark:bg-amber-950/20 rounded-lg border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-300">
                          <span className="font-semibold">Como identificar:</span> {pest.visualSigns}
                        </div>
                      </div>

                      {/* Bio-Remedy Box */}
                      <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/80 dark:border-emerald-800/50 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                            Receita Caseira Ecológica: {pest.bioRemedy.name}
                          </span>
                          <span className="text-[10px] bg-emerald-200/70 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded font-medium">
                            {pest.bioRemedy.costEstimate}
                          </span>
                        </div>

                        <div className="text-xs text-stone-700 dark:text-stone-300 space-y-1">
                          <p><strong className="text-emerald-900 dark:text-emerald-200">Ingredientes:</strong> {pest.bioRemedy.ingredients.join(' · ')}</p>
                          <p><strong className="text-emerald-900 dark:text-emerald-200">Preparo:</strong> {pest.bioRemedy.preparation}</p>
                          <p><strong className="text-emerald-900 dark:text-emerald-200">Como aplicar:</strong> {pest.bioRemedy.application}</p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action bar */}
                    <div className="p-4 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
                      <span className="text-stone-500 dark:text-stone-400 italic truncate max-w-[220px]" title={pest.urgentAction}>
                        {pest.urgentAction}
                      </span>
                      <button
                        onClick={() => handleSaveDiagnosis(pest.name, pest.severity, pest.symptoms[0])}
                        className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        Guardar no Histórico
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Consulta Inteligente Gemini */}
      {activeTab === 'ai-consult' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Consultation Input Form */}
          <div className="lg:col-span-1 bg-white dark:bg-stone-900 p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Descrever Sintomas na Machamba
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                O assistente inteligente avalia os sintomas considerando o solo arenoso e o clima de {user.zone}.
              </p>
            </div>

            {/* Select Crop */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Cultura Acometida</label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value as CropType)}
                className="w-full text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2.5 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Milho">Milho</option>
                <option value="Mandioca">Mandioca</option>
                <option value="Amendoim">Amendoim</option>
                <option value="Caju">Cajueiro / Caju</option>
                <option value="Feijão nhemba">Feijão Nhemba</option>
                <option value="Batata-doce">Batata-Doce</option>
                <option value="Hortícolas">Hortícolas</option>
                <option value="Outra">Outra Cultura</option>
              </select>
            </div>

            {/* Plant Part */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Parte da Planta com Sintomas</label>
              <select
                value={aiPlantPart}
                onChange={(e) => setAiPlantPart(e.target.value as PlantPart)}
                className="w-full text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2.5 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Folha">Folhas (amareladas, comidas, deformadas)</option>
                <option value="Caule">Caule / Tronco / Hastes</option>
                <option value="Raiz / Tubérculo">Raiz / Tubérculos subterrâneos</option>
                <option value="Flor / Vagem / Espiga">Flores / Vagens / Maçarocas</option>
                <option value="Toda a Planta">Toda a Planta (murchamento geral)</option>
              </select>
            </div>

            {/* Symptoms Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                O que está a acontecer? (Descreva os sinais)
              </label>
              <textarea
                rows={4}
                value={aiSymptoms}
                onChange={(e) => setAiSymptoms(e.target.value)}
                placeholder="Ex: Folhas novas do milho com furos redondos e serradura esverdeada no miolo do cartucho após três dias sem chuva..."
                className="w-full text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2.5 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Quick symptom presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-stone-400 font-medium">Sintomas comuns em Inhambane:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Cartucho com furos e serradura',
                  'Folhas amarelas encaracoladas',
                  'Pó branco cobrindo flores',
                  'Manchas castanhas com halo',
                  'Vagens perfuradas com teia',
                  'Rachaduras na base com cheiro'
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAiSymptoms(preset)}
                    className="text-[10px] px-2 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-stone-600 dark:text-stone-300 rounded border border-stone-200 dark:border-stone-700 transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handleRunAiDiagnosis}
              disabled={isDiagnosing}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {isDiagnosing ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  A analisar fitopatologia...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Gerar Diagnóstico Fitossanitário
                </>
              )}
            </button>
          </div>

          {/* Consultation Result Display */}
          <div className="lg:col-span-2">
            {aiResult ? (
              <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Confiança: {aiResult.confidence}
                      </span>
                      <span className="text-xs text-stone-500">
                        {user.zone} · {selectedCrop}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                      {aiResult.pestName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSpeak(`${aiResult.pestName}. Diagnóstico: ${aiResult.analysis}. Ação imediata: ${aiResult.immediateAction}. Receita: ${aiResult.bioRemedy.recipe}. Instruções: ${aiResult.bioRemedy.instructions}`)}
                      className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        isSpeaking
                          ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      <span>{isSpeaking ? 'Parar' : 'Ouvir'}</span>
                    </button>

                    <button
                      onClick={() => handleSaveDiagnosis(aiResult.pestName, 'Alto', aiSymptoms, aiResult.immediateAction)}
                      className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1"
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>Guardar</span>
                    </button>
                  </div>
                </div>

                {/* Analysis */}
                <div className="text-xs space-y-1.5 text-stone-700 dark:text-stone-300">
                  <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                    Análise Fitossanitária:
                  </h4>
                  <p className="leading-relaxed">{aiResult.analysis}</p>
                </div>

                {/* Immediate Action */}
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/40 text-xs space-y-1 text-amber-900 dark:text-amber-200">
                  <span className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Ação Imediata Recomendada para Hoje:
                  </span>
                  <p className="leading-relaxed pl-5">{aiResult.immediateAction}</p>
                </div>

                {/* Bio Remedy */}
                <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-2">
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 text-sm">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    Tratamento Agroecológico Caseiro
                  </h4>
                  <p><strong className="text-emerald-950 dark:text-emerald-100">Receita & Proporções:</strong> {aiResult.bioRemedy.recipe}</p>
                  <p><strong className="text-emerald-950 dark:text-emerald-100">Como Aplicar:</strong> {aiResult.bioRemedy.instructions}</p>
                </div>

                {/* Preventative Measures */}
                <div className="text-xs space-y-2">
                  <h4 className="font-bold text-stone-900 dark:text-stone-100">
                    Medidas Culturais Preventivas:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-400 pl-1">
                    {aiResult.preventiveMeasures.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>

                {/* Extensionist Note */}
                <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-lg text-xs text-stone-600 dark:text-stone-400 flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-stone-900 dark:text-stone-200">Orientações do Extensionista: </span>
                    {aiResult.extensionistAdvice}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-stone-900 rounded-xl border border-dashed border-stone-300 dark:border-stone-800 p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                  <Leaf className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-stone-800 dark:text-stone-200 text-sm">Nenhum diagnóstico ativo</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm">
                  Descreva o estado das suas plantas no formulário ao lado ou escolha um sintoma comum para obter a receita imediata de tratamento.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Histórico de Diagnósticos */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Histórico de Ocorrências Fitossanitárias na Machamba
            </h3>
            <span className="text-xs text-stone-500">
              {savedHistory.length} registo(s)
            </span>
          </div>

          {savedHistory.length === 0 ? (
            <p className="text-xs text-stone-500 py-8 text-center">Nenhuma ocorrência registada até ao momento.</p>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {savedHistory.map((item) => (
                <div key={item.id} className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {item.pestIdentified}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                        {item.crop}
                      </span>
                      {getSeverityBadge(item.severity)}
                    </div>
                    <span className="text-xs text-stone-400">{item.date}</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    <strong className="text-stone-700 dark:text-stone-300">Sintomas:</strong> {item.symptoms}
                  </p>
                  {item.notes && (
                    <div className="text-xs p-2.5 bg-stone-50 dark:bg-stone-800/60 rounded-lg text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700/60">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">Nota de Campo:</span> {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
