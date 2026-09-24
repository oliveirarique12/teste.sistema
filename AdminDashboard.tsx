
import React, { useState } from 'react';
import { User } from '../types';
import { 
  Users, 
  ShieldCheck, 
  Trash2, 
  Search, 
  ArrowLeft,
  UserCheck,
  LayoutDashboard
} from 'lucide-react';

interface Props {
  users: User[];
  onDeleteUser: (id: string) => void;
  onBack: () => void;
  darkMode: boolean;
}

const AdminDashboard: React.FC<Props> = ({ users, onDeleteUser, onBack, darkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    users: users.filter(u => u.role === 'user').length
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`p-6 sm:p-8 rounded-[2rem] border shadow-xl ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
         <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <button onClick={onBack} className={`mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${darkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>
                  <ArrowLeft size={14} /> Voltar ao App
              </button>
              <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-tighter flex items-center gap-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                <LayoutDashboard className="text-yellow-500" /> Painel do CEO
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Gestão Administrativa e Controle de Usuários</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className={`p-6 rounded-2xl border flex items-center gap-4 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
               <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Users size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Usuários</p>
                  <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stats.total}</p>
               </div>
            </div>
            <div className={`p-6 rounded-2xl border flex items-center gap-4 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
               <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                  <ShieldCheck size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Administradores</p>
                  <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stats.admins}</p>
               </div>
            </div>
            <div className={`p-6 rounded-2xl border flex items-center gap-4 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
               <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <UserCheck size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Operadores</p>
                  <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stats.users}</p>
               </div>
            </div>
         </div>

         <div className="flex flex-col gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar usuário por nome ou email..."
                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm font-bold outline-none focus:border-yellow-500 transition-all ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
              />
            </div>

            <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
               <table className="w-full text-left">
                  <thead className={`text-[9px] font-black uppercase tracking-widest border-b ${darkMode ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                     <tr>
                        <th className="px-6 py-4">Usuário</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Função</th>
                        <th className="px-6 py-4">Data Cadastro</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                     </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                     {filteredUsers.map(user => (
                        <tr key={user.id} className={`group ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                           <td className="px-6 py-4">
                              <div className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>{user.name}</div>
                           </td>
                           <td className="px-6 py-4">
                              <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{user.email}</div>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                 user.role === 'admin' 
                                 ? (darkMode ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-yellow-50 text-yellow-600 border-yellow-200')
                                 : (darkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200')
                              }`}>
                                 {user.role === 'admin' ? 'Administrador' : 'Operador'}
                              </span>
                           </td>
                           <td className="px-6 py-4">
                              <span className="text-xs font-mono text-slate-500">{user.createdAt}</span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <button 
                                 onClick={() => onDeleteUser(user.id)}
                                 disabled={user.role === 'admin' && stats.admins <= 1} // Não pode deletar o último admin
                                 className={`p-2 rounded-lg transition-all ${
                                    user.role === 'admin' && stats.admins <= 1 
                                    ? 'opacity-30 cursor-not-allowed text-slate-500' 
                                    : 'text-rose-500 hover:bg-rose-500/10'
                                 }`}
                                 title="Remover Usuário"
                              >
                                 <Trash2 size={16} />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
