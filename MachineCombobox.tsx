import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { DEFAULT_MACHINES } from './types';

interface MachineComboboxProps {
  value: string;
  onChange: (value: string) => void;
  productionData?: { Maquina: string }[];
  darkMode: boolean;
}

export const MachineCombobox: React.FC<MachineComboboxProps> = ({ value, onChange, productionData = [], darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  const machineOptions = Array.from(new Set([...DEFAULT_MACHINES, ...productionData.map(d => d.Maquina).filter(Boolean)])).sort();
  const filteredOptions = query === '' ? machineOptions : machineOptions.filter(m => m.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { setQuery(value); }, [value]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Modelo da Máquina</label>
      <div className="relative">
        <input type="text" value={query} placeholder="Selecione ou digite o modelo..." onFocus={() => setIsOpen(true)} onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setIsOpen(true); }} className={`w-full pl-3 pr-10 py-2.5 rounded-xl border text-xs font-bold outline-none transition-all ${darkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-yellow-500' : 'bg-white border-slate-200 text-slate-900 focus:border-yellow-500'}`} />
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><ChevronDown size={16} /></button>
      </div>
      {isOpen && (
        <div className={`absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto rounded-xl border shadow-2xl z-50 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          {filteredOptions.map(machine => (
            <button key={machine} type="button" onClick={() => { onChange(machine); setQuery(machine); setIsOpen(false); }} className={`w-full text-left px-3.5 py-2.5 text-xs font-black uppercase tracking-tight flex items-center justify-between ${value === machine ? 'bg-yellow-500/10 text-yellow-500' : darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}>
              <span>{machine}</span>
              {value === machine && <Check size={14} className="text-yellow-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
