import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Fingerprint, 
  FileText, 
  Download, 
  TrendingUp, 
  CloudRain, 
  Smartphone, 
  KeyRound, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle,
  History,
  PhoneCall,
  UserCheck,
  CloudSun,
  Droplets,
  Sprout,
  Sparkles,
  ArrowRight,
  Calendar,
  MessageSquare,
  Users,
  Bug,
  Calculator,
  BarChart3
} from 'lucide-react';
import { User, AuditLog, MarketPrice } from '../types/auth';
import { StorageService } from '../services/storage';
import { PdfReportService } from '../services/pdfReport';
import { WeatherSection } from './WeatherSection';
import { WeatherService, WeatherData } from '../services/weather';
import { GeminiTipsSection } from './GeminiTipsSection';
import { CropCalendarSection } from './CropCalendarSection';
import { CropCalendarService } from '../services/cropCalendar';
import { CommunityForumSection } from './CommunityForumSection';
import { PestDiagnosticSection } from './PestDiagnosticSection';
import { FarmCalculatorSection } from './FarmCalculatorSection';
import { ProductivityChartSection } from './ProductivityChartSection';

interface DashboardProps {
  user: User;
  onUpdateUser: (updated: User) => void;
  onRequestBiometricSetup: () => void;
  marketPrices: MarketPrice[];
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onUpdateUser,
  onRequestBiometricSetup,
  marketPrices,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'productivity' | 'calendar' | 'gemini-tips' | 'pests' | 'calculator' | 'forum' | 'weather' | 'market' | 'security' | 'simulators'>('overview');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // USSD Simulator State
  const [ussdMenu, setUssdMenu] = useState('root');
  // SMS Simulator State
  const [smsThread, setSmsThread] = useState<Array<{ text: string; direction: 'in' | 'out' }>>([
    { text: `AgroResiliente: Olá, ${user.name.split(' ')[0]}. Alertas ativos para ${user.zone}. Envie PRECO, ALERTA, DICA ou AJUDA.`, direction: 'in' }
  ]);
  const [smsInput, setSmsInput] = useState('');

  // Handle 2FA toggle
  const handleToggle2FA = () => {
    const nextState = !user.twoFactorEnabled;
    const updated: User = {
      ...user,
      twoFactorEnabled: nextState,
      twoFactorSecret: nextState ? (user.twoFactorSecret || 'JBSWY3DPEHPK3PXP') : undefined
    };
    StorageService.saveUser(updated);
    StorageService.logAction(user.id, `2FA ${nextState ? 'Ativado' : 'Desativado'}`, 'success');
    onUpdateUser(updated);
    setAuditLogs(StorageService.getAuditLogs());
    onShowToast(`Autenticação de 2 Factores ${nextState ? 'ativada com sucesso' : 'desativada'}.`, 'success');
  };

  // Handle Remove Biometric
  const handleRemoveBiometric = () => {
    const updated: User = {
      ...user,
      biometricRegistered: false,
      biometricCredentialId: undefined,
      biometricDeviceName: undefined
    };
    StorageService.saveUser(updated);
    StorageService.logAction(user.id, 'Remoção de Credencial Biométrica', 'warning');
    onUpdateUser(updated);
    setAuditLogs(StorageService.getAuditLogs());
    onShowToast('Credencial biométrica removida da conta.', 'info');
  };

  // Generate new backup codes
  const handleRegenerateBackupCodes = () => {
    const newCodes = StorageService.generateBackupCodes();
    const updated: User = {
      ...user,
      backupCodes: newCodes
    };
    StorageService.saveUser(updated);
    StorageService.logAction(user.id, 'Geração de Novos Códigos de Emergência', 'success');
    onUpdateUser(updated);
    onShowToast('Novos códigos de emergência gerados.', 'success');
  };

  // Export PDF Security Report
  const handleExportSecurityPdf = () => {
    setIsExportingPdf(true);
    setTimeout(() => {
      try {
        const filename = PdfReportService.exportSecurityReport(user, auditLogs);
        onShowToast(`Relatório de Segurança ${filename} descarregado com sucesso!`, 'success');
      } catch (e) {
        console.error('PDF error:', e);
        onShowToast('Erro ao gerar relatório PDF.', 'info');
      } finally {
        setIsExportingPdf(false);
      }
    }, 400);
  };

