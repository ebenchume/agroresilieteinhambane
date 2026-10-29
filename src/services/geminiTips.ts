/**
 * AgroResiliente Inhambane - Client Gemini Agricultural Tips Service
 * Communicates with the backend server endpoint /api/gemini/agricultural-tips
 */

import { CropType, DistrictZone, UserType } from '../types/auth';

export interface AgriculturalTipItem {
  category: string;
  title: string;
  description: string;
  urgency: 'Alta' | 'Média' | 'Preventiva' | string;
}

export interface GeminiAgriculturalTips {
  weekTitle: string;
  mainFocus: string;
  seasonStage: string;
  climateImpactNote: string;
  tips: AgriculturalTipItem[];
  localLanguageTip: string;
  recommendedAction: string;
  crop: CropType;
  zone: DistrictZone;
  generatedWith: string;
  timestamp: string;
}

const STORAGE_TIPS_PREFIX = 'agro_gemini_tips_v1';

export const GeminiTipsService = {
  async getWeeklyTips(
    crop: CropType,
    zone: DistrictZone,
    farmerType: UserType = 'Familiar',
    forceRefresh: boolean = false
  ): Promise<GeminiAgriculturalTips> {
    const cacheKey = `${STORAGE_TIPS_PREFIX}_${crop}_${zone}`;

    // Check cache first if not force refresh
    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          // Valid if generated within last 24 hours
          const cacheAge = Date.now() - new Date(parsed.timestamp).getTime();
          if (cacheAge < 24 * 60 * 60 * 1000) {
            return parsed;
          }
        }
      } catch {}
    }

    try {
      const res = await fetch('/api/gemini/agricultural-tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crop,
          zone,
          farmerType,
        }),
      });

      if (!res.ok) {
        throw new Error(`Servidor respondeu com código ${res.status}`);
      }

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error('Formato de resposta inválido do servidor.');
      }

      const data: GeminiAgriculturalTips = json.data;

      // Cache locally
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch {}

      return data;
    } catch (err: any) {
      console.warn('Failed to fetch from /api/gemini/agricultural-tips, using local cache:', err);
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached);
      } catch {}

      // Fallback object
      return {
        weekTitle: `Guia de Maneio Semanal para ${crop}`,
        mainFocus: `Proteção das machambas de ${crop} em ${zone} e retenção de humidade`,
        seasonStage: 'Fase Vegetativa / Floração',
        climateImpactNote: 'O clima seco e os solos de Inhambane requerem cobertura morta (mulching) e regas eficientes nas horas frescas.',
        tips: [
          {
            category: 'Maneio do Solo',
            title: 'Mulching e Cobertura Protetora',
            description: 'Deposite palha ou matéria seca ao redor das raízes para evitar o sobreaquecimento da camada superficial do solo.',
            urgency: 'Alta'
          },
          {
            category: 'Rega e Água',
            title: 'Regas de Manhã Cedo',
            description: 'Regue preferencialmente entre as 06:00 e as 08:00 para minimizar perdas por evapotranspiração solar.',
            urgency: 'Média'
          },
          {
            category: 'Proteção Fitossanitária',
            title: 'Inspeção Sanitária Semanal',
            description: 'Vistorie o verso das folhas para detetar pragas precocemente antes que atinjam o limiar de dano económico.',
            urgency: 'Preventiva'
          }
        ],
        localLanguageTip: 'Kutirhela masimu hi ku tiyisela — O trabalho dedicado na machamba garante colheita farta para a família.',
        recommendedAction: 'Aplicar cinza ou composto biológico na base das plantas.',
        crop,
        zone,
        generatedWith: 'knowledge-base-offline',
        timestamp: new Date().toISOString()
      };
    }
  }
};
