import { jsPDF } from 'jspdf';
import {
  MachambaGpsPoint,
  MachambaMeasurement,
  MachambaPlanarPoint
} from '../types/mobileApp';

const STORAGE_MEASUREMENTS_KEY = 'agro_machamba_measurements_v1';
const EARTH_RADIUS_M = 6378137; // WGS84 Equatorial Radius in meters

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

export interface CropRequirementEstimate {
  cropName: string;
  seedAmount: number;
  seedUnit: 'kg' | 'estacas' | 'mudas';
  manureTons: number;
  estimatedYieldMinKg: number;
  estimatedYieldMaxKg: number;
  spacingLabel: string;
}

const CROP_ESTIMATE_PARAMS: Record<
  string,
  {
    name: string;
    seedPerHa: number;
    unit: 'kg' | 'estacas' | 'mudas';
    manurePerHa: number;
    yieldMinPerHa: number;
    yieldMaxPerHa: number;
    spacingLabel: string;
  }
> = {
  Milho: {
    name: 'Milho (Matuba / PAN 53)',
    seedPerHa: 25,
    unit: 'kg',
    manurePerHa: 5,
    yieldMinPerHa: 1200,
    yieldMaxPerHa: 2500,
    spacingLabel: '80 cm × 25 cm'
  },
  Mandioca: {
    name: 'Mandioca (Chinamuna)',
    seedPerHa: 10000,
    unit: 'estacas',
    manurePerHa: 4,
    yieldMinPerHa: 8000,
    yieldMaxPerHa: 15000,
    spacingLabel: '100 cm × 100 cm'
  },
  Amendoim: {
    name: 'Amendoim (Bebiano Branco)',
    seedPerHa: 70,
    unit: 'kg',
    manurePerHa: 3,
    yieldMinPerHa: 700,
    yieldMaxPerHa: 1400,
    spacingLabel: '50 cm × 15 cm'
  },
  'Feijão Nhemba': {
    name: 'Feijão Nhemba (IT-18)',
    seedPerHa: 25,
    unit: 'kg',
    manurePerHa: 2.5,
    yieldMinPerHa: 500,
    yieldMaxPerHa: 1000,
    spacingLabel: '50 cm × 20 cm'
  },
  'Batata-Doce': {
    name: 'Batata-Doce BPA (Irene)',
    seedPerHa: 33000,
    unit: 'estacas',
    manurePerHa: 5,
    yieldMinPerHa: 10000,
    yieldMaxPerHa: 18000,
    spacingLabel: '100 cm × 30 cm'
  },
  Mapira: {
    name: 'Mapira / Sorgo (Macia)',
    seedPerHa: 10,
    unit: 'kg',
    manurePerHa: 3,
    yieldMinPerHa: 1400,
    yieldMaxPerHa: 2800,
    spacingLabel: '75 cm × 20 cm'
  },
  Caju: {
    name: 'Cajueiro (Mudas Enxertadas)',
    seedPerHa: 80,
    unit: 'mudas',
    manurePerHa: 2,
    yieldMinPerHa: 800,
    yieldMaxPerHa: 1600,
    spacingLabel: '11 m × 11 m'
  }
};