  // Export PDF Market Report
  const handleExportMarketPdf = () => {
    setIsExportingPdf(true);
    setTimeout(() => {
      try {
        const filename = PdfReportService.exportMarketReport(user, marketPrices);
        onShowToast(`Boletim Agrícola ${filename} descarregado com sucesso!`, 'success');
      } catch (e) {
        console.error('PDF error:', e);
        onShowToast('Erro ao gerar boletim PDF.', 'info');
      } finally {
        setIsExportingPdf(false);
      }
    }, 400);
  };

  // Export PDF Weather Report
  const handleExportWeatherPdf = (customWeather?: WeatherData) => {
    setIsExportingPdf(true);
    setTimeout(async () => {
      try {
        const weather = customWeather || await WeatherService.fetchWeatherForLocation(user.zone);
        const filename = PdfReportService.exportWeatherReport(user, weather);
        onShowToast(`Boletim Meteorológico ${filename} descarregado com sucesso!`, 'success');
      } catch (e) {
        console.error('Weather PDF error:', e);
        onShowToast('Erro ao gerar boletim meteorológico em PDF.', 'info');
      } finally {
        setIsExportingPdf(false);
      }
    }, 400);
  };

  // USSD menus mapping
  const ussdContent: Record<string, string> = {
    root: `*123#\nAgroResiliente Inhambane\n1. Precos de Mercado\n2. Alertas Diarios\n3. Boas Praticas\n4. Falar com Extensionista\n5. Vender / Comprar\n6. Minha Conta`,
    '1': `Preços de Mercado\n1. Mandioca   2. Milho\n3. Amendoim   4. Feijão\n5. Mapira     6. Caju\n0. Voltar`,
    '1.1': `Mandioca\nMaxixe: 18–22 MT/kg\nHomoíne: 16–20 MT/kg\nInhambane: 20–25 MT/kg\n0. Voltar`,
    '1.2': `Milho\nMaxixe: 28–35 MT/kg\nHomoíne: 25–32 MT/kg\nInhambane: 30–38 MT/kg\n0. Voltar`,
    '2': `Alertas para ${user.name.split(' ')[0]} (${user.zone})\n• Chuva moderada amanhã\n• Sem risco de pragas esta semana\n• Cultura ${user.crop}: favorável\n0. Voltar`,
    '3': `Boas Práticas:\n1. Solo e fertilidade\n2. Rega gota-a-gota\n3. Sementes melhoradas\n0. Voltar`,
    '4': `Extensionista Registado:\nArsénio Matsinhe (+258 876 473 432)\nPedido de chamada enviado!\n0. Voltar`,
    '5': `Mercado / Propostas:\n• Proposta activa: Mandioca 200kg\n• Procura activa: Milho 500kg\n0. Voltar`,
    '6': `Minha Conta\nProdutor: ${user.name.split(' ')[0]}\nZona: ${user.zone}\nPlano: ${user.plan}\n2FA: ${user.twoFactorEnabled ? 'Activo' : 'Inactivo'}\n0. Voltar`
  };

  const handleUssdKey = (key: string) => {
    if (key === '0') {
      setUssdMenu('root');
      return;
    }
    const nextKey = ussdMenu === 'root' ? key : `${ussdMenu}.${key}`;
    if (ussdContent[nextKey]) {
      setUssdMenu(nextKey);
    } else if (ussdContent[key]) {
      setUssdMenu(key);
    }
  };

  // Handle SMS simulation
  const handleSendSms = (textToSend?: string) => {
    const raw = textToSend || smsInput;
    if (!raw.trim()) return;

    const outText = raw.trim();
    setSmsThread(prev => [...prev, { text: outText, direction: 'out' }]);
    setSmsInput('');

    setTimeout(() => {
      const upper = outText.toUpperCase();
      let reply = 'Comandos AgroResiliente: PRECO [cultura], ALERTA, DICA [tema], AJUDA.';
      
      if (upper.includes('PRECO') || upper.includes('PREÇO')) {
        reply = `Preço do ${user.crop} em Homoíne: 16–22 MT/kg. Maxixe: 28–35 MT/kg. Mercado estável.`;
      } else if (upper.includes('ALERTA')) {
        reply = `Alertas para ${user.name} (${user.zone}): Precipitação moderada prevista nas próximas 36h. Sem pragas ativas.`;
      } else if (upper.includes('DICA')) {
        reply = `Dica de Maneio: Mulching na machamba retém 35% mais humidade no solo arenoso de Inhambane.`;
      } else if (upper.includes('AJUDA')) {
        reply = `AgroResiliente SMS · 123. Dúvidas ligue grátis para o extensionista 876 473 432.`;
      }

      setSmsThread(prev => [...prev, { text: reply, direction: 'in' }]);
    }, 400);
  };

