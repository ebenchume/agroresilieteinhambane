import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Smartphone,
  Tablet,
  Sprout,
  ClipboardList,
  ClipboardCheck,
  Compass,
  Ruler,
  Map as MapIcon,
  Send
} from 'lucide-react';
import { CropFiguresGallery } from './CropFiguresGallery';
import { ProducerMode } from './producer/ProducerMode';
import { ExtensionistMode } from './extensionist/ExtensionistMode';
import { FieldDataCollectionSection } from './field/FieldDataCollectionSection';
import { MachambaAreaMeasureSection } from './field/MachambaAreaMeasureSection';
import { ProvincialPestAreaMapSection } from './field/ProvincialPestAreaMapSection';
import { ClimateAlertGatewaySection } from './alerts/ClimateAlertGatewaySection';
import { AndroidDownloadModal } from './AndroidDownloadModal';
import { VisitorCounterWidget } from './VisitorCounterWidget';
import { MobileService } from '../services/mobileService';
import { UserProfileType } from '../types/mobileApp';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface LandingViewProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenTestRunner: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onOpenTestRunner
}) => {
  const { isIOS } = usePWAInstall();
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [installPlatform, setInstallPlatform] = useState<'ios' | 'android' | undefined>(undefined);

  // Mobile Profile Selector State ('produtor' | 'extensionista' | 'inquiridor' | 'medicao')
  const [userProfile, setUserProfile] = useState<UserProfileType>(() => MobileService.getUserProfile());
  const [sunlightMode, setSunlightMode] = useState<boolean>(() => MobileService.getSunlightMode());
  const [provincialTab, setProvincialTab] = useState<'map' | 'alerts'>('map');

  // USSD / SMS interactive state
  const [activeChannel, setActiveChannel] = useState<'ussd' | 'sms'>('ussd');
  const [ussdPath, setUssdPath] = useState('root');
  const [smsLog, setSmsLog] = useState<Array<{ text: string; direction: 'in' | 'out' }>>([
    { text: 'AgroResiliente: Bem-vindo a Inhambane. Envie PRECO milho, ALERTA, DICA solo ou AJUDA.', direction: 'in' }
  ]);
  const [smsInput, setSmsInput] = useState('');

  const galleryRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const handleSelectProfile = (profile: UserProfileType) => {
    setUserProfile(profile);
    MobileService.setUserProfile(profile);
  };

  const handleToggleSunlight = () => {
    const next = !sunlightMode;
    setSunlightMode(next);
    MobileService.setSunlightMode(next);
  };

  const handleOpenInstaller = (platform?: 'ios' | 'android') => {
    setInstallPlatform(platform);
    setInstallModalOpen(true);
  };

  const handleScrollToGallery = () => {
    galleryRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const ussdScreens: Record<string, string> = {
    root: `*123#\nAgroResiliente Inhambane\n1. Precos de Mercado\n2. Alertas Diarios\n3. Boas Praticas\n4. Falar com Extensionista\n5. Vender / Comprar\n6. Minha Conta`,
    '1': `Preços de Mercado (MT/kg)\n1. Mandioca   2. Milho\n3. Amendoim   4. Feijão\n5. Mapira     6. Caju\n0. Voltar`,
    '1.1': `Mandioca\nMaxixe: 18–22 MT/kg\nHomoíne: 16–20 MT/kg\nInhambane: 20–25 MT/kg\nMassinga: 17–21 MT/kg\n0. Voltar`,
    '1.2': `Milho\nMaxixe: 28–35 MT/kg\nHomoíne: 25–32 MT/kg\nInhambane: 30–38 MT/kg\nMassinga: 27–34 MT/kg\n0. Voltar`,
    '1.3': `Amendoim\nMaxixe: 55–70 MT/kg\nHomoíne: 50–65 MT/kg\nInhambane: 60–75 MT/kg\n0. Voltar`,
    '2': `Alertas Homoíne-Sede:\n• Chuva moderada amanhã\n• Sem risco de pragas\n• Vento fraco a moderado\n(Entre na conta para alertas da sua zona)\n0. Voltar`,
    '3': `Boas Práticas:\n1. Solo e fertilidade\n2. Água / mulching\n3. Sementes resistentes\n0. Voltar`,
    '4': `Pedido registado!\nUm extensionista contactá-lo-á em breve.\n0. Voltar`,
    '6': `Minha Conta\nFaça login no portal web para aceder a 2FA e relatórios PDF.\n1. Criar conta / Entrar\n0. Voltar`
  };

  const handleUssdClick = (key: string) => {
    if (key === '0') {
      setUssdPath('root');
      return;
    }
    const next = ussdPath === 'root' ? key : `${ussdPath}.${key}`;
    if (ussdScreens[next]) {
      setUssdPath(next);
    } else if (ussdScreens[key]) {
      setUssdPath(key);
    }
  };

  const handleSmsSend = (customText?: string) => {
    const text = (customText || smsInput).trim();
    if (!text) return;

    setSmsLog(prev => [...prev, { text, direction: 'out' }]);
    setSmsInput('');

    setTimeout(() => {
      const up = text.toUpperCase();
      let reply = 'Comandos disponíveis: PRECO milho, PRECO mandioca, ALERTA, DICA agua, AJUDA.';
      if (up.includes('PRECO') || up.includes('PREÇO')) {
        reply = 'Milho — Homoíne 25–32 MT/kg | Maxixe 28–35 | Inhambane 30–38 MT/kg.';
      } else if (up.includes('ALERTA')) {
        reply = 'Homoíne: Chuva moderada prevista para amanhã. Condições favoráveis à sementeira.';
      } else if (up.includes('DICA')) {
        reply = 'Dica AgroResiliente: Mulching reduz evaporação em 30–40%. Regue de manhã cedo.';
      }
      setSmsLog(prev => [...prev, { text: reply, direction: 'in' }]);
    }, 350);
  };

  return (
    <div className={`pb-24 md:pb-0 ${sunlightMode ? 'bg-black text-white min-h-screen' : ''}`}>
      {/* 1. HERO & PLATFORM SELECTOR */}
      <section
        className={`py-7 sm:py-10 border-b transition-colors ${
          sunlightMode
            ? 'bg-black border-yellow-400'
            : 'bg-white dark:bg-stone-900/60 border-stone-200 dark:border-stone-800'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          {/* Hero Split Row */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <p
                className={`text-xs font-bold tracking-wide ${
                  sunlightMode ? 'text-yellow-400' : 'text-[#065f46] dark:text-emerald-400'
                }`}
              >
                Homoíne · Panda · Maxixe · 14 Distritos de Inhambane
              </p>

              <h1
                className={`font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold tracking-tight leading-[1.12] [text-wrap:balance] ${
                  sunlightMode ? 'text-yellow-400' : 'text-stone-950 dark:text-white'
                }`}
              >
                AgroResiliente Inhambane
              </h1>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  sunlightMode ? 'text-stone-200 font-semibold' : 'text-stone-600 dark:text-stone-300'
                }`}
              >
                Plataforma agronómica de campo para produtores, extensionistas e brigadas de inquéritos — com diagnóstico por foto e operação offline no <strong>iPhone, iPad e Android</strong>.
              </p>

              <div className="pt-1">
                <VisitorCounterWidget variant="compact" sunlightMode={sunlightMode} />
              </div>
            </div>

            {/* Dedicated iOS & Android Field App Install Bar */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenInstaller('ios')}
                className={`min-h-[44px] px-4 py-2.5 text-xs font-bold rounded-xl border transition-colors flex items-center gap-2 whitespace-nowrap ${
                  sunlightMode
                    ? 'bg-yellow-400 text-black border-yellow-500 hover:bg-yellow-300 font-black'
                    : isIOS
                      ? 'bg-stone-950 hover:bg-stone-800 text-white border-stone-950 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-200 shadow-sm'
                      : 'bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-900 dark:text-white border-stone-300 dark:border-stone-700'
                }`}
              >
                <Tablet className="w-4 h-4 shrink-0" />
                <span>App iOS (iPhone / iPad)</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenInstaller('android')}
                className={`min-h-[44px] px-4 py-2.5 text-xs font-bold rounded-xl border transition-colors flex items-center gap-2 whitespace-nowrap ${
                  sunlightMode
                    ? 'bg-stone-900 text-yellow-400 border-yellow-400 hover:bg-stone-800 font-black'
                    : 'bg-[#065f46] hover:bg-[#022c22] text-white border-[#065f46] shadow-sm'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>App Android (Offline)</span>
              </button>
            </div>
          </div>

          {/* 3-COLUMN PROFILE WORKSPACE SELECTOR */}
          <div className="space-y-2.5 pt-2">
            <span
              className={`block text-xs font-bold ${
                sunlightMode ? 'text-yellow-400' : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Selecione o seu perfil de trabalho no terreno:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Profile 1: Sou Produtor */}
              <button
                type="button"
                onClick={() => handleSelectProfile('produtor')}
                className={`min-h-[72px] p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3.5 active:scale-[0.985] ${
                  userProfile === 'produtor'
                    ? sunlightMode
                      ? 'bg-yellow-400 text-black border-yellow-400 font-black shadow-md'
                      : 'bg-[#065f46] text-white border-[#065f46] shadow-md'
                    : sunlightMode
                      ? 'bg-stone-950 text-stone-200 border-stone-700 hover:border-yellow-400'
                      : 'bg-stone-50/70 dark:bg-stone-900 text-stone-900 dark:text-stone-100 border-stone-200 dark:border-stone-800 hover:border-emerald-600'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    userProfile === 'produtor'
                      ? sunlightMode
                        ? 'bg-black text-yellow-400'
                        : 'bg-white/15 text-white'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-[#065f46] dark:text-emerald-400'
                  }`}
                >
                  <Sprout className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm sm:text-base font-extrabold block leading-tight">
                    Sou Produtor
                  </span>
                  <span
                    className={`text-xs block mt-0.5 truncate ${
                      userProfile === 'produtor'
                        ? sunlightMode
                          ? 'text-stone-900 font-bold'
                          : 'text-emerald-100'
                        : 'text-stone-500 dark:text-stone-400'
                    }`}
                  >
                    Diagnóstico, agrónomo e seca
                  </span>
                </div>
              </button>

              {/* Profile 2: Sou Extensionista */}
              <button
                type="button"
                onClick={() => handleSelectProfile('extensionista')}
                className={`min-h-[72px] p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3.5 active:scale-[0.985] ${
                  userProfile === 'extensionista'
                    ? sunlightMode
                      ? 'bg-yellow-400 text-black border-yellow-400 font-black shadow-md'
                      : 'bg-sky-800 text-white border-sky-800 shadow-md'
                    : sunlightMode
                      ? 'bg-stone-950 text-stone-200 border-stone-700 hover:border-yellow-400'
                      : 'bg-stone-50/70 dark:bg-stone-900 text-stone-900 dark:text-stone-100 border-stone-200 dark:border-stone-800 hover:border-sky-600'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    userProfile === 'extensionista'
                      ? sunlightMode
                        ? 'bg-black text-yellow-400'
                        : 'bg-white/15 text-white'
                      : 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-400'
                  }`}
                >
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm sm:text-base font-extrabold block leading-tight">
                    Sou Extensionista
                  </span>
                  <span
                    className={`text-xs block mt-0.5 truncate ${
                      userProfile === 'extensionista'
                        ? sunlightMode
                          ? 'text-stone-900 font-bold'
                          : 'text-sky-100'
                        : 'text-stone-500 dark:text-stone-400'
                    }`}
                  >
                    Visitas SDAE, sementes e pragas
                  </span>
                </div>
              </button>

              {/* Profile 3: Inquéritos de Campo */}
              <button
                type="button"
                onClick={() => handleSelectProfile('inquiridor')}
                className={`min-h-[72px] p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3.5 active:scale-[0.985] ${
                  userProfile === 'inquiridor'
                    ? sunlightMode
                      ? 'bg-yellow-400 text-black border-yellow-400 font-black shadow-md'
                      : 'bg-[#022c22] text-white border-emerald-500 shadow-md'
                    : sunlightMode
                      ? 'bg-stone-950 text-stone-200 border-stone-700 hover:border-yellow-400'
                      : 'bg-stone-50/70 dark:bg-stone-900 text-stone-900 dark:text-stone-100 border-stone-200 dark:border-stone-800 hover:border-emerald-600'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    userProfile === 'inquiridor'
                      ? sunlightMode
                        ? 'bg-black text-yellow-400'
                        : 'bg-emerald-400 text-stone-950'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-[#065f46] dark:text-emerald-400'
                  }`}
                >
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm sm:text-base font-extrabold block leading-tight">
                    Inquéritos de Campo
                  </span>
                  <span
                    className={`text-xs block mt-0.5 truncate ${
                      userProfile === 'inquiridor'
                        ? sunlightMode
                          ? 'text-stone-900 font-bold'
                          : 'text-emerald-200'
                        : 'text-stone-500 dark:text-stone-400'
                    }`}
                  >
                    Recolha iOS / Android · 14 Distritos
                  </span>
                </div>
              </button>

              {/* Profile 4: Medir Área da Machamba */}
              <button
                type="button"
                onClick={() => handleSelectProfile('medicao')}
                className={`min-h-[72px] p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3.5 active:scale-[0.985] ${
                  userProfile === 'medicao'
                    ? sunlightMode
                      ? 'bg-yellow-400 text-black border-yellow-400 font-black shadow-md'
                      : 'bg-amber-800 text-white border-amber-700 shadow-md'
                    : sunlightMode
                      ? 'bg-stone-950 text-stone-200 border-stone-700 hover:border-yellow-400'
                      : 'bg-stone-50/70 dark:bg-stone-900 text-stone-900 dark:text-stone-100 border-stone-200 dark:border-stone-800 hover:border-amber-600'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    userProfile === 'medicao'
                      ? sunlightMode
                        ? 'bg-black text-yellow-400'
                        : 'bg-white/15 text-white'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400'
                  }`}
                >
                  <Ruler className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm sm:text-base font-extrabold block leading-tight">
                    Medir Machamba
                  </span>
                  <span
                    className={`text-xs block mt-0.5 truncate ${
                      userProfile === 'medicao'
                        ? sunlightMode
                          ? 'text-stone-900 font-bold'
                          : 'text-amber-100'
                        : 'text-stone-500 dark:text-stone-400'
                    }`}
                  >
                    Área por GPS, grelha e passos
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ACTIVE WORKSPACE */}
      <section ref={workspaceRef} className="py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {userProfile === 'produtor' ? (
            <ProducerMode
              sunlightMode={sunlightMode}
              onToggleSunlightMode={handleToggleSunlight}
              onOpenCropGallery={handleScrollToGallery}
            />
          ) : userProfile === 'extensionista' ? (
            <ExtensionistMode
              onOpenCropGallery={handleScrollToGallery}
              onOpenFieldSurveys={() => handleSelectProfile('inquiridor')}
            />
          ) : userProfile === 'medicao' ? (
            <MachambaAreaMeasureSection sunlightMode={sunlightMode} />
          ) : (
            <FieldDataCollectionSection />
          )}
        </div>
      </section>

      {/* 2B. PROVINCIAL PEST/AREA MAP & SMS/WHATSAPP CLIMATE GATEWAY */}
      <section className="py-10 border-t border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-[#065f46] dark:text-emerald-400">
                Monitorização Provincial · 14 Distritos de Inhambane
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-950 dark:text-white tracking-tight">
                Vigilância de Pragas, Áreas &amp; Alertas Climáticos
              </h2>
            </div>

            <div className="flex items-center p-1 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setProvincialTab('map')}
                className={`min-h-[40px] px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  provincialTab === 'map'
                    ? 'bg-[#065f46] text-white'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <MapIcon className="w-4 h-4" />
                <span>Mapa de Pragas &amp; Áreas</span>
              </button>
              <button
                type="button"
                onClick={() => setProvincialTab('alerts')}
                className={`min-h-[40px] px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  provincialTab === 'alerts'
                    ? 'bg-[#065f46] text-white'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Alertas SMS / WhatsApp</span>
              </button>
            </div>
          </div>

          {provincialTab === 'map' ? (
            <ProvincialPestAreaMapSection />
          ) : (
            <ClimateAlertGatewaySection />
          )}
        </div>
      </section>

      {/* 3. CROP FIGURES & BOTANICAL PROFILES GALLERY */}
      <div ref={galleryRef} className="max-w-6xl mx-auto px-4 sm:px-6 py-4 my-4">
        <CropFiguresGallery />
      </div>

      {/* 4. USSD & SMS SIMULATOR (FEATURE PHONES) */}
      <section className="py-12 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#065f46] dark:text-emerald-400">
                <Compass className="w-4 h-4 shrink-0" />
                <span>Inclusão Rural Multicanal</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-950 dark:text-white tracking-tight [text-wrap:balance]">
                Canal USSD *123# e SMS para Telemóveis Básicos
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed max-w-xl">
                Produtores sem smartphone ou sem dados móveis podem consultar cotações e alertas através do código USSD gratuito ou enviar comandos SMS em qualquer rede nacional (TMCEL, Vodacom e Movitel).
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveChannel('ussd')}
                  className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    activeChannel === 'ussd'
                      ? 'bg-[#065f46] text-white border-[#065f46]'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  Simulador USSD (*123#)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChannel('sms')}
                  className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    activeChannel === 'sms'
                      ? 'bg-[#065f46] text-white border-[#065f46]'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  Simulador SMS Interativo
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-xs bg-stone-950 border-8 border-stone-800 rounded-[36px] p-5 shadow-xl relative overflow-hidden">
                <div className="w-16 h-3.5 bg-stone-800 rounded-full mx-auto mb-4" />

                {activeChannel === 'ussd' ? (
                  <>
                    <div className="bg-stone-900 border border-stone-800/80 rounded-2xl p-4 min-h-[200px] text-emerald-400 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                      {ussdScreens[ussdPath] || ussdScreens.root}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {['1', '2', '3', '4', '5', '6'].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => handleUssdClick(n)}
                          className="min-h-[40px] p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 font-bold text-xs transition-colors border border-stone-800 tabular-nums"
                        >
                          {n}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleUssdClick('0')}
                        className="col-span-3 min-h-[40px] p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 font-bold text-xs transition-colors border border-stone-800"
                      >
                        0 · Início *123#
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-stone-900 rounded-2xl p-3 h-48 overflow-y-auto space-y-2 text-xs">
                      {smsLog.map((msg, i) => (
                        <div
                          key={i}
                          className={`p-2 rounded-xl max-w-[85%] text-[11px] leading-tight ${
                            msg.direction === 'out'
                              ? 'ml-auto bg-emerald-700 text-white'
                              : 'mr-auto bg-stone-800 text-stone-200'
                          }`}
                        >
                          {msg.text}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={smsInput}
                        onChange={e => setSmsInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSmsSend();
                        }}
                        placeholder="Ex: PRECO milho"
                        className="flex-1 px-2.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-white text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSmsSend()}
                        className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECURITY & INTEGRATED TESTING STRIP */}
      <section className="py-8 border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#065f46] dark:text-emerald-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-950 dark:text-stone-100">
                Segurança Biométrica e Conformidade WCAG AA
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Autenticação FIDO2 / Passkeys, Face ID no iPhone/iPad e navegação acessível por teclado.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenTestRunner}
            className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 transition-colors flex items-center gap-2 shrink-0 whitespace-nowrap"
          >
            <span>Executar Bateria de Testes</span>
          </button>
        </div>
      </section>

      {/* MOBILE BOTTOM THUMB BAR (iPhone, iPad Portrait & Android) */}
      <nav
        aria-label="Navegação rápida móvel"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 pb-safe"
      >
        <div className="grid grid-cols-5 items-center h-14 px-1">
          <button
            type="button"
            onClick={() => {
              handleSelectProfile('produtor');
              workspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-bold transition-colors ${
              userProfile === 'produtor'
                ? 'text-[#065f46] dark:text-emerald-400'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            <Sprout className="w-5 h-5 mb-0.5" />
            <span>Produtor</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleSelectProfile('extensionista');
              workspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-bold transition-colors ${
              userProfile === 'extensionista'
                ? 'text-sky-700 dark:text-sky-400'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            <ClipboardList className="w-5 h-5 mb-0.5" />
            <span>Extensão</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleSelectProfile('medicao');
              workspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-bold transition-colors ${
              userProfile === 'medicao'
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            <Ruler className="w-5 h-5 mb-0.5" />
            <span>Medir</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleSelectProfile('inquiridor');
              workspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-bold transition-colors ${
              userProfile === 'inquiridor'
                ? 'text-[#065f46] dark:text-emerald-400'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            <ClipboardCheck className="w-5 h-5 mb-0.5" />
            <span>Inquéritos</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenInstaller(isIOS ? 'ios' : 'android')}
            className="flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-bold text-stone-700 dark:text-stone-200 hover:text-[#065f46]"
          >
            <Smartphone className="w-5 h-5 mb-0.5" />
            <span>{isIOS ? 'App iOS' : 'Instalar'}</span>
          </button>
        </div>
      </nav>

      {/* Unified iOS & Android Field App Installer Modal */}
      <AndroidDownloadModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
        initialPlatform={installPlatform}
      />
    </div>
  );
};
