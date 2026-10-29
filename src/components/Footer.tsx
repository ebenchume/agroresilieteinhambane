import React from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  Phone, 
  Mail, 
  Globe, 
  Lock, 
  ExternalLink,
  Award,
  Radio,
  CloudRain,
  Sprout,
  CreditCard
} from 'lucide-react';

interface FooterProps {
  onOpenTestRunner: () => void;
}

interface Partner {
  id: string;
  name: string;
  fullName: string;
  category: 'Institucional' | 'Governo & Extensão' | 'Meteorologia' | 'Telecomunicações & Pagamentos';
  description: string;
  badge: string;
  accentColor: string;
}

const PARTNERS: Partner[] = [
  {
    id: 'citt',
    name: 'CITT',
    fullName: 'Centro de Investigação e Transferência de Tecnologia',
    category: 'Institucional',
    description: 'Investigação científica agrária, transferência de tecnologias rurais e multiplicação de sementes resilientes.',
    badge: 'Inovação & Pesquisa Agrária',
    accentColor: 'from-emerald-600 to-teal-700'
  },
  {
    id: 'sdae',
    name: 'SDAE',
    fullName: 'Serviços Distritais de Actividades Económicas',
    category: 'Governo & Extensão',
    description: 'Extensão rural no distrito de Homoíne, assistência técnica direta aos agricultores e feiras agrárias.',
    badge: 'Extensão Rural Homoíne',
    accentColor: 'from-green-600 to-emerald-800'
  },
  {
    id: 'inam',
    name: 'INAM',
    fullName: 'Instituto Nacional de Meteorologia de Moçambique',
    category: 'Meteorologia',
    description: 'Monitoramento agrometeorológico, boletins de previsão decendial e avisos de cheias e ciclones em Inhambane.',
    badge: 'Previsão & Alertas Climáticos',
    accentColor: 'from-sky-600 to-blue-800'
  },
  {
    id: 'tmcel',
    name: 'TMCEL',
    fullName: 'Telecomunicações de Moçambique',
    category: 'Telecomunicações & Pagamentos',
    description: 'Infraestrutura nacional de telecomunicações móveis e suporte ao canal gratuito USSD *123# e SMS.',
    badge: 'Rede & Canal USSD *123#',
    accentColor: 'from-amber-600 to-orange-700'
  },
  {
    id: 'vodacom',
    name: 'VODACOM',
    fullName: 'Vodacom Moçambique / M-Pesa',
    category: 'Telecomunicações & Pagamentos',
    description: 'Conectividade digital de alta velocidade e integração de pagamentos agrícolas e liquidações via M-Pesa.',
    badge: 'Conectividade & M-Pesa',
    accentColor: 'from-red-600 to-rose-700'
  },
  {
    id: 'movitel',
    name: 'MOVITEL',
    fullName: 'Movitel Moçambique / e-Mola',
    category: 'Telecomunicações & Pagamentos',
    description: 'Ampla cobertura de sinal nas comunidades rurais de Inhambane e inclusão financeira com a carteira móvel e-Mola.',
    badge: 'Cobertura Rural & e-Mola',
    accentColor: 'from-orange-500 to-amber-600'
  }
];

export const Footer: React.FC<FooterProps> = ({ onOpenTestRunner }) => {
  return (
    <footer className="mt-16 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/80 text-stone-600 dark:text-stone-400 py-12 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* PARCEIROS E PATROCINADORES OFICIAIS */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Parcerias Estratégicas para o Desenvolvimento Agrário
                </span>
              </div>
              <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100 mt-1">
                Parceiros Institucionais & Patrocinadores Oficiais
              </h3>
            </div>
            <p className="text-xs text-stone-500 max-w-md text-left sm:text-right">
              Iniciativa conjunta para fortalecer a resiliência agrícola dos produtores familiares de Inhambane.
            </p>
          </div>

          {/* Grid de Parceiros: CITT, SDAE, INAM, TMCEL, VODACOM, MOVITEL */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {PARTNERS.map((partner) => (
              <div
                key={partner.id}
                className="group p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60 hover:border-emerald-500/50 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  {/* Logo Box */}
                  <div className={`w-full h-11 rounded-lg bg-gradient-to-r ${partner.accentColor} text-white flex items-center justify-center font-extrabold text-sm tracking-wider shadow-xs`}>
                    {partner.name}
                  </div>

                  {/* Badge */}
                  <span className="inline-block text-[9px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded leading-tight">
                    {partner.badge}
                  </span>

                  {/* Full Name */}
                  <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 line-clamp-2 leading-snug">
                    {partner.fullName}
                  </h4>

                  {/* Description */}
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-3">
                    {partner.description}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-stone-200/60 dark:border-stone-700/40 flex items-center justify-between text-[9px] text-stone-400">
                  <span>Inhambane, MZ</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Ativo</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Existing Footer Links and Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-4 border-t border-stone-200 dark:border-stone-800">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-display font-bold text-sm">
                A
              </div>
              <span className="font-display font-bold text-base text-stone-900 dark:text-stone-100">
                AgroResiliente Inhambane
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md leading-relaxed">
              Plataforma digital integrada para pequenos e médios produtores familiares. Acesso multicanal por USSD (*123#), SMS (123) e Portal Web moderno com autenticação biométrica, 2FA e relatórios PDF.
            </p>
            <div className="flex items-center gap-3 text-xs pt-1">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Dados Cifrados TLS 1.3</span>
              </span>
              <span className="text-stone-300 dark:text-stone-700">·</span>
              <span className="flex items-center gap-1.5 text-stone-500">
                <Lock className="w-3.5 h-3.5" />
                <span>Autenticação FIDO2 / WebAuthn</span>
              </span>
            </div>
          </div>

          {/* District & Contacts */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-xs text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              Contactos no Terreno
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <a href="https://agroresiliente.co.mz" target="_blank" rel="noopener" className="hover:text-emerald-700 dark:hover:text-emerald-400">
                  agroresiliente.co.mz
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <a href="tel:+258876473432" className="hover:text-emerald-700 dark:hover:text-emerald-400 font-mono">
                  +258 876 473 432
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <a href="mailto:ebenchume@sapo.mz" className="hover:text-emerald-700 dark:hover:text-emerald-400">
                  ebenchume@sapo.mz
                </a>
              </li>
              <li className="text-stone-400 text-[11px] pt-1">
                Distrito de Homoíne · Província de Inhambane · Moçambique
              </li>
            </ul>
          </div>

          {/* Quick Tools & Verification */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-xs text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              Ferramentas & Auditoria
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenTestRunner}
                  className="hover:text-emerald-700 dark:hover:text-emerald-400 text-left font-medium"
                >
                  Executar Testes de Segurança (CI/CD)
                </button>
              </li>
              <li>
                <span className="text-stone-500">Canal USSD: </span>
                <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded text-[11px] font-mono font-bold">*123#</code>
              </li>
              <li>
                <span className="text-stone-500">Canal SMS: </span>
                <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded text-[11px] font-mono font-bold">123</code>
              </li>
              <li>
                <span className="text-stone-400 text-[11px]">Compatibilidade com Android, iOS e Navegadores Modernos</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <p>© 2026 AgroResiliente Inhambane. Todos os direitos reservados.</p>
          <p>Em colaboração com CITT, SDAE Homoíne, INAM, TMCEL, Vodacom e Movitel.</p>
        </div>
      </div>
    </footer>
  );
};
