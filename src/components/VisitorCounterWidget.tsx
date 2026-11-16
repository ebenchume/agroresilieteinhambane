import React from 'react';
import { Eye, Users, Radio } from 'lucide-react';
import { useVisitorStats } from '../services/visitorTracker';

interface VisitorCounterWidgetProps {
  variant?: 'footer' | 'compact';
  sunlightMode?: boolean;
}

export const VisitorCounterWidget: React.FC<VisitorCounterWidgetProps> = ({
  variant = 'footer',
  sunlightMode = false,
}) => {
  const { totalVisits, uniqueVisitors, onlineNow, peakOnline, isConnected, isConnecting } =
    useVisitorStats();

  const formattedVisits = totalVisits.toLocaleString('pt-MZ');
  const formattedUnique = uniqueVisitors.toLocaleString('pt-MZ');
  const formattedOnline = onlineNow.toLocaleString('pt-MZ');
  const formattedPeak = peakOnline.toLocaleString('pt-MZ');

  if (variant === 'compact') {
    return (
      <div
        aria-live="polite"
        aria-label="Estatísticas de visitantes em tempo real"
        className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium ${
          sunlightMode
            ? 'text-yellow-300'
            : 'text-stone-600 dark:text-stone-300'
        }`}
      >
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={`w-2 h-2 rounded-full shrink-0 ${
              isConnected
                ? 'bg-emerald-500 animate-pulse'
                : isConnecting
                  ? 'bg-amber-400'
                  : 'bg-stone-400'
            }`}
          />
          <span
            className={`font-bold tabular-nums ${
              sunlightMode ? 'text-yellow-400' : 'text-stone-900 dark:text-white'
            }`}
          >
            {formattedOnline}
          </span>
          <span>
            {onlineNow === 1 ? 'visitante online ao vivo' : 'visitantes online ao vivo'}
          </span>
        </span>

        <span
          aria-hidden="true"
          className={sunlightMode ? 'text-yellow-400/50' : 'text-stone-300 dark:text-stone-700'}
        >
          ·
        </span>

        <span className="inline-flex items-center gap-1.5">
          <Eye
            className={`w-3.5 h-3.5 shrink-0 ${
              sunlightMode ? 'text-yellow-400' : 'text-emerald-700 dark:text-emerald-400'
            }`}
          />
          <span
            className={`font-bold tabular-nums ${
              sunlightMode ? 'text-yellow-400' : 'text-stone-900 dark:text-white'
            }`}
          >
            {formattedVisits}
          </span>
          <span>{totalVisits === 1 ? 'visita à página' : 'visitas à página'}</span>
        </span>
      </div>
    );
  }

  return (
    <section
      aria-live="polite"
      aria-label="Contador de visitantes e utilizadores online ao vivo"
      className="py-3.5 px-4 rounded-xl bg-stone-50 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            isConnected
              ? 'bg-emerald-500 animate-pulse'
              : isConnecting
                ? 'bg-amber-400'
                : 'bg-stone-400'
          }`}
        />
        <div className="text-xs">
          <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-stone-100">
            <Radio className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>
              {isConnected
                ? 'Monitorização ao vivo ligada (WebSocket)'
                : isConnecting
                  ? 'A ligar contador ao vivo...'
                  : 'Modo offline — retoma ao recuperar rede'}
            </span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Registo em tempo real de acessos em Inhambane e outros pontos
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-none mb-0.5">
              Online agora
            </p>
            <p className="font-extrabold text-sm tabular-nums text-emerald-800 dark:text-emerald-300 leading-none">
              {formattedOnline}{' '}
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                (pico: {formattedPeak})
              </span>
            </p>
          </div>
        </div>

        <div aria-hidden="true" className="hidden sm:block h-7 w-px bg-stone-200 dark:bg-stone-800" />

        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-none mb-0.5">
              Visitas à página
            </p>
            <p className="font-extrabold text-sm tabular-nums text-stone-900 dark:text-white leading-none">
              {formattedVisits}
            </p>
          </div>
        </div>

        <div aria-hidden="true" className="hidden sm:block h-7 w-px bg-stone-200 dark:bg-stone-800" />

        <div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-none mb-0.5">
            Dispositivos únicos
          </p>
          <p className="font-extrabold text-sm tabular-nums text-stone-900 dark:text-white leading-none">
            {formattedUnique}
          </p>
        </div>
      </div>
    </section>
  );
};
