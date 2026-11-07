import { PhotoDiagnosisResult, AgronomistAnswer, MachambaVisit, DistrictPestAlert } from '../types/mobileApp';

const STORAGE_VISITS_KEY = 'agro_machamba_visits';
const STORAGE_PROFILE_KEY = 'agro_user_profile';
const STORAGE_SUNLIGHT_KEY = 'agro_sunlight_mode';

export const MobileService = {
  // Profile persistence
  getUserProfile(): 'produtor' | 'extensionista' {
    try {
      const saved = localStorage.getItem(STORAGE_PROFILE_KEY);
      if (saved === 'extensionista' || saved === 'produtor') return saved;
    } catch (e) {}
    return 'produtor'; // Default to producer for smallholder farmers
  },

  setUserProfile(profile: 'produtor' | 'extensionista') {
    try {
      localStorage.setItem(STORAGE_PROFILE_KEY, profile);
    } catch (e) {}
  },

  // Sunlight high contrast mode
  getSunlightMode(): boolean {
    try {
      return localStorage.getItem(STORAGE_SUNLIGHT_KEY) === 'true';
    } catch (e) {}
    return false;
  },

  setSunlightMode(active: boolean) {
    try {
      localStorage.setItem(STORAGE_SUNLIGHT_KEY, active ? 'true' : 'false');
    } catch (e) {}
  },

  // Analyze plant photo via Gemini API
  async analyzePlantPhoto(
    imageBase64: string,
    cropHint: string = '',
    location: string = 'Inhambane, Moçambique',
    farmerNotes: string = ''
  ): Promise<PhotoDiagnosisResult> {
    const res = await fetch('/api/gemini/analyze-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64,
        cropHint,
        location,
        farmerNotes
      })
    });

    if (!res.ok) {
      throw new Error(`Erro no servidor (${res.status}) ao analisar fotografia.`);
    }

    const data = await res.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Não foi possível analisar a planta.');
    }

    return data.data;
  },

  // Ask Agronomist via Gemini API
  async askAgronomist(
    question: string,
    crop: string = 'Geral',
    zone: string = 'Homoíne, Inhambane'
  ): Promise<AgronomistAnswer> {
    const res = await fetch('/api/gemini/ask-agronomist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        crop,
        zone
      })
    });

    if (!res.ok) {
      throw new Error(`Erro no servidor (${res.status}) ao contactar o agrónomo.`);
    }

    const data = await res.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Não foi possível obter resposta.');
    }

    return data.data;
  },

  // Extensionist Machamba Visits (Offline-first)
  getVisits(): MachambaVisit[] {
    try {
      const stored = localStorage.getItem(STORAGE_VISITS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    // Seed mock visits if none exist
    const initialVisits: MachambaVisit[] = [
      {
        id: 'vis_1',
        farmerName: 'Tomás Mondlane',
        phone: '841234567',
        district: 'Homoíne',
        locality: 'Homoíne-Sede (Bairro 3)',
        crop: 'Milho',
        areaHa: 1.5,
        healthStatus: 'Alerta Leve',
        observedPests: ['Lagarta-do-Cartucho'],
        recommendations: 'Aplicada calda de cinza com areia no olho do milho. Recomendado consórcio com feijão nhemba.',
        gpsCoords: { lat: -23.9482, lng: 35.2514, accuracy: 12 },
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        extensionistName: 'Técnico SDAE Homoíne',
        synced: true
      },
      {
        id: 'vis_2',
        farmerName: 'Marta Chissano',
        phone: '876543210',
        district: 'Panda',
        locality: 'Massalane',
        crop: 'Mandioca',
        areaHa: 2.0,
        healthStatus: 'Bom',
        observedPests: [],
        recommendations: 'Camalhões bem protegidos com mulching de palha seca. Variedade Chinamuna com ótimo enraizamento.',
        gpsCoords: { lat: -24.0621, lng: 34.7291, accuracy: 15 },
        date: new Date(Date.now() - 86400000 * 4).toISOString(),
        extensionistName: 'Técnico SDAE Panda',
        synced: true
      }
    ];

    try {
      localStorage.setItem(STORAGE_VISITS_KEY, JSON.stringify(initialVisits));
    } catch (e) {}
    return initialVisits;
  },

  saveVisit(visit: Omit<MachambaVisit, 'id' | 'date' | 'synced'>): MachambaVisit {
    const visits = this.getVisits();
    const newVisit: MachambaVisit = {
      ...visit,
      id: 'vis_' + Date.now().toString(36),
      date: new Date().toISOString(),
      synced: true
    };
    visits.unshift(newVisit);
    try {
      localStorage.setItem(STORAGE_VISITS_KEY, JSON.stringify(visits));
    } catch (e) {}
    return newVisit;
  },

  deleteVisit(id: string) {
    const visits = this.getVisits().filter(v => v.id !== id);
    try {
      localStorage.setItem(STORAGE_VISITS_KEY, JSON.stringify(visits));
    } catch (e) {}
  },

  // District Pest Surveillance Alerts
  getDistrictPestAlerts(): DistrictPestAlert[] {
    return [
      {
        id: 'alert_1',
        district: 'Panda',
        crop: 'Milho',
        pestName: 'Lagarta-do-Cartucho (Spodoptera frugiperda)',
        severity: 'Crítico',
        affectedFarmsPercent: 36,
        lastUpdated: 'Hoje, 07:30',
        recommendation: 'Campanha de aplicação massiva de cinza com areia ou inseticida biológico nos talhões de 2 a 5 folhas.'
      },
      {
        id: 'alert_2',
        district: 'Massinga',
        crop: 'Mandioca',
        pestName: 'Vírus do Mosaico Africano (CMD)',
        severity: 'Alerta',
        affectedFarmsPercent: 24,
        lastUpdated: 'Ontem, 16:00',
        recommendation: 'Arranque sanitário imediato das cepas sintomáticas e queima para conter mosca-branca transmissora.'
      },
      {
        id: 'alert_3',
        district: 'Zavala',
        crop: 'Caju',
        pestName: 'Oídio do Cajueiro (Pseudoidium anacardii)',
        severity: 'Alerta',
        affectedFarmsPercent: 31,
        lastUpdated: 'Hoje, 09:15',
        recommendation: 'Poda urgente de limpeza da copa e abertura de caldeiras limpas ao redor do tronco para permitir ventilação.'
      },
      {
        id: 'alert_4',
        district: 'Homoíne',
        crop: 'Amendoim',
        pestName: 'Mancha Castanha (Cercosporiose)',
        severity: 'Moderado',
        affectedFarmsPercent: 14,
        lastUpdated: 'Ontem, 11:20',
        recommendation: 'Suspender rega foliar noturna e afofar suavemente a terra dos ginóforos nas horas mais frescas.'
      },
      {
        id: 'alert_5',
        district: 'Maxixe',
        crop: 'Milho / Mandioca',
        pestName: 'Seca e Estresse Hídrico Severo',
        severity: 'Crítico',
        affectedFarmsPercent: 42,
        lastUpdated: 'Hoje, 06:45',
        recommendation: 'Aplicação imediata de cobertura morta (5 a 10 cm) e criação de microbacias de retenção de orvalho.'
      }
    ];
  },

  // Audio Speech Synthesis for hands-free or low-literacy farmers
  speakText(text: string, onEnd?: () => void): () => void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return () => {};
    }

    window.speechSynthesis.cancel();

    // Clean text of markdown or bracket symbols for natural voice
    const cleanText = text
      .replace(/[*_#`[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-PT'; // Portuguese audio
    utterance.rate = 0.95; // Slightly slower, very articulate for field clarity
    utterance.pitch = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }
};
