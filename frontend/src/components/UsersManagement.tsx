import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { User, Mail, Shield, ShieldCheck, Plus, Search, Loader2, MoreVertical, Edit2, Trash2, Zap, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/api/tenant/users')
      .then(res => setUsers(res.data.data || res.data || []))
      .catch(() => toast.error('Falha na orquestração de usuários.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Strategic <span className="text-gradient-gold">Human Capital</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <Lock size={14} className="text-primary" />
            Gestão de acessos, papéis estratégicos e auditoria de membros Platinum.
          </p>
        </div>
        <button className="btn-primary py-4 px-10 shadow-platinum-glow flex items-center gap-3 uppercase text-[10px] tracking-widest">
          <Plus className="w-5 h-5" />
          Vincular Especialista
        </button>
      </header>

      <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-xl border-border-subtle/30">
        <div className="p-8 bg-surface-elevated/20 border-b border-border-subtle flex items-center gap-6">
          <div className="relative max-w-md w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Pesquisar por nome, email ou cargo estratégico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum"
            />
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-platinum">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-elevated/30 border-b border-border-subtle">
              <tr>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Membro / Operação</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Identificação Digital</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Nível de Acesso</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Estado</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted text-right opacity-60">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/30">
              {loading ? (
                <tr><td colSpan={5} className="px-10 py-32 text-center">
                  <div className="flex flex-col items-center gap-6 justify-center opacity-40">
                    <Loader2 className="animate-spin w-12 h-12 text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted">Indexando Capital Humano...</p>
                  </div>
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-10 py-32 text-center">
                  <div className="flex flex-col items-center gap-6 opacity-20">
                     <User size={56} className="text-text-muted" />
                     <p className="text-[10px] font-black text-text-primary uppercase tracking-[0.4em]">Nenhum membro vinculado à estrutura</p>
                  </div>
                </td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-surface-elevated/20 transition-all group border-b border-border-subtle/20 duration-300">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-border-subtle flex items-center justify-center font-black text-primary text-xs shadow-inner-platinum group-hover:scale-110 transition-transform duration-500">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-text-primary group-hover:text-primary transition-colors uppercase tracking-tight text-sm">{u.name}</span>
                          <span className="text-[9px] text-text-muted uppercase tracking-[0.2em] font-black italic opacity-60">Operador Estratégico Platinum</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3 text-text-secondary text-xs font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                        <Mail size={14} className="text-primary/60" />
                        {u.email}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      {u.role === 'Admin' ? (
                        <span className="flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest rounded-xl shadow-platinum-glow-sm">
                          <Shield size={12} /> Full Administrative Master
                        </span>
                      ) : (
                        <span className="flex items-center gap-3 px-4 py-2 bg-surface-elevated/40 border border-border-subtle text-text-muted text-[9px] font-black uppercase tracking-widest rounded-xl">
                          Standard Flow Operator
                        </span>
                      )}
                    </td>
                    <td className="px-10 py-8">
                      <span className={`flex items-center gap-2 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl border w-fit shadow-platinum-glow-sm ${
                        u.status === 'Active' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full bg-current ${u.status === 'Active' ? 'animate-pulse shadow-platinum-glow' : ''}`} />
                        {u.status === 'Active' ? 'Operacional' : 'Restrito'}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                        <button className="p-3 bg-surface-elevated/40 border border-border-subtle rounded-xl text-text-muted hover:text-primary hover:scale-110 transition-all shadow-platinum-glow-sm"><Edit2 size={18} /></button>
                        <button className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500/60 hover:text-red-500 hover:scale-110 transition-all shadow-platinum-glow-sm"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Banner */}
      <div className="platinum-card p-10 bg-surface-elevated/10 backdrop-blur-xl border-l-4 border-l-primary flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
        <div className="flex items-center gap-8 relative z-10">
          <div className="p-5 bg-primary/10 rounded-[2.5rem] text-primary border border-primary/20 shadow-platinum-glow-sm group-hover:scale-110 transition-transform duration-500">
            <ShieldCheck size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-black text-text-primary uppercase tracking-[0.3em]">Criptografia de Acesso Ativa Platinum</h3>
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-black opacity-60 leading-relaxed max-w-md">Todos os logins são auditados e protegidos por protocolo TLS 1.3 avançado e criptografia RSA 4096-bit.</p>
          </div>
        </div>
        <button className="px-10 py-4 bg-surface-elevated/40 border border-border-subtle text-text-primary rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-surface-elevated hover:scale-105 transition-all shadow-platinum-glow-sm relative z-10">
          Logs de Auditoria Neural
        </button>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/5 blur-[80px] rounded-full group-hover:bg-primary/10 transition-all duration-700" />
      </div>
    </div>
  );
}
