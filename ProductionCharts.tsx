
import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

interface StatusData {
  pending: number;
  completed: number;
  delayed: number;
}

interface ComponentData {
  name: string;
  total: number;
}

interface Props {
  statusData: StatusData;
  componentData: ComponentData[];
  darkMode: boolean;
}

const ProductionCharts: React.FC<Props> = ({ statusData, componentData, darkMode }) => {
  const chartData = [
    { name: 'Concluído', value: statusData.completed, color: '#10b981' }, 
    { name: 'Pendente', value: statusData.pending, color: '#f59e0b' },   
    { name: 'Atrasado', value: statusData.delayed, color: '#f43f5e' },   
  ].filter(d => d.value > 0);

  const total = statusData.completed + statusData.pending + statusData.delayed;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8">
      {/* Donut Chart */}
      <div className={`xl:col-span-4 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border shadow-sm flex flex-col h-[350px] sm:h-[400px] transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60'}`}>
        <h3 className={`font-black text-[10px] uppercase tracking-[0.2em] mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-900'}`}>Volume por Status</h3>
        <div className="flex-1 min-h-0 relative">
          {total > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius="60%" outerRadius="85%" paddingAngle={6} dataKey="value">
                  {chartData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                    fontSize: '10px', 
                    fontWeight: '900',
                    backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                    color: darkMode ? '#f8fafc' : '#0f172a'
                  }} 
                  itemStyle={{ color: darkMode ? '#f8fafc' : '#0f172a' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.1em', color: darkMode ? '#94a3b8' : '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-300 font-bold uppercase text-[9px]">Sem dados de planejamento</div>
          )}
          {total > 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className={`text-3xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>{total}</span>
              <span className="text-[8px] uppercase font-black text-slate-400 tracking-widest">Registros</span>
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart */}
      <div className={`xl:col-span-8 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border shadow-sm flex flex-col h-[350px] sm:h-[400px] transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60'}`}>
        <h3 className={`font-black text-[10px] uppercase tracking-[0.2em] mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-900'}`}>Componentes em Produção</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={componentData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#f1f5f9'} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: darkMode ? '#64748b' : '#94a3b8', fontSize: 8, fontWeight: 900 }} interval={0} angle={-25} textAnchor="end" />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: darkMode ? '#64748b' : '#94a3b8', fontSize: 8 }} />
              <Tooltip 
                cursor={{ fill: darkMode ? '#1e293b' : '#f8fafc' }} 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                  fontSize: '10px',
                  backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                  color: darkMode ? '#f8fafc' : '#0f172a'
                }} 
              />
              <Bar dataKey="total" fill={darkMode ? '#FFCC00' : '#334155'} radius={[6, 6, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProductionCharts;
