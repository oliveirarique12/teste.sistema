import React from 'react';
import { Edit3, CheckCircle2, Clock, AlertTriangle, Layers, Bot, Hammer, Flame } from 'lucide-react';
import { ProductionItem, ProductionPlan } from './types';

interface ProductionTableProps {
  darkMode: boolean;
  data: ProductionItem[];
  plans: ProductionPlan[];
  onPlanItem: (item: ProductionItem) => void;
}

export const ProductionTable: React.FC<ProductionTableProps> = ({
  darkMode,
  data,
  plans,
  onPlanItem
}) => {

  const getProcessBadge = (process?: string) => {
    if (!process) return <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">-</span>;
    
    switch (process) {
      case 'TW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Hammer size={10} /> TW
          </span>
        );
      case 'SAW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame size={10} /> SAW
          </span>
        );
      case 'RAW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Bot size={10} /> RAW (Robô)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className={`border-b text-[10px] font-black uppercase tracking-widest ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
            <th className="p-4">Item</th>
            <th className="p-4">Máquina</th>
            <th className="p-4">Série</th>
            <th className="p-4 text-center">Posto Operacional</th>
            <th className="p-4">Subconjunto</th>
            <th className="p-4 text-center">Material</th>
            <th className="p-4 text-center">Status</th>
            <th className="p-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className={`divide-y text-xs font-bold ${darkMode ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
          {data.length === 0 ? (
            <tr>
              <td colSpan={8} className="p-8 text-center text-slate-500 uppercase text-[10px] tracking-wider">
                Nenhuma máquina encontrada com os filtros aplicados
              </td>
            </tr>
          ) : (
            data.map((item) => {
              // Encontra se essa peça já tem um apontamento salvo
              const plan = plans.find(p => p.Maquina === item.Maquina && p.Serie === item.Serie);

              return (
                <tr key={item.id} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                  <td className="p-4 text-slate-500 font-mono text-[11px]">{item.Item || '---'}</td>
                  <td className={`p-4 font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.Maquina}</td>
                  <td className="p-4 font-mono text-yellow-600">#{item.Serie}</td>
                  
                  {/* COLUNA DO POSTO (TW, SAW, RAW) */}
                  <td className="p-4 text-center">{getProcessBadge(plan?.Processo)}</td>
                  
                  {/* COLUNA DO SUBCONJUNTO DO MAINFRAME */}
                  <td className="p-4">
                    {plan?.SubComponente ? (
                      <span className="text-[10px] uppercase tracking-tight font-black text-slate-400 flex items-center gap-1">
                        <Layers size={10} className="text-yellow-500" /> {plan.SubComponente}
                      </span>
                    ) : (
                      <span className="text-slate-600 font-normal">---</span>
                    )}
                  </td>

                  {/* COLUNA DO MATERIAL */}
                  <td className="p-4 text-center">
                    {plan?.MaterialStatus === 'Faltante' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <AlertTriangle size={10} /> FALTA
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        OK
                      </span>
                    )}
                  </td>

                  {/* COLUNA DO STATUS GERAL */}
                  <td className="p-4 text-center">
                    {plan?.Status === 'Concluído' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[9px] font-black bg-emerald-500 text-slate-950 uppercase tracking-wider">
                        <CheckCircle2 size={10} /> Concluído
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[9px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                        <Clock size={10} /> Em Linha
                      </span>
                    )}
                  </td>

                  {/* BOTÃO DE APONTAR / EDITAR */}
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onPlanItem(item)}
                      className={`p-2 rounded-xl border transition-all active:scale-95 flex items-center gap-1.5 ml-auto text-[10px] font-black uppercase tracking-wider ${
                        darkMode 
                          ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-yellow-500 hover:text-yellow-500' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-yellow-500 hover:text-yellow-500 shadow-sm'
                      }`}
                    >
                      <Edit3 size={12} />
                      <span>Apontar</span>
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductionTable;
