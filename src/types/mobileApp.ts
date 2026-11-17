export type UserProfileType = 'produtor' | 'extensionista' | 'inquiridor' | 'medicao';

export type InhambaneDistrict =
  | 'Homoíne'
  | 'Maxixe'
  | 'Panda'
  | 'Massinga'
  | 'Morrumbene'
  | 'Zavala'
  | 'Inharrime'
  | 'Jangamo'
  | 'Inhambane-Cidade'
  | 'Funhalouro'
  | 'Mabote'
  | 'Vilankulo'
  | 'Inhassoro'
  | 'Govuro';

export type SurveySyncStatus = 'pendente_offline' | 'sincronizado';

export interface FieldSurveyRecord {
  id: string;
  district: InhambaneDistrict;
  locality: string;
  communityOrAssociation: string;
  respondentName: string;
  respondentGender: 'Feminino' | 'Masculino' | 'Outro';
  phone: string;
  householdSize: number;
  gpsCoords?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  primaryCrops: string[];
  totalAreaHa: number;
  estimatedYieldKg: number;
  seedSource: 'Semente Própria/Local' | 'SDAE / CITT' | 'Mercado / Feira' | 'Associação Agrária';
  soilType: 'Arenoso Claro' | 'Franco-Arenoso' | 'Baixa / Aluvial' | 'Duna Costeira';
  irrigationAccess: 'Sequeiro (Chuva)' | 'Regadio Manual' | 'Bomba / Gota-a-Gota' | 'Baixa Húmidas';
  conservationPractices: string[];
  mainChallenges: string[];
  harvestDestination: 'Autoconsumo Familiar' | 'Consumo + Venda Local' | 'Comercialização Associativa';
  notes: string;
  interviewerName: string;
  createdAt: string;
  syncedAt?: string;
  syncStatus: SurveySyncStatus;
  devicePlatform: 'iPhone / iPad (iOS)' | 'Android PWA' | 'Web Mobile' | 'Desktop';
}

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

export interface MachambaGpsPoint {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
}

export interface MachambaPlanarPoint {
  x: number; // meters
  y: number; // meters
}

export type MachambaMeasurementMethod =
  | 'gps_perimetro'
  | 'desenho_terreno'
  | 'fita_metrica'
  | 'passos';

export interface MachambaMeasurement {
  id: string;
  name: string;
  district: InhambaneDistrict;
  crop: string;
  method: MachambaMeasurementMethod;
  areaM2: number;
  areaHa: number;
  perimeterM: number;
  verticesCount: number;
  gpsPoints?: MachambaGpsPoint[];
  planarPoints?: MachambaPlanarPoint[];
  dimensionsSummary?: string;
  createdAt: string;
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
