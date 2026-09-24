
import React from 'react';
import { ProductionItem, ProductionPlan } from '../types';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ClipboardList, 
  Info,
  Timer,
  Factory,
  Plus,
  AlertTriangle,
  CalendarDays
} from 'lucide-react';

interface Props {
  data: ProductionItem[];
  plans: ProductionPlan[];
  onPlanItem: (item: ProductionItem) => void;
  darkMode: boolean;
}

const ProductionTable: React.FC<Props> = ({ data, plans, onPlanItem, darkMode }) => {
  const getStatus = (item: ProductionItem) => {
    // Busca TODOS os planos para esta máquina/série
    const itemPlans = plans.filter(p => p.Maquina === item.Maquina && p.Serie === item.Serie);
    
    if (itemPlans.length === 0) return { label: 'Em Linha', color: darkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-100', icon: <Timer />, pulse: false };

    // Lógica de Prioridade:
    // 1. Se houver qualquer componente ATRASADO (planejado e não concluído, data passada)
    const isAnyDelayed = itemPlans.some(p => {
        const dateStr = p.Nova_Data || item.Replanejamento;
        if (!dateStr) return false;
        const [day, month, year] = dateStr.split('/').map(Number);
        const plannedDate = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return p.Status !== 'Concluído' && plannedDate < today;
    });
    if (isAnyDelayed) return { label: 'Atrasado', color: darkMode ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-600 border-rose-100', icon: <AlertCircle />, pulse: true };

    // 2. Se houver qualquer componente PENDENTE
    const isAnyPending = itemPlans.some(p => p.Status === 'Pendente');
    if (isAnyPending) return { label: 'Agendado', color: darkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-100', icon: <Clock />, pulse: false };

    // 3. Se todos estiverem CONCLUÍDOS
    return { label: 'Concluído', color: darkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <CheckCircle2 />, pulse: false };
  };

  const getDisplayDate = (item: ProductionItem) => {
    const itemPlans = plans.filter(p => p.Maquina === item.Maquina && p.Serie === item.Serie);
    if (itemPlans.length === 0) return item.Replanejamento || '--';

    // Se houver múltiplos planos, mostrar a data do mais crítico (Atrasado ou Pendente mais próximo)
    // Ordenar por data
    const sortedPlans = [...itemPlans].sort((a, b) => {
        const dateA = a.Nova_Data ? a.Nova_Data.split('/').reverse().join('') : '99999999';
        const dateB = b.Nova_Data ? b.Nova_Data.split('/').reverse().join('') : '99999999';
        return dateA.localeCompare(dateB);
    });

    // Tenta achar o primeiro não concluído
    const activePlan = sortedPlans.find(p => p.Status !== 'Concluído');
    
    // Se todos concluídos, mostra a data do último
    const displayPlan = activePlan || sortedPlans[sortedPlans.length - 1];
    return displayPlan.Nova_Data;
  };

  if (data.length === 0) {
    return (
      <div className={`py-24 px-6 text-center flex flex-col items-center justify-center transition-colors ${darkMode ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-400'}`}>
        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center mb-6 border shadow-inner ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-600' : 'bg-slate-50 border-slate-100 text-slate-200'}`}>
          <Factory size={32} />
        </div>
        <p className={`font-black text-lg uppercase tracking-tighter ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Nenhuma Máquina Importada</p>
        <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-60">Utilize o botão "Importar Base" para carregar os dados</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col transition-colors ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
      <div className={`px-6 sm:px-10 py-4 border-b flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
        <div className="flex flex-wrap items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2">
            <Info size={12} className="text-slate-400" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Legenda:</span>
          </div>
          {[
            { label: 'Em Linha', color: 'text-blue-600' },
            { label: 'Agendado', color: 'text-amber-600' },
            { label: 'Concluído', color: 'text-emerald-600' },
            { label: 'Atrasado', color: 'text-rose-600', pulse: true }
          ].map((st, i) => (
            <div key={i} className={`flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest ${st.color}`}>
              <div className={`w-1.5 h-1.5 rounded-full bg-current ${st.pulse ? 'animate-ping' : ''}`}></div>
              {st.label}
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-rose-500 animate-pulse">
             <AlertTriangle size={12} /> Impacto Material
          </div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left whitespace-nowrap border-collapse min-w-[900px]">
          <thead>
            <tr className={`uppercase text-[9px] font-black tracking-[0.2em] border-b ${darkMode ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-100'}`}>
              <th className="px-8 py-6 text-center w-24">Status</th>
              <th className="px-6 py-6">Equipamento / Modelo</th>
              <th className="px-6 py-6">Entrada</th>
              <th className="px-6 py-6">Replan.</th>
              <th className="px-6 py-6">Nº Série</th>
              <th className="px-6 py-6">Previsão</th>
              <th className="px-8 py-6 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-50'}`}>
            {data.map((item) => {
              const status = getStatus(item);
              const itemPlans = plans.filter(p => p.Maquina === item.Maquina && p.Serie === item.Serie);
              const hasMaterialIssue = itemPlans.some(p => p.MaterialStatus === 'Faltante');
              const displayDate = getDisplayDate(item);

              return (
                <tr 
                  key={item.id} 
                  onClick={() => onPlanItem(item)}
                  className={`transition-all group cursor-pointer ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'} ${hasMaterialIssue ? (darkMode ? 'bg-rose-500/5' : 'bg-rose-50/20') : ''}`}
                >
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all group-hover:scale-110 ${status.color}`}>
                        {React.cloneElement(status.icon as React.ReactElement<any>, { size: 18, strokeWidth: 2.5 })}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <div className={`font-black text-sm tracking-tighter group-hover:text-yellow-600 transition-colors ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.Maquina}</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.Item || 'Geral'}</div>
                      </div>
                      {hasMaterialIssue && (
                        <div className="p-1.5 bg-rose-500 text-white rounded-lg animate-pulse" title="Existe componente com falta de material">
                          <AlertTriangle size={14} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.Line_ON}</span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={12} className="text-slate-400" />
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{item.Replanejamento || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <code className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest ${darkMode ? 'bg-slate-800 text-yellow-500' : 'bg-slate-900 text-[#FFCC00]'}`}>{item.Serie}</code>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-xs ${status.label === 'Atrasado' ? 'text-rose-600' : (darkMode ? 'text-slate-300' : 'text-slate-700')}`}>
                        {displayDate}
                      </span>
                      {itemPlans.length > 1 && (
                         <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-200 text-slate-600" title={`${itemPlans.length} componentes planejados`}>+{itemPlans.length - 1}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className={`p-2 rounded-lg transition-all ${darkMode ? 'bg-slate-800 text-slate-500 group-hover:bg-yellow-500 group-hover:text-black' : 'bg-slate-100 text-slate-400 group-hover:bg-yellow-500 group-hover:text-black'}`}>
                      <Plus size={16} strokeWidth={3} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductionTable;
