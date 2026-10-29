import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Phone, 
  Mail, 
  MapPin, 
  Sprout, 
  Briefcase, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { DistrictZone, CropType, UserType, User } from '../types/auth';
import { StorageService } from '../services/storage';

interface RegisterFormProps {
  onSuccessRegister: (user: User) => void;
  onRequestLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccessRegister,
  onRequestLogin
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [zone, setZone] = useState<DistrictZone>('Homoíne-Sede');
  const [crop, setCrop] = useState<CropType>('Milho');
  const [type, setType] = useState<UserType>('Familiar');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [enable2FA, setEnable2FA] = useState(true);
  const [consent, setConsent] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Phone format check for Mozambique
    const cleanPhone = phone.replace(/\s/g, '').replace(/^\+258/, '');
    if (!/^[8][2-7]\d{7}$/.test(cleanPhone)) {
      setError('Insira um número de telemóvel Moçambicano válido (ex: 84xxxxxxx ou 87xxxxxxx).');
      return;
    }

    if (password.length < 8) {
      setError('A palavra-passe deve conter pelo menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As palavras-passe não coincidem.');
      return;
    }

    if (!consent) {
      setError('É necessário autorizar os termos e política de privacidade de dados agrícolas.');
      return;
    }

    // Check existing
    if (StorageService.findUser(cleanPhone) || (email && StorageService.findUser(email))) {
      setError('Já existe um produtor registado com este telemóvel ou e-mail.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const newUser: User = {
        id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: name.trim(),
        phone: cleanPhone,
        email: email.trim().toLowerCase(),
        zone,
        crop,
        type,
        password,
        plan: 'Gratuita',
        createdAt: new Date().toISOString(),
        twoFactorEnabled: enable2FA,
        twoFactorSecret: enable2FA ? 'JBSWY3DPEHPK3PXP' : undefined,
        biometricRegistered: false,
        backupCodes: StorageService.generateBackupCodes(),
        lastLoginAt: new Date().toISOString()
      };

      StorageService.saveUser(newUser);
      StorageService.logAction(newUser.id, 'Criação de Conta de Produtor', 'success');

      setIsLoading(false);
      onSuccessRegister(newUser);
    }, 500);
  };

  // Password entropy tests
  const passLength = password.length >= 8;
  const passUpper = /[A-Z]/.test(password);
  const passNumber = /[0-9]/.test(password);
  const passSpecial = /[^A-Za-z0-9]/.test(password);

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Nome Completo
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Maria João Tembe"
                className="w-full pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-emerald-500"
              />
              <UserIcon className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Telemóvel (M-Pesa / e-Mola)
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Ex: 84xxxxxxx ou 87xxxxxxx"
                className="w-full pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-emerald-500"
              />
              <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              E-mail (opcional)
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="produtor@exemplo.com"
                className="w-full pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-emerald-500"
              />
              <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Zona / Localidade */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Distrito / Zona
            </label>
            <div className="relative">
              <select
                value={zone}
                onChange={e => setZone(e.target.value as DistrictZone)}
                className="w-full pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-emerald-500 appearance-none"
              >
                <option value="Homoíne-Sede">Homoíne-Sede</option>
                <option value="Maculuve">Maculuve</option>
                <option value="Nhanombe">Nhanombe</option>
                <option value="Inhambane-Cidade">Inhambane-Cidade</option>
                <option value="Maxixe">Maxixe</option>
                <option value="Massinga">Massinga</option>
                <option value="Outra zona de Homoíne">Outra zona</option>
              </select>
              <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Cultura Principal */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Principal Cultura
            </label>
            <div className="relative">
              <select
                value={crop}
                onChange={e => setCrop(e.target.value as CropType)}
                className="w-full pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-emerald-500 appearance-none"
              >
                <option value="Mandioca">Mandioca</option>
                <option value="Milho">Milho</option>
                <option value="Amendoim">Amendoim</option>
                <option value="Feijão nhemba">Feijão nhemba</option>
                <option value="Mapira">Mapira</option>
                <option value="Caju">Caju</option>
                <option value="Hortícolas">Hortícolas</option>
                <option value="Batata-doce">Batata-doce</option>
                <option value="Gergelim">Gergelim</option>
                <option value="Banana">Banana</option>
                <option value="Coco">Coco</option>
                <option value="Feijão boer">Feijão boer</option>
              </select>
              <Sprout className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Tipo de Produtor */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Perfil do Produtor
            </label>
            <div className="relative">
              <select
                value={type}
                onChange={e => setType(e.target.value as UserType)}
                className="w-full pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-emerald-500 appearance-none"
              >
                <option value="Familiar">Familiar</option>
                <option value="Associado">Associado</option>
                <option value="Jovem produtor">Jovem produtor</option>
                <option value="Mulher chefe de família">Mulher chefe de família</option>
                <option value="Extensionista">Extensionista de Campo</option>
              </select>
              <Briefcase className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Senhas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Palavra-passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 8 carateres"
                className="w-full pl-8 pr-8 py-2 bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-emerald-500 font-mono"
              />
              <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-stone-400"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Confirmar Palavra-passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repita a palavra-passe"
                className="w-full pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-emerald-500 font-mono"
              />
              <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Password strength visual mini bar */}
        <div className="grid grid-cols-4 gap-1 text-[10px] text-stone-500 dark:text-stone-400">
          <div className={`p-1 rounded text-center font-medium ${passLength ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-stone-100 dark:bg-stone-800'}`}>
            8+ Carateres
          </div>
          <div className={`p-1 rounded text-center font-medium ${passUpper ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-stone-100 dark:bg-stone-800'}`}>
            Maiúscula
          </div>
          <div className={`p-1 rounded text-center font-medium ${passNumber ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-stone-100 dark:bg-stone-800'}`}>
            Número
          </div>
          <div className={`p-1 rounded text-center font-medium ${passSpecial ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-stone-100 dark:bg-stone-800'}`}>
            Símbolo
          </div>
        </div>

        {/* 2FA Option Checkbox */}
        <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={enable2FA}
              onChange={e => setEnable2FA(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-emerald-700 focus:ring-emerald-500"
            />
            <div>
              <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 block">
                Ativar Autenticação Multifator (2FA) Recomendado
              </span>
              <span className="text-[11px] text-stone-600 dark:text-stone-400 leading-tight block mt-0.5">
                Protege o seu perfil de produtor e dados financeiros do M-Pesa contra acessos não autorizados.
              </span>
            </div>
          </label>
        </div>

        {/* Consent Checkbox */}
        <label className="flex items-start gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={e => setConsent(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded text-emerald-700 focus:ring-emerald-500"
          />
          <span className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
            Autorizo o tratamento dos dados da minha machamba para alertas de seca, cotações de mercado e assistência técnica em Homoíne.
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !passLength}
          className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm shadow-emerald-700/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <span>A criar conta de produtor...</span>
          ) : (
            <>
              <span>Concluir Registo e Aceder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-4 text-center text-xs text-stone-500 dark:text-stone-400">
        <span>Já tem conta registada? </span>
        <button
          type="button"
          onClick={onRequestLogin}
          className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
        >
          Entrar aqui
        </button>
      </div>
    </div>
  );
};
