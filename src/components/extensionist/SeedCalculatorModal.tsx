import React, { useState } from 'react';
import { AriaModal } from '../AriaModal';
import { 
  Calculator, 
  Sprout, 
  CheckCircle2, 
  Scale, 
  Layers, 
  TrendingUp, 
  Share2, 
  Copy, 
  Check, 
  HelpCircle,
  Wheat
} from 'lucide-react';

interface SeedCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CropSpec {
  name: string;
  variety: string;
  seedPerHa: number; // in kg or units
  unit: 'kg' | 'estacas' | 'mudas';
  spacingRowCm: number;
  spacingPlantCm: number;
  plantsPerHa: number;
  expectedYieldMinKg: number;
  expectedYieldMaxKg: number;
  manurePerHaTons: number;
  notes: string;
}

const CROP_SPECS: Record<string, CropSpec> = {
  milho: {
    name: 'Milho',
    variety: 'Matuba / PAN 53 (Precoce tolerante à seca)',
    seedPerHa: 25,
    unit: 'kg',
    spacingRowCm: 80,
    spacingPlantCm: 25,
    plantsPerHa: 50000,
    expectedYieldMinKg: 1200,
    expectedYieldMaxKg: 2500,
    manurePerHaTons: 5,
    notes: 'Semeie 2 sementes por cova e desbaste para 1 planta forte após 15 dias.'
  },
  mandioca: {
    name: 'Mandioca',
    variety: 'Chinamuna / MZ-02 (Resistente ao mosaico)',
    seedPerHa: 10000,
    unit: 'estacas',
    spacingRowCm: 100,
    spacingPlantCm: 100,
    plantsPerHa: 10000,
    expectedYieldMinKg: 8000,
    expectedYieldMaxKg: 15000,
    manurePerHaTons: 4,
    notes: 'Corte estacas de 20 a 25 cm com 5 a 7 gemas sãs de ramos maduros.'
  },
  amendoim: {
    name: 'Amendoim',
    variety: 'Bebiano Branco / Nametil',
    seedPerHa: 70,
    unit: 'kg',
    spacingRowCm: 50,
    spacingPlantCm: 15,
    plantsPerHa: 133000,
    expectedYieldMinKg: 700,
    expectedYieldMaxKg: 1400,
    manurePerHaTons: 3,
    notes: 'Utilize sementes graúdas descascadas à mão para não rachar o embrião.'
  },
  caju: {
    name: 'Cajueiro',
    variety: 'Mudas Enxertadas Selecionadas de Inhambane',
    seedPerHa: 80,
    unit: 'mudas',
    spacingRowCm: 1100,
    spacingPlantCm: 1100,
    plantsPerHa: 82,
    expectedYieldMinKg: 800,
    expectedYieldMaxKg: 1600,
    manurePerHaTons: 2,
    notes: 'Abra covas de 60x60x60 cm misturando a terra de cima com estrume curtido.'
  },
  feijao: {
    name: 'Feijão Nhemba',
    variety: 'IT-18 / Consórcio com Milho',
    seedPerHa: 25,
    unit: 'kg',
    spacingRowCm: 50,
    spacingPlantCm: 20,
    plantsPerHa: 100000,
    expectedYieldMinKg: 500,
    expectedYieldMaxKg: 1000,
    manurePerHaTons: 2.5,
    notes: 'Excelente fixador de azoto; reduz o aparecimento de ervas daninhas.'
  }
};

