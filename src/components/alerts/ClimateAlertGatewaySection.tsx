import React, { useState, useEffect, useMemo } from 'react';
import {
  Send,
  CloudLightning,
  Wind,
  Sun,
  CloudRain,
  Phone,
  MessageCircle,
  UserPlus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import {
  AlertChannel,
  AlertDispatchLog,
  AlertSubscriber,
  ClimateAlertService,
  ClimateAlertType,
  DirectRecipientLink,
  DistrictClimateCheckResult,
  GatewayCapabilities
} from '../../services/climateAlertService';
import { INHAMBANE_DISTRICTS_CATALOG } from '../../services/fieldSurveyService';
import { InhambaneDistrict } from '../../types/mobileApp';

interface ClimateAlertGatewaySectionProps {
  onShowToast?: (msg: string, type?: 'success' | 'info') => void;
}

export const ClimateAlertGatewaySection: React.FC<ClimateAlertGatewaySectionProps> = ({
  onShowToast
}) => {
  const [loading, setLoading] = useState(true);
  const [gateway, setGateway] = useState<GatewayCapabilities | null>(null);
  const [subscribers, setSubscribers] = useState<AlertSubscriber[]>([]);
  const [dispatchLogs, setDispatchLogs] = useState<AlertDispatchLog[]>([]);

  // Live Open-Meteo check state
  const [monitorDistrict, setMonitorDistrict] = useState<InhambaneDistrict>('Homoíne');
  const [checkingClimate, setCheckingClimate] = useState(false);
  const [climateResult, setClimateResult] = useState<DistrictClimateCheckResult | null>(null);

  // Alert composer state
  const [targetDistrict, setTargetDistrict] = useState<string>('Homoíne');
  const [alertType, setAlertType] = useState<ClimateAlertType>('seca');
  const [severity, setSeverity] = useState<'Crítico' | 'Alerta' | 'Preventivo'>('Alerta');
  const [channel, setChannel] = useState<AlertChannel>('ambos');
  const [message, setMessage] = useState<string>(
    'ALERTA AGRO Homoíne: Previsão de calor e baixa humidade nos próximos dias. Aplique mulching nas linhas e regue antes das 08h30.'
  );
  const [dispatching, setDispatching] = useState(false);
  const [lastDirectLinks, setLastDirectLinks] = useState<DirectRecipientLink[]>([]);

  // New subscriber form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDistrict, setNewDistrict] = useState<InhambaneDistrict>('Homoíne');
  const [newLocality, setNewLocality] = useState('Homoíne-Sede');
  const [newCrop, setNewCrop] = useState('Milho');
  const [newChannel, setNewChannel] = useState<AlertChannel>('ambos');
  const [addingSub, setAddingSub] = useState(false);

  const detectedOp = useMemo(
    () => (newPhone.trim().length >= 2 ? ClimateAlertService.detectLocalOperator(newPhone) : null),
    [newPhone]
  );

  const loadOverview = async () => {
    try {
      const data = await ClimateAlertService.fetchOverview();
      setGateway(data.gateway);
      setSubscribers(data.subscribers);
      setDispatchLogs(data.dispatchLogs);
    } catch {
      onShowToast?.('Não foi possível carregar o histórico de alertas do servidor.', 'info');
    } finally {
      setLoading(false);
    }
  };

  const runClimateCheck = async (dist: InhambaneDistrict) => {
    setCheckingClimate(true);
    try {
      const result = await ClimateAlertService.checkDistrictClimate(dist);
      setClimateResult(result);
    } catch {
      onShowToast?.('Erro ao consultar previsão climática Open-Meteo.', 'info');
    } finally {
      setCheckingClimate(false);
    }
  };

  useEffect(() => {
    loadOverview();
    runClimateCheck('Homoíne');
  }, []);

  const matchingRecipientsCount = useMemo(() => {
    return subscribers.filter(s => {
      if (!s.active) return false;
      const matchDist = targetDistrict === 'Todos (Província)' || s.district === targetDistrict;
      if (!matchDist) return false;
      if (channel === 'ambos') return true;
      return s.channel === 'ambos' || s.channel === channel;
    }).length;
  }, [subscribers, targetDistrict, channel]);

  const handleApplyHazardTemplate = (
    hazardType: ClimateAlertType,
    hazardSeverity: 'Crítico' | 'Alerta' | 'Preventivo',
    suggestedText: string
  ) => {
    setAlertType(hazardType);
    setSeverity(hazardSeverity);
    setTargetDistrict(monitorDistrict);
    setMessage(suggestedText);
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setDispatching(true);
    try {
      const res = await ClimateAlertService.dispatchAlert({
        district: targetDistrict,
        alertType,
        severity,
        message,
        channel
      });
      setLastDirectLinks(res.directLinks);
      setDispatchLogs(prev => [res.log, ...prev]);
      onShowToast?.(
        `Campanha registada para ${res.log.totalRecipients} produtor(es) via ${res.log.providerUsed}.`,
        'success'
      );
    } catch (err) {
      onShowToast?.((err as Error).message, 'info');
    } finally {
      setDispatching(false);
    }
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingSub(true);
    try {
      const created = await ClimateAlertService.addSubscriber({
        name: newName,
        phone: newPhone,
        district: newDistrict,
        locality: newLocality,
        crop: newCrop,
        channel: newChannel
      });
      setSubscribers(prev => [created, ...prev]);
      setNewName('');
      setNewPhone('');
      onShowToast?.(
        `Produtor ${created.name} (${created.operator}) subscrito aos alertas!`,
        'success'
      );
    } catch (err) {
      onShowToast?.((err as Error).message, 'info');
    } finally {
      setAddingSub(false);
    }
  };

  const handleToggleSub = async (sub: AlertSubscriber) => {
    try {
      const updated = await ClimateAlertService.toggleSubscriberActive(sub.id, !sub.active);
      setSubscribers(prev => prev.map(s => (s.id === sub.id ? updated : s)));
    } catch {
      onShowToast?.('Erro ao atualizar estado do produtor.', 'info');
    }
  };

  const handleDeleteSub = async (id: string) => {
    try {
      await ClimateAlertService.deleteSubscriber(id);
      setSubscribers(prev => prev.filter(s => s.id !== id));
      onShowToast?.('Contacto removido da lista de alertas.', 'info');
    } catch {
      onShowToast?.('Erro ao remover contacto.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Gateway Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#022c22] text-white border border-emerald-700/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-emerald-300">
            <span>Gateway Climático · Vodacom · Tmcel · Movitel &amp; WhatsApp</span>
            <span aria-hidden="true" className="opacity-50">
              ·
            </span>
            <span className="text-emerald-100">
              {gateway?.smsGatewayConfigured || gateway?.whatsappGatewayConfigured
                ? 'API Externa Ativa no Servidor'
                : 'Envio Direto WhatsApp / SIM + Fila Segura'}
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">
            Alertas Climáticos Automáticos por SMS &amp; WhatsApp
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
            Avalie em tempo real o risco de ciclone, rajadas fortes ou seca prolongada nos 14 distritos de Inhambane e envie avisos diretos para os telemóveis dos produtores registados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs tabular-nums shrink-0">
          <div>
            <span className="text-emerald-300 block text-[11px]">Produtores Ativos</span>
            <strong className="text-xl font-extrabold">
              {subscribers.filter(s => s.active).length}
            </strong>
          </div>
          <div aria-hidden="true" className="h-8 w-px bg-emerald-700" />
          <div>
            <span className="text-emerald-300 block text-[11px]">Campanhas Enviadas</span>
            <strong className="text-xl font-extrabold">{dispatchLogs.length}</strong>
          </div>
        </div>
      </div>

      {/* Section 1: Live Open-Meteo Hazard Scanner + Alert Composer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Live Climate Risk Scanner (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Monitor de Risco Climático (Open-Meteo)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Deteta ciclones, rajadas (&ge; 42 km/h) e veranicos de 7 dias
              </p>
            </div>
            <button
              type="button"
              onClick={() => runClimateCheck(monitorDistrict)}
              disabled={checkingClimate}
              aria-label="Atualizar previsão climática"
              className="min-h-[38px] px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkingClimate ? 'animate-spin' : ''}`} />
              <span>Verificar</span>
            </button>
          </div>

          <div>
            <label htmlFor="climate-district-select" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
              Distrito Monitorizado:
            </label>
            <select
              id="climate-district-select"
              value={monitorDistrict}
              onChange={e => {
                const dist = e.target.value as InhambaneDistrict;
                setMonitorDistrict(dist);
                runClimateCheck(dist);
              }}
              className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-bold text-stone-900 dark:text-stone-100"
            >
              {INHAMBANE_DISTRICTS_CATALOG.map(d => (
                <option key={d.district} value={d.district}>
                  {d.district} ({d.zoneType})
                </option>
              ))}
            </select>
          </div>

          {climateResult && (
            <>
              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-2 text-xs tabular-nums">
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700">
                  <span className="text-[10px] text-stone-500 flex items-center gap-1">
                    <Wind className="w-3 h-3" /> Rajadas Máx
                  </span>
                  <strong className="text-sm text-stone-900 dark:text-white">
                    {climateResult.metrics.maxGustsKmH} km/h
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700">
                  <span className="text-[10px] text-stone-500 flex items-center gap-1">
                    <CloudRain className="w-3 h-3" /> Chuva 7 dias
                  </span>
                  <strong className="text-sm text-stone-900 dark:text-white">
                    {climateResult.metrics.total7dRainMm} mm
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700">
                  <span className="text-[10px] text-stone-500 flex items-center gap-1">
                    <Sun className="w-3 h-3" /> Temp / ET0
                  </span>
                  <strong className="text-sm text-stone-900 dark:text-white">
                    {climateResult.metrics.maxTempC}°C · {climateResult.metrics.avgEt0Mm}
                  </strong>
                </div>
              </div>

              {/* Detected Hazards */}
              <div className="space-y-2.5">
                {climateResult.hazards.map((h, idx) => {
                  const isCritical = h.severity === 'Crítico';
                  const isWarn = h.severity === 'Alerta';
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border space-y-2 text-xs ${
                        isCritical
                          ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                          : isWarn
                            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                            : 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                          {isCritical ? (
                            <CloudLightning className="w-4 h-4 text-rose-600 shrink-0" />
                          ) : isWarn ? (
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                          )}
                          <span>{h.title}</span>
                        </div>
                        <span
                          className={`text-[10px] font-extrabold shrink-0 ${
                            isCritical
                              ? 'text-rose-700 dark:text-rose-300'
                              : isWarn
                                ? 'text-amber-800 dark:text-amber-300'
                                : 'text-emerald-800 dark:text-emerald-300'
                          }`}
                        >
                          {h.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-700 dark:text-stone-300">
                        {h.metricSummary}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleApplyHazardTemplate(h.type, h.severity, h.suggestedSms)}
                        className="min-h-[36px] px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-white text-white dark:text-stone-950 text-[11px] font-bold hover:opacity-90"
                      >
                        Carregar Mensagem para Envio
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right: SMS & WhatsApp Dispatch Form (7 cols) */}
        <form
          onSubmit={handleDispatch}
          className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Disparar Aviso Climático (SMS · WhatsApp)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Roteamento automático por operadora moçambicana (+258 84/85 Vodacom, 82/83 Tmcel, 86/87 Movitel)
              </p>
            </div>
            <span className="text-xs font-bold text-[#065f46] dark:text-emerald-400 tabular-nums">
              {matchingRecipientsCount} destinatário(s) selecionado(s)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <label className="space-y-1">
              <span className="font-bold text-stone-700 dark:text-stone-300 block">Distrito Alvo</span>
              <select
                value={targetDistrict}
                onChange={e => setTargetDistrict(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-semibold"
              >
                <option value="Todos (Província)">Todos (Província de Inhambane)</option>
                {INHAMBANE_DISTRICTS_CATALOG.map(d => (
                  <option key={d.district} value={d.district}>
                    {d.district}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="font-bold text-stone-700 dark:text-stone-300 block">Tipo de Aviso</span>
              <select
                value={alertType}
                onChange={e => setAlertType(e.target.value as ClimateAlertType)}
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-semibold"
              >
                <option value="ciclone">Ciclone / Tempestade Tropical</option>
                <option value="rajadas">Rajadas de Vento Fortes</option>
                <option value="seca">Seca Prolongada / Veranico</option>
                <option value="chuva_intensa">Chuva Intensa / Inundação em Baixas</option>
                <option value="praga">Alerta Fitossanitário (Pragas)</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="font-bold text-stone-700 dark:text-stone-300 block">Canal de Envio</span>
              <select
                value={channel}
                onChange={e => setChannel(e.target.value as AlertChannel)}
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-semibold"
              >
                <option value="ambos">SMS + WhatsApp</option>
                <option value="sms">Apenas SMS (Vodacom/Tmcel/Movitel)</option>
                <option value="whatsapp">Apenas WhatsApp</option>
              </select>
            </label>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="alert-message-box" className="font-bold text-stone-700 dark:text-stone-300">
                Texto do Alerta (Português simples, máx. 480 carateres)
              </label>
              <span className="text-[11px] text-stone-500 tabular-nums">
                {message.length} / 480 carateres ({Math.max(1, Math.ceil(message.length / 160))} SMS)
              </span>
            </div>
            <textarea
              id="alert-message-box"
              rows={3}
              maxLength={480}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 outline-none focus:border-emerald-700"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-stone-600 dark:text-stone-400">Gravidade:</span>
              {(['Preventivo', 'Alerta', 'Crítico'] as const).map(sev => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverity(sev)}
                  className={`min-h-[34px] px-3 py-1 rounded-lg font-bold border transition-colors ${
                    severity === sev
                      ? sev === 'Crítico'
                        ? 'bg-rose-700 text-white border-rose-700'
                        : sev === 'Alerta'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-[#065f46] text-white border-[#065f46]'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={dispatching || matchingRecipientsCount === 0}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#065f46] hover:bg-[#022c22] disabled:opacity-40 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm whitespace-nowrap"
            >
              <Send className="w-4 h-4" />
              <span>
                {dispatching
                  ? 'A enviar alertas...'
                  : `Enviar para ${matchingRecipientsCount} Produtor(es)`}
              </span>
            </button>
          </div>

          {/* Direct 1-tap WhatsApp / SIM SMS Fallback Dispatch List after triggering */}
          {lastDirectLinks.length > 0 && (
            <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2.5 text-xs">
              <p className="font-bold text-emerald-950 dark:text-emerald-200">
                Envio direto rápido por WhatsApp / SMS no telemóvel ({lastDirectLinks.length}):
              </p>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {lastDirectLinks.map(link => (
                  <div
                    key={link.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-1.5 border-b border-emerald-200/70 dark:border-emerald-900/60 last:border-0"
                  >
                    <div>
                      <span className="font-bold text-stone-900 dark:text-white">{link.name}</span>
                      <span className="text-stone-500 dark:text-stone-400 ml-2 font-mono text-[11px]">
                        {link.phone} ({link.operator})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={link.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-[#25D366] hover:bg-[#1DA851] text-white font-bold text-[11px] flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={link.smsUrl}
                        className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-900 text-white font-bold text-[11px] flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>SMS SIM</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Section 2: Subscriber Registration & Management + Dispatch History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Subscribers List & Add Form (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Lista de Produtores Subscritos ({subscribers.length})
            </h3>
            <span className="text-xs text-stone-500">Vodacom · Tmcel · Movitel</span>
          </div>

          {/* Add New Subscriber Form */}
          <form
            onSubmit={handleAddSubscriber}
            className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3"
          >
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-[#065f46] dark:text-emerald-400" />
              <span>Registar Novo Produtor para Alertas</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <input
                type="text"
                required
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Nome do produtor"
                className="min-h-[40px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
              />
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  placeholder="+258 84/82/86/87..."
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono"
                />
                {detectedOp && (
                  <span className="absolute right-2.5 top-2.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                    {detectedOp}
                  </span>
                )}
              </div>
              <select
                value={newDistrict}
                onChange={e => setNewDistrict(e.target.value as InhambaneDistrict)}
                className="min-h-[40px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
              >
                {INHAMBANE_DISTRICTS_CATALOG.map(d => (
                  <option key={d.district} value={d.district}>
                    {d.district}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newLocality}
                onChange={e => setNewLocality(e.target.value)}
                placeholder="Localidade (ex: Pembe)"
                className="min-h-[40px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
              />
              <select
                value={newCrop}
                onChange={e => setNewCrop(e.target.value)}
                className="min-h-[40px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
              >
                <option value="Milho">Milho</option>
                <option value="Mandioca">Mandioca</option>
                <option value="Amendoim">Amendoim</option>
                <option value="Caju">Caju</option>
                <option value="Mapira">Mapira</option>
                <option value="Batata-Doce">Batata-Doce</option>
              </select>
              <div className="flex gap-2">
                <select
                  value={newChannel}
                  onChange={e => setNewChannel(e.target.value as AlertChannel)}
                  className="flex-1 min-h-[40px] px-2.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                >
                  <option value="ambos">SMS + WhatsApp</option>
                  <option value="sms">Só SMS</option>
                  <option value="whatsapp">Só WhatsApp</option>
                </select>
                <button
                  type="submit"
                  disabled={addingSub}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-[#065f46] hover:bg-[#022c22] text-white font-bold whitespace-nowrap"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </form>

          {/* Subscribers Table */}
          {loading ? (
            <p className="text-xs text-stone-500 py-4">A carregar subscritores...</p>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-800 max-h-72 overflow-y-auto pr-1">
              {subscribers.map(sub => (
                <div
                  key={sub.id}
                  className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="font-bold text-stone-900 dark:text-stone-100">
                      {sub.name}{' '}
                      <span className="font-mono font-normal text-stone-500 ml-1">{sub.phone}</span>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      {sub.district} ({sub.locality}) · {sub.crop} · {sub.operator} · Canal:{' '}
                      {sub.channel.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleSub(sub)}
                      className={`min-h-[34px] px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 border ${
                        sub.active
                          ? 'border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30'
                          : 'border-stone-300 dark:border-stone-700 text-stone-500'
                      }`}
                    >
                      {sub.active ? (
                        <ToggleRight className="w-4 h-4" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                      <span>{sub.active ? 'Ativo' : 'Pausado'}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Remover ${sub.name}`}
                      onClick={() => handleDeleteSub(sub.id)}
                      className="min-h-[34px] px-2 py-1 rounded-lg text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dispatch Logs History (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            Histórico de Alertas Disparados
          </h3>

          {dispatchLogs.length === 0 ? (
            <p className="text-xs text-stone-500 dark:text-stone-400 py-8 text-center">
              Nenhuma campanha climática disparada ainda. Utilize o painel acima para enviar o primeiro aviso.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {dispatchLogs.map(log => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2 font-bold">
                    <span className="text-stone-900 dark:text-white">
                      {log.district} · {log.severity}
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {log.totalRecipients} recetor(es)
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-700 dark:text-stone-300 leading-snug">
                    {log.message}
                  </p>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400 flex flex-wrap items-center justify-between gap-1 pt-1">
                    <span>{log.providerUsed}</span>
                    <span className="tabular-nums">
                      {new Date(log.createdAt).toLocaleString('pt-MZ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
