import { InhambaneDistrict } from '../types/mobileApp';
import {
  FieldSurveyService,
  INHAMBANE_DISTRICTS_CATALOG
} from './fieldSurveyService';
import { MachambaAreaService } from './machambaAreaService';
import { MobileService } from './mobileService';

export interface DistrictGeoGeometry {
  district: InhambaneDistrict;
  svgPath: string;
  labelX: number;
  labelY: number;
}

/**
 * Schematic geographic polygons for all 14 districts of Inhambane Province
 * ViewBox: 0 0 360 440 (North at top: Govuro/Save River -> South at bottom: Zavala/Inharrime; Indian Ocean on the right)
 */
export const INHAMBANE_MAP_GEOMETRIES: Record<InhambaneDistrict, DistrictGeoGeometry> = {
  Govuro: {
    district: 'Govuro',
    svgPath: 'M145,18 L242,16 L248,66 L158,72 Z',
    labelX: 196,
    labelY: 46
  },
  Inhassoro: {
    district: 'Inhassoro',
    svgPath: 'M158,72 L248,66 L266,126 L166,122 Z',
    labelX: 210,
    labelY: 98
  },
  Mabote: {
    district: 'Mabote',
    svgPath: 'M32,56 L158,72 L166,122 L145,176 L38,162 Z',
    labelX: 98,
    labelY: 120
  },
  Vilankulo: {
    district: 'Vilankulo',
    svgPath: 'M166,122 L266,126 L280,184 L168,180 Z',
    labelX: 222,
    labelY: 156
  },
  Funhalouro: {
    district: 'Funhalouro',
    svgPath: 'M38,162 L145,176 L168,180 L176,252 L54,250 Z',
    labelX: 108,
    labelY: 212
  },
  Massinga: {
    district: 'Massinga',
    svgPath: 'M168,180 L280,184 L288,242 L176,252 Z',
    labelX: 230,
    labelY: 216
  },
  Morrumbene: {
    district: 'Morrumbene',
    svgPath: 'M176,252 L288,242 L276,292 L182,292 Z',
    labelX: 232,
    labelY: 272
  },
  Panda: {
    district: 'Panda',
    svgPath: 'M54,250 L176,252 L182,292 L164,344 L62,332 Z',
    labelX: 118,
    labelY: 298
  },
  Homoíne: {
    district: 'Homoíne',
    svgPath: 'M182,292 L244,292 L246,340 L164,344 Z',
    labelX: 205,
    labelY: 320
  },
  Maxixe: {
    district: 'Maxixe',
    svgPath: 'M244,292 L276,292 L272,332 L246,340 Z',
    labelX: 259,
    labelY: 316
  },
  'Inhambane-Cidade': {
    district: 'Inhambane-Cidade',
    svgPath: 'M280,296 L310,294 L314,332 L282,334 Z',
    labelX: 297,
    labelY: 316
  },
  Jangamo: {
    district: 'Jangamo',
    svgPath: 'M246,340 L282,334 L274,376 L214,366 Z',
    labelX: 248,
    labelY: 356
  },
  Inharrime: {
    district: 'Inharrime',
    svgPath: 'M130,342 L214,366 L248,396 L156,408 Z',
    labelX: 184,
    labelY: 382
  },
  Zavala: {
    district: 'Zavala',
    svgPath: 'M62,332 L164,344 L156,408 L224,422 L92,418 Z',
    labelX: 122,
    labelY: 388
  }
};

export interface DistrictGeoPoint {
  id: string;
  label: string;
  lat: number;
  lng: number;
  svgX: number;
  svgY: number;
  source: 'inquerito' | 'medicao' | 'visita';
  district: InhambaneDistrict;
  detail: string;
}

export interface DistrictProvincialSummary {
  district: InhambaneDistrict;
  zoneType: string;
  localities: string[];
  surveysCount: number;
  visitsCount: number;
  measurementsCount: number;
  totalAreaHa: number;
  estimatedYieldKg: number;
  resilienceRatePercent: number;
  cropAreasHa: Record<string, number>;
  pestHotspots: Array<{
    pestName: string;
    crop: string;
    severity: 'Crítico' | 'Alerta' | 'Moderado' | 'Controlado';
    affectedPercent: number;
    recommendation: string;
  }>;
  maxSeverity: 'Crítico' | 'Alerta' | 'Moderado' | 'Controlado';
  maxInfestationPercent: number;
  gpsPoints: DistrictGeoPoint[];
}

function projectLatLngToMapSvg(lat: number, lng: number): { x: number; y: number } {
  // Bounding box of Inhambane province
  const minLat = -24.95;
  const maxLat = -20.80;
  const minLng = 33.90;
  const maxLng = 35.60;

  const normX = Math.max(0.05, Math.min(0.95, (lng - minLng) / (maxLng - minLng)));
  const normY = Math.max(0.04, Math.min(0.96, 1 - (lat - minLat) / (maxLat - minLat)));

  return {
    x: Math.round(28 + normX * 290),
    y: Math.round(16 + normY * 405)
  };
}

