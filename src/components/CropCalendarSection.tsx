import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Sprout, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Download, 
  Bell, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Scissors, 
  Droplets, 
  Bug, 
  Sparkles, 
  Check, 
  CalendarDays, 
  Layers, 
  Info, 
  Trash2, 
  Edit3, 
  Share2,
  CheckCheck
} from 'lucide-react';
import { CropType, CropCycle, CropReminder, CropCycleStatus, CropReminderType, User } from '../types/auth';
import { CropCalendarService, CROP_CONFIGS } from '../services/cropCalendar';
import { NotificationsService } from '../services/notifications';

interface CropCalendarSectionProps {
  user: User;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  onExportPdf?: () => void;
}

const AVAILABLE_CROPS: CropType[] = [
  'Milho',
  'Mandioca',
  'Amendoim',
  'Feijão nhemba',
  'Mapira',
  'Caju',
  'Hortícolas',
  'Batata-doce',
  'Gergelim',
  'Banana',
  'Coco',
  'Feijão boer',
  'Outra'
];

export const CropCalendarSection: React.FC<CropCalendarSectionProps> = ({
  user,
  onShowToast,
  onExportPdf
}) => {
  // Cycles loaded from localStorage service
  const [cycles, setCycles] = useState<CropCycle[]>(() => 
    CropCalendarService.getUserCycles(user.id, user.crop)
  );

  // Active view: 'timeline' | 'calendar' | 'reminders'
  const [activeView, setActiveView] = useState<'timeline' | 'calendar' | 'reminders'>('timeline');

  // Selected filter for parcel/crop
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('all');
  const [reminderFilter, setReminderFilter] = useState<'all' | 'pending' | 'dueSoon' | 'completed'>('pending');

  // Modals state
  const [showAddCycleModal, setShowAddCycleModal] = useState(false);
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  const [selectedCycleForReminder, setSelectedCycleForReminder] = useState<string>('');
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ date: string; events: Array<{ title: string; type: string; cycleName: string; completed?: boolean; id?: string; cycleId?: string }> } | null>(null);

  // Form states for New Cycle
  const [formCrop, setFormCrop] = useState<CropType>(user.crop || 'Milho');
  const [formPlotName, setFormPlotName] = useState('');
  const [formVariety, setFormVariety] = useState(CROP_CONFIGS[user.crop || 'Milho']?.popularVarieties[0] || '');
  const [formArea, setFormArea] = useState<number>(1.0);
  const [formPlantingDate, setFormPlantingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formDurationDays, setFormDurationDays] = useState<number>(() => CROP_CONFIGS[user.crop || 'Milho']?.defaultDurationDays || 105);
  const [formExpectedYield, setFormExpectedYield] = useState<number | ''>('');
  const [formNotes, setFormNotes] = useState('');

  // Form states for New Custom Reminder
  const [remTitle, setRemTitle] = useState('');
  const [remDesc, setRemDesc] = useState('');
  const [remDate, setRemDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [remType, setRemType] = useState<CropReminderType>('sacha');
  const [remPriority, setRemPriority] = useState<'alta' | 'media' | 'baixa'>('media');

  // Calendar month state
  const [calendarDate, setCalendarDate] = useState<Date>(() => new Date());

  // Filtered cycles
  const filteredCycles = useMemo(() => {
    if (selectedCropFilter === 'all') return cycles;
    return cycles.filter(c => c.crop === selectedCropFilter);
  }, [cycles, selectedCropFilter]);

  // Aggregate reminders across cycles
  const allReminders = useMemo(() => {
    const list: Array<CropReminder & { plotName: string; crop: CropType }> = [];
    filteredCycles.forEach(c => {
      c.reminders.forEach(r => {
        list.push({ ...r, plotName: c.plotName, crop: c.crop });
      });
    });
    return list.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [filteredCycles]);

  // Filtered reminders
  const displayedReminders = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const sevenDaysStr = sevenDaysLater.toISOString().split('T')[0];

    return allReminders.filter(r => {
      if (reminderFilter === 'pending') return !r.completed;
      if (reminderFilter === 'completed') return r.completed;
      if (reminderFilter === 'dueSoon') {
        return !r.completed && r.dueDate >= today && r.dueDate <= sevenDaysStr;
      }
      return true;
    });
  }, [allReminders, reminderFilter]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalArea = cycles.reduce((acc, c) => acc + (c.areaHectares || 0), 0);
    const activeCycles = cycles.filter(c => c.status !== 'colhido');
    
    // Nearest harvest
    const upcomingHarvests = activeCycles
      .map(c => ({
        crop: c.crop,
        plot: c.plotName,
        date: c.estimatedHarvestDate,
        daysLeft: Math.ceil((new Date(c.estimatedHarvestDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      }))
      .filter(h => h.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    const pendingCount = allReminders.filter(r => !r.completed).length;

    return {
      totalPlots: cycles.length,
      activePlots: activeCycles.length,
      totalArea: totalArea.toFixed(1),
      pendingReminders: pendingCount,
      nearestHarvest: upcomingHarvests[0] || null
    };
  }, [cycles, allReminders]);

  // Handle Crop Change in New Cycle Form
  const handleCropSelectChange = (crop: CropType) => {
    setFormCrop(crop);
    const config = CROP_CONFIGS[crop] || CROP_CONFIGS['Outra'];
    setFormDurationDays(config.defaultDurationDays);
    setFormVariety(config.popularVarieties[0] || '');
  };

  // Create Cycle Submit
  const handleCreateCycleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPlotName.trim()) {
      onShowToast('Por favor, indique o nome da machamba ou parcela.', 'info');
      return;
    }

    const estimatedHarvestDate = CropCalendarService.calculateHarvestDate(formPlantingDate, formDurationDays);

    const newCycle = CropCalendarService.createCycle(user.id, {
      plotName: formPlotName,
      crop: formCrop,
      variety: formVariety,
      areaHectares: formArea,
      plantingDate: formPlantingDate,
      estimatedHarvestDate,
      expectedYieldKg: formExpectedYield ? Number(formExpectedYield) : undefined,
      notes: formNotes
    });

    setCycles(CropCalendarService.getUserCycles(user.id));
    setShowAddCycleModal(false);
    onShowToast(`Machamba "${newCycle.plotName}" registada! ${newCycle.reminders.length} lembretes automáticos agendados.`, 'success');

    // Reset form
    setFormPlotName('');
    setFormNotes('');
    setFormExpectedYield('');
  };

  // Toggle Reminder
  const handleToggleReminder = (cycleId: string, reminderId: string) => {
    const { cycles: updated, toggledReminder } = CropCalendarService.toggleReminder(user.id, cycleId, reminderId);
    setCycles(updated);
    if (toggledReminder) {
      if (toggledReminder.completed) {
        onShowToast(`Lembrete marcado como concluído: ${toggledReminder.title}`, 'success');
      } else {
        onShowToast(`Lembrete reativado: ${toggledReminder.title}`, 'info');
      }
    }
  };

  // Delete Cycle
  const handleDeleteCycle = (cycleId: string, plotName: string) => {
    if (window.confirm(`Tem a certeza que deseja remover o registo de cultivo da "${plotName}"?`)) {
      const updated = CropCalendarService.deleteCycle(user.id, cycleId);
      setCycles(updated);
      onShowToast(`Cultivo "${plotName}" removido com sucesso.`, 'info');
    }
  };

  // Mark Cycle as Harvested
  const handleMarkAsHarvested = (cycle: CropCycle) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = CropCalendarService.updateCycle(user.id, {
      ...cycle,
      actualHarvestDate: today,
      status: 'colhido'
    });
    setCycles(updated);
    onShowToast(`Parabéns! Colheita de ${cycle.crop} em "${cycle.plotName}" registada com sucesso!`, 'success');
  };

  // Add Custom Reminder Submit
  const handleAddCustomReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCycleForReminder) {
      onShowToast('Selecione uma machamba para associar o lembrete.', 'info');
      return;
    }
    if (!remTitle.trim()) {
      onShowToast('Insira o título do lembrete.', 'info');
      return;
    }

    const { cycles: updated, newReminder } = CropCalendarService.addCustomReminder(
      user.id,
      selectedCycleForReminder,
      {
        title: remTitle,
        description: remDesc,
        dueDate: remDate,
        type: remType,
        priority: remPriority
      }
    );

    setCycles(updated);
    setShowAddReminderModal(false);
    onShowToast(`Lembrete "${newReminder.title}" adicionado para ${newReminder.dueDate}.`, 'success');

    // Reset
    setRemTitle('');
    setRemDesc('');
  };

  // Push Notifications Request
  const handleEnableNotifications = async () => {
    const granted = await NotificationsService.requestPermission();
    if (granted) {
      onShowToast('Notificações ativadas! Receberá alertas automáticos para as intervenções agrícolas.', 'success');
    } else {
      onShowToast('Permissão de notificações não concedida no navegador. Os alertas permanecem na central da aplicação.', 'info');
    }
  };

  // Calendar Helpers
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  const prevMonth = () => {
    setCalendarDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCalendarDate(new Date(year, month + 1, 1));
  };

  // Map dates to events for calendar view
  const eventsByDate = useMemo(() => {
    const map: Record<string, Array<{ title: string; type: string; cycleName: string; completed?: boolean; id?: string; cycleId?: string }>> = {};

    filteredCycles.forEach(c => {
      // Planting event
      if (!map[c.plantingDate]) map[c.plantingDate] = [];
      map[c.plantingDate].push({
        title: `Plantio: ${c.crop}`,
        type: 'plantio',
        cycleName: c.plotName,
        completed: true
      });

      // Estimated Harvest event
      if (!map[c.estimatedHarvestDate]) map[c.estimatedHarvestDate] = [];
      map[c.estimatedHarvestDate].push({
        title: `Colheita Prevista: ${c.crop}`,
        type: 'colheita',
        cycleName: c.plotName,
        completed: !!c.actualHarvestDate
      });

      // Reminders
      c.reminders.forEach(r => {
        if (!map[r.dueDate]) map[r.dueDate] = [];
        map[r.dueDate].push({
          title: r.title,
          type: r.type,
          cycleName: c.plotName,
          completed: r.completed,
          id: r.id,
          cycleId: c.id
        });
      });
    });

    return map;
  }, [filteredCycles]);

  // Stage Badge Helper
  const getStatusBadge = (status: CropCycleStatus) => {
    switch (status) {
      case 'crescimento':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">Em Crescimento</span>;
      case 'floracao':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">Floração (Fase Crítica)</span>;
      case 'maduro':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300">Pronto para Colheita</span>;
      case 'colhido':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300">Colhido</span>;
      case 'planeado':
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300">Planeado</span>;
    }
  };

  // Reminder Type Icon
  const getReminderIcon = (type: CropReminderType) => {
    switch (type) {
      case 'plantio':
        return <Sprout className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'colheita':
        return <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case 'sacha':
        return <Scissors className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />;
      case 'adubacao':
        return <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
      case 'rega':
        return <Droplets className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />;
      case 'fitossanitario':
        return <Bug className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-stone-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-stone-900 via-emerald-950 to-stone-900 text-white shadow-xl relative overflow-hidden border border-emerald-900/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Gestão Agronómica de Machambas</span>
              </span>
              <span className="text-white/30">·</span>
              <span className="text-xs text-stone-300">{user.zone}</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Calendário de Cultivo & Ciclos Agrícolas
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1.5 max-w-xl leading-relaxed">
              Planeie o plantio, acompanhe a evolução fenológica das culturas e receba lembretes automáticos calculados para as épocas agrícolas de Inhambane.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                handleCropSelectChange(user.crop || 'Milho');
                setShowAddCycleModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Registar Novo Cultivo</span>
            </button>

            <button
              onClick={() => {
                if (cycles.length === 0) {
                  onShowToast('Registe primeiro uma parcela para agendar lembretes.', 'info');
                  return;
                }
                setSelectedCycleForReminder(cycles[0].id);
                setShowAddReminderModal(true);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>+ Lembrete</span>
            </button>

            <button
              onClick={handleEnableNotifications}
              title="Ativar Alertas Push no Navegador"
              className="p-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-200 border border-stone-700 transition-colors"
            >
              <Bell className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

        {/* 4 Quick Stat Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-stone-800/80">
          <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 backdrop-blur-xs">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Machambas Ativas</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-display text-xl sm:text-2xl font-bold text-emerald-400">{stats.activePlots}</span>
              <span className="text-xs text-stone-400">de {stats.totalPlots} registadas</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 backdrop-blur-xs">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Área Cultivada</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-display text-xl sm:text-2xl font-bold text-emerald-400">{stats.totalArea}</span>
              <span className="text-xs text-stone-400">hectares</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 backdrop-blur-xs">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Próxima Colheita</span>
            <div className="mt-1 truncate">
              {stats.nearestHarvest ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-xl sm:text-2xl font-bold text-amber-400">{stats.nearestHarvest.daysLeft}d</span>
                  <span className="text-xs text-stone-300 truncate">({stats.nearestHarvest.crop})</span>
                </div>
              ) : (
                <span className="text-xs text-stone-400">Sem colheitas próximas</span>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 backdrop-blur-xs">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Lembretes Pendentes</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-display text-xl sm:text-2xl font-bold text-amber-400">{stats.pendingReminders}</span>
              <span className="text-xs text-stone-400">ações técnicas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: View Switcher and Crop Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveView('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeView === 'timeline'
                ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-400 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Ciclos & Linha do Tempo</span>
          </button>

          <button
            onClick={() => setActiveView('calendar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeView === 'calendar'
                ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-400 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Calendário Mensal</span>
          </button>

          <button
            onClick={() => setActiveView('reminders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeView === 'reminders'
                ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-400 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Lembretes ({stats.pendingReminders})</span>
          </button>
        </div>

        {/* Crop Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-xs text-stone-500 font-medium hidden sm:inline">Filtrar Cultura:</span>
          <select
            value={selectedCropFilter}
            onChange={e => setSelectedCropFilter(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Todas as Culturas ({cycles.length})</option>
            {AVAILABLE_CROPS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW 1: TIMELINE & CYCLE PROGRESS */}
      {activeView === 'timeline' && (
        <div className="space-y-5">
          {filteredCycles.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
              <Sprout className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
              <h3 className="font-display text-base font-bold text-stone-800 dark:text-stone-200">
                Nenhum cultivo registado para esta seleção
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto mt-1 mb-4">
                Comece a registar a data de plantio das suas parcelas para acompanhar o progresso até à colheita e receber lembretes de adubação, sacha e colheita.
              </p>
              <button
                onClick={() => {
                  handleCropSelectChange(user.crop || 'Milho');
                  setShowAddCycleModal(true);
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Registar Primeiro Cultivo</span>
              </button>
            </div>
          ) : (
            filteredCycles.map(cycle => {
              const progress = CropCalendarService.calculateProgress(cycle.plantingDate, cycle.estimatedHarvestDate, cycle.actualHarvestDate);
              const plantingD = new Date(cycle.plantingDate);
              const harvestD = new Date(cycle.estimatedHarvestDate);
              const daysTotal = Math.max(1, Math.round((harvestD.getTime() - plantingD.getTime()) / (1000 * 60 * 60 * 24)));
              const daysElapsed = Math.max(0, Math.round((new Date().getTime() - plantingD.getTime()) / (1000 * 60 * 60 * 24)));
              const daysLeft = Math.max(0, daysTotal - daysElapsed);
              const nextPendingReminder = cycle.reminders.find(r => !r.completed);

              return (
                <div
                  key={cycle.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm transition-all hover:border-emerald-500/40"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                          <Sprout className="w-4 h-4 text-emerald-600" />
                          <span>{cycle.plotName}</span>
                        </span>
                        <span className="text-stone-300 dark:text-stone-700">·</span>
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          {cycle.crop} {cycle.variety ? `(${cycle.variety})` : ''}
                        </span>
                        {getStatusBadge(cycle.status)}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
                        <span>Área: <strong className="text-stone-700 dark:text-stone-300">{cycle.areaHectares} ha</strong></span>
                        {cycle.expectedYieldKg && (
                          <span>Estimativa: <strong className="text-stone-700 dark:text-stone-300">{cycle.expectedYieldKg} kg</strong></span>
                        )}
                        <span>Distrito: <strong className="text-stone-700 dark:text-stone-300">{user.zone}</strong></span>
                      </div>
                    </div>

                    {/* Action buttons on card */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {cycle.status !== 'colhido' && (
                        <button
                          onClick={() => handleMarkAsHarvested(cycle)}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Concluir Colheita</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedCycleForReminder(cycle.id);
                          setShowAddReminderModal(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 text-xs font-semibold transition-colors flex items-center gap-1"
                        title="Adicionar Lembrete"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Lembrete</span>
                      </button>

                      <button
                        onClick={() => handleDeleteCycle(cycle.id, cycle.plotName)}
                        className="p-1.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Remover cultivo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar & Key Milestone Dates */}
                  <div className="space-y-2 mt-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          Progresso do Ciclo: {progress}%
                        </span>
                        <span className="text-stone-400 text-[11px]">
                          ({cycle.status === 'colhido' ? 'Ciclo Concluído' : `${daysElapsed} dias decorridos · ${daysLeft} dias restantes`})
                        </span>
                      </div>

                      <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                        Duração Estimada: {daysTotal} dias
                      </span>
                    </div>

                    <div className="w-full h-3 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          cycle.status === 'colhido'
                            ? 'bg-stone-400 dark:bg-stone-500'
                            : progress > 80
                            ? 'bg-amber-500'
                            : 'bg-emerald-600'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-medium text-stone-500 dark:text-stone-400 pt-1">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        <span>Plantio: <strong>{new Date(cycle.plantingDate).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>Colheita: <strong>{new Date(cycle.estimatedHarvestDate).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Next Action / Priority Reminder */}
                  {nextPendingReminder && (
                    <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 shrink-0 mt-0.5">
                          {getReminderIcon(nextPendingReminder.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-950 dark:text-emerald-200">
                              Próxima Ação: {nextPendingReminder.title}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                              {new Date(nextPendingReminder.dueDate).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                            {nextPendingReminder.description}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleReminder(cycle.id, nextPendingReminder.id)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shrink-0 flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Marcar Feito</span>
                      </button>
                    </div>
                  )}

                  {/* Collapsible/Compact Milestones List */}
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2.5">
                      Marcos Automáticos Agendados ({cycle.reminders.filter(r => r.completed).length}/{cycle.reminders.length} concluídos)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {cycle.reminders.map(rem => (
                        <div
                          key={rem.id}
                          className={`p-2.5 rounded-xl border text-xs flex items-start justify-between gap-2 transition-all ${
                            rem.completed
                              ? 'bg-stone-50 dark:bg-stone-800/30 border-stone-200 dark:border-stone-800 text-stone-400'
                              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 shadow-xs'
                          }`}
                        >
                          <div className="flex items-start gap-2 overflow-hidden">
                            <button
                              onClick={() => handleToggleReminder(cycle.id, rem.id)}
                              className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                                rem.completed
                                  ? 'bg-emerald-600 text-white'
                                  : 'border border-stone-300 dark:border-stone-700 hover:border-emerald-600'
                              }`}
                              title={rem.completed ? 'Marcar como pendente' : 'Marcar como concluído'}
                            >
                              {rem.completed && <Check className="w-3 h-3" />}
                            </button>
                            <div className="truncate">
                              <p className={`font-semibold text-[11px] truncate ${rem.completed ? 'line-through text-stone-400' : ''}`}>
                                {rem.title}
                              </p>
                              <p className="text-[10px] text-stone-400">
                                {new Date(rem.dueDate).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short' })}
                              </p>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                            rem.priority === 'alta' ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300' : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                          }`}>
                            {rem.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: MONTHLY CALENDAR GRID */}
      {activeView === 'calendar' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <h3 className="font-display text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                {monthNames[month]} de {year}
              </h3>
              <button
                onClick={() => setCalendarDate(new Date())}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 transition-colors"
              >
                Hoje
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 transition-colors"
                aria-label="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 transition-colors"
                aria-label="Mês seguinte"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid Header */}
          <div className="grid grid-cols-7 text-center text-[11px] font-bold uppercase text-stone-400 py-1">
            <span>Dom</span>
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Empty slots for offset */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[70px] sm:min-h-[90px] rounded-xl bg-stone-50/50 dark:bg-stone-950/20 border border-transparent" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = new Date().toISOString().split('T')[0] === dayStr;
              const events = eventsByDate[dayStr] || [];

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => {
                    if (events.length > 0) {
                      setSelectedDayEvents({ date: dayStr, events });
                    }
                  }}
                  className={`min-h-[70px] sm:min-h-[90px] p-1.5 sm:p-2 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isToday
                      ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs'
                      : events.length > 0
                      ? 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-emerald-400'
                      : 'border-stone-100 dark:border-stone-800/60 bg-stone-50/30 dark:bg-stone-900/20 hover:bg-stone-100/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                      isToday ? 'bg-emerald-600 text-white' : 'text-stone-700 dark:text-stone-300'
                    }`}>
                      {dayNum}
                    </span>

                    {events.length > 0 && (
                      <span className="text-[10px] font-bold px-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {events.length}
                      </span>
                    )}
                  </div>

                  {/* Micro Event Badges on Day Card */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {events.slice(0, 2).map((ev, idx) => (
                      <div
                        key={idx}
                        className={`text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded truncate ${
                          ev.type === 'plantio'
                            ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                            : ev.type === 'colheita'
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-bold'
                            : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                        }`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <span className="text-[9px] text-stone-400 pl-1">+{events.length - 2} mais</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Data de Plantio</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Colheita Prevista</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-400" />
              <span>Lembrete Agronómico</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: DEDICATED REMINDERS MANAGER */}
      {activeView === 'reminders' && (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setReminderFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                reminderFilter === 'pending'
                  ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800'
              }`}
            >
              Pendentes ({allReminders.filter(r => !r.completed).length})
            </button>

            <button
              onClick={() => setReminderFilter('dueSoon')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                reminderFilter === 'dueSoon'
                  ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800'
              }`}
            >
              Próximos 7 Dias
            </button>

            <button
              onClick={() => setReminderFilter('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                reminderFilter === 'completed'
                  ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800'
              }`}
            >
              Concluídos ({allReminders.filter(r => r.completed).length})
            </button>

            <button
              onClick={() => setReminderFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                reminderFilter === 'all'
                  ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800'
              }`}
            >
              Todos ({allReminders.length})
            </button>
          </div>

          {/* Reminders List */}
          <div className="space-y-2.5">
            {displayedReminders.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-display text-sm font-bold text-stone-800 dark:text-stone-200">
                  Nenhum lembrete nesta categoria
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Todas as tarefas agronómicas agendadas estão em dia!
                </p>
              </div>
            ) : (
              displayedReminders.map(rem => {
                const today = new Date().toISOString().split('T')[0];
                const isOverdue = !rem.completed && rem.dueDate < today;
                const isToday = rem.dueDate === today;

                return (
                  <div
                    key={rem.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      rem.completed
                        ? 'bg-stone-50/70 dark:bg-stone-900/30 border-stone-200 dark:border-stone-800 opacity-70'
                        : isOverdue
                        ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                        : isToday
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 shadow-xs'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleReminder(rem.cycleId, rem.id)}
                        className={`w-5 h-5 rounded-lg mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                          rem.completed
                            ? 'bg-emerald-600 text-white'
                            : 'border-2 border-stone-300 dark:border-stone-700 hover:border-emerald-600'
                        }`}
                        title={rem.completed ? 'Marcar como pendente' : 'Marcar como concluído'}
                      >
                        {rem.completed && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100 ${
                            rem.completed ? 'line-through text-stone-400' : ''
                          }`}>
                            {rem.title}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                            · {rem.plotName} ({rem.crop})
                          </span>
                          {isOverdue && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                              Atrasado
                            </span>
                          )}
                          {isToday && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              Hoje
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                          {rem.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                      <div className="text-right">
                        <span className="font-mono text-xs font-semibold text-stone-700 dark:text-stone-300 block">
                          {new Date(rem.dueDate).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-stone-400">
                          Prioridade {rem.priority}
                        </span>
                      </div>

                      <button
                        onClick={() => handleToggleReminder(rem.cycleId, rem.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 ${
                          rem.completed
                            ? 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                            : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        }`}
                      >
                        {rem.completed ? 'Reabrir' : 'Concluir'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD NEW CROP CYCLE */}
      {showAddCycleModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-xl w-full p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
                    Registar Novo Cultivo / Machamba
                  </h3>
                  <p className="text-xs text-stone-500">
                    Defina a cultura e a data de plantio para gerar o calendário automático.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddCycleModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 flex items-center justify-center"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateCycleSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                    Cultura Principal *
                  </label>
                  <select
                    value={formCrop}
                    onChange={e => handleCropSelectChange(e.target.value as CropType)}
                    className="w-full py-2.5 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
                    required
                  >
                    {AVAILABLE_CROPS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                    Nome da Machamba / Parcela *
                  </label>
                  <input
                    type="text"
                    value={formPlotName}
                    onChange={e => setFormPlotName(e.target.value)}
                    placeholder="Ex: Parcela do Rio Homoíne"
                    className="w-full py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                    Variedade da Semente
                  </label>
                  <input
                    type="text"
                    value={formVariety}
                    onChange={e => setFormVariety(e.target.value)}
                    placeholder="Ex: Matuba, Chingoma, Local"
                    className="w-full py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                    Área Cultivada (Hectares)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formArea}
                    onChange={e => setFormArea(Number(e.target.value))}
                    className="w-full py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                    Data Oficial de Plantio *
                  </label>
                  <input
                    type="date"
                    value={formPlantingDate}
                    onChange={e => setFormPlantingDate(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                    Duração Estimada do Ciclo (Dias)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="450"
                    value={formDurationDays}
                    onChange={e => setFormDurationDays(Number(e.target.value))}
                    className="w-full py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              {/* Automatic Calculation Preview */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 tracking-wider">
                    Data Estimada de Início da Colheita
                  </span>
                  <p className="font-display text-sm font-bold text-emerald-950 dark:text-emerald-200">
                    {new Date(CropCalendarService.calculateHarvestDate(formPlantingDate, formDurationDays)).toLocaleDateString('pt-MZ', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200">
                  {CROP_CONFIGS[formCrop]?.stages.length || 4} lembretes automáticos
                </span>
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                  Observações & Práticas de Maneio (Opcional)
                </label>
                <textarea
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="Ex: Aplicação de mulching, consorciação com feijão nhemba, rega gota-a-gota..."
                  className="w-full py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 resize-none"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddCycleModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs"
                >
                  Criar Cultivo & Gerar Lembretes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD CUSTOM REMINDER */}
      {showAddReminderModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-md w-full p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Adicionar Lembrete Agrícola</span>
              </h3>
              <button
                onClick={() => setShowAddReminderModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 flex items-center justify-center"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddCustomReminderSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                  Machamba / Parcela *
                </label>
                <select
                  value={selectedCycleForReminder}
                  onChange={e => setSelectedCycleForReminder(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
                  required
                >
                  {cycles.map(c => (
                    <option key={c.id} value={c.id}>{c.plotName} ({c.crop})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                  Título da Ação Agronómica *
                </label>
                <input
                  type="text"
                  value={remTitle}
                  onChange={e => setRemTitle(e.target.value)}
                  placeholder="Ex: 2ª Adubação de Cobertura, Aplicação de Calda Bordalesa"
                  className="w-full py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                    Data Prevista *
                  </label>
                  <input
                    type="date"
                    value={remDate}
                    onChange={e => setRemDate(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                    Tipo de Maneio
                  </label>
                  <select
                    value={remType}
                    onChange={e => setRemType(e.target.value as CropReminderType)}
                    className="w-full py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    <option value="sacha">Sacha & Desbaste</option>
                    <option value="adubacao">Adubação & Composto</option>
                    <option value="rega">Rega & Água</option>
                    <option value="fitossanitario">Fitossanitário & Pragas</option>
                    <option value="colheita">Colheita</option>
                    <option value="pos-colheita">Pós-Colheita & Secagem</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                  Prioridade
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['baixa', 'media', 'alta'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setRemPriority(p)}
                      className={`py-1.5 rounded-xl capitalize font-semibold transition-colors ${
                        remPriority === p
                          ? 'bg-emerald-700 text-white'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                  Instruções / Detalhes
                </label>
                <textarea
                  value={remDesc}
                  onChange={e => setRemDesc(e.target.value)}
                  rows={2}
                  placeholder="Ex: Pulverizar ao início da manhã; verificar presença de pulgões..."
                  className="w-full py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 resize-none"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddReminderModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs"
                >
                  Guardar Lembrete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DAY EVENTS POPUP (CALENDAR VIEW CLICK) */}
      {selectedDayEvents && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-sm w-full p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Atividades do Dia</span>
                <h4 className="font-display text-sm font-bold text-stone-900 dark:text-stone-100">
                  {new Date(selectedDayEvents.date).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' })}
                </h4>
              </div>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-900 flex items-center justify-center"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 mt-3 text-xs max-h-60 overflow-y-auto">
              {selectedDayEvents.events.map((ev, i) => (
                <div key={i} className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-stone-900 dark:text-stone-100">{ev.title}</p>
                    <p className="text-[11px] text-stone-500">{ev.cycleName}</p>
                  </div>
                  {ev.id && ev.cycleId && (
                    <button
                      onClick={() => {
                        handleToggleReminder(ev.cycleId!, ev.id!);
                        setSelectedDayEvents(null);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                        ev.completed ? 'bg-stone-200 text-stone-600' : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {ev.completed ? 'Feito' : 'Concluir'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
