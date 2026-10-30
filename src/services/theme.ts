/**
 * AgroResiliente Inhambane - Theme Management Service
 * Provides centralized, accessible theme switching (Light / Dark / System),
 * synchronizes with localStorage ('agro_theme'), and updates the 'class' attribute on <html>.
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'agro_theme';

class ThemeService {
  private currentMode: ThemeMode = 'light';
  private listeners: Set<(mode: ThemeMode, isDark: boolean) => void> = new Set();
  private mediaQueryList: MediaQueryList | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.currentMode = this.getStoredTheme();
      this.mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Listen for system theme changes if user has 'system' mode selected
      this.mediaQueryList.addEventListener('change', (e) => {
        if (this.currentMode === 'system') {
          this.applyThemeToDOM(e.matches);
          this.notify(this.currentMode, e.matches);
        }
      });

      // Synchronize with storage events across browser tabs
      window.addEventListener('storage', (event) => {
        if (event.key === THEME_STORAGE_KEY && event.newValue) {
          const newMode = event.newValue as ThemeMode;
          if (['light', 'dark', 'system'].includes(newMode)) {
            this.setTheme(newMode, false);
          }
        }
      });
    }
  }

  /**
   * Retrieves the stored preference from localStorage, falling back to 'light'
   * or system preference if nothing was previously saved.
   */
  public getStoredTheme(): ThemeMode {
    if (typeof window === 'undefined') return 'light';
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light' || stored === 'system') {
        return stored;
      }
      // Check initial DOM state or system preference
      if (document.documentElement.classList.contains('dark')) {
        return 'dark';
      }
    } catch {
      // Fallback in case of restricted localStorage
    }
    return 'light';
  }

  /**
   * Resolves whether the active visual presentation is dark mode.
   */
  public isDarkMode(): boolean {
    if (this.currentMode === 'dark') return true;
    if (this.currentMode === 'light') return false;
    // System mode
    if (typeof window !== 'undefined' && this.mediaQueryList) {
      return this.mediaQueryList.matches;
    }
    return false;
  }

  /**
   * Applies the theme to the <html> tag's class attribute and data-theme.
   */
  private applyThemeToDOM(isDark: boolean): void {
    if (typeof document === 'undefined') return;

    const html = document.documentElement;

    if (isDark) {
      if (!html.classList.contains('dark')) {
        html.classList.add('dark');
      }
      html.setAttribute('data-theme', 'dark');
      html.style.colorScheme = 'dark';
    } else {
      if (html.classList.contains('dark')) {
        html.classList.remove('dark');
      }
      html.setAttribute('data-theme', 'light');
      html.style.colorScheme = 'light';
    }
  }

  /**
   * Sets the theme mode, updates localStorage, and alters the html class attribute.
   */
  public setTheme(mode: ThemeMode, persist = true): boolean {
    this.currentMode = mode;

    if (persist && typeof window !== 'undefined') {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, mode);
      } catch (err) {
        console.warn('Failed to persist theme in localStorage:', err);
      }
    }

    const isDark = this.isDarkMode();
    this.applyThemeToDOM(isDark);
    this.notify(mode, isDark);
    return isDark;
  }

  /**
   * Quick toggle between light and dark modes.
   */
  public toggleTheme(): ThemeMode {
    const nextMode: ThemeMode = this.isDarkMode() ? 'light' : 'dark';
    this.setTheme(nextMode);
    return nextMode;
  }

  /**
   * Initial bootstrap to apply stored theme on page load.
   */
  public init(): ThemeMode {
    const mode = this.getStoredTheme();
    this.setTheme(mode, false);
    return mode;
  }

  public getMode(): ThemeMode {
    return this.currentMode;
  }

  public subscribe(listener: (mode: ThemeMode, isDark: boolean) => void): () => void {
    this.listeners.add(listener);
    // Trigger immediately with current state
    listener(this.currentMode, this.isDarkMode());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(mode: ThemeMode, isDark: boolean) {
    this.listeners.forEach((l) => l(mode, isDark));
  }
}

export const themeService = new ThemeService();
