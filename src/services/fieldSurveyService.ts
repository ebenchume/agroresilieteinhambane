import { FieldSurveyRecord, InhambaneDistrict } from '../types/mobileApp';

const STORAGE_SURVEYS_KEY = 'agro_field_surveys_v1';
const SURVEY_UPDATED_EVENT = 'agro:surveys-updated';

export interface DistrictCatalogEntry {
  district: InhambaneDistrict;
  zoneType: 'Interior / Agroecológica' | 'Litoral / Costeira' | 'Semiárida Norte';
  localities: string[];
  defaultCoords: { lat: number; lng: number };
}

export const INHAMBANE_DISTRICTS_CATALOG: DistrictCatalogEntry[] = [
  {
    district: 'Homoíne',
    zoneType: 'Interior / Agroecológica',
    localities: [
      'Homoíne-Sede',
      'Pembe',
      'Chizapela',
      'Vuca',
      'Fanha',
      'Mubalo',
      'Golo',
      'Nhanombe',
      'Maculuve',
      'Bairro 3 / Cumbana'
    ],
    defaultCoords: { lat: -23.9482, lng: 35.2514 }
  },
  {
    district: 'Maxixe',
    zoneType: 'Litoral / Costeira',
    localities: ['Chambone', 'Bembe', 'Rumbana', 'Macupula', 'Mabil', 'Dambo'],
    defaultCoords: { lat: -23.8597, lng: 35.3472 }
  },
  {
    district: 'Panda',
    zoneType: 'Interior / Agroecológica',
    localities: ['Panda-Sede', 'Massalane', 'Mawayela', 'Urrene', 'Chivalo'],
    defaultCoords: { lat: -24.0621, lng: 34.7291 }
  },
  {
    district: 'Massinga',
    zoneType: 'Litoral / Costeira',
    localities: ['Massinga-Sede', 'Chicomo', 'Rovene', 'Lionzuane', 'Pomene'],
    defaultCoords: { lat: -23.3308, lng: 35.3742 }
  },
  {
    district: 'Morrumbene',
    zoneType: 'Litoral / Costeira',
    localities: ['Morrumbene-Sede', 'Mocodoene', 'Cambine', 'Sitila', 'Furvela'],
    defaultCoords: { lat: -23.6694, lng: 35.3678 }
  },
  {
    district: 'Zavala',
    zoneType: 'Litoral / Costeira',
    localities: ['Quissico-Sede', 'Zandamela', 'Muane', 'Helene', 'Mindu'],
    defaultCoords: { lat: -24.7167, lng: 34.7500 }
  },
  {
    district: 'Inharrime',
    zoneType: 'Litoral / Costeira',
    localities: ['Inharrime-Sede', 'Mocumbi', 'Chacane', 'Nhamacoa', 'Dongane'],
    defaultCoords: { lat: -24.4767, lng: 35.0264 }
  },
  {
    district: 'Jangamo',
    zoneType: 'Litoral / Costeira',
    localities: ['Jangamo-Sede', 'Cumbana', 'Massavana', 'Ligogo', 'Guinjata'],
    defaultCoords: { lat: -24.1000, lng: 35.3167 }
  },
  {
    district: 'Inhambane-Cidade',
    zoneType: 'Litoral / Costeira',
    localities: ['Muelé', 'Balane', 'Marrambone', 'Salela', 'Guiúa', 'Tofo'],
    defaultCoords: { lat: -23.8650, lng: 35.3833 }
  },
  {
    district: 'Funhalouro',
    zoneType: 'Semiárida Norte',
    localities: ['Funhalouro-Sede', 'Tome', 'Mavume', 'Manhiça'],
    defaultCoords: { lat: -23.0833, lng: 34.3833 }
  },
  {
    district: 'Mabote',
    zoneType: 'Semiárida Norte',
    localities: ['Mabote-Sede', 'Zimane', 'Zinave', 'Tsenane', 'Macovane'],
    defaultCoords: { lat: -22.0500, lng: 34.1167 }
  },
  {
    district: 'Vilankulo',
    zoneType: 'Litoral / Costeira',
    localities: ['Vilankulo-Sede', 'Mapinhane', 'Belane', 'Macunhe', 'Chibuene'],
    defaultCoords: { lat: -22.0000, lng: 35.3167 }
  },
  {
    district: 'Inhassoro',
    zoneType: 'Litoral / Costeira',
    localities: ['Inhassoro-Sede', 'Cometela', 'Maimelane', 'Mangungumete'],
    defaultCoords: { lat: -21.5333, lng: 35.2000 }
  },
  {
    district: 'Govuro',
    zoneType: 'Semiárida Norte',
    localities: ['Nova Mambone', 'Save', 'Luido', 'Pande', 'Colane'],
    defaultCoords: { lat: -20.9833, lng: 35.0167 }
  }
];

