import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Initialize Google GenAI with recommended telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Fallback agronomic expert knowledge for Inhambane crops
const AGRONOMIC_FALLBACKS: Record<string, any> = {
  Mandioca: {
    weekTitle: 'Maneio e Multiplicação Hídrica da Mandioca',
    mainFocus: 'Seleção de estacas sãs e cobertura morta contra evaporação rápida',
    seasonStage: 'Fase de enraizamento e tuberização',
    climateImpactNote: 'Os solos franco-arenosos de Homoíne perdem humidade rapidamente sob sol forte; o mulching é essencial.',
    tips: [
      {
        category: 'Maneio do Solo',
        title: 'Cobertura Morta (Mulching) na Base dos Camalhões',
        description: 'Aplique 5 cm de palha seca ou folhas secas ao redor dos pés de mandioca para reduzir a temperatura do solo e reter humidade.',
        urgency: 'Alta'
      },
      {
        category: 'Proteção Fitossanitária',
        title: 'Inspeção contra Cochonilha e Mosaico Africano',
        description: 'Verifique semanalmente o verso das folhas jovens. Se observar deformações ou manchas amarelas, remova e queime as plantas afetadas fora da machamba.',
        urgency: 'Preventiva'
      },
      {
        category: 'Rega e Água',
        title: 'Aproveitamento das Chuvas e Abertura de Bacias',
        description: 'Construa pequenas microbacias de retenção entre as linhas para que a água da chuva infiltre junto às raízes.',
        urgency: 'Média'
      }
    ],
    localLanguageTip: 'Kombela mbuti yi nga dyi mihanja — Proteja os rebentos jovens dos animais para garantir tubérculos fortes (Bitonga / Xitswa).',
    recommendedAction: 'Realizar desbaste leve deixando apenas 2 a 3 hastes vigorosas por cepa.'
  },
  Milho: {
    weekTitle: 'Proteção do Milho contra Lagarta e Nutrição',
    mainFocus: 'Monitorização da lagarta do cartucho e aplicação de adubo composto',
    seasonStage: 'Fase de crescimento vegetativo e espigamento',
    climateImpactNote: 'As noites amenas e dias quentes em Inhambane favorecem a eclosão da lagarta do cartucho; atenção aos primeiros sinais.',
    tips: [
      {
        category: 'Proteção Fitossanitária',
        title: 'Vistoria Diária ao Cartucho do Milho',
        description: 'Inspeccione os cartuchos matinais. Para pequenos ataques, a aplicação localizada de cinza de madeira misturada com areia no cartucho sufoca as larvas.',
        urgency: 'Alta'
      },
      {
        category: 'Maneio do Solo',
        title: 'Sacha Rasa e Chegamento de Terra',
        description: 'Elimine ervas daninhas concorrentes e chegue terra ao pé do milho para ancorar as raízes adventícias contra ventos.',
        urgency: 'Média'
      },
      {
        category: 'Rega e Água',
        title: 'Rega nas Horas Frescas',
        description: 'Priorize regar entre as 06:00 e as 08:30 da manhã para minimizar a perda por evapotranspiração que atinge 4 mm/dia nesta época.',
        urgency: 'Média'
      }
    ],
    localLanguageTip: 'Mavele ma lava mati na ntamu — O milho precisa de água e terra bem cuidada para dar maçarocas cheias.',
    recommendedAction: 'Adicionar estrume bem curtido ou cinzas vegetais na base antes da próxima rega.'
  },
  Amendoim: {
    weekTitle: 'Formação de Ginóforos e Solo Fofo no Amendoim',
    mainFocus: 'Afofamento suave do solo para facilitar a penetração dos ginóforos (pregos)',
    seasonStage: 'Fase de floração e formação de vagens subterrâneas',
    climateImpactNote: 'O amendoim adapta-se bem ao clima de Homoíne e Maxixe, mas solos compactados impedem as vagens de se desenvolverem.',
    tips: [
      {
        category: 'Maneio do Solo',
        title: 'Amanho Cuidadoso ao Redor da Planta',
        description: 'Mantenha o solo ao redor das plantas muito fofo e livre de crostas duras para que os pregos penetrem sem resistência.',
        urgency: 'Alta'
      },
      {
        category: 'Proteção Fitossanitária',
        title: 'Vigilância da Cercosporiose (Mancha Castanha)',
        description: 'Evite regar as folhas ao final da tarde para não acumular humidade noturna que estimula fungos foliares.',
        urgency: 'Média'
      },
      {
        category: 'Colheita e Armazenamento',
        title: 'Preparação do Estaleiro de Secagem',
        description: 'Prepare esteiras suspensas para a secagem pós-colheita, evitando contacto direto com o chão para prevenir contaminação por aflatoxinas.',
        urgency: 'Preventiva'
      }
    ],
    localLanguageTip: 'Kudya timanga u tsaka — Cuidar do amendoim garante sustento e bom mercado em Inhambane.',
    recommendedAction: 'Não fazer sachas profundas depois que a planta começar a emitir pregos para não cortar as vagens.'
  }
};