  // Handle Crop Calendar PDF export
  const handleExportCalendarPdf = () => {
    try {
      setIsExportingPdf(true);
      const cycles = CropCalendarService.getUserCycles(user.id, user.crop);
      const filename = PdfReportService.exportCropCalendarReport(user, cycles);
      onShowToast(`Calendário Agrícola descarregado com sucesso: ${filename}`, 'success');
    } catch (e) {
      console.error('Calendar PDF export error:', e);
      onShowToast('Erro ao exportar calendário agrícola em PDF.', 'info');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-stone-900 text-white shadow-xl relative overflow-hidden mb-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-300">
                Portal do Produtor AgroResiliente
              </span>
              <span className="text-white/40">·</span>
              <span className="text-xs text-emerald-200">
                {user.zone}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Olá, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-stone-200 mt-1 max-w-xl">
              Cultura Principal: <strong className="text-emerald-300">{user.crop}</strong> · Perfil: {user.type} · Telefone: {user.phone}
            </p>

            {/* Quick Demo Profile Switcher */}
            <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-2.5 border-t border-white/10 text-xs">
              <span className="text-[11px] text-emerald-200 font-medium">Trocar Perfil:</span>
              <div className="flex flex-wrap gap-1.5">
                {StorageService.getUsers().map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onUpdateUser(u);
                      onShowToast(`Sessão alternada para ${u.name} (${u.type})`, 'info');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                      u.id === user.id
                        ? 'bg-white text-emerald-950 font-bold shadow-xs'
                        : 'bg-white/15 hover:bg-white/25 text-white'
                    }`}
                  >
                    {u.name.split(' ')[0]} ({u.type === 'Extensionista' ? 'Extensionista SDAE' : u.crop})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick PDF Export Buttons */}
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={handleExportCalendarPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-2 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>Calendário de Cultivo (PDF)</span>
            </button>

            <button
              onClick={handleExportSecurityPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-2 rounded-xl bg-emerald-950/70 text-white hover:bg-emerald-900 text-xs font-semibold flex items-center gap-2 border border-emerald-500/40 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Segurança (PDF)</span>
            </button>

            <button
              onClick={() => handleExportWeatherPdf()}
              disabled={isExportingPdf}
              className="px-3.5 py-2 rounded-xl bg-emerald-950/70 text-white hover:bg-emerald-900 text-xs font-semibold flex items-center gap-2 border border-emerald-500/40 transition-all"
            >
              <CloudSun className="w-3.5 h-3.5 text-amber-400" />
              <span>Clima (PDF)</span>
            </button>

            <button
              onClick={handleExportMarketPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white border border-emerald-500/50 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Mercado (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-4 mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-emerald-700 text-white dark:bg-emerald-600'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Visão Geral</span>
        </button>

        <button
          onClick={() => setActiveTab('productivity')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'productivity'
              ? 'bg-emerald-700 text-white dark:bg-emerald-600 shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-300" />
          <span>Produtividade Mensal (Recharts)</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'calendar'
              ? 'bg-emerald-700 text-white dark:bg-emerald-600 shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-300" />
          <span>Calendário de Cultivo</span>
        </button>

        <button
          onClick={() => setActiveTab('gemini-tips')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'gemini-tips'
              ? 'bg-emerald-700 text-white dark:bg-emerald-600 shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>Dicas Gemini IA ({user.crop})</span>
        </button>

        <button
          onClick={() => setActiveTab('pests')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'pests'
              ? 'bg-emerald-700 text-white dark:bg-emerald-600 shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Bug className="w-4 h-4 text-emerald-300" />
          <span>Doutor de Pragas</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'calculator'
              ? 'bg-emerald-700 text-white dark:bg-emerald-600 shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Calculator className="w-4 h-4 text-emerald-300" />
          <span>Calculadora de Custos</span>
        </button>

        <button
          onClick={() => setActiveTab('forum')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'forum'
              ? 'bg-emerald-700 text-white dark:bg-emerald-600 shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-300" />
          <span>Fórum da Comunidade</span>
        </button>

        <button
          onClick={() => setActiveTab('weather')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'weather'
              ? 'bg-emerald-700 text-white dark:bg-emerald-600'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <CloudSun className="w-4 h-4" />
          <span>Clima & Agrometeorologia</span>
        </button>

        <button
          onClick={() => setActiveTab('market')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'market'
              ? 'bg-emerald-700 text-white dark:bg-emerald-600'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Cotações & Mercado</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-emerald-700 text-white dark:bg-emerald-600'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Segurança & 2FA / Biometria</span>
        </button>

        <button
          onClick={() => setActiveTab('simulators')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'simulators'
              ? 'bg-emerald-700 text-white dark:bg-emerald-600'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Simulador USSD & SMS (*123#)</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* AI Agronomic Highlights Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-emerald-100/50 to-stone-100 dark:from-emerald-950/40 dark:via-emerald-900/20 dark:to-stone-900 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-700/20">
                <Sparkles className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Inteligência Agronómica Gemini
                  </span>
                  <span className="text-stone-300 dark:text-stone-700">·</span>
                  <span className="text-xs text-stone-500">{user.crop}</span>
                </div>
                <h4 className="font-display text-sm font-bold text-stone-900 dark:text-stone-100">
                  Dicas Semanais Personalizadas para a sua Machamba
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                  Recomendações técnicas geradas por IA para a cultura de {user.crop} em {user.zone}.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('gemini-tips')}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 self-start sm:self-auto shrink-0 shadow-xs transition-colors"
            >
              <span>Ver Dicas da Semana</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Perfil do Produtor */}
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
            <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100 mb-4">
              Identificação do Produtor
            </h3>
            <dl className="space-y-3 text-xs">
              <div>
                <dt className="text-stone-400 uppercase text-[10px] font-semibold">Nome</dt>
                <dd className="font-semibold text-stone-800 dark:text-stone-200">{user.name}</dd>
              </div>
              <div>
                <dt className="text-stone-400 uppercase text-[10px] font-semibold">Telemóvel (M-Pesa/e-Mola)</dt>
                <dd className="font-semibold text-stone-800 dark:text-stone-200">+258 {user.phone}</dd>
              </div>
              <div>
                <dt className="text-stone-400 uppercase text-[10px] font-semibold">E-mail</dt>
                <dd className="font-semibold text-stone-800 dark:text-stone-200">{user.email || 'Não associado'}</dd>
              </div>
              <div>
                <dt className="text-stone-400 uppercase text-[10px] font-semibold">Distrito / Localidade</dt>
                <dd className="font-semibold text-stone-800 dark:text-stone-200">{user.zone}</dd>
              </div>
              <div>
                <dt className="text-stone-400 uppercase text-[10px] font-semibold">Plano Atual</dt>
                <dd className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                  {user.plan}
                </dd>
              </div>
            </dl>
          </div>

          {/* Card 2: Resumo de Segurança */}
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
            <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100 mb-4 flex items-center justify-between">
              <span>Proteção & Segurança</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </h3>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">Dois Factores (2FA / MFA)</p>
                  <p className="text-[11px] text-stone-500">
                    {user.twoFactorEnabled ? 'Código de 6 dígitos ativo' : 'Desativado'}
                  </p>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  user.twoFactorEnabled 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                    : 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
                }`}>
                  {user.twoFactorEnabled ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">Biometria / Passkey</p>
                  <p className="text-[11px] text-stone-500">
                    {user.biometricRegistered ? 'Sensor biométrico vinculado' : 'Não configurado'}
                  </p>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  user.biometricRegistered 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                    : 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
                }`}>
                  {user.biometricRegistered ? 'Ativo' : 'Pendente'}
                </span>
              </div>

              <button
                onClick={() => setActiveTab('security')}
                className="w-full mt-2 py-2 px-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-colors text-center"
              >
                Gerir Definições de Segurança &rarr;
              </button>
            </div>
          </div>

          {/* Card 3: Assistência & Extensionista de Campo */}
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100 mb-2">
                Apoio Técnico no Terreno
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
                Agente de extensão agrícola atribuído para o distrito de Homoíne:
              </p>
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-xs">
                <p className="font-semibold text-emerald-950 dark:text-emerald-200">Arsénio Matsinhe</p>
                <p className="text-stone-500 text-[11px]">Técnico de Extensão · Homoíne-Sede</p>
                <p className="text-stone-700 dark:text-stone-300 mt-1 font-mono text-[11px]">Tel: +258 876 473 432</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex gap-2">
              <a
                href="tel:+258876473432"
                className="flex-1 py-2 text-center text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
              >
                Ligar Grátis
              </a>
              <a
                href="https://wa.me/258876473432?text=Ol%C3%A1%2C%20sou%20produtor%20em%20Homoine%20e%20preciso%20de%20assistencia"
                target="_blank"
                rel="noopener"
                className="flex-1 py-2 text-center text-xs font-semibold bg-[#25D366] hover:bg-[#1DA851] text-white rounded-xl shadow-xs"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* Card 4: Clima Localizado em Tempo Real (Open-Meteo) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Clima · {user.zone}
                </span>
                <span className="text-[10px] text-stone-400">Open-Meteo</span>
              </div>
              <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100 mb-1 flex items-center gap-1.5">
                <CloudSun className="w-4 h-4 text-amber-500" />
                <span>Condições da Machamba</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-3 leading-relaxed">
                Dados climáticos e taxa de evapotranspiração para {user.zone} com previsão agrometeorológica de 7 dias.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('weather')}
              className="w-full mt-3 py-2 px-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Ver Previsão Completa 7 Dias &rarr;</span>
            </button>
          </div>
          </div>

          {/* New Field Tools Banners: Doutor de Pragas, Calculadora de Custos, Painel Recharts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Tool 1: Pest Doctor */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-emerald-200 text-xs font-semibold">
                  <Bug className="w-3.5 h-3.5" />
                  <span>Doutor da Machamba</span>
                </div>
                <h4 className="text-base font-bold font-serif">
                  Diagnóstico de Pragas & Caldas
                </h4>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  Identifique lagarta-do-cartucho, mosaico da mandioca, oídio do caju e receba receitas rústicas gratuitas (cinzas e neem).
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] text-emerald-200">
                  Áudio em português
                </span>
                <button
                  onClick={() => setActiveTab('pests')}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 shadow-sm transition-all flex items-center gap-1"
                >
                  <span>Diagnosticar</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Tool 2: Farm Profit Calculator */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 text-white shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-amber-200 text-xs font-semibold">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Gestão Financeira</span>
                </div>
                <h4 className="text-base font-bold font-serif">
                  Calculadora de Custos & Lucro
                </h4>
                <p className="text-xs text-amber-100/90 leading-relaxed">
                  Estime gastos com sementes, lavoura, sacha e transporte até Maxixe. Calcule o seu preço de equilíbrio em Meticais (MT).
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] text-amber-200">
                  Exporta ficha PDF
                </span>
                <button
                  onClick={() => setActiveTab('calculator')}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1"
                >
                  <span>Calcular</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Tool 3: Productivity Analytics Recharts */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-900 via-emerald-900 to-stone-900 text-white shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-teal-200 text-xs font-semibold">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Análise de Produtividade</span>
                </div>
                <h4 className="text-base font-bold font-serif">
                  Histórico Mensal (Recharts)
                </h4>
                <p className="text-xs text-teal-100/90 leading-relaxed">
                  Gráficos mensais de produção da machamba (kg) vs média de Homoíne, impacto da precipitação e receita acumulada.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] text-teal-200">
                  12 meses consolidados
                </span>
                <button
                  onClick={() => setActiveTab('productivity')}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-stone-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1"
                >
                  <span>Ver Gráficos</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: MONTHLY PRODUCTIVITY DATA VISUALIZATION (RECHARTS) */}
      {activeTab === 'productivity' && (
        <ProductivityChartSection
          user={user}
          onShowToast={onShowToast}
        />
      )}

      {/* TAB: CROP CALENDAR */}
      {activeTab === 'calendar' && (
        <CropCalendarSection
          user={user}
          onShowToast={onShowToast}
          onExportPdf={handleExportCalendarPdf}
        />
      )}

      {/* TAB: GEMINI AGRICULTURAL TIPS */}
      {activeTab === 'gemini-tips' && (
        <GeminiTipsSection
          initialCrop={user.crop}
          zone={user.zone}
          farmerType={user.type}
          onShowToast={onShowToast}
        />
      )}
 
      {/* TAB: DOUTOR DE PRAGAS & DOENÇAS */}
      {activeTab === 'pests' && (
        <PestDiagnosticSection
          user={user}
          onShowToast={onShowToast}
        />
      )}

      {/* TAB: CALCULADORA DE CUSTOS & RENTABILIDADE */}
      {activeTab === 'calculator' && (
        <FarmCalculatorSection
          user={user}
          marketPrices={marketPrices}
          onShowToast={onShowToast}
        />
      )}

      {/* TAB: COMMUNITY FORUM */}
      {activeTab === 'forum' && (
        <CommunityForumSection
          user={user}
          onShowToast={onShowToast}
        />
      )}

      {/* TAB: LOCALIZED WEATHER & AGROMETEOROLOGY */}
      {activeTab === 'weather' && (
        <WeatherSection
          initialZone={user.zone}
          onExportPdf={handleExportWeatherPdf}
        />
      )}

      {/* TAB 2: SECURITY & MFA / BIOMETRICS */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 2FA Toggle & Setup */}
            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
                    Autenticação de Dois Factores (2FA)
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Exige um código de 6 dígitos além da senha para iniciar sessão.
                  </p>
                </div>
                <button
                  onClick={handleToggle2FA}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${
                    user.twoFactorEnabled ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'
                  }`}
                  aria-label="Alternar 2FA"
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      user.twoFactorEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {user.twoFactorEnabled ? (
                <div className="space-y-3 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>2FA Ativo e Operacional com TOTP & SMS de Backup</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Chave Secreta TOTP: <code className="bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded font-mono text-[11px]">{user.twoFactorSecret || 'JBSWY3DPEHPK3PXP'}</code>
                  </p>
                  
                  {/* Backup codes section */}
                  <div className="pt-2">
                    <button
                      onClick={() => setShowBackupCodes(!showBackupCodes)}
                      className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{showBackupCodes ? 'Ocultar Códigos de Emergência' : 'Ver Códigos de Emergência de Backup'}</span>
                    </button>

                    {showBackupCodes && (
                      <div className="mt-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
                        <p className="text-[11px] text-stone-500 mb-2">
                          Utilize um destes códigos se perder o telemóvel:
                        </p>
                        <div className="grid grid-cols-2 gap-1.5 font-mono text-xs text-stone-800 dark:text-stone-200">
                          {user.backupCodes.map((code, idx) => (
                            <span key={idx} className="bg-white dark:bg-stone-900 p-1.5 rounded text-center border border-stone-200 dark:border-stone-700">
                              {code}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={handleRegenerateBackupCodes}
                          className="mt-2 text-[11px] text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>Gerar novos códigos</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>Recomendamos ativar o 2FA para proteger as transações agrícolas e a sua conta.</span>
                </div>
              )}
            </div>

            {/* Biometric Credentials Management */}
            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-emerald-600" />
                    <span>Biometria & Passkeys FIDO2</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Permite iniciar sessão num toque com Touch ID, Face ID ou impressão digital.
                  </p>
                </div>
              </div>

              {user.biometricRegistered ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-950 dark:text-emerald-200">
                        {user.biometricDeviceName || 'Sensor Biométrico do Dispositivo'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                        Ativo
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1 font-mono">
                      ID: {user.biometricCredentialId?.slice(0, 20)}...
                    </p>
                  </div>

                  <button
                    onClick={handleRemoveBiometric}
                    className="py-1.5 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  >
                    Remover credencial biométrica
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-stone-500">
                    Nenhum sensor biométrico associado atualmente a este utilizador.
                  </p>
                  <button
                    onClick={onRequestBiometricSetup}
                    className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Fingerprint className="w-4 h-4" />
                    <span>Registar Sensor Biométrico / Touch ID</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <History className="w-4 h-4 text-stone-500" />
                <span>Histórico de Auditoria & Acessos Recentes</span>
              </h3>
              <button
                onClick={handleExportSecurityPdf}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Registo (PDF)</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 text-[10px] uppercase">
                    <th className="pb-2">Data e Hora</th>
                    <th className="pb-2">Ação Registada</th>
                    <th className="pb-2">Estado</th>
                    <th className="pb-2">Dispositivo / IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {auditLogs.slice(0, 8).map(log => (
                    <tr key={log.id} className="text-stone-700 dark:text-stone-300">
                      <td className="py-2.5 font-mono text-[11px] text-stone-500">
                        {new Date(log.timestamp).toLocaleString('pt-MZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 font-medium">{log.action}</td>
                      <td className="py-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'success' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                            : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                        }`}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 text-stone-500 text-[11px]">{log.device} · {log.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MARKET & OFFLINE CLIMATE */}
      {activeTab === 'market' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
                  Cotações de Mercado em Homoíne, Maxixe e Inhambane
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Preços oficiais de referência actualizados diariamente. Disponíveis 100% offline.
                </p>
              </div>

              <button
                onClick={handleExportMarketPdf}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descarregar Boletim (PDF)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {marketPrices.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-stone-900 dark:text-stone-100">{item.crop}</span>
                      <span className={`text-[10px] font-semibold ${
                        item.trend === 'up' ? 'text-emerald-600' : item.trend === 'down' ? 'text-amber-600' : 'text-stone-400'
                      }`}>
                        {item.trend === 'up' ? '▲ Alta' : item.trend === 'down' ? '▼ Baixa' : '— Estável'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500">{item.market}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-stone-200/60 dark:border-stone-700/60 flex items-baseline justify-between">
                    <span className="font-display font-bold text-base text-stone-900 dark:text-stone-100 tabular-nums">
                      {item.minPrice}–{item.maxPrice} <span className="text-xs font-normal text-stone-500">{item.unit}</span>
                    </span>
                    <span className="text-[10px] text-stone-400">{item.lastUpdated}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: USSD & SMS SIMULATORS */}
      {activeTab === 'simulators' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* USSD Simulator */}
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col items-center">
            <div className="w-full mb-3 text-left">
              <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
                Simulador USSD (*123#)
              </h3>
              <p className="text-xs text-stone-500">
                Experiência de acesso em qualquer telemóvel simples sem internet.
              </p>
            </div>

            <div className="w-full max-w-xs bg-stone-950 border-4 border-stone-800 rounded-3xl p-4 shadow-xl">
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-3 min-h-[160px] text-emerald-400 font-mono text-xs whitespace-pre-wrap">
                {ussdContent[ussdMenu] || ussdContent.root}
              </div>

              {/* USSD Keypad */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(k => (
                  <button
                    key={k}
                    onClick={() => handleUssdKey(k)}
                    className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 font-bold text-sm transition-colors border border-stone-800"
                  >
                    {k}
                  </button>
                ))}
                <button
                  onClick={() => handleUssdKey('0')}
                  className="col-span-3 p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 font-bold text-xs transition-colors border border-stone-800"
                >
                  0 · Voltar ao Início
                </button>
              </div>
            </div>
          </div>

          {/* SMS Simulator */}
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col items-center">
            <div className="w-full mb-3 text-left">
              <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
                Simulador SMS (Número Curto 123)
              </h3>
              <p className="text-xs text-stone-500">
                Envie comandos: PRECO, ALERTA, DICA solo, AJUDA.
              </p>
            </div>

            <div className="w-full max-w-xs bg-stone-950 border-4 border-stone-800 rounded-3xl overflow-hidden shadow-xl flex flex-col">
              <div className="p-3 bg-stone-900 border-b border-stone-800 text-center text-xs font-bold text-stone-200">
                SMS · 123 (AgroResiliente)
              </div>

              <div className="p-3 h-52 overflow-y-auto space-y-2 bg-stone-950 text-xs">
                {smsThread.map((msg, i) => (
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
                  onKeyDown={e => { if (e.key === 'Enter') handleSendSms(); }}
                  placeholder="Ex: PRECO milho"
                  className="flex-1 px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 outline-none"
                />
                <button
                  onClick={() => handleSendSms()}
                  className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                >
                  Enviar
                </button>
              </div>

              {/* Quick SMS Chips */}
              <div className="p-2 bg-stone-950 flex flex-wrap gap-1 text-[10px]">
                <button onClick={() => handleSendSms('PRECO milho')} className="px-2 py-0.5 rounded bg-stone-900 text-stone-300">PRECO milho</button>
                <button onClick={() => handleSendSms('ALERTA')} className="px-2 py-0.5 rounded bg-stone-900 text-stone-300">ALERTA</button>
                <button onClick={() => handleSendSms('DICA solo')} className="px-2 py-0.5 rounded bg-stone-900 text-stone-300">DICA solo</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
