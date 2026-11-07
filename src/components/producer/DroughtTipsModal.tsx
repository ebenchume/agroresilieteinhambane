import React from 'react';
import { AriaModal } from '../AriaModal';
import { 
  Sun, 
  Droplets, 
  ShieldCheck, 
  Sprout, 
  Clock, 
  Layers, 
  CheckCircle2, 
  Flame,
  AlertTriangle
} from 'lucide-react';

interface DroughtTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sunlightMode?: boolean;
}

const DROUGHT_TECHNIQUES = [
  {
    title: '1. Cobertura Morta (Mulching) de 5 a 10 cm',
    icon: Layers,
    badge: 'Poupa 40% de Água',
    description: 'Em solos arenosos de Inhambane (Panda e Homoíne), a terra descoberta aquece até 50°C e a água evapora em 3 horas. Cubra toda a terra ao redor das plantas com palha seca, folhas de bananeira, capim ou casca de coco.',
    steps: [
      'Corte o capim seco e espalhe numa camada grossa.',
      'Não encoste a palha molhada diretamente no caule da planta para evitar fungos.',
      'Reponha o capim a cada 3 a 4 semanas.'
    ]
  },
  {
    title: '2. Covas de Retenção de Água (Técnica Zaï)',
    icon: Droplets,
    badge: 'Segura o Orvalho',
    description: 'Abra covas com 30 cm de largura e 20 cm de profundidade. No fundo, coloque duas mãos cheias de estrume de cabrito ou vaca bem seco com cinza e um pouco de capim, depois cubra levemente de terra e plante.',
    steps: [
      'A cova funciona como uma esponja que retém a humidade no subsolo.',
      'Permite que a raiz do milho ou da mandioca desça fundo onde a terra está fresca.'
    ]
  },
  {
    title: '3. Rega Inteligente nas Horas Frescas',
    icon: Clock,
    badge: '05:30 às 07:00',
    description: 'Nunca regue entre as 10:00 e as 15:30. A água ferve na terra quente e queima as raízes capilares. Regue sempre bem cedo ou logo após o pôr do sol, direcionando o fluxo diretamente para a base e nunca sobre as folhas.',
    steps: [
      'Use garrafas pet furadas enterradas de cabeça para baixo para rega gota-a-gota lenta.',
      'Aproveite a água de lavar legumes da cozinha (sem sabão agressivo).'
    ]
  },
  {
    title: '4. Variedades Tolerantes à Estiagem em Moçambique',
    icon: Sprout,
    badge: 'Sementes do IIAM',
    description: 'Em anos de seca (influência de El Niño), troque sementes vulneráveis por variedades melhoradas e testadas para o clima semi-árido de Inhambane:',
    steps: [
      'Milho: Matuba e PAN 53 (ciclo precoce de 90 a 105 dias).',
      'Mandioca: Variedade Chinamuna (tubérculos profundos e folhagem resistente).',
      'Amendoim: Bebiano Branco e Nametil (alta fixação de azoto e tolerância à seca).'
    ]
  },
  {
    title: '5. Consorciação Protetora (Milho + Feijão Nhemba)',
    icon: ShieldCheck,
    badge: 'Sombra Viva',
    description: 'Plante feijão nhemba ou amendoim rasteiro nas entrelinhas do milho. O feijão cobre a terra como um tapete verde, mantém o solo fresco, impede o capim daninho e alimenta o milho com azoto natural.',
    steps: [
      'Proporção recomendada: 1 linha de feijão para cada linha de milho.',
      'Garante colheita de feijão mesmo se o milho falhar por falta de chuva.'
    ]
  }
];

export const DroughtTipsModal: React.FC<DroughtTipsModalProps> = ({
  isOpen,
  onClose,
  sunlightMode = false
}) => {
  return (
    <AriaModal
      isOpen={isOpen}
      onClose={onClose}
      title="Dicas para Seca & Resiliência Hídrica"
      maxWidth="max-w-2xl"
      className={sunlightMode ? 'bg-black text-white border-4 border-yellow-400' : ''}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              sunlightMode 
                ? 'bg-yellow-400 text-black font-black' 
                : 'bg-amber-600 text-white shadow-sm'
            }`}>
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${sunlightMode ? 'text-yellow-400' : 'text-stone-900 dark:text-stone-100'}`}>
                Dicas para Seca & Resiliência Hídrica
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Guia prático para os solos arenosos e clima de Inhambane
              </p>
            </div>
          </div>
        </div>

        {/* Banner */}
        <div className={`p-3 rounded-2xl border flex items-start gap-3 ${
          sunlightMode
            ? 'bg-yellow-400 text-black border-yellow-400'
            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
        }`}>
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
          <div className="text-xs">
            <strong className="block font-bold">Regra de Ouro em Inhambane:</strong>
            "Terra nua perde água; terra coberta guarda a vida da machamba." Proteja sempre o solo com cobertura morta (mulching) antes que o sol quente do meio-dia queime a humidade.
          </div>
        </div>

        {/* Techniques List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {DROUGHT_TECHNIQUES.map((tech, index) => {
            const Icon = tech.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-2xl border ${
                  sunlightMode
                    ? 'bg-stone-900 border-stone-700 text-white'
                    : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      {tech.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {tech.badge}
                  </span>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-2.5">
                  {tech.description}
                </p>

                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                    Como executar na machamba:
                  </span>
                  <ul className="space-y-1">
                    {tech.steps.map((step, sIdx) => (
                      <li key={sIdx} className="text-[11px] text-stone-700 dark:text-stone-300 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors ${
            sunlightMode
              ? 'bg-yellow-400 text-black font-black'
              : 'bg-stone-800 hover:bg-stone-900 text-white dark:bg-stone-700 dark:hover:bg-stone-600'
          }`}
        >
          Entendido, Voltar à Machamba
        </button>
      </div>
    </AriaModal>
  );
};
