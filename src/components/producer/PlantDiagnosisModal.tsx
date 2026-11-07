import React, { useState, useRef, useEffect } from 'react';
import { AriaModal } from '../AriaModal';
import { MobileService } from '../../services/mobileService';
import { PhotoDiagnosisResult } from '../../types/mobileApp';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCw, 
  Image as ImageIcon,
  Flame,
  Droplets,
  HelpCircle,
  X
} from 'lucide-react';

import milhoSample from '../../assets/images/crop_milho_1794030985517.jpg';
import mandiocaSample from '../../assets/images/crop_mandioca_1794030998682.jpg';
import amendoimSample from '../../assets/images/crop_amendoim_1794031011147.jpg';
import cajuSample from '../../assets/images/crop_caju_1794031024216.jpg';

interface PlantDiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  sunlightMode?: boolean;
}

export const PlantDiagnosisModal: React.FC<PlantDiagnosisModalProps> = ({
  isOpen,
  onClose,
  sunlightMode = false
}) => {
  const [selectedCrop, setSelectedCrop] = useState<'Milho' | 'Mandioca' | 'Amendoim' | 'Caju' | 'Outra'>('Milho');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [farmerNote, setFarmerNote] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<PhotoDiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const stopAudioRef = useRef<(() => void) | null>(null);

  // Stop audio on unmount or modal close
  useEffect(() => {
    return () => {
      if (stopAudioRef.current) {
        stopAudioRef.current();
      }
    };
  }, []);

  const handleReset = () => {
    setImagePreview(null);
    setResult(null);
    setError(null);
    if (stopAudioRef.current) {
      stopAudioRef.current();
      setSpeaking(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (crop: 'Milho' | 'Mandioca' | 'Amendoim' | 'Caju', sampleSrc: string) => {
    setSelectedCrop(crop);
    setImagePreview(sampleSrc);
    setError(null);
  };

  const handleDiagnose = async () => {
    if (!imagePreview) {
      setError('Por favor escolha ou tire uma fotografia da planta primeiro.');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const data = await MobileService.analyzePlantPhoto(
        imagePreview,
        selectedCrop,
        'Homoíne / Panda, Inhambane',
        farmerNote
      );
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Falha ao analisar a foto. Tente novamente.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleToggleSpeak = () => {
    if (speaking) {
      if (stopAudioRef.current) stopAudioRef.current();
      setSpeaking(false);
      return;
    }

    if (!result) return;

    const speechScript = `
      Diagnóstico para ${result.cropIdentified}.
      Problema identificado: ${result.problemTitle}.
      Gravidade: ${result.severity}.
      ${result.simpleExplanation}.
      O que fazer hoje na machamba: ${result.whatToDoToday.join('. ')}.
      Remédio caseiro recomendado: ${result.homeRemedy.name}. Como preparar: ${result.homeRemedy.recipe}. Aplicação: ${result.homeRemedy.application}.
      Conselho da nossa terra: ${result.localTip}.
    `;

    setSpeaking(true);
    stopAudioRef.current = MobileService.speakText(speechScript, () => {
      setSpeaking(false);
    });
  };

  return (
    <AriaModal
      isOpen={isOpen}
      onClose={onClose}
      title="Diagnosticar Planta por Foto"
      maxWidth="max-w-2xl"
      className={sunlightMode ? 'bg-black text-white border-4 border-yellow-400' : ''}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              sunlightMode 
                ? 'bg-yellow-400 text-black font-black' 
                : 'bg-emerald-600 text-white shadow-sm'
            }`}>
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${sunlightMode ? 'text-yellow-400' : 'text-stone-900 dark:text-stone-100'}`}>
                Diagnosticar Planta por Foto
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Análise com IA Gemini · Mandioca, Milho, Amendoim e Caju
              </p>
            </div>
          </div>

          {result && (
            <button
              onClick={handleReset}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Nova Foto</span>
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Upload or Choose Sample */}
        {!result && (
          <div className="space-y-4">
            {/* Crop selector pills */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                1. Qual é a cultura da machamba?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['Milho', 'Mandioca', 'Amendoim', 'Caju'] as const).map(crop => (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => setSelectedCrop(crop)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                      selectedCrop === crop
                        ? sunlightMode
                          ? 'bg-yellow-400 text-black border-yellow-400 scale-[1.02]'
                          : 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                        : sunlightMode
                          ? 'bg-stone-900 text-stone-300 border-stone-700'
                          : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Capture / Upload Area */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                2. Foto da folha ou planta doente
              </label>

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-stone-950 max-h-64 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Cultura para diagnóstico"
                    className="w-full h-56 object-cover object-center"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
                    Cultura: {selectedCrop}
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Camera Button */}
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 text-center transition-transform active:scale-95 ${
                        sunlightMode
                          ? 'bg-yellow-400 text-black border-yellow-400 font-black'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      <Camera className="w-7 h-7" />
                      <span className="text-xs font-bold leading-tight">Tirar Foto na Machamba</span>
                      <span className="text-[10px] opacity-75">Câmara do telemóvel</span>
                    </button>

                    {/* Gallery / File Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 text-center transition-transform active:scale-95 ${
                        sunlightMode
                          ? 'bg-stone-900 text-white border-stone-600 font-bold'
                          : 'bg-stone-50 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <Upload className="w-7 h-7" />
                      <span className="text-xs font-bold leading-tight">Carregar da Galeria</span>
                      <span className="text-[10px] opacity-75">Ficheiro ou imagem</span>
                    </button>
                  </div>

                  {/* Hidden inputs */}
                  <input
                    type="file"
                    ref={cameraInputRef}
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Fast 1-Click Samples for testing */}
                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Ou teste com fotos de culturas locais de Inhambane:</span>
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectSample('Milho', milhoSample)}
                        className="group relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 hover:border-emerald-500 text-left"
                      >
                        <img src={milhoSample} alt="Milho" className="w-full h-14 object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-[9px] font-bold py-0.5 text-center block">
                          Milho
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectSample('Mandioca', mandiocaSample)}
                        className="group relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 hover:border-emerald-500 text-left"
                      >
                        <img src={mandiocaSample} alt="Mandioca" className="w-full h-14 object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-[9px] font-bold py-0.5 text-center block">
                          Mandioca
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectSample('Amendoim', amendoimSample)}
                        className="group relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 hover:border-emerald-500 text-left"
                      >
                        <img src={amendoimSample} alt="Amendoim" className="w-full h-14 object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-[9px] font-bold py-0.5 text-center block">
                          Amendoim
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectSample('Caju', cajuSample)}
                        className="group relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 hover:border-emerald-500 text-left"
                      >
                        <img src={cajuSample} alt="Caju" className="w-full h-14 object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-[9px] font-bold py-0.5 text-center block">
                          Caju
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Optional note */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                Nota do agricultor (opcional):
              </label>
              <input
                type="text"
                value={farmerNote}
                onChange={e => setFarmerNote(e.target.value)}
                placeholder="Ex: Folhas comidas e com bichinhos amarelos..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 outline-none"
              />
            </div>

            {/* Submit Diagnose Button */}
            <button
              type="button"
              onClick={handleDiagnose}
              disabled={analyzing || !imagePreview}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                sunlightMode
                  ? 'bg-yellow-400 hover:bg-yellow-300 text-black font-black'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>A analisar com IA do Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Diagnosticar Planta Agora</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Diagnostic Results Display */}
        {result && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Audio Readout Banner */}
            <div className={`p-3 rounded-2xl flex items-center justify-between gap-3 border ${
              sunlightMode
                ? 'bg-yellow-400 text-black border-yellow-400 font-bold'
                : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800'
            }`}>
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-emerald-800 dark:text-emerald-300 shrink-0" />
                <span className="text-xs font-bold">
                  {speaking ? 'A ler o diagnóstico em voz alta...' : 'Ouvir conselho em áudio'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleSpeak}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-transform active:scale-95 ${
                  speaking
                    ? 'bg-red-600 text-white'
                    : sunlightMode
                      ? 'bg-black text-yellow-400'
                      : 'bg-emerald-700 text-white hover:bg-emerald-800'
                }`}
              >
                {speaking ? 'Parar Áudio' : 'Ouvir Agora'}
              </button>
            </div>

            {/* Diagnostic Card */}
            <div className={`p-4 rounded-2xl border-2 ${
              result.severity === 'Grave'
                ? 'bg-red-50 dark:bg-red-950/30 border-red-400'
                : result.severity === 'Média'
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-400'
                  : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/10 dark:bg-white/10">
                    Cultura: {result.cropIdentified}
                  </span>
                  <h4 className="text-base font-display font-bold mt-1 text-stone-900 dark:text-stone-100">
                    {result.problemTitle}
                  </h4>
                </div>

                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  result.severity === 'Grave'
                    ? 'bg-red-600 text-white'
                    : result.severity === 'Média'
                      ? 'bg-amber-500 text-black'
                      : 'bg-emerald-600 text-white'
                }`}>
                  Severidade: {result.severity}
                </span>
              </div>

              <p className="text-xs text-stone-700 dark:text-stone-300 mt-2.5 leading-relaxed font-medium">
                {result.simpleExplanation}
              </p>
            </div>

            {/* What to do today */}
            <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <h5 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>O que fazer hoje na machamba:</span>
              </h5>
              <ul className="space-y-1.5">
                {result.whatToDoToday.map((action, i) => (
                  <li key={i} className="text-xs text-stone-700 dark:text-stone-300 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Low cost home remedy */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800">
              <h5 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>Remédio Caseiro Fácil: {result.homeRemedy.name}</span>
              </h5>
              <p className="text-xs text-stone-700 dark:text-stone-300 mt-1">
                <strong>Ingredientes:</strong> {result.homeRemedy.recipe}
              </p>
              <p className="text-xs text-stone-700 dark:text-stone-300 mt-1">
                <strong>Como aplicar:</strong> {result.homeRemedy.application}
              </p>
            </div>

            {/* Local wisdom & proverb */}
            <div className="p-3 rounded-2xl bg-emerald-900 text-emerald-100 text-xs italic text-center">
              "{result.localTip}"
            </div>
          </div>
        )}
      </div>
    </AriaModal>
  );
};
