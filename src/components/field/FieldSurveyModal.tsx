import React, { useState, useMemo } from 'react';
import { AriaModal } from '../AriaModal';
import {
  FieldSurveyService,
  INHAMBANE_DISTRICTS_CATALOG,
  SURVEY_CROPS_LIST,
  CONSERVATION_PRACTICES_LIST,
  FIELD_CHALLENGES_LIST
} from '../../services/fieldSurveyService';
import { FieldSurveyRecord, InhambaneDistrict } from '../../types/mobileApp';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import {
  ClipboardCheck,
  MapPin,
  Navigation,
  Sprout,
  Droplets,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Wifi,
  WifiOff,
  Users,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface FieldSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDistrict?: InhambaneDistrict;
  onSurveySaved?: (record: FieldSurveyRecord) => void;
}

export const FieldSurveyModal: React.FC<FieldSurveyModalProps> = ({
  isOpen,
  onClose,
  defaultDistrict = 'Homoíne',
  onSurveySaved
}) => {
  const isOnline = useOnlineStatus();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [saving, setSaving] = useState(false);
  const [savedRecord, setSavedRecord] = useState<FieldSurveyRecord | null>(null);

  // Step 1: Location & Respondent
  const [district, setDistrict] = useState<InhambaneDistrict>(defaultDistrict);
  const [locality, setLocality] = useState<string>('Homoíne-Sede');
  const [communityOrAssociation, setCommunityOrAssociation] = useState('');
  const [respondentName, setRespondentName] = useState('');
  const [respondentGender, setRespondentGender] = useState<'Feminino' | 'Masculino' | 'Outro'>('Feminino');
  const [phone, setPhone] = useState('');
  const [householdSize, setHouseholdSize] = useState<number>(5);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; accuracy?: number } | undefined>(undefined);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Step 2: Crops & Soil
  const [primaryCrops, setPrimaryCrops] = useState<string[]>(['Milho', 'Mandioca', 'Feijão Nhemba']);
  const [totalAreaHa, setTotalAreaHa] = useState<number>(1.5);
  const [estimatedYieldKg, setEstimatedYieldKg] = useState<number>(1800);
  const [seedSource, setSeedSource] = useState<FieldSurveyRecord['seedSource']>('SDAE / CITT');
  const [soilType, setSoilType] = useState<FieldSurveyRecord['soilType']>('Franco-Arenoso');

  // Step 3: Resilience, Water & Challenges
  const [irrigationAccess, setIrrigationAccess] = useState<FieldSurveyRecord['irrigationAccess']>('Sequeiro (Chuva)');
  const [conservationPractices, setConservationPractices] = useState<string[]>([
    'Mulching (Cobertura Morta)',
    'Consórcio Cereal + Leguminosa'
  ]);
  const [mainChallenges, setMainChallenges] = useState<string[]>(['Seca / Veranicos Prolongados']);
  const [harvestDestination, setHarvestDestination] =
    useState<FieldSurveyRecord['harvestDestination']>('Consumo + Venda Local');

  // Step 4: Notes & Interviewer
  const [interviewerName, setInterviewerName] = useState('Técnico Extensionista / Inquiridor');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedDistrictMeta = useMemo(() => {
    return (
      INHAMBANE_DISTRICTS_CATALOG.find(d => d.district === district) ||
      INHAMBANE_DISTRICTS_CATALOG[0]
    );
  }, [district]);

  const handleDistrictChange = (newDistrict: InhambaneDistrict) => {
    setDistrict(newDistrict);
    const meta = INHAMBANE_DISTRICTS_CATALOG.find(d => d.district === newDistrict);
    if (meta && meta.localities.length > 0) {
      setLocality(meta.localities[0]);
    }
  };

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      setGpsCoords({ ...selectedDistrictMeta.defaultCoords, accuracy: 18 });
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGpsCoords({
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5)),
          accuracy: Math.round(pos.coords.accuracy)
        });
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
        setGpsCoords({ ...selectedDistrictMeta.defaultCoords, accuracy: 15 });
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const toggleItem = (list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handleNext = () => {
    setValidationError(null);
    if (step === 1 && !respondentName.trim()) {
      setValidationError('Indique o nome do(a) produtor(a) ou agregado inquirido.');
      return;
    }
    if (step === 2 && primaryCrops.length === 0) {
      setValidationError('Selecione pelo menos uma cultura agrícola cultivada.');
      return;
    }
    if (step < 4) setStep((step + 1) as 1 | 2 | 3 | 4);
  };

  const handleSave = async () => {
    setSaving(true);
    setValidationError(null);

    const record = await FieldSurveyService.saveSurvey(
      {
        district,
        locality: locality.trim() || `${district}-Sede`,
        communityOrAssociation: communityOrAssociation.trim() || 'Machamba Familiar',
        respondentName: respondentName.trim(),
        respondentGender,
        phone: phone.trim() || 'Não informado',
        householdSize: Number(householdSize) || 1,
        gpsCoords,
        primaryCrops,
        totalAreaHa: Number(totalAreaHa) || 1,
        estimatedYieldKg: Number(estimatedYieldKg) || 0,
        seedSource,
        soilType,
        irrigationAccess,
        conservationPractices,
        mainChallenges,
        harvestDestination,
        notes: notes.trim(),
        interviewerName: interviewerName.trim() || 'Inquiridor de Campo'
      },
      isOnline
    );

    setSaving(false);
    setSavedRecord(record);
    if (onSurveySaved) onSurveySaved(record);
  };

  const handleResetAndClose = () => {
    setSavedRecord(null);
    setStep(1);
    setRespondentName('');
    setPhone('');
    setCommunityOrAssociation('');
    setNotes('');
    setValidationError(null);
    onClose();
  };

  const handleStartAnother = () => {
    setSavedRecord(null);
    setStep(1);
    setRespondentName('');
    setPhone('');
    setNotes('');
    setValidationError(null);
  };

  return (
    <AriaModal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title="Inquérito de Campo Agrícola · Android Offline"
      maxWidth="max-w-2xl"
    >
      {savedRecord ? (
        <div className="space-y-4 py-2">
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 text-center space-y-2.5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#065f46] text-white flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-8 h-8 text-[#3ddc84]" />
            </div>
            <h3 className="font-display text-xl font-black text-stone-950 dark:text-white">
              Inquérito Registado com Sucesso!
            </h3>
            <p className="text-xs text-stone-700 dark:text-stone-300 max-w-md mx-auto">
              Dados de <strong>{savedRecord.respondentName}</strong> ({savedRecord.district} · {savedRecord.locality}) guardados no aplicativo.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white dark:bg-stone-900 border border-emerald-400 text-emerald-800 dark:text-emerald-300">
              {savedRecord.syncStatus === 'sincronizado' ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sincronizado com o servidor SDAE/CITT</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>Guardado Offline no Android (Sincroniza quando houver rede)</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={handleStartAnother}
              className="flex-1 py-3 px-4 rounded-xl bg-[#065f46] hover:bg-[#022c22] text-white text-xs font-black transition-all shadow-sm"
            >
              + Recolher Novo Inquérito
            </button>
            <button
              type="button"
              onClick={handleResetAndClose}
              className="py-3 px-4 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold"
            >
              Ver Lista de Dados
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Offline / Online & Progress Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#065f46] text-white flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-5 h-5 text-[#3ddc84]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-stone-950 dark:text-stone-50">
                  Recolha de Dados · Passo {step} de 4
                </h3>
                <p className="text-[11px] text-stone-600 dark:text-stone-400">
                  {district} ({selectedDistrictMeta.zoneType})
                </p>
              </div>
            </div>

            <span
              className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                isOnline
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
              }`}
            >
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isOnline ? 'Online (Sync automático)' : 'Offline (Guarda no Android)'}</span>
            </span>
          </div>

          {/* Stepper Bar */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 1, label: '1. Local & GPS' },
              { id: 2, label: '2. Culturas' },
              { id: 3, label: '3. Práticas' },
              { id: 4, label: '4. Confirmar' }
            ].map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (s.id < step || respondentName.trim()) setStep(s.id as 1 | 2 | 3 | 4);
                }}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-black text-center transition-all ${
                  step === s.id
                    ? 'bg-[#065f46] text-white shadow-xs'
                    : step > s.id
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {validationError && (
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* STEP 1: LOCATION & RESPONDENT */}
          {step === 1 && (
            <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Distrito (Província de Inhambane) *
                  </label>
                  <select
                    value={district}
                    onChange={e => handleDistrictChange(e.target.value as InhambaneDistrict)}
                    className="w-full px-3 py-2.5 text-xs font-bold rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-950 dark:text-stone-50 outline-none focus:border-emerald-700"
                  >
                    {INHAMBANE_DISTRICTS_CATALOG.map(entry => (
                      <option key={entry.district} value={entry.district}>
                        {entry.district} ({entry.zoneType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Localidade / Posto Administrativo *
                  </label>
                  <input
                    type="text"
                    value={locality}
                    onChange={e => setLocality(e.target.value)}
                    placeholder="Ex: Pembe, Chizapela..."
                    className="w-full px-3 py-2.5 text-xs rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-950 dark:text-stone-50 outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              {/* Quick Locality Chips */}
              <div>
                <span className="text-[10px] font-bold text-stone-500 block mb-1">
                  Toque rápido nas localidades de {district}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDistrictMeta.localities.map(loc => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocality(loc)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                        locality === loc
                          ? 'bg-[#065f46] text-white border-[#065f46]'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-emerald-600'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Nome do(a) Produtor(a) Inquirido(a) *
                  </label>
                  <input
                    type="text"
                    value={respondentName}
                    onChange={e => setRespondentName(e.target.value)}
                    placeholder="Ex: Joana Macamo"
                    className="w-full px-3 py-2.5 text-xs rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-950 dark:text-stone-50 outline-none focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Associação / Comunidade
                  </label>
                  <input
                    type="text"
                    value={communityOrAssociation}
                    onChange={e => setCommunityOrAssociation(e.target.value)}
                    placeholder="Ex: Associação 25 de Junho"
                    className="w-full px-3 py-2.5 text-xs rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-950 dark:text-stone-50 outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Género
                  </label>
                  <select
                    value={respondentGender}
                    onChange={e => setRespondentGender(e.target.value as any)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-950 dark:text-stone-50"
                  >
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Agregado
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={householdSize}
                    onChange={e => setHouseholdSize(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-950 dark:text-stone-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Telemóvel
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="84/87..."
                    className="w-full px-2.5 py-2 text-xs rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-950 dark:text-stone-50"
                  />
                </div>
              </div>

              {/* GPS Box */}
              <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-stone-950 dark:text-stone-100 block">
                      Ponto GPS da Machamba (Offline OK)
                    </span>
                    <span className="text-[11px] text-stone-600 dark:text-stone-400">
                      {gpsCoords
                        ? `Lat: ${gpsCoords.lat}, Lng: ${gpsCoords.lng} (±${gpsCoords.accuracy}m)`
                        : 'Toque para gravar coordenadas exatas'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCaptureGps}
                  disabled={gpsLoading}
                  className="px-3 py-2 rounded-xl bg-[#065f46] hover:bg-[#022c22] text-white text-xs font-black flex items-center gap-1.5 shrink-0"
                >
                  <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                  <span>{gpsCoords ? 'Atualizar' : 'Capturar GPS'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CROPS & SOIL */}
          {step === 2 && (
            <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-[11px] font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                  Culturas Cultivadas na Época Atual (Selecione várias) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SURVEY_CROPS_LIST.map(crop => {
                    const selected = primaryCrops.includes(crop);
                    return (
                      <button
                        key={crop}
                        type="button"
                        onClick={() => toggleItem(primaryCrops, setPrimaryCrops, crop)}
                        className={`p-2.5 rounded-xl text-left text-xs font-bold border-2 transition-all flex items-center justify-between ${
                          selected
                            ? 'bg-[#065f46] text-white border-[#065f46] shadow-xs'
                            : 'bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700 hover:border-emerald-600'
                        }`}
                      >
                        <span className="truncate">{crop}</span>
                        <span className="ml-1 text-[11px]">{selected ? '✓' : '+'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Área Total Cultivada (Hectares)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.1"
                    max="200"
                    value={totalAreaHa}
                    onChange={e => setTotalAreaHa(parseFloat(e.target.value) || 0.5)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-950 dark:text-stone-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Colheita Estimada (kg)
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    value={estimatedYieldKg}
                    onChange={e => setEstimatedYieldKg(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-950 dark:text-stone-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Tipo de Solo Predominante
                  </label>
                  <select
                    value={soilType}
                    onChange={e => setSoilType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-950 dark:text-stone-50"
                  >
                    <option value="Arenoso Claro">Arenoso Claro</option>
                    <option value="Franco-Arenoso">Franco-Arenoso (Homoíne)</option>
                    <option value="Baixa / Aluvial">Baixa Húmida / Aluvial</option>
                    <option value="Duna Costeira">Duna Costeira</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Origem Principal da Semente
                  </label>
                  <select
                    value={seedSource}
                    onChange={e => setSeedSource(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-950 dark:text-stone-50"
                  >
                    <option value="SDAE / CITT">Distribuída pelo SDAE / CITT</option>
                    <option value="Semente Própria/Local">Semente Própria / Guardada</option>
                    <option value="Associação Agrária">Associação Agrária Local</option>
                    <option value="Mercado / Feira">Compra em Mercado / Feira</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: RESILIENCE & CHALLENGES */}
          {step === 3 && (
            <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Sistema de Água / Rega
                  </label>
                  <select
                    value={irrigationAccess}
                    onChange={e => setIrrigationAccess(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-950 dark:text-stone-50"
                  >
                    <option value="Sequeiro (Chuva)">Sequeiro (Apenas Chuva)</option>
                    <option value="Baixa Húmidas">Baixa Húmida Natural</option>
                    <option value="Regadio Manual">Regadio Manual (Regador/Poço)</option>
                    <option value="Bomba / Gota-a-Gota">Motobomba / Gota-a-Gota</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Destino da Colheita
                  </label>
                  <select
                    value={harvestDestination}
                    onChange={e => setHarvestDestination(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-950 dark:text-stone-50"
                  >
                    <option value="Autoconsumo Familiar">Autoconsumo Familiar</option>
                    <option value="Consumo + Venda Local">Consumo + Venda nas Feiras</option>
                    <option value="Comercialização Associativa">Comercialização Associativa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                  Práticas de Agricultura de Conservação Adotadas:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CONSERVATION_PRACTICES_LIST.map(practice => {
                    const active = conservationPractices.includes(practice);
                    return (
                      <button
                        key={practice}
                        type="button"
                        onClick={() => toggleItem(conservationPractices, setConservationPractices, practice)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          active
                            ? 'bg-emerald-800 text-white border-emerald-800'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}
                        {practice}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                  Principais Pragas e Desafios Reportados:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {FIELD_CHALLENGES_LIST.map(challenge => {
                    const active = mainChallenges.includes(challenge);
                    return (
                      <button
                        key={challenge}
                        type="button"
                        onClick={() => toggleItem(mainChallenges, setMainChallenges, challenge)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          active
                            ? 'bg-amber-700 text-white border-amber-700'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}
                        {challenge}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & SAVE */}
          {step === 4 && (
            <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs space-y-2">
                <div className="flex items-center justify-between font-black text-emerald-950 dark:text-emerald-200">
                  <span>Resumo do Inquérito</span>
                  <span>
                    {district} · {locality}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-700 dark:text-stone-300">
                  <div>
                    <strong>Produtor(a):</strong> {respondentName} ({respondentGender})
                  </div>
                  <div>
                    <strong>Área / Produção:</strong> {totalAreaHa} ha · {estimatedYieldKg} kg
                  </div>
                  <div className="col-span-2">
                    <strong>Culturas:</strong> {primaryCrops.join(', ')}
                  </div>
                  <div className="col-span-2">
                    <strong>Práticas Resilientes:</strong>{' '}
                    {conservationPractices.length > 0 ? conservationPractices.join(', ') : 'Nenhuma declarada'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Nome do Inquiridor / Extensionista
                </label>
                <input
                  type="text"
                  value={interviewerName}
                  onChange={e => setInterviewerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-950 dark:text-stone-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Observações de Campo e Recomendações
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Registe detalhes sobre o estado das culturas, necessidades de sementes ou pragas..."
                  className="w-full px-3 py-2 text-xs rounded-xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-950 dark:text-stone-50"
                />
              </div>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as 1 | 2 | 3 | 4)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
            ) : (
              <span className="text-[11px] text-stone-500">Funciona offline no iPhone, iPad e Android</span>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="min-h-[40px] px-5 py-2.5 rounded-xl bg-[#065f46] hover:bg-[#022c22] text-white text-xs font-black flex items-center gap-1.5 shadow-sm"
              >
                <span>Continuar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="min-h-[40px] px-5 py-2.5 rounded-xl bg-[#065f46] hover:bg-[#022c22] text-white text-xs font-black flex items-center gap-2 shadow-md disabled:opacity-60"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{saving ? 'A guardar...' : isOnline ? 'Guardar e Sincronizar' : 'Guardar Offline no Dispositivo'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </AriaModal>
  );
};
