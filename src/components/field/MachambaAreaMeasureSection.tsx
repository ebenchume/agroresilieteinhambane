import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Compass,
  Navigation,
  Ruler,
  Footprints,
  MapPin,
  Undo2,
  Trash2,
  Save,
  FileDown,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  Plus,
  Sprout,
  ArrowRight,
  Grid
} from 'lucide-react';
import {
  InhambaneDistrict,
  MachambaGpsPoint,
  MachambaMeasurement,
  MachambaMeasurementMethod,
  MachambaPlanarPoint
} from '../../types/mobileApp';
import { INHAMBANE_DISTRICTS_CATALOG } from '../../services/fieldSurveyService';
import { MachambaAreaService } from '../../services/machambaAreaService';

interface MachambaAreaMeasureSectionProps {
  sunlightMode?: boolean;
  onShowToast?: (msg: string, type?: 'success' | 'info') => void;
  onApplyAreaHa?: (areaHa: number, label?: string) => void;
  compactModal?: boolean;
}

type MeasureMode = 'gps' | 'grid' | 'tape';
type TapeShape = 'rectangle' | 'quad_diagonal' | 'triangle' | 'trapezoid';

const SVG_SIZE = 320;
const SVG_PAD = 24;

export const MachambaAreaMeasureSection: React.FC<MachambaAreaMeasureSectionProps> = ({
  sunlightMode = false,
  onShowToast,
  onApplyAreaHa,
  compactModal = false
}) => {
  const [mode, setMode] = useState<MeasureMode>('grid');

  // --- MODE 1: GPS PERIMETER WALK STATE ---
  const [gpsPoints, setGpsPoints] = useState<MachambaGpsPoint[]>([]);
  const [gpsTracking, setGpsTracking] = useState(false);
  const [autoCapture, setAutoCapture] = useState(true);
  const [currentGpsPos, setCurrentGpsPos] = useState<MachambaGpsPoint | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const watchIdRef = useRef<number | null>(null);

  // --- MODE 2: INTERACTIVE METRIC GRID DRAWING STATE ---
  const [gridScaleMeters, setGridScaleMeters] = useState<40 | 100 | 200 | 500>(100);
  const [planarPoints, setPlanarPoints] = useState<MachambaPlanarPoint[]>([
    { x: 15, y: 20 },
    { x: 75, y: 20 },
    { x: 80, y: 75 },
    { x: 20, y: 70 }
  ]);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // --- MODE 3: TAPE MEASURE / CALIBRATED PACES STATE ---
  const [tapeUnit, setTapeUnit] = useState<'meters' | 'paces'>('meters');
  const [strideMeters, setStrideMeters] = useState<number>(0.75);
  const [tapeShape, setTapeShape] = useState<TapeShape>('quad_diagonal');
  // Dimensions stored in currently selected unit (meters or paces)
  const [rectLen, setRectLen] = useState<number>(80);
  const [rectWidth, setRectWidth] = useState<number>(50);
  const [quadA, setQuadA] = useState<number>(60); // Norte
  const [quadB, setQuadB] = useState<number>(55); // Este
  const [quadC, setQuadC] = useState<number>(68); // Sul
  const [quadD, setQuadD] = useState<number>(48); // Oeste
  const [quadDiag, setQuadDiag] = useState<number>(78); // Diagonal A-C
  const [triA, setTriA] = useState<number>(60);
  const [triB, setTriB] = useState<number>(55);
  const [triC, setTriC] = useState<number>(70);
  const [trapTop, setTrapTop] = useState<number>(45);
  const [trapBottom, setTrapBottom] = useState<number>(75);
  const [trapHeight, setTrapHeight] = useState<number>(50);

  // --- SAVE & AGRONOMY FORM STATE ---
  const [plotName, setPlotName] = useState('Machamba Principal');
  const [district, setDistrict] = useState<InhambaneDistrict>('Homoíne');
  const [selectedCrop, setSelectedCrop] = useState<string>('Milho');
  const [savedList, setSavedList] = useState<MachambaMeasurement[]>(() =>
    MachambaAreaService.getMeasurements()
  );

  // Cleanup GPS watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const reload = () => setSavedList(MachambaAreaService.getMeasurements());
    window.addEventListener(MachambaAreaService.MEASUREMENT_UPDATED_EVENT, reload);
    return () => {
      window.removeEventListener(MachambaAreaService.MEASUREMENT_UPDATED_EVENT, reload);
    };
  }, []);

  // --- GPS WATCH HANDLERS ---
  const startGpsTracking = () => {
    if (!navigator.geolocation) {
      setGpsError(
        'Este navegador não suporta GPS físico. Use a aba "Desenhar Terreno" ou "Fita Métrica / Passos".'
      );
      return;
    }
    setGpsError(null);
    setGpsTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        const pt: MachambaGpsPoint = {
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy),
          timestamp: Date.now()
        };
        setCurrentGpsPos(pt);
        setGpsError(null);

        if (autoCapture) {
          setGpsPoints(prev => {
            if (prev.length === 0) return [pt];
            const last = prev[prev.length - 1];
            const dist = MachambaAreaService.haversineDistanceMeters(last, pt);
            if (dist >= 4) {
              return [...prev, pt];
            }
            return prev;
          });
        }
      },
      err => {
        setGpsTracking(false);
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError(
            'Permissão de localização recusada. Ative o GPS nas definições ou utilize "Desenhar Terreno" / "Fita Métrica".'
          );
        } else {
          setGpsError(
            'Sinal GPS fraco ou indisponível em interior. Ao ar livre o GPS funciona mesmo sem internet.'
          );
        }
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
  };

  const stopGpsTracking = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsTracking(false);
  };

  const handleMarkGpsVertex = () => {
    if (currentGpsPos) {
      setGpsPoints(prev => [...prev, { ...currentGpsPos, timestamp: Date.now() }]);
      return;
    }
    if (!navigator.geolocation) {
      setGpsError('GPS não disponível neste dispositivo.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const pt: MachambaGpsPoint = {
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy),
          timestamp: Date.now()
        };
        setCurrentGpsPos(pt);
        setGpsPoints(prev => [...prev, pt]);
        setGpsError(null);
      },
      () => {
        setGpsError(
          'Não foi possível obter um ponto GPS agora. Tente ao ar livre ou use "Desenhar Terreno".'
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleAddManualGps = () => {
    const lat = parseFloat(manualLat.replace(',', '.'));
    const lng = parseFloat(manualLng.replace(',', '.'));
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setGpsError('Coordenadas inválidas. Ex: Lat -24.4051, Lng 35.1456');
      return;
    }
    setGpsError(null);
    setGpsPoints(prev => [...prev, { lat, lng, timestamp: Date.now() }]);
    setManualLat('');
    setManualLng('');
  };

  // --- INTERACTIVE GRID HANDLERS ---
  const clientPointToMeters = (clientX: number, clientY: number): MachambaPlanarPoint | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;

    const svgX = ((clientX - rect.left) / rect.width) * SVG_SIZE;
    const svgY = ((clientY - rect.top) / rect.height) * SVG_SIZE;

    const usable = SVG_SIZE - SVG_PAD * 2;
    const normX = Math.max(0, Math.min(1, (svgX - SVG_PAD) / usable));
    const normY = Math.max(0, Math.min(1, 1 - (svgY - SVG_PAD) / usable));

    const snap = gridScaleMeters >= 200 ? 5 : 1;
    const metersX = Math.round((normX * gridScaleMeters) / snap) * snap;
    const metersY = Math.round((normY * gridScaleMeters) / snap) * snap;
    return { x: metersX, y: metersY };
  };

  const handleGridClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingIdx !== null) return;
    const pt = clientPointToMeters(e.clientX, e.clientY);
    if (!pt) return;
    setPlanarPoints(prev => [...prev, pt]);
  };

  const handleVertexPointerDown = (idx: number, e: React.PointerEvent<SVGCircleElement>) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDraggingIdx(idx);
  };

  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (draggingIdx === null) return;
    const pt = clientPointToMeters(e.clientX, e.clientY);
    if (!pt) return;
    setPlanarPoints(prev => prev.map((p, i) => (i === draggingIdx ? pt : p)));
  };

  const handleSvgPointerUp = () => {
    if (draggingIdx !== null) {
      setTimeout(() => setDraggingIdx(null), 40);
    }
  };

  const applyGridPreset = (preset: 'rect' | 'lshape' | 'triangle') => {
    const s = gridScaleMeters;
    if (preset === 'rect') {
      setPlanarPoints([
        { x: Math.round(s * 0.15), y: Math.round(s * 0.2) },
        { x: Math.round(s * 0.85), y: Math.round(s * 0.2) },
        { x: Math.round(s * 0.85), y: Math.round(s * 0.75) },
        { x: Math.round(s * 0.15), y: Math.round(s * 0.75) }
      ]);
    } else if (preset === 'lshape') {
      setPlanarPoints([
        { x: Math.round(s * 0.15), y: Math.round(s * 0.15) },
        { x: Math.round(s * 0.85), y: Math.round(s * 0.15) },
        { x: Math.round(s * 0.85), y: Math.round(s * 0.5) },
        { x: Math.round(s * 0.5), y: Math.round(s * 0.5) },
        { x: Math.round(s * 0.5), y: Math.round(s * 0.85) },
        { x: Math.round(s * 0.15), y: Math.round(s * 0.85) }
      ]);
    } else {
      setPlanarPoints([
        { x: Math.round(s * 0.15), y: Math.round(s * 0.2) },
        { x: Math.round(s * 0.85), y: Math.round(s * 0.25) },
        { x: Math.round(s * 0.45), y: Math.round(s * 0.85) }
      ]);
    }
  };

  // --- COMPUTE ACTIVE AREA, PERIMETER & VALIDATION ---
  const activeMetrics = useMemo(() => {
    if (mode === 'gps') {
      const areaM2 = MachambaAreaService.calculateGpsPolygonAreaM2(gpsPoints);
      const perimeterM = MachambaAreaService.calculateGpsPerimeterMeters(gpsPoints, gpsPoints.length >= 3);
      return {
        areaM2,
        areaHa: MachambaAreaService.m2ToHectares(areaM2),
        perimeterM,
        verticesCount: gpsPoints.length,
        method: 'gps_perimetro' as MachambaMeasurementMethod,
        validationError:
          gpsPoints.length > 0 && gpsPoints.length < 3
            ? `Marque pelo menos 3 cantos da machamba (${gpsPoints.length}/3 capturados).`
            : null,
        dimensionsSummary: `${gpsPoints.length} vértices GPS capturados`
      };
    }

    if (mode === 'grid') {
      const areaM2 = MachambaAreaService.calculatePlanarAreaM2(planarPoints);
      const perimeterM = MachambaAreaService.calculatePlanarPerimeterMeters(
        planarPoints,
        planarPoints.length >= 3
      );
      return {
        areaM2,
        areaHa: MachambaAreaService.m2ToHectares(areaM2),
        perimeterM,
        verticesCount: planarPoints.length,
        method: 'desenho_terreno' as MachambaMeasurementMethod,
        validationError:
          planarPoints.length < 3
            ? `Toque na grelha para marcar pelo menos 3 cantos (${planarPoints.length}/3).`
            : null,
        dimensionsSummary: `Polígono de ${planarPoints.length} cantos desenhado na grelha (${gridScaleMeters}×${gridScaleMeters}m)`
      };
    }

    // Mode === 'tape'
    const factor = tapeUnit === 'paces' ? strideMeters : 1;
    const method: MachambaMeasurementMethod = tapeUnit === 'paces' ? 'passos' : 'fita_metrica';
    const unitTag = tapeUnit === 'paces' ? 'passos' : 'm';

    if (tapeShape === 'rectangle') {
      const l = Math.max(0, rectLen) * factor;
      const w = Math.max(0, rectWidth) * factor;
      const areaM2 = l * w;
      return {
        areaM2,
        areaHa: MachambaAreaService.m2ToHectares(areaM2),
        perimeterM: 2 * (l + w),
        verticesCount: 4,
        method,
        validationError: l <= 0 || w <= 0 ? 'Indique comprimento e largura maiores que zero.' : null,
        dimensionsSummary: `Retângulo ${rectLen} × ${rectWidth} ${unitTag} (${l.toFixed(1)}m × ${w.toFixed(1)}m)`
      };
    }

    if (tapeShape === 'trapezoid') {
      const b1 = Math.max(0, trapTop) * factor;
      const b2 = Math.max(0, trapBottom) * factor;
      const h = Math.max(0, trapHeight) * factor;
      const areaM2 = ((b1 + b2) / 2) * h;
      const leg = Math.hypot((b2 - b1) / 2, h);
      return {
        areaM2,
        areaHa: MachambaAreaService.m2ToHectares(areaM2),
        perimeterM: b1 + b2 + 2 * leg,
        verticesCount: 4,
        method,
        validationError:
          b1 <= 0 || b2 <= 0 || h <= 0 ? 'Indique as duas bases e a altura maiores que zero.' : null,
        dimensionsSummary: `Trapézio bases ${b1.toFixed(1)}m e ${b2.toFixed(1)}m, altura ${h.toFixed(1)}m`
      };
    }

    if (tapeShape === 'triangle') {
      const res = MachambaAreaService.calculateTriangleHeron(
        triA * factor,
        triB * factor,
        triC * factor
      );
      return {
        areaM2: res.areaM2,
        areaHa: MachambaAreaService.m2ToHectares(res.areaM2),
        perimeterM: res.perimeterM,
        verticesCount: 3,
        method,
        validationError: res.valid ? null : res.error || 'Triângulo inválido.',
        dimensionsSummary: `Triângulo ${(triA * factor).toFixed(1)}m × ${(triB * factor).toFixed(
          1
        )}m × ${(triC * factor).toFixed(1)}m`
      };
    }

    // quad_diagonal
    const res = MachambaAreaService.calculateQuadWithDiagonal(
      quadA * factor,
      quadB * factor,
      quadC * factor,
      quadD * factor,
      quadDiag * factor
    );
    return {
      areaM2: res.areaM2,
      areaHa: MachambaAreaService.m2ToHectares(res.areaM2),
      perimeterM: res.perimeterM,
      verticesCount: 4,
      method,
      validationError: res.valid ? null : res.error || 'Medidas do terreno não fecham.',
      dimensionsSummary: `4 Lados (${(quadA * factor).toFixed(1)}m, ${(quadB * factor).toFixed(
        1
      )}m, ${(quadC * factor).toFixed(1)}m, ${(quadD * factor).toFixed(1)}m) + Diagonal ${(
        quadDiag * factor
      ).toFixed(1)}m`
    };
  }, [
    mode,
    gpsPoints,
    planarPoints,
    gridScaleMeters,
    tapeUnit,
    strideMeters,
    tapeShape,
    rectLen,
    rectWidth,
    quadA,
    quadB,
    quadC,
    quadD,
    quadDiag,
    triA,
    triB,
    triC,
    trapTop,
    trapBottom,
    trapHeight
  ]);

  const cropEstimate = useMemo(
    () => MachambaAreaService.estimateCropRequirements(activeMetrics.areaHa, selectedCrop),
    [activeMetrics.areaHa, selectedCrop]
  );

  // --- PROJECTED GPS PREVIEW COORDINATES FOR SVG ---
  const gpsSvgData = useMemo(() => {
    if (gpsPoints.length === 0) return null;
    const local = MachambaAreaService.projectGpsToLocalMeters(gpsPoints);
    const xs = local.map(p => p.x);
    const ys = local.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const span = Math.max(10, maxX - minX, maxY - minY);
    const usable = SVG_SIZE - SVG_PAD * 2;
    const offsetX = SVG_PAD + (usable - ((maxX - minX) / span) * usable) / 2;
    const offsetY = SVG_PAD + (usable - ((maxY - minY) / span) * usable) / 2;

    const coords = local.map((p, idx) => ({
      sx: offsetX + ((p.x - minX) / span) * usable,
      sy: SVG_SIZE - (offsetY + ((p.y - minY) / span) * usable),
      label: String.fromCharCode(65 + (idx % 26))
    }));
    return { coords };
  }, [gpsPoints]);

  // --- GRID SVG COORDINATES ---
  const gridSvgCoords = useMemo(() => {
    const usable = SVG_SIZE - SVG_PAD * 2;
    return planarPoints.map((p, idx) => ({
      sx: SVG_PAD + (p.x / gridScaleMeters) * usable,
      sy: SVG_SIZE - (SVG_PAD + (p.y / gridScaleMeters) * usable),
      label: String.fromCharCode(65 + (idx % 26)),
      raw: p
    }));
  }, [planarPoints, gridScaleMeters]);

  const handleSaveMeasurement = () => {
    if (activeMetrics.areaM2 <= 0 || activeMetrics.validationError) {
      onShowToast?.('Conclua uma medição válida antes de guardar.', 'info');
      return;
    }

    const record = MachambaAreaService.saveMeasurement({
      name: plotName.trim() || 'Machamba Sem Nome',
      district,
      crop: selectedCrop,
      method: activeMetrics.method,
      areaM2: activeMetrics.areaM2,
      areaHa: activeMetrics.areaHa,
      perimeterM: activeMetrics.perimeterM,
      verticesCount: activeMetrics.verticesCount,
      gpsPoints: mode === 'gps' ? gpsPoints : undefined,
      planarPoints: mode === 'grid' ? planarPoints : undefined,
      dimensionsSummary: activeMetrics.dimensionsSummary
    });

    onShowToast?.(
      `Machamba "${record.name}" guardada offline (${record.areaHa.toFixed(3)} ha).`,
      'success'
    );
  };

  const handleExportPdf = (record: MachambaMeasurement) => {
    try {
      const file = MachambaAreaService.exportMeasurementPdf(record);
      onShowToast?.(`Croqui PDF ${file} descarregado com sucesso!`, 'success');
    } catch {
      onShowToast?.('Não foi possível gerar o PDF agora.', 'info');
    }
  };

  const handleExportCurrentPdf = () => {
    if (activeMetrics.areaM2 <= 0 || activeMetrics.validationError) return;
    const temp: MachambaMeasurement = {
      id: 'RASCUNHO',
      name: plotName.trim() || 'Machamba Medida',
      district,
      crop: selectedCrop,
      method: activeMetrics.method,
      areaM2: activeMetrics.areaM2,
      areaHa: activeMetrics.areaHa,
      perimeterM: activeMetrics.perimeterM,
      verticesCount: activeMetrics.verticesCount,
      gpsPoints: mode === 'gps' ? gpsPoints : undefined,
      planarPoints: mode === 'grid' ? planarPoints : undefined,
      dimensionsSummary: activeMetrics.dimensionsSummary,
      createdAt: new Date().toISOString()
    };
    handleExportPdf(temp);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      {!compactModal && (
        <div
          className={`p-5 sm:p-6 rounded-3xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
            sunlightMode
              ? 'bg-yellow-400 text-black border-yellow-500 font-bold'
              : 'bg-[#022c22] text-white border-emerald-700/60'
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className={sunlightMode ? 'text-black' : 'text-emerald-300'}>
                Topografia Agrária de Campo · 100% Offline
              </span>
              <span aria-hidden="true" className="opacity-50">
                ·
              </span>
              <span className={sunlightMode ? 'text-stone-900' : 'text-emerald-100'}>
                GPS, Grelha Métrica e Fita / Passos
              </span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">
              Sistema de Medição de Área das Machambas
            </h2>
            <p
              className={`text-xs sm:text-sm max-w-2xl leading-relaxed ${
                sunlightMode ? 'text-stone-900 font-semibold' : 'text-emerald-100/90'
              }`}
            >
              Meça com precisão o tamanho real das machambas em hectares, metros quadrados, canteiros e camalhões — caminhando com GPS ao redor da parcela, desenhando os cantos ou inserindo lados por fita métrica e passos.
            </p>
          </div>
        </div>
      )}

      {/* Mode Switcher */}
      <div
        role="tablist"
        aria-label="Métodos de medição da machamba"
        className={`grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-2xl border ${
          sunlightMode
            ? 'bg-stone-950 border-yellow-400'
            : 'bg-stone-100 dark:bg-stone-900 border-stone-200 dark:border-stone-800'
        }`}
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'grid'}
          onClick={() => setMode('grid')}
          className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
            mode === 'grid'
              ? sunlightMode
                ? 'bg-yellow-400 text-black'
                : 'bg-[#065f46] text-white shadow-sm'
              : sunlightMode
                ? 'text-stone-200 hover:text-yellow-400'
                : 'text-stone-700 dark:text-stone-300 hover:bg-white/70 dark:hover:bg-stone-800'
          }`}
        >
          <Grid className="w-4 h-4 shrink-0" />
          <span>Desenhar Terreno (Grelha)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={mode === 'gps'}
          onClick={() => setMode('gps')}
          className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
            mode === 'gps'
              ? sunlightMode
                ? 'bg-yellow-400 text-black'
                : 'bg-[#065f46] text-white shadow-sm'
              : sunlightMode
                ? 'text-stone-200 hover:text-yellow-400'
                : 'text-stone-700 dark:text-stone-300 hover:bg-white/70 dark:hover:bg-stone-800'
          }`}
        >
          <Navigation className="w-4 h-4 shrink-0" />
          <span>Caminhar com GPS</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={mode === 'tape'}
          onClick={() => setMode('tape')}
          className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
            mode === 'tape'
              ? sunlightMode
                ? 'bg-yellow-400 text-black'
                : 'bg-[#065f46] text-white shadow-sm'
              : sunlightMode
                ? 'text-stone-200 hover:text-yellow-400'
                : 'text-stone-700 dark:text-stone-300 hover:bg-white/70 dark:hover:bg-stone-800'
          }`}
        >
          <Ruler className="w-4 h-4 shrink-0" />
          <span>Fita Métrica / Passos</span>
        </button>
      </div>

      {/* Main Two-Column Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Interactive Measurement Canvas / Inputs (7 cols) */}
        <div
          className={`lg:col-span-7 p-4 sm:p-5 rounded-2xl border space-y-4 ${
            sunlightMode
              ? 'bg-stone-950 border-yellow-400 text-white'
              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
          }`}
        >
          {/* MODE 1: INTERACTIVE TOPOGRAPHIC GRID */}
          {mode === 'grid' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Planta Interativa da Machamba (em Metros)
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Toque na grelha para adicionar cantos ou arraste os pontos verdes para ajustar ao formato do terreno.
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <label htmlFor="grid-scale-select" className="text-[11px] font-semibold text-stone-500">
                    Escala:
                  </label>
                  <select
                    id="grid-scale-select"
                    value={gridScaleMeters}
                    onChange={e => {
                      const nextScale = Number(e.target.value) as 40 | 100 | 200 | 500;
                      const ratio = nextScale / gridScaleMeters;
                      setGridScaleMeters(nextScale);
                      setPlanarPoints(prev =>
                        prev.map(p => ({
                          x: Math.round(p.x * ratio),
                          y: Math.round(p.y * ratio)
                        }))
                      );
                    }}
                    className="min-h-[36px] text-xs font-bold rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 px-2.5"
                  >
                    <option value={40}>40m × 40m (Horta)</option>
                    <option value={100}>100m × 100m (1 ha)</option>
                    <option value={200}>200m × 200m (4 ha)</option>
                    <option value={500}>500m × 500m (25 ha)</option>
                  </select>
                </div>
              </div>

              {/* Interactive SVG Field Grid */}
              <div className="flex justify-center">
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
                  onClick={handleGridClick}
                  onPointerMove={handleSvgPointerMove}
                  onPointerUp={handleSvgPointerUp}
                  onPointerLeave={handleSvgPointerUp}
                  className="w-full max-w-[380px] aspect-square rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 touch-none cursor-crosshair select-none"
                  role="img"
                  aria-label="Grelha topográfica interativa para marcar e arrastar os cantos da machamba"
                >
                  {/* Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map(frac => {
                    const pos = SVG_PAD + frac * (SVG_SIZE - SVG_PAD * 2);
                    return (
                      <g key={frac}>
                        <line
                          x1={pos}
                          y1={SVG_PAD}
                          x2={pos}
                          y2={SVG_SIZE - SVG_PAD}
                          stroke="currentColor"
                          className="text-stone-200 dark:text-stone-800"
                          strokeWidth="1"
                        />
                        <line
                          x1={SVG_PAD}
                          y1={pos}
                          x2={SVG_SIZE - SVG_PAD}
                          y2={pos}
                          stroke="currentColor"
                          className="text-stone-200 dark:text-stone-800"
                          strokeWidth="1"
                        />
                      </g>
                    );
                  })}

                  {/* Scale axis label */}
                  <text
                    x={SVG_PAD}
                    y={SVG_SIZE - 6}
                    className="fill-stone-500 dark:fill-stone-400 text-[10px] font-mono"
                  >
                    0 m
                  </text>
                  <text
                    x={SVG_SIZE - SVG_PAD - 34}
                    y={SVG_SIZE - 6}
                    className="fill-stone-500 dark:fill-stone-400 text-[10px] font-mono"
                  >
                    {gridScaleMeters} m
                  </text>

                  {/* Polygon fill */}
                  {gridSvgCoords.length >= 3 && (
                    <polygon
                      points={gridSvgCoords.map(c => `${c.sx},${c.sy}`).join(' ')}
                      fill="rgba(6, 95, 70, 0.22)"
                      stroke="#059669"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Polyline when < 3 points */}
                  {gridSvgCoords.length === 2 && (
                    <line
                      x1={gridSvgCoords[0].sx}
                      y1={gridSvgCoords[0].sy}
                      x2={gridSvgCoords[1].sx}
                      y2={gridSvgCoords[1].sy}
                      stroke="#059669"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Edge distance labels */}
                  {gridSvgCoords.length >= 2 &&
                    gridSvgCoords.map((pt, i) => {
                      const nextIdx = (i + 1) % gridSvgCoords.length;
                      if (gridSvgCoords.length === 2 && i === 1) return null;
                      const next = gridSvgCoords[nextIdx];
                      const mx = (pt.sx + next.sx) / 2;
                      const my = (pt.sy + next.sy) / 2;
                      const distM = Math.hypot(next.raw.x - pt.raw.x, next.raw.y - pt.raw.y);
                      return (
                        <g key={`edge-${i}`} className="pointer-events-none">
                          <rect
                            x={mx - 18}
                            y={my - 9}
                            width={36}
                            height={16}
                            rx={4}
                            className="fill-white/90 dark:fill-stone-900/90 stroke-stone-300 dark:stroke-stone-700"
                            strokeWidth="0.7"
                          />
                          <text
                            x={mx}
                            y={my + 2.5}
                            textAnchor="middle"
                            className="fill-stone-900 dark:fill-stone-100 text-[9.5px] font-bold font-mono"
                          >
                            {Math.round(distM)}m
                          </text>
                        </g>
                      );
                    })}

                  {/* Draggable corner vertices */}
                  {gridSvgCoords.map((pt, idx) => (
                    <g key={`v-${idx}`}>
                      <circle
                        cx={pt.sx}
                        cy={pt.sy}
                        r={10}
                        onPointerDown={e => handleVertexPointerDown(idx, e)}
                        className="fill-[#065f46] stroke-white dark:stroke-stone-950 cursor-grab active:cursor-grabbing"
                        strokeWidth="2"
                      />
                      <text
                        x={pt.sx}
                        y={pt.sy + 3.5}
                        textAnchor="middle"
                        className="fill-white text-[10px] font-bold pointer-events-none"
                      >
                        {pt.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              {/* Quick Actions & Presets */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyGridPreset('rect')}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    Forma Retangular
                  </button>
                  <button
                    type="button"
                    onClick={() => applyGridPreset('lshape')}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    Forma em L
                  </button>
                  <button
                    type="button"
                    onClick={() => applyGridPreset('triangle')}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    Triangular
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPlanarPoints(prev => prev.slice(0, -1))}
                    disabled={planarPoints.length === 0}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 flex items-center gap-1"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Desfazer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlanarPoints([])}
                    disabled={planarPoints.length === 0}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-40 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: LIVE GPS PERIMETER WALK */}
          {mode === 'gps' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span>Caminhar pelo Perímetro da Machamba</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Caminhe pelos cantos da machamba ao ar livre. O GPS calcula a área exata sem precisar de saldo ou internet.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {gpsTracking && (
                    <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                      <span>GPS Ativo</span>
                    </span>
                  )}
                </div>
              </div>

              {/* GPS Live Controls */}
              <div className="flex flex-wrap gap-2">
                {!gpsTracking ? (
                  <button
                    type="button"
                    onClick={startGpsTracking}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#065f46] hover:bg-[#022c22] text-white text-xs font-bold flex items-center gap-2 shadow-sm"
                  >
                    <Play className="w-4 h-4" />
                    <span>Iniciar Leitura GPS</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopGpsTracking}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
                  >
                    <Square className="w-4 h-4" />
                    <span>Pausar GPS</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleMarkGpsVertex}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-950 hover:bg-stone-800 dark:hover:bg-stone-200 text-xs font-bold flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Marcar Canto Agora</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGpsPoints(prev => prev.slice(0, -1))}
                  disabled={gpsPoints.length === 0}
                  className="min-h-[44px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 disabled:opacity-40 flex items-center gap-1"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Desfazer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGpsPoints([])}
                  disabled={gpsPoints.length === 0}
                  className="min-h-[44px] px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 disabled:opacity-40 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              </div>

              <label className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCapture}
                  onChange={e => setAutoCapture(e.target.checked)}
                  className="w-4 h-4 accent-emerald-700 rounded"
                />
                <span>Registar automaticamente novo ponto ao caminhar mais de 4 metros</span>
              </label>

              {gpsError && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{gpsError}</span>
                </div>
              )}

              {currentGpsPos && (
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 text-xs flex flex-wrap items-center justify-between gap-2 font-mono tabular-nums">
                  <span>
                    Posição: {currentGpsPos.lat.toFixed(5)}, {currentGpsPos.lng.toFixed(5)}
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                    Precisão: ±{currentGpsPos.accuracy ?? '--'} m
                  </span>
                </div>
              )}

              {/* Live SVG Preview of GPS Track */}
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 flex flex-col items-center">
                {gpsSvgData && gpsSvgData.coords.length > 0 ? (
                  <svg
                    viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
                    className="w-full max-w-[300px] aspect-square"
                    aria-label="Pré-visualização do perímetro GPS caminhado"
                  >
                    {gpsSvgData.coords.length >= 3 && (
                      <polygon
                        points={gpsSvgData.coords.map(c => `${c.sx},${c.sy}`).join(' ')}
                        fill="rgba(6, 95, 70, 0.22)"
                        stroke="#059669"
                        strokeWidth="2.5"
                      />
                    )}
                    {gpsSvgData.coords.length === 2 && (
                      <line
                        x1={gpsSvgData.coords[0].sx}
                        y1={gpsSvgData.coords[0].sy}
                        x2={gpsSvgData.coords[1].sx}
                        y2={gpsSvgData.coords[1].sy}
                        stroke="#059669"
                        strokeWidth="2.5"
                      />
                    )}
                    {gpsSvgData.coords.map((c, idx) => (
                      <g key={idx}>
                        <circle
                          cx={c.sx}
                          cy={c.sy}
                          r={8}
                          className="fill-[#065f46] stroke-white dark:stroke-stone-950"
                          strokeWidth="2"
                        />
                        <text
                          x={c.sx}
                          y={c.sy + 3}
                          textAnchor="middle"
                          className="fill-white text-[9px] font-bold"
                        >
                          {c.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                ) : (
                  <div className="py-10 text-center space-y-1 text-xs text-stone-500 dark:text-stone-400">
                    <MapPin className="w-6 h-6 mx-auto text-stone-400" />
                    <p className="font-semibold">Nenhum canto GPS capturado ainda</p>
                    <p>Prima "Iniciar Leitura GPS" ou "Marcar Canto Agora" em cada vértice da machamba.</p>
                  </div>
                )}
              </div>

              {/* Manual GPS Vertex Input (for coordinates written on paper) */}
              <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-2">
                <p className="text-[11px] font-bold text-stone-600 dark:text-stone-400">
                  Ou adicionar coordenada GPS manual (caderno de campo):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={manualLat}
                    onChange={e => setManualLat(e.target.value)}
                    placeholder="Latitude (ex: -24.4051)"
                    className="min-h-[40px] px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-mono"
                  />
                  <input
                    type="text"
                    value={manualLng}
                    onChange={e => setManualLng(e.target.value)}
                    placeholder="Longitude (ex: 35.1456)"
                    className="min-h-[40px] px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddManualGps}
                    className="min-h-[40px] px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 dark:bg-stone-700 dark:hover:bg-stone-600 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Ponto</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: TAPE MEASURE OR CALIBRATED PACES */}
          {mode === 'tape' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Medição Direta com Fita Métrica, Corda ou Passos
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Ideal quando não há sinal GPS: use fita métrica ou conte os seus passos ao longo dos lados da machamba.
                  </p>
                </div>

                {/* Unit toggle: meters vs paces */}
                <div className="flex items-center p-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setTapeUnit('meters')}
                    className={`min-h-[36px] px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors ${
                      tapeUnit === 'meters'
                        ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Metros (m)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTapeUnit('paces')}
                    className={`min-h-[36px] px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors ${
                      tapeUnit === 'paces'
                        ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <Footprints className="w-3.5 h-3.5" />
                    <span>Passos</span>
                  </button>
                </div>
              </div>

              {tapeUnit === 'paces' && (
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">
                    Comprimento do seu passo: <strong className="tabular-nums">{strideMeters.toFixed(2)} m</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.55"
                      max="1.00"
                      step="0.05"
                      value={strideMeters}
                      onChange={e => setStrideMeters(Number(e.target.value))}
                      aria-label="Comprimento do passo em metros"
                      className="w-32 accent-emerald-700"
                    />
                    <span className="text-[11px] text-stone-500">Padrão adulto: 0,75 m</span>
                  </div>
                </div>
              )}

              {/* Shape Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'quad_diagonal' as TapeShape, label: '4 Lados + Diagonal' },
                  { id: 'rectangle' as TapeShape, label: 'Retangular' },
                  { id: 'triangle' as TapeShape, label: 'Triangular (3 Lados)' },
                  { id: 'trapezoid' as TapeShape, label: 'Trapézio' }
                ].map(shape => (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() => setTapeShape(shape.id)}
                    className={`min-h-[40px] px-2.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      tapeShape === shape.id
                        ? 'bg-[#065f46] text-white border-[#065f46]'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    {shape.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Inputs for Shape */}
              {tapeShape === 'rectangle' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="space-y-1 text-xs">
                    <span className="font-bold text-stone-700 dark:text-stone-300 block">
                      Comprimento ({tapeUnit === 'paces' ? 'passos' : 'metros'})
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={rectLen}
                      onChange={e => setRectLen(Number(e.target.value) || 0)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold tabular-nums"
                    />
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="font-bold text-stone-700 dark:text-stone-300 block">
                      Largura ({tapeUnit === 'paces' ? 'passos' : 'metros'})
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={rectWidth}
                      onChange={e => setRectWidth(Number(e.target.value) || 0)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold tabular-nums"
                    />
                  </label>
                </div>
              )}

              {tapeShape === 'quad_diagonal' && (
                <div className="space-y-3">
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    Para terrenos de 4 lados irregulares (sem ângulos retos): meça os 4 bordos exteriores mais 1 linha diagonal de um canto ao canto oposto.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'Lado 1 (Norte)', val: quadA, set: setQuadA },
                      { label: 'Lado 2 (Este)', val: quadB, set: setQuadB },
                      { label: 'Lado 3 (Sul)', val: quadC, set: setQuadC },
                      { label: 'Lado 4 (Oeste)', val: quadD, set: setQuadD },
                      { label: 'Diagonal (Canto a Canto)', val: quadDiag, set: setQuadDiag }
                    ].map(field => (
                      <label key={field.label} className="space-y-1 text-xs">
                        <span className="font-bold text-stone-700 dark:text-stone-300 block">
                          {field.label} ({tapeUnit === 'paces' ? 'passos' : 'm'})
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={field.val}
                          onChange={e => field.set(Number(e.target.value) || 0)}
                          className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold tabular-nums"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {tapeShape === 'triangle' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Lado A', val: triA, set: setTriA },
                    { label: 'Lado B', val: triB, set: setTriB },
                    { label: 'Lado C', val: triC, set: setTriC }
                  ].map(field => (
                    <label key={field.label} className="space-y-1 text-xs">
                      <span className="font-bold text-stone-700 dark:text-stone-300 block">
                        {field.label} ({tapeUnit === 'paces' ? 'passos' : 'm'})
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={field.val}
                        onChange={e => field.set(Number(e.target.value) || 0)}
                        className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold tabular-nums"
                      />
                    </label>
                  ))}
                </div>
              )}

              {tapeShape === 'trapezoid' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Bordo Superior', val: trapTop, set: setTrapTop },
                    { label: 'Bordo Inferior', val: trapBottom, set: setTrapBottom },
                    { label: 'Largura / Altura', val: trapHeight, set: setTrapHeight }
                  ].map(field => (
                    <label key={field.label} className="space-y-1 text-xs">
                      <span className="font-bold text-stone-700 dark:text-stone-300 block">
                        {field.label} ({tapeUnit === 'paces' ? 'passos' : 'm'})
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={field.val}
                        onChange={e => field.set(Number(e.target.value) || 0)}
                        className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold tabular-nums"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeMetrics.validationError && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{activeMetrics.validationError}</span>
            </div>
          )}
        </div>

        {/* Right Live Results, Equivalents & Save Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className={`p-5 rounded-2xl border space-y-4 ${
              sunlightMode
                ? 'bg-stone-950 border-yellow-400 text-white'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
            }`}
          >
            <div>
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400 block">
                Tamanho Real Calculado da Machamba
              </span>
              <div className="mt-1 flex items-baseline gap-2.5 flex-wrap">
                <span
                  className={`font-display text-3xl sm:text-4xl font-extrabold tabular-nums tracking-tight ${
                    sunlightMode ? 'text-yellow-400' : 'text-[#065f46] dark:text-emerald-400'
                  }`}
                >
                  {activeMetrics.areaHa.toFixed(4)} ha
                </span>
                <span className="text-sm font-bold text-stone-600 dark:text-stone-300 tabular-nums">
                  ({Math.round(activeMetrics.areaM2).toLocaleString('pt-MZ')} m²)
                </span>
              </div>
            </div>

            {/* Equivalent Rural Units */}
            <div className="grid grid-cols-2 gap-2.5 text-xs tabular-nums">
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700">
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
                  Perímetro Exterior
                </span>
                <strong className="text-sm text-stone-900 dark:text-white">
                  {Math.round(activeMetrics.perimeterM).toLocaleString('pt-MZ')} m
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700">
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
                  Canteiros (10m × 1m)
                </span>
                <strong className="text-sm text-stone-900 dark:text-white">
                  {Math.round(MachambaAreaService.m2ToCanteiros(activeMetrics.areaM2)).toLocaleString('pt-MZ')} canteiros
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700">
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
                  Camalhões (25m × 1m)
                </span>
                <strong className="text-sm text-stone-900 dark:text-white">
                  {Math.round(MachambaAreaService.m2ToCamalhoes(activeMetrics.areaM2)).toLocaleString('pt-MZ')} camalhões
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700">
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
                  Parcelas (50m × 50m)
                </span>
                <strong className="text-sm text-stone-900 dark:text-white">
                  {MachambaAreaService.m2ToParcelas50x50(activeMetrics.areaM2).toFixed(2)} blocos
                </strong>
              </div>
            </div>

            {/* Direct Agronomic Conversion */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Necessidade para {selectedCrop}:</span>
                </span>
                <select
                  aria-label="Escolher cultura para estimativa"
                  value={selectedCrop}
                  onChange={e => setSelectedCrop(e.target.value)}
                  className="text-xs font-bold rounded-lg border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 px-2 py-1"
                >
                  <option value="Milho">Milho</option>
                  <option value="Mandioca">Mandioca</option>
                  <option value="Amendoim">Amendoim</option>
                  <option value="Feijão Nhemba">Feijão Nhemba</option>
                  <option value="Batata-Doce">Batata-Doce</option>
                  <option value="Mapira">Mapira</option>
                  <option value="Caju">Caju</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2 tabular-nums">
                <div>
                  <span className="text-[11px] text-stone-600 dark:text-stone-400 block">Sementes / Estacas:</span>
                  <strong className="text-stone-900 dark:text-white">
                    {cropEstimate.seedAmount.toLocaleString('pt-MZ')} {cropEstimate.seedUnit}
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-stone-600 dark:text-stone-400 block">Estrume / Composto:</span>
                  <strong className="text-stone-900 dark:text-white">{cropEstimate.manureTons} t</strong>
                </div>
              </div>
              <p className="text-[11px] text-emerald-900 dark:text-emerald-300 tabular-nums">
                Colheita prevista: <strong>{cropEstimate.estimatedYieldMinKg.toLocaleString('pt-MZ')}</strong> a{' '}
                <strong>{cropEstimate.estimatedYieldMaxKg.toLocaleString('pt-MZ')} kg</strong> ({cropEstimate.spacingLabel})
              </p>
            </div>

            {/* Apply Callback Button when opened from Calculator or Survey */}
            {onApplyAreaHa && (
              <button
                type="button"
                disabled={activeMetrics.areaHa <= 0 || Boolean(activeMetrics.validationError)}
                onClick={() => onApplyAreaHa(Number(activeMetrics.areaHa.toFixed(3)), plotName)}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 disabled:opacity-40 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Aplicar {activeMetrics.areaHa.toFixed(3)} ha no Formulário</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* Save Offline & Export PDF */}
            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={plotName}
                  onChange={e => setPlotName(e.target.value)}
                  placeholder="Nome da Machamba"
                  aria-label="Nome da Machamba"
                  className="min-h-[40px] px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
                <select
                  aria-label="Distrito em Inhambane"
                  value={district}
                  onChange={e => setDistrict(e.target.value as InhambaneDistrict)}
                  className="min-h-[40px] px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                >
                  {INHAMBANE_DISTRICTS_CATALOG.map(d => (
                    <option key={d.district} value={d.district}>
                      {d.district}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={activeMetrics.areaM2 <= 0 || Boolean(activeMetrics.validationError)}
                  onClick={handleSaveMeasurement}
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#065f46] hover:bg-[#022c22] disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Offline</span>
                </button>
                <button
                  type="button"
                  disabled={activeMetrics.areaM2 <= 0 || Boolean(activeMetrics.validationError)}
                  onClick={handleExportCurrentPdf}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 text-stone-800 dark:text-stone-100 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Croqui PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Machambas Measurements List */}
      {savedList.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Machambas Medidas e Guardadas ({savedList.length})
            </h3>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              Armazenamento local offline
            </span>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {savedList.map(item => (
              <div
                key={item.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
                    <span>{item.name}</span>
                    <span aria-hidden="true" className="text-stone-400">
                      ·
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {item.areaHa.toFixed(3)} ha ({Math.round(item.areaM2).toLocaleString('pt-MZ')} m²)
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    {item.district} · {item.crop} · Perímetro {Math.round(item.perimeterM)} m ·{' '}
                    {new Date(item.createdAt).toLocaleDateString('pt-MZ')}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {onApplyAreaHa && (
                    <button
                      type="button"
                      onClick={() => onApplyAreaHa(Number(item.areaHa.toFixed(3)), item.name)}
                      className="min-h-[36px] px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold"
                    >
                      Usar Área
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleExportPdf(item)}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 font-semibold flex items-center gap-1"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Remover medição ${item.name}`}
                    onClick={() => MachambaAreaService.deleteMeasurement(item.id)}
                    className="min-h-[36px] px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-700 dark:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
