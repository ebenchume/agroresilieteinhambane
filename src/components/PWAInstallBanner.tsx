import React, { useState } from 'react';
import { Smartphone, Download, X, Check, ArrowRight } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AndroidDownloadModal } from './AndroidDownloadModal';

interface PWAInstallBannerProps {
  variant?: 'banner' | 'pill' | 'button';
  className?: string;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  variant = 'button',
  className = ''
}) => {
  const { isInstalled, isAndroid } = usePWAInstall();
  const [modalOpen, setModalOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (variant === 'pill') {
    return (
      <>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#064e3b] hover:bg-[#047857] text-[#3ddc84] hover:text-white border border-[#10b981]/40 text-xs font-bold transition-all shadow-xs group ${className}`}
          title="Instalar aplicativo para Android"
        >
          {/* Android Robot Icon */}
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 2.23 12.95 2 12 2c-.96 0-1.86.23-2.66.63L7.85 1.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.3C6.71 4.22 5.5 6.01 5.5 8h13c0-1.99-1.21-3.78-2.97-4.84zM9 5.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75.75zm6 0c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75.75z" />
          </svg>
          <span>Instalar Android</span>
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
        <div className="bg-gradient-to-r from-[#022c22] via-[#064e3b] to-[#047857] text-white px-4 py-2.5 border-b border-emerald-600/40 transition-all">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#3ddc84] text-stone-950 flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <p className="font-semibold text-emerald-50">
                <strong className="text-[#3ddc84] font-black">Aplicativo Android:</strong> Instale no telemóvel para aceder a diagnósticos de plantas e cotações na machamba sem internet!
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="px-3 py-1 rounded-lg bg-[#3ddc84] hover:bg-[#2bc870] text-stone-950 font-black text-xs transition-colors flex items-center gap-1 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar Grátis</span>
              </button>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="p-1 hover:bg-white/10 rounded-md text-emerald-200 transition-colors"
                title="Fechar aviso"
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
        className={`px-3.5 py-2 rounded-xl bg-[#064e3b] hover:bg-[#047857] text-[#3ddc84] hover:text-white border border-[#10b981]/50 text-xs font-bold transition-all flex items-center gap-2 shadow-xs group ${className}`}
      >
        <Smartphone className="w-4 h-4 text-[#3ddc84] group-hover:scale-110 transition-transform" />
        <span>Instalar no Android</span>
      </button>

      <AndroidDownloadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};
