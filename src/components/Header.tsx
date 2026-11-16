import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  WifiOff,
  Bell,
  User as UserIcon,
  LogOut,
  ChevronDown,
  FlaskConical
} from 'lucide-react';
import { Session } from '../types/auth';
import { ThemeSelector } from './ThemeSelector';
import { PWAInstallBanner } from './PWAInstallBanner';

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
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close user menu on outside click or Escape key
  useEffect(() => {
    if (!userDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [userDropdownOpen]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 pt-safe bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      {/* Offline Alert Strip if disconnected */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs py-1.5 px-4 text-center font-semibold flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>Modo Offline — Inquéritos e cotações em cache local.</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Clean single-line Brand Wordmark */}
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg py-1 pr-2 whitespace-nowrap shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-[#065f46] dark:bg-emerald-600 text-white flex items-center justify-center font-display font-extrabold text-base shrink-0">
            A
          </div>
          <span className="font-display font-extrabold text-base sm:text-lg text-stone-950 dark:text-white tracking-tight whitespace-nowrap">
            AgroResiliente
          </span>
        </button>

        {/* Zone 2 & 3: Utility & Primary Actions (Single-line, clean spacing) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Notifications */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative min-w-[40px] min-h-[40px] flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Notificações"
            title="Ver notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-600 rounded-full ring-2 ring-white dark:ring-stone-900" />
            )}
          </button>

          {/* Compact CI/CD test runner link on desktop */}
          <button
            type="button"
            onClick={onOpenTestRunner}
            className="hidden lg:flex items-center gap-1.5 min-h-[38px] px-2.5 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title="Executar bateria de testes"
          >
            <FlaskConical className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>Testes</span>
          </button>

          {/* Theme Switcher */}
          <ThemeSelector showLabels={false} />

          {/* Install Mobile App (iOS / Android) */}
          <div className="hidden sm:block">
            <PWAInstallBanner variant="pill" />
          </div>

          {/* Primary Auth / Profile Control */}
          {session ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                aria-expanded={userDropdownOpen}
                aria-haspopup="menu"
                onClick={() => setUserDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 min-h-[40px] px-2 sm:px-3 py-1.5 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 whitespace-nowrap"
              >
                <div className="w-7 h-7 rounded-full bg-[#065f46] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {getInitials(session.user.name)}
                </div>
                <span className="hidden sm:inline text-xs font-bold max-w-[110px] truncate">
                  {session.user.name.split(' ')[0]}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {userDropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-60 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xl py-1.5 z-50 text-sm"
                >
                  <div className="px-3.5 py-2.5 border-b border-stone-100 dark:border-stone-800">
                    <p className="font-bold text-stone-900 dark:text-stone-100 truncate">{session.user.name}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{session.user.zone}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>{session.user.twoFactorEnabled ? '2FA Ativo' : 'Proteção Padrão'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigateHome();
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2 text-stone-700 dark:text-stone-300 text-xs font-semibold"
                  >
                    <UserIcon className="w-4 h-4 text-stone-400" />
                    <span>Painel do Produtor</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Terminar Sessão</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="min-h-[38px] px-3 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors whitespace-nowrap"
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="min-h-[38px] px-3.5 py-1.5 text-xs font-bold text-white bg-[#065f46] hover:bg-[#022c22] dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap"
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
