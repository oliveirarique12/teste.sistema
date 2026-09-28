
import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileUp, 
  LayoutDashboard, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Download, 
  Search, 
  ChevronRight, 
  ClipboardList, 
  Box, 
  X, 
  RotateCcw, 
  CalendarDays, 
  Table as TableIcon, 
  Plus, 
  ArrowUpRight, 
  TrendingUp, 
  AlertTriangle, 
  Factory, 
  Menu, 
  FileSpreadsheet, 
  AlertCircle, 
  PackageSearch, 
  CheckCircle, 
  ArrowLeft, 
  Pencil, 
  Hash, 
  Sun, 
  Moon, 
  FileText,
  LogOut,
  Shield,
  User as UserIcon
} from 'lucide-react';
import { ProductionItem, ProductionPlan, ComponentType, COMPONENTS, User } from './types';
import PlanModal from "./PlanModal";
import ProductionTable from "./ProductionTable";
import ProductionCharts from "./ProductionCharts";
import GanttChart from "./GanttChart";
import ProductionReport from "./ProductionReport";
import AuthScreen from "./AuthScreen";
import AdminDashboard from "./AdminDashboard";

const formatExcelDate = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'number' && val > 30000 && val < 60000) {
    const date = new Date((val - 25569) * 86400 * 1000);
    return date.toLocaleDateString('pt-BR');
  }
  return String(val).trim();
};

const StatCard: React.FC<{ 
  label: string, 
  value: number, 
  icon: React.ReactNode, 
  color: string, 
  isActive: boolean, 
  onClick: () => void,
  darkMode: boolean
}> = ({ label, value, icon, color, isActive, onClick, darkMode }) => (
  <button 
    onClick={onClick}
    className={`flex-1 text-left p-4 sm:p-6 rounded-[1.2rem] sm:rounded-[2rem] border transition-all duration-300 group active:scale-95 ${
      isActive 
      ? (darkMode ? 'bg-[#FFCC00] border-[#FFCC00] shadow-xl scale-[1.02] z-10' : 'bg-slate-900 border-slate-900 shadow-xl scale-[1.02] z-10 ring-2 ring-yellow-500 ring-offset-2') 
      : (darkMode ? 'bg-slate-900 border-slate-800 hover:border-yellow-400 shadow-sm' : 'bg-white border-slate-200 hover:border-yellow-400 shadow-sm')
    }`}
  >
    <div className="flex justify-between items-start mb-2 sm:mb-4">
      <div className={`p-2 sm:p-3 rounded-lg sm:rounded-2xl ${isActive ? (darkMode ? 'bg-slate-950 text-yellow-500' : 'bg-[#FFCC00] text-black') : `${color} text-white`} transition-colors shadow-sm`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 18 })}
      </div>
      {isActive ? (
        <CheckCircle size={14} className={darkMode ? 'text-slate-900' : 'text-yellow-500 animate-pulse'} />
      ) : (
        <ArrowUpRight size={14} className="text-slate-500 group-hover:text-yellow-500 transition-colors" />
      )}
    </div>
    <p className={`text-[7px] sm:text-[10px] font-black uppercase tracking-[0.15em] mb-1 ${isActive ? (darkMode ? 'text-slate-900' : 'text-slate-400') : 'text-slate-500'}`}>
      {label}
    </p>
    <p className={`text-xl sm:text-4xl font-black tracking-tighter ${isActive ? (darkMode ? 'text-slate-950' : 'text-white') : (darkMode ? 'text-white' : 'text-slate-900')}`}>{value}</p>
  </button>
);