const SEVERITY_RANK: Record<'Crítico' | 'Alerta' | 'Moderado' | 'Controlado', number> = {
  Crítico: 4,
  Alerta: 3,
  Moderado: 2,
  Controlado: 1
};

export const ProvincialMapService = {
  buildProvincialAggregation(): DistrictProvincialSummary[] {
    const surveys = FieldSurveyService.getSurveys();
    const measurements = MachambaAreaService.getMeasurements();
    const visits = MobileService.getVisits();
    const basePestAlerts = MobileService.getDistrictPestAlerts();

    return INHAMBANE_DISTRICTS_CATALOG.map(meta => {
      const district = meta.district;
      const distSurveys = surveys.filter(s => s.district === district);
      const distMeasurements = measurements.filter(m => m.district === district);
      const distVisits = visits.filter(v => v.district.toLowerCase().includes(district.toLowerCase()));

      const cropAreasHa: Record<string, number> = {};
      let totalAreaHa = 0;
      let totalYieldKg = 0;
      const gpsPoints: DistrictGeoPoint[] = [];

      // 1. Field Surveys area & crops
      for (const s of distSurveys) {
        const area = s.totalAreaHa || 0;
        totalAreaHa += area;
        totalYieldKg += s.estimatedYieldKg || 0;
        const perCropShare = s.primaryCrops.length > 0 ? area / s.primaryCrops.length : area;
        for (const crop of s.primaryCrops) {
          cropAreasHa[crop] = Number(((cropAreasHa[crop] || 0) + perCropShare).toFixed(2));
        }

        if (s.gpsCoords) {
          const pt = projectLatLngToMapSvg(s.gpsCoords.lat, s.gpsCoords.lng);
          gpsPoints.push({
            id: s.id,
            label: `${s.locality} (${s.respondentName})`,
            lat: s.gpsCoords.lat,
            lng: s.gpsCoords.lng,
            svgX: pt.x,
            svgY: pt.y,
            source: 'inquerito',
            district,
            detail: `${area.toFixed(2)} ha · ${s.primaryCrops.slice(0, 2).join(', ')}`
          });
        }
      }

      // 2. Direct Field Area Measurements
      for (const m of distMeasurements) {
        totalAreaHa += m.areaHa || 0;
        cropAreasHa[m.crop] = Number(((cropAreasHa[m.crop] || 0) + (m.areaHa || 0)).toFixed(2));
        const firstGps = m.gpsPoints?.[0];
        if (firstGps) {
          const pt = projectLatLngToMapSvg(firstGps.lat, firstGps.lng);
          gpsPoints.push({
            id: m.id,
            label: m.name,
            lat: firstGps.lat,
            lng: firstGps.lng,
            svgX: pt.x,
            svgY: pt.y,
            source: 'medicao',
            district,
            detail: `${m.areaHa.toFixed(3)} ha medidos · ${m.crop}`
          });
        }
      }

      // 3. Extensionist Visits
      for (const v of distVisits) {
        totalAreaHa += v.areaHa || 0;
        cropAreasHa[v.crop] = Number(((cropAreasHa[v.crop] || 0) + (v.areaHa || 0)).toFixed(2));
        if (v.gpsCoords) {
          const pt = projectLatLngToMapSvg(v.gpsCoords.lat, v.gpsCoords.lng);
          gpsPoints.push({
            id: v.id,
            label: `${v.locality} (${v.farmerName})`,
            lat: v.gpsCoords.lat,
            lng: v.gpsCoords.lng,
            svgX: pt.x,
            svgY: pt.y,
            source: 'visita',
            district,
            detail: `${v.crop} · ${v.healthStatus}`
          });
        }
      }

      // 4. Pest Hotspots combining surveillance alerts + survey challenges + visits
      const hotspots: DistrictProvincialSummary['pestHotspots'] = [];
      const matchedBaseAlerts = basePestAlerts.filter(
        a =>
          a.district.toLowerCase().includes(district.toLowerCase()) ||
          (district === 'Inhambane-Cidade' && a.district.toLowerCase().includes('inhambane'))
      );

      for (const a of matchedBaseAlerts) {
        hotspots.push({
          pestName: a.pestName,
          crop: a.crop,
          severity: a.severity,
          affectedPercent: a.affectedFarmsPercent,
          recommendation: a.recommendation
        });
      }

      // Inspect survey challenges for district-specific pests
      const pestCountsFromSurveys: Record<string, number> = {};
      for (const s of distSurveys) {
        for (const ch of s.mainChallenges) {
          if (
            ch.includes('Lagarta') ||
            ch.includes('Mosaico') ||
            ch.includes('Oídio') ||
            ch.includes('Praga')
          ) {
            pestCountsFromSurveys[ch] = (pestCountsFromSurveys[ch] || 0) + 1;
          }
        }
      }

      for (const [ch, cnt] of Object.entries(pestCountsFromSurveys)) {
        if (!hotspots.some(h => h.pestName.toLowerCase().includes(ch.split(' ')[0].toLowerCase()))) {
          const pct = Math.min(85, Math.round((cnt / Math.max(1, distSurveys.length)) * 100));
          hotspots.push({
            pestName: ch,
            crop: ch.includes('Mosaico') ? 'Mandioca' : ch.includes('Oídio') ? 'Caju' : 'Milho',
            severity: pct >= 35 ? 'Crítico' : pct >= 20 ? 'Alerta' : 'Moderado',
            affectedPercent: pct,
            recommendation:
              'Vistoria semanal nas linhas com aplicação de calda de cinza/neem e arranque de pés doentes.'
          });
        }
      }

      // Check extensionist visits with Infestação Grave
      for (const v of distVisits) {
        if (v.healthStatus === 'Infestação Grave' || v.observedPests.length > 0) {
          for (const p of v.observedPests) {
            if (!hotspots.some(h => h.pestName.toLowerCase() === p.toLowerCase())) {
              hotspots.push({
                pestName: p,
                crop: v.crop,
                severity: v.healthStatus === 'Infestação Grave' ? 'Crítico' : 'Alerta',
                affectedPercent: v.healthStatus === 'Infestação Grave' ? 32 : 18,
                recommendation: v.recommendations || 'Controlo cultural e contacto com SDAE distrital.'
              });
            }
          }
        }
      }

      if (hotspots.length === 0) {
        hotspots.push({
          pestName: 'Vigilância Fitossanitária Normal',
          crop: Object.keys(cropAreasHa)[0] || 'Milho / Mandioca',
          severity: 'Controlado',
          affectedPercent: 4,
          recommendation: 'Manter rotação com leguminosas e limpeza das margens.'
        });
      }

      let maxSeverity: 'Crítico' | 'Alerta' | 'Moderado' | 'Controlado' = 'Controlado';
      let maxInfestationPercent = 0;
      for (const h of hotspots) {
        if (SEVERITY_RANK[h.severity] > SEVERITY_RANK[maxSeverity]) {
          maxSeverity = h.severity;
        }
        if (h.affectedPercent > maxInfestationPercent) {
          maxInfestationPercent = h.affectedPercent;
        }
      }

      const resilientAdopters = distSurveys.filter(s => s.conservationPractices.length >= 2).length;
      const resilienceRatePercent =
        distSurveys.length > 0 ? Math.round((resilientAdopters / distSurveys.length) * 100) : 0;

      return {
        district,
        zoneType: meta.zoneType,
        localities: meta.localities,
        surveysCount: distSurveys.length,
        visitsCount: distVisits.length,
        measurementsCount: distMeasurements.length,
        totalAreaHa: Number(totalAreaHa.toFixed(2)),
        estimatedYieldKg: Math.round(totalYieldKg),
        resilienceRatePercent,
        cropAreasHa,
        pestHotspots: hotspots,
        maxSeverity,
        maxInfestationPercent,
        gpsPoints
      };
    });
  },

  exportProvincialDistrictsCSV(summaries: DistrictProvincialSummary[]) {
    const headers = [
      'Distrito',
      'Zona_Agroecologica',
      'Localidades_Monitorizadas',
      'Inqueritos',
      'Visitas_Tecnicas',
      'Machambas_Medidas',
      'Area_Total_Ha',
      'Producao_Estimada_Kg',
      'Taxa_Adocao_Resiliente_Pct',
      'Nivel_Risco_Pragas',
      'Infestacao_Max_Pct',
      'Principais_Pragas',
      'Areas_Por_Cultura_Ha'
    ];

    const escapeCsv = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;

    const rows = summaries.map(d => {
      const cropsText = Object.entries(d.cropAreasHa)
        .map(([k, v]) => `${k}: ${v} ha`)
        .join(' | ');
      const pestsText = d.pestHotspots
        .map(p => `${p.pestName} (${p.crop} - ${p.affectedPercent}%)`)
        .join(' | ');

      return [
        d.district,
        d.zoneType,
        d.localities.join('; '),
        d.surveysCount,
        d.visitsCount,
        d.measurementsCount,
        d.totalAreaHa.toFixed(2),
        d.estimatedYieldKg,
        d.resilienceRatePercent,
        d.maxSeverity,
        d.maxInfestationPercent,
        pestsText,
        cropsText || 'Sem registos locais ainda'
      ]
        .map(escapeCsv)
        .join(',');
    });

    const bom = '\uFEFF';
    const csv = bom + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_provincial_pragas_areas_inhambane_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  exportCropBreakdownCSV(summaries: DistrictProvincialSummary[]) {
    const headers = ['Distrito', 'Cultura', 'Area_Cultivada_Ha', 'Zona_Agroecologica'];
    const escapeCsv = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;
    const rows: string[] = [];

    for (const d of summaries) {
      for (const [crop, area] of Object.entries(d.cropAreasHa)) {
        rows.push([d.district, crop, area.toFixed(2), d.zoneType].map(escapeCsv).join(','));
      }
    }

    const bom = '\uFEFF';
    const csv = bom + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `areas_por_cultura_inhambane_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
