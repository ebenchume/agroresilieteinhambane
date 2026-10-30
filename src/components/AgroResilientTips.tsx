import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  Share2,
  CheckCircle2,
  Leaf,
  Droplets,
  Sun,
  ShieldCheck,
  Layers,
  BookOpen,
  Filter,
  Check,
  Clock,
  Compass
} from 'lucide-react';
import { User, CropType } from '../types/auth';
import { speechService } from '../services/speech';
import { StorageService } from '../services/storage';

export type AgriculturalSeasonPhase = 
  | 'preparo-sementeira' 
  | 'sacha-maneio' 
  | 'maturacao-precolheita' 
  | 'colheita-armazenamento' 
  | 'epoca-fresca-baixas';

export interface AgroResilientTip {
  id: string;
  title: string;
  phase: AgriculturalSeasonPhase;
  phaseLabel: string;
  seasonPeriod: string; // e.g. 'Outubro - Novembro'
  isCurrentSeason: boolean;
  crop: CropType | 'Geral';
  resiliencePillar: 'Conservação de Humidade' | 'Fertilidade Biológica' | 'Defesa Fitossanitária' | 'Resistência a Choques Climáticos' | 'Pós-Colheita Segura';
  validationAgency: 'SDAE Homoíne' | 'CITT UEM' | 'INAM / DTA' | 'Investigação IIAM';
  climateBenefit: string;
  summary: string;
  detailedSteps: string[];
  traditionalPracticeInsight: string;
  recommendedAction: string;
}

export const INHAMBANE_SEASON_PHASES: {
  id: AgriculturalSeasonPhase;
  name: string;
  period: string;
  months: number[]; // 0-indexed month numbers
  description: string;
}[] = [
  {
    id: 'preparo-sementeira',
    name: '1ª Fase: Preparação e Sementeiras da Campanha Principal',
    period: 'Outubro - Novembro',
    months: [9, 10], // Oct, Nov
    description: 'Início da época chuvosa em Inhambane. Momento crítico para semear após chuvas acumuladas superiores a 25mm e mobilização conservacionista do solo.'
  },
  {
    id: 'sacha-maneio',
    name: '2ª Fase: Sachas, Drenagem e Proteção Fitossanitária',
    period: 'Dezembro - Janeiro',
    months: [11, 0], // Dec, Jan
    description: 'Pico de precipitação e risco de tempestades tropicais. Sachas precoces, regos de nível e controlo preventivo da lagarta-do-cartucho.'
  },
  {
    id: 'maturacao-precolheita',
    name: '3ª Fase: Enchimento, Maturação e Pré-Colheita',
    period: 'Fevereiro - Março',
    months: [1, 2], // Feb, Mar
    description: 'Secagem natural nas machambas, maturação fisiológica do milho, amendoim e feijão nhemba. Vistoria contra podridão e ataque de pássaros.'
  },
  {
    id: 'colheita-armazenamento',
    name: '4ª Fase: Colheita e Armazenamento Hermético',
    period: 'Abril - Maio',
    months: [3, 4], // Apr, May
    description: 'Secagem ao sol até 12% de humidade e conservação em celeiros melhorados de Inhambane com cinza vegetal e sacos herméticos PICS.'
  },
  {
    id: 'epoca-fresca-baixas',
    name: '5ª Fase: 2ª Época nas Baixas e Hortícolas',
    period: 'Junho - Setembro',
    months: [5, 6, 7, 8], // Jun, Jul, Aug, Sep
    description: 'Aproveitamento dos vales húmidos de Homoíne, Maxixe e Morrumbene para hortícolas resilientes com cobertura morta (mulching).'
  }
];

