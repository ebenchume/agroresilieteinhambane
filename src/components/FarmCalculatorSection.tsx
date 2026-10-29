import React, { useState } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  Download, 
  Scale, 
  Truck, 
  Sprout, 
  Users, 
  HelpCircle,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { User, CropType, MarketPrice } from '../types/auth';
import { PdfReportService } from '../services/pdfReport';

interface FarmCalculatorSectionProps {
  user: User;
  marketPrices: MarketPrice[];
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

export const FarmCalculatorSection: React.FC<FarmCalculatorSectionProps> = ({
  user,
  marketPrices,
  onShowToast
}) => {
  const [crop, setCrop] = useState<CropType>(user.crop || 'Milho');
  const [area, setArea] = useState<number>(1.0);
  const [areaUnit, setAreaUnit] = useState<'hectares' | 'camalhões'>('hectares');

  // Direct Production Expenses (in Meticais - MT)
  const [seedCost, setSeedCost] = useState<number>(1200);
  const [tillageCost, setTillageCost] = useState<number>(2500); // Lavoura / Abertura de camalhões
  const [weedingCost, setWeedingCost] = useState<number>(3000); // Sacha / Mão de obra
  const [fertilizerCost, setFertilizerCost] = useState<number>(800); // Composto / Estrume
  const [transportCost, setTransportCost] = useState<number>(1500); // Chapa/Canter para Maxixe
  const [packagingCost, setPackagingCost] = useState<number>(600); // Sacos de ráfia

  // Productivity and Market Sale
  const [expectedYieldKg, setExpectedYieldKg] = useState<number>(1800); // 1.8 tons/ha
  const [salePricePerKg, setSalePricePerKg] = useState<number>(30); // MT/kg

  const [isExporting, setIsExporting] = useState(false);

  // Auto-sync typical baseline when crop changes
  const handleCropChange = (newCrop: CropType) => {
    setCrop(newCrop);
    const foundPrice = marketPrices.find(p => p.crop === newCrop);
    const avgPrice = foundPrice ? Math.round((foundPrice.minPrice + foundPrice.maxPrice) / 2) : 25;
    setSalePricePerKg(avgPrice);

    switch (newCrop) {
      case 'Milho':
        setExpectedYieldKg(1800);
        setSeedCost(1200);
        break;
      case 'Mandioca':
        setExpectedYieldKg(7500);
        setSeedCost(800);
        break;
      case 'Amendoim':
        setExpectedYieldKg(1100);
        setSeedCost(2400);
        break;
      case 'Feijão nhemba':
        setExpectedYieldKg(850);
        setSeedCost(1400);
        break;
      case 'Caju':
        setExpectedYieldKg(600);
        setSeedCost(1000);
        break;
      case 'Batata-doce':
        setExpectedYieldKg(6000);
        setSeedCost(700);
        break;
      default:
        setExpectedYieldKg(1500);
    }
  };

  // Calculations
  const totalCost = seedCost + tillageCost + weedingCost + fertilizerCost + transportCost + packagingCost;
  const grossRevenue = expectedYieldKg * salePricePerKg;
  const netProfit = grossRevenue - totalCost;
  const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
  const breakEvenPrice = expectedYieldKg > 0 ? totalCost / expectedYieldKg : 0;

  const handleExportPdf = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const filename = PdfReportService.exportFarmFinancialReport(user, {
          crop,
          area,
          areaUnit: areaUnit === 'hectares' ? 'Hectare(s)' : 'Camalhões',
          totalCost,
          expectedYieldKg,
          marketPricePerKg: salePricePerKg,
          grossRevenue,
          netProfit,
          profitMargin,
          breakEvenPrice,
          costItems: [
            { item: 'Sementes / Manivas', amount: seedCost, description: 'Sementes selecionadas e tratamento' },
            { item: 'Lavoura e Preparação', amount: tillageCost, description: 'Tração ou preparo mecânico da parcela' },
            { item: 'Sacha e Mão-de-Obra', amount: weedingCost, description: 'Primeira e segunda sacha manual' },
            { item: 'Adubação e Nutrição', amount: fertilizerCost, description: 'Compostagem orgânica e cinzas' },
            { item: 'Transporte e Frete', amount: transportCost, description: 'Canter/Chapa até ao mercado grossista' },
            { item: 'Sacos e Embalagem', amount: packagingCost, description: 'Sacos de ráfia de 50 kg' }
          ]
        });
        onShowToast(`Ficha Financeira ${filename} gerada com sucesso!`, 'success');
      } catch (e) {
        console.error('PDF error:', e);
        onShowToast('Erro ao exportar PDF.', 'info');
      } finally {
        setIsExporting(false);
      }
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-stone-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-amber-200 border border-white/10">
              <Calculator className="w-3.5 h-3.5" />
              <span>Gestão Económica da Machamba · Província de Inhambane</span>
            </div>
            <h2 className="text-2xl font-bold font-serif">
              Calculadora de Custos & Rentabilidade Agrária
            </h2>
            <p className="text-sm text-amber-100 max-w-2xl leading-relaxed">
              Descubra o custo exato de produção por hectare ou camalhão em Homoíne. Calcule o seu ponto de equilíbrio (preço mínimo de venda para evitar prejuízos) e compare com os preços dos mercados da Maxixe e Homoíne.
            </p>
          </div>

          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="self-start md:self-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'A gerar Ficha PDF...' : 'Descarregar Ficha em PDF'}
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Cost */}
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-stone-500 uppercase">Custo Total de Produção</span>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {totalCost.toLocaleString('pt-MZ')} <span className="text-xs font-medium text-stone-400">MT</span>
          </p>
          <span className="text-[10px] text-stone-400 block">Sementes + mão-de-obra + frete</span>
        </div>

        {/* Gross Revenue */}
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-stone-500 uppercase">Receita Bruta Prevista</span>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {grossRevenue.toLocaleString('pt-MZ')} <span className="text-xs font-medium text-stone-400">MT</span>
          </p>
          <span className="text-[10px] text-stone-400 block">{expectedYieldKg} kg × {salePricePerKg} MT/kg</span>
        </div>

        {/* Net Profit */}
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-stone-500 uppercase">Lucro Líquido Real</span>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
            {netProfit.toLocaleString('pt-MZ')} <span className="text-xs font-medium text-stone-400">MT</span>
          </p>
          <div className="flex items-center gap-1 text-[10px]">
            {netProfit >= 0 ? (
              <span className="text-emerald-600 font-semibold flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> Margem: {profitMargin.toFixed(1)}%
              </span>
            ) : (
              <span className="text-rose-600 font-semibold flex items-center">
                <TrendingDown className="w-3 h-3 mr-0.5" /> Prejuízo
              </span>
            )}
          </div>
        </div>

        {/* Break Even Price */}
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-stone-500 uppercase">Preço Mínimo (Equilíbrio)</span>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {breakEvenPrice.toFixed(2)} <span className="text-xs font-medium text-stone-400">MT/kg</span>
          </p>
          <span className="text-[10px] text-stone-400 block">Preço de venda atual: {salePricePerKg} MT/kg</span>
        </div>
      </div>

      {/* Main Interactive Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Parameters */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Parâmetros da Machamba & Custos Diretos
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Ajuste os valores reais para obter o balanço financeiro da sua colheita.
              </p>
            </div>

            {/* Quick Crop Selector */}
            <select
              value={crop}
              onChange={(e) => handleCropChange(e.target.value as CropType)}
              className="text-xs font-semibold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-2 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Milho">Milho</option>
              <option value="Mandioca">Mandioca</option>
              <option value="Amendoim">Amendoim</option>
              <option value="Feijão nhemba">Feijão nhemba</option>
              <option value="Caju">Caju</option>
              <option value="Batata-doce">Batata-doce</option>
            </select>
          </div>

          {/* Area & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Área Cultivada
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={area}
                  onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2.5 focus:ring-2 focus:ring-emerald-500"
                />
                <select
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value as any)}
                  className="text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-2 text-stone-800 dark:text-stone-200"
                >
                  <option value="hectares">Hectares</option>
                  <option value="camalhões">Camalhões</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Produção Esperada Total (kg)
              </label>
              <input
                type="number"
                min="10"
                step="50"
                value={expectedYieldKg}
                onChange={(e) => setExpectedYieldKg(parseInt(e.target.value) || 0)}
                className="w-full text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2.5 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Expenses Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Despesas com Insumos e Serviços (em Meticais)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-stone-600 dark:text-stone-400 flex items-center justify-between">
                  <span>Sementes / Manivas:</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{seedCost} MT</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="6000"
                  step="100"
                  value={seedCost}
                  onChange={(e) => setSeedCost(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-stone-600 dark:text-stone-400 flex items-center justify-between">
                  <span>Lavoura / Tração Animal:</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{tillageCost} MT</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="8000"
                  step="100"
                  value={tillageCost}
                  onChange={(e) => setTillageCost(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-stone-600 dark:text-stone-400 flex items-center justify-between">
                  <span>Sacha e Mão-de-Obra Local:</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{weedingCost} MT</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={weedingCost}
                  onChange={(e) => setWeedingCost(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-stone-600 dark:text-stone-400 flex items-center justify-between">
                  <span>Adubação e Composto:</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{fertilizerCost} MT</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="4000"
                  step="50"
                  value={fertilizerCost}
                  onChange={(e) => setFertilizerCost(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-stone-600 dark:text-stone-400 flex items-center justify-between">
                  <span>Transporte (Canter / Chapa):</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{transportCost} MT</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="6000"
                  step="100"
                  value={transportCost}
                  onChange={(e) => setTransportCost(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-stone-600 dark:text-stone-400 flex items-center justify-between">
                  <span>Sacos de Ráfia / Embalagens:</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{packagingCost} MT</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="50"
                  value={packagingCost}
                  onChange={(e) => setPackagingCost(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Sale Price Slider */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                Preço de Venda Esperado no Mercado:
              </span>
              <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">
                {salePricePerKg} MT / kg
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="120"
              step="1"
              value={salePricePerKg}
              onChange={(e) => setSalePricePerKg(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
              Cotação atual de referência: Maxixe ~ 32 MT/kg | Homoíne ~ 28 MT/kg.
            </p>
          </div>
        </div>

        {/* Right 1 Col: Market Insights & Extensionist Advice */}
        <div className="space-y-6">
          {/* Market Benchmark Card */}
          <div className="bg-white dark:bg-stone-900 p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              Comparação com Mercados de Inhambane
            </h3>

            <div className="space-y-2.5 text-xs">
              {marketPrices.slice(0, 4).map((m, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-stone-50 dark:bg-stone-800">
                  <div>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">{m.crop}</span>
                    <span className="text-[10px] text-stone-400 block">{m.market}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{m.minPrice}-{m.maxPrice} {m.unit}</span>
                    <span className="text-[10px] text-stone-400 block">{m.trend === 'up' ? '▲ Alta' : '― Estável'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Economic Recommendations */}
          <div className="bg-white dark:bg-stone-900 p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3 text-xs text-stone-600 dark:text-stone-400">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Dicas para Aumentar o Lucro Líquido
            </h4>
            <ul className="space-y-2 list-disc list-inside">
              <li>
                <strong className="text-stone-800 dark:text-stone-200">Frete partilhado:</strong> Junte a produção com vizinhos da aldeia para encher uma canter até Maxixe. Poupa até 40% no frete.
              </li>
              <li>
                <strong className="text-stone-800 dark:text-stone-200">Biofertilização:</strong> Utilize esterco de caprinos e cinzas de lenha locais em vez de fertilizantes minerais importados.
              </li>
              <li>
                <strong className="text-stone-800 dark:text-stone-200">Armazenamento pós-colheita:</strong> Evite vender tudo na época de pico de colheita quando os preços caem até 35%.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
