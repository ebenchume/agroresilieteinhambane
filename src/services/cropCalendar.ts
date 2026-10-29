/**
 * AgroResiliente Inhambane - Crop Calendar & Agricultural Reminder Service
 * Handles planting/harvest cycle management, stage milestone calculation,
 * and automatic agronomic reminders tailored to Inhambane's agroecological realities.
 */

import { CropType, CropCycle, CropReminder, CropCycleStatus, CropReminderType } from '../types/auth';
import { NotificationsService } from './notifications';

export interface CropCycleConfig {
  crop: CropType;
  defaultDurationDays: number;
  popularVarieties: string[];
  stages: {
    offsetDays: number;
    title: string;
    description: string;
    type: CropReminderType;
    priority: 'alta' | 'media' | 'baixa';
  }[];
}

export const CROP_CONFIGS: Record<CropType, CropCycleConfig> = {
  Milho: {
    crop: 'Milho',
    defaultDurationDays: 105,
    popularVarieties: ['Matuba (Precoce seca)', 'Chokwe (Branco)', 'PAN 53', 'Variedade Local de Homoíne'],
    stages: [
      {
        offsetDays: 7,
        title: 'Germinação e Verificação de Falhas',
        description: 'Vistoriar a uniformidade da emergência no campo. Fazer replantio em covachos falhados até ao 10º dia.',
        type: 'germinacao',
        priority: 'alta'
      },
      {
        offsetDays: 20,
        title: '1ª Sacha e Desbaste de Plantas',
        description: 'Eliminar ervas daninhas concorrentes e desbastar deixando no máximo 2 plantas vigorosas por covacho.',
        type: 'sacha',
        priority: 'alta'
      },
      {
        offsetDays: 35,
        title: 'Adubação de Cobertura e Amontoa',
        description: 'Aplicar estrume bem curtido ou ureia ao lado do pé do milho e chegar terra para reforçar as raízes adventícias.',
        type: 'adubacao',
        priority: 'media'
      },
      {
        offsetDays: 60,
        title: 'Floração e Barbas: Monitorização do Cartucho',
        description: 'Período crítico hídrico e de enchimento. Vigiar lagarta do cartucho nas folhas e inflorescências.',
        type: 'fitossanitario',
        priority: 'alta'
      },
      {
        offsetDays: 90,
        title: 'Pré-Colheita: Ponto de Maturação da Palha',
        description: 'Palha da espiga começa a secar e castanhar. Suspender regas e preparar estaleiro de secagem limpo.',
        type: 'pre-colheita',
        priority: 'media'
      },
      {
        offsetDays: 105,
        title: 'Colheita e Descasque das Espigas',
        description: 'Colher em dias ensolarados. Espalhar em estrado elevado para rápida desumidificação do grão.',
        type: 'colheita',
        priority: 'alta'
      },
      {
        offsetDays: 115,
        title: 'Armazenamento Seguro em Celeiro',
        description: 'Debulhar grãos bem secos (abaixo de 13% de humidade) e armazenar em sacos herméticos com cinza de eucalipto ou pó protetor.',
        type: 'pos-colheita',
        priority: 'media'
      }
    ]
  },
  Mandioca: {
    crop: 'Mandioca',
    defaultDurationDays: 270,
    popularVarieties: ['Chingoma (Doce)', 'Nikwaha', 'Mocuba', 'Chinhembue'],
    stages: [
      {
        offsetDays: 15,
        title: 'Enraizamento e Primeiros Rebentos',
        description: 'Verificar taxa de pega das estacas plantadas inclinadas. Substituir estacas que secaram.',
        type: 'germinacao',
        priority: 'media'
      },
      {
        offsetDays: 30,
        title: '1ª Sacha e Cobertura Morta (Mulching)',
        description: 'Cobrir o solo arenoso com palha seca para preservar humidade e bloquear daninhas.',
        type: 'sacha',
        priority: 'alta'
      },
      {
        offsetDays: 90,
        title: '2ª Limpeza e Condução de Hastes',
        description: 'Eliminar ramos fracos e ladrões, mantendo 2 a 3 hastes fortes por planta.',
        type: 'sacha',
        priority: 'media'
      },
      {
        offsetDays: 180,
        title: 'Inspeção Fitossanitária (Mosaico Africano)',
        description: 'Arrancar e queimar plantas com folhas encarquilhadas ou mosaico amarelo para não contaminar a machamba.',
        type: 'fitossanitario',
        priority: 'alta'
      },
      {
        offsetDays: 255,
        title: 'Avaliação de Calibre dos Tubérculos',
        description: 'Efetuar amostragem em 2 a 3 pés para checar espessura das raízes e teor de amido.',
        type: 'pre-colheita',
        priority: 'media'
      },
      {
        offsetDays: 270,
        title: 'Início da Colheita Escalonada',
        description: 'Arrancar raízes de acordo com a venda imediata ou consumo familiar (processamento de rale/farinha).',
        type: 'colheita',
        priority: 'alta'
      }
    ]
  },
  Amendoim: {
    crop: 'Amendoim',
    defaultDurationDays: 110,
    popularVarieties: ['Bebiano Branco (Homoíne)', 'Mamane', 'JL 24', 'Nametil'],
    stages: [
      {
        offsetDays: 8,
        title: 'Emergência Uniforme das Plântulas',
        description: 'Checar nascença homogénea nas linhas espaçadas a 40 cm.',
        type: 'germinacao',
        priority: 'media'
      },
      {
        offsetDays: 25,
        title: 'Amanho Cuidadoso e Sacha Rasa',
        description: 'Deixar a terra muito fofa ao redor do colo para facilitar a futura descida dos pregos reprodutivos.',
        type: 'sacha',
        priority: 'alta'
      },
      {
        offsetDays: 45,
        title: 'Floração e Emissão de Pregos (Ginóforos)',
        description: 'Fase crucial: NÃO mexer com enxadas perto do pé para não cortar os pregos que penetram a terra.',
        type: 'rega',
        priority: 'alta'
      },
      {
        offsetDays: 75,
        title: 'Vigilância contra Cercospora e Manchas Foliares',
        description: 'Vistoriar folhas inferiores. Em caso de ataque fúngico, evitar regas por aspersão ao entardecer.',
        type: 'fitossanitario',
        priority: 'media'
      },
      {
        offsetDays: 95,
        title: 'Pré-Colheita: Teste da Face Interna da Vagem',
        description: 'Desenterrar 3 vagens: se o interior da casca estiver com nervuras escuras, a maturação está próxima.',
        type: 'pre-colheita',
        priority: 'alta'
      },
      {
        offsetDays: 110,
        title: 'Arrancamento e Cura ao Sol',
        description: 'Arrancar a planta toda, sacudir a terra e virar as vagens para cima para secar ao sol e prevenir fungos.',
        type: 'colheita',
        priority: 'alta'
      }
    ]
  },
  'Feijão nhemba': {
    crop: 'Feijão nhemba',
    defaultDurationDays: 70,
    popularVarieties: ['IT 18', 'Nhemba Vermelho', 'Manteiga Local'],
    stages: [
      {
        offsetDays: 6,
        title: 'Germinação Rápida',
        description: 'Confirmar nascimento das plântulas de feijão.',
        type: 'germinacao',
        priority: 'media'
      },
      {
        offsetDays: 20,
        title: 'Sacha Rasa',
        description: 'Limpar ervas daninhas da linha antes do fecho da copa.',
        type: 'sacha',
        priority: 'media'
      },
      {
        offsetDays: 35,
        title: 'Floração e Proteção contra Tripes e Brocas',
        description: 'Verificar botões florais contra afídeos e lagartas das vagens.',
        type: 'fitossanitario',
        priority: 'alta'
      },
      {
        offsetDays: 55,
        title: 'Enchimento de Vagens',
        description: 'Monitorar formação de vagens e maturação uniforme.',
        type: 'pre-colheita',
        priority: 'media'
      },
      {
        offsetDays: 70,
        title: 'Colheita e Secagem das Vagens',
        description: 'Colher antes que as vagens abram e debulhem espontaneamente no campo.',
        type: 'colheita',
        priority: 'alta'
      }
    ]
  },
  Mapira: {
    crop: 'Mapira',
    defaultDurationDays: 120,
    popularVarieties: ['Macia (Branca)', 'SV2', 'Mapira Vermelha Local'],
    stages: [
      {
        offsetDays: 8,
        title: 'Emergência de Mapira',
        description: 'Verificar stand de plantas resistentes à seca.',
        type: 'germinacao',
        priority: 'media'
      },
      {
        offsetDays: 25,
        title: 'Desbaste e Sacha',
        description: 'Desbastar para evitar densidade excessiva.',
        type: 'sacha',
        priority: 'media'
      },
      {
        offsetDays: 65,
        title: 'Emissão da Panícula',
        description: 'Fase reprodutiva essencial; monitorar pássaros e broca do caule.',
        type: 'fitossanitario',
        priority: 'alta'
      },
      {
        offsetDays: 105,
        title: 'Maturação dos Grãos da Panícula',
        description: 'Proteger panículas contra pássaros granívoros com espantalhos ou vigilância matinal.',
        type: 'pre-colheita',
        priority: 'alta'
      },
      {
        offsetDays: 120,
        title: 'Colheita das Panículas e Debulha',
        description: 'Cortar panículas e secar em terreiro limpo.',
        type: 'colheita',
        priority: 'alta'
      }
    ]
  },
  Caju: {
    crop: 'Caju',
    defaultDurationDays: 120,
    popularVarieties: ['Clone 1.11A', 'Enxerto Homoíne', 'Cajueiro Tradicional'],
    stages: [
      {
        offsetDays: 15,
        title: 'Limpeza do Raio da Copa (Coroamento)',
        description: 'Retirar mato e folhas secas num raio de 2m para evitar queimadas e facilitar colheita.',
        type: 'sacha',
        priority: 'alta'
      },
      {
        offsetDays: 40,
        title: 'Floração e Monitorização do Oídio',
        description: 'Vistoriar panículas florais contra o fungo do oídio (pó branco). Pulverização com enxofre se necessário.',
        type: 'fitossanitario',
        priority: 'alta'
      },
      {
        offsetDays: 80,
        title: 'Desenvolvimento da Castanha e Pseudofruto',
        description: 'Monitorar broca do tronco e percevejo do caju.',
        type: 'fitossanitario',
        priority: 'media'
      },
      {
        offsetDays: 120,
        title: 'Apanha Diária de Castanha e Secagem',
        description: 'Apanhar castanhas caídas diariamente, separar da maçã e secar ao sol durante 2 a 3 dias.',
        type: 'colheita',
        priority: 'alta'
      }
    ]
  },
  Hortícolas: {
    crop: 'Hortícolas',
    defaultDurationDays: 65,
    popularVarieties: ['Tomate Rio Grande', 'Couve Tronchuda', 'Cebola Texas Grano', 'Pimento'],
    stages: [
      {
        offsetDays: 5,
        title: 'Pega das Mudas Transplantadas',
        description: 'Rega bidiária (manhã e fim de tarde) nas primeiras semanas com sombreamento leve.',
        type: 'rega',
        priority: 'alta'
      },
      {
        offsetDays: 18,
        title: '1ª Sacha e Adubação com Biofertilizante',
        description: 'Aplicar estrume líquido ou adubo composto nos canteiros.',
        type: 'adubacao',
        priority: 'media'
      },
      {
        offsetDays: 35,
        title: 'Floração e Estacamento (Tutores)',
        description: 'Colocar estacas de bambu/cana para suportar plantas e evitar contacto dos frutos com o solo.',
        type: 'fitossanitario',
        priority: 'alta'
      },
      {
        offsetDays: 55,
        title: 'Início da Maturação dos Primeiros Frutos',
        description: 'Ajustar intervalos de rega para evitar rachamento de frutos.',
        type: 'pre-colheita',
        priority: 'media'
      },
      {
        offsetDays: 65,
        title: 'Colheita e Comercialização Fresca',
        description: 'Colher pela manhã fresca e embalar em caixas ventiladas para o mercado local de Homoíne/Maxixe.',
        type: 'colheita',
        priority: 'alta'
      }
    ]
  },
  'Batata-doce': {
    crop: 'Batata-doce',
    defaultDurationDays: 135,
    popularVarieties: ['Polpa Alaranjada (Bélvia)', 'Irene', 'Jane', 'Variedade Branca Local'],
    stages: [
      {
        offsetDays: 10,
        title: 'Fixação das Pontas de Ramas',
        description: 'Checar rebentamento das pontas de ramas plantadas em camalhões bem erguidos.',
        type: 'germinacao',
        priority: 'media'
      },
      {
        offsetDays: 30,
        title: '1ª Sacha e Chegamento de Camalhões',
        description: 'Reforçar altura dos camalhões para assegurar solo fofo e profundo.',
        type: 'sacha',
        priority: 'alta'
      },
      {
        offsetDays: 60,
        title: 'Levantamento de Ramas',
        description: 'Mover suavemente as ramas para evitar que criem raízes adventícias que roubam vigor às batatas principais.',
        type: 'sacha',
        priority: 'media'
      },
      {
        offsetDays: 110,
        title: 'Vistoria contra Gorgulho da Batata-doce',
        description: 'Manter raízes bem cobertas com terra para impedir que o gorgulho atinja os tubérculos.',
        type: 'fitossanitario',
        priority: 'alta'
      },
      {
        offsetDays: 135,
        title: 'Colheita Escalonada com Enxada Cuidadosa',
        description: 'Desenterrar com cuidado para não ferir a casca e curar à sombra 4 dias antes do transporte.',
        type: 'colheita',
        priority: 'alta'
      }
    ]
  },
  Gergelim: {
    crop: 'Gergelim',
    defaultDurationDays: 95,
    popularVarieties: ['Lindi White', 'Gergelim Branco Homoíne'],
    stages: [
      {
        offsetDays: 7,
        title: 'Emergência de Plântulas',
        description: 'Verificar nascença de sementes finas.',
        type: 'germinacao',
        priority: 'media'
      },
      {
        offsetDays: 21,
        title: 'Desbaste Cuidadoso',
        description: 'Desbastar para 15-20 cm entre plantas.',
        type: 'sacha',
        priority: 'alta'
      },
      {
        offsetDays: 50,
        title: 'Floração e Formação de Cápsulas',
        description: 'Monitorar pragas mastigadoras.',
        type: 'fitossanitario',
        priority: 'media'
      },
      {
        offsetDays: 85,
        title: 'Pré-Colheita: Amarelecimento das Cápsulas',
        description: 'Observar quando cápsulas basais começam a mudar de cor verde para amarelada.',
        type: 'pre-colheita',
        priority: 'alta'
      },
      {
        offsetDays: 95,
        title: 'Corte e Feixes para Secagem',
        description: 'Cortar hastes inteiras, atar em feixes verticais sobre lona para debulhar sem perda de semente.',
        type: 'colheita',
        priority: 'alta'
      }
    ]
  },
  Banana: {
    crop: 'Banana',
    defaultDurationDays: 300,
    popularVarieties: ['Nanica', 'Prata', 'Banana Maçã'],
    stages: [
      {
        offsetDays: 30,
        title: 'Desfilhamento e Limpeza da Touceira',
        description: 'Manter apenas Mãe, Filha e Neta por touceira.',
        type: 'sacha',
        priority: 'media'
      },
      {
        offsetDays: 90,
        title: 'Adubação Orgânica no Raio da Touceira',
        description: 'Aplicar esterco bem curtido e cobertura vegetal.',
        type: 'adubacao',
        priority: 'media'
      },
      {
        offsetDays: 180,
        title: 'Escarolamento e Escoramento',
        description: 'Colocar escoras de madeira para suportar o peso do cacho.',
        type: 'fitossanitario',
        priority: 'alta'
      },
      {
        offsetDays: 270,
        title: 'Ensacamento e Corte do Coração',
        description: 'Cortar botão floral apical e ensacar cacho com plástico microperfurado.',
        type: 'pre-colheita',
        priority: 'media'
      },
      {
        offsetDays: 300,
        title: 'Colheita do Cacho no Ponto Verde-Feito',
        description: 'Colher quando quinas dos frutos estiverem arredondadas.',
        type: 'colheita',
        priority: 'alta'
      }
    ]
  },
  Coco: {
    crop: 'Coco',
    defaultDurationDays: 365,
    popularVarieties: ['Coqueiro Gigante de Moçambique', 'Anão Verde'],
    stages: [
      {
        offsetDays: 30,
        title: 'Limpeza da Coroa e Eliminação de Folhas Secas',
        description: 'Retirar folhas e espadas velhas para facilitar ventilação.',
        type: 'sacha',
        priority: 'media'
      },
      {
        offsetDays: 120,
        title: 'Vigilância contra o Amarelecimento Letal e Broca',
        description: 'Inspecionar sintomas nas folhas medianas.',
        type: 'fitossanitario',
        priority: 'alta'
      },
      {
        offsetDays: 240,
        title: 'Adubação com Cloreto e Matéria Orgânica',
        description: 'Adicionar cinzas ricas em potássio na bacia do coqueiro.',
        type: 'adubacao',
        priority: 'media'
      },
      {
        offsetDays: 365,
        title: 'Colheita Contínua de Cocos Secos e de Beber',
        description: 'Apanha periódica de frutos maduros para copra ou mercado fresco.',
        type: 'colheita',
        priority: 'media'
      }
    ]
  },
  'Feijão boer': {
    crop: 'Feijão boer',
    defaultDurationDays: 180,
    popularVarieties: ['ICEAP 00557', 'Boer Tradicional'],
    stages: [
      {
        offsetDays: 10,
        title: 'Emergência de Feijão Boer',
        description: 'Verificar emergência das plântulas arbustivas.',
        type: 'germinacao',
        priority: 'media'
      },
      {
        offsetDays: 35,
        title: 'Sacha na Linha de Consorciação',
        description: 'Excelente para consorciação com milho ou mandioca.',
        type: 'sacha',
        priority: 'media'
      },
      {
        offsetDays: 110,
        title: 'Floração Profusa e Fixação de Vagens',
        description: 'Monitorar lagarta das vagens e trips.',
        type: 'fitossanitario',
        priority: 'alta'
      },
      {
        offsetDays: 160,
        title: 'Maturação das Vagens',
        description: 'Vagens tornam-se acinzentadas e estalam ao toque.',
        type: 'pre-colheita',
        priority: 'media'
      },
      {
        offsetDays: 180,
        title: 'Colheita por Corte de Vagens',
        description: 'Colheita manual de vagens secas e debulha imediata.',
        type: 'colheita',
        priority: 'alta'
      }
    ]
  },
  Outra: {
    crop: 'Outra',
    defaultDurationDays: 90,
    popularVarieties: ['Variedade Local'],
    stages: [
      {
        offsetDays: 7,
        title: 'Emergência e Vistoria Inicial',
        description: 'Verificar início do ciclo biológico.',
        type: 'germinacao',
        priority: 'media'
      },
      {
        offsetDays: 25,
        title: 'Primeira Sacha e Limpeza',
        description: 'Controlar daninhas e arejar o solo.',
        type: 'sacha',
        priority: 'media'
      },
      {
        offsetDays: 50,
        title: 'Floração e Desenvolvimento',
        description: 'Monitorar necessidades hídricas e pragas.',
        type: 'fitossanitario',
        priority: 'alta'
      },
      {
        offsetDays: 90,
        title: 'Colheita e Pós-Colheita',
        description: 'Colheita no ponto ideal de maturação comercial.',
        type: 'colheita',
        priority: 'alta'
      }
    ]
  }
};

