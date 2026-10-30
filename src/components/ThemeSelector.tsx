import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { themeService, ThemeMode } from '../services/theme';

interface ThemeSelectorProps {
  className?: string;
  showLabels?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  className = '',
  showLabels = true
}) => {
  const [currentMode, setCurrentMode] = useState<ThemeMode>(() => themeService.getMode());
  const [isDark, setIsDark] = useState<boolean>(() => themeService.isDarkMode());
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState<string>('');
  const radioGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial sync
    themeService.init();

    // Subscribe to changes (from this component, storage events, or media query)
    const unsubscribe = themeService.subscribe((mode, dark) => {
      setCurrentMode(mode);
      setIsDark(dark);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSelectMode = (mode: ThemeMode) => {
    themeService.setTheme(mode);
    const darkActive = themeService.isDarkMode();
    const modeName = mode === 'light' ? 'Modo Claro' : mode === 'dark' ? 'Modo Escuro' : 'Modo Automático do Sistema';
    setScreenReaderAnnouncement(`Tema alterado com sucesso para ${modeName}.`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextMode: ThemeMode = currentMode === 'light' ? 'dark' : 'light';
      handleSelectMode(nextMode);
      focusOption(nextMode);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevMode: ThemeMode = currentMode === 'dark' ? 'light' : 'dark';
      handleSelectMode(prevMode);
      focusOption(prevMode);
    }
  };

  const focusOption = (mode: ThemeMode) => {
    if (!radioGroupRef.current) return;
    const btn = radioGroupRef.current.querySelector<HTMLButtonElement>(`[data-mode="${mode}"]`);
    if (btn) btn.focus();
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Live region for assistive technologies */}
      <span
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {screenReaderAnnouncement}
      </span>

      {/* Accessible Segmented Theme Switch */}
      <div
        ref={radioGroupRef}
        role="radiogroup"
        aria-label="Seletor de tema da interface: Claro ou Escuro"
        onKeyDown={handleKeyDown}
        className="inline-flex items-center p-1 rounded-xl bg-stone-100 dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 shadow-xs"
      >
        {/* Light Theme Option */}
        <button
          type="button"
          role="radio"
          data-mode="light"
          aria-checked={!isDark}
          tabIndex={!isDark ? 0 : -1}
          onClick={() => handleSelectMode('light')}
          className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-stone-900 ${
            !isDark
              ? 'bg-white text-stone-900 shadow-xs font-bold border border-stone-200/80'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-700/50'
          }`}
          title="Ativar Modo Claro (Fundo branco e alto contraste)"
          aria-label="Ativar Modo Claro"
        >
          <Sun
            className={`w-3.5 h-3.5 transition-transform ${
              !isDark ? 'text-amber-500 scale-110' : 'text-stone-400 dark:text-stone-500'
            }`}
          />
          {showLabels && (
            <span className="hidden sm:inline tracking-tight">
              Claro
            </span>
          )}
        </button>

        {/* Dark Theme Option */}
        <button
          type="button"
          role="radio"
          data-mode="dark"
          aria-checked={isDark}
          tabIndex={isDark ? 0 : -1}
          onClick={() => handleSelectMode('dark')}
          className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-stone-900 ${
            isDark
              ? 'bg-stone-900 text-stone-100 shadow-xs font-bold border border-stone-700'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-700/50'
          }`}
          title="Ativar Modo Escuro (Fundo escuro confortável para a visão)"
          aria-label="Ativar Modo Escuro"
        >
          <Moon
            className={`w-3.5 h-3.5 transition-transform ${
              isDark ? 'text-sky-400 scale-110 fill-sky-400/20' : 'text-stone-400 dark:text-stone-500'
            }`}
          />
          {showLabels && (
            <span className="hidden sm:inline tracking-tight">
              Escuro
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
