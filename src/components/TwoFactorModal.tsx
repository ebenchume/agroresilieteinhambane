import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, KeyRound, MessageSquare, AlertCircle, ArrowLeft, X, Smartphone } from 'lucide-react';
import { User } from '../types/auth';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  user
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [method, setMethod] = useState<'totp' | 'sms' | 'backup'>('totp');
  const [backupCode, setBackupCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [smsTimer, setSmsTimer] = useState(45);
  const [simulatedSmsCode, setSimulatedSmsCode] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setError('');
      setMethod('totp');
      setBackupCode('');
      setSmsSent(false);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (smsSent && smsTimer > 0) {
      interval = setInterval(() => {
        setSmsTimer(t => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [smsSent, smsTimer]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, val: string) => {
    // Only accept numeric
    const cleanVal = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);
    setError('');

    // Auto advance
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit when all 6 digits entered
    if (cleanVal && index === 5 && newDigits.every(d => d !== '')) {
      verifyCode(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newDigits = pasted.split('');
      setDigits(newDigits);
      inputRefs.current[5]?.focus();
      verifyCode(pasted);
    }
  };

  const verifyCode = (code: string) => {
    setIsVerifying(true);
    setError('');

    setTimeout(() => {
      // In this environment, simulate realistic TOTP validation:
      // Accepts any 6-digit code or specific simulated SMS code
      if (method === 'sms' && simulatedSmsCode && code !== simulatedSmsCode) {
        setError(`Código SMS incorrecto. Utilize o código de teste: ${simulatedSmsCode}`);
        setIsVerifying(false);
        return;
      }

      if (code.length === 6) {
        setIsVerifying(false);
        onSuccess();
      } else {
        setError('O código deve conter 6 dígitos numéricos.');
        setIsVerifying(false);
      }
    }, 600);
  };

  const verifyBackupCode = () => {
    const clean = backupCode.trim().replace(/\s/g, '');
    const validCodes = user.backupCodes.map(c => c.replace(/\s/g, ''));
    
    // Accept valid format XXXX-XXXX or pre-stored codes
    if (validCodes.includes(clean) || /^\d{4}-\d{4}$/.test(clean)) {
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        onSuccess();
      }, 500);
    } else {
      setError(`Código de emergência inválido. Exemplo válido: ${user.backupCodes[0] || '8421-9920'}`);
    }
  };

  const handleSendSms = () => {
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedSmsCode(generated);
    setSmsSent(true);
    setSmsTimer(45);
    setDigits(['', '', '', '', '', '']);
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 50);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
            Autenticação de Dois Factores (2FA)
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto">
            {method === 'totp' && 'Insira o código de 6 dígitos gerado pela sua aplicação de autenticação (Google Authenticator ou similar).'}
            {method === 'sms' && `Insira o código de 6 dígitos enviado por SMS para o telemóvel +258 ${user.phone.slice(-6)}.`}
            {method === 'backup' && 'Insira um dos seus códigos de recuperação de 8 dígitos guardados durante a ativação.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Simulated SMS Alert Banner */}
        {method === 'sms' && simulatedSmsCode && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              Código SMS de Teste: <strong>{simulatedSmsCode}</strong>
            </span>
            <button
              onClick={() => {
                setDigits(simulatedSmsCode.split(''));
                verifyCode(simulatedSmsCode);
              }}
              className="text-[11px] underline font-semibold hover:text-emerald-900"
            >
              Preencher automático
            </button>
          </div>
        )}

        {/* 6-Digit PIN input for TOTP & SMS */}
        {(method === 'totp' || method === 'sms') && (
          <div className="space-y-4">
            <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={el => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleDigitChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  disabled={isVerifying}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl font-bold bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/20 text-stone-900 dark:text-stone-100 transition-all outline-none"
                />
              ))}
            </div>

            <div className="text-center">
              {method === 'totp' && (
                <span className="text-[11px] text-stone-400 dark:text-stone-500">
                  Dica de teste: Digite qualquer código de 6 dígitos (ex: <strong>123456</strong>)
                </span>
              )}
              {method === 'sms' && (
                <div className="text-xs text-stone-500 dark:text-stone-400">
                  {smsSent ? (
                    smsTimer > 0 ? (
                      <span>Reenviar SMS em {smsTimer}s</span>
                    ) : (
                      <button 
                        onClick={handleSendSms}
                        className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                      >
                        Reenviar código por SMS
                      </button>
                    )
                  ) : (
                    <button 
                      onClick={handleSendSms}
                      className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-lg font-semibold hover:bg-emerald-200"
                    >
                      Disparar SMS para +258 {user.phone}
                    </button>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => verifyCode(digits.join(''))}
              disabled={isVerifying || digits.some(d => d === '')}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {isVerifying ? 'A validar código...' : 'Confirmar e Entrar'}
            </button>
          </div>
        )}

        {/* Backup Code Form */}
        {method === 'backup' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                Código de Emergência (Formato: 0000-0000)
              </label>
              <input
                type="text"
                placeholder="Ex: 8421-9920"
                value={backupCode}
                onChange={e => setBackupCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-center font-mono text-sm uppercase tracking-wider text-stone-900 dark:text-stone-100 outline-none focus:border-emerald-500"
              />
              <span className="block text-[11px] text-stone-400 mt-1">
                Código de exemplo registado: <strong>{user.backupCodes[0] || '8421-9920'}</strong>
              </span>
            </div>

            <button
              onClick={verifyBackupCode}
              disabled={isVerifying || !backupCode.trim()}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {isVerifying ? 'A validar código de backup...' : 'Entrar com Código de Emergência'}
            </button>
          </div>
        )}

        {/* Alternative Methods Switcher */}
        <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 space-y-2">
          {method !== 'totp' && (
            <button
              onClick={() => { setMethod('totp'); setError(''); }}
              className="w-full py-1.5 text-xs text-stone-600 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Usar aplicação autenticadora (TOTP)</span>
            </button>
          )}

          {method !== 'sms' && (
            <button
              onClick={() => { setMethod('sms'); setError(''); handleSendSms(); }}
              className="w-full py-1.5 text-xs text-stone-600 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Receber código por SMS no telemóvel</span>
            </button>
          )}

          {method !== 'backup' && (
            <button
              onClick={() => { setMethod('backup'); setError(''); }}
              className="w-full py-1.5 text-xs text-stone-600 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Perdeu o telemóvel? Usar código de emergência</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
