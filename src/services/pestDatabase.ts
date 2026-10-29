/**
 * AgroResiliente Inhambane - Pest & Disease Database
 * Curated knowledge base of common pests & diseases in Inhambane Province (Homoíne, Maxixe, Massinga).
 */

import { PestRecord, SavedDiagnosis } from '../types/pest';
import { CropType } from '../types/auth';

export const PEST_DATABASE: PestRecord[] = [
  // --- MILHO ---
  {
    id: 'pest_milho_01',
    name: 'Lagarta-do-Cartucho do Milho',
    scientificName: 'Spodoptera frugiperda',
    crop: 'Milho',
    plantPart: 'Folha',
    severity: 'Crítico',
    symptoms: [
      'Folhas novas furadas como se tivessem levado chumbo de caça',
      'Excrementos tipo serradura castanha/verde dentro do cartucho',
      'Destruição rápida do meristema central do milho'
    ],
    visualSigns: 'Lagarta castanha ou esverdeada com um Y invertido claro na cabeça e 4 pontos pretos em trapézio no dorso.',
    riskFactor: 'Calor elevado (28°C-34°C) e períodos de estiagem após as primeiras chuvas em Homoíne.',
    bioRemedy: {
      name: 'Calda de Cinzas com Areia Fina e Pimenta Malagueta',
      ingredients: [
        '1 caneca de cinza de madeira peneirada',
        '1 caneca de areia de rio limpa',
        '2 colheres de sopa de pimenta malagueta seca moída'
      ],
      preparation: 'Misture bem a cinza, areia e pimenta a seco numa bacia.',
      application: 'Deite uma pitada generosa (cerca de 5g) diretamente no olho do cartucho pela manhã cedo enquanto o orvalho está presente. O pó sufoca a lagarta e queima a sua cutícula sensível.',
      costEstimate: 'Custo zero (materiais locais da aldeia)'
    },
    culturalControl: [
      'Vistoria diária no estágio de 2 a 6 folhas',
      'Associação com Feijão Nhemba ou Desmodium para atrair parasitoides',
      'Eliminar capim hospedeiro nas bordas da machamba'
    ],
    chemicalGuidance: 'Em infestações acima de 20% das plantas, consulte o extensionista do SDAE antes de usar produtos químicos.',
    urgentAction: 'Inspecione a machamba hoje e trate primeiro os focos mais jovens para evitar alastramento.'
  },
  {
    id: 'pest_milho_02',
    name: 'Broca do Colmo / Tronco',
    scientificName: 'Busseola fusca',
    crop: 'Milho',
    plantPart: 'Caule',
    severity: 'Alto',
    symptoms: [
      'Furos de entrada no colmo com serradura expelida',
      'Coração morto (folha central seca e puxa-se facilmente)',
      'Tombamento fácil do milho com ventos fortes'
    ],
    visualSigns: 'Galerias internas no caule que cortam o fluxo de seiva da raiz para as maçarocas.',
    riskFactor: 'Cultivos contínuos de milho ou mapira na mesma machamba sem rotação.',
    bioRemedy: {
      name: 'Macerado de Folhas de Neem (Neem Moçambicano)',
      ingredients: ['1 kg de folhas verdes de neem bem esmagadas', '10 litros de água', '50g de sabão azul ralado'],
      preparation: 'Deixe as folhas de molho na água por 24 horas à sombra. Coe com pano fino e misture o sabão para fixar.',
      application: 'Pulverize a base dos caules e cartuchos a cada 7 dias nas primeiras 4 semanas de cultivo.',
      costEstimate: 'Muito baixo (sabão azul local)'
    },
    culturalControl: [
      'Queima controlada ou compostagem dos restos culturais anteriores',
      'Rotação anual com mandioca ou amendoim para quebrar o ciclo biológico'
    ],
    urgentAction: 'Arranque e queime os pés com "coração morto" para não espalhar larvas vizinhas.'
  },

  // --- MANDIOCA ---
  {
    id: 'pest_mandioca_01',
    name: 'Doença do Mosaico Africano da Mandioca (CMD)',
    scientificName: 'Cassava Mosaic Begomovirus',
    crop: 'Mandioca',
    plantPart: 'Folha',
    severity: 'Crítico',
    symptoms: [
      'Folhas deformadas, onduladas e muito menores que o normal',
      'Mosaico de manchas verde-claras e amarelo-vivo no limbo foliar',
      'Crescimento raquítico da haste e raízes muito finas e sem amido'
    ],
    visualSigns: 'Plantas baixas com aspecto encaracolado transmitidas pela mosca-branca (Bemisia tabaci).',
    riskFactor: 'Uso de manivas/estacas infetadas da colheita anterior ou vizinhança com mosca-branca.',
    bioRemedy: {
      name: 'Repelente Caseiro de Alho e Sabão para Mosca-Branca',
      ingredients: ['3 cabeças de alho esmagadas', '1 colher de óleo vegetal', '10 litros de água morna', '30g sabão neutro'],
      preparation: 'Misture o alho no óleo por 24h, adicione a água e sabão e coe bem.',
      application: 'Pulverize o verso das folhas jovens 2 vezes por semana ao pôr do sol para repelir a mosca-branca.',
      costEstimate: 'Baixo'
    },
    culturalControl: [
      'SELEÇÃO RIGOROSA: Nunca corte manivas de pés com manchas amarelas ou folhas enroladas',
      'Use variedades melhoradas tolerantes recomendadas pelo IIAM (ex: Chinhembwe, Amendoim-Mandioca)',
      'Arranque e elimine as plantas sintomáticas logo no primeiro mês (roguing)'
    ],
    urgentAction: 'Arranque imediatamente plantas infectadas com raiz inteira e queime-as fora da machamba.'
  },
  {
    id: 'pest_mandioca_02',
    name: 'Ácaro Verde da Mandioca',
    scientificName: 'Mononychellus tanajoa',
    crop: 'Mandioca',
    plantPart: 'Folha',
    severity: 'Alto',
    symptoms: [
      'Pontuações amarelas no topo das folhas jovens dando aspecto de lixa',
      'Morte do broto terminal ("efeito castiçal")',
      'Queda prematura das folhas superiores na época seca'
    ],
    visualSigns: 'Micropontos avermelhados ou esverdeados na face inferior das folhas sob sol quente.',
    riskFactor: 'Época seca prolongada (Maio a Setembro) e poeira acumulada nas folhas.',
    bioRemedy: {
      name: 'Calda de Folhas de Mamão e Cinza Vegetal',
      ingredients: ['5 folhas grandes de mamoeiro esmagadas', '10L de água', '1 copo de cinza fina'],
      preparation: 'Bata as folhas de mamoeiro com água, adicione a cinza e deixe curar 12 horas.',
      application: 'Molhe abundantemente os ponteiros das hastes no final da tarde.',
      costEstimate: 'Gratuito'
    },
    culturalControl: [
      'Plantação logo no início das chuvas para plantas estarem vigorosas antes da seca',
      'Consórcio com feijão nhemba que preserva humidade no solo arenoso'
    ],
    urgentAction: 'Evite passar manivas contaminadas entre talhões de Homoíne.'
  },

  // --- AMENDOIM ---
  {
    id: 'pest_amendoim_01',
    name: 'Cercosporiose / Mancha Castanha Foliar',
    scientificName: 'Cercospora arachidicola / Phaeoisariopsis personata',
    crop: 'Amendoim',
    plantPart: 'Folha',
    severity: 'Alto',
    symptoms: [
      'Pequenas manchas circulares castanho-escuras com halo amarelo ao redor',
      'Desfolha precoce da base para cima, deixando hastes peladas',
      'Redução drástica do enchimento das vagens subterrâneas'
    ],
    visualSigns: 'Folhas inferiores caídas no chão e manchas negras no pecíolo.',
    riskFactor: 'Humidade noturna alta com dias quentes e densidade excessiva de sementeira.',
    bioRemedy: {
      name: 'Calda Bordalesa Rústica ou Bicarbonato com Leite',
      ingredients: ['50g de bicarbonato de sódio ou cinza bem lavada', '1 litro de leite azedo ou soro', '9 litros de água'],
      preparation: 'Misture bem e aplique assim que surgirem as primeiras pintas nas folhas mais velhas.',
      application: 'Pulverize a cada 10 dias após chuvas ou neblina matinal forte.',
      costEstimate: 'Muito baixo'
    },
    culturalControl: [
      'Espaçamento adequado (40 cm entre linhas e 15 cm entre plantas) para ventilação',
      'Não regar as folhas ao anoitecer; direcionar água para o solo',
      'Secagem correta das sementes após colheita'
    ],
    urgentAction: 'Retire folhas muito atacadas do chão e não enterre restos verdes no mesmo local.'
  },
  {
    id: 'pest_amendoim_02',
    name: 'Vírus da Roseta do Amendoim (GRD)',
    scientificName: 'Groundnut Rosette Virus (transmitido por afídeos)',
    crop: 'Amendoim',
    plantPart: 'Toda a Planta',
    severity: 'Crítico',
    symptoms: [
      'Planta anã, compactada em formato de roseta ("vassoura de bruxa")',
      'Folhas pequenas, mosqueadas ou totalmente amarelas',
      'Planta não floresce nem produz vagens'
    ],
    visualSigns: 'Colónias de pulgões pretos (Aphis craccivora) na base do colo e folhas novas.',
    riskFactor: 'Sementeiras tardias e espaçamento ralo que facilita aterragem dos pulgões.',
    bioRemedy: {
      name: 'Solução de Sabão Azul com Extrato de Tabaco/Malagueta',
      ingredients: ['50g de sabão azul raspado', '5 malaguetas secas esmagadas', '5L de água morna'],
      preparation: 'Ferva a malagueta, dissolva o sabão, deixe esfriar e filtre.',
      application: 'Borrife os focos de pulgões pretos pela manhã.',
      costEstimate: 'Mínimo'
    },
    culturalControl: [
      'Sementeira no compasso denso logo nas primeiras chuvas de Outubro/Novembro',
      'A cobertura rápida do solo impede a chegada dos pulgões vetores'
    ],
    urgentAction: 'Arranque as plantas anãs antes que os pulgões transmitam o vírus para a machamba inteira.'
  },

  // --- CAJU ---
  {
    id: 'pest_caju_01',
    name: 'Oídio do Cajueiro',
    scientificName: 'Pseudoidium anacardii',
    crop: 'Caju',
    plantPart: 'Flor / Vagem / Espiga',
    severity: 'Crítico',
    symptoms: [
      'Pó esbranquiçado cobrindo as inflorescências, folhas novas e castanhas pequenas',
      'Secagem e abortamento massivo das flores de caju',
      'Castanhas pequenas deformadas e com casca rachada cinzenta'
    ],
    visualSigns: 'Aspecto de cinza polvilhada sobre os ramos floridos no período de floração (Junho a Setembro).',
    riskFactor: 'Neblinas frias de Inhambane pela manhã com tardes amenas.',
    bioRemedy: {
      name: 'Polvilhamento com Enxofre Molhável ou Cinza de Madeira Lavada',
      ingredients: ['Enxofre em pó (disponível via INCAJU/SDAE) ou cinza vegetal ultrafina'],
      preparation: 'Enxofre misturado em água conforme dosagem do técnico ou polvilhado com saco de aniagem.',
      application: 'Fazer 3 a 4 aplicações durante o ciclo de floração antes da abertura total das flores.',
      costEstimate: 'Apoio subsidiado pelos serviços agrários de Inhambane'
    },
    culturalControl: [
      'Poda de limpeza: remover ramos secos e cruzetados para entrada de sol na copa',
      'Limpeza da base do tronco (desmato) para circulação de ar'
    ],
    urgentAction: 'Contacte o ponto focal do INCAJU ou SDAE Homoíne para obter suporte na campanha de pulverização.'
  },

  // --- FEIJÃO NHEMBA ---
  {
    id: 'pest_feijao_01',
    name: 'Lagarta-das-Vagens do Feijão Nhemba',
    scientificName: 'Maruca vitrata',
    crop: 'Feijão nhemba',
    plantPart: 'Flor / Vagem / Espiga',
    severity: 'Alto',
    symptoms: [
      'Flores e folhas tecidas com fios de seda contendo fezes de larvas',
      'Perfurações nas vagens verdes jovens com grãos devorados',
      'Queda precoce de botões florais'
    ],
    visualSigns: 'Lagarta clara com pequenas manchas escuras ao longo do corpo abrigada dentro de teias florais.',
    riskFactor: 'Floração durante períodos de chuvas frequentes com calor.',
    bioRemedy: {
      name: 'Extrato Aquoso de Folhas de Neem e Sabão',
      ingredients: ['500g de folhas frescas de neem', '5 litros de água limpa', '20g sabão em barra'],
      preparation: 'Piloneie as folhas até virar pasta, deixe na água 12h, coe e misture o sabão.',
      application: 'Pulverize no início do botão floral, ao entardecer quando as borboletas depositam ovos.',
      costEstimate: 'Praticamente nulo'
    },
    culturalControl: [
      'Plantio sincronizado na comunidade para evitar concentração de pragas numa só machamba',
      'Colheita pontual assim que as vagens secarem'
    ],
    urgentAction: 'Aplique o extrato vegetal antes que as vagens endureçam.'
  },

  // --- BATATA-DOCE ---
  {
    id: 'pest_batata_01',
    name: 'Gorgulho da Batata-Doce',
    scientificName: 'Cylas formicarius',
    crop: 'Batata-doce',
    plantPart: 'Raiz / Tubérculo',
    severity: 'Alto',
    symptoms: [
      'Rama junto ao solo engrossada, escura e com furos de saída de besouros',
      'Batatas com galerias internas, cheiro forte e sabor amargo intragável',
      'Folhas amareladas e murchas em períodos de seca'
    ],
    visualSigns: 'Pequenos besouros esguios azuis-metálicos com patas e tórax avermelhados parecidos com formigas.',
    riskFactor: 'Solos arenosos com rachas no período seco que expõem as raízes tuberosas.',
    bioRemedy: {
      name: 'Chegamento Preventivo de Terra e Cinza na Base',
      ingredients: ['Cinza de lenha', 'Terra fértil para cobrir fendas'],
      preparation: 'Espalhe cinza ao redor da rama e cubra generosamente com terra.',
      application: 'Faça o achego de terra aos 30 e aos 60 dias para tampar qualquer fissura no camalhão.',
      costEstimate: 'Custo zero'
    },
    culturalControl: [
      'Utilizar apenas ramas jovens dos ponteiros sem sinais de engrossamento basal',
      'Não plantar batata-doce no mesmo camalhão por dois ciclos seguidos',
      'Colher assim que os tubérculos atingirem tamanho comercial'
    ],
    urgentAction: 'Cubra imediatamente todas as rachaduras do solo com terra fresca para impedir que o gorgulho chegue às batatas.'
  }
];

