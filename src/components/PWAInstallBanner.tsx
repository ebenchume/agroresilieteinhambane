import React, { useState } from 'react';
import { Smartphone, Download, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AndroidDownloadModal } from './AndroidDownloadModal';

interface PWAInstallBannerProps {
  variant?: 'banner' | 'pill' | 'button';
  className?: string;
}

const BANNER_DISMISSED_KEY = 'agro_pwa_banner_dismissed';

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  variant = 'button',
  className = ''
}) => {
  const { isInstalled, isIOS, isIPad } = usePWAInstall();
  const [modalOpen, setModalOpen] = useState(false);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(BANNER_DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (isInstalled) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(BANNER_DISMISSED_KEY, '1');
    } catch {}
  };

  const compactLabel = isIOS
    ? isIPad
      ? 'App iPad'
      : 'App iPhone'
    : 'App iOS / Android';

  if (variant === 'pill') {
    return (
      <>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={`inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-lg bg-[#064e3b] hover:bg-[#047857] text-white border border-emerald-500/40 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${className}`}
          title="Instalar aplicativo de campo no iPhone, iPad ou Android"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <span>{compactLabel}</span>
        </button>

        <AndroidDownloadModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </>
    );
  }

  if (variant === 'banner') {
    if (dismissed) return null;

    return (
      <>
        <div className="bg-[#022c22] text-white px-4 py-2 border-b border-emerald-700/50">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <Smartphone className="w-4 h-4 text-emerald-300 shrink-0" />
              <p className="font-medium text-emerald-50 truncate">
                <strong className="text-white font-bold">App de Campo iOS &amp; Android:</strong>{' '}
                Instale no iPhone, iPad ou Android para recolher inquéritos offline em Homoíne e Inhambane.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="px-3 py-1 rounded-md bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold text-xs transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>Instalar App</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1.5 hover:bg-white/10 rounded-md text-emerald-200 transition-colors"
                title="Fechar aviso"
                aria-label="Fechar aviso de instalação"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <AndroidDownloadModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`min-h-[40px] px-4 py-2 rounded-xl bg-[#064e3b] hover:bg-[#047857] text-white border border-emerald-600/50 text-xs font-bold transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${className}`}
      >
        <Smartphone className="w-4 h-4 text-emerald-300 shrink-0" />
        <span>Instalar App (iPhone / iPad / Android)</span>
      </button>

      <AndroidDownloadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};
