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

app.use(express.json());

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