const STORAGE_SAVED_DIAGNOSES = 'agro_saved_diagnoses_v1';

export class PestService {
  public static getAllPests(): PestRecord[] {
    return PEST_DATABASE;
  }

  public static getPestsByCrop(crop: CropType): PestRecord[] {
    return PEST_DATABASE.filter(p => p.crop === crop);
  }

  public static searchPests(query: string, crop?: CropType, part?: string): PestRecord[] {
    const q = query.toLowerCase().trim();
    return PEST_DATABASE.filter(p => {
      const matchCrop = !crop || crop === 'Outra' || p.crop === crop;
      const matchPart = !part || part === 'Todas' || p.plantPart === part;
      const matchQuery = !q || 
        p.name.toLowerCase().includes(q) ||
        p.scientificName.toLowerCase().includes(q) ||
        p.symptoms.some(s => s.toLowerCase().includes(q)) ||
        p.visualSigns.toLowerCase().includes(q) ||
        p.bioRemedy.name.toLowerCase().includes(q);
      return matchCrop && matchPart && matchQuery;
    });
  }

  public static getSavedDiagnoses(): SavedDiagnosis[] {
    try {
      const raw = localStorage.getItem(STORAGE_SAVED_DIAGNOSES);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Error loading saved diagnoses:', e);
    }
    return [
      {
        id: 'diag_init_01',
        date: '2026-10-24',
        crop: 'Milho',
        symptoms: 'Folhas novas comidas e fezes verdes dentro do cartucho',
        pestIdentified: 'Lagarta-do-Cartucho do Milho',
        severity: 'Crítico',
        notes: 'Aplicada calda de cinza com areia no dia 25/10. População de lagartas reduziu sensivelmente.'
      }
    ];
  }

  public static saveDiagnosis(diag: Omit<SavedDiagnosis, 'id' | 'date'>): SavedDiagnosis {
    const current = this.getSavedDiagnoses();
    const newEntry: SavedDiagnosis = {
      id: 'diag_' + Date.now().toString(36),
      date: new Date().toISOString().split('T')[0],
      ...diag
    };
    const updated = [newEntry, ...current];
    try {
      localStorage.setItem(STORAGE_SAVED_DIAGNOSES, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving diagnosis:', e);
    }
    return newEntry;
  }
}
