import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Moon, 
  Sun, 
  Wifi, 
  WifiOff, 
  Bell, 
  FlaskConical, 
  User as UserIcon, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Session, AppNotification } from '../types/auth';

interface HeaderProps {
  session: Session | null;
  onOpenAuth: (initialMode?: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenTestRunner: () => void;
  onOpenNotifications: () => void;
  onNavigateHome: () => void;
  unreadCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  onOpenAuth,
  onLogout,
  onOpenTestRunner,
  onOpenNotifications,
  onNavigateHome,
  unreadCount
}) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('agro_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('agro_theme', 'light');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      {/* Offline Alert Strip if disconnected */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>Modo Offline Ativo — A visualizar dados essenciais e cotações em cache local.</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <button 
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-700 dark:bg-emerald-600 text-white flex items-center justify-center shadow-sm shadow-emerald-700/20 group-hover:bg-emerald-800 transition-colors">
            <span className="font-display font-bold text-lg">A</span>
          </div>
          <div>
            <span className="font-display font-bold text-lg text-stone-900 dark:text-stone-100 tracking-tight block leading-tight">
              AgroResiliente
            </span>
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 block tracking-wider uppercase">
              Inhambane
            </span>
          </div>
        </button>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Online indicator */}
          <div 
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-600 dark:text-stone-400 rounded-md"
            title={isOnline ? 'Conectado à rede' : 'Trabalhando offline'}
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Online</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Automated Test Suite Button */}
          <button
            onClick={onOpenTestRunner}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors border border-stone-200 dark:border-stone-800"
            title="Executar bateria de testes automatizados"
          >
            <FlaskConical className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">Testes Integrados</span>
          </button>

          {/* Push Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Notificações"
            title="Ver notificações e alertas push"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-600 rounded-full ring-2 ring-white dark:ring-stone-900" />
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Auth Area */}
          {session ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center">
                  {getInitials(session.user.name)}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-semibold block leading-none">
                    {session.user.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block leading-none mt-0.5">
                    {session.user.zone}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-lg py-1.5 z-50 text-sm animate-in fade-in slide-in-from-top-1"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-stone-100 dark:border-stone-800">
                    <p className="font-semibold text-stone-900 dark:text-stone-100 truncate">{session.user.name}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{session.user.email || session.user.phone}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{session.user.twoFactorEnabled ? '2FA Ativo' : 'Proteção Padrão'}</span>
                    </div>
                  </div>

                  <button
                    onClick={onNavigateHome}
                    className="w-full text-left px-3.5 py-2 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2 text-stone-700 dark:text-stone-300"
                  >
                    <UserIcon className="w-4 h-4 text-stone-400" />
                    <span>Painel do Produtor</span>
                  </button>

                  <button
                    onClick={onLogout}
                    className="w-full text-left px-3.5 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 text-red-600 dark:text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Terminar Sessão</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              >
                Entrar
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-lg transition-colors shadow-sm shadow-emerald-700/20"
              >
                Criar Conta
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
