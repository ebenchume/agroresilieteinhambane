export type UserProfileType = 'produtor' | 'extensionista';

export interface PhotoDiagnosisResult {
  cropIdentified: string;
  problemTitle: string;
  severity: 'Baixa' | 'Média' | 'Grave' | 'Planta Sã';
  simpleExplanation: string;
  whatToDoToday: string[];
  homeRemedy: {
    name: string;
    recipe: string;
    application: string;
  };
  preventNextTime: string[];
  localTip: string;
  sdaeRecommendation?: string;
  isBlurryOrUncertain?: boolean;
  generatedWith?: string;
  timestamp?: string;
}

export interface AgronomistAnswer {
  answer: string;
  practicalSteps: string[];
  localWisdom: string;
  sdaeRecommendation?: string;
  question?: string;
  crop?: string;
  zone?: string;
  generatedWith?: string;
  timestamp?: string;
}

export interface MachambaVisit {
  id: string;
  farmerName: string;
  phone: string;
  district: string;
  locality: string;
  crop: 'Milho' | 'Mandioca' | 'Amendoim' | 'Caju' | 'Feijão Nhemba' | 'Hortícolas';
  areaHa: number;
  healthStatus: 'Excelente' | 'Bom' | 'Alerta Leve' | 'Infestação Grave';
  observedPests: string[];
  recommendations: string;
  gpsCoords?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  hasPhoto?: boolean;
  date: string;
  extensionistName: string;
  synced: boolean;
}

export interface DistrictPestAlert {
  id: string;
  district: string;
  crop: string;
  pestName: string;
  severity: 'Crítico' | 'Alerta' | 'Moderado' | 'Controlado';
  affectedFarmsPercent: number;
  lastUpdated: string;
  recommendation: string;
}
