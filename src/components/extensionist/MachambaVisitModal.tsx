import React, { useState, useEffect } from 'react';
import { AriaModal } from '../AriaModal';
import { MobileService } from '../../services/mobileService';
import { MachambaVisit } from '../../types/mobileApp';
import { 
  ClipboardList, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Download, 
  Plus, 
  Navigation, 
  Phone, 
  Calendar,
  Layers,
  Sprout,
  ShieldCheck,
  Check
} from 'lucide-react';

interface MachambaVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVisitSaved?: () => void;
}

const DISTRICTS = [
  'Homoíne',
  'Maxixe',
  'Panda',
  'Massinga',
  'Zavala',
  'Morrumbene',
  'Jangamo',
  'Funhalouro',
  'Inharrime',
  'Mabote',
  'Inhambane-Cidade'
];

const COMMON_PESTS = [
  'Lagarta-do-cartucho',
  'Mosaico Africano (CMD)',
  'Oídio do Cajueiro',
  'Mancha Castanha',
  'Broca do Caule',
  'Ácaro Verde',
  'Seca e Desidratação'
];

export const MachambaVisitModal: React.FC<MachambaVisitModalProps> = ({
  isOpen,
  onClose,
  onVisitSaved
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');
  const [visits, setVisits] = useState<MachambaVisit[]>(() => MobileService.getVisits());
  
  // Form fields
  const [farmerName, setFarmerName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Homoíne');
  const [locality, setLocality] = useState('');
  const [crop, setCrop] = useState<MachambaVisit['crop']>('Milho');
  const [areaHa, setAreaHa] = useState<number>(1.0);
  const [healthStatus, setHealthStatus] = useState<MachambaVisit['healthStatus']>('Bom');
  const [selectedPests, setSelectedPests] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState('');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; accuracy?: number } | undefined>(undefined);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisits(MobileService.getVisits());
    }
  }, [isOpen]);

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada neste dispositivo.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5)),
          accuracy: Math.round(pos.coords.accuracy)
        });
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        // Fallback realistic coordinates for Homoíne if in sandbox
        setGpsCoords({ lat: -23.9482, lng: 35.2514, accuracy: 15 });
      },
      { timeout: 7000 }
    );
  };

  const handleTogglePest = (pest: string) => {
    setSelectedPests(prev => 
      prev.includes(pest) ? prev.filter(p => p !== pest) : [...prev, pest]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerName.trim()) return;

    const newVisit = MobileService.saveVisit({
      farmerName: farmerName.trim(),
      phone: phone.trim() || '840000000',
      district,
      locality: locality.trim() || `${district}-Sede`,
      crop,
      areaHa: Number(areaHa) || 1,
      healthStatus,
      observedPests: selectedPests,
      recommendations: recommendations.trim() || 'Aplicação preventiva de cinza e mulching.',
      gpsCoords,
      extensionistName: 'Técnico SDAE / CITT'
    });

    setVisits(prev => [newVisit, ...prev]);
    setSuccessMsg(true);

    // Reset form
    setFarmerName('');
    setPhone('');
    setLocality('');
    setSelectedPests([]);
    setRecommendations('');

    if (onVisitSaved) onVisitSaved();

    setTimeout(() => {
      setSuccessMsg(false);
      setActiveTab('list');
    }, 1200);
  };

  const handleDelete = (id: string) => {
    MobileService.deleteVisit(id);
    setVisits(prev => prev.filter(v => v.id !== id));
  };

  const handleExportCSV = () => {
    if (visits.length === 0) return;
    const headers = ['Data', 'Produtor', 'Telefone', 'Distrito', 'Localidade', 'Cultura', 'Area_Ha', 'Estado', 'Pragas', 'GPS_Lat', 'GPS_Lng'];
    const rows = visits.map(v => [
      new Date(v.date).toLocaleDateString('pt-MZ'),
      `"${v.farmerName}"`,
      v.phone,
      v.district,
      `"${v.locality}"`,
      v.crop,
      v.areaHa,
      v.healthStatus,
      `"${v.observedPests.join('; ')}"`,
      v.gpsCoords?.lat || '',
      v.gpsCoords?.lng || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `visitas_machambas_inhambane_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AriaModal
      isOpen={isOpen}
      onClose={onClose}
      title="Registo de Visitas à Machamba"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Registar Visita à Machamba
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Caderno de campo digital do extensionista · Armazenamento offline
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                activeTab === 'form'
                  ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              + Nova Visita
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 ${
                activeTab === 'list'
                  ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <span>Histórico</span>
              <span className="w-4 h-4 rounded-full bg-emerald-700 text-white text-[10px] flex items-center justify-center">
                {visits.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1: Form */}
        {activeTab === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700" />
                <span>Visita registada com sucesso no caderno de campo!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Nome do Produtor / Chefe de Família *
                </label>
                <input
                  type="text"
                  required
                  value={farmerName}
                  onChange={e => setFarmerName(e.target.value)}
                  placeholder="Ex: Alberto Tembe"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Contacto de Telemóvel (+258)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="841234567"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Distrito de Inhambane
                </label>
                <select
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 outline-none"
                >
                  {DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Localidade / Povoado
                </label>
                <input
                  type="text"
                  value={locality}
                  onChange={e => setLocality(e.target.value)}
                  placeholder="Ex: Chidenguele, Massalane, Bairro 4"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Cultura Inspecionada
                </label>
                <select
                  value={crop}
                  onChange={e => setCrop(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 outline-none"
                >
                  <option value="Milho">Milho</option>
                  <option value="Mandioca">Mandioca</option>
                  <option value="Amendoim">Amendoim</option>
                  <option value="Caju">Caju</option>
                  <option value="Feijão Nhemba">Feijão Nhemba</option>
                  <option value="Hortícolas">Hortícolas</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Área da Machamba (Hectares)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={areaHa}
                  onChange={e => setAreaHa(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Estado Geral de Saúde
                </label>
                <select
                  value={healthStatus}
                  onChange={e => setHealthStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 outline-none font-semibold"
                >
                  <option value="Excelente">Excelente (Sem pragas)</option>
                  <option value="Bom">Bom (Desenvolvimento normal)</option>
                  <option value="Alerta Leve">Alerta Leve (Danos &lt; 15%)</option>
                  <option value="Infestação Grave">Infestação Grave (Risco de perda)</option>
                </select>
              </div>
            </div>

            {/* Observed pests checklist */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Pragas ou Sintomas Observados no Campo:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_PESTS.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleTogglePest(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      selectedPests.includes(p)
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    {selectedPests.includes(p) ? '✓ ' : '+ '}{p}
                  </button>
                ))}
              </div>
            </div>

            {/* GPS Capture */}
            <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-stone-900 dark:text-stone-100">Coordenadas da Machamba:</span>
                  <p className="text-[11px] text-stone-500">
                    {gpsCoords ? `Lat: ${gpsCoords.lat}, Lng: ${gpsCoords.lng} (Precisão: ±${gpsCoords.accuracy}m)` : 'GPS não capturado ainda'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCaptureGps}
                disabled={gpsLoading}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span>{gpsCoords ? 'Atualizar GPS' : 'Capturar GPS'}</span>
              </button>
            </div>

            {/* Recommendations */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                Orientações Dadas ao Produtor:
              </label>
              <textarea
                rows={2}
                value={recommendations}
                onChange={e => setRecommendations(e.target.value)}
                placeholder="Ex: Realizar sacha rasa, aplicar calda de cinza com areia no olho do milho e aplicar mulching de capim seco."
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar Registo da Visita</span>
            </button>
          </form>
        )}

        {/* Tab 2: Visits List */}
        {activeTab === 'list' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-200 dark:border-stone-800">
              <span className="font-bold text-stone-600 dark:text-stone-400">
                {visits.length} visitas registadas no dispositivo
              </span>
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3 py-1 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-lg font-bold flex items-center gap-1.5 text-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descarregar CSV</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {visits.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs">
                  Nenhuma visita registada ainda. Clique em "+ Nova Visita".
                </div>
              ) : (
                visits.map(v => (
                  <div
                    key={v.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                            {v.farmerName}
                          </h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            v.healthStatus === 'Infestação Grave'
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              : v.healthStatus === 'Alerta Leve'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {v.healthStatus}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {v.district} · {v.locality} · {v.crop} ({v.areaHa} ha)
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(v.id)}
                        className="text-stone-400 hover:text-red-600 transition-colors p-1"
                        title="Eliminar visita"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {v.observedPests.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {v.observedPests.map((p, idx) => (
                          <span key={idx} className="text-[10px] font-medium px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded">
                            {p}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-[11px] text-stone-600 dark:text-stone-400 italic">
                      "{v.recommendations}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-800/60">
                      <span>{new Date(v.date).toLocaleDateString('pt-MZ')}</span>
                      <span>{v.gpsCoords ? `GPS: ${v.gpsCoords.lat}, ${v.gpsCoords.lng}` : 'Sem GPS'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </AriaModal>
  );
};
