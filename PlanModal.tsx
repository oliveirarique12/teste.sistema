
import React, { useState, useEffect, useMemo } from 'react';
import { ProductionItem, ProductionPlan, ComponentType, COMPONENTS } from '../types';
import { Calendar, Clock, Factory, Hash, Send, Link, X, Box, AlertCircle, FileText } from 'lucide-react';

interface Props {
  componente: ComponentType;
  initialItem?: ProductionItem | null;
  productionData: ProductionItem[];
  existingPlans: ProductionPlan[];
  onClose: () => void;
  onSave: (plan: Omit<ProductionPlan, 'id' | 'Data_Atualizacao' | 'Hora_Atualizacao'>) => void;
  onViewPlans: (maquina: string, serie: string) => void;
  darkMode: boolean;
}

const PlanModal: React.FC<Props> = ({ componente, initialItem, productionData, existingPlans, onClose, onSave, onViewPlans, darkMode }) => {
  const [selectedMaquina, setSelectedMaquina] = useState(initialItem?.Maquina || '');
  const [selectedSerie, setSelectedSerie] = useState(initialItem?.Serie || '');
  const [selectedComponente, setSelectedComponente] = useState<ComponentType>(componente);
  const [novaData, setNovaData] = useState('');
  const [novaHora, setNovaHora] = useState('');
  const [status, setStatus] = useState<'Pendente' | 'Concluído'>('Pendente');
  const [materialStatus, setMaterialStatus] = useState<'Disponível' | 'Faltante'>('Disponível');
  const [observacao, setObservacao] = useState('');
  const [dependenciaId, setDependenciaId] = useState('');

  // Definição dos grupos de componentes
  const BULLDOZER_COMPS: ComponentType[] = ["Chassi Buld", "Viga Buld", "Estrutura"];
  
  // Determina se a máquina selecionada é Bulldozer (D51 ou D61)
  const isBulldozerMachine = useMemo(() => {
    const maquina = selectedMaquina.toUpperCase();
    return maquina.startsWith('D51') || maquina.startsWith('D61');
  }, [selectedMaquina]);

  useEffect(() => {
    if (initialItem) {
      setSelectedMaquina(initialItem.Maquina);
      setSelectedSerie(initialItem.Serie);
    }
  }, [initialItem]);

  useEffect(() => {
    setSelectedComponente(componente);
  }, [componente]);

  // Efeito para troca automática de componente baseada na máquina
  useEffect(() => {
    if (!selectedMaquina) return;

    const isCurrentBullComp = BULLDOZER_COMPS.includes(selectedComponente);

    if (isBulldozerMachine && !isCurrentBullComp) {
      // Se é máquina D51/D61 mas componente é de Escavadeira, muda para Chassi Buld
      setSelectedComponente('Chassi Buld');
    } else if (!isBulldozerMachine && isCurrentBullComp) {
      // Se é Escavadeira mas componente é de Bulldozer, muda para Mesa (padrão escavadeira)
      setSelectedComponente('Mesa');
    }
  }, [selectedMaquina, isBulldozerMachine]); // Executa quando a máquina muda

  useEffect(() => {
    // Busca plano existente considerando também o Componente selecionado
    const existing = existingPlans.find(p => p.Maquina === selectedMaquina && p.Serie === selectedSerie && p.Componente === selectedComponente);
    if (existing) {
      setNovaData(existing.Nova_Data);
      setNovaHora(existing.Nova_Hora);
      setStatus(existing.Status);
      setMaterialStatus(existing.MaterialStatus || 'Disponível');
      setObservacao(existing.Observacao || '');
      setDependenciaId(existing.DependenciaId || '');
    } else {
      setNovaData('');
      setNovaHora('');
      setStatus('Pendente');
      setMaterialStatus('Disponível');
      setObservacao('');
      setDependenciaId('');
    }
  }, [selectedMaquina, selectedSerie, selectedComponente, existingPlans]);

  const maquinasUnicas = useMemo(() => 
    Array.from(new Set(productionData.map(d => d.Maquina))).sort(), 
  [productionData]);

  const seriesDisponiveis = useMemo(() => 
    productionData.filter(d => d.Maquina === selectedMaquina).map(d => d.Serie),
  [productionData, selectedMaquina]);

  const selectedDetails = useMemo(() => 
    productionData.find(d => d.Maquina === selectedMaquina && d.Serie === selectedSerie),
  [productionData, selectedMaquina, selectedSerie]);

  const dateOptionsGrouped = useMemo(() => {
    const groups: Record<string, string[]> = {};
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
    
    for (let i = 0; i < 400; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      
      const monthYear = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      const dateStr = d.toLocaleDateString('pt-BR');
      
      if (!groups[monthYear]) groups[monthYear] = [];
      groups[monthYear].push(dateStr);
    }
    return Object.entries(groups);
  }, []);

  const hourOptions = useMemo(() => {
    const hours = [];
    for (let h = 0; h < 24; h++) {
      for (let m of ['00', '15', '30', '45']) {
        hours.push(`${h.toString().padStart(2, '0')}:${m}`);
      }
    }
    return hours;
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaquina || !selectedSerie || !selectedDetails || !novaData) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    onSave({
      Componente: selectedComponente,
      Maquina: selectedMaquina,
      Line_ON: selectedDetails.Line_ON,
      Serie: selectedSerie,
      Replanejamento: selectedDetails.Replanejamento,
      Status: status,
      MaterialStatus: materialStatus,
      Observacao: observacao,
      Nova_Data: novaData,
      Nova_Hora: novaHora,
      DependenciaId: dependenciaId || undefined
    });
  };

  const inputClasses = `w-full px-4 sm:px-5 py-3 sm:py-4 border rounded-xl sm:rounded-2xl text-[12px] sm:text-[13px] font-bold outline-none focus:border-yellow-500 transition-all appearance-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-md">
      <div className={`rounded-2xl sm:rounded-[3rem] w-full max-w-xl shadow-2xl border overflow-hidden transform transition-all animate-in zoom-in duration-300 max-h-[95vh] flex flex-col ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="bg-slate-950 text-white p-6 sm:p-10 relative shrink-0">
          <div className="flex items-center gap-4 mb-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#FFCC00] rounded-lg sm:rounded-2xl flex items-center justify-center text-black font-black text-sm sm:text-lg">K</div>
            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">Formulário Operacional</p>
          </div>
          <h3 className="text-xl sm:text-3xl font-black uppercase tracking-tighter">
             Planejamento de {selectedComponente}
          </h3>
          <button onClick={onClose} type="button" className="absolute top-6 sm:top-10 right-6 sm:right-10 w-10 h-10 sm:w-12 sm:h-12 bg-white/5 hover:bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all group">
            <X size={20} className="text-slate-500 group-hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6 sm:space-y-8 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Seção de Máquina e Série movida para cima para facilitar o fluxo lógico */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Factory size={12} className="text-yellow-500" /> Equipamento
              </label>
              <select 
                value={selectedMaquina} 
                onChange={e => { setSelectedMaquina(e.target.value); setSelectedSerie(''); }}
                className={inputClasses}
                required
              >
                <option value="">Selecione...</option>
                {maquinasUnicas.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Hash size={12} className="text-yellow-500" /> Nº de Série
              </label>
              <select 
                value={selectedSerie} 
                onChange={e => setSelectedSerie(e.target.value)}
                disabled={!selectedMaquina}
                className={inputClasses}
                required
              >
                <option value="">Selecione...</option>
                {seriesDisponiveis.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Box size={12} className="text-yellow-500" /> Categoria do Componente
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COMPONENTS.map(c => {
                // Verifica se o componente é recomendado para a máquina selecionada
                const isBulldozerComp = BULLDOZER_COMPS.includes(c);
                const isRecommended = selectedMaquina 
                   ? (isBulldozerMachine ? isBulldozerComp : !isBulldozerComp)
                   : true; // Se não tem máquina, todos são "normais"

                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedComponente(c)}
                    className={`px-2 py-2 text-[8px] font-black uppercase rounded-lg border transition-all 
                      ${selectedComponente === c 
                        ? (darkMode ? 'bg-[#FFCC00] border-[#FFCC00] text-slate-950 shadow-md scale-[1.02]' : 'bg-slate-900 border-slate-900 text-white shadow-md scale-[1.02]') 
                        : (darkMode 
                            ? `bg-slate-800 border-slate-700 text-slate-400 hover:border-yellow-400 ${!isRecommended ? 'opacity-40' : 'opacity-100'}` 
                            : `bg-slate-50 border-slate-200 text-slate-500 hover:border-yellow-400 ${!isRecommended ? 'opacity-40' : 'opacity-100'}`
                          )
                      }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            {selectedMaquina && (
               <p className="text-[9px] font-bold text-slate-500 text-right mt-1">
                 {isBulldozerMachine ? 'Modo Bulldozer (D51/D61) Ativo' : 'Modo Escavadeira Ativo'}
               </p>
            )}
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} className="text-yellow-500" /> Previsão (Filtrado por Mês)
              </label>
              <select 
                value={novaData} 
                onChange={e => setNovaData(e.target.value)}
                className={inputClasses}
                required
              >
                <option value="">Selecione a Data...</option>
                {dateOptionsGrouped.map(([month, dates]) => (
                  <optgroup key={month} label={month.toUpperCase()} className={darkMode ? 'bg-slate-800' : ''}>
                    {dates.map(d => <option key={d} value={d} className={darkMode ? 'bg-slate-800' : ''}>{d}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Clock size={12} className="text-yellow-500" /> Hora Prevista
              </label>
              <select 
                value={novaHora} 
                onChange={e => setNovaHora(e.target.value)}
                className={inputClasses}
              >
                <option value="">Opcional...</option>
                {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          <div className={`space-y-4 pt-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
             <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 space-y-3">
                   <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      Status Produção
                   </label>
                   <div className={`flex p-1 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <button type="button" onClick={() => setStatus('Pendente')} className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${status === 'Pendente' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-500'}`}>Pendente</button>
                      <button type="button" onClick={() => setStatus('Concluído')} className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${status === 'Concluído' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500'}`}>Concluído</button>
                   </div>
                </div>
                <div className="flex-1 space-y-3">
                   <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      Status Material
                   </label>
                   <div className={`flex p-1 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <button type="button" onClick={() => setMaterialStatus('Disponível')} className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${materialStatus === 'Disponível' ? (darkMode ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-900 text-white shadow-md') : 'text-slate-500'}`}>Disponível</button>
                      <button type="button" onClick={() => setMaterialStatus('Faltante')} className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${materialStatus === 'Faltante' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500'}`}>Falta Material</button>
                   </div>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <FileText size={12} className="text-yellow-500" /> Observações Técnicas / Motivo Falta Material
                </label>
                <textarea 
                  value={observacao}
                  onChange={e => setObservacao(e.target.value)}
                  placeholder="Informe aqui se houver falta de material ou outros impedimentos..."
                  className={`w-full h-24 p-4 border rounded-2xl text-[12px] font-bold outline-none focus:border-yellow-500 transition-all resize-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-300'}`}
                />
                {materialStatus === 'Faltante' && (
                  <div className={`flex items-start gap-2 p-3 border rounded-xl ${darkMode ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-100'}`}>
                     <AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                     <p className={`text-[9px] font-bold leading-tight ${darkMode ? 'text-rose-400' : 'text-rose-600'}`}>Este item será marcado com ALERTA DE IMPACTO no cronograma geral.</p>
                  </div>
                )}
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 shrink-0 pb-4">
            <button type="button" onClick={() => onViewPlans(selectedMaquina, selectedSerie)} className={`w-full sm:w-auto px-10 py-4 text-[9px] font-black uppercase tracking-widest border rounded-xl transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'}`}>Histórico</button>
            <button type="submit" className={`flex-1 px-10 py-4 font-black uppercase tracking-widest text-[9px] rounded-xl shadow-2xl flex items-center justify-center gap-3 transition-all ${darkMode ? 'bg-[#FFCC00] text-slate-950 hover:bg-yellow-400' : 'bg-slate-950 text-white hover:bg-slate-900'}`}>
              <Send size={14} /> Salvar Plano
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanModal;
