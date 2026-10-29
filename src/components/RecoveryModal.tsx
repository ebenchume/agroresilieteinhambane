import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, ArrowRight, X, AlertCircle, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { StorageService } from '../services/storage';
import { User } from '../types/auth';

interface RecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const RecoveryModal: React.FC<RecoveryModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<'email' | 'otp' | 'newPassword' | 'completed'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [simulatedCode, setSimulatedCode] = useState('');
  const [matchedUser, setMatchedUser] = useState<User | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setMatchedUser(null);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const user = StorageService.findUser(cleanEmail);

    if (!user) {
      setError('Nenhum produtor registado com este endereço de e-mail.');
      return;
    }

    setMatchedUser(user);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedCode(code);
    setTimer(60);
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.trim() === simulatedCode || otp.trim() === '123456') {
      setStep('newPassword');
    } else {
      setError(`Código de recuperação incorrecto. Utilize o código de teste enviado: ${simulatedCode}`);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('A nova palavra-passe deve ter pelo menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As palavras-passe não coincidem.');
      return;
    }

    if (!matchedUser) return;

    // Update user password in storage
    const updatedUser: User = {
      ...matchedUser,
      password: newPassword,
    };
    StorageService.saveUser(updatedUser);
    StorageService.logAction(updatedUser.id, 'Redefinição de Palavra-passe por E-mail', 'success');

    setStep('completed');
    setTimeout(() => {
      onSuccess(updatedUser);
    }, 1200);
  };

  // Password strength checks
  const passLength = newPassword.length >= 8;
  const passUpper = /[A-Z]/.test(newPassword);
  const passNumber = /[0-9]/.test(newPassword);
  const passSpecial = /[^A-Za-z0-9]/.test(newPassword);

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
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
            Recuperação Rápida de Senha
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto">
            {step === 'email' && 'Informe o seu e-mail de produtor para receber um código de segurança instantâneo.'}
            {step === 'otp' && `Insira o código de 6 dígitos que enviámos para ${email}.`}
            {step === 'newPassword' && 'Crie uma nova palavra-passe forte para proteger a sua conta agrícola.'}
            {step === 'completed' && 'Palavra-passe alterada com sucesso! A iniciar sessão...'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 'email' && (
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                E-mail da sua conta
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="exemplo@sapo.mz ou email@dominio.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
              <div className="mt-2 text-[11px] text-stone-500 flex items-center justify-between">
                <span>Contas demo para teste rápido:</span>
                <button
                  type="button"
                  onClick={() => setEmail('ebenchume@sapo.mz')}
                  className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                >
                  ebenchume@sapo.mz
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Enviar Código de Recuperação</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {/* Simulated Email Notification Preview */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center justify-between font-semibold mb-1">
                <span>E-mail Seguro Enviado!</span>
                <span className="font-mono text-sm tracking-wider font-bold">{simulatedCode}</span>
              </div>
              <p className="text-[11px] opacity-90">
                Código de teste gerado: clique abaixo para preencher instantaneamente.
              </p>
              <button
                type="button"
                onClick={() => setOtp(simulatedCode)}
                className="mt-2 px-2.5 py-1 bg-emerald-700 text-white rounded text-[10px] font-bold"
              >
                Auto-preencher ({simulatedCode})
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Código de 6 Dígitos
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2.5 text-center font-mono text-lg font-bold tracking-widest bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>{timer > 0 ? `Reenviar código em ${timer}s` : 'Não recebeu o e-mail?'}</span>
              {timer === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const nextCode = Math.floor(100000 + Math.random() * 900000).toString();
                    setSimulatedCode(nextCode);
                    setTimer(60);
                  }}
                  className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                >
                  Pedir novo código
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={otp.length !== 6}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              Validar Código e Prosseguir
            </button>
          </form>
        )}

        {/* STEP 3: Set New Password */}
        {step === 'newPassword' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Nova Palavra-passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full pr-10 pl-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength checklist */}
              <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
                <div className={`flex items-center gap-1.5 ${passLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${passLength ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'}`} />
                  Pelo menos 8 carateres
                </div>
                <div className={`flex items-center gap-1.5 ${passUpper ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${passUpper ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'}`} />
                  Letra maiúscula (A-Z)
                </div>
                <div className={`flex items-center gap-1.5 ${passNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${passNumber ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'}`} />
                  Número (0-9)
                </div>
                <div className={`flex items-center gap-1.5 ${passSpecial ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${passSpecial ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'}`} />
                  Símbolo especial (!@#)
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Confirmar Nova Palavra-passe
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova palavra-passe"
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={!passLength || !passUpper || !passNumber || newPassword !== confirmPassword}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              Guardar Nova Senha e Conectar
            </button>
          </form>
        )}

        {/* STEP 4: Completed */}
        {step === 'completed' && (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
              Palavra-passe Redefinida!
            </h4>
            <p className="text-xs text-stone-500 mt-1">
              A carregar a sua conta de produtor com segurança reforçada...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
