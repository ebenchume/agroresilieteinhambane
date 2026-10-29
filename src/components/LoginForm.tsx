import React, { useState } from 'react';
import { 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Fingerprint, 
  ArrowRight, 
  AlertCircle,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { User, SocialProvider } from '../types/auth';

interface LoginFormProps {
  onSuccessLogin: (user: User, authMethod: 'password' | 'biometric' | 'social' | '2fa') => void;
  onRequest2FA: (user: User) => void;
  onRequestBiometric: (user?: User) => void;
  onRequestRecovery: () => void;
  onRequestRegister: () => void;
  onOpenSocial: (provider: SocialProvider) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccessLogin,
  onRequest2FA,
  onRequestBiometric,
  onRequestRecovery,
  onRequestRegister,
  onOpenSocial
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const user = StorageService.findUser(identifier);

      if (!user) {
        setError('Conta não encontrada. Verifique o telemóvel (ex: 84xxxxxxx) ou e-mail.');
        setIsLoading(false);
        return;
      }

      if (user.password && user.password !== password) {
        setError('Palavra-passe incorrecta. Tente novamente ou use a recuperação rápida.');
        StorageService.logAction(user.id, 'Tentativa de Login Falhada (Senha Incorrecta)', 'failed');
        setIsLoading(false);
        return;
      }

      // Check if user has 2FA enabled
      if (user.twoFactorEnabled) {
        setIsLoading(false);
        onRequest2FA(user);
        return;
      }

      // Successful password login
      setIsLoading(false);
      StorageService.logAction(user.id, 'Login com Palavra-passe', 'success');
      onSuccessLogin(user, 'password');
    }, 450);
  };

  const handleQuickDemoUser = (userType: 'maria' | 'arsenio') => {
    if (userType === 'maria') {
      setIdentifier('841234567');
      setPassword('Password123!');
    } else {
      setIdentifier('876473432');
      setPassword('Agro2026!');
    }
    setError('');
  };

  return (
    <div className="w-full">
      {/* Quick Demo Pre-fill Bar */}
      <div className="mb-5 p-3 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Contas de Demonstração (Clique para testar):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemoUser('maria')}
            className="text-left p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500 dark:hover:border-emerald-600 transition-colors text-xs"
          >
            <p className="font-semibold text-stone-900 dark:text-stone-100 leading-tight">Maria João (Homoíne)</p>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">Produtora · 2FA & Biometria Ativos</p>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoUser('arsenio')}
            className="text-left p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500 dark:hover:border-emerald-600 transition-colors text-xs"
          >
            <p className="font-semibold text-stone-900 dark:text-stone-100 leading-tight">Arsénio Matsinhe</p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">Extensionista de Campo · Homoíne</p>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Identifier: Phone or Email */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
            Telemóvel (M-Pesa / e-Mola) ou E-mail
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              placeholder="Ex: 84xxxxxxx ou produtor@exemplo.com"
              autoComplete="username"
              className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Palavra-passe
            </label>
            <button
              type="button"
              onClick={onRequestRecovery}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
            >
              Esqueceu-se da senha?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full pl-9 pr-10 py-2.5 bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
            />
            <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
              aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500 border-stone-300 dark:border-stone-700 dark:bg-stone-800"
            />
            <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">
              Lembrar neste telemóvel / computador
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm shadow-emerald-700/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <span>A verificar credenciais...</span>
          ) : (
            <>
              <span>Entrar na Minha Conta</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* BIOMETRIC ONE-CLICK PROMPT */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => {
            const user = StorageService.findUser(identifier);
            onRequestBiometric(user);
          }}
          className="w-full py-2.5 px-4 bg-white dark:bg-stone-900 border border-emerald-300 dark:border-emerald-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 group shadow-xs"
        >
          <Fingerprint className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>Aceder com Biometria / Sensor Digital</span>
        </button>
      </div>

      {/* SOCIAL LOGINS SECTION */}
      <div className="mt-6">
        <div className="relative flex items-center justify-center mb-4">
          <div className="border-t border-stone-200 dark:border-stone-800 w-full" />
          <span className="bg-white dark:bg-stone-900 px-3 text-[11px] font-medium text-stone-400 uppercase tracking-wider absolute">
            ou aceda com
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Google */}
          <button
            type="button"
            onClick={() => onOpenSocial('google')}
            className="py-2 px-3 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Google</span>
          </button>

          {/* WhatsApp / M-Pesa */}
          <button
            type="button"
            onClick={() => onOpenSocial('whatsapp')}
            className="py-2 px-3 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-center gap-2 transition-colors"
          >
            <Smartphone className="w-4 h-4 text-[#25D366]" />
            <span>WhatsApp / M-Pesa</span>
          </button>

          {/* Apple */}
          <button
            type="button"
            onClick={() => onOpenSocial('apple')}
            className="py-2 px-3 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4 fill-current text-stone-900 dark:text-stone-100" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.08-7.73-7.9-12.09-14.48-6.19-9.37-11.07-20.25-14.65-32.65-3.58-12.4-5.37-23.75-5.37-34.05 0-14.35 3.73-26.37 11.2-36.05 7.46-9.68 16.9-14.6 28.3-14.76 4.9 0 10.23 1.34 16 4.02 5.77 2.68 9.54 4.08 11.3 4.2 1.33 0 5.37-1.45 12.1-4.35 6.74-2.9 12.35-4.22 16.85-3.96 12.5.8 22.3 5.48 29.4 14.05-10.9 6.64-16.2 15.82-15.9 27.53.3 9.3 3.9 17.15 10.8 23.55 6.9 6.4 15.1 10.05 24.6 10.95-2.2 6.6-4.9 13.2-8.1 19.8zM119.22 31.85c0-7.48 2.67-14.48 8.02-21 5.35-6.52 11.95-10.47 19.8-11.85.5 3.84.2 7.74-.9 11.7-1.1 3.96-3.2 7.6-6.3 10.9-3.2 3.4-6.9 6.06-11.1 7.98-4.2 1.92-8.2 2.76-12 2.52.2-2.1.28-4.1.28-6.25z"/>
            </svg>
            <span>Apple ID</span>
          </button>

          {/* Gov.mz / MADER */}
          <button
            type="button"
            onClick={() => onOpenSocial('gov')}
            className="py-2 px-3 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-center gap-2 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>Portal Gov.mz</span>
          </button>
        </div>
      </div>

      {/* Switch to Register */}
      <div className="mt-6 text-center text-xs text-stone-500 dark:text-stone-400">
        <span>Ainda não tem conta de produtor? </span>
        <button
          type="button"
          onClick={onRequestRegister}
          className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
        >
          Criar conta grátis
        </button>
      </div>
    </div>
  );
};
