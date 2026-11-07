import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { User, SocialProvider } from '../types/auth';
import { AriaModal } from './AriaModal';

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

  const modalTitle = mode === 'login' ? 'Entrar na Conta' : 'Criar Conta de Produtor';

  return (
    <AriaModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      maxWidth="max-w-lg"
    >
      {/* Modal Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-700/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">
          {modalTitle}
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto">
          {mode === 'login' 
            ? 'Aceda às cotações, alertas climáticos e assistência técnica em Homoíne.'
            : 'Junte-se à rede de produtores agrícolas resilientes de Inhambane.'}
        </p>

        {/* Segmented Mode Switcher */}
        <div
          role="tablist"
          aria-label="Opções de autenticação"
          className="inline-flex p-1 bg-stone-100 dark:bg-stone-800 rounded-xl mt-4 max-w-xs w-full"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            onClick={() => setMode('login')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              mode === 'login'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Iniciar Sessão
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            onClick={() => setMode('register')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
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
    </AriaModal>
  );
};