export const SeedCalculatorModal: React.FC<SeedCalculatorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedCropKey, setSelectedCropKey] = useState<string>('milho');
  const [unitMode, setUnitMode] = useState<'ha' | 'canteiros'>('ha');
  const [inputValue, setInputValue] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  const crop = CROP_SPECS[selectedCropKey] || CROP_SPECS['milho'];

  // Convert canteiros (10m x 1m = 10m² = 0.001 ha) to hectares
  const hectares = unitMode === 'ha' ? inputValue : inputValue * 0.001;

  // Calculations
  const requiredSeeds = Math.round(crop.seedPerHa * hectares * 10) / 10;
  const totalPlants = Math.round(crop.plantsPerHa * hectares);
  const estYieldMin = Math.round(crop.expectedYieldMinKg * hectares);
  const estYieldMax = Math.round(crop.expectedYieldMaxKg * hectares);
  const recommendedManure = Math.round(crop.manurePerHaTons * hectares * 10) / 10;

  const handleCopySummary = () => {
    const text = `
Resumo Agronómico · AgroResiliente Inhambane
Cultura: ${crop.name} (${crop.variety})
Área: ${inputValue} ${unitMode === 'ha' ? 'Hectares' : 'Canteiros (10x1m)'} (${hectares.toFixed(3)} ha)
Necessidade de sementes: ${requiredSeeds} ${crop.unit}
Espaçamento: ${crop.spacingRowCm} cm entre linhas x ${crop.spacingPlantCm} cm entre plantas
População estimada: ${totalPlants.toLocaleString()} plantas
Estimativa de colheita: ${estYieldMin} a ${estYieldMax} kg
Composto orgânico recomendado: ${recommendedManure} toneladas
Nota técnica: ${crop.notes}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AriaModal
      isOpen={isOpen}
      onClose={onClose}
      title="Calculadora de Sementes e Área"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-700 text-white flex items-center justify-center shadow-sm">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Calculadora de Sementes e Área
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Parâmetros calibrados para os solos e variedades de Inhambane
              </p>
            </div>
          </div>
        </div>

        {/* Crop Selection */}
        <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
            1. Escolha a Cultura:
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {Object.entries(CROP_SPECS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCropKey(key)}
                className={`py-2 px-2 text-center rounded-xl text-xs font-bold border transition-all ${
                  selectedCropKey === key
                    ? 'bg-sky-700 text-white border-sky-700 shadow-sm'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            Variedade padrão: <strong>{crop.variety}</strong>
          </span>
        </div>

        {/* Area Input & Unit Switch */}
        <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              2. Área da Machamba:
            </label>

            <div className="flex items-center bg-stone-200 dark:bg-stone-800 p-0.5 rounded-lg text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setUnitMode('ha');
                  if (unitMode === 'canteiros') setInputValue(Math.max(0.1, Number((inputValue * 0.001).toFixed(2))));
                }}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  unitMode === 'ha'
                    ? 'bg-white dark:bg-stone-900 text-sky-800 dark:text-sky-300 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                Hectares (ha)
              </button>
              <button
                type="button"
                onClick={() => {
                  setUnitMode('canteiros');
                  if (unitMode === 'ha') setInputValue(Math.round(inputValue * 1000));
                }}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  unitMode === 'canteiros'
                    ? 'bg-white dark:bg-stone-900 text-sky-800 dark:text-sky-300 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                Canteiros (10x1m)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              step={unitMode === 'ha' ? '0.1' : '10'}
              min={unitMode === 'ha' ? '0.05' : '1'}
              value={inputValue}
              onChange={e => setInputValue(parseFloat(e.target.value) || 0)}
              className="w-32 px-3 py-2 text-base font-bold text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl outline-none"
            />
            <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">
              = <strong>{hectares.toFixed(3)} hectares</strong> ({(hectares * 10000).toLocaleString()} m²)
            </span>
          </div>
        </div>

        {/* Calculation Results Card */}
        <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border-2 border-sky-300 dark:border-sky-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-sky-200 dark:border-sky-900/60">
            <span className="text-xs font-bold text-sky-900 dark:text-sky-200 uppercase tracking-wider">
              Recomendações Técnicas para {crop.name}:
            </span>
            <button
              type="button"
              onClick={handleCopySummary}
              className="text-xs font-bold text-sky-800 dark:text-sky-300 hover:underline flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Resumo'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-sky-200 dark:border-sky-900">
              <span className="text-[10px] text-stone-500 font-semibold block uppercase">Sementes / Estacas Necessárias</span>
              <p className="text-lg font-bold text-sky-950 dark:text-sky-100 mt-0.5">
                {requiredSeeds.toLocaleString()} <span className="text-xs font-normal text-stone-500">{crop.unit}</span>
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-sky-200 dark:border-sky-900">
              <span className="text-[10px] text-stone-500 font-semibold block uppercase">População de Plantas</span>
              <p className="text-lg font-bold text-sky-950 dark:text-sky-100 mt-0.5">
                {totalPlants.toLocaleString()} <span className="text-xs font-normal text-stone-500">pés</span>
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-sky-200 dark:border-sky-900">
              <span className="text-[10px] text-stone-500 font-semibold block uppercase">Espaçamento (Compasso)</span>
              <p className="text-sm font-bold text-stone-800 dark:text-stone-200 mt-0.5">
                {crop.spacingRowCm} cm <span className="text-xs font-normal text-stone-500">x</span> {crop.spacingPlantCm} cm
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-sky-200 dark:border-sky-900">
              <span className="text-[10px] text-stone-500 font-semibold block uppercase">Estimativa de Colheita</span>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                {estYieldMin.toLocaleString()} a {estYieldMax.toLocaleString()} kg
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/70 dark:bg-stone-900/70 border border-sky-200 dark:border-sky-900 text-xs text-stone-700 dark:text-stone-300">
            <strong>Adubação orgânica recomendada:</strong> {recommendedManure} toneladas de estrume curtido de gado ou cabrito espalhado nos camalhões.
          </div>

          <div className="text-[11px] text-sky-900 dark:text-sky-300 italic">
            💡 {crop.notes}
          </div>
        </div>
      </div>
    </AriaModal>
  );
};
