
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { ProductionPlan, ProductionItem } from '../types';
import { 
  ChevronRight, 
  ChevronLeft, 
  Info, 
  Calendar as CalendarIcon, 
  Inbox, 
  ChevronDown, 
  ChevronUp,
  Box,
  Hash,
  Factory,
  Search,
  Plus,
  AlertTriangle,
  CalendarDays
} from 'lucide-react';

interface Props {
  plans: ProductionPlan[];
  productionData: ProductionItem[];
  onPlanItem: (item: ProductionItem) => void;
  darkMode: boolean;
}

const COLUMN_WIDTH = 60; 
const BAR_HEIGHT = 28; // Altura da barra
const BAR_GAP = 8;     // Espaço entre barras verticais
const MIN_ROW_HEIGHT = 64; // Altura mínima da linha
const LEAD_TIME_DAYS = 2; // Dias de Lead Time

const GanttChart: React.FC<Props> = ({ plans, productionData, onPlanItem, darkMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBacklogOpen, setIsBacklogOpen] = useState(false);
  const [backlogSearch, setBacklogSearch] = useState('');

  const parseDate = (dateStr: string) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  // Função auxiliar para calcular início e fim baseado no Lead Time
  const getPlanDates = (plan: ProductionPlan) => {
    const end = parseDate(plan.Nova_Data || plan.Replanejamento);
    if (!end) return null;
    
    // Clona a data final e subtrai o lead time
    const start = new Date(end);
    start.setDate(end.getDate() - LEAD_TIME_DAYS);
    
    return { start, end };
  };

  const backlog = useMemo(() => {
    let items = productionData.filter(item => 
      !plans.some(plan => plan.Maquina === item.Maquina && plan.Serie === item.Serie)
    );
    if (backlogSearch) {
      const lowTerm = backlogSearch.toLowerCase();
      items = items.filter(i => 
        i.Maquina.toLowerCase().includes(lowTerm) || 
        i.Serie.toLowerCase().includes(lowTerm) ||
        (i.Item || '').toLowerCase().includes(lowTerm)
      );
    }
    return items;
  }, [productionData, plans, backlogSearch]);

  const timelineRange = useMemo(() => {
    if (plans.length === 0) return null;
    let min = new Date(2099, 0, 1);
    let max = new Date(2000, 0, 1);
    
    plans.forEach(p => {
      const dates = getPlanDates(p);
      if (dates) {
        if (dates.start < min) min = dates.start;
        if (dates.end > max) max = dates.end;
      }
    });

    if (min.getFullYear() === 2099) min = new Date();
    
    // Adiciona uma margem visual
    min.setDate(min.getDate() - 2);
    max.setDate(max.getDate() + 5);

    const dates = [];
    const current = new Date(min);
    while (current <= max) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return { dates, min, max };
  }, [plans]);

  const groupedRows = useMemo(() => {
    const groups: Record<string, ProductionPlan[]> = {};
    plans.forEach(p => {
      if (!groups[p.Maquina]) groups[p.Maquina] = [];
      groups[p.Maquina].push(p);
    });
    return Object.entries(groups).sort();
  }, [plans]);

  // Efeito para scroll suave até o dia atual no carregamento
  useEffect(() => {
    if (containerRef.current && timelineRange) {
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - timelineRange.min.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        containerRef.current.scrollTo({
          left: (diffDays - 2) * COLUMN_WIDTH,
          behavior: 'smooth'
        });
      }
    }
  }, [timelineRange]);

  // Efeito para navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (containerRef.current) {
        if (e.key === 'ArrowRight') {
          containerRef.current.scrollBy({ left: COLUMN_WIDTH * 2, behavior: 'smooth' });
        } else if (e.key === 'ArrowLeft') {
          containerRef.current.scrollBy({ left: -COLUMN_WIDTH * 2, behavior: 'smooth' });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getDayPosition = (date: Date) => {
    if (!timelineRange) return 0;
    const diffTime = date.getTime() - timelineRange.min.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="flex flex-col gap-8">
      <div className={`border rounded-3xl sm:rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'}`}>
        <div className={`px-6 sm:px-10 py-4 sm:py-5 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex flex-wrap items-center gap-4 sm:gap-10">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-slate-400" />
              <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Fluxo Temporal:</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-2 text-amber-600">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></div> Agendado
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></div> Concluído
              </div>
              <div className="flex items-center gap-2 text-rose-600">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></div> Atrasado
              </div>
              <div className="flex items-center gap-2 text-rose-500 animate-pulse">
                <AlertTriangle size={12} /> Material Faltante
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
             <button onClick={() => containerRef.current?.scrollBy({left: -300, behavior: 'smooth'})} className={`p-2 rounded-xl border shadow-sm transition-all ${darkMode ? 'hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'hover:bg-white border-transparent hover:border-slate-200'}`} title="Scroll Esquerda (←)"><ChevronLeft size={20} /></button>
             <button onClick={() => containerRef.current?.scrollBy({left: 300, behavior: 'smooth'})} className={`p-2 rounded-xl border shadow-sm transition-all ${darkMode ? 'hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'hover:bg-white border-transparent hover:border-slate-200'}`} title="Scroll Direita (→)"><ChevronRight size={20} /></button>
          </div>
        </div>

        {timelineRange ? (
          <div className="flex relative h-[400px] sm:h-[600px]">
            {/* Coluna Esquerda: Máquinas */}
            <div className={`w-40 sm:w-56 border-r z-30 flex flex-col pt-[52px] shrink-0 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              {groupedRows.map(([machine, machinePlans]) => {
                // Calcula altura dinâmica baseada no número de planos + padding
                const rowHeight = Math.max(MIN_ROW_HEIGHT, machinePlans.length * (BAR_HEIGHT + BAR_GAP) + 24);
                
                return (
                  <div 
                    key={machine} 
                    style={{ height: rowHeight }}
                    className={`flex items-start pt-4 px-4 sm:px-8 border-b transition-colors group ${darkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-50 hover:bg-slate-50'}`}
                  >
                    <span className={`text-[9px] sm:text-[10px] font-black uppercase truncate tracking-tight sticky top-4 ${darkMode ? 'text-slate-200' : 'text-slate-900'}`} title={machine}>
                      {machine}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Coluna Direita: Barras de Gantt */}
            <div ref={containerRef} className="flex-1 overflow-auto relative custom-scrollbar select-none">
              <div className="relative" style={{ width: timelineRange.dates.length * COLUMN_WIDTH, height: '100%' }}>
                <div className={`sticky top-0 z-20 flex border-b h-[52px] ${darkMode ? 'bg-slate-900/80 backdrop-blur-md border-slate-800' : 'bg-white/80 backdrop-blur-md border-slate-100'}`}>
                  {timelineRange.dates.map((date, i) => {
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    return (
                      <div key={i} className={`shrink-0 flex flex-col items-center justify-center border-r text-center ${isWeekend ? (darkMode ? 'bg-slate-800/40' : 'bg-slate-50/50') : ''} ${isToday ? (darkMode ? 'bg-yellow-500/20' : 'bg-yellow-500/10') : (darkMode ? 'border-slate-800' : 'border-slate-50')}`} style={{ width: COLUMN_WIDTH }}>
                        <span className={`text-[7px] sm:text-[8px] font-black uppercase tracking-widest ${isToday ? 'text-yellow-600' : 'text-slate-400'}`}>
                          {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                        </span>
                        <span className={`text-[10px] sm:text-[12px] font-black ${isToday ? 'text-yellow-600' : (darkMode ? 'text-white' : 'text-slate-900')}`}>{date.getDate()}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="relative z-10 pt-[52px]">
                  {groupedRows.map(([machine, machinePlans]) => {
                    const rowHeight = Math.max(MIN_ROW_HEIGHT, machinePlans.length * (BAR_HEIGHT + BAR_GAP) + 24);

                    return (
                      <div key={machine} style={{ height: rowHeight }} className={`border-b relative group ${darkMode ? 'border-slate-800' : 'border-slate-50'}`}>
                        {machinePlans.map((plan, index) => {
                          const dates = getPlanDates(plan);
                          if (!dates) return null;

                          const startPos = getDayPosition(dates.start);
                          const endPos = getDayPosition(dates.end);
                          const width = Math.max(1, endPos - startPos + 1) * COLUMN_WIDTH;
                          
                          // Cálculo da posição vertical para empilhar (stack)
                          const topPos = 12 + (index * (BAR_HEIGHT + BAR_GAP));

                          const isToday = new Date();
                          isToday.setHours(0,0,0,0);
                          const isDelayed = plan.Status !== 'Concluído' && dates.end < isToday;
                          const hasMaterialIssue = plan.MaterialStatus === 'Faltante';

                          let bgColor = 'bg-amber-500';
                          let borderColor = 'border-amber-600';
                          if (plan.Status === 'Concluído') {
                            bgColor = 'bg-emerald-500';
                            borderColor = 'border-emerald-600';
                          } else if (isDelayed) {
                            bgColor = 'bg-rose-500';
                            borderColor = 'border-rose-600';
                          }

                          return (
                            <div 
                              key={plan.id}
                              className={`absolute rounded-xl border shadow-lg transition-all hover:scale-[1.03] hover:z-20 flex items-center px-3 sm:px-4 cursor-pointer group/bar ${bgColor} ${borderColor} ${isDelayed ? 'animate-pulse' : ''} ${hasMaterialIssue ? (darkMode ? 'ring-2 ring-rose-500 ring-offset-slate-900' : 'ring-2 ring-rose-500 ring-offset-2') : ''}`}
                              style={{ 
                                left: startPos * COLUMN_WIDTH + 6, 
                                width: width - 12,
                                height: BAR_HEIGHT,
                                top: topPos
                              }}
                            >
                              <span className="text-[7px] sm:text-[8px] font-black text-white uppercase truncate whitespace-nowrap tracking-widest flex items-center gap-2">
                                {hasMaterialIssue && <AlertTriangle size={10} />}
                                {plan.Componente}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={`p-20 text-center flex flex-col items-center justify-center transition-colors ${darkMode ? 'bg-slate-900 text-slate-600' : 'bg-white text-slate-400'}`}>
            <CalendarIcon size={40} className={`mb-4 ${darkMode ? 'text-slate-800' : 'text-slate-100'}`} />
            <p className="font-black uppercase tracking-tighter text-slate-300">Nenhum plano para exibir</p>
          </div>
        )}
      </div>

      <div className={`border rounded-3xl sm:rounded-[2.5rem] shadow-xl transition-colors ${darkMode ? 'bg-slate-900 border-slate-800 shadow-slate-950/50' : 'bg-white border-slate-200 shadow-slate-200/50'}`}>
        <div 
          className={`w-full px-6 sm:px-10 py-6 sm:py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 cursor-pointer transition-colors ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}
          onClick={() => setIsBacklogOpen(!isBacklogOpen)}
        >
          <div className="flex items-center gap-4 sm:gap-6">
            <div className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl transition-all ${backlog.length > 0 ? (darkMode ? 'bg-[#FFCC00] text-slate-950' : 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20') : (darkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400')}`}>
              <Inbox size={22} strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <h3 className={`text-lg sm:text-xl font-black uppercase tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>Fila de Produção (Backlog)</h3>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                {backlog.length} Componentes em aguardo de agendamento
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto" onClick={(e) => e.stopPropagation()}>
            {isBacklogOpen && (
              <div className="relative flex-1 md:w-64">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filtrar backlog..."
                  value={backlogSearch}
                  onChange={(e) => setBacklogSearch(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border-none rounded-2xl text-[10px] font-bold focus:ring-2 focus:ring-yellow-500/20 outline-none ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}
                />
              </div>
            )}
            <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-transform duration-300 ${darkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-500'}`}>
              {isBacklogOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
        </div>

        {isBacklogOpen && (
          <div className="px-6 sm:px-10 pb-10 pt-2 animate-in slide-in-from-top-4 duration-300">
            {backlog.length === 0 ? (
              <div className={`py-16 text-center rounded-[2rem] border-2 border-dashed ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px] sm:text-[10px]">Backlog vazio ou termo de busca não encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                {backlog.map(item => (
                  <div key={item.id} onClick={() => onPlanItem(item)} className={`p-4 border rounded-2xl sm:rounded-3xl hover:border-yellow-500 hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                         <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${darkMode ? 'bg-slate-800 text-slate-500 group-hover:text-yellow-500' : 'bg-slate-50 text-slate-400 group-hover:text-yellow-600'}`}>
                           <Box size={14} />
                         </div>
                         <span className={`text-[10px] font-black uppercase tracking-tighter truncate max-w-[100px] ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.Maquina}</span>
                      </div>
                      <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${darkMode ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/10'}`}>Backlog</span>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center justify-between">
                         <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Série:</span>
                         <span className={`text-[9px] font-mono font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{item.Serie}</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Entrada:</span>
                         <span className={`text-[9px] font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{item.Line_ON}</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Replan.:</span>
                         <span className={`text-[9px] font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{item.Replanejamento || '-'}</span>
                      </div>
                    </div>
                    <div className={`pt-2 border-t flex items-center justify-between ${darkMode ? 'border-slate-700' : 'border-slate-50'}`}>
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">{item.Item || 'Indefinido'}</span>
                       <button className="p-1.5 text-slate-300 group-hover:text-yellow-600 transition-colors">
                          <Plus size={14} strokeWidth={3} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GanttChart;