export const RESILIENT_TIPS_DATABASE: AgroResilientTip[] = [
  {
    id: 'tip-solo-zai',
    title: 'Preparo Mínimo e Bacias Zai nos Solos Arenosos de Homoíne',
    phase: 'preparo-sementeira',
    phaseLabel: 'Preparação & Sementeiras',
    seasonPeriod: 'Outubro - Novembro',
    isCurrentSeason: true,
    crop: 'Geral',
    resiliencePillar: 'Conservação de Humidade',
    validationAgency: 'SDAE Homoíne',
    climateBenefit: 'Aumenta a retenção de humidade no solo em até 45% durante estiagens intercalares',
    summary: 'Em solos arenosos vermelhos e cinzentos de Inhambane com baixa matéria orgânica, evite a queima descontrolada da palha. Abertura de microbacias ou covachos zai concentra água e fertilidade biológica.',
    detailedSteps: [
      'Não queime os restos de culturas anteriores; espalhe a biomassa na superfície para proteger a terra contra a insolação intensa.',
      'Abra covas circulares de 20 a 25 cm de diâmetro e 15 cm de profundidade ao longo das curvas de nível.',
      'Coloque 1 a 2 pás de estrume curtido de caprino ou bovino misturado com uma chávena de cinza vegetal de fundo.',
      'Espere pela primeira precipitação firme (>25mm) para semear diretamente nas covas adubadas.'
    ],
    traditionalPracticeInsight: 'Sabedoria local de Inhambane: o estrume curtido com cinza de cajueiro arrefece a cova e atrai micorrizas benéficas que retêm a frescura matinal.',
    recommendedAction: 'Preparar 1/4 hectare com bacias zai antes do encerramento da primeira quinzena chuvosa.'
  },
  {
    id: 'tip-milho-consociacao',
    title: 'Sementeira de Milho Matuba com Feijão Nhemba em Linhas Alternadas',
    phase: 'preparo-sementeira',
    phaseLabel: 'Preparação & Sementeiras',
    seasonPeriod: 'Outubro - Novembro',
    isCurrentSeason: true,
    crop: 'Milho',
    resiliencePillar: 'Fertilidade Biológica',
    validationAgency: 'CITT UEM',
    climateBenefit: 'Fixação de até 35 kg de azoto atmosférico por hectare e seguro contra quebra total de colheita',
    summary: 'A consociação agroecológica de milho precoce tolerante à seca (variedade Matuba) com feijão nhemba rasteiro cria uma cobertura viva do solo e garante alimento proteico mesmo se as chuvas forem irregulares.',
    detailedSteps: [
      'Trace linhas de milho com espaçamento de 80 cm entre linhas e 25 cm entre plantas (1 planta vigorosa por covacho).',
      'Nas entrelinhas do milho, semeie feijão nhemba (variedade IT-18) espaçado a 40 cm.',
      'O feijão nhemba germina rapidamente, cobrindo o solo arenoso e impedindo o nascimento de ervas concorrentes como a tiririca.',
      'Em caso de veranico repentino, o feijão protege a base das raízes do milho contra o sobreaquecimento térmico.'
    ],
    traditionalPracticeInsight: 'Técnica ancestral de Inhambane aprovada pelos extensionistas: a folha do feijão nhemba é colhida gradualmente para matapa verde enquanto a vagem seca.',
    recommendedAction: 'Adquirir sementes certificadas da variedade Matuba e inocular consociação no início de Novembro.'
  },
  {
    id: 'tip-mandioca-manivas',
    title: 'Seleção Rigorosa de Manivas de Mandioca Sadias e Plantio em Ângulo',
    phase: 'preparo-sementeira',
    phaseLabel: 'Preparação & Sementeiras',
    seasonPeriod: 'Outubro - Novembro',
    isCurrentSeason: true,
    crop: 'Mandioca',
    resiliencePillar: 'Resistência a Choques Climáticos',
    validationAgency: 'Investigação IIAM',
    climateBenefit: 'Garante enraizamento profundo até 1,2m, suportando até 4 meses sem chuva regular',
    summary: 'A mandioca é a espinha dorsal da segurança alimentar em Inhambane. Utilizar estacas vigorosas livres de viroses e plantar a 45 graus acelera a brotação e a formação de tubérculos robustos.',
    detailedSteps: [
      'Selecione manivas do terço médio de plantas adultas saudáveis com 10 a 14 meses (variedades Chinamuna, Nikwaha ou Almeirim).',
      'Corte estacas de 20 a 25 cm com corte reto e afiado, contendo entre 5 e 7 gemas vegetativas bem intumescidas.',
      'Rejeite manivas com estrias castanhas na medula interna (sinal de podridão castanha das raízes CBSD).',
      'Enterre 2/3 da estaca no solo ligeiramente inclinado a 45°, apontando as gemas para cima.'
    ],
    traditionalPracticeInsight: 'Nas machambas de Nhanombe e Maculuve, o plantio inclinado facilita a colheita manual sem quebrar as raízes em terra seca.',
    recommendedAction: 'Verificar viveiro comunitário de manivas limpas e substituir talhões velhos degenerados.'
  },
  {
    id: 'tip-pragas-cinza-neem',
    title: 'Controlo Biológico Preventivo da Lagarta-do-Cartucho com Cinza e Neem',
    phase: 'sacha-maneio',
    phaseLabel: 'Sachas & Maneio',
    seasonPeriod: 'Dezembro - Janeiro',
    isCurrentSeason: false,
    crop: 'Milho',
    resiliencePillar: 'Defesa Fitossanitária',
    validationAgency: 'SDAE Homoíne',
    climateBenefit: 'Elimina 80% das infestações iniciais de Spodoptera sem comprar químicos caros ou poluir aquíferos',
    summary: 'Nas primeiras semanas após o surgimento do milho, a borboleta da lagarta-do-cartucho deposita ovos nos cartuchos tenros. A cinza vegetal peneirada e a calda de folhas de Neem atuam como barreira física e repelente natural.',
    detailedSteps: [
      'Vistorie o campo duas vezes por semana nas primeiras horas da manhã, procurando folhas com orifícios tipo vidrilho.',
      'Misture 1 parte de cinza de lenha fina com 1 parte de areia da machamba e deite uma pitada no centro do cartucho de cada milho.',
      'Para calda de Neem: macere 1 kg de folhas frescas de amargosa em 10 litros de água; deixe repousar por 24h e filtre com um pano limpo.',
      'Pulverize ou aspersa com ramos de capim sobre as folhas ao entardecer.'
    ],
    traditionalPracticeInsight: 'O cheiro amargo da azadiractina da folha de Neem quebra o hábito alimentar da lagarta em menos de 48 horas.',
    recommendedAction: 'Preparar cinza de fogão bem peneirada e baldes de maceração de folhas antes do fim de Novembro.'
  },
  {
    id: 'tip-amendoim-roseta',
    title: 'Espaçamento Compacto no Amendoim Bebiano para Quebrar o Ciclo da Roseta',
    phase: 'preparo-sementeira',
    phaseLabel: 'Preparação & Sementeiras',
    seasonPeriod: 'Outubro - Novembro',
    isCurrentSeason: true,
    crop: 'Amendoim',
    resiliencePillar: 'Defesa Fitossanitária',
    validationAgency: 'CITT UEM',
    climateBenefit: 'Inibe a aterragem de afídeos vetores e antecipa a cobertura verde em 18 dias',
    summary: 'O vírus da roseta transmitido por pulgões é o maior causador de perdas no amendoim em Inhambane. Semeando a densidade correta de 50x15cm, as folhas tocam-se cedo, impedindo que o pulgão enxergue solo nu.',
    detailedSteps: [
      'Semeie amendoim Bebiano Branco ou Mamane logo após a primeira chuva consolidada, evitando atrasos para Dezembro.',
      'Adote 50 cm entre camalhões e 15 cm entre sementes (1 semente sã por covacho a 4 cm de profundidade).',
      'Faça a primeira sacha manual aos 15-20 dias com cuidado para não ferir o colo da plântula.',
      'Após o início do desenvolvimento dos esporões (ginóforos), não use mais enxada próxima para não cortar as vagens subterrâneas.'
    ],
    traditionalPracticeInsight: 'Os produtores associados de Homoíne confirmam: campos semeados juntos e densos não apanham amarelecimento de roseta.',
    recommendedAction: 'Garantir teste prévio de germinação em prato de areia com 90%+ de viabilidade da semente.'
  },
  {
    id: 'tip-clima-drenagem-valas',
    title: 'Abertura de Regos em Curva de Nível contra Enxurradas de Ciclones',
    phase: 'sacha-maneio',
    phaseLabel: 'Sachas & Maneio',
    seasonPeriod: 'Dezembro - Janeiro',
    isCurrentSeason: false,
    crop: 'Geral',
    resiliencePillar: 'Resistência a Choques Climáticos',
    validationAgency: 'INAM / DTA',
    climateBenefit: 'Evita a lavagem da camada arável fértil e canaliza água em excesso para pequenas lagoas de retenção',
    summary: 'O Canal de Moçambique gera depressões tropicais intensas entre Dezembro e Fevereiro. Sem valas de nível, chuvas de mais de 80mm em 24h arrastam adubos e plantas jovens.',
    detailedSteps: [
      'Identifique a declividade natural da machamba e marque linhas de contorno utilizando o nível de mangueira ou de quadro em A.',
      'Abra regos de crista com 30 cm de profundidade na parte superior da machamba para desviar a água pesada das vizinhanças.',
      'Plante capim vetiver ou capim elefante nas bordas do rego para segurar o talude arenoso.',
      'Mantenha as saídas dos regos desobstruídas para conduzir a água mansa até depressões naturais sem causar ravinas.'
    ],
    traditionalPracticeInsight: 'Prática recomendada pela Proteção Civil (INGD) e SDAE para proteger as machambas da bacia costeira de Inhambane.',
    recommendedAction: 'Verificar desníveis e valas de drenagem antes da chegada das chuvas de Natal.'
  },
  {
    id: 'tip-colheita-pics-cinza',
    title: 'Secagem ao Sol e Armazenamento em Sacos PICS com Pó de Casca de Coco',
    phase: 'colheita-armazenamento',
    phaseLabel: 'Colheita & Armazenamento',
    seasonPeriod: 'Abril - Maio',
    isCurrentSeason: false,
    crop: 'Milho',
    resiliencePillar: 'Pós-Colheita Segura',
    validationAgency: 'SDAE Homoíne',
    climateBenefit: 'Zero perdas por gorgulho (Sitophilus) por até 12 meses sem veneno químico perigoso',
    summary: 'Até 30% da colheita familiar em Moçambique perde-se nos celeiros tradicionais após a época das chuvas. O método hermético com sacos PICS ou cinza densa preserva o grão para sementeira e alimentação o ano inteiro.',
    detailedSteps: [
      'Colha o milho quando a espiga estiver pendente para baixo e a palha exterior completamente seca.',
      'Seque os grãos sobre esteiras limpas de palmeira ou lonas suspensas do chão, nunca diretamente na areia.',
      'Faça o teste do dente: se o grão estalar sem amassar, está pronto com cerca de 12% a 13% de humidade.',
      'Encha os sacos PICS de camada dupla plástica, amarre cada camada individualmente e guarde sobre estrados de madeira a 30cm do solo.'
    ],
    traditionalPracticeInsight: 'Na falta de sacos PICS, os camponeses misturam 500g de cinza fria de casca de coco com folhas secas de eucalipto para repelir insetos.',
    recommendedAction: 'Limpar e caiar o celeiro de paus com cal ou cinza antes da colheita geral em Abril.'
  },
  {
    id: 'tip-horticolas-mulching',
    title: 'Cobertura Morta Espessa (Mulching) em Canteiros nas Baixas de Homoíne',
    phase: 'epoca-fresca-baixas',
    phaseLabel: 'Época Fresca & Baixas',
    seasonPeriod: 'Junho - Setembro',
    isCurrentSeason: false,
    crop: 'Hortícolas',
    resiliencePillar: 'Conservação de Humidade',
    validationAgency: 'CITT UEM',
    climateBenefit: 'Diminui a temperatura do solo em 6°C e corta pela metade a necessidade de rega manual com regador',
    summary: 'Durante a época fresca, as zonas baixas e margens de riachos de Homoíne e Maxixe sustentam a produção comercial de tomate, couve e cebola. O mulching com capim seco previne o encrostamento do solo e poupa esforço de rega.',
    detailedSteps: [
      'Prepare canteiros elevados de 1 metro de largura com incorporação de composto orgânico bem decomposto.',
      'Após o transplante das mudas, cubra a superfície do canteiro com uma camada de 5 a 8 cm de capim seco cortado ou palha de arroz.',
      'Deixe uma folga circular de 3 cm em redor do caule de cada muda para evitar o desenvolvimento de fungos de colo.',
      'Regue preferencialmente nas horas frescas da manhã (antes das 8h) ou ao final da tarde (após as 16h30).'
    ],
    traditionalPracticeInsight: 'A palha seca amortece a gota d água do regador, impedindo que a terra espirre para as folhas inferiores do tomateiro, prevenindo a míldio.',
    recommendedAction: 'Acumular fardos de capim seco na machamba durante a sacha de Janeiro para usar na época fresca.'
  },
  {
    id: 'tip-feijao-boer-barreira',
    title: 'Cerca Viva Corta-Vento com Feijão Bóer e Moringa nas Bordaduras',
    phase: 'preparo-sementeira',
    phaseLabel: 'Preparação & Sementeiras',
    seasonPeriod: 'Outubro - Novembro',
    isCurrentSeason: true,
    crop: 'Feijão nhemba',
    resiliencePillar: 'Resistência a Choques Climáticos',
    validationAgency: 'Investigação IIAM',
    climateBenefit: 'Reduz o impacto dos ventos secos do interior e produz alimento proteico contínuo por 3 a 4 anos',
    summary: 'Ventos fortes e areia soprada nas planícies abertas ressecam as mudas jovens. Instalar linhas perenes de Feijão Bóer e Moringa nos limites da machamba cria um microclima protegido e fornece lenha leve.',
    detailedSteps: [
      'Marque os lados nascente e sul da machamba, de onde sopram os ventos dominantes na época quente.',
      'Semeie Feijão Bóer em linha dupla com espaçamento de 1 metro entre plantas e 50 cm entre sementes.',
      'O feijão bóer desenvolve raiz aprumada profunda que quebra camadas duras do subsolo arenoso.',
      'Ao final do primeiro ano, pode os ramos a 1 metro de altura e use as folhas como adubo verde no solo.'
    ],
    traditionalPracticeInsight: 'Árvore multifuncional: em Inhambane o feijão bóer é chamado de "celeiro de pé" porque produz vagens quando o resto das machambas já secou.',
    recommendedAction: 'Semear 2 linhas de feijão bóer no limite oeste e sul da machamba nesta campanha.'
  }
];