const STORAGE_CYCLES_PREFIX = 'agro_crop_cycles_v2_';

export const CropCalendarService = {
  /**
   * Calculate harvest date based on planting date and days duration
   */
  calculateHarvestDate(plantingDateStr: string, durationDays: number): string {
    const date = new Date(plantingDateStr);
    date.setDate(date.getDate() + durationDays);
    return date.toISOString().split('T')[0];
  },

  /**
   * Add days to a date string YYYY-MM-DD
   */
  addDays(dateStr: string, days: number): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  },

  /**
   * Determine status based on dates
   */
  determineStatus(plantingDateStr: string, estimatedHarvestDateStr: string, actualHarvestDate?: string): CropCycleStatus {
    if (actualHarvestDate) return 'colhido';
    const now = new Date();
    const planting = new Date(plantingDateStr);
    const harvest = new Date(estimatedHarvestDateStr);

    if (now < planting) return 'planeado';
    if (now >= harvest) return 'maduro';

    const totalDuration = harvest.getTime() - planting.getTime();
    const elapsed = now.getTime() - planting.getTime();
    const progress = totalDuration > 0 ? elapsed / totalDuration : 0;

    if (progress > 0.55 && progress < 0.85) return 'floracao';
    return 'crescimento';
  },

  /**
   * Calculate progress percentage 0 - 100
   */
  calculateProgress(plantingDateStr: string, estimatedHarvestDateStr: string, actualHarvestDate?: string): number {
    if (actualHarvestDate) return 100;
    const now = new Date();
    const planting = new Date(plantingDateStr);
    const harvest = new Date(estimatedHarvestDateStr);

    if (now <= planting) return 0;
    if (now >= harvest) return 100;

    const total = harvest.getTime() - planting.getTime();
    const elapsed = now.getTime() - planting.getTime();
    if (total <= 0) return 100;

    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  },

  /**
   * Generate automatic milestones/reminders for a crop cycle
   */
  generateAutoReminders(cycleId: string, crop: CropType, plantingDateStr: string, estimatedHarvestDateStr: string): CropReminder[] {
    const config = CROP_CONFIGS[crop] || CROP_CONFIGS['Outra'];
    const planting = new Date(plantingDateStr);
    const harvest = new Date(estimatedHarvestDateStr);
    const totalDays = Math.max(1, Math.round((harvest.getTime() - planting.getTime()) / (1000 * 60 * 60 * 24)));
    const scaleFactor = totalDays / (config.defaultDurationDays || totalDays);

    const reminders: CropReminder[] = [];

    // Milestone 1: Planting day confirmation
    reminders.push({
      id: `rem_${cycleId}_plantio`,
      cycleId,
      title: `Plantio de ${crop} Realizado`,
      description: `Registar início oficial da sementeira e verificar humidade do solo nas primeiras 48h.`,
      dueDate: plantingDateStr,
      type: 'plantio',
      priority: 'alta',
      completed: true,
      completedAt: plantingDateStr,
      isAutoGenerated: true,
      stageOffsetDays: 0
    });

    // Milestone stages scaled according to estimated harvest duration
    config.stages.forEach((stage, idx) => {
      const scaledOffset = Math.max(1, Math.round(stage.offsetDays * scaleFactor));
      // Cap at total days
      if (scaledOffset < totalDays) {
        const dueDate = this.addDays(plantingDateStr, scaledOffset);
        const isPast = new Date(dueDate) < new Date();

        reminders.push({
          id: `rem_${cycleId}_stage_${idx}`,
          cycleId,
          title: stage.title,
          description: stage.description,
          dueDate,
          type: stage.type,
          priority: stage.priority,
          completed: isPast,
          completedAt: isPast ? dueDate : undefined,
          isAutoGenerated: true,
          stageOffsetDays: scaledOffset
        });
      }
    });

    // Harvest Day Milestone
    const isHarvestPast = new Date(estimatedHarvestDateStr) < new Date();
    reminders.push({
      id: `rem_${cycleId}_harvest`,
      cycleId,
      title: `Data Estimada de Início da Colheita de ${crop}`,
      description: `Iniciar apanha na maturação plena. Limpar celeiro ou estaleiro e verificar cotação de mercado em Homoíne/Maxixe.`,
      dueDate: estimatedHarvestDateStr,
      type: 'colheita',
      priority: 'alta',
      completed: isHarvestPast,
      completedAt: isHarvestPast ? estimatedHarvestDateStr : undefined,
      isAutoGenerated: true,
      stageOffsetDays: totalDays
    });

    return reminders;
  },

  /**
   * Get user's crop cycles from storage (or seed default if empty)
   */
  getUserCycles(userId: string, defaultCrop: CropType = 'Milho'): CropCycle[] {
    try {
      const key = `${STORAGE_CYCLES_PREFIX}${userId}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Error reading crop cycles from localStorage:', e);
    }

    // Default seeded cycles tailored to the farmer
    const now = new Date();
    // Cycle 1: Currently active crop planted 42 days ago
    const plantingDate1 = new Date(now);
    plantingDate1.setDate(now.getDate() - 42);
    const planting1Str = plantingDate1.toISOString().split('T')[0];
    const harvest1Str = this.calculateHarvestDate(planting1Str, CROP_CONFIGS[defaultCrop]?.defaultDurationDays || 105);

    const cycle1Id = `cycle_${userId}_main_01`;
    const cycle1Reminders = this.generateAutoReminders(cycle1Id, defaultCrop, planting1Str, harvest1Str);

    const initialCycles: CropCycle[] = [
      {
        id: cycle1Id,
        userId,
        plotName: 'Machamba Principal · Zona do Rio',
        crop: defaultCrop,
        variety: CROP_CONFIGS[defaultCrop]?.popularVarieties[0] || 'Variedade Selecionada',
        areaHectares: 1.5,
        plantingDate: planting1Str,
        estimatedHarvestDate: harvest1Str,
        status: this.determineStatus(planting1Str, harvest1Str),
        expectedYieldKg: defaultCrop === 'Milho' ? 3200 : defaultCrop === 'Mandioca' ? 8500 : 1800,
        notes: 'Sementeira realizada logo após as primeiras chuvas com camalhões espaçados.',
        createdAt: planting1Str,
        reminders: cycle1Reminders
      }
    ];

    // If default crop is not Feijão or Mandioca, add a secondary diversified cycle
    const secondaryCrop: CropType = defaultCrop === 'Milho' ? 'Feijão nhemba' : 'Milho';
    const plantingDate2 = new Date(now);
    plantingDate2.setDate(now.getDate() - 15);
    const planting2Str = plantingDate2.toISOString().split('T')[0];
    const harvest2Str = this.calculateHarvestDate(planting2Str, CROP_CONFIGS[secondaryCrop]?.defaultDurationDays || 70);
    const cycle2Id = `cycle_${userId}_sec_02`;
    const cycle2Reminders = this.generateAutoReminders(cycle2Id, secondaryCrop, planting2Str, harvest2Str);

    initialCycles.push({
      id: cycle2Id,
      userId,
      plotName: 'Parcela 2 · Camalhões Norte',
      crop: secondaryCrop,
      variety: CROP_CONFIGS[secondaryCrop]?.popularVarieties[0] || 'Variedade Local',
      areaHectares: 0.8,
      plantingDate: planting2Str,
      estimatedHarvestDate: harvest2Str,
      status: this.determineStatus(planting2Str, harvest2Str),
      expectedYieldKg: 950,
      notes: 'Consorciação para fixação de azoto no solo e segurança alimentar.',
      createdAt: planting2Str,
      reminders: cycle2Reminders
    });

    this.saveUserCycles(userId, initialCycles);
    return initialCycles;
  },

  /**
   * Save cycles to local storage
   */
  saveUserCycles(userId: string, cycles: CropCycle[]) {
    try {
      const key = `${STORAGE_CYCLES_PREFIX}${userId}`;
      localStorage.setItem(key, JSON.stringify(cycles));
    } catch (e) {
      console.error('Error saving crop cycles:', e);
    }
  },

  /**
   * Create new crop cycle with automatic reminders
   */
  createCycle(
    userId: string,
    data: {
      plotName: string;
      crop: CropType;
      variety?: string;
      areaHectares: number;
      plantingDate: string;
      estimatedHarvestDate?: string;
      expectedYieldKg?: number;
      notes?: string;
    }
  ): CropCycle {
    const cycleId = `cycle_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const durationDays = CROP_CONFIGS[data.crop]?.defaultDurationDays || 90;
    const estimatedHarvestDate = data.estimatedHarvestDate || this.calculateHarvestDate(data.plantingDate, durationDays);

    const autoReminders = this.generateAutoReminders(cycleId, data.crop, data.plantingDate, estimatedHarvestDate);

    const newCycle: CropCycle = {
      id: cycleId,
      userId,
      plotName: data.plotName.trim() || `Parcela ${data.crop}`,
      crop: data.crop,
      variety: data.variety?.trim(),
      areaHectares: Number(data.areaHectares) || 1,
      plantingDate: data.plantingDate,
      estimatedHarvestDate,
      status: this.determineStatus(data.plantingDate, estimatedHarvestDate),
      expectedYieldKg: data.expectedYieldKg ? Number(data.expectedYieldKg) : undefined,
      notes: data.notes?.trim(),
      createdAt: new Date().toISOString(),
      reminders: autoReminders
    };

    const existing = this.getUserCycles(userId, data.crop);
    const updated = [newCycle, ...existing];
    this.saveUserCycles(userId, updated);

    // Notify user of creation and scheduled reminders
    NotificationsService.sendPush(
      `Novo Cultivo Registado: ${newCycle.plotName}`,
      `Ciclo de ${newCycle.crop} agendado para colheita em ${newCycle.estimatedHarvestDate}. ${autoReminders.length} lembretes gerados.`,
      'system'
    );

    return newCycle;
  },

  /**
   * Update existing cycle
   */
  updateCycle(userId: string, cycle: CropCycle): CropCycle[] {
    const cycles = this.getUserCycles(userId);
    const updated = cycles.map(c => c.id === cycle.id ? {
      ...cycle,
      status: cycle.actualHarvestDate 
        ? 'colhido' 
        : this.determineStatus(cycle.plantingDate, cycle.estimatedHarvestDate, cycle.actualHarvestDate)
    } : c);

    this.saveUserCycles(userId, updated);
    return updated;
  },

  /**
   * Delete a cycle
   */
  deleteCycle(userId: string, cycleId: string): CropCycle[] {
    const cycles = this.getUserCycles(userId);
    const updated = cycles.filter(c => c.id !== cycleId);
    this.saveUserCycles(userId, updated);
    return updated;
  },

  /**
   * Toggle completion state of a reminder
   */
  toggleReminder(userId: string, cycleId: string, reminderId: string): { cycles: CropCycle[]; toggledReminder?: CropReminder } {
    const cycles = this.getUserCycles(userId);
    let toggledReminder: CropReminder | undefined;

    const updated = cycles.map(c => {
      if (c.id !== cycleId) return c;
      const newReminders = c.reminders.map(r => {
        if (r.id !== reminderId) return r;
        const nextCompleted = !r.completed;
        toggledReminder = {
          ...r,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined
        };
        return toggledReminder;
      });
      return { ...c, reminders: newReminders };
    });

    this.saveUserCycles(userId, updated);
    return { cycles: updated, toggledReminder };
  },

  /**
   * Add a custom reminder to a cycle
   */
  addCustomReminder(
    userId: string,
    cycleId: string,
    reminderData: {
      title: string;
      description: string;
      dueDate: string;
      type: CropReminderType;
      priority: 'alta' | 'media' | 'baixa';
    }
  ): { cycles: CropCycle[]; newReminder: CropReminder } {
    const cycles = this.getUserCycles(userId);
    const reminderId = `rem_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newReminder: CropReminder = {
      id: reminderId,
      cycleId,
      title: reminderData.title.trim(),
      description: reminderData.description.trim(),
      dueDate: reminderData.dueDate,
      type: reminderData.type,
      priority: reminderData.priority,
      completed: false,
      isAutoGenerated: false
    };

    const updated = cycles.map(c => {
      if (c.id !== cycleId) return c;
      return {
        ...c,
        reminders: [...c.reminders, newReminder].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      };
    });

    this.saveUserCycles(userId, updated);

    NotificationsService.sendPush(
      `Novo Lembrete Agrícola Agendado`,
      `${newReminder.title} para o dia ${newReminder.dueDate}.`,
      'system'
    );

    return { cycles: updated, newReminder };
  },

  /**
   * Check for due reminders and trigger in-app notifications
   */
  checkDueReminders(userId: string): CropReminder[] {
    const cycles = this.getUserCycles(userId);
    const today = new Date().toISOString().split('T')[0];
    const dueReminders: CropReminder[] = [];

    cycles.forEach(cycle => {
      cycle.reminders.forEach(r => {
        if (!r.completed && r.dueDate <= today) {
          dueReminders.push(r);
        }
      });
    });

    return dueReminders;
  }
};
