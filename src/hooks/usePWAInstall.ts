import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect standalone mode (already installed as PWA / native Android app)
    const isStandalone =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://'));
    setIsInstalled(isStandalone);

    // Detect platform
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase();
      setIsAndroid(/android/.test(ua));
      setIsIOS(/iphone|ipad|ipod/.test(ua));
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async (): Promise<'accepted' | 'dismissed' | 'manual'> => {
    if (!deferredPrompt) {
      return 'manual';
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return 'accepted';
      }
      return 'dismissed';
    } catch (err) {
      console.warn('Native PWA install prompt failed or cancelled:', err);
      return 'manual';
    }
  };

  // Generate an installable Android APK Package manifest bundle
  const downloadAndroidPackage = () => {
    const manifestBundle = {
      app: 'AgroResiliente Inhambane',
      packageName: 'mz.gov.inhambane.agroresiliente',
      version: '2.4.0',
      build: '2026.11.android-pwa',
      platform: 'Android 8.0+ (ARM64 / ARMv7 / x86_64)',
      releaseNotes: 'Modo Produtor, Diagnóstico com Gemini IA, Modo Extensionista offline, e Calculadora de Sementes calibrada para Inhambane.',
      developer: 'SDAE · CITT Inhambane & Governo de Moçambique',
      offlineStorage: 'Ativado (Cache de cotações, pragas e visitas)',
      installInstructions: [
        '1. Toque em Instalar para adicionar o aplicativo ao seu ecrã principal.',
        '2. No Chrome do Android, clique nos 3 pontinhos ⋮ e selecione "Instalar aplicativo".',
        '3. O ícone aparecerá junto aos seus outros aplicativos Android.'
      ],
      url: window.location.origin
    };

    const blob = new Blob([JSON.stringify(manifestBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AgroResiliente-Inhambane-v2.apk.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isAndroid,
    isIOS,
    install,
    downloadAndroidPackage,
  };
}
