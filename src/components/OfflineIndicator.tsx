import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, CheckCircle2, CloudUpload } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { FieldSurveyService } from '../services/fieldSurveyService';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState<number>(() => FieldSurveyService.getPendingCount());
  const [syncing, setSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState<number | null>(null);

  useEffect(() => {
    const refreshPending = () => {
      setPendingCount(FieldSurveyService.getPendingCount());
    };

    window.addEventListener(FieldSurveyService.SURVEY_UPDATED_EVENT, refreshPending);
    window.addEventListener('storage', refreshPending);
    return () => {
      window.removeEventListener(FieldSurveyService.SURVEY_UPDATED_EVENT, refreshPending);
      window.removeEventListener('storage', refreshPending);
    };
  }, []);

  const handleQuickSync = async () => {
    if (!isOnline || syncing) return;
    setSyncing(true);
    const res = await FieldSurveyService.syncPendingSurveys();
    setSyncing(false);
    if (!res.failed && res.syncedCount > 0) {
      setPendingCount(FieldSurveyService.getPendingCount());
      setJustSynced(res.syncedCount);
      setTimeout(() => setJustSynced(null), 3000);
    }
  };

  if (isOnline && pendingCount === 0 && justSynced === null) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 max-w-[calc(100vw-2rem)]">
      {!isOnline && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-amber-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-xl border border-amber-400">
          <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
          <span>
            Modo Offline — Inquéritos guardados no Android ({pendingCount} pendentes).
          </span>
        </div>
      )}

      {isOnline && pendingCount > 0 && (
        <button
          type="button"
          onClick={handleQuickSync}
          disabled={syncing}
          className="flex items-center gap-2.5 rounded-2xl bg-[#022c22] hover:bg-[#065f46] px-3.5 py-2.5 text-xs font-bold text-white shadow-xl border border-emerald-500/60 transition-all"
        >
          {syncing ? (
            <RefreshCw className="w-4 h-4 text-[#3ddc84] animate-spin shrink-0" />
          ) : (
            <CloudUpload className="w-4 h-4 text-[#3ddc84] shrink-0" />
          )}
          <span>
            {syncing
              ? 'A sincronizar inquéritos...'
              : `Rede restaurada: Sincronizar ${pendingCount} inquérito(s)`}
          </span>
        </button>
      )}

      {justSynced !== null && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-800 px-3.5 py-2 text-xs font-bold text-white shadow-xl border border-emerald-500">
          <CheckCircle2 className="w-4 h-4 text-[#3ddc84] shrink-0" />
          <span>{justSynced} inquérito(s) sincronizado(s) com o servidor!</span>
        </div>
      )}
    </div>
  );
};
