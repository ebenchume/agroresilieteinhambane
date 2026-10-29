import React, { useState } from 'react';
import { 
  Bell, 
  CloudRain, 
  TrendingUp, 
  ShieldAlert, 
  Info, 
  X, 
  Check, 
  Send,
  Smartphone
} from 'lucide-react';
import { AppNotification } from '../types/auth';
import { NotificationsService } from '../services/notifications';
import { StorageService } from '../services/storage';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onRefresh: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onRefresh
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'climate' | 'market'>('all');
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    return NotificationsService.getPermission();
  });

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const granted = await NotificationsService.requestPermission();
    setPermission(NotificationsService.getPermission());
    if (granted) {
      NotificationsService.sendPush('Notificações Ativadas', 'Irá receber alertas agronómicos e de cotações em tempo real.', 'system');
      onRefresh();
    }
  };

  const handleMarkAllRead = () => {
    StorageService.markAllNotificationsRead();
    onRefresh();
  };

  const handleSimulateAlert = (type: 'climate' | 'market' | 'security') => {
    if (type === 'climate') {
      NotificationsService.sendPush(
        'Alerta de Seca / Temperatura',
        'Ventos secos moderados previstos para amanhã em Maculuve e Homoíne-Sede. Recomendada irrigação matinal.',
        'climate'
      );
    } else if (type === 'market') {
      NotificationsService.sendPush(
        'Subida de Cotação: Amendoim',
        'O preço do amendoim subiu para 75 MT/kg no mercado de Inhambane-Cidade (+18% na semana).',
        'market'
      );
    } else {
      NotificationsService.sendPush(
        'Verificação de Segurança 2FA',
        'Novo acesso bem-sucedido via navegador autenticado em Homoíne.',
        'security'
      );
    }
    onRefresh();
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'climate') return n.type === 'climate';
    if (filter === 'market') return n.type === 'market';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end sm:items-start p-4 sm:p-6 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-sm sm:max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 max-h-[85vh] flex flex-col relative sm:mt-12"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
              Centro de Alertas & Push
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Browser Permission Banner */}
        {permission !== 'granted' && (
          <div className="my-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5">
            <Smartphone className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                Ativar Notificações no Dispositivo
              </p>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                Receba cotações do milho e alertas de pragas mesmo com a aba fechada.
              </p>
              <button
                onClick={handleRequestPermission}
                className="mt-2 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold rounded-lg shadow-xs transition-colors"
              >
                Permitir Alertas Push
              </button>
            </div>
          </div>
        )}

        {/* Simulation Quick Triggers */}
        <div className="my-2 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60">
          <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
            Simular Notificação Push em Tempo Real:
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleSimulateAlert('climate')}
              className="px-2 py-1 rounded-md bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 text-[10px] font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1"
            >
              <CloudRain className="w-3 h-3 text-sky-500" />
              <span>Clima</span>
            </button>
            <button
              onClick={() => handleSimulateAlert('market')}
              className="px-2 py-1 rounded-md bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 text-[10px] font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1"
            >
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span>Mercado</span>
            </button>
            <button
              onClick={() => handleSimulateAlert('security')}
              className="px-2 py-1 rounded-md bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 text-[10px] font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1"
            >
              <ShieldAlert className="w-3 h-3 text-amber-500" />
              <span>Segurança</span>
            </button>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 rounded-md font-medium text-xs ${filter === 'all' ? 'bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100' : 'text-stone-500'}`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2 py-1 rounded-md font-medium text-xs ${filter === 'unread' ? 'bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100' : 'text-stone-500'}`}
            >
              Não lidas
            </button>
            <button
              onClick={() => setFilter('climate')}
              className={`px-2 py-1 rounded-md font-medium text-xs ${filter === 'climate' ? 'bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100' : 'text-stone-500'}`}
            >
              Clima
            </button>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
          >
            Marcar lidas
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
          {filteredNotifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-400">
              Nenhuma notificação encontrada neste filtro.
            </div>
          ) : (
            filteredNotifications.map(n => (
              <div
                key={n.id}
                className={`p-3 rounded-xl border transition-colors ${
                  n.read
                    ? 'border-stone-100 dark:border-stone-800/60 bg-white dark:bg-stone-900/60 opacity-80'
                    : 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {n.type === 'climate' && <CloudRain className="w-4 h-4 text-sky-600" />}
                    {n.type === 'market' && <TrendingUp className="w-4 h-4 text-emerald-600" />}
                    {n.type === 'security' && <ShieldAlert className="w-4 h-4 text-amber-600" />}
                    {n.type === 'system' && <Info className="w-4 h-4 text-stone-500" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-stone-400 tabular-nums">
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
