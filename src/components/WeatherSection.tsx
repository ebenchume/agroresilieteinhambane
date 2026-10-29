import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  Droplets, 
  Wind, 
  Thermometer, 
  CloudRain, 
  Sprout, 
  RotateCw, 
  AlertCircle, 
  Sun, 
  MapPin, 
  Calendar,
  CheckCircle2,
  Download,
  Wifi,
  WifiOff
} from 'lucide-react';
import { 
  WeatherService, 
  WeatherData, 
  INHAMBANE_LOCATIONS 
} from '../services/weather';
import { DistrictZone } from '../types/auth';

interface WeatherSectionProps {
  initialZone: DistrictZone;
  onExportPdf?: (data: WeatherData) => void;
}

export const WeatherSection: React.FC<WeatherSectionProps> = ({
  initialZone,
  onExportPdf
}) => {
  const [selectedZone, setSelectedZone] = useState<string>(initialZone || 'Homoíne-Sede');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadWeather = async (zone: string) => {
    setIsRefreshing(true);
    try {
      const data = await WeatherService.fetchWeatherForLocation(zone);
      setWeatherData(data);
    } catch (e) {
      console.error('Failed to load weather:', e);
      setWeatherData(WeatherService.getFallbackData(zone));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedZone);
  }, [selectedZone]);

  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedZone(e.target.value);
  };

  const getWeatherIcon = (code: number, sizeClass = 'w-6 h-6') => {
    if (code === 0) return <Sun className={`${sizeClass} text-amber-500`} />;
    if (code >= 1 && code <= 3) return <CloudSun className={`${sizeClass} text-amber-400`} />;
    if (code >= 51 && code <= 65) return <CloudRain className={`${sizeClass} text-sky-500`} />;
    if (code >= 80) return <CloudRain className={`${sizeClass} text-sky-600`} />;
    return <CloudSun className={`${sizeClass} text-amber-500`} />;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Location Selector Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Monitorização Agrometeorológica Oficial
            </span>
            <span className="text-stone-300 dark:text-stone-700">·</span>
            <span className="text-xs text-stone-500">Inhambane, Moçambique</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
            Previsão do Tempo & Condições para a Machamba
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Dados meteorológicos em tempo real via Open-Meteo com humidade do solo e taxa de evapotranspiração.
          </p>
        </div>

        {/* Location selector & Refresh button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <select
              value={selectedZone}
              onChange={handleZoneChange}
              className="pl-8 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-800 dark:text-stone-200 outline-none focus:border-emerald-500 appearance-none cursor-pointer"
            >
              {Object.keys(INHAMBANE_LOCATIONS).map(loc => (
                <option key={loc} value={loc}>
                  {loc} ({INHAMBANE_LOCATIONS[loc].district})
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          <button
            onClick={() => loadWeather(selectedZone)}
            disabled={isRefreshing}
            className="p-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl text-stone-600 dark:text-stone-300 transition-colors"
            title="Atualizar dados meteorológicos"
            aria-label="Atualizar dados meteorológicos"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && !weatherData ? (
        <div className="p-12 text-center text-xs text-stone-400 animate-pulse">
          A carregar dados climáticos de Inhambane...
        </div>
      ) : weatherData ? (
        <>
          {/* Main Weather Hero Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Current Conditions Card (8 Cols) */}
            <div className="lg:col-span-8 p-6 rounded-2xl bg-gradient-to-br from-emerald-900 via-stone-900 to-stone-950 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-emerald-300">
                      Condição Atual · {weatherData.location.name}
                    </span>
                    <p className="text-xs text-stone-300 mt-0.5">
                      Distrito de {weatherData.location.district} · Altitude {weatherData.location.elevationMeters}m
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white/90 text-[11px] backdrop-blur-xs">
                    {weatherData.current.isCached ? (
                      <>
                        <WifiOff className="w-3 h-3 text-amber-300" />
                        <span>Cache Offline</span>
                      </>
                    ) : (
                      <>
                        <Wifi className="w-3 h-3 text-emerald-300" />
                        <span>Dados em Direto</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Big Temperature Display */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 my-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
                      {getWeatherIcon(weatherData.current.weatherCode, 'w-10 h-10')}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-4xl sm:text-5xl font-bold tracking-tight tabular-nums">
                          {weatherData.current.temperature}°C
                        </span>
                        <span className="text-xs text-stone-300">
                          Sensação: {weatherData.current.apparentTemperature}°C
                        </span>
                      </div>
                      <p className="text-sm font-medium text-emerald-200 mt-0.5">
                        {weatherData.current.weatherLabel}
                      </p>
                    </div>
                  </div>

                  {/* Quick Min / Max Today */}
                  {weatherData.daily[0] && (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-right sm:text-right">
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">
                        Hoje em {weatherData.location.name}
                      </span>
                      <span className="text-sm font-semibold text-stone-100 tabular-nums">
                        Min {weatherData.daily[0].tempMin}°C · Máx {weatherData.daily[0].tempMax}°C
                      </span>
                      <span className="text-[11px] text-emerald-300 block mt-0.5">
                        Chuva: {weatherData.daily[0].precipitationProb}% ({weatherData.daily[0].precipitationMm} mm)
                      </span>
                    </div>
                  )}
                </div>

                {/* Micro Agri Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
                  {/* Humidade do Solo */}
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <div className="flex items-center gap-1.5 text-stone-300 text-[11px] mb-1">
                      <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Humidade do Solo</span>
                    </div>
                    <span className="font-display text-base font-bold text-white tabular-nums">
                      {weatherData.current.soilMoisturePercent}%
                    </span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      Camada 0–1cm
                    </span>
                  </div>

                  {/* Temperatura do Solo */}
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <div className="flex items-center gap-1.5 text-stone-300 text-[11px] mb-1">
                      <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Temp. do Solo</span>
                    </div>
                    <span className="font-display text-base font-bold text-white tabular-nums">
                      {weatherData.current.soilTemperatureC}°C
                    </span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      Ideal p/ germinação
                    </span>
                  </div>

                  {/* Evapotranspiração FAO ET0 */}
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <div className="flex items-center gap-1.5 text-stone-300 text-[11px] mb-1">
                      <Droplets className="w-3.5 h-3.5 text-sky-400" />
                      <span>Evapotranspiração</span>
                    </div>
                    <span className="font-display text-base font-bold text-white tabular-nums">
                      {weatherData.current.evapotranspirationTodayMm} <span className="text-[10px] font-normal">mm/dia</span>
                    </span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      Índice FAO ET₀
                    </span>
                  </div>

                  {/* Vento */}
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <div className="flex items-center gap-1.5 text-stone-300 text-[11px] mb-1">
                      <Wind className="w-3.5 h-3.5 text-stone-300" />
                      <span>Velocidade Vento</span>
                    </div>
                    <span className="font-display text-base font-bold text-white tabular-nums">
                      {weatherData.current.windSpeedKmH} <span className="text-[10px] font-normal">km/h</span>
                    </span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      {weatherData.current.windSpeedKmH < 20 ? 'Seguro p/ spray' : 'Evitar pulverizar'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Agricultural Advisories Card (4 Cols) */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 mb-3">
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  <span>Recomendações Agronómicas</span>
                </h3>

                <div className="space-y-3">
                  {weatherData.agriculturalAlerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 text-xs flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                        {alert}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
                <span>{weatherData.lastUpdated}</span>
              </div>
            </div>
          </div>

          {/* 7-Day Agricultural Forecast Cards */}
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-stone-500" />
                  <span>Previsão Agrícola de 7 Dias para {weatherData.location.name}</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Planeie a sementeira, adubação e rega com base no balanço hídrico semanal.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {weatherData.daily.map((day, i) => (
                <div
                  key={day.date}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-colors ${
                    i === 0
                      ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-800/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                        {day.dayOfWeek}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {day.date.slice(5)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 my-2">
                      {getWeatherIcon(day.weatherCode, 'w-6 h-6')}
                      <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                        {day.tempMax}° / <span className="text-stone-400 font-normal">{day.tempMin}°</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-500 line-clamp-1 mb-2">
                      {day.weatherLabel}
                    </p>

                    <div className="space-y-1 text-[10px] text-stone-600 dark:text-stone-400 pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
                      <div className="flex items-center justify-between">
                        <span>Chuva:</span>
                        <span className={`font-semibold ${day.precipitationProb > 50 ? 'text-sky-600 font-bold' : ''}`}>
                          {day.precipitationProb}% ({day.precipitationMm}mm)
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Evap. ET₀:</span>
                        <span className="font-mono">{day.evapotranspirationMm} mm</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-stone-200/50 dark:border-stone-700/50">
                    <p className="text-[10px] text-emerald-800 dark:text-emerald-300 font-medium leading-tight line-clamp-2">
                      {day.advisory}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
