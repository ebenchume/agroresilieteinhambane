import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { User, SocialProvider } from '../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccessLogin: (user: User, authMethod: 'password' | 'biometric' | 'social' | '2fa') => void;
  onRequest2FA: (user: User) => void;
  onRequestBiometric: (user?: User) => void;
  onRequestRecovery: () => void;
  onOpenSocial: (provider: SocialProvider) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccessLogin,
  onRequest2FA,
  onRequestBiometric,
  onRequestRecovery,
  onOpenSocial
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Sync mode if initialMode changes
  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 relative my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-xl transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-700/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">
            {mode === 'login' ? 'Entrar na Conta' : 'Criar Conta de Produtor'}
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto">
            {mode === 'login' 
              ? 'Aceda às cotações, alertas climáticos e assistência técnica em Homoíne.'
              : 'Junte-se à rede de produtores agrícolas resilientes de Inhambane.'}
          </p>

          {/* Segmented Mode Switcher */}
          <div className="inline-flex p-1 bg-stone-100 dark:bg-stone-800 rounded-xl mt-4 max-w-xs w-full">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Iniciar Sessão
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Criar Conta
            </button>
          </div>
        </div>

        {/* Form Body */}
        {mode === 'login' ? (
          <LoginForm
            onSuccessLogin={onSuccessLogin}
            onRequest2FA={onRequest2FA}
            onRequestBiometric={onRequestBiometric}
            onRequestRecovery={onRequestRecovery}
            onRequestRegister={() => setMode('register')}
            onOpenSocial={onOpenSocial}
          />
        ) : (
          <RegisterForm
            onSuccessRegister={(user) => onSuccessLogin(user, 'password')}
            onRequestLogin={() => setMode('login')}
          />
        )}
      </div>
    </div>
  );
};