const PlanListModal: React.FC<{
  darkMode: boolean;
  componente: string;
  plans: ProductionPlan[];
  onClose: () => void;
  onUpdateStatus: (id: string, status: 'Pendente' | 'Concluído') => void;
  onDeletePlan: (id: string) => void;
  onExport: () => void;
  filterInfo?: { maquina: string; serie: string } | null;
}> = ({ darkMode, componente, plans, onClose, onUpdateStatus, onDeletePlan, onExport, filterInfo }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-md">
      <div className={`rounded-2xl sm:rounded-[2.5rem] w-full max-w-4xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="bg-slate-950 text-white p-6 sm:p-8 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">
              HISTÓRICO DE APONTAMENTOS
            </h3>
            {filterInfo && filterInfo.maquina ? (
              <p className="text-[12px] font-bold text-yellow-500 uppercase tracking-widest mt-1">
                {filterInfo.maquina} <span className="text-slate-500 mx-1">|</span> {filterInfo.serie}
              </p>
            ) : (
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                Todos os registros de {componente}
              </p>
            )}
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">{plans.length} registros</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={onExport} className="p-3 bg-[#FFCC00] hover:bg-yellow-400 text-black rounded-xl transition-all shadow-lg shadow-yellow-500/20" title="Exportar Excel">
                <Download size={18} />
             </button>
             <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
                <X size={18} />
             </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
           {plans.length === 0 ? (
             <div className="text-center py-12">
               <ClipboardList size={48} className={`mx-auto mb-4 ${darkMode ? 'text-slate-800' : 'text-slate-200'}`} />
               <p className="font-bold uppercase tracking-widest text-slate-400 text-[10px]">Nenhum histórico disponível para este filtro</p>
             </div>
           ) : (
             <div className="space-y-3">
               {plans.map(plan => (
                 <div key={plan.id} className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border ${plan.Status === 'Concluído' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                          {plan.Status === 'Concluído' ? 'OK' : '...'}
                       </div>
                       <div>
                          <div className={`font-black text-sm uppercase tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            {plan.Maquina} <span className="text-slate-500 text-[10px] ml-2">#{plan.Serie}</span>
                          </div>
                          <div className="text-[9px] font-bold text-yellow-600 uppercase tracking-widest mb-1">{plan.Componente}</div>
                          <div className="flex items-center gap-3 mt-1">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><CalendarDays size={10} /> {plan.Nova_Data}</span>
                             {plan.Nova_Hora && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> {plan.Nova_Hora}</span>}
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                       <button 
                         onClick={() => onUpdateStatus(plan.id, plan.Status === 'Pendente' ? 'Concluído' : 'Pendente')}
                         className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${plan.Status === 'Pendente' ? (darkMode ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-500 hover:text-white') : (darkMode ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-white' : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-500 hover:text-white')}`}
                       >
                         {plan.Status === 'Pendente' ? 'Concluir' : 'Reabrir'}
                       </button>
                       <button 
                         onClick={() => onDeletePlan(plan.id)}
                         className={`p-2 rounded-xl border transition-all ${darkMode ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500 hover:text-white' : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-500 hover:text-white'}`}
                       >
                          <X size={16} />
                       </button>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const MaterialGestao: React.FC<{
  darkMode: boolean;
  plans: ProductionPlan[];
  onSolve: (id: string) => void;
  onBack: () => void;
  onEdit: (plan: ProductionPlan) => void;
}> = ({ darkMode, plans, onSolve, onBack, onEdit }) => {
  const missingMaterials = plans.filter(p => p.MaterialStatus === 'Faltante');
  const solvedMaterials = plans.filter(p => p.MaterialResolvidoData);

  const [activeTab, setActiveTab] = useState<'missing' | 'solved'>('missing');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`p-6 sm:p-8 rounded-[2rem] border shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
         <div>
            <button onClick={onBack} className={`mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${darkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>
               <ArrowLeft size={14} /> Voltar ao Dashboard
            </button>
            <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>Gestão de Materiais</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Controle de impeditivos e liberações de produção</p>
         </div>
         <div className={`flex p-1 rounded-xl ${darkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
            <button onClick={() => setActiveTab('missing')} className={`px-6 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'missing' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-500'}`}>
               Pendentes ({missingMaterials.length})
            </button>
            <button onClick={() => setActiveTab('solved')} className={`px-6 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'solved' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500'}`}>
               Resolvidos ({solvedMaterials.length})
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
         {(activeTab === 'missing' ? missingMaterials : solvedMaterials).map(plan => (
           <div key={plan.id} className={`p-6 rounded-[2rem] border transition-all hover:shadow-xl group relative overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
              <div className={`absolute top-0 right-0 p-4 rounded-bl-3xl border-b border-l ${activeTab === 'missing' ? (darkMode ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-rose-50 text-rose-600 border-rose-100') : (darkMode ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100')}`}>
                 {activeTab === 'missing' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
              </div>
              
              <div className="mb-6">
                 <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{plan.Componente}</div>
                 <h3 className={`text-xl font-black uppercase tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>{plan.Maquina}</h3>
                 <p className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Série: {plan.Serie}</p>
              </div>

              <div className={`p-4 rounded-2xl mb-6 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Observação / Motivo:</p>
                 <p className={`text-xs font-medium italic leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{plan.Observacao || 'Sem observações registradas.'}</p>
              </div>

              {activeTab === 'missing' ? (
                <button 
                  onClick={() => onSolve(plan.id)}
                  className={`w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${darkMode ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'}`}
                >
                   <CheckCircle2 size={14} /> Resolver Pendência
                </button>
              ) : (
                <div className="flex items-center gap-3">
                   <div className="flex-1">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Resolvido em:</p>
                      <p className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{plan.MaterialResolvidoData} às {plan.MaterialResolvidoHora}</p>
                   </div>
                   <button onClick={() => onEdit(plan)} className={`p-3 rounded-xl border transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-900'}`}>
                      <Pencil size={16} />
                   </button>
                </div>
              )}
           </div>
         ))}
         {(activeTab === 'missing' ? missingMaterials : solvedMaterials).length === 0 && (
           <div className="col-span-full py-20 text-center">
              <PackageSearch size={48} className={`mx-auto mb-4 ${darkMode ? 'text-slate-800' : 'text-slate-200'}`} />
              <p className="font-bold uppercase tracking-widest text-slate-400 text-[10px]">Nenhum registro encontrado nesta categoria</p>
           </div>
         )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  const [productionData, setProductionData] = useState<ProductionItem[]>([]);
  const [productionPlans, setProductionPlans] = useState<ProductionPlan[]>([]);
  const [viewType, setViewType] = useState<'table' | 'gantt' | 'materials' | 'report'>('table');
  const [activeComponent, setActiveComponent] = useState<ComponentType | null>(null);
  const [initialPlanItem, setInitialPlanItem] = useState<ProductionItem | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [darkMode, setDarkMode] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlanListOpen, setIsPlanListOpen] = useState(false);
  const [historyFilters, setHistoryFilters] = useState<{maquina: string, serie: string} | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('komatsu_production_data');
    const savedPlans = localStorage.getItem('komatsu_production_plans');
    const savedTheme = localStorage.getItem('komatsu_theme');
    const savedUsers = localStorage.getItem('komatsu_users');
    const savedSession = localStorage.getItem('komatsu_session');

    if (savedData) setProductionData(JSON.parse(savedData));
    if (savedPlans) setProductionPlans(JSON.parse(savedPlans));
    if (savedTheme) setDarkMode(savedTheme === 'dark');
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedSession) setCurrentUser(JSON.parse(savedSession));
  }, []);

  useEffect(() => {
    localStorage.setItem('komatsu_production_data', JSON.stringify(productionData));
    localStorage.setItem('komatsu_production_plans', JSON.stringify(productionPlans));
    localStorage.setItem('komatsu_users', JSON.stringify(users));
  }, [productionData, productionPlans, users]);

  useEffect(() => {
    localStorage.setItem('komatsu_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.body.classList.add('bg-slate-950');
      document.body.classList.remove('bg-slate-50');
    } else {
      document.body.classList.add('bg-slate-50');
      document.body.classList.remove('bg-slate-950');
    }
  }, [darkMode]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('komatsu_session', JSON.stringify(user));
  };

  const handleRegister = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    localStorage.setItem('komatsu_session', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('komatsu_session');
    setIsAdminDashboardOpen(false);
  };

  const parseDate = (dateStr: string) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const isDelayed = (item: ProductionItem) => {
    const plan = productionPlans.find(p => p.Maquina === item.Maquina && p.Serie === item.Serie);
    const dateStr = plan?.Nova_Data || item.Replanejamento;
    const plannedDate = parseDate(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    return plan?.Status !== 'Concluído' && plannedDate && plannedDate < today;
  };

  const chartStats = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    let completed = 0; let delayed = 0; let pending = 0;
    let materialIssues = 0;

    productionPlans.forEach(plan => {
      if (plan.MaterialStatus === 'Faltante') materialIssues++;
      if (plan.Status === 'Concluído') {
        completed++;
      } else {
        const dateStr = plan.Nova_Data || plan.Replanejamento;
        const plannedDate = parseDate(dateStr);
        if (plannedDate && plannedDate < today) {
          delayed++;
        } else {
          pending++;
        }
      }
    });

    const itemsWithoutPlan = productionData.filter(item => 
      !productionPlans.some(p => p.Maquina === item.Maquina && p.Serie === item.Serie)
    );
    pending += itemsWithoutPlan.length;

    const componentData = COMPONENTS.map(comp => ({
      name: comp,
      total: productionPlans.filter(p => p.Componente === comp).length
    }));

    return {
      status: { completed, delayed, pending },
      components: componentData,
      totalItems: productionData.length,
      totalPlans: productionPlans.length,
      materialIssues
    };
  }, [productionData, productionPlans]);

  const filteredData = useMemo(() => {
    let data = [...productionData];
    if (searchTerm) {
      const lowTerm = searchTerm.toLowerCase();
      data = data.filter(item => 
        (item.Maquina || '').toLowerCase().includes(lowTerm) || 
        (item.Serie || '').toLowerCase().includes(lowTerm) ||
        (item.Item || '').toLowerCase().includes(lowTerm)
      );
    }
    if (statusFilter !== 'all') {
      data = data.filter(item => {
        const plan = productionPlans.find(p => p.Maquina === item.Maquina && p.Serie === item.Serie);
        if (statusFilter === 'concluido') return plan?.Status === 'Concluído';
        if (statusFilter === 'pendente') return !plan || (plan?.Status === 'Pendente' && !isDelayed(item));
        if (statusFilter === 'atrasado') return isDelayed(item);
        if (statusFilter === 'materiais') return plan?.MaterialStatus === 'Faltante';
        return true;
      });
    }
    return data;
  }, [productionData, searchTerm, statusFilter, productionPlans]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws) as any[];
      const normalized = data.map((row, index) => {
        const entry: ProductionItem = { id: `item-${Date.now()}-${index}`, Item: '', Maquina: '', Line_ON: '', Serie: '', Replanejamento: '' };
        Object.keys(row).forEach(key => {
          const val = row[key];
          const normKey = key.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const finalVal = formatExcelDate(val);
          
          if (normKey.includes('item')) entry.Item = finalVal;
          else if (normKey.includes('maquina')) entry.Maquina = finalVal;
          else if (normKey.includes('line_on') || normKey.includes('line on') || normKey.includes('entrada')) entry.Line_ON = finalVal;
          else if (normKey.includes('serie')) entry.Serie = finalVal;
          else if (normKey.includes('replanejamento')) entry.Replanejamento = finalVal;
        });
        return entry;
      });
      setProductionData(normalized);
    };
    reader.readAsBinaryString(file);
  };

  const handleExportExcel = () => {
    const exportData = filteredData.map(item => {
      const plan = productionPlans.find(p => p.Maquina === item.Maquina && p.Serie === item.Serie);
      return {
        'Item': item.Item,
        'Máquina': item.Maquina,
        'Line ON': item.Line_ON,
        'Série': item.Serie,
        'Replanejamento Base': item.Replanejamento,
        'Nova Data': plan?.Nova_Data || '-',
        'Nova Hora': plan?.Nova_Hora || '-',
        'Status': plan?.Status || 'Em Linha',
        'Material': plan?.MaterialStatus || 'Disponível',
        'Observações': plan?.Observacao || '-',
        'Data Atualização/Conclusão': plan?.Data_Atualizacao || '-',
        'Hora Atualização/Conclusão': plan?.Hora_Atualizacao || '-',
      };
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Produção Geral");
    XLSX.writeFile(wb, `Controle_Komatsu_Geral_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`);
  };

  const handleExportComponentPlans = (comp: string) => {
    const plansToExport = productionPlans.filter(p => p.Componente === comp);
    const exportData = plansToExport.map(p => ({
      'Máquina': p.Maquina,
      'Série': p.Serie,
      'Status': p.Status,
      'Previsão Data': p.Nova_Data,
      'Previsão Hora': p.Nova_Hora,
      'Status Material': p.MaterialStatus,
      'Observações': p.Observacao || '',
      'Data de Conclusão': p.Data_Atualizacao || '---',
      'Hora de Conclusão': p.Hora_Atualizacao || '---',
      'Solução Material': p.MaterialResolvidoData ? `${p.MaterialResolvidoData} ${p.MaterialResolvidoHora}` : 'N/A'
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, comp);
    XLSX.writeFile(wb, `Planos_${comp}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`);
  };

  const handlePlanItem = (item: ProductionItem) => {
    setInitialPlanItem(item);
    if (!activeComponent) setActiveComponent("Mesa");
    setIsModalOpen(true);
  };

  const handleSavePlan = (plan: Omit<ProductionPlan, 'id' | 'Data_Atualizacao' | 'Hora_Atualizacao'>) => {
    const existingIndex = productionPlans.findIndex(p => p.Maquina === plan.Maquina && p.Serie === plan.Serie && p.Componente === plan.Componente);
    const wasFaltante = existingIndex >= 0 && productionPlans[existingIndex].MaterialStatus === 'Faltante';
    const isNowDisponivel = plan.MaterialStatus === 'Disponível';
    
    const timestampedPlan: ProductionPlan = {
      ...plan,
      id: existingIndex >= 0 ? productionPlans[existingIndex].id : `plan-${Date.now()}`,
      Data_Atualizacao: plan.Status === 'Concluído' ? new Date().toLocaleDateString('pt-BR') : (existingIndex >= 0 ? productionPlans[existingIndex].Data_Atualizacao : ''),
      Hora_Atualizacao: plan.Status === 'Concluído' ? new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : (existingIndex >= 0 ? productionPlans[existingIndex].Hora_Atualizacao : ''),
      MaterialResolvidoData: (wasFaltante && isNowDisponivel) ? new Date().toLocaleDateString('pt-BR') : (existingIndex >= 0 ? productionPlans[existingIndex].MaterialResolvidoData : ''),
      MaterialResolvidoHora: (wasFaltante && isNowDisponivel) ? new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : (existingIndex >= 0 ? productionPlans[existingIndex].MaterialResolvidoHora : '')
    };

    if (existingIndex >= 0) {
      const updated = [...productionPlans];
      updated[existingIndex] = timestampedPlan;
      setProductionPlans(updated);
    } else {
      setProductionPlans(prev => [...prev, timestampedPlan]);
    }
    setIsModalOpen(false);
    setInitialPlanItem(null);
  };

  const solveMaterialIssue = (planId: string) => {
    setProductionPlans(prev => prev.map(p => p.id === planId ? {
      ...p,
      MaterialStatus: 'Disponível',
      MaterialResolvidoData: new Date().toLocaleDateString('pt-BR'),
      MaterialResolvidoHora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } : p));
  };

  const handleEditSolvedPlan = (plan: ProductionPlan) => {
    const item = productionData.find(d => d.Maquina === plan.Maquina && d.Serie === plan.Serie);
    if (item) {
      setInitialPlanItem(item);
      setActiveComponent(plan.Componente as ComponentType);
      setIsModalOpen(true);
    }
  };
  
  const handleEditPlan = (plan: ProductionPlan) => {
      const item = productionData.find(d => d.Maquina === plan.Maquina && d.Serie === plan.Serie);
      const itemToEdit = item || { 
          id: 'temp', 
          Maquina: plan.Maquina, 
          Serie: plan.Serie, 
          Item: 'Desconhecido', 
          Line_ON: plan.Line_ON, 
          Replanejamento: plan.Replanejamento 
      };
      
      setInitialPlanItem(itemToEdit);
      setActiveComponent(plan.Componente as ComponentType);
      setIsModalOpen(true);
  };

  const handleUpdatePlanStatus = (id: string, currentStatus: 'Pendente' | 'Concluído') => {
      const newStatus = currentStatus === 'Pendente' ? 'Concluído' : 'Pendente';
      setProductionPlans(prev => prev.map(p => p.id === id ? {
        ...p, 
        Status: newStatus, 
        Data_Atualizacao: newStatus === 'Concluído' ? new Date().toLocaleDateString('pt-BR') : '', 
        Hora_Atualizacao: newStatus === 'Concluído' ? new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''
      } : p));
  };

  const applyStatusFilter = (filter: string) => {
    setStatusFilter(filter);
    if (viewType === 'materials') setViewType('table');
    const tableElement = document.getElementById('production-content');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Se não estiver logado, mostra tela de Auth
  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} users={users} />;
  }

  // Se estiver no modo Admin Dashboard
  if (isAdminDashboardOpen && currentUser.role === 'admin') {
     return (
        <AdminDashboard 
           users={users} 
           onDeleteUser={(id) => setUsers(prev => prev.filter(u => u.id !== id))} 
           onBack={() => setIsAdminDashboardOpen(false)}
           darkMode={darkMode}
        />
     );
  }

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'bg-slate-950 text-white' : 'bg-[#F0F2F5] text-slate-900'}`}>
      <div 
        className={`fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      <aside className={`w-72 bg-slate-950 text-white flex flex-col fixed lg:static h-full z-[60] transition-transform duration-500 shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 sm:p-8 flex items-center justify-between border-b border-slate-900 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#FFCC00] rounded-xl flex items-center justify-center font-black text-black text-xl shadow-[0_0_20px_rgba(255,204,0,0.15)]">K</div>
            <div className="overflow-hidden">
              <h1 className="font-black text-lg tracking-tighter uppercase text-white leading-none">KOMATSU</h1>
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Caldeiraria Shop</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-8 overflow-y-auto custom-scrollbar">
          <div>
            <p className="px-4 mb-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Painel Principal</p>
            <button 
              onClick={() => { setStatusFilter('all'); setViewType('table'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${statusFilter === 'all' && viewType === 'table' ? 'bg-[#FFCC00] text-black shadow-xl' : 'text-slate-400 hover:bg-slate-900'}`}
            >
              <LayoutDashboard size={18} />
              <span className="text-sm font-black uppercase tracking-tight">Dashboard</span>
            </button>
            <button 
              onClick={() => { setViewType('materials'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl mt-1 transition-all ${viewType === 'materials' ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20' : 'text-slate-400 hover:bg-slate-900'}`}
            >
              <PackageSearch size={18} />
              <span className="text-sm font-black uppercase tracking-tight">Gestão de Materiais</span>
            </button>
            <button 
              onClick={() => { setViewType('report'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl mt-1 transition-all ${viewType === 'report' ? (darkMode ? 'bg-slate-800 text-white shadow-xl' : 'bg-slate-200 text-slate-900 shadow-xl') : 'text-slate-400 hover:bg-slate-900'}`}
            >
              <FileText size={18} />
              <span className="text-sm font-black uppercase tracking-tight">Relatórios</span>
            </button>
            
            {currentUser.role === 'admin' && (
              <button 
                onClick={() => { setIsAdminDashboardOpen(true); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl mt-1 transition-all text-emerald-500 hover:bg-emerald-500/10`}
              >
                <Shield size={18} />
                <span className="text-sm font-black uppercase tracking-tight">Painel do CEO</span>
              </button>
            )}
          </div>

          <div>
            <p className="px-4 mb-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Componentes</p>
            <div className="space-y-1">
              {COMPONENTS.map(comp => (
                <button 
                  key={comp}
                  onClick={() => { setActiveComponent(comp); setInitialPlanItem(null); setHistoryFilters(null); setIsModalOpen(true); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group border border-transparent hover:border-slate-800 text-left ${activeComponent === comp && isModalOpen ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
                >
                  <Box size={16} className={`shrink-0 ${activeComponent === comp ? 'text-yellow-500' : 'group-hover:text-yellow-500'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-tight">{comp}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-6 border-t border-slate-900 shrink-0 space-y-4">
          {currentUser.role === 'admin' && (
             <label className="block group">
               <div className="flex items-center justify-center gap-3 w-full py-4 bg-slate-900 border border-slate-800 hover:border-yellow-500 hover:text-yellow-500 text-slate-400 font-black uppercase tracking-widest text-[9px] rounded-xl cursor-pointer transition-all">
                 <FileUp size={18} />
                 <span>Importar Base</span>
                 <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
               </div>
             </label>
          )}
          
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
             <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                <UserIcon size={16} />
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{currentUser.role === 'admin' ? 'Administrador' : 'Operador'}</p>
             </div>
             <button onClick={handleLogout} className="text-rose-500 hover:text-rose-400 p-1" title="Sair">
                <LogOut size={16} />
             </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <header className={`h-20 border-b flex items-center justify-between px-6 sm:px-12 sticky top-0 z-40 shrink-0 transition-colors duration-300 ${darkMode ? 'bg-slate-900/80 backdrop-blur-2xl border-slate-800' : 'bg-white/60 backdrop-blur-2xl border-slate-200/50'}`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className={`lg:hidden p-2 rounded-lg ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              <Menu size={20} />
            </button>
            <div className={`hidden sm:block p-2 rounded-lg ${darkMode ? 'bg-yellow-500/20' : 'bg-yellow-500/10'}`}>
              <TrendingUp size={20} className="text-yellow-600" />
            </div>
            <div>
              <h2 className={`text-sm sm:text-lg font-black uppercase tracking-tighter leading-none ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {viewType === 'materials' ? 'Gestão de Materiais' : viewType === 'report' ? 'Relatórios de Produção' : 'Status de Operação'}
              </h2>
              <p className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Caldeiraria em Tempo Real</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl transition-all shadow-sm active:scale-95 ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              title={darkMode ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={handleExportExcel}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 text-[8px] sm:text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl active:scale-95 ${darkMode ? 'bg-[#FFCC00] text-slate-950 hover:bg-yellow-400' : 'bg-slate-950 text-white hover:bg-slate-900'}`}
            >
              <Download size={14} /> <span className="hidden xs:inline">Exportar Geral</span>
            </button>
          </div>
        </header>

        <main className={`flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar transition-colors duration-300 ${darkMode ? 'bg-slate-950' : 'bg-[#F8F9FB]'}`}>
          <div className="p-4 sm:p-10 space-y-6 sm:space-y-12 max-w-[1600px] mx-auto">
            {viewType === 'report' ? (
               <ProductionReport 
                 plans={productionPlans} 
                 darkMode={darkMode} 
                 onUpdateStatus={handleUpdatePlanStatus}
                 onEdit={handleEditPlan}
               />
            ) : viewType !== 'materials' ? (
              <>
                <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-8">
                  <StatCard darkMode={darkMode} label="Total Itens" value={chartStats.totalItems} icon={<ClipboardList />} color="bg-blue-600" isActive={statusFilter === 'all'} onClick={() => applyStatusFilter('all')} />
                  <StatCard darkMode={darkMode} label="Concluídos" value={chartStats.status.completed} icon={<CheckCircle2 />} color="bg-emerald-600" isActive={statusFilter === 'concluido'} onClick={() => applyStatusFilter('concluido')} />
                  <StatCard darkMode={darkMode} label="Pendentes" value={chartStats.status.pending} icon={<Clock />} color="bg-amber-600" isActive={statusFilter === 'pendente'} onClick={() => applyStatusFilter('pendente')} />
                  <StatCard darkMode={darkMode} label="Atrasados" value={chartStats.status.delayed} icon={<AlertTriangle />} color="bg-rose-600" isActive={statusFilter === 'atrasado'} onClick={() => applyStatusFilter('atrasado')} />
                  <StatCard darkMode={darkMode} label="Falta Material" value={chartStats.materialIssues} icon={<AlertCircle />} color="bg-rose-500" isActive={statusFilter === 'materiais'} onClick={() => applyStatusFilter('materiais')} />
                </section>
                <ProductionCharts darkMode={darkMode} statusData={chartStats.status} componentData={chartStats.components} />
              </>
            ) : null}

            {viewType === 'materials' && (
              <MaterialGestao darkMode={darkMode} plans={productionPlans} onSolve={solveMaterialIssue} onBack={() => setViewType('table')} onEdit={handleEditSolvedPlan} />
            )}
            
            {(viewType === 'table' || viewType === 'gantt') && (
              <div id="production-content" className="space-y-6">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                  <div className={`flex p-1 rounded-xl shadow-sm border transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <button onClick={() => setViewType('table')} className={`flex-1 px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewType === 'table' ? (darkMode ? 'bg-[#FFCC00] text-slate-950 shadow-lg' : 'bg-slate-900 text-white shadow-lg') : (darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50')}`}>
                      Lista
                    </button>
                    <button onClick={() => setViewType('gantt')} className={`flex-1 px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewType === 'gantt' ? (darkMode ? 'bg-[#FFCC00] text-slate-950 shadow-lg' : 'bg-slate-900 text-white shadow-lg') : (darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50')}`}>
                      Gantt
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-1 md:max-w-md">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                        type="text" 
                        placeholder="Pesquisar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl text-xs font-bold outline-none focus:border-yellow-500 transition-all ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                      />
                    </div>
                    <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); }} className={`p-3 border rounded-xl transition-all ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                      <RotateCcw size={16} />
                    </button>
                  </div>
                </div>

                <div className={`rounded-[1.5rem] sm:rounded-[3rem] border transition-colors shadow-xl overflow-hidden min-h-[500px] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60'}`}>
                  {viewType === 'table' ? (
                    <ProductionTable darkMode={darkMode} data={filteredData} plans={productionPlans} onPlanItem={handlePlanItem} />
                  ) : (
                    <div className="p-4 sm:p-8">
                      <GanttChart darkMode={darkMode} plans={productionPlans} productionData={productionData} onPlanItem={handlePlanItem} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {isModalOpen && (
        <PlanModal 
          darkMode={darkMode}
          componente={activeComponent || 'Mesa'} 
          initialItem={initialPlanItem}
          productionData={productionData}
          existingPlans={productionPlans}
          onClose={() => { setIsModalOpen(false); setInitialPlanItem(null); setHistoryFilters(null); }}
          onSave={handleSavePlan}
          onViewPlans={(maquina, serie) => { 
            setHistoryFilters({ maquina, serie });
            setIsModalOpen(false); 
            setIsPlanListOpen(true); 
          }}
        />
      )}

      {isPlanListOpen && activeComponent && (
        <PlanListModal 
          darkMode={darkMode}
          componente={activeComponent} 
          filterInfo={historyFilters}
          plans={productionPlans.filter(p => {
             // Se houver filtro de histórico definido, prioriza ele e ignora o componente ativo
             // Isso garante que D51 (Chassi Buld) apareça mesmo se o menu estiver em Mesa
             if (historyFilters?.maquina) {
                 const isMachineMatch = p.Maquina === historyFilters.maquina;
                 const isSerieMatch = !historyFilters.serie || p.Serie === historyFilters.serie;
                 return isMachineMatch && isSerieMatch;
             }

             // Caso contrário, usa a lógica padrão do menu lateral
             return p.Componente === activeComponent;
          })} 
          onClose={() => { setIsPlanListOpen(false); setActiveComponent(null); setHistoryFilters(null); }} 
          onUpdateStatus={handleUpdatePlanStatus} 
          onDeletePlan={(id) => { 
            if (confirm('Deseja excluir este planejamento?')) {
              setProductionPlans(prev => prev.filter(p => p.id !== id));
            }
          }} 
          onExport={() => handleExportComponentPlans(activeComponent)}
        />
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        ${darkMode ? `
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
        ` : ''}
        @media print {
            body { background-color: white !important; color: black !important; }
            aside, header { display: none !important; }
            main { margin: 0 !important; padding: 0 !important; overflow: visible !important; }
            .print\\:hidden { display: none !important; }
            .print\\:shadow-none { box-shadow: none !important; }
            .print\\:border-none { border: none !important; }
        }
      `}</style>
    </div>
  );
};

export default App;