export const SURVEY_CROPS_LIST = [
  'Milho',
  'Mandioca',
  'Feijão Nhemba',
  'Batata-Doce Alaranjada',
  'Mapira (Sorgo)',
  'Amendoim',
  'Feijão Bóer (Nandolo)',
  'Gergelim',
  'Feijão Jugo (Tindluwa)',
  'Caju',
  'Hortícolas',
  'Banana',
  'Coco'
] as const;

export const CONSERVATION_PRACTICES_LIST = [
  'Mulching (Cobertura Morta)',
  'Consórcio Cereal + Leguminosa',
  'Covas de Retenção (Zai)',
  'Cinza Vegetal contra Pragas',
  'Compostagem / Estrume Curtido',
  'Sementeira em Linha (Compasso)',
  'Quebra-Ventos com Feijão Bóer'
] as const;

export const FIELD_CHALLENGES_LIST = [
  'Seca / Veranicos Prolongados',
  'Lagarta-do-Cartucho',
  'Mosaico da Mandioca',
  'Oídio do Cajueiro',
  'Falta de Semente Certificada',
  'Escoamento / Transporte',
  'Ventos Fortes / Ciclones'
] as const;

const SEED_SURVEYS: FieldSurveyRecord[] = [
  {
    id: 'inq_hm_01',
    district: 'Homoíne',
    locality: 'Pembe',
    communityOrAssociation: 'Associação 7 de Abril de Pembe',
    respondentName: 'Celeste Mondlane',
    respondentGender: 'Feminino',
    phone: '845621904',
    householdSize: 6,
    gpsCoords: { lat: -23.9124, lng: 35.1842, accuracy: 8 },
    primaryCrops: ['Mandioca', 'Feijão Nhemba', 'Batata-Doce Alaranjada', 'Amendoim'],
    totalAreaHa: 1.8,
    estimatedYieldKg: 2450,
    seedSource: 'SDAE / CITT',
    soilType: 'Franco-Arenoso',
    irrigationAccess: 'Baixa Húmidas',
    conservationPractices: ['Mulching (Cobertura Morta)', 'Consórcio Cereal + Leguminosa', 'Cinza Vegetal contra Pragas'],
    mainChallenges: ['Seca / Veranicos Prolongados'],
    harvestDestination: 'Consumo + Venda Local',
    notes: 'Parcelas de batata-doce Irene em camalhões na baixa com bom desenvolvimento vegetativo.',
    interviewerName: 'Ernesto Benchume (Inquiridor SDAE)',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    syncedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    syncStatus: 'sincronizado',
    devicePlatform: 'Android PWA'
  },
  {
    id: 'inq_hm_02',
    district: 'Homoíne',
    locality: 'Chizapela',
    communityOrAssociation: 'Comunidade Agrária de Chizapela',
    respondentName: 'Mateus Sitoe',
    respondentGender: 'Masculino',
    phone: '873412098',
    householdSize: 5,
    gpsCoords: { lat: -23.9741, lng: 35.2193, accuracy: 11 },
    primaryCrops: ['Mapira (Sorgo)', 'Feijão Bóer (Nandolo)', 'Gergelim', 'Caju'],
    totalAreaHa: 2.5,
    estimatedYieldKg: 1900,
    seedSource: 'Associação Agrária',
    soilType: 'Arenoso Claro',
    irrigationAccess: 'Sequeiro (Chuva)',
    conservationPractices: ['Quebra-Ventos com Feijão Bóer', 'Covas de Retenção (Zai)', 'Sementeira em Linha (Compasso)'],
    mainChallenges: ['Falta de Semente Certificada', 'Seca / Veranicos Prolongados'],
    harvestDestination: 'Comercialização Associativa',
    notes: 'Produtor adotou Mapira Macia e Gergelim nas áreas mais secas onde o milho tradicional falhou na época anterior.',
    interviewerName: 'Técnico Extensionista CITT',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    syncedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    syncStatus: 'sincronizado',
    devicePlatform: 'Android PWA'
  },
  {
    id: 'inq_hm_03',
    district: 'Homoíne',
    locality: 'Vuca',
    communityOrAssociation: 'Machamba Familiar Independente',
    respondentName: 'Amélia Cossa',
    respondentGender: 'Feminino',
    phone: '849012345',
    householdSize: 7,
    gpsCoords: { lat: -23.9912, lng: 35.2911, accuracy: 14 },
    primaryCrops: ['Milho', 'Feijão Jugo (Tindluwa)', 'Mandioca'],
    totalAreaHa: 1.2,
    estimatedYieldKg: 1400,
    seedSource: 'Semente Própria/Local',
    soilType: 'Arenoso Claro',
    irrigationAccess: 'Sequeiro (Chuva)',
    conservationPractices: ['Consórcio Cereal + Leguminosa', 'Cinza Vegetal contra Pragas'],
    mainChallenges: ['Lagarta-do-Cartucho', 'Seca / Veranicos Prolongados'],
    harvestDestination: 'Autoconsumo Familiar',
    notes: 'Recolha offline em zona sem cobertura de rede; pendente sincronização de campo.',
    interviewerName: 'Ponto Focal Comunitário Vuca',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    syncStatus: 'pendente_offline',
    devicePlatform: 'Android PWA'
  },
  {
    id: 'inq_pd_04',
    district: 'Panda',
    locality: 'Massalane',
    communityOrAssociation: 'Cooperativa Esperança de Panda',
    respondentName: 'Domingos Nhabanga',
    respondentGender: 'Masculino',
    phone: '864412301',
    householdSize: 8,
    gpsCoords: { lat: -24.0621, lng: 34.7291, accuracy: 9 },
    primaryCrops: ['Mapira (Sorgo)', 'Amendoim', 'Mandioca', 'Feijão Bóer (Nandolo)'],
    totalAreaHa: 3.0,
    estimatedYieldKg: 3100,
    seedSource: 'SDAE / CITT',
    soilType: 'Arenoso Claro',
    irrigationAccess: 'Sequeiro (Chuva)',
    conservationPractices: ['Mulching (Cobertura Morta)', 'Covas de Retenção (Zai)'],
    mainChallenges: ['Seca / Veranicos Prolongados', 'Lagarta-do-Cartucho'],
    harvestDestination: 'Consumo + Venda Local',
    notes: 'Boa aceitação da Mapira e do Feijão Bóer na zona semiárida interior de Panda.',
    interviewerName: 'Técnico SDAE Panda',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    syncedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    syncStatus: 'sincronizado',
    devicePlatform: 'Android PWA'
  },
  {
    id: 'inq_ms_05',
    district: 'Massinga',
    locality: 'Chicomo',
    communityOrAssociation: 'Núcleo de Jovens Produtores de Massinga',
    respondentName: 'Lúcia Matusse',
    respondentGender: 'Feminino',
    phone: '852239812',
    householdSize: 4,
    gpsCoords: { lat: -23.3419, lng: 35.3511, accuracy: 10 },
    primaryCrops: ['Mandioca', 'Caju', 'Batata-Doce Alaranjada', 'Feijão Nhemba'],
    totalAreaHa: 2.2,
    estimatedYieldKg: 4200,
    seedSource: 'SDAE / CITT',
    soilType: 'Duna Costeira',
    irrigationAccess: 'Regadio Manual',
    conservationPractices: ['Compostagem / Estrume Curtido', 'Mulching (Cobertura Morta)'],
    mainChallenges: ['Mosaico da Mandioca', 'Oídio do Cajueiro'],
    harvestDestination: 'Comercialização Associativa',
    notes: 'Aplicado arranque sanitário em plantas com mosaico e substituído por ramas de Chinamuna.',
    interviewerName: 'Brigada Móvel Massinga',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    syncedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    syncStatus: 'sincronizado',
    devicePlatform: 'Android PWA'
  }
];

function notifySurveyUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SURVEY_UPDATED_EVENT));
  }
}

export function detectDevicePlatform(): FieldSurveyRecord['devicePlatform'] {
  if (typeof window === 'undefined') return 'Desktop';
  const ua = window.navigator.userAgent.toLowerCase();
  const isIPad =
    /ipad/.test(ua) ||
    (window.navigator.platform === 'MacIntel' && (window.navigator.maxTouchPoints || 0) > 1);
  if (/iphone|ipod/.test(ua) || isIPad) return 'iPhone / iPad (iOS)';
  if (/android/.test(ua)) return 'Android PWA';
  if (/mobile/.test(ua)) return 'Web Mobile';
  return 'Desktop';
}

export const FieldSurveyService = {
  SURVEY_UPDATED_EVENT,

  getSurveys(): FieldSurveyRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_SURVEYS_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {}

    try {
      localStorage.setItem(STORAGE_SURVEYS_KEY, JSON.stringify(SEED_SURVEYS));
    } catch (e) {}
    return SEED_SURVEYS;
  },

  getPendingCount(): number {
    return this.getSurveys().filter(s => s.syncStatus === 'pendente_offline').length;
  },

  async saveSurvey(
    payload: Omit<FieldSurveyRecord, 'id' | 'createdAt' | 'syncStatus' | 'syncedAt' | 'devicePlatform'>,
    isOnline: boolean
  ): Promise<FieldSurveyRecord> {
    const surveys = this.getSurveys();
    const newRecord: FieldSurveyRecord = {
      ...payload,
      id: 'inq_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 5),
      createdAt: new Date().toISOString(),
      syncStatus: 'pendente_offline',
      devicePlatform: detectDevicePlatform()
    };

    // Attempt immediate background sync if online
    if (isOnline) {
      try {
        const res = await fetch('/api/field-surveys/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ surveys: [newRecord] })
        });
        if (res.ok) {
          newRecord.syncStatus = 'sincronizado';
          newRecord.syncedAt = new Date().toISOString();
        }
      } catch (err) {
        // Stay gracefully in offline queue
      }
    }

    const updated = [newRecord, ...surveys];
    try {
      localStorage.setItem(STORAGE_SURVEYS_KEY, JSON.stringify(updated));
      notifySurveyUpdate();
    } catch (e) {}

    return newRecord;
  },

  async syncPendingSurveys(): Promise<{ syncedCount: number; failed: boolean }> {
    const surveys = this.getSurveys();
    const pending = surveys.filter(s => s.syncStatus === 'pendente_offline');
    if (pending.length === 0) return { syncedCount: 0, failed: false };

    try {
      const res = await fetch('/api/field-surveys/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveys: pending })
      });

      if (!res.ok) {
        return { syncedCount: 0, failed: true };
      }

      const now = new Date().toISOString();
      const pendingIds = new Set(pending.map(p => p.id));
      const updated = surveys.map(s =>
        pendingIds.has(s.id) ? { ...s, syncStatus: 'sincronizado' as const, syncedAt: now } : s
      );

      localStorage.setItem(STORAGE_SURVEYS_KEY, JSON.stringify(updated));
      notifySurveyUpdate();
      return { syncedCount: pending.length, failed: false };
    } catch (e) {
      return { syncedCount: 0, failed: true };
    }
  },

  deleteSurvey(id: string) {
    const updated = this.getSurveys().filter(s => s.id !== id);
    try {
      localStorage.setItem(STORAGE_SURVEYS_KEY, JSON.stringify(updated));
      notifySurveyUpdate();
    } catch (e) {}
  },

  exportCSV(records?: FieldSurveyRecord[]) {
    const list = records || this.getSurveys();
    if (list.length === 0) return;

    const headers = [
      'ID',
      'Data_Recolha',
      'Estado_Sincronizacao',
      'Distrito',
      'Localidade',
      'Associacao_Comunidade',
      'Inquirido',
      'Genero',
      'Telefone',
      'Agregado_Familiar',
      'Culturas',
      'Area_Ha',
      'Producao_Estimada_Kg',
      'Origem_Semente',
      'Tipo_Solo',
      'Acesso_Agua',
      'Praticas_Conservacao',
      'Principais_Desafios',
      'Destino_Colheita',
      'GPS_Lat',
      'GPS_Lng',
      'Dispositivo',
      'Inquiridor',
      'Observacoes'
    ];

    const escapeCsv = (val: string | number | undefined) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = list.map(r =>
      [
        r.id,
        new Date(r.createdAt).toLocaleString('pt-MZ'),
        r.syncStatus === 'sincronizado' ? 'Sincronizado' : 'Pendente Offline',
        r.district,
        r.locality,
        r.communityOrAssociation,
        r.respondentName,
        r.respondentGender,
        r.phone,
        r.householdSize,
        r.primaryCrops.join('; '),
        r.totalAreaHa,
        r.estimatedYieldKg,
        r.seedSource,
        r.soilType,
        r.irrigationAccess,
        r.conservationPractices.join('; '),
        r.mainChallenges.join('; '),
        r.harvestDestination,
        r.gpsCoords?.lat ?? '',
        r.gpsCoords?.lng ?? '',
        r.devicePlatform,
        r.interviewerName,
        r.notes
      ]
        .map(escapeCsv)
        .join(',')
    );

    const bom = '\uFEFF';
    const csvContent = bom + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inqueritos_campo_inhambane_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  exportJSON(records?: FieldSurveyRecord[]) {
    const list = records || this.getSurveys();
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inqueritos_campo_inhambane_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
