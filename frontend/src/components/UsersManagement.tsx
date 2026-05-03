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
    <div className="p-8 w-full min-h-screen bg-background space-y-8 text-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Strategic <span className="text-gradient-gold">Human Capital</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <Lock size={12} className="text-primary" />
            Gestão de acessos, papéis estratégicos e auditoria de membros.
          </p>
        </div>
        <button className="flex items-center gap-3 px-8 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow uppercase text-[10px] tracking-widest">
          <Plus className="w-4 h-4" />
          Vincular Especialista
        </button>
      </header>

      <div className="platinum-card overflow-hidden">
        <div className="p-6 bg-white/[0.01] border-b border-white/5 flex items-center gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Pesquisar por nome, email ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-background border border-white/5 rounded-xl text-sm text-white focus:border-primary/30 outline-none transition-all placeholder:text-text-muted"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/5">
              <tr>
                <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Membro / Operação</th>
                <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Identificação Digital</th>
                <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Nível de Acesso</th>
                <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Estado</th>
                <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-12 text-center text-text-muted"><Loader2 className="animate-spin inline w-8 h-8 opacity-20" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-12 text-center text-text-muted uppercase text-[10px] font-black tracking-widest">Nenhum membro vinculado à estrutura</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-primary text-xs shadow-inner">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white group-hover:text-primary transition-colors uppercase tracking-tight">{u.name}</span>
                          <span className="text-[8px] text-text-muted uppercase tracking-[0.2em] font-black italic">Operador Estratégico</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-text-secondary text-xs">
                        <Mail size={12} className="opacity-40" />
                        {u.email}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {u.role === 'Admin' ? (
                        <span className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest rounded-md">
                          <Shield size={10} /> Full Administrative
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-text-muted text-[9px] font-black uppercase tracking-widest rounded-md">
                          Standard Operator
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border ${u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        {u.status === 'Active' ? 'Operacional' : 'Restrito'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-1">
                        <button className="p-2 text-text-muted hover:text-primary transition-all"><Edit2 size={16} /></button>
                        <button className="p-2 text-text-muted hover:text-red-400 transition-all"><Trash2 size={16} /></button>
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
      <div className="platinum-card p-8 bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-l-primary flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-primary/10 rounded-[2rem] text-primary">
            <ShieldCheck size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Criptografia de Acesso Ativa</h3>
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Todos os logins são auditados e protegidos por protocolo TLS 1.3 avançado.</p>
          </div>
        </div>
        <button className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
          Ver Logs de Auditoria
        </button>
      </div>
    </div>
  );
}
