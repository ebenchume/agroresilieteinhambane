import React, { useState, useEffect } from 'react';
import { AriaModal } from './AriaModal';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Download,
  Smartphone,
  Tablet,
  CheckCircle2,
  ShieldCheck,
  WifiOff,
  MapPin,
  ArrowRight,
  Share,
  PlusSquare,
  Copy,
  Check,
  FileCode2
} from 'lucide-react';

interface AndroidDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlatform?: 'ios' | 'android';
}

export const AndroidDownloadModal: React.FC<AndroidDownloadModalProps> = ({
  isOpen,
  onClose,
  initialPlatform
}) => {
  const {
    isInstalled,
    isIOS,
    isIPad,
    isIOSSafari,
    install,
    downloadIOSProfile,
    downloadAndroidPackage
  } = usePWAInstall();

  const [platformTab, setPlatformTab] = useState<'ios' | 'android'>(() => {
    if (initialPlatform) return initialPlatform;
    return isIOS ? 'ios' : 'android';
  });
  const [iosDeviceMode, setIosDeviceMode] = useState<'iphone' | 'ipad'>(() => (isIPad ? 'ipad' : 'iphone'));
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [installStatus, setInstallStatus] = useState<string | null>(null);

  useEffect(() => {
    if (initialPlatform) {
      setPlatformTab(initialPlatform);
    } else if (isIOS) {
      setPlatformTab('ios');
      setIosDeviceMode(isIPad ? 'ipad' : 'iphone');
    }
  }, [initialPlatform, isIOS, isIPad]);

  const handleAndroidInstallClick = async () => {
    setInstallStatus('A abrir instalador...');
    const result = await install();
    if (result === 'accepted') {
      setInstallStatus('Instalado com sucesso no seu Android.');
      setTimeout(() => onClose(), 1400);
    } else if (result === 'dismissed') {
      setInstallStatus('Instalação cancelada. Pode instalar mais tarde pelo menu do navegador.');
    } else {
      setInstallStatus('Siga os 3 passos abaixo no Google Chrome para fixar no ecrã inicial.');
    }
  };

  const handleDownloadIOSProfile = () => {
    setDownloading(true);
    setDownloadSuccess(null);
    setTimeout(() => {
      downloadIOSProfile();
      setDownloading(false);
      setDownloadSuccess(
        'Perfil iOS (.mobileconfig) descarregado. No iPhone/iPad, abra Definições > Perfil Transferido para instalar em ecrã completo.'
      );
    }, 450);
  };

  const handleDownloadApk = () => {
    setDownloading(true);
    setDownloadSuccess(null);
    setTimeout(() => {
      downloadAndroidPackage();
      setDownloading(false);
      setDownloadSuccess('Pacote Android offline descarregado com sucesso.');
    }, 550);
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
      title="Instalar App de Campo (iPhone, iPad & Android)"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Header Hero */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#022c22] text-white border border-emerald-700/60">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-300">
                <span>Aplicativo Oficial Offline</span>
                <span aria-hidden="true">·</span>
                <span>Versão 2.5</span>
              </div>
              <h3 className="font-display text-lg sm:text-xl font-extrabold text-white tracking-tight">
                AgroResiliente Inhambane · App de Campo
              </h3>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                Leve o caderno de campo, inquéritos dos 14 distritos de Inhambane e diagnóstico de culturas no seu telemóvel ou tablet sem precisar de rede contínua.
              </p>
            </div>

            {isInstalled && (
              <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-800 text-emerald-200 rounded-lg flex items-center gap-1 shrink-0">
                <Check className="w-3.5 h-3.5" />
                <span>Instalado</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-emerald-700/60 text-[11px] text-emerald-100">
            <div className="flex items-center gap-1.5">
              <WifiOff className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>Inquéritos Offline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>GPS de Machamba</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>CSV &amp; JSON SDAE</span>
            </div>
          </div>
        </div>

        {/* Platform Switcher Tabs: iOS (iPhone & iPad) vs Android */}
        <div
          role="tablist"
          aria-label="Escolher sistema operativo do dispositivo"
          className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
        >
          <button
            type="button"
            role="tab"
            aria-selected={platformTab === 'ios'}
            onClick={() => {
              setPlatformTab('ios');
              setInstallStatus(null);
              setDownloadSuccess(null);
            }}
            className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
              platformTab === 'ios'
                ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-white shadow-sm border border-stone-200 dark:border-stone-700'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            {/* Apple Silhouette Icon */}
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <span>iOS · iPhone &amp; iPad</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={platformTab === 'android'}
            onClick={() => {
              setPlatformTab('android');
              setInstallStatus(null);
              setDownloadSuccess(null);
            }}
            className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
              platformTab === 'android'
                ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-white shadow-sm border border-stone-200 dark:border-stone-700'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            {/* Android Silhouette Icon */}
            <svg className="w-4 h-4 fill-current shrink-0 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 2.23 12.95 2 12 2c-.96 0-1.86.23-2.66.63L7.85 1.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.3C6.71 4.22 5.5 6.01 5.5 8h13c0-1.99-1.21-3.78-2.97-4.84zM9 5.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75.75zm6 0c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75.75z" />
            </svg>
            <span>Android · Telemóvel &amp; Tablet</span>
          </button>
        </div>

        {/* Feedback Banners */}
        {(installStatus || downloadSuccess) && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{downloadSuccess || installStatus}</span>
          </div>
        )}

        {/* TAB 1: iOS (iPhone & iPad) */}
        {platformTab === 'ios' && (
          <div className="space-y-4">
            {/* Browser hint if iOS non-Safari */}
            {isIOS && !isIOSSafari && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                <strong>Dica para iOS:</strong> No iOS 16.4+, pode instalar pelo ícone Partilhar no Chrome/Edge ou abrir no <strong>Safari</strong> para melhor suporte offline.
              </div>
            )}

            {/* Sub-toggle: iPhone vs iPad */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Selecione o dispositivo Apple:
              </span>
              <div className="flex items-center gap-1 p-1 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <button
                  type="button"
                  onClick={() => setIosDeviceMode('iphone')}
                  className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    iosDeviceMode === 'iphone'
                      ? 'bg-[#065f46] text-white'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-950'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>iPhone</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIosDeviceMode('ipad')}
                  className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    iosDeviceMode === 'ipad'
                      ? 'bg-[#065f46] text-white'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-950'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>iPad</span>
                </button>
              </div>
            </div>

            {/* Step-by-step Safari Install Guide */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 space-y-3">
              <p className="text-xs font-extrabold text-stone-900 dark:text-stone-100">
                {iosDeviceMode === 'iphone'
                  ? 'Instalar no iPhone (iOS Safari em 3 toques):'
                  : 'Instalar no iPad (iPadOS Safari em 3 toques):'}
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-950 font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div className="pt-0.5">
                    <strong className="text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <span>Toque no botão Partilhar</span>
                      <Share className="w-3.5 h-3.5 text-sky-600 inline" />
                    </strong>
                    <p className="text-stone-600 dark:text-stone-400 mt-0.5 text-[11px]">
                      {iosDeviceMode === 'iphone'
                        ? 'Encontra-se na barra inferior central do Safari no iPhone.'
                        : 'Encontra-se no canto superior direito da barra de endereços do Safari no iPad.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-950 font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div className="pt-0.5">
                    <strong className="text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <span>Escolha &ldquo;Adicionar ao Ecrã Principal&rdquo;</span>
                      <PlusSquare className="w-3.5 h-3.5 text-emerald-600 inline" />
                    </strong>
                    <p className="text-stone-600 dark:text-stone-400 mt-0.5 text-[11px]">
                      Deslize o menu para baixo até ver a opção com o símbolo <strong>+</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#065f46] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div className="pt-0.5">
                    <strong className="text-stone-900 dark:text-stone-100">
                      Confirme em &ldquo;Adicionar&rdquo; no canto superior direito
                    </strong>
                    <p className="text-stone-600 dark:text-stone-400 mt-0.5 text-[11px]">
                      O ícone <strong>AgroInham</strong> abre em ecrã total nativo, guarda inquéritos em cache offline e usa o GPS do {iosDeviceMode === 'iphone' ? 'iPhone' : 'iPad'} no campo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Institutional iOS Web Clip Configuration Profile Download */}
            <button
              type="button"
              onClick={handleDownloadIOSProfile}
              disabled={downloading}
              className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-200 text-white dark:text-stone-950 font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <FileCode2 className="w-4 h-4 shrink-0" />
              <span>
                {downloading
                  ? 'A gerar perfil iOS...'
                  : 'Descarregar Perfil iPhone / iPad (.mobileconfig)'}
              </span>
            </button>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 text-center">
              O ficheiro <code className="font-mono">.mobileconfig</code> permite instalar como aplicação Web Clip gerida pelos técnicos SDAE em frotas de iPhone e iPad.
            </p>
          </div>
        )}

        {/* TAB 2: ANDROID */}
        {platformTab === 'android' && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleAndroidInstallClick}
              className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-[#065f46] hover:bg-[#022c22] text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2.5 group"
            >
              <Smartphone className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Instalar Aplicativo no Android (1 Toque)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            <button
              type="button"
              onClick={handleDownloadApk}
              disabled={downloading}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-stone-500 shrink-0" />
              <span>
                {downloading
                  ? 'A preparar pacote Android...'
                  : 'Descarregar Pacote Android (Offline Bundle)'}
              </span>
            </button>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 space-y-2.5 text-xs">
              <p className="font-extrabold text-stone-900 dark:text-stone-100">
                Instalação manual no Android (Google Chrome / Samsung Internet):
              </p>
              <ol className="space-y-1.5 text-[11px] text-stone-600 dark:text-stone-400 list-decimal list-inside">
                <li>Abra o portal no Google Chrome ou Samsung Internet.</li>
                <li>
                  Toque nos 3 pontinhos (<strong>⋮</strong>) no canto superior direito.
                </li>
                <li>
                  Selecione <strong>&ldquo;Instalar aplicativo&rdquo;</strong> ou <strong>&ldquo;Adicionar ao ecrã inicial&rdquo;</strong>.
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Footer Share URL Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-200 dark:border-stone-800 text-xs gap-2">
          <div className="text-[11px] text-stone-500 truncate">
            URL de campo: <span className="font-mono font-semibold text-stone-700 dark:text-stone-300">{typeof window !== 'undefined' ? window.location.host : 'agroresiliente.co.mz'}</span>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="min-h-[36px] px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold flex items-center gap-1.5 text-xs transition-colors shrink-0 whitespace-nowrap"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? 'Link Copiado!' : 'Copiar Link'}</span>
          </button>
        </div>
      </div>
    </AriaModal>
  );
};
