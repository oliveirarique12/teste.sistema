
import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, User as UserIcon, Lock, Mail, ArrowRight, KeyRound } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
  users: User[];
  onRegister: (user: User) => void;
}

const AuthScreen: React.FC<Props> = ({ onLogin, users, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Email ou senha incorretos.');
      }
    } else {
      if (!name || !email || !password) {
        setError('Preencha todos os campos.');
        return;
      }
      
      if (users.some(u => u.email === email)) {
        setError('Este email já está cadastrado.');
        return;
      }

      const role = adminCode === 'KOMATSU2026' ? 'admin' : 'user';

      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        password,
        role,
        createdAt: new Date().toLocaleDateString('pt-BR')
      };

      onRegister(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FFCC00]/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-[#FFCC00] rounded-2xl flex items-center justify-center font-black text-black text-3xl shadow-[0_0_30px_rgba(255,204,0,0.3)] mx-auto mb-4">K</div>
           <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Komatsu Control</h1>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Sistema de Gestão de Caldeiraria</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-2xl">
          <div className="flex mb-8 bg-slate-950 p-1 rounded-xl">
            <button 
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${isLogin ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Login
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${!isLogin ? 'bg-[#FFCC00] text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Cadastro
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Nome Completo</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-sm font-bold text-white placeholder:text-slate-600 focus:border-yellow-500 outline-none transition-all"
                    placeholder="Seu nome"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Email Corporativo</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-sm font-bold text-white placeholder:text-slate-600 focus:border-yellow-500 outline-none transition-all"
                  placeholder="usuario@komatsu.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-sm font-bold text-white placeholder:text-slate-600 focus:border-yellow-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAdminInput(!showAdminInput)}
                  className="text-[9px] font-bold text-slate-500 hover:text-yellow-500 flex items-center gap-2 transition-colors mb-2 pl-2"
                >
                  <KeyRound size={12} />
                  {showAdminInput ? 'Ocultar código de acesso' : 'Possui código de administrador?'}
                </button>
                
                {showAdminInput && (
                   <div className="relative animate-in slide-in-from-top-2">
                    <ShieldCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500" />
                    <input 
                      type="text" 
                      value={adminCode}
                      onChange={e => setAdminCode(e.target.value)}
                      className="w-full bg-slate-950 border border-yellow-500/30 rounded-xl py-3.5 pl-11 pr-4 text-sm font-bold text-white placeholder:text-slate-600 focus:border-yellow-500 outline-none transition-all"
                      placeholder="Código Mestre (Ex: KOMATSU...)"
                    />
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <button 
              type="submit"
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all mt-4 ${isLogin ? 'bg-[#FFCC00] hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/20' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
            >
              {isLogin ? 'Entrar no Sistema' : 'Criar Conta'} <ArrowRight size={16} />
            </button>
          </form>
        </div>
        
        <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-8">
          © 2024 Komatsu Production Control
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
