import React, { useState } from 'react';
import { AriaModal } from './AriaModal';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { 
  Download, 
  Smartphone, 
  CheckCircle2, 
  ShieldCheck, 
  WifiOff, 
  Sparkles, 
  ArrowRight, 
  Share2, 
  Copy, 
  Check, 
  QrCode,
  ExternalLink,
  Layers
} from 'lucide-react';

interface AndroidDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidDownloadModal: React.FC<AndroidDownloadModalProps> = ({
  isOpen,
  onClose
}) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install, downloadAndroidPackage } = usePWAInstall();
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [installStatus, setInstallStatus] = useState<string | null>(null);

  const handleInstallClick = async () => {
    setInstallStatus('A abrir instalador...');
    const result = await install();
    if (result === 'accepted') {
      setInstallStatus('Instalado com sucesso no seu Android!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else if (result === 'dismissed') {
      setInstallStatus('Instalação cancelada pelo utilizador.');
    } else {
      setInstallStatus('Siga o guia rápido abaixo para adicionar ao ecrã inicial.');
    }
  };

  const handleDownloadApk = () => {
    setDownloading(true);
    setTimeout(() => {
      downloadAndroidPackage();
      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    }, 700);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <AriaModal
      isOpen={isOpen}
      onClose={onClose}
      title="Baixar e Instalar no Android"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Header Hero with Android Mascot Badge */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#022c22] text-white border-2 border-emerald-600/40 relative overflow-hidden shadow-md">
          {/* Subtle Android glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#3ddc84]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              {/* Android Robot Icon */}
              <div className="w-12 h-12 rounded-2xl bg-[#3ddc84] text-stone-950 flex items-center justify-center font-black shadow-lg shadow-[#3ddc84]/25 shrink-0">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  {/* Android Robot Silhouette */}
                  <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 2.23 12.95 2 12 2c-.96 0-1.86.23-2.66.63L7.85 1.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.3C6.71 4.22 5.5 6.01 5.5 8h13c0-1.99-1.21-3.78-2.97-4.84zM9 5.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75.75zm6 0c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75.75z" />
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#3ddc84] text-stone-950">
                    Android APK / PWA
                  </span>
                  <span className="text-xs text-emerald-200">Versão 2.4.0</span>
                </div>
                <h3 className="font-display text-lg font-bold text-white mt-0.5">
                  AgroResiliente Inhambane
                </h3>
                <p className="text-xs text-emerald-100/90 leading-tight">
                  Aplicativo oficial para pequenos produtores e técnicos agrários.
                </p>
              </div>
            </div>

            {isInstalled && (
              <span className="text-[11px] font-bold px-2.5 py-1 bg-white/20 text-white rounded-full flex items-center gap-1 shrink-0">
                <Check className="w-3.5 h-3.5 text-[#3ddc84]" />
                <span>Instalado</span>
              </span>
            )}
          </div>

          {/* Quick Perks */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-emerald-500/30 text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-100">
              <WifiOff className="w-3.5 h-3.5 text-[#3ddc84]" />
              <span>Funciona Offline</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-100">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3ddc84]" />
              <span>Apenas 1.8 MB</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-100">
              <Sparkles className="w-3.5 h-3.5 text-[#3ddc84]" />
              <span>Gemini IA Grátis</span>
            </div>
          </div>
        </div>

        {installStatus && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{installStatus}</span>
          </div>
        )}

        {/* PRIMARY ACTION: Install on Android button */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#0b5e42] hover:bg-[#064e3b] text-white font-black text-sm shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2.5 group active:scale-[0.99] border-2 border-[#10b981]"
          >
            <div className="w-7 h-7 rounded-xl bg-[#3ddc84] text-stone-950 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <span>Instalar Aplicativo no Android (1 Toque)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Secondary Action: Direct APK / Manifest Download */}
          <button
            type="button"
            onClick={handleDownloadApk}
            disabled={downloading}
            className="w-full py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-900 text-stone-800 dark:text-stone-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Download className={`w-3.5 h-3.5 ${downloading ? 'animate-bounce text-emerald-600' : 'text-stone-500'}`} />
            <span>
              {downloading 
                ? 'A preparar pacote Android...' 
                : downloadSuccess 
                  ? 'Pacote Android (.apk) descarregado com sucesso!' 
                  : 'Descarregar Pacote Android (.apk / Offline Bundle)'}
            </span>
          </button>
        </div>

        {/* 3 Step Visual Guide for Android (Chrome / Samsung Internet) */}
        <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-2.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">
            Como instalar manualmente no telemóvel Android:
          </span>

          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#064e3b] text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong className="text-stone-900 dark:text-stone-100">Abra o navegador no telemóvel:</strong>
                <p className="text-stone-500 dark:text-stone-400 mt-0.5 text-[11px]">
                  Use o Google Chrome, Samsung Internet ou Firefox no seu telemóvel Android.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#064e3b] text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong className="text-stone-900 dark:text-stone-100">Toque nos 3 pontinhos (⋮):</strong>
                <p className="text-stone-500 dark:text-stone-400 mt-0.5 text-[11px]">
                  No canto superior direito, selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar ao ecrã principal"</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#064e3b] text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <div>
                <strong className="text-stone-900 dark:text-stone-100">Pronto para a machamba!</strong>
                <p className="text-stone-500 dark:text-stone-400 mt-0.5 text-[11px]">
                  O ícone do AgroResiliente fica gravado no seu telemóvel, abre em ecrã total e funciona sem internet!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Share / Copy link for Android users */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-800 text-xs">
          <div className="text-[11px] text-stone-500">
            Aceda no Android: <span className="font-mono font-semibold text-stone-700 dark:text-stone-300">agroresiliente.mz</span>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold flex items-center gap-1.5 text-xs transition-colors"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? 'Link Copiado!' : 'Copiar Link'}</span>
          </button>
        </div>
      </div>
    </AriaModal>
  );
};
