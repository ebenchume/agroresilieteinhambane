import React, { useState, useEffect } from 'react';
import { Fingerprint, CheckCircle2, AlertCircle, X, Shield, Smartphone } from 'lucide-react';
import { User } from '../types/auth';
import { BiometricsService } from '../services/biometrics';

interface BiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  mode: 'login' | 'register';
  targetUser?: User | null;
}

export const BiometricModal: React.FC<BiometricModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode,
  targetUser
}) => {
  const [status, setStatus] = useState<'prompt' | 'scanning' | 'success' | 'error'>('prompt');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStatus('prompt');
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerScan = async () => {
    setStatus('scanning');
    setErrorMessage('');

    // Trigger light haptic if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([20, 50, 20]);
      } catch {}
    }

    try {
      if (mode === 'login') {
        if (!targetUser) {
          // If no specific target, default to pre-seeded demo user Maria or first with biometric
          const users = JSON.parse(localStorage.getItem('agro_users_v2') || '[]');
          const candidate = users.find((u: User) => u.biometricRegistered) || users[0];
          if (!candidate) {
            throw new Error('Nenhuma conta com biometria configurada. Entre com telefone e ative nas definições.');
          }
          const result = await BiometricsService.authenticateBiometric(candidate);
          if (!result.success) throw new Error(result.error);
          setStatus('success');
          setTimeout(() => {
            onSuccess(candidate);
          }, 900);
        } else {
          const result = await BiometricsService.authenticateBiometric(targetUser);
          if (!result.success) throw new Error(result.error);
          setStatus('success');
          setTimeout(() => {
            onSuccess(targetUser);
          }, 900);
        }
      } else {
        // Registration mode
        if (!targetUser) throw new Error('Utilizador não selecionado para registo biométrico.');
        const result = await BiometricsService.registerBiometric(targetUser);
        if (!result.success) throw new Error(result.error);

        const updatedUser: User = {
          ...targetUser,
          biometricRegistered: true,
          biometricCredentialId: result.credentialId,
          biometricDeviceName: result.authenticatorType || 'Sensor do Dispositivo (FIDO2)'
        };
        setStatus('success');
        setTimeout(() => {
          onSuccess(updatedUser);
        }, 900);
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Falha na leitura biométrica. Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 relative overflow-hidden text-center"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <h3 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
          {mode === 'login' ? 'Autenticação Biométrica' : 'Ativar Biometria / Passkey'}
        </h3>
        
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 mb-6 max-w-xs mx-auto">
          {mode === 'login' 
            ? 'Aproxime o dedo do sensor biométrico ou use o Face ID do seu dispositivo para aceder rapidamente.'
            : 'Vincule a impressão digital ou reconhecimento facial do seu telemóvel para logins seguros sem senha.'}
        </p>

        {/* Sensor Visual Area */}
        <div className="my-6 flex flex-col items-center justify-center">
          <div className="relative">
            {status === 'scanning' && (
              <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></span>
            )}
            
            <button
              onClick={triggerScan}
              disabled={status === 'scanning' || status === 'success'}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 ${
                status === 'success'
                  ? 'bg-emerald-600 text-white'
                  : status === 'error'
                  ? 'bg-red-50 dark:bg-red-950/40 text-red-600 border-2 border-red-300 dark:border-red-800'
                  : status === 'scanning'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border-2 border-emerald-500 scale-105'
                  : 'bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-stone-700 dark:text-stone-200 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 border-2 border-dashed border-stone-300 dark:border-stone-700'
              }`}
            >
              {status === 'success' ? (
                <CheckCircle2 className="w-12 h-12" />
              ) : status === 'error' ? (
                <AlertCircle className="w-12 h-12" />
              ) : (
                <Fingerprint className={`w-12 h-12 ${status === 'scanning' ? 'animate-pulse' : ''}`} />
              )}
            </button>
          </div>

          <div className="mt-4 min-h-[24px]">
            {status === 'prompt' && (
              <p className="text-xs font-medium text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-stone-400" />
                Toque no ícone para iniciar verificação
              </p>
            )}
            {status === 'scanning' && (
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 animate-pulse">
                A ler sensor biométrico...
              </p>
            )}
            {status === 'success' && (
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Identidade biométrica confirmada!
              </p>
            )}
            {status === 'error' && (
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-2 flex flex-col gap-2">
          {status !== 'success' && (
            <button
              onClick={triggerScan}
              disabled={status === 'scanning'}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {status === 'scanning' ? 'Verificando...' : 'Iniciar Sensor Biométrico'}
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 px-4 text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          >
            Voltar ao método tradicional
          </button>
        </div>
      </div>
    </div>
  );
};
