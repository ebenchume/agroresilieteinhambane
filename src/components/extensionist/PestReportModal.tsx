import React, { useState } from 'react';
import { AriaModal } from '../AriaModal';
import { MobileService } from '../../services/mobileService';
import { DistrictPestAlert } from '../../types/mobileApp';
import { 
  Bug, 
  AlertTriangle, 
  Radio, 
  Send, 
  CheckCircle2, 
  Filter, 
  ShieldAlert, 
  MapPin, 
  TrendingUp,
  Flame,
  Check
} from 'lucide-react';

interface PestReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PestReportModal: React.FC<PestReportModalProps> = ({
  isOpen,
  onClose
}) => {
  const [alerts, setAlerts] = useState<DistrictPestAlert[]>(() => MobileService.getDistrictPestAlerts());
  const [selectedDistrict, setSelectedDistrict] = useState<string>('todos');
  const [broadcastAlert, setBroadcastAlert] = useState<DistrictPestAlert | null>(null);
  const [broadcastSent, setBroadcastSent] = useState(false);

  const filteredAlerts = selectedDistrict === 'todos'
    ? alerts
    : alerts.filter(a => a.district.toLowerCase() === selectedDistrict.toLowerCase());

  const handleSendBroadcast = (alertItem: DistrictPestAlert) => {
    setBroadcastAlert(alertItem);
    setBroadcastSent(false);

    setTimeout(() => {
      setBroadcastSent(true);
      setTimeout(() => {
        setBroadcastAlert(null);
        setBroadcastSent(false);
      }, 2500);
    }, 1000);
  };

  return (
    <AriaModal
      isOpen={isOpen}
      onClose={onClose}
      title="Relatório Fitossanitário de Pragas na Zona"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Relatório de Pragas na Zona
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Rede de vigilância epidemiológica distrital de Inhambane
              </p>
            </div>
          </div>
        </div>

        {/* Broadcast Toast Feedback */}
        {broadcastAlert && (
          <div className="p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-pulse">
            <Radio className="w-4 h-4 text-emerald-700" />
            <span>
              {broadcastSent
                ? `Alerta SMS enviado com sucesso para 1.420 produtores em ${broadcastAlert.district}!`
                : `A transmitir alerta SMS para produtores de ${broadcastAlert.district} via TMCEL, Vodacom e Movitel...`}
            </span>
          </div>
        )}

        {/* District Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px] shrink-0">
            Filtrar Distrito:
          </span>
          {['todos', 'Panda', 'Massinga', 'Zavala', 'Homoíne', 'Maxixe'].map(d => (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDistrict(d)}
              className={`px-3 py-1 rounded-lg font-bold shrink-0 border transition-all ${
                selectedDistrict === d
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:bg-stone-200'
              }`}
            >
              {d === 'todos' ? 'Todos os Distritos' : d}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border-2 transition-all ${
                alert.severity === 'Crítico'
                  ? 'bg-red-50/80 dark:bg-red-950/30 border-red-300 dark:border-red-900'
                  : alert.severity === 'Alerta'
                    ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-900'
                    : 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-900'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      {alert.district} · Cultura: {alert.crop}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      alert.severity === 'Crítico'
                        ? 'bg-red-600 text-white'
                        : alert.severity === 'Alerta'
                          ? 'bg-amber-500 text-black'
                          : 'bg-emerald-600 text-white'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">
                    {alert.pestName}
                  </h4>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-stone-900 dark:text-stone-100">
                    {alert.affectedFarmsPercent}%
                  </span>
                  <span className="block text-[10px] text-stone-500">machambas afetadas</span>
                </div>
              </div>

              {/* Progress bar of affected farms */}
              <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-800 mt-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    alert.severity === 'Crítico'
                      ? 'bg-red-600'
                      : alert.severity === 'Alerta'
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                  }`}
                  style={{ width: `${alert.affectedFarmsPercent}%` }}
                />
              </div>

              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 mt-3 text-xs text-stone-700 dark:text-stone-300">
                <strong>Recomendação aos produtores:</strong> {alert.recommendation}
              </div>

              <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-stone-200 dark:border-stone-800 text-[11px]">
                <span className="text-stone-400">Atualizado: {alert.lastUpdated}</span>
                <button
                  type="button"
                  onClick={() => handleSendBroadcast(alert)}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Emitir Alerta SMS Comunitário</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AriaModal>
  );
};
