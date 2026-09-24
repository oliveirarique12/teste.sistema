
import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { ProductionPlan } from '../types';
import { 
  FileText, 
  Filter, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search,
  Hash,
  X,
  Pencil,
  RotateCcw,
  CalendarDays
} from 'lucide-react';

interface Props {
  plans: ProductionPlan[];
  darkMode: boolean;
  onUpdateStatus: (id: string, currentStatus: 'Pendente' | 'Concluído') => void;
  onEdit: (plan: ProductionPlan) => void;
}

const ProductionReport: React.FC<Props> = ({ plans, darkMode, onUpdateStatus, onEdit }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [materialFilter, setMaterialFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlans = useMemo(() => {
    return plans.filter(plan => {
      // Filtro de Texto
      const matchesSearch = 
        plan.Maquina.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.Serie.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.Componente.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de Status
      const matchesStatus = 
        statusFilter === 'all' ? true :
        statusFilter === 'concluido' ? plan.Status === 'Concluído' :
        statusFilter === 'pendente' ? plan.Status === 'Pendente' : true;

      // Filtro de Material
      const matchesMaterial = 
        materialFilter === 'all' ? true :
        materialFilter === 'faltante' ? plan.MaterialStatus === 'Faltante' :
        materialFilter === 'disponivel' ? plan.MaterialStatus !== 'Faltante' : true;

      return matchesSearch && matchesStatus && matchesMaterial;
    });
  }, [plans, statusFilter, materialFilter, searchTerm]);

  const handleExportExcel = () => {
    const exportData = filteredPlans.map(p => ({
      'Máquina': p.Maquina,
      'Série': p.Serie,
      'Componente': p.Componente,
      'Status Produção': p.Status,
      'Status Material': p.MaterialStatus,
      'Replanejamento Base': p.Replanejamento || '-',
      'Data Prevista': p.Nova_Data,
      'Observações': p.Observacao || '',
      'Data Conclusão': p.Data_Atualizacao || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório Filtrado");
    XLSX.writeFile(wb, `Relatorio_Producao_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const inputClasses = `px-4 py-2.5 rounded-xl border text-xs font-bold outline-none focus:border-yellow-500 transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`;
  const labelClasses = `text-[9px] font-black uppercase tracking-widest mb-2 block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header e Filtros */}
      <div className={`p-6 rounded-[2rem] border shadow-sm transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h2 className={`text-xl font-black uppercase tracking-tighter flex items-center gap-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              <FileText className="text-yellow-500" /> Relatório de Planejamento
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {filteredPlans.length} registros encontrados
            </p>
          </div>
          <div className="flex gap-3 print:hidden">
            <button 
              onClick={handlePrint}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${darkMode ? 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <Printer size={16} /> Imprimir
            </button>
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
            >
              <Download size={16} /> Exportar Excel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
          <div>
            <label className={labelClasses}>Busca Rápida</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Máquina, Série ou Componente..."
                className={`w-full pl-9 ${inputClasses}`}
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Status da Produção</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full ${inputClasses} appearance-none`}
            >
              <option value="all">Todos os Status</option>
              <option value="concluido">✅ Concluídos</option>
              <option value="pendente">⏳ Pendentes</option>
            </select>
          </div>

          <div>
            <label className={labelClasses}>Status de Material</label>
            <select 
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              className={`w-full ${inputClasses} appearance-none`}
            >
              <option value="all">Qualquer Situação</option>
              <option value="disponivel">📦 Material Disponível</option>
              <option value="faltante">⚠️ Material Faltante</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={() => { setStatusFilter('all'); setMaterialFilter('all'); setSearchTerm(''); }}
              className={`w-full px-4 py-2.5 rounded-xl border border-dashed font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${darkMode ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800' : 'border-slate-300 text-slate-500 hover:bg-slate-50'}`}
            >
              <X size={14} /> Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Relatório */}
      <div className={`rounded-[2rem] border overflow-hidden shadow-xl print:shadow-none print:border-none ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-[9px] font-black uppercase tracking-widest border-b ${darkMode ? 'bg-slate-950/50 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                <th className="px-6 py-4">Equipamento</th>
                <th className="px-6 py-4">Componente</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Material</th>
                <th className="px-6 py-4">Replanejamento</th>
                <th className="px-6 py-4">Data Prevista</th>
                <th className="px-6 py-4">Observação</th>
                <th className="px-6 py-4 text-right print:hidden">Ações</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {filteredPlans.length > 0 ? (
                filteredPlans.map((plan) => (
                  <tr key={plan.id} className={`group ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4">
                      <div className={`font-black text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>{plan.Maquina}</div>
                      <div className="flex items-center gap-1 mt-1 text-slate-400">
                        <Hash size={10} />
                        <span className="text-[10px] font-mono">{plan.Serie}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{plan.Componente}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${
                        plan.Status === 'Concluído' 
                          ? (darkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100')
                          : (darkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-100')
                      }`}>
                        {plan.Status === 'Concluído' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {plan.Status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {plan.MaterialStatus === 'Faltante' ? (
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${darkMode ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                          <AlertTriangle size={12} /> Faltante
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Disponível</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                       <span className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{plan.Replanejamento || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{plan.Nova_Data}</div>
                      <div className="text-[9px] text-slate-400 font-medium">{plan.Nova_Hora}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-[10px] text-slate-500 italic truncate" title={plan.Observacao}>{plan.Observacao || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-right print:hidden">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onUpdateStatus(plan.id, plan.Status)}
                          title={plan.Status === 'Pendente' ? "Concluir" : "Reabrir"}
                          className={`p-2 rounded-xl transition-all ${
                            plan.Status === 'Pendente' 
                              ? (darkMode ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white')
                              : (darkMode ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white' : 'bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white')
                          }`}
                        >
                           {plan.Status === 'Pendente' ? <CheckCircle2 size={16} /> : <RotateCcw size={16} />}
                        </button>
                        <button 
                          onClick={() => onEdit(plan)}
                          title="Editar"
                          className={`p-2 rounded-xl border transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-900'}`}
                        >
                           <Pencil size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nenhum registro encontrado com os filtros selecionados</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductionReport;