// POST /api/gemini/agricultural-tips
app.post('/api/gemini/agricultural-tips', async (req, res) => {
  const { crop = 'Milho', zone = 'Homoíne-Sede', farmerType = 'Familiar', weatherContext } = req.body;

  // Check if API key is provided
  if (!process.env.GEMINI_API_KEY) {
    console.info('No GEMINI_API_KEY environment variable found. Returning verified agronomic expert fallback.');
    const fallback = AGRONOMIC_FALLBACKS[crop] || AGRONOMIC_FALLBACKS['Milho'];
    return res.json({
      success: true,
      data: {
        ...fallback,
        crop,
        zone,
        generatedWith: 'knowledge-base',
        timestamp: new Date().toISOString()
      }
    });
  }

  try {
    const prompt = `Gere dicas agronómicas semanais personalizadas e práticas para um produtor agrícola com as seguintes características:
- Cultura Principal: ${crop}
- Localidade / Distrito: ${zone}, Província de Inhambane, Moçambique
- Perfil do Produtor: ${farmerType}
${weatherContext ? `- Contexto Climático Atual: ${JSON.stringify(weatherContext)}` : ''}

Considere as características reais de Inhambane (solos franco-arenosos de Homoíne, temperaturas subtropicais, regimes de chuva de Moçambique, práticas agroecológicas sustentáveis e de baixo custo como mulching, compostagem e controlo biológico de pragas).
Forneça recomendações práticas e um provérbio ou frase de incentivo ligada à agricultura em Bitonga/Xitswa com tradução para português.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'É um Engenheiro Agrónomo Sénior e Extensionista de Campo especialista na agricultura de Moçambique e nas condições agroecológicas da Província de Inhambane (Homoíne, Maxixe, Massinga). Forneça orientações técnicas de alta utilidade, práticas e adaptadas aos pequenos e médios produtores familiares.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weekTitle: { type: Type.STRING, description: 'Título temático da semana para a cultura' },
            mainFocus: { type: Type.STRING, description: 'Foco prioritário de maneio na machamba' },
            seasonStage: { type: Type.STRING, description: 'Estágio do ciclo fenológico da cultura' },
            climateImpactNote: { type: Type.STRING, description: 'Como o clima atual de Inhambane afeta esta cultura' },
            tips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: 'Categoria da dica (ex: Maneio do Solo, Rega e Água, Proteção Fitossanitária, Colheita)' },
                  title: { type: Type.STRING, description: 'Título conciso da dica' },
                  description: { type: Type.STRING, description: 'Instrução prática passo-a-passo' },
                  urgency: { type: Type.STRING, description: 'Alta, Média ou Preventiva' }
                },
                required: ['category', 'title', 'description', 'urgency']
              }
            },
            localLanguageTip: { type: Type.STRING, description: 'Provérbio ou conselho tradicional agrícola em língua local (Bitonga ou Xitswa) com significado em português' },
            recommendedAction: { type: Type.STRING, description: 'Ação imediata recomendada para hoje' }
          },
          required: ['weekTitle', 'mainFocus', 'seasonStage', 'climateImpactNote', 'tips', 'localLanguageTip', 'recommendedAction']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error('Resposta vazia da API do Gemini.');

    const parsedData = JSON.parse(text);
    return res.json({
      success: true,
      data: {
        ...parsedData,
        crop,
        zone,
        generatedWith: 'gemini-3.8-flash',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Gemini API Error in /api/gemini/agricultural-tips:', error);
    // Return resilient expert fallback so frontend remains fully operational
    const fallback = AGRONOMIC_FALLBACKS[crop] || AGRONOMIC_FALLBACKS['Milho'];
    return res.json({
      success: true,
      data: {
        ...fallback,
        crop,
        zone,
        generatedWith: 'knowledge-base-fallback',
        errorDetails: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// POST /api/gemini/pest-diagnosis
app.post('/api/gemini/pest-diagnosis', async (req, res) => {
  const { crop = 'Milho', symptoms = '', plantPart = 'Folha', zone = 'Homoíne-Sede' } = req.body;

  // Fallback diagnostic generator
  const generateFallbackDiagnosis = () => {
    const sLower = (symptoms || '').toLowerCase();
    if (crop === 'Milho' || sLower.includes('lagarta') || sLower.includes('furo')) {
      return {
        pestName: 'Lagarta-do-Cartucho do Milho (Spodoptera frugiperda)',
        confidence: 'Alta',
        analysis: 'Os sintomas descritos coincidem com infestação de lagarta-do-cartucho, praga severa em Inhambane especialmente em solos arenosos com chuvas intermitentes.',
        immediateAction: 'Aplicar calda de cinza com areia ou macerado de neem diretamente no olho do cartucho pela manhã cedo.',
        bioRemedy: {
          recipe: 'Calda de cinza de madeira peneirada (1 copo) + areia de rio limpa (1 copo) + 1 colher de pimenta malagueta em pó.',
          instructions: 'Deite uma pitada no centro do cartucho molhado de orvalho para asfixiar as larvas jovens sem usar químicos caros.'
        },
        preventiveMeasures: [
          'Vistoria diária das plantas no estágio de 2 a 6 folhas',
          'Eliminar ervas daninhas hospedeiras nas margens da machamba',
          'Consorciação com feijão nhemba para repelência natural'
        ],
        urgentWarning: 'Se mais de 20% das plantas tiverem danos severos no meristema central, contacte o extensionista da sua zona.',
        extensionistAdvice: 'Procure o posto do SDAE Homoíne ou Maxixe para verificar se há armadilhas de feromona ativas na sua área.'
      };
    } else if (crop === 'Mandioca' || sLower.includes('mosaico') || sLower.includes('amarelo')) {
      return {
        pestName: 'Mosaico Africano da Mandioca (CMD)',
        confidence: 'Alta',
        analysis: 'A deformação foliar e o padrão mosqueado indicam virose transmitida por estacas infectadas ou vetor mosca-branca.',
        immediateAction: 'Arranque as plantas seriamente atacadas pela raiz e queime fora da machamba.',
        bioRemedy: {
          recipe: 'Solução repelente de alho (3 cabeças esmagadas) com 1 colher de óleo e sabão azul em 10 litros de água.',
          instructions: 'Pulverize o verso das folhas das plantas sãs para impedir novas picadas de mosca-branca.'
        },
        preventiveMeasures: [
          'Usar apenas manivas comprovadamente limpas ou variedades do IIAM',
          'Limpeza e arranque sanitário precoce (roguing)'
        ],
        urgentWarning: 'Não reaproveite hastes de plantas doentes para a próxima sementeira.',
        extensionistAdvice: 'Solicite ao técnico agrária manivas de multiplicação certificada livres de vírus.'
      };
    } else {
      return {
        pestName: `Problema Fitossanitário em ${crop} (${plantPart})`,
        confidence: 'Média',
        analysis: `Com base nos sintomas informados (${symptoms || 'danos foliares/vegetativos'}) em ${crop} na zona de ${zone}, recomenda-se isolamento e tratamento preventivo com bio-calda.`,
        immediateAction: 'Remover partes mortas ou muito danificadas e pulverizar extrato de neem com sabão nas primeiras horas do dia.',
        bioRemedy: {
          recipe: 'Extrato aquoso de neem: 1kg de folhas esmagadas em 10L de água + 30g de sabão neutro para aderência.',
          instructions: 'Deixar curar 24h à sombra, filtrar e aplicar em pulverização fina em toda a área foliar.'
        },
        preventiveMeasures: [
          'Rotação de culturas com leguminosas na próxima época',
          'Melhorar a drenagem e retenção de água com cobertura morta (mulch)',
          'Evitar rega tardia nas folhas para conter fungos'
        ],
        urgentWarning: 'Monitore diariamente a evolução das manchas ou insetos.',
        extensionistAdvice: 'Partilhe uma amostra ou foto com o extensionista rural da localidade.'
      };
    }
  };

  if (!process.env.GEMINI_API_KEY) {
    console.info('No GEMINI_API_KEY, using knowledge base diagnosis.');
    return res.json({
      success: true,
      data: {
        ...generateFallbackDiagnosis(),
        crop,
        zone,
        generatedWith: 'knowledge-base',
        timestamp: new Date().toISOString()
      }
    });
  }

  try {
    const prompt = `Analise os seguintes sintomas agrícolas observados por um produtor em Inhambane, Moçambique:
- Cultura: ${crop}
- Parte da Planta Afetada: ${plantPart}
- Zona / Distrito: ${zone}, Inhambane, Moçambique
- Descrição dos Sintomas: ${symptoms || 'Folhas comidas com pontos castanhos e descoloração'}

Identifique a praga ou doença mais provável, determine a confiança do diagnóstico, e forneça um plano de ação imediato prático e agroecológico adaptado aos recursos de pequenos agricultores rurais de Inhambane (bio-caldas caseiras, extrato de neem, cinzas, sabão azul, rotação).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'É um Doutor Fitossanitário e Engenheiro Agrónomo especialista em patologia vegetal e entomologia agrícola tropical em Moçambique (com foco na Província de Inhambane). Forneça diagnósticos rigorosos, soluções caseiras seguras de baixo custo e instruções claras para o agricultor.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pestName: { type: Type.STRING, description: 'Nome comum e científico da praga ou doença' },
            confidence: { type: Type.STRING, description: 'Alta, Média ou Estimada' },
            analysis: { type: Type.STRING, description: 'Explicação detalhada do porquê dos sintomas e fatores ambientais' },
            immediateAction: { type: Type.STRING, description: 'O que o agricultor deve fazer hoje na machamba' },
            bioRemedy: {
              type: Type.OBJECT,
              properties: {
                recipe: { type: Type.STRING, description: 'Ingredientes e medidas da receita orgânica caseira' },
                instructions: { type: Type.STRING, description: 'Como preparar e aplicar na planta' }
              },
              required: ['recipe', 'instructions']
            },
            preventiveMeasures: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Medidas culturais preventivas para evitar reincidência'
            },
            urgentWarning: { type: Type.STRING, description: 'Aviso sobre riscos de perda total ou contaminação' },
            extensionistAdvice: { type: Type.STRING, description: 'Orientação sobre quando acionar o técnico do SDAE' }
          },
          required: ['pestName', 'confidence', 'analysis', 'immediateAction', 'bioRemedy', 'preventiveMeasures', 'extensionistAdvice']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error('Resposta vazia da API do Gemini.');

    const parsedData = JSON.parse(text);
    return res.json({
      success: true,
      data: {
        ...parsedData,
        crop,
        zone,
        generatedWith: 'gemini-3.8-flash',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Gemini API Error in /api/gemini/pest-diagnosis:', error);
    return res.json({
      success: true,
      data: {
        ...generateFallbackDiagnosis(),
        crop,
        zone,
        generatedWith: 'knowledge-base-fallback',
        errorDetails: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Fallback diagnostics by crop for photo analysis - Tailored to Inhambane's agroecological zones
const PHOTO_DIAGNOSTICS_FALLBACK: Record<string, any> = {
  milho: {
    cropIdentified: '🌽 Milho (Zea mays / Matuba)',
    problemTitle: '🐛 Ataque de Lagarta-do-Cartucho no Milho',
    severity: 'Média',
    isBlurryOrUncertain: false,
    simpleExplanation: '👀 Lagartas pequenas estão a roer o olho do milho e deixam serradura amarelada. Nos solos arenosos de Homoíne e Panda, a planta desidrata rápido se não for tratada.',
    whatToDoToday: [
      '🌅 Vistoria matinal: Vá à machamba antes das 08h enquanto o milho tem orvalho.',
      '🪵 Cinza com areia: Deite uma pitadinha de cinza peneirada com areia fina no centro do cartucho.',
      '🪓 Remoção manual: Se forem poucas plantas, retire as lagartas visíveis com os dedos.',
      '🤝 Alerta aos vizinhos: Avise os produtores ao lado para travarem o avanço da praga.'
    ],
    homeRemedy: {
      name: '🪵 Pó Protetor de Cinza Vegetal e Areia de Rio',
      recipe: '🥣 2 copos de cinza de lenha fria e peneirada + 1 copo de areia de rio limpa.',
      application: '🌿 Deite uma pitada no olho do milho atacado. A cinza sufoca a lagarta sem gastar meticais com venenos.'
    },
    preventNextTime: [
      '🌱 Consórcio inteligente: Plante feijão nhemba entre as linhas de milho para afastar borboletas.',
      '🌧️ Sementeira no tempo: Semeie logo com as primeiras chuvas regulares de Outubro/Novembro.',
      '🌾 Mulching: Cubra a terra com capim seco para segurar a humidade da terra arenosa.'
    ],
    localTip: '🌽 Mavele ya vupfa hi ku hlayisa — O milho só dá maçarocas cheias quando cuidamos do solo e das folhas com paciência.',
    sdaeRecommendation: '🏛️ Se o ataque atingir mais de 2 em cada 10 plantas de milho ou se alastrar rápido, contacte imediatamente o Extensionista da sua localidade ou dirija-se ao posto do SDAE (Serviços Distritais de Atividades Económicas).'
  },
  mandioca: {
    cropIdentified: '🌿 Mandioca (Manihot esculenta / Chinamuna)',
    problemTitle: '🟡 Mosaico Africano e Stress Hídrico',
    severity: 'Média',
    isBlurryOrUncertain: false,
    simpleExplanation: '🦟 Folhas enrugadas com manchas amarelas causadas por vírus da mosca-branca e intensificadas pelo calor forte nos solos do litoral e interior.',
    whatToDoToday: [
      '🌾 Mulching urgente: Espalhe 5 a 10 cm de palha ou capim seco na base dos camalhões para refrescar a raiz.',
      '🔥 Arranque sanitário: Se a planta estiver muito fraca e torcida, arranque e queime fora da machamba.',
      '🧄 Calda de sabão: Pulverize o verso das folhas vizinhas com sabão azul e alho para afastar as mosquinhas.',
      '🚫 Não corte ramas: Nunca tire estacas de plantas com folhas deformadas para a próxima sementeira.'
    ],
    homeRemedy: {
      name: '🧄 Calda Repelente de Alho e Sabão Azul',
      recipe: '🥣 3 cabeças de alho esmagadas + 1 colher de raspas de sabão azul em 5 litros de água morna.',
      application: '🌿 Coe num pano e pulverize no verso das folhas de manhã bem cedo, 2 vezes por semana.'
    },
    preventNextTime: [
      '🌱 Variedades IIAM: Peça manivas tolerantes (ex: Chinamuna) no viveiro distrital do SDAE ou CITT.',
      '⛰️ Camalhões altos: Levante camalhões de 30 cm para proteger os tubérculos do sol forte.',
      '💧 Covas de retenção: Abra pequenas covas entre as linhas para captar água das chuvas fracas.'
    ],
    localTip: '🌿 Chinamuna a nga chavi dyambu — A boa mandioca não teme o sol quando tem boa cobertura morta na terra.',
    sdaeRecommendation: '🏛️ Em caso de manchas castanhas severas no caule ou podridão das raízes, alerte o técnico extensionista do SDAE para despiste do vírus do estriado castanho (CBSD).'
  },
  amendoim: {
    cropIdentified: '🥜 Amendoim (Arachis hypogaea / Bebiano)',
    problemTitle: '🍂 Mancha Castanha nas Folhas (Cercosporiose)',
    severity: 'Baixa',
    isBlurryOrUncertain: false,
    simpleExplanation: '🍂 Pequenos pontos castanhos causados por humidade noturna acumulada nas folhas durante as noites quentes de Inhambane.',
    whatToDoToday: [
      '💧 Rega na terra: Nunca molhe a folhagem ao entardecer; a água deve ir direto ao pé da raiz.',
      '⛏️ Amanho suave: Afofe a terra ao redor da planta para os pregos entrarem na terra solta sem partir.',
      '🍂 Limpeza de folhas secas: Retire folhas caídas no chão para não alimentarem os fungos.',
      '☀️ Ventilação: Elimine ervas daninhas altas que tapam a circulação do vento entre as linhas.'
    ],
    homeRemedy: {
      name: '🪵 Água de Cinza com Fortificante de Potássio',
      recipe: '🥣 1 copo de cinza vegetal peneirada em 10 litros de água; repousar 12 horas.',
      application: '🌱 Regue ao redor do caule. O potássio fortalece a casca das vagens subterrâneas contra fungos.'
    },
    preventNextTime: [
      '🔄 Rotação de culturas: Nunca plante amendoim na mesma terra duas épocas seguidas.',
      '🧺 Secagem suspensa: Seque as vagens colhidas em esteiras suspensas para evitar aflatoxinas no solo úmido.',
      '🌱 Sementes limpas: Guarde sementes inteiras, secas e livres de bolor.'
    ],
    localTip: '🥜 Muruwa wu lava misava yo olova — O amendoim precisa de terra leve e fofa para encher as vagens.',
    sdaeRecommendation: '🏛️ Se as folhas caírem prematuramente em mais de 30% da machamba antes do enchimento do grão, informe o extensionista local do SDAE.'
  },
  caju: {
    cropIdentified: '🌳 Cajueiro (Anacardium occidentale)',
    problemTitle: '⚪ Oídio do Cajueiro e Queima da Florada',
    severity: 'Média',
    isBlurryOrUncertain: false,
    simpleExplanation: '⚪ Pó branco-acinzentado nas folhas jovens e nas flores que impede a castanha de vingar, frequente na época fresca e nas brisas do litoral.',
    whatToDoToday: [
      '✂️ Poda de limpeza: Corte galhos secos e entrelaçados para o sol entrar no meio da copa.',
      '🧹 Caldeira limpa: Capine o mato num círculo de 2 metros ao redor do tronco do cajueiro.',
      '🔥 Eliminação de ramos atacados: Queime ou enterre ramos com flores secas longe das árvores sãs.',
      '💨 Inspeção com vento fresco: Vigie os rebentos novos a cada 4 dias.'
    ],
    homeRemedy: {
      name: '🥛 Calda de Leite Azedo com Cinza Filtrada',
      recipe: '🥣 1 litro de leite azedo ou soro + 9 litros de água + 20g de cinza vegetal bem fina.',
      application: '🌳 Pulverize a copa nos dias frescos e sem vento forte logo no início da emissão das flores.'
    },
    preventNextTime: [
      '📅 Calendário distrital: Inicie a poda de saneamento em Maio/Junho antes do início da floração.',
      '🧪 Pulverização com enxofre: Acompanhe a campanha oficial de pulverização do SDAE / INCAJU.',
      '🌳 Variedades enxertadas: Substitua árvores improdutivas por mudas enxertadas de alta produção.'
    ],
    localTip: '🌳 Mkanju wu hlayisiwe hi nkarhi — O cajueiro bem podado no tempo certo enche o cesto de castanha boa.',
    sdaeRecommendation: '🏛️ Para ter acesso ao atomizador motorizado ou ao programa oficial de tratamento com enxofre em pó, contacte o extensionista da sua zona ou o posto do SDAE.'
  },
  nhemba: {
    cropIdentified: '🌱 Feijão Nhemba (Vigna unguiculata / Tihoco)',
    problemTitle: '🐜 Pulgão Preto (Afídeo) e Tripes na Flor do Nhemba',
    severity: 'Média',
    isBlurryOrUncertain: false,
    simpleExplanation: '🐜 Colónias de afídeos pretos nos brotos e flores sugando a seiva. Muito comuns com o calor e tempo seco em Homoíne.',
    whatToDoToday: [
      '🥣 Calda de sabão e cinza: Pulverize nas partes atacadas logo pela manhã fresca.',
      '🌾 Preserve as joaninhas: Os besourinhos vermelhos são predadores naturais benéficos.',
      '✂️ Poda sanitária: Se houver ramas muito atacadas e secas, retire e queime fora da machamba.',
      '💧 Humidade na base: Coloque mulching na base para a planta ter vigor e se defender.'
    ],
    homeRemedy: {
      name: '🧼 Calda de Sabão Azul com Extrato de Folhas de Neem',
      recipe: '🥣 1 punhado de folhas de neem trituradas em 5L de água morna + 1 colher de sabão azul ralado.',
      application: '🌿 Coe no pano e aplique nas pontas atacadas a cada 3 dias até desaparecer o pulgão.'
    },
    preventNextTime: [
      '🌽 Consórcio com milho: Plante linhas alternadas de milho e nhemba para barreira contra insetos.',
      '🌱 Sementeira precoce: Semeie logo com o início firme das primeiras chuvas.',
      '🔄 Rotação da machamba: Alterne anualmente com mandioca ou batata-doce.'
    ],
    localTip: '🌱 Tihoco i vutomi e machambeni — O nhemba alimenta a família com matapa verde e grãos garantidos.',
    sdaeRecommendation: '🏛️ Em caso de praga generalizada em mais de metade da área cultivada, contacte o extensionista do SDAE Homoíne.'
  },
  batatadoce: {
    cropIdentified: '🍠 Batata-doce Alaranjada (Ipomoea batatas / Irene)',
    problemTitle: '🪲 Gorgulho da Batata-doce (Cilas) e Fendas no Solo',
    severity: 'Média',
    isBlurryOrUncertain: false,
    simpleExplanation: '🪲 Pequenos escaravelhos que entram pelas fendas do solo arenoso ressecado pelo sol de Homoíne e atacam os tubérculos.',
    whatToDoToday: [
      '⛏️ Amontoa alta imediata: Chegue terra solta aos camalhões tapando todas as fendas e gretas.',
      '🌾 Mulching de capim: Cubra os camalhões com 5 cm de palha para o sol não rachar a terra.',
      '🧺 Colheita no ponto: Não deixe as batatas na terra mais de 100 dias após a sementeira.',
      '🔥 Limpeza de restos: Retire batatas bichadas ou velhas da machamba para não criar ninho de praga.'
    ],
    homeRemedy: {
      name: '🪵 Barreira de Terra Fofa e Cinza Peneirada nos Camalhões',
      recipe: '🥣 Misture 1 bacia de cinza de lenha peneirada com terra fofa fresca.',
      application: '🍠 Chegue a terra ao colo das plantas para impedir a entrada dos gorgulhos até às raízes.'
    },
    preventNextTime: [
      '🌿 Ramas apicais sadias: Plante apenas estacas da ponta das ramas (30 cm) sem vestígios de furos.',
      '🔄 Rotação de talhão: Não repita batata-doce na mesma terra na época seguinte.',
      '💧 Plantio em vales/baixas: Aproveite as baixas úmidas de Homoíne para colheitas escalonadas.'
    ],
    localTip: '🍠 Muhlaha wo pswhuka wu tisa rihanyu — A batata alaranjada enriquece a saúde das crianças e tolera solos secos.',
    sdaeRecommendation: '🏛️ Solicite ramas limpas certificadas nos campos de multiplicação do CITT ou do SDAE Homoíne.'
  },
  mapira: {
    cropIdentified: '🌾 Mapira / Sorgo Grão (Sorghum bicolor / Macia)',
    problemTitle: '🐛 Broca do Colmo e Proteção da Panícula',
    severity: 'Baixa',
    isBlurryOrUncertain: false,
    simpleExplanation: '🐛 Serradura no colo da folha ou ataque de pássaros na fase de enchimento do grão da mapira.',
    whatToDoToday: [
      '🪵 Cinza no cartucho: Deite uma pitada de cinza de lenha no olho da planta jovem se vir broca.',
      '🔔 Espantalhos sonoros: Instale fitas plásticas e latas para afugentar revoadas de aves nos grãos.',
      '🌾 Inspeção no calor: A mapira enrola a folha ao meio-dia para guardar água; isso é sinal de força e não doença.'
    ],
    homeRemedy: {
      name: '🪵 Calda de Cinza com Pimenta Malagueta Repelente',
      recipe: '🥣 5 pimentas malaguetas esmagadas + 1 copo de cinza vegetal em 10L de água.',
      application: '🌿 Pulverize ao redor da haste para repelir gafanhotos e brocas migradoras.'
    },
    preventNextTime: [
      '🌱 Sementeira comunitária: Semeie em bloco com vizinhos para diminuir pressão de pássaros.',
      '🌾 Variedade Macia: Utilize a semente melhorada do IIAM que amadurece de forma uniforme.',
      '🍂 Rotação com leguminosas: Alterne com feijão nhemba ou feijão bóer.'
    ],
    localTip: '🌾 Mapira a yi chavi dyambu — A mapira é o escudo do camponês contra os anos de seca em Inhambane.',
    sdaeRecommendation: '🏛️ Informe o extensionista do SDAE sobre eventuais ataques de gafanhoto elegante ou bandos de quelea.'
  }
};

// POST /api/gemini/analyze-photo
app.post('/api/gemini/analyze-photo', async (req, res) => {
  const { imageBase64, mimeType = 'image/jpeg', cropHint = '', location = 'Inhambane, Moçambique', farmerNotes = '' } = req.body;

  // Resolve matching fallback based on crop hint or default to milho
  const hintKey = (cropHint || '').toLowerCase();
  let matchedFallbackKey = 'milho';
  if (hintKey.includes('mandioca') || hintKey.includes('cassava')) matchedFallbackKey = 'mandioca';
  else if (hintKey.includes('nhemba') || hintKey.includes('cowpea') || hintKey.includes('tihoco')) matchedFallbackKey = 'nhemba';
  else if (hintKey.includes('batata') || hintKey.includes('sweet potato') || hintKey.includes('muhlaha')) matchedFallbackKey = 'batatadoce';
  else if (hintKey.includes('mapira') || hintKey.includes('sorgo') || hintKey.includes('sorghum')) matchedFallbackKey = 'mapira';
  else if (hintKey.includes('amendoim') || hintKey.includes('peanut')) matchedFallbackKey = 'amendoim';
  else if (hintKey.includes('caju') || hintKey.includes('cashew')) matchedFallbackKey = 'caju';
  else if (hintKey.includes('milho') || hintKey.includes('maize')) matchedFallbackKey = 'milho';

  const fallbackData = PHOTO_DIAGNOSTICS_FALLBACK[matchedFallbackKey] || PHOTO_DIAGNOSTICS_FALLBACK['milho'];

  // Check if API key or image is present
  if (!process.env.GEMINI_API_KEY || !imageBase64) {
    console.info('No GEMINI_API_KEY or image provided, returning verified agronomic diagnosis fallback.');
    return res.json({
      success: true,
      data: {
        ...fallbackData,
        generatedWith: 'knowledge-base',
        timestamp: new Date().toISOString()
      }
    });
  }

  try {
    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    const promptText = `É um Engenheiro Agrónomo e Extensionista do SDAE (Serviços Distritais de Actividades Económicas) na Província de Inhambane, Moçambique.
Analise detalhadamente a foto desta planta cultivada por um pequeno produtor familiar.
Culturas prioritárias da região: Milho, Mandioca, Amendoim e Castanha de Caju.
${cropHint ? `Cultura indicada pelo agricultor: ${cropHint}.` : ''}
${farmerNotes ? `Nota do agricultor: "${farmerNotes}".` : ''}
Localidade: ${location}.

Responda em PORTUGUÊS SIMPLES DE MOÇAMBIQUE, com linguagem clara, acolhedora e direta (como fala um bom extensionista na machamba).
Identifique com precisão se a planta tem pragas (ex: lagarta-do-cartucho, broca, mosca-branca), doenças (ex: mosaico africano, oídio, cercosporiose), falta de água/seca ou se está saudável.
Forneça remédios caseiros práticos e de custo quase zero (cinza vegetal, areia, mulching, sabão azul, calda de alho/neem).

Formato JSON estrito:
{
  "cropIdentified": "Nome da cultura (ex: Milho, Mandioca, Amendoim, Caju, ou outra)",
  "problemTitle": "Título simples do que foi identificado",
  "severity": "Baixa" | "Média" | "Grave" | "Planta Sã",
  "simpleExplanation": "2 a 3 frases em português simples de Moçambique explicando o que aconteceu à planta",
  "whatToDoToday": ["Ação imediata 1", "Ação imediata 2", "Ação imediata 3"],
  "homeRemedy": {
    "name": "Nome do remédio caseiro fácil",
    "recipe": "Ingredientes e medidas caseiras",
    "application": "Como e quando aplicar na planta"
  },
  "preventNextTime": ["Cuidado preventivo 1", "Cuidado preventivo 2"],
  "localTip": "Provérbio ou conselho amigável em Xitswa ou Bitonga com a tradução em português"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: cleanBase64
              }
            },
            {
              text: promptText
            }
          ]
        }
      ],
      config: {
        systemInstruction: 'É um especialista agrónomo dedicado aos produtores familiares de Inhambane, Moçambique. Use linguagem simples, empática e encorajadora em português de Moçambique.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cropIdentified: { type: Type.STRING },
            problemTitle: { type: Type.STRING },
            severity: { type: Type.STRING },
            simpleExplanation: { type: Type.STRING },
            whatToDoToday: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            homeRemedy: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                recipe: { type: Type.STRING },
                application: { type: Type.STRING }
              },
              required: ['name', 'recipe', 'application']
            },
            preventNextTime: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            localTip: { type: Type.STRING }
          },
          required: ['cropIdentified', 'problemTitle', 'severity', 'simpleExplanation', 'whatToDoToday', 'homeRemedy', 'preventNextTime', 'localTip']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error('Resposta vazia da API do Gemini.');

    const parsedData = JSON.parse(text);
    return res.json({
      success: true,
      data: {
        ...parsedData,
        generatedWith: 'gemini-3.8-flash',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Gemini API Error in /api/gemini/analyze-photo:', error);
    return res.json({
      success: true,
      data: {
        ...fallbackData,
        generatedWith: 'knowledge-base-fallback',
        errorDetails: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// POST /api/gemini/ask-agronomist
app.post('/api/gemini/ask-agronomist', async (req, res) => {
  const { question = '', crop = 'Geral', zone = 'Homoíne, Inhambane' } = req.body;

  if (!question.trim()) {
    return res.status(400).json({ success: false, error: 'Pergunta não informada.' });
  }

  // Fallback agricultural responses
  const getFallbackAnswer = (q: string) => {
    const qL = q.toLowerCase();
    if (qL.includes('homoíne') || qL.includes('homoine') || qL.includes('o que plantar') || qL.includes('quais culturas') || qL.includes('sugerir')) {
      return {
        answer: 'Para o clima e solos franco-arenosos de Homoíne, as culturas mais resilientes e rentáveis recomendadas pelo SDAE e investigação agrária para sugerir à população são: 1) Feijão Nhemba (Tihoco) — ciclo veloz de 65-75 dias, fixa azoto e dá folhas para mucapata; 2) Batata-Doce de Polpa Alaranjada (BPA - Irene/Bela) — colheita farta em 90-100 dias com ramas que tapam o solo; 3) Mapira / Sorgo (Macia) — consome 40% menos água que o milho e não quebra com estiagem; 4) Feijão Bóer (Nandolo) — arbusto perene que perfura o solo arenoso compactado e produz alimento no inverno; 5) Gergelim (Sésamo) — excelente cultura comercial de alto rendimento por kg; 6) Feijão Jugo (Tindluwa) — leguminosa subterrânea ancestral super-resistente à aridez; além das tradicionais Mandioca (Chinamuna) e Milho precoce (Matuba).',
        practicalSteps: [
          'Diversifique a machamba: plante pelo menos 1 leguminosa (nhemba ou bóer) para cada talhão de cereal.',
          'Adote a batata-doce alaranjada nas baixas ou camalhões com mulching para nutrição infantil.',
          'Semeie Mapira (Sorgo) nas zonas mais quentes e com menor histórico de chuva regular.',
          'Plante gergelim em pequena escala para ter dinheiro em caixa nas cooperativas de venda.'
        ],
        localWisdom: 'Ku byala swakudya swo hambana i ku tiyisa khwiri ra ndyangu — Plantar culturas variadas e resistentes é o segredo para nunca faltar comida em casa.'
      };
    } else if (qL.includes('batata') || qL.includes('muhlaha')) {
      return {
        answer: 'A Batata-doce de Polpa Alaranjada (BPA - variedades Irene, Bela, Cecília) é uma das melhores culturas para Homoíne. Plante em camalhões altos de 30 cm com terra bem fofa, enterrando 3 nós da rama e deixando 2 fora. O ciclo é rápido (90 a 100 dias) e o teor altíssimo de Pró-Vitamina A protege as crianças da desnutrição e de problemas de visão.',
        practicalSteps: [
          'Faça amontoa alta aos 35 dias para cobrir as batatas contra o gorgulho cilas.',
          'Espalhe palha seca nos camalhões para refrescar a raiz sob o sol forte.',
          'Colha logo que as folhas começarem a amarelecer levemente (cerca de 3 meses).'
        ],
        localWisdom: 'Muhlaha wo pswhuka wu tisa rihanyu — A batata doce dourada é saúde e alimento doce na machamba.'
      };
    } else if (qL.includes('mapira') || qL.includes('sorgo')) {
      return {
        answer: 'A Mapira (Sorgo Grão) é o cereal de ouro para as épocas de pouca chuva em Homoíne e Panda. As suas raízes descem até 1,5 metro no solo arenoso à procura de humidade e as folhas fecham os poros durante o calor do meio-dia. Exige 40% menos água que o milho e garante farinha fina e saborosa mesmo nos anos em que o milho queima.',
        practicalSteps: [
          'Semeie no compasso de 75 x 20 cm, deixando 2 a 3 sementes por covacho.',
          'Consorcie com feijão nhemba ou feijão bóer nas entrelinhas.',
          'Proteja a panícula na fase de grão leitoso contra pássaros com fitas sonoras.'
        ],
        localWisdom: 'Mapira a yi chavi dyambu — A mapira encara o sol forte de Inhambane sem baixar a cabeça.'
      };
    } else if (qL.includes('seca') || qL.includes('chuva') || qL.includes('água') || qL.includes('agua')) {
      return {
        answer: 'Para enfrentar a seca em Inhambane (especialmente em zonas de solo arenoso como Panda e Homoíne), a regra de ouro é nunca deixar o solo nu. Coloque uma camada grossa de 5 a 10 cm de palha seca ou capim cortado (mulching) ao redor das plantas. Isto reduz a perda de água pelo calor do sol em mais de 40%. Além disso, faça covas de plantio com matéria orgânica curtida no fundo para guardar o orvalho da noite.',
        practicalSteps: [
          'Cubra a terra com capim ou folhas secas hoje mesmo.',
          'Regue apenas de manhã cedo (entre as 5h30 e 7h00) ou ao entardecer.',
          'Crie pequenas bacias de terra ao pé da planta para a água não escorrer.',
          'Prefira variedades com raízes fundas como milho Matuba e mandioca Chinamuna.'
        ],
        localWisdom: 'Mati ya nkarhi ma tlula nsati wa xikaya — A água aproveitada na hora certa vale mais que qualquer riqueza.'
      };
    } else if (qL.includes('lagarta') || qL.includes('milho')) {
      return {
        answer: 'A lagarta-do-cartucho ataca o milho jovem logo após a germinação. Se o ataque for no início, não gaste dinheiro com venenos químicos caros que matam também os insetos amigos. Use cinza de madeira fria e peneirada misturada com areia fina de rio em partes iguais. Deite uma pitadinha no olho do milho de manhã cedo quando ainda tem orvalho. A cinza entra no cartucho e sufoca a lagarta.',
        practicalSteps: [
          'Inspeccione os cartuchos das plantas todos os dias de manhã.',
          'Aplique a mistura de cinza e areia nas plantas com furinhos.',
          'Plante feijão nhemba entre as linhas de milho para repelir as traças adultas.',
          'Se a infestação passar de 2 em cada 10 plantas, avise o técnico do SDAE.'
        ],
        localWisdom: 'Loko u vona mavele ma dlayiwa hi switsotswana, vuyela eka ndzilo u teka nkuma — Quando vires o milho a sofrer com pragas, vai à fogueira buscar a cinza que cura.'
      };
    } else if (qL.includes('mandioca') || qL.includes('rama') || qL.includes('estaca')) {
      return {
        answer: 'Para a mandioca produzir batatas grossas e sãs em solos de Inhambane, o segredo está na escolha das ramas (manivas). Use apenas o terço médio de plantas maduras que nunca mostraram folhas torcidas de mosaico. Corte estacas com 20 a 25 cm (com 4 a 6 gemas) com facão bem afiado para não esmagar a casca. Plante deitadas ou inclinadas a 45 graus em camalhões bem arejados.',
        practicalSteps: [
          'Guarde as ramas à sombra de árvores frondosas na vertical se for esperar a chuva.',
          'Evite queimar a terra da machamba; enterre as folhas secas para virarem adubo.',
          'Mantenha o compasso de 1 metro entre plantas e 1 metro entre camalhões.'
        ],
        localWisdom: 'Mihanja ya mandioca i pfumo ra le ndlwini — As estacas de mandioca são o escudo que protege a família da fome.'
      };
    } else {
      return {
        answer: `Nas condições de Inhambane (${zone}), o sucesso na machamba familiar vem do maneio agroecológico: proteger a terra com matéria vegetal, consorciar leguminosas (amendoim ou feijão nhemba) com cereais (milho) para repor nutrientes, e vigiar semanalmente as plantas para agir logo ao primeiro sinal de pragas.`,
        practicalSteps: [
          'Adube as covas com estrume de cabrito ou galinha bem seco e curtido.',
          'Faça rotação anual de talhões para quebrar ciclos de fungos e insetos.',
          'Partilhe com a associação de produtores local as sementes que melhor aguentaram a última estiagem.'
        ],
        localWisdom: 'Ku rima i ku tsaka loku u rima hi vutlhari — A machamba dá alegria quando é trabalhada com sabedoria e cooperação.'
      };
    }
  };

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      success: true,
      data: {
        ...getFallbackAnswer(question),
        question,
        crop,
        zone,
        generatedWith: 'knowledge-base',
        timestamp: new Date().toISOString()
      }
    });
  }

  try {
    const prompt = `É um Engenheiro Agrónomo extensionista de Inhambane, Moçambique.
Um produtor familiar da localidade de ${zone} (cultura: ${crop}) fez-lhe a seguinte pergunta em relação à sua machamba:
"${question}"

Responda em PORTUGUÊS SIMPLES DE MOÇAMBIQUE, com clareza, empatia, tom encorajador e instruções práticas que qualquer camponês possa aplicar hoje com os recursos da zona.
Retorne um JSON com:
- answer: Explicação simples e amigável (1 a 2 parágrafos)
- practicalSteps: 3 a 4 passos práticos e objetivos
- localWisdom: Um conselho tradicional ou provérbio agrícola em Xitswa ou Bitonga com a devida tradução para português.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'É um Doutor Agrónomo que trabalha lado a lado com os camponeses de Moçambique. Linguagem simples, acolhedora, sem termos difíceis.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            practicalSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            localWisdom: { type: Type.STRING }
          },
          required: ['answer', 'practicalSteps', 'localWisdom']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error('Resposta vazia da API.');

    const parsed = JSON.parse(text);
    return res.json({
      success: true,
      data: {
        ...parsed,
        question,
        crop,
        zone,
        generatedWith: 'gemini-3.8-flash',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Gemini API Error in /api/gemini/ask-agronomist:', error);
    return res.json({
      success: true,
      data: {
        ...getFallbackAnswer(question),
        question,
        crop,
        zone,
        generatedWith: 'knowledge-base-fallback',
        errorDetails: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// In-memory store for synced field surveys from Android PWA devices
const syncedFieldSurveysStore: Record<string, any> = {};

// POST /api/field-surveys/sync
app.post('/api/field-surveys/sync', (req, res) => {
  const { surveys = [] } = req.body || {};
  if (!Array.isArray(surveys)) {
    return res.status(400).json({ success: false, error: 'Lista de inquéritos inválida.' });
  }

  const syncedIds: string[] = [];
  const now = new Date().toISOString();

  for (const s of surveys) {
    if (s && s.id) {
      syncedFieldSurveysStore[s.id] = {
        ...s,
        syncStatus: 'sincronizado',
        syncedAt: now
      };
      syncedIds.push(s.id);
    }
  }

  return res.json({
    success: true,
    syncedCount: syncedIds.length,
    syncedIds,
    syncedAt: now
  });
});

// GET /api/field-surveys
app.get('/api/field-surveys', (_req, res) => {
  return res.json({
    success: true,
    count: Object.keys(syncedFieldSurveysStore).length,
    surveys: Object.values(syncedFieldSurveysStore)
  });
});

// Production static assets & SPA fallback
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // Development Vite middleware
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`AgroResiliente server active on http://0.0.0.0:${port}`);
});
