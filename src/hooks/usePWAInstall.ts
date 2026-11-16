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
  const [isIPad, setIsIPad] = useState(false);
  const [isIOSSafari, setIsIOSSafari] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect standalone mode (already installed as PWA on iOS, iPadOS, or Android)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');
    setIsInstalled(isStandalone);

    // Accurate platform detection including modern iPadOS desktop-class UA
    const ua = window.navigator.userAgent.toLowerCase();
    const isIPadDevice =
      /ipad/.test(ua) ||
      (window.navigator.platform === 'MacIntel' && (window.navigator.maxTouchPoints || 0) > 1);
    const isIPhoneDevice = /iphone|ipod/.test(ua);
    const iosDetected = isIPhoneDevice || isIPadDevice;
    const safariOnIOS =
      iosDetected &&
      /safari/.test(ua) &&
      !/crios|fxios|edgios|opios/.test(ua);

    setIsAndroid(/android/.test(ua));
    setIsIPad(isIPadDevice);
    setIsIOS(iosDetected);
    setIsIOSSafari(safariOnIOS);

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

  // Generate an installable Apple iOS / iPadOS Web Clip Configuration Profile (.mobileconfig)
  const downloadIOSProfile = () => {
    const origin = window.location.origin;
    const mobileConfigXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>FullScreen</key>
      <true/>
      <key>IgnoreManifestScope</key>
      <false/>
      <key>IsRemovable</key>
      <true/>
      <key>Label</key>
      <string>AgroInham</string>
      <key>PayloadDescription</key>
      <string>App de Campo Offline AgroResiliente Inhambane para iPhone e iPad (Homoine e 14 Distritos).</string>
      <key>PayloadDisplayName</key>
      <string>AgroResiliente Inhambane (Web Clip)</string>
      <key>PayloadIdentifier</key>
      <string>mz.gov.inhambane.agroresiliente.webclip</string>
      <key>PayloadOrganization</key>
      <string>SDAE &amp; CITT Inhambane</string>
      <key>PayloadType</key>
      <string>com.apple.webClip.managed</string>
      <key>PayloadUUID</key>
      <string>8F31E49B-39B1-47C5-B94D-202611160001</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
      <key>Precomposed</key>
      <true/>
      <key>URL</key>
      <string>${origin}</string>
    </dict>
  </array>
  <key>PayloadDescription</key>
  <string>Instala o aplicativo AgroResiliente Inhambane em ecra completo no iPhone e iPad com suporte a recolha de inqueritos offline e GPS de campo.</string>
  <key>PayloadDisplayName</key>
  <string>AgroResiliente Inhambane · iOS Field App</string>
  <key>PayloadIdentifier</key>
  <string>mz.gov.inhambane.agroresiliente.profile</string>
  <key>PayloadOrganization</key>
  <string>SDAE · CITT Inhambane, Mocambique</string>
  <key>PayloadRemovalDisallowed</key>
  <false/>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadUUID</key>
  <string>8F31E49B-39B1-47C5-B94D-202611160002</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
</dict>
</plist>`;

    const blob = new Blob([mobileConfigXml], { type: 'application/x-apple-aspen-config' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AgroResiliente-Inhambane-iOS.mobileconfig';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate an installable Android APK Package manifest bundle
  const downloadAndroidPackage = () => {
    const manifestBundle = {
      app: 'AgroResiliente Inhambane',
      packageName: 'mz.gov.inhambane.agroresiliente',
      version: '2.5.0',
      build: '2026.11.mobile-pwa',
      platform: 'Android 8.0+ (ARM64 / ARMv7 / x86_64)',
      releaseNotes: 'Recolha de inquéritos offline nos 14 distritos de Inhambane, Modo Produtor, Diagnóstico com Gemini IA, Modo Extensionista e Calculadora de Sementes.',
      developer: 'SDAE · CITT Inhambane & Governo de Moçambique',
      offlineStorage: 'Ativado (Cache de inquéritos, cotações, pragas e visitas)',
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
    a.download = 'AgroResiliente-Inhambane-v2.5.apk.json';
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
    isIPad,
    isIOSSafari,
    install,
    downloadIOSProfile,
    downloadAndroidPackage,
  };
}
