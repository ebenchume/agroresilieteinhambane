import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  ArrowRight, 
  Download, 
  WifiOff, 
  CheckCircle2,
  Users,
  Compass,
  FileCheck,
  Sprout,
  Sun,
  ClipboardList
} from 'lucide-react';
import { CropFiguresGallery } from './CropFiguresGallery';
import { ProducerMode } from './producer/ProducerMode';
import { ExtensionistMode } from './extensionist/ExtensionistMode';
import { MobileService } from '../services/mobileService';
import { UserProfileType } from '../types/mobileApp';

interface LandingViewProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenTestRunner: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onOpenAuth,
  onOpenTestRunner
}) => {
  // Mobile Profile Selector State ('produtor' | 'extensionista')
  const [userProfile, setUserProfile] = useState<UserProfileType>(() => MobileService.getUserProfile());
  const [sunlightMode, setSunlightMode] = useState<boolean>(() => MobileService.getSunlightMode());

  // USSD / SMS interactive state
  const [activeChannel, setActiveChannel] = useState<'ussd' | 'sms'>('ussd');
  const [ussdPath, setUssdPath] = useState('root');
  const [smsLog, setSmsLog] = useState<Array<{ text: string; direction: 'in' | 'out' }>>([
    { text: 'AgroResiliente: Bem-vindo a Inhambane. Envie PRECO milho, ALERTA, DICA solo ou AJUDA.', direction: 'in' }
  ]);
  const [smsInput, setSmsInput] = useState('');

  const galleryRef = useRef<HTMLDivElement>(null);

  const handleSelectProfile = (profile: UserProfileType) => {
    setUserProfile(profile);
    MobileService.setUserProfile(profile);
  };

  const handleToggleSunlight = () => {
    const next = !sunlightMode;
    setSunlightMode(next);
    MobileService.setSunlightMode(next);
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
    <div className={sunlightMode ? 'bg-black text-white min-h-screen' : ''}>
      {/* Top Mobile-First App Header & Profile Selection */}
      <section className={`py-6 sm:py-8 border-b transition-colors ${
        sunlightMode 
          ? 'bg-black border-yellow-400' 
          : 'bg-stone-50/80 dark:bg-stone-950/80 border-stone-200 dark:border-stone-800'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-5">
          {/* Main App Title & Tagline */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-black uppercase tracking-wider ${
                  sunlightMode ? 'text-yellow-400' : 'text-emerald-700 dark:text-emerald-400'
                }`}>
                  Homoíne · Panda · Maxixe · Inhambane
                </span>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span className="text-[11px] text-stone-500 font-medium">Web App Mobile-First</span>
              </div>
              <h1 className={`font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mt-1 ${
                sunlightMode ? 'text-yellow-400' : 'text-stone-900 dark:text-stone-100'
              }`}>
                AgroResiliente Inhambane
              </h1>
              <p className={`text-xs sm:text-sm mt-1 max-w-xl ${
                sunlightMode ? 'text-stone-200 font-semibold' : 'text-stone-600 dark:text-stone-400'
              }`}>
                Assistência agronómica inteligente, diagnóstico de plantas por IA do Gemini e ferramentas de campo para Moçambique.
              </p>
            </div>

            {/* Quick Access to Account */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors ${
                  sunlightMode
                    ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-black'
                    : 'border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                Entrar na Conta
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className={`px-3 py-2 text-xs font-bold rounded-xl shadow-xs transition-colors ${
                  sunlightMode
                    ? 'bg-yellow-400 text-black font-black hover:bg-yellow-300'
                    : 'bg-emerald-700 text-white hover:bg-emerald-800'
                }`}
              >
                Registo de Produtor
              </button>
            </div>
          </div>

          {/* TWO PRIMARY PROFILE BUTTONS: 'Sou Produtor' vs 'Sou Extensionista' */}
          <div className="pt-2">
            <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${
              sunlightMode ? 'text-yellow-400' : 'text-stone-700 dark:text-stone-300'
            }`}>
              Escolha o seu perfil de utilização:
            </label>

            <div className="grid grid-cols-2 gap-3 max-w-2xl">
              {/* Profile 1: Sou Produtor */}
              <button
                type="button"
                onClick={() => handleSelectProfile('produtor')}
                className={`p-3.5 sm:p-4 rounded-2xl border-3 text-left transition-all flex items-center gap-3 transform active:scale-98 shadow-sm ${
                  userProfile === 'produtor'
                    ? sunlightMode
                      ? 'bg-yellow-400 text-black border-yellow-400 font-black ring-4 ring-yellow-400/30'
                      : 'bg-emerald-700 text-white border-emerald-800 ring-4 ring-emerald-500/20 shadow-md'
                    : sunlightMode
                      ? 'bg-stone-900 text-stone-300 border-stone-700 hover:border-yellow-400'
                      : 'bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-800 hover:border-emerald-500'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  userProfile === 'produtor'
                    ? sunlightMode ? 'bg-black text-yellow-400' : 'bg-white/20 text-white'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                }`}>
                  <Sprout className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-extrabold block leading-tight">
                    Sou Produtor
                  </span>
                  <span className={`text-[11px] block mt-0.5 ${
                    userProfile === 'produtor'
                      ? sunlightMode ? 'text-stone-900 font-bold' : 'text-emerald-100'
                      : 'text-stone-500'
                  }`}>
                    Agricultor familiar na machamba
                  </span>
                </div>
              </button>

              {/* Profile 2: Sou Extensionista */}
              <button
                type="button"
                onClick={() => handleSelectProfile('extensionista')}
                className={`p-3.5 sm:p-4 rounded-2xl border-3 text-left transition-all flex items-center gap-3 transform active:scale-98 shadow-sm ${
                  userProfile === 'extensionista'
                    ? sunlightMode
                      ? 'bg-yellow-400 text-black border-yellow-400 font-black ring-4 ring-yellow-400/30'
                      : 'bg-sky-700 text-white border-sky-800 ring-4 ring-sky-500/20 shadow-md'
                    : sunlightMode
                      ? 'bg-stone-900 text-stone-300 border-stone-700 hover:border-yellow-400'
                      : 'bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-800 hover:border-sky-500'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  userProfile === 'extensionista'
                    ? sunlightMode ? 'bg-black text-yellow-400' : 'bg-white/20 text-white'
                    : 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400'
                }`}>
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-extrabold block leading-tight">
                    Sou Extensionista
                  </span>
                  <span className={`text-[11px] block mt-0.5 ${
                    userProfile === 'extensionista'
                      ? sunlightMode ? 'text-stone-900 font-bold' : 'text-sky-100'
                      : 'text-stone-500'
                  }`}>
                    Técnico SDAE / CITT no terreno
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVE MODE DISPLAY SECTION */}
      <section className="py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {userProfile === 'produtor' ? (
            <ProducerMode
              sunlightMode={sunlightMode}
              onToggleSunlightMode={handleToggleSunlight}
              onOpenCropGallery={handleScrollToGallery}
            />
          ) : (
            <ExtensionistMode
              onOpenCropGallery={handleScrollToGallery}
            />
          )}
        </div>
      </section>

      {/* CROP FIGURES & BOTANICAL PROFILES GALLERY */}
      <div ref={galleryRef}>
        <CropFiguresGallery />
      </div>

      {/* USSD & SMS Simulator Section (For feature phone compatibility) */}
      <section className="py-12 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Inclusão Rural Total
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
                Canal USSD *123# e SMS para Telemóveis Básicos
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Produtores sem smartphone ou sem dados de internet podem consultar cotações e alertas através do código USSD gratuito ou enviar comandos SMS para qualquer rede nacional (TMCEL, Vodacom e Movitel).
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveChannel('ussd')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    activeChannel === 'ussd'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  Simulador USSD (*123#)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChannel('sms')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    activeChannel === 'sms'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  Simulador SMS Interativo
                </button>
              </div>
            </div>

            {/* Interactive Simulator Phone */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-xs bg-stone-950 border-8 border-stone-800 rounded-[36px] p-5 shadow-2xl relative overflow-hidden">
                <div className="w-20 h-4 bg-stone-800 rounded-full mx-auto mb-4" />
                
                {activeChannel === 'ussd' ? (
                  <>
                    <div className="bg-stone-900 border border-stone-800/80 rounded-2xl p-4 min-h-[200px] text-emerald-400 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                      {ussdScreens[ussdPath] || ussdScreens.root}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {['1', '2', '3', '4', '5', '6'].map(n => (
                        <button
                          key={n}
                          onClick={() => handleUssdClick(n)}
                          className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 font-bold text-xs transition-colors border border-stone-800/80"
                        >
                          {n}
                        </button>
                      ))}
                      <button
                        onClick={() => handleUssdClick('0')}
                        className="col-span-3 p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 font-bold text-xs transition-colors border border-stone-800/80"
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
                        placeholder="Ex: PRECO milho"
                        className="flex-1 px-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-white text-xs outline-none"
                      />
                      <button
                        onClick={() => handleSmsSend()}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl"
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

      {/* Security & Integrated Testing CTA */}
      <section className="py-10 border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Segurança Biométrica e Autenticação Multifator
              </h4>
              <p className="text-[11px] text-stone-500">
                Padrão FIDO2/WebAuthn e conformidade com WCAG AA para navegação acessível.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenTestRunner}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors flex items-center gap-2 shrink-0"
          >
            <span>Executar Bateria de Testes CI/CD</span>
          </button>
        </div>
      </section>
    </div>
  );
};
