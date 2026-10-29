import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingView } from './components/LandingView';
import { Dashboard } from './components/Dashboard';
import { AuthModal } from './components/AuthModal';
import { TwoFactorModal } from './components/TwoFactorModal';
import { BiometricModal } from './components/BiometricModal';
import { RecoveryModal } from './components/RecoveryModal';
import { SocialLoginModal } from './components/SocialLoginModal';
import { TestRunnerModal } from './components/TestRunnerModal';
import { NotificationCenter } from './components/NotificationCenter';
import { StorageService } from './services/storage';
import { User, Session, SocialProvider, AppNotification, MarketPrice } from './types/auth';
import { CheckCircle2, Info, MessageCircle, Mail } from 'lucide-react';

export default function App() {
  // Session & Data States
  const [session, setSession] = useState<Session | null>(() => StorageService.getSession());
  const [notifications, setNotifications] = useState<AppNotification[]>(() => StorageService.getNotifications());
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>(() => StorageService.getMarketPrices());

  // Modal Control States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');

  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [twoFactorPendingUser, setTwoFactorPendingUser] = useState<User | null>(null);

  const [biometricModalOpen, setBiometricModalOpen] = useState(false);
  const [biometricTargetUser, setBiometricTargetUser] = useState<User | null>(null);
  const [biometricMode, setBiometricMode] = useState<'login' | 'register'>('login');

  const [recoveryModalOpen, setRecoveryModalOpen] = useState(false);

  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [socialProvider, setSocialProvider] = useState<SocialProvider | null>(null);

  const [testRunnerModalOpen, setTestRunnerModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false
  });

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(t => ({ ...t, visible: false }));
    }, 3500);
  };

  const handleLoginSuccess = (user: User, authMethod: 'password' | 'biometric' | 'social' | '2fa') => {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    const newSession: Session = {
      user,
      token: 'tok_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      authenticatedWith: authMethod,
      expiresAt
    };

    StorageService.setSession(newSession);
    setSession(newSession);
    setAuthModalOpen(false);
    setTwoFactorModalOpen(false);
    setBiometricModalOpen(false);
    setSocialModalOpen(false);
    setRecoveryModalOpen(false);

    showToast(`Bem-vindo(a), ${user.name.split(' ')[0]}! Sessão iniciada com sucesso.`, 'success');
  };

  const handleLogout = () => {
    if (session) {
      StorageService.logAction(session.user.id, 'Encerramento de Sessão', 'success');
    }
    StorageService.clearSession();
    setSession(null);
    showToast('Sessão terminada em segurança.', 'info');
  };

  // 2FA Triggered from LoginForm
  const handleRequest2FA = (user: User) => {
    setTwoFactorPendingUser(user);
    setAuthModalOpen(false);
    setTwoFactorModalOpen(true);
  };

  // Biometric Triggered
  const handleRequestBiometricLogin = (user?: User) => {
    setBiometricMode('login');
    setBiometricTargetUser(user || null);
    setAuthModalOpen(false);
    setBiometricModalOpen(true);
  };

  const handleRequestBiometricSetup = () => {
    if (!session) return;
    setBiometricMode('register');
    setBiometricTargetUser(session.user);
    setBiometricModalOpen(true);
  };

  // Password Recovery Triggered
  const handleRequestRecovery = () => {
    setAuthModalOpen(false);
    setRecoveryModalOpen(true);
  };

  // Social Login Triggered
  const handleOpenSocial = (provider: SocialProvider) => {
    setSocialProvider(provider);
    setAuthModalOpen(false);
    setSocialModalOpen(true);
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* Top Header */}
      <Header
        session={session}
        onOpenAuth={(mode = 'login') => {
          setAuthInitialMode(mode);
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenTestRunner={() => setTestRunnerModalOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onNavigateHome={() => {}}
        unreadCount={unreadNotificationCount}
      />

      {/* Main Content: Dashboard or Landing */}
      <main className="flex-1">
        {session ? (
          <Dashboard
            user={session.user}
            onUpdateUser={(updated) => {
              const current = StorageService.getSession();
              if (current) {
                const refreshed = { ...current, user: updated };
                StorageService.setSession(refreshed);
                setSession(refreshed);
              }
            }}
            onRequestBiometricSetup={handleRequestBiometricSetup}
            marketPrices={marketPrices}
            onShowToast={showToast}
          />
        ) : (
          <LandingView
            onOpenAuth={(mode = 'login') => {
              setAuthInitialMode(mode);
              setAuthModalOpen(true);
            }}
            onOpenTestRunner={() => setTestRunnerModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onOpenTestRunner={() => setTestRunnerModalOpen(true)} />

      {/* MODALS */}
      {/* 1. Main Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authInitialMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccessLogin={(user, method) => handleLoginSuccess(user, method)}
        onRequest2FA={handleRequest2FA}
        onRequestBiometric={handleRequestBiometricLogin}
        onRequestRecovery={handleRequestRecovery}
        onOpenSocial={handleOpenSocial}
      />

      {/* 2. Two-Factor Authentication Modal */}
      {twoFactorPendingUser && (
        <TwoFactorModal
          isOpen={twoFactorModalOpen}
          user={twoFactorPendingUser}
          onClose={() => setTwoFactorModalOpen(false)}
          onSuccess={() => handleLoginSuccess(twoFactorPendingUser, '2fa')}
        />
      )}

      {/* 3. Biometric Verification & Registration Modal */}
      <BiometricModal
        isOpen={biometricModalOpen}
        mode={biometricMode}
        targetUser={biometricTargetUser}
        onClose={() => setBiometricModalOpen(false)}
        onSuccess={(user) => {
          if (biometricMode === 'login') {
            handleLoginSuccess(user, 'biometric');
          } else {
            // Update session user with new biometric
            if (session) {
              const updatedSession = { ...session, user };
              StorageService.setSession(updatedSession);
              setSession(updatedSession);
            }
            setBiometricModalOpen(false);
            showToast('Sensor biométrico ativado e vinculado com sucesso à sua conta.', 'success');
          }
        }}
      />

      {/* 4. Password Recovery Modal */}
      <RecoveryModal
        isOpen={recoveryModalOpen}
        onClose={() => setRecoveryModalOpen(false)}
        onSuccess={(user) => handleLoginSuccess(user, 'password')}
      />

      {/* 5. Social Login Modal */}
      <SocialLoginModal
        isOpen={socialModalOpen}
        provider={socialProvider}
        onClose={() => setSocialModalOpen(false)}
        onSuccess={(user) => handleLoginSuccess(user, 'social')}
      />

      {/* 6. Automated Test Suite Runner Modal */}
      <TestRunnerModal
        isOpen={testRunnerModalOpen}
        onClose={() => setTestRunnerModalOpen(false)}
      />

      {/* 7. Notification Center Modal */}
      <NotificationCenter
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onRefresh={() => setNotifications(StorageService.getNotifications())}
      />

      {/* Toast Notification Container */}
      {toast.visible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold ${
            toast.type === 'success'
              ? 'bg-emerald-800 text-white shadow-emerald-900/30'
              : 'bg-stone-900 text-stone-100 shadow-stone-950/30'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-stone-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Floating Action Contact Pills (WhatsApp & E-mail) */}
      <aside aria-label="Contactos rápidos" className="fixed bottom-6 right-6 z-40 flex flex-col gap-2.5">
        <a
          href="https://wa.me/258876473432?text=Ol%C3%A1%2C%20vi%20o%20site%20agroresiliente.co.mz%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%A3o"
          target="_blank"
          rel="noopener"
          className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#1DA851] text-white flex items-center justify-center shadow-lg shadow-emerald-900/20 hover:scale-105 transition-all"
          title="Falar no WhatsApp (+258 876 473 432)"
          aria-label="WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
        <a
          href="mailto:ebenchume@sapo.mz?subject=Contacto%20AgroResiliente%20Inhambane"
          className="w-12 h-12 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white flex items-center justify-center shadow-lg shadow-emerald-900/20 hover:scale-105 transition-all"
          title="Enviar E-mail (ebenchume@sapo.mz)"
          aria-label="E-mail"
        >
          <Mail className="w-5 h-5" />
        </a>
      </aside>
    </div>
  );
}
