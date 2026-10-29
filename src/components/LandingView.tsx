import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Fingerprint, 
  Smartphone, 
  TrendingUp, 
  CloudRain, 
  ArrowRight, 
  Download, 
  WifiOff, 
  CheckCircle2,
  Users,
  Compass,
  FileCheck
} from 'lucide-react';

interface LandingViewProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenTestRunner: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onOpenAuth,
  onOpenTestRunner
}) => {
  const [activeChannel, setActiveChannel] = useState<'ussd' | 'sms'>('ussd');
  const [ussdPath, setUssdPath] = useState('root');
  const [smsLog, setSmsLog] = useState<Array<{ text: string; direction: 'in' | 'out' }>>([
    { text: 'AgroResiliente: Bem-vindo a Homoíne. Envie PRECO milho, ALERTA, DICA solo ou AJUDA.', direction: 'in' }
  ]);
  const [smsInput, setSmsInput] = useState('');

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
    <div>
      {/* Hero Section */}
      <section className="pt-12 sm:pt-16 pb-16 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Messaging */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-wider uppercase">
                  Homoíne · Inhambane · Moçambique
                </span>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span className="text-xs text-stone-500">
                  Plataforma Digital Agrícola
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-[1.15]">
                Agricultura resiliente ao clima com informação, assistência técnica e mercados
              </h1>

              <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed max-w-xl">
                Uma plataforma segura e integrada para pequenos e médios produtores familiares. Acesso por USSD e SMS para telemóveis simples, e portal web moderno com autenticação biométrica, 2FA, modo escuro e exportação de relatórios em PDF.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm shadow-emerald-700/20 transition-all"
                >
                  <span>Entrar com Biometria & 2FA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-5 py-3 rounded-xl bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-xs sm:text-sm transition-colors"
                >
                  Criar Conta Grátis
                </button>

                <button
                  onClick={onOpenTestRunner}
                  className="px-4 py-3 rounded-xl text-stone-600 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Testes Automatizados</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 grid grid-cols-3 gap-4 text-left">
                <div>
                  <span className="font-display text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                    2.500+
                  </span>
                  <p className="text-[11px] text-stone-500 mt-0.5">Produtores no Piloto</p>
                </div>
                <div>
                  <span className="font-display text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    100%
                  </span>
                  <p className="text-[11px] text-stone-500 mt-0.5">Suporte Offline</p>
                </div>
                <div>
                  <span className="font-display text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                    MFA / 2FA
                  </span>
                  <p className="text-[11px] text-stone-500 mt-0.5">Proteção Bancária</p>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Phone Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-xs bg-stone-950 border-8 border-stone-800 rounded-[36px] p-5 shadow-2xl relative overflow-hidden">
                <div className="w-20 h-4 bg-stone-800 rounded-full mx-auto mb-4" />
                <div className="bg-stone-900 border border-stone-800/80 rounded-2xl p-4 min-h-[220px] text-emerald-400 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                  {ussdScreens[ussdPath] || ussdScreens.root}
                </div>

                {/* Keypad */}
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

                <div className="mt-3 text-center">
                  <span className="text-[10px] text-stone-500 font-mono">
                    USSD Simulado · Sem consumo de dados
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Authentication Pillar Section */}
      <section className="py-16 bg-stone-100/60 dark:bg-stone-900/40 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Segurança Robusta de Ponta a Ponta
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mt-1">
              Proteção moderna para cada produtor familiar
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-2">
              Privacidade dos dados das machambas, integração com M-Pesa e validação biométrica sem complicação.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Fingerprint className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100 mb-2">
                Biometria & Passkeys FIDO2
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Aceda com a impressão digital ou reconhecimento facial do seu telemóvel. Compatível com Touch ID, Face ID e sensores Android.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100 mb-2">
                Autenticação de 2 Factores (2FA)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Camada adicional de proteção com código TOTP de 6 dígitos, SMS para a rede Vodacom/Movitel e códigos de emergência para backup.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100 mb-2">
                Relatórios Oficiais em PDF
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Exporte certificados de segurança, códigos de emergência e boletins diários de cotações de mercado diretamente para PDF num clique.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Channel Switcher (USSD / SMS) Section */}
      <section className="py-16 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Canais Sem Internet
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mt-1">
                USSD (*123#) e SMS (123)
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
                Funciona em qualquer telemóvel simples sem consumir o saldo de dados.
              </p>
            </div>

            {/* Channel Tabs */}
            <div className="flex p-1 bg-stone-100 dark:bg-stone-800 rounded-xl self-start">
              <button
                onClick={() => setActiveChannel('ussd')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeChannel === 'ussd'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-500'
                }`}
              >
                Canal USSD *123#
              </button>
              <button
                onClick={() => setActiveChannel('sms')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeChannel === 'sms'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-500'
                }`}
              >
                Canal SMS 123
              </button>
            </div>
          </div>

          {activeChannel === 'ussd' ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
                  Navegação no Menu USSD
                </h3>
                <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                  Digite *123# no teclado de chamada para aceder a preços em tempo real de 12 culturas agrícolas nos mercados de Homoíne, Maxixe, Inhambane e Massinga.
                </p>
                <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Disponível 24/7 sem necessidade de internet</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Suporte em Português, Bitonga e Xitswa</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Contacto direto com extensionistas de campo</span>
                  </li>
                </ul>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold"
                  >
                    Entrar no Portal Web
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-full max-w-xs bg-stone-950 border-4 border-stone-800 rounded-3xl p-4 shadow-xl">
                  <div className="bg-stone-900 border border-stone-800 rounded-xl p-3 min-h-[170px] text-emerald-400 font-mono text-xs whitespace-pre-wrap">
                    {ussdScreens[ussdPath] || ussdScreens.root}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(k => (
                      <button
                        key={k}
                        onClick={() => handleUssdClick(k)}
                        className="p-2 rounded-lg bg-stone-900 text-stone-200 font-bold text-xs hover:bg-stone-800"
                      >
                        {k}
                      </button>
                    ))}
                    <button
                      onClick={() => handleUssdClick('0')}
                      className="col-span-3 p-2 rounded-lg bg-stone-900 text-stone-200 font-bold text-xs hover:bg-stone-800"
                    >
                      0 · Início
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
                  Consultas Rápidas por SMS
                </h3>
                <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                  Envie mensagens com palavras-chave simples para o número <strong>123</strong> e receba a resposta instantânea.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">PRECO milho</span>
                    <span className="text-stone-500">Cotação do milho em Homoíne e Maxixe</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">ALERTA</span>
                    <span className="text-stone-500">Avisos climáticos e risco de pragas</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">DICA solo</span>
                    <span className="text-stone-500">Técnicas de compostagem e mulching</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-full max-w-xs bg-stone-950 border-4 border-stone-800 rounded-3xl overflow-hidden shadow-xl flex flex-col">
                  <div className="p-2.5 bg-stone-900 border-b border-stone-800 text-center text-xs font-bold text-stone-200">
                    SMS · 123 (AgroResiliente)
                  </div>
                  <div className="p-3 h-48 overflow-y-auto space-y-2 text-xs bg-stone-950">
                    {smsLog.map((msg, i) => (
                      <div
                        key={i}
                        className={`max-w-[85%] p-2 rounded-xl text-xs ${
                          msg.direction === 'out'
                            ? 'ml-auto bg-emerald-700 text-white rounded-br-xs'
                            : 'mr-auto bg-stone-800 text-stone-200 rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                  </div>
                  <div className="p-2 bg-stone-900 border-t border-stone-800 flex gap-2">
                    <input
                      type="text"
                      value={smsInput}
                      onChange={e => setSmsInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSmsSend(); }}
                      placeholder="Ex: ALERTA"
                      className="flex-1 px-3 py-1 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 outline-none"
                    />
                    <button
                      onClick={() => handleSmsSend()}
                      className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
