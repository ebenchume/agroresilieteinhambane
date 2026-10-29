import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Smartphone, Globe } from 'lucide-react';
import { SocialProvider, User } from '../types/auth';
import { StorageService } from '../services/storage';

interface SocialLoginModalProps {
  isOpen: boolean;
  provider: SocialProvider | null;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const SocialLoginModal: React.FC<SocialLoginModalProps> = ({
  isOpen,
  provider,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [phoneInput, setPhoneInput] = useState('876473432');
  const [waStep, setWaStep] = useState<'phone' | 'otp'>('phone');
  const [waOtp, setWaOtp] = useState('');

  if (!isOpen || !provider) return null;

  const handleCompleteSocial = (accountName: string, accountEmail: string, phone: string = '841234567') => {
    setLoading(true);

    setTimeout(() => {
      // Find or create social user
      let user = StorageService.findUser(accountEmail) || StorageService.findUser(phone);
      if (!user) {
        user = {
          id: 'usr_soc_' + Date.now().toString(36),
          name: accountName,
          email: accountEmail,
          phone: phone,
          zone: 'Homoíne-Sede',
          crop: 'Milho',
          type: 'Familiar',
          plan: 'Gratuita',
          createdAt: new Date().toISOString(),
          twoFactorEnabled: false,
          biometricRegistered: false,
          socialProvider: provider,
          backupCodes: StorageService.generateBackupCodes(),
          lastLoginAt: new Date().toISOString()
        };
        StorageService.saveUser(user);
      } else {
        user.socialProvider = provider;
        user.lastLoginAt = new Date().toISOString();
        StorageService.saveUser(user);
      }

      StorageService.logAction(user.id, `Login via ${provider.toUpperCase()}`, 'success');
      setLoading(false);
      onSuccess(user);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* GOOGLE MODAL */}
        {provider === 'google' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                Fazer login com o Google
              </h3>
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
              Escolha uma conta para aceder ao <strong>AgroResiliente Inhambane</strong>:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleCompleteSocial('Eduardo Benchume', 'ebenchume@gmail.com', '876473432')}
                disabled={loading}
                className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-left flex items-center gap-3 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                  EB
                </div>
                <div className="truncate flex-1">
                  <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 group-hover:text-emerald-700">Eduardo Benchume</p>
                  <p className="text-[11px] text-stone-500">ebenchume@gmail.com</p>
                </div>
              </button>

              <button
                onClick={() => handleCompleteSocial('Maria João', 'maria.joao@exemplo.com', '841234567')}
                disabled={loading}
                className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-left flex items-center gap-3 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                  MJ
                </div>
                <div className="truncate flex-1">
                  <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 group-hover:text-emerald-700">Maria João</p>
                  <p className="text-[11px] text-stone-500">maria.joao@exemplo.com</p>
                </div>
              </button>
            </div>

            {loading && (
              <p className="text-xs text-emerald-700 font-semibold text-center mt-3 animate-pulse">
                A verificar credenciais Google OAuth 2.0...
              </p>
            )}
          </div>
        )}

        {/* APPLE MODAL */}
        {provider === 'apple' && (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-stone-900 text-white dark:bg-white dark:text-stone-950 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.08-7.73-7.9-12.09-14.48-6.19-9.37-11.07-20.25-14.65-32.65-3.58-12.4-5.37-23.75-5.37-34.05 0-14.35 3.73-26.37 11.2-36.05 7.46-9.68 16.9-14.6 28.3-14.76 4.9 0 10.23 1.34 16 4.02 5.77 2.68 9.54 4.08 11.3 4.2 1.33 0 5.37-1.45 12.1-4.35 6.74-2.9 12.35-4.22 16.85-3.96 12.5.8 22.3 5.48 29.4 14.05-10.9 6.64-16.2 15.82-15.9 27.53.3 9.3 3.9 17.15 10.8 23.55 6.9 6.4 15.1 10.05 24.6 10.95-2.2 6.6-4.9 13.2-8.1 19.8zM119.22 31.85c0-7.48 2.67-14.48 8.02-21 5.35-6.52 11.95-10.47 19.8-11.85.5 3.84.2 7.74-.9 11.7-1.1 3.96-3.2 7.6-6.3 10.9-3.2 3.4-6.9 6.06-11.1 7.98-4.2 1.92-8.2 2.76-12 2.52.2-2.1.28-4.1.28-6.25z"/>
              </svg>
            </div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm mb-1">
              Iniciar sessão com Apple
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-5">
              Utilize o Apple ID seguro com Ocultar Meu E-mail ativado.
            </p>
            <button
              onClick={() => handleCompleteSocial('Produtor Apple', 'produtor.mz@privaterelay.appleid.com')}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-xl shadow-sm transition-all"
            >
              {loading ? 'A autenticar...' : 'Continuar com Face ID / Apple ID'}
            </button>
          </div>
        )}

        {/* WHATSAPP & M-PESA MODAL */}
        {provider === 'whatsapp' && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                  WhatsApp / M-Pesa Login
                </h3>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">Rede Móvel Moçambicana</span>
              </div>
            </div>

            {waStep === 'phone' ? (
              <div className="space-y-3">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Insira o seu número Vodacom (84/85) ou Movitel (86/87) para receber o link de acesso no WhatsApp:
                </p>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                    Número de Telemóvel (+258)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-2 bg-stone-100 dark:bg-stone-800 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-300">
                      +258
                    </span>
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={e => setPhoneInput(e.target.value)}
                      placeholder="841234567"
                      className="flex-1 px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-semibold text-stone-900 dark:text-stone-100 outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setWaStep('otp')}
                  className="w-full py-2.5 bg-[#25D366] hover:bg-[#1DA851] text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
                >
                  Enviar Código para WhatsApp
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                  <span>Código WhatsApp: <strong>782 419</strong></span>
                  <button 
                    onClick={() => {
                      setWaOtp('782419');
                      handleCompleteSocial('Produtor WhatsApp', `${phoneInput}@whatsapp.agroresiliente.mz`, phoneInput);
                    }}
                    className="text-[10px] font-bold underline"
                  >
                    Confirmar
                  </button>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                    Código de 6 dígitos recebido no WhatsApp
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={waOtp}
                    onChange={e => setWaOtp(e.target.value)}
                    placeholder="782419"
                    className="w-full text-center tracking-widest font-mono text-base py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 outline-none"
                  />
                </div>
                <button
                  onClick={() => handleCompleteSocial('Produtor WhatsApp', `${phoneInput}@whatsapp.agroresiliente.mz`, phoneInput)}
                  disabled={loading}
                  className="w-full py-2.5 bg-[#25D366] hover:bg-[#1DA851] text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
                >
                  {loading ? 'A autenticar sessão...' : 'Entrar na Conta'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* GOV.MZ / MADER MODAL */}
        {provider === 'gov' && (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-900 text-white flex items-center justify-center mx-auto mb-3">
              <Globe className="w-6 h-6 text-emerald-300" />
            </div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm mb-1">
              Portal do Produtor · Gov.mz & MADER
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
              Acesso unificado com o Registo Nacional de Produtores Agrícolas de Moçambique.
            </p>
            <button
              onClick={() => handleCompleteSocial('Técnico Extensionista MADER', 'mader.homoine@gov.mz', '876473432')}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
            >
              {loading ? 'A validar credencial governamental...' : 'Autenticar com Chave Digital Gov.mz'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