interface AgroResilientTipsProps {
  user: User;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  className?: string;
}

export const AgroResilientTips: React.FC<AgroResilientTipsProps> = ({
  user,
  onShowToast,
  className = ''
}) => {
  // Determine current active season in Inhambane based on actual current date
  const currentMonth = new Date().getMonth(); // 0 to 11
  const defaultSeason = useMemo(() => {
    const found = INHAMBANE_SEASON_PHASES.find(p => p.months.includes(currentMonth));
    return found ? found.id : 'preparo-sementeira';
  }, [currentMonth]);

  // States
  const [selectedPhase, setSelectedPhase] = useState<AgriculturalSeasonPhase | 'all'>(defaultSeason);
  const [cropFilter, setCropFilter] = useState<CropType | 'Geral' | 'all'>(user.crop || 'all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 100 for current tip
  const [isHovered, setIsHovered] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [savedTipIds, setSavedTipIds] = useState<string[]>(() => StorageService.getSavedAgroTips());
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filtered tips
  const filteredTips = useMemo(() => {
    return RESILIENT_TIPS_DATABASE.filter(tip => {
      // Phase match
      if (selectedPhase !== 'all' && tip.phase !== selectedPhase) {
        return false;
      }
      // Crop match
      if (cropFilter !== 'all') {
        if (tip.crop !== 'Geral' && tip.crop !== cropFilter) {
          return false;
        }
      }
      return true;
    });
  }, [selectedPhase, cropFilter]);

  // Active tip
  const activeTip: AgroResilientTip | undefined = filteredTips[currentIndex] || filteredTips[0];

  // Subscribe to speech service states
  useEffect(() => {
    const unsubscribe = speechService.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => {
      unsubscribe();
      speechService.stop();
    };
  }, []);

  // Periodic rotation effect (advances every 9 seconds when isPlaying and not hovered and not speaking)
  const ROTATION_TIME_MS = 9000;
  const UPDATE_INTERVAL_MS = 100;

  useEffect(() => {
    if (!isPlaying || isHovered || isSpeaking || filteredTips.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + (UPDATE_INTERVAL_MS / ROTATION_TIME_MS) * 100;
        if (next >= 100) {
          // Advance to next tip
          setCurrentIndex(current => (current + 1) % filteredTips.length);
          return 0;
        }
        return next;
      });
    }, UPDATE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, isSpeaking, filteredTips.length]);

  // Reset progress and bound index whenever filter or active tip changes
  useEffect(() => {
    setProgress(0);
    if (currentIndex >= filteredTips.length) {
      setCurrentIndex(0);
    }
  }, [filteredTips.length, selectedPhase, cropFilter]);

  // Audio vocalization
  const handleToggleVoice = () => {
    if (!activeTip) return;

    if (isSpeaking) {
      speechService.stop();
    } else {
      const speechText = `Dica Agro Resiliente da Região de Inhambane. Fase do ciclo: ${activeTip.phaseLabel}, período ${activeTip.seasonPeriod}. Título: ${activeTip.title}. Cultura: ${activeTip.crop}. Recomendação: ${activeTip.summary}. Ação recomendada: ${activeTip.recommendedAction}. Validação técnica por ${activeTip.validationAgency}.`;
      speechService.speak(speechText, () => {
        setIsSpeaking(false);
      });
      onShowToast('Reproduzindo recomendação técnica em áudio...', 'info');
    }
  };

  // Bookmark / Save
  const handleToggleSave = (tipId: string) => {
    const isNowSaved = StorageService.toggleSavedAgroTip(tipId);
    setSavedTipIds(StorageService.getSavedAgroTips());
    if (isNowSaved) {
      onShowToast('Recomendação guardada no seu Caderno de Campo!', 'success');
    } else {
      onShowToast('Recomendação removida dos favoritos.', 'info');
    }
  };

  // WhatsApp / SMS sharing
  const handleShareTip = (tip: AgroResilientTip) => {
    const shareText = `*AgroResiliente Inhambane - Dica do Ciclo Agrícola*\n\n🌱 *${tip.title}*\n📅 *Fase:* ${tip.phaseLabel} (${tip.seasonPeriod})\n🌽 *Cultura:* ${tip.crop}\n💡 *Recomendação:* ${tip.summary}\n✅ *Ação Prática:* ${tip.recommendedAction}\n🏛️ *Validação:* ${tip.validationAgency}\n\n_Consulte mais técnicas resilientes para a sua Machamba na plataforma AgroResiliente!_`;
    const encoded = encodeURIComponent(shareText);
    
    // Check if web share is available, else open WhatsApp direct link
    if (navigator.share && window.isSecureContext) {
      navigator.share({
        title: tip.title,
        text: shareText,
      }).catch(() => {
        window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
      });
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    }
    onShowToast('A partilhar dica agronómica com a comunidade...', 'info');
  };

  const handleNext = () => {
    setProgress(0);
    setCurrentIndex(prev => (prev + 1) % filteredTips.length);
  };

  const handlePrev = () => {
    setProgress(0);
    setCurrentIndex(prev => (prev - 1 + filteredTips.length) % filteredTips.length);
  };

  const isSaved = activeTip ? savedTipIds.includes(activeTip.id) : false;

  const currentPhaseConfig = INHAMBANE_SEASON_PHASES.find(p => p.id === defaultSeason);

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-stone-900 border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Banner: Regional Cycle Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-5 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20 shadow-xs">
              <Compass className="w-5 h-5 text-emerald-200 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 border border-emerald-400/30 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-300" />
                  Ciclo Ativo: Inhambane 2026/2027
                </span>
                <span className="text-white/40">·</span>
                <span className="text-xs text-emerald-200 font-medium">
                  {currentPhaseConfig?.name.split(':')[0]} ({currentPhaseConfig?.period})
                </span>
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5 flex items-center gap-2">
                Dicas AgroResilientes Periódicas
                <span className="text-xs font-normal px-2 py-0.5 rounded-md bg-white/20 text-white hidden sm:inline-block">
                  SDAE & CITT
                </span>
              </h3>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* Caderno de Campo Modal Button */}
            <button
              onClick={() => setShowSavedModal(true)}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/20 transition-colors shadow-xs"
              title="Ver dicas guardadas no seu caderno de campo"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Caderno ({savedTipIds.length})</span>
            </button>

            {/* Play/Pause Rotation Toggle */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 rounded-xl text-xs font-medium flex items-center justify-center transition-colors border ${
                isPlaying 
                  ? 'bg-emerald-900/60 text-white border-white/20 hover:bg-emerald-900' 
                  : 'bg-amber-500 text-stone-950 font-bold border-amber-400'
              }`}
              title={isPlaying ? 'Pausar rotação automática' : 'Retomar rotação automática periódica'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
          </div>
        </div>

        {/* Phase Selector Pills */}
        <div className="mt-3.5 pt-3 border-t border-white/15 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span className="text-[11px] text-emerald-200 shrink-0 font-medium mr-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-300" />
            Fases do Ano:
          </span>
          <button
            onClick={() => { setSelectedPhase('all'); setCurrentIndex(0); }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 transition-colors ${
              selectedPhase === 'all'
                ? 'bg-white text-emerald-950 font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-emerald-100'
            }`}
          >
            Todas as Fases
          </button>
          {INHAMBANE_SEASON_PHASES.map(phase => {
            const isThisCurrent = phase.id === defaultSeason;
            const isSelected = selectedPhase === phase.id;
            return (
              <button
                key={phase.id}
                onClick={() => { setSelectedPhase(phase.id); setCurrentIndex(0); }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 flex items-center gap-1.5 transition-colors ${
                  isSelected
                    ? 'bg-white text-emerald-950 font-bold shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-emerald-100'
                }`}
              >
                {isThisCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                )}
                <span>{phase.period}</span>
                {isThisCurrent && <span className="text-[9px] text-emerald-300 opacity-90 font-bold">(Atual)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rotation Progress Bar (Periodic visual cue) */}
      <div className="h-1 w-full bg-emerald-100 dark:bg-stone-800 overflow-hidden relative">
        <div
          className={`h-full bg-emerald-600 dark:bg-emerald-500 transition-all ${
            isPlaying && !isHovered && !isSpeaking ? 'duration-100 ease-linear' : 'duration-0'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Content Card */}
      {activeTip ? (
        <div className="p-5 sm:p-6 space-y-4">
          {/* Tip Metadata Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60 flex items-center gap-1">
                <Leaf className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                {activeTip.crop === 'Geral' ? 'Todas as Culturas (Solo & Maneio)' : `Cultura: ${activeTip.crop}`}
              </span>

              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                {activeTip.resiliencePillar}
              </span>

              <span className="text-xs text-stone-400 hidden sm:inline">·</span>

              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                {activeTip.phaseLabel} ({activeTip.seasonPeriod})
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 font-medium">
              <span>Recomendação</span>
              <strong className="text-stone-900 dark:text-stone-100">{currentIndex + 1}</strong>
              <span>de</span>
              <span>{filteredTips.length}</span>
            </div>
          </div>

          {/* Title and Summary */}
          <div className="space-y-2">
            <h4 className="font-display text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 leading-snug">
              {activeTip.title}
            </h4>

            <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
              {activeTip.summary}
            </p>
          </div>

          {/* Climate & Agronomic Benefit Callout */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Sparkles className="w-4 h-4 text-emerald-200" />
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-bold text-emerald-900 dark:text-emerald-200 uppercase text-[10px] tracking-wide">
                Benefício de Resiliência Climática para Inhambane:
              </div>
              <p className="text-emerald-800 dark:text-emerald-300 font-medium">
                {activeTip.climateBenefit}
              </p>
            </div>
          </div>

          {/* Action Step Preview */}
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 flex items-start gap-2.5 text-xs text-stone-800 dark:text-stone-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-stone-900 dark:text-stone-100">Ação recomendada para a semana: </strong>
              <span>{activeTip.recommendedAction}</span>
            </div>
          </div>

          {/* Bottom Controls & Farmer Utilities */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-stone-100 dark:border-stone-800">
            {/* Left Action Buttons: Audio, Share, Bookmark, Steps */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Audio Listen Button */}
              <button
                onClick={handleToggleVoice}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                  isSpeaking
                    ? 'bg-amber-600 text-white animate-pulse'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800'
                }`}
                title={isSpeaking ? 'Parar leitura de voz' : 'Ouvir recomendação em voz alta (Português)'}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>A Reproduzir Áudio...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Ouvir Recomendação (Áudio)</span>
                  </>
                )}
              </button>

              {/* View Complete Guide Steps */}
              <button
                onClick={() => setShowDetailModal(true)}
                className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-200 dark:border-stone-700"
              >
                <BookOpen className="w-3.5 h-3.5 text-stone-500" />
                <span>Ver Passo a Passo ({activeTip.detailedSteps.length})</span>
              </button>

              {/* Save / Bookmark to Machamba Notebook */}
              <button
                onClick={() => handleToggleSave(activeTip.id)}
                className={`p-2 rounded-xl text-xs font-medium flex items-center justify-center transition-colors border ${
                  isSaved
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 border-stone-200 dark:border-stone-700'
                }`}
                title={isSaved ? 'Remover do Caderno' : 'Guardar no Caderno de Campo'}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-600" /> : <Bookmark className="w-4 h-4" />}
              </button>

              {/* Share via WhatsApp / SMS */}
              <button
                onClick={() => handleShareTip(activeTip)}
                className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-stone-600 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors border border-stone-200 dark:border-stone-700"
                title="Partilhar com vizinhos ou associação pelo WhatsApp"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Manual Carousel Navigation & Dots */}
            <div className="flex items-center gap-2 justify-between sm:justify-end">
              <div className="flex items-center gap-1">
                {filteredTips.map((tip, idx) => (
                  <button
                    key={tip.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setProgress(0);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentIndex
                        ? 'w-6 bg-emerald-700 dark:bg-emerald-500'
                        : 'w-2 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300'
                    }`}
                    title={`Ir para dica: ${tip.title}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={handlePrev}
                  className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors border border-stone-200 dark:border-stone-700"
                  title="Dica anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors border border-stone-200 dark:border-stone-700"
                  title="Próxima dica"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center space-y-3">
          <Leaf className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
          <h4 className="font-semibold text-stone-800 dark:text-stone-200 text-sm">
            Nenhuma recomendação disponível para os filtros selecionados
          </h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Experimente selecionar "Todas as Fases" ou "Todas as Culturas" para explorar o catálogo completo de práticas agro-resilientes de Inhambane.
          </p>
          <button
            onClick={() => {
              setSelectedPhase('all');
              setCropFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors inline-flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Restaurar Filtros</span>
          </button>
        </div>
      )}

      {/* MODAL 1: Caderno de Campo (Saved Tips) */}
      {showSavedModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-5 h-5 text-amber-300 fill-amber-300" />
                <div>
                  <h3 className="font-display font-bold text-base">O Meu Caderno de Campo</h3>
                  <p className="text-xs text-emerald-200">Recomendações técnicas guardadas para a sua Machamba</p>
                </div>
              </div>
              <button
                onClick={() => setShowSavedModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {savedTipIds.length === 0 ? (
                <div className="text-center py-8 text-stone-500 space-y-2">
                  <Bookmark className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto" />
                  <p className="text-sm font-medium">Ainda não guardou nenhuma dica no seu caderno.</p>
                  <p className="text-xs text-stone-400">Clique no ícone de marcador em qualquer dica periódica para consultar quando estiver na machamba.</p>
                </div>
              ) : (
                RESILIENT_TIPS_DATABASE.filter(t => savedTipIds.includes(t.id)).map(tip => (
                  <div
                    key={tip.id}
                    className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            {tip.crop}
                          </span>
                          <span className="text-stone-300 dark:text-stone-700">·</span>
                          <span className="text-xs text-stone-500">{tip.phaseLabel} ({tip.seasonPeriod})</span>
                        </div>
                        <h5 className="font-bold text-sm text-stone-900 dark:text-stone-100 mt-0.5">
                          {tip.title}
                        </h5>
                      </div>
                      <button
                        onClick={() => handleToggleSave(tip.id)}
                        className="text-stone-400 hover:text-red-500 p-1 text-xs"
                        title="Remover"
                      >
                        ✕
                      </button>
                    </div>

                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      {tip.summary}
                    </p>

                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-stone-200 dark:border-stone-700 text-xs">
                      <span className="text-[11px] text-stone-500 font-medium">
                        Validado por: <strong className="text-stone-700 dark:text-stone-300">{tip.validationAgency}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleShareTip(tip)}
                          className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Partilhar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-stone-100 dark:bg-stone-800/80 border-t border-stone-200 dark:border-stone-800 flex justify-end">
              <button
                onClick={() => setShowSavedModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-800 dark:text-stone-100 text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Detailed Step-by-Step Guide for Active Tip */}
      {showDetailModal && activeTip && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                  Guia Prático Agronómico · {activeTip.validationAgency}
                </span>
                <h3 className="font-display font-bold text-base text-white mt-0.5">
                  {activeTip.title}
                </h3>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wide">
                  Contexto Agrícola de Inhambane
                </div>
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                  {activeTip.summary}
                </p>
              </div>

              {/* Step by step numbered list */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wide">
                  Passo a Passo de Aplicação na Machamba:
                </div>
                <ol className="space-y-2.5">
                  {activeTip.detailedSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                      <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-stone-800 dark:text-stone-200 leading-relaxed text-xs">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Traditional practice insight */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1">
                <div className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-600" />
                  Sabedoria Tradicional & Experiência Comunitária
                </div>
                <p className="text-amber-900 dark:text-amber-200 text-xs italic">
                  "{activeTip.traditionalPracticeInsight}"
                </p>
              </div>

              {/* Climate Benefit */}
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
                  Impacto de Resiliência Comprovado:
                </span>
                <p className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
                  {activeTip.climateBenefit}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-stone-100 dark:bg-stone-800/80 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
              <button
                onClick={handleToggleVoice}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Ouvir Guia em Áudio</span>
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-800 dark:text-stone-100 text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
