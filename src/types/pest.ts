/**
 * AgroResiliente Inhambane - Pest & Disease Diagnostic Types
 */

import { CropType } from './auth';

export type PlantPart = 'Folha' | 'Caule' | 'Raiz / Tubérculo' | 'Flor / Vagem / Espiga' | 'Toda a Planta';

export type SeverityLevel = 'Crítico' | 'Alto' | 'Moderado' | 'Preventivo';

export interface BioRemedy {
  name: string;
  ingredients: string[];
  preparation: string;
  application: string;
  costEstimate: string; // e.g., 'Quase grátis (insumos caseiros)'
}

export interface PestRecord {
  id: string;
  name: string;
  scientificName: string;
  crop: CropType;
  plantPart: PlantPart;
  severity: SeverityLevel;
  symptoms: string[];
  visualSigns: string;
  riskFactor: string; // e.g. 'Favorecido por calor e chuvas intermitentes'
  bioRemedy: BioRemedy;
  culturalControl: string[];
  chemicalGuidance?: string;
  urgentAction: string;
}

export interface DiagnosisQuery {
  crop: CropType;
  plantPart?: PlantPart;
  symptomsText: string;
  zone: string;
}

export interface DiagnosisResult {
  pestName: string;
  confidence: 'Alta' | 'Média' | 'Estimada';
  analysis: string;
  immediateAction: string;
  bioRemedy: {
    recipe: string;
    instructions: string;
  };
  preventiveMeasures: string[];
  urgentWarning?: string;
  extensionistAdvice: string;
}

export interface SavedDiagnosis {
  id: string;
  date: string;
  crop: CropType;
  symptoms: string;
  pestIdentified: string;
  severity: SeverityLevel;
  notes?: string;
}