export const MachambaAreaService = {
  MEASUREMENT_UPDATED_EVENT: 'agro_machamba_measurements_updated',

  /**
   * Haversine great-circle distance in meters between two GPS coordinates
   */
  haversineDistanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
    const dLat = toRadians(b.lat - a.lat);
    const dLng = toRadians(b.lng - a.lng);
    const lat1 = toRadians(a.lat);
    const lat2 = toRadians(b.lat);

    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);
    const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
    return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  },

  /**
   * Geodesic polygon area on WGS84 sphere (in square meters)
   * Matches standard GIS spherical excess calculation (Chamberlain & Duquette)
   */
  calculateGpsPolygonAreaM2(points: MachambaGpsPoint[]): number {
    if (points.length < 3) return 0;
    let total = 0;
    const len = points.length;

    for (let i = 0; i < len; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % len];
      total +=
        toRadians(p2.lng - p1.lng) *
        (2 + Math.sin(toRadians(p1.lat)) + Math.sin(toRadians(p2.lat)));
    }

    return Math.abs((total * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2);
  },

  /**
   * Total perimeter in meters for GPS vertices
   */
  calculateGpsPerimeterMeters(points: MachambaGpsPoint[], closed: boolean = true): number {
    if (points.length < 2) return 0;
    let perimeter = 0;
    for (let i = 0; i < points.length - 1; i++) {
      perimeter += this.haversineDistanceMeters(points[i], points[i + 1]);
    }
    if (closed && points.length >= 3) {
      perimeter += this.haversineDistanceMeters(points[points.length - 1], points[0]);
    }
    return perimeter;
  },

  /**
   * Project GPS lat/lng vertices onto normalized local planar metric coordinates (meters from origin)
   */
  projectGpsToLocalMeters(points: MachambaGpsPoint[]): MachambaPlanarPoint[] {
    if (points.length === 0) return [];
    const refLat = points[0].lat;
    const refLng = points[0].lng;
    const cosLat = Math.cos(toRadians(refLat));

    return points.map(p => ({
      x: toRadians(p.lng - refLng) * EARTH_RADIUS_M * cosLat,
      y: toRadians(p.lat - refLat) * EARTH_RADIUS_M
    }));
  },

  /**
   * Planar Shoelace formula for 2D polygon vertices in meters
   */
  calculatePlanarAreaM2(points: MachambaPlanarPoint[]): number {
    if (points.length < 3) return 0;
    let sum = 0;
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      sum += p1.x * p2.y - p2.x * p1.y;
    }
    return Math.abs(sum) / 2;
  },

  /**
   * Planar polygon perimeter in meters
   */
  calculatePlanarPerimeterMeters(points: MachambaPlanarPoint[], closed: boolean = true): number {
    if (points.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
      total += Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    }
    if (closed && points.length >= 3) {
      total += Math.hypot(
        points[0].x - points[points.length - 1].x,
        points[0].y - points[points.length - 1].y
      );
    }
    return total;
  },

  /**
   * Heron's formula for any triangle with side lengths a, b, c (in meters)
   */
  calculateTriangleHeron(
    a: number,
    b: number,
    c: number
  ): { valid: boolean; areaM2: number; perimeterM: number; error?: string } {
    if (a <= 0 || b <= 0 || c <= 0) {
      return { valid: false, areaM2: 0, perimeterM: 0, error: 'Todos os lados devem ser maiores que zero.' };
    }
    if (a + b <= c || a + c <= b || b + c <= a) {
      return {
        valid: false,
        areaM2: 0,
        perimeterM: 0,
        error: 'Medidas inválidas: a soma de dois lados tem de ser maior que o terceiro lado.'
      };
    }
    const s = (a + b + c) / 2;
    const areaM2 = Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)));
    return { valid: true, areaM2, perimeterM: a + b + c };
  },

  /**
   * Classic 4-side irregular plot triangulation: 4 outer edges (a, b, c, d) + 1 diagonal
   */
  calculateQuadWithDiagonal(
    northA: number,
    eastB: number,
    southC: number,
    westD: number,
    diagonalAC: number
  ): { valid: boolean; areaM2: number; perimeterM: number; error?: string } {
    const tri1 = this.calculateTriangleHeron(northA, eastB, diagonalAC);
    if (!tri1.valid) {
      return {
        valid: false,
        areaM2: 0,
        perimeterM: 0,
        error: 'Triângulo 1 (Lado Norte + Este + Diagonal) não fecha geometricamente. Verifique a diagonal.'
      };
    }
    const tri2 = this.calculateTriangleHeron(southC, westD, diagonalAC);
    if (!tri2.valid) {
      return {
        valid: false,
        areaM2: 0,
        perimeterM: 0,
        error: 'Triângulo 2 (Lado Sul + Oeste + Diagonal) não fecha geometricamente. Verifique a diagonal.'
      };
    }
    return {
      valid: true,
      areaM2: tri1.areaM2 + tri2.areaM2,
      perimeterM: northA + eastB + southC + westD
    };
  },

  /**
   * Unit conversions for Mozambique smallholder plots
   */
  m2ToHectares(m2: number): number {
    return m2 / 10000;
  },

  m2ToCanteiros(m2: number): number {
    // Standard 10m x 1m horticultural bed = 10 m²
    return m2 / 10;
  },

  m2ToCamalhoes(m2: number): number {
    // Standard 25m x 1m cassava/sweet potato ridge = 25 m²
    return m2 / 25;
  },

  m2ToParcelas50x50(m2: number): number {
    // Standard 50m x 50m local rural block = 2500 m² (0.25 ha)
    return m2 / 2500;
  },

  /**
   * Agronomic estimates based on measured area
   */
  estimateCropRequirements(areaHa: number, cropKey: string): CropRequirementEstimate {
    const spec = CROP_ESTIMATE_PARAMS[cropKey] || CROP_ESTIMATE_PARAMS.Milho;
    return {
      cropName: spec.name,
      seedAmount: Math.round(spec.seedPerHa * areaHa * 10) / 10,
      seedUnit: spec.unit,
      manureTons: Math.round(spec.manurePerHa * areaHa * 10) / 10,
      estimatedYieldMinKg: Math.round(spec.yieldMinPerHa * areaHa),
      estimatedYieldMaxKg: Math.round(spec.yieldMaxPerHa * areaHa),
      spacingLabel: spec.spacingLabel
    };
  },

  /**
   * LocalStorage persistence
   */
  getMeasurements(): MachambaMeasurement[] {
    try {
      const raw = localStorage.getItem(STORAGE_MEASUREMENTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage error
    }
    return [];
  },

  saveMeasurement(
    input: Omit<MachambaMeasurement, 'id' | 'createdAt'>
  ): MachambaMeasurement {
    const newRecord: MachambaMeasurement = {
      ...input,
      id: `MED-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString()
    };
    const existing = this.getMeasurements();
    const updated = [newRecord, ...existing].slice(0, 100);
    try {
      localStorage.setItem(STORAGE_MEASUREMENTS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(this.MEASUREMENT_UPDATED_EVENT));
    } catch {
      // Ignore quota errors
    }
    return newRecord;
  },

  deleteMeasurement(id: string) {
    const updated = this.getMeasurements().filter(m => m.id !== id);
    try {
      localStorage.setItem(STORAGE_MEASUREMENTS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(this.MEASUREMENT_UPDATED_EVENT));
    } catch {
      // Ignore storage error
    }
  },

  /**
   * Export PDF field measurement sheet & croqui sketch
   */
  exportMeasurementPdf(measurement: MachambaMeasurement): string {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Header
    doc.setFillColor(6, 95, 70); // #065f46
    doc.rect(0, 0, 210, 24, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text('AGRORESILIENTE INHAMBANE', 14, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Ficha Oficial de Medição de Machamba no Terreno · Moçambique', 14, 18);

    // Title
    doc.setTextColor(28, 25, 23);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`CROQUI E ÁREA: ${measurement.name.toUpperCase()}`, 14, 36);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const dateLabel = new Date(measurement.createdAt).toLocaleString('pt-MZ');
    doc.text(`Registo: ${measurement.id} · Data: ${dateLabel} · Distrito: ${measurement.district}`, 14, 42);

    // Summary Box
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(16, 185, 129);
    doc.roundedRect(14, 48, 182, 34, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(6, 95, 70);
    doc.text('ÁREA TOTAL MEDIDA', 20, 56);
    doc.text('PERÍMETRO', 90, 56);
    doc.text('CULTURA PREVISTA', 140, 56);

    doc.setFontSize(16);
    doc.setTextColor(2, 44, 34);
    doc.text(`${measurement.areaHa.toFixed(4)} ha`, 20, 65);
    doc.text(`${Math.round(measurement.perimeterM)} m`, 90, 65);
    doc.setFontSize(12);
    doc.text(measurement.crop, 140, 65);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(
      `Equivalente a ${Math.round(measurement.areaM2).toLocaleString('pt-MZ')} m² · ${Math.round(
        this.m2ToCanteiros(measurement.areaM2)
      )} canteiros (10×1m) · ${Math.round(this.m2ToCamalhoes(measurement.areaM2))} camalhões (25×1m)`,
      20,
      75
    );

    // Technical notes
    let y = 92;
    const methodNames: Record<MachambaMeasurement['method'], string> = {
      gps_perimetro: 'Caminhada de Perímetro com GPS ao Vivo (WGS84)',
      desenho_terreno: 'Desenho Topográfico em Grelha Métrica',
      fita_metrica: 'Medição com Fita Métrica no Terreno',
      passos: 'Medição por Contagem de Passos Calibrados'
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(28, 25, 23);
    doc.text(`Método utilizado: ${methodNames[measurement.method]}`, 14, y);
    y += 6;
    if (measurement.dimensionsSummary) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Dimensões: ${measurement.dimensionsSummary}`, 14, y);
      y += 6;
    }

    // Draw scaled polygon croqui if vertices are available
    const planar =
      measurement.planarPoints && measurement.planarPoints.length >= 3
        ? measurement.planarPoints
        : measurement.gpsPoints && measurement.gpsPoints.length >= 3
          ? this.projectGpsToLocalMeters(measurement.gpsPoints)
          : null;

    if (planar && planar.length >= 3) {
      y += 4;
      doc.setDrawColor(214, 211, 209);
      doc.setFillColor(250, 250, 249);
      doc.roundedRect(14, y, 182, 85, 3, 3, 'FD');

      const xs = planar.map(p => p.x);
      const ys = planar.map(p => p.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const spanX = Math.max(1, maxX - minX);
      const spanY = Math.max(1, maxY - minY);

      const boxW = 156;
      const boxH = 68;
      const scale = Math.min(boxW / spanX, boxH / spanY);
      const offsetX = 14 + (182 - spanX * scale) / 2;
      const offsetY = y + (85 - spanY * scale) / 2;

      const mapped = planar.map(p => ({
        px: offsetX + (p.x - minX) * scale,
        py: offsetY + (maxY - p.y) * scale
      }));

      doc.setDrawColor(6, 95, 70);
      doc.setLineWidth(0.7);
      for (let i = 0; i < mapped.length; i++) {
        const a = mapped[i];
        const b = mapped[(i + 1) % mapped.length];
        doc.line(a.px, a.py, b.px, b.py);
        doc.setFillColor(6, 95, 70);
        doc.circle(a.px, a.py, 1.3, 'F');
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(6, 95, 70);
      doc.text('Croqui Esquemático da Parcela (Proporção Real)', 18, y + 6);
      y += 93;
    }

    // Seed recommendation section
    const estimate = this.estimateCropRequirements(measurement.areaHa, measurement.crop);
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(6, 95, 70);
    doc.text('ESTIMATIVA AGRONÓMICA PARA ESTA ÁREA', 14, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`• Cultura: ${estimate.cropName} (Compasso: ${estimate.spacingLabel})`, 16, y);
    y += 6;
    doc.text(`• Sementes / Estacas necessárias: ${estimate.seedAmount} ${estimate.seedUnit}`, 16, y);
    y += 6;
    doc.text(`• Adubo orgânico (estrume/composto): ${estimate.manureTons} toneladas`, 16, y);
    y += 6;
    doc.text(
      `• Colheita esperada estimada: ${estimate.estimatedYieldMinKg.toLocaleString('pt-MZ')} a ${estimate.estimatedYieldMaxKg.toLocaleString(
        'pt-MZ'
      )} kg`,
      16,
      y
    );

    const filename = `Machamba_${measurement.name.replace(/[^a-zA-Z0-9]/g, '_')}_${measurement.areaHa.toFixed(
      2
    )}ha.pdf`;
    doc.save(filename);
    return filename;
  }
};
