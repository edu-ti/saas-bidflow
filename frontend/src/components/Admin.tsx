import { useState, useEffect, useCallback } from 'react';
import {
  Users, Building2, Settings as SettingsIcon, Plus, Search, Loader2, Pencil, Trash2,
  MoreVertical, Check, X, Mail, Phone, Shield, UserCheck, UserX, Save, ShieldCheck,
  Zap, BarChart3, Target, Globe, Server, Lock
} from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import Modal from './ui/Modal';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  position?: string;
  status: string;
  created_at: string;
}

interface Company {
  id: number;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  subdomain?: string;
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'users' | 'company' | 'security'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    position: '',
    password: '',
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/tenant/users');
      setUsers(res.data.data || res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  const fetchCompany = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const userData = storedUser ? JSON.parse(storedUser) : {};
      const res = await api.get(`/api/companies/${userData.company_id}`);
      setCompany(res.data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'company') fetchCompany();
  }, [activeTab, fetchUsers, fetchCompany]);

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, phone: user.phone || '', role: user.role || 'user', position: user.position || '', password: '' });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', phone: '', role: 'user', position: '', password: '' });
    }
    setShowModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/api/tenant/users/${editingUser.id}`, formData);
        toast.success('Perfil atualizado no diretório.');
      } else {
        await api.post('/api/tenant/users', formData);
        toast.success('Novo acesso concedido.');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      toast.error('Erro na sincronização de segurança.');
    }
  };

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-8 text-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Administrative <span className="text-gradient-gold">Control Center</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <Lock size={12} className="text-primary" />
            Configurações globais de segurança, governança e identidade corporativa.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/5 border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-platinum-glow" />
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Tenant Active</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Vertical Nav */}
        <div className="w-full lg:w-72 flex flex-col gap-2 shrink-0">
          {[
            { id: 'users', label: 'Utilizadores', icon: Users, desc: 'Gestão de acessos' },
            { id: 'company', label: 'Empresa', icon: Building2, desc: 'Identidade e Dados' },
            { id: 'security', label: 'Segurança', icon: Shield, desc: 'Auditoria e Chaves' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`p-4 rounded-2xl border transition-all text-left group ${
                activeTab === tab.id 
                  ? 'bg-primary/10 border-primary/20 shadow-platinum-glow' 
                  : 'bg-white/[0.02] border-transparent hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl transition-all ${activeTab === tab.id ? 'bg-primary text-background' : 'bg-white/5 text-text-muted'}`}>
                  <tab.icon size={18} />
                </div>
                <div>
                  <p className={`text-xs font-black uppercase tracking-widest ${activeTab === tab.id ? 'text-primary' : 'text-white'}`}>{tab.label}</p>
                  <p className="text-[10px] text-text-muted uppercase tracking-tighter">{tab.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6 overflow-hidden">
          {activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="platinum-card p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Filtrar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-background border border-white/5 rounded-xl text-sm focus:border-primary/30 outline-none transition-all text-white"
                  />
                </div>
                <button
                  onClick={() => handleOpenModal()}
                  className="px-6 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover shadow-platinum-glow text-[10px] uppercase tracking-[0.2em] w-full md:w-auto"
                >
                  <Plus className="w-4 h-4 inline mr-2" /> Adicionar Operador
                </button>
              </div>

              <div className="platinum-card overflow-hidden">
                {loading ? (
                  <div className="p-20 text-center opacity-40"><Loader2 className="animate-spin inline mr-3" /> Indexando Diretório...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/5 border-b border-white/5">
                        <tr>
                          <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Utilizador</th>
                          <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Qualificação</th>
                          <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Status</th>
                          <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                          <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-primary font-black uppercase">
                                  {user.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-white group-hover:text-primary transition-colors">{user.name}</p>
                                  <p className="text-[10px] text-text-muted font-mono">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-text-muted text-[9px] font-black uppercase tracking-widest">
                                {user.role} | {user.position || 'Standard'}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-2">
                                 <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500 shadow-platinum-glow' : 'bg-red-500'}`} />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{user.status}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenModal(user)} className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 text-text-muted transition-all"><Pencil size={14} /></button>
                                <button className="p-2.5 bg-red-500/5 rounded-xl hover:bg-red-500/10 text-red-400/60 transition-all"><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'company' && company && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
               <div className="platinum-card p-8 space-y-8">
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                    <Building2 className="text-primary" size={16} /> Identidade Corporativa
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { label: 'Razão Social', val: company.name, key: 'name' },
                      { label: 'CNPJ / RPA Tax ID', val: company.cnpj, key: 'cnpj' },
                      { label: 'Email Institucional', val: company.email, key: 'email' },
                      { label: 'Telefone Principal', val: company.phone, key: 'phone' },
                    ].map(field => (
                      <div key={field.key} className="space-y-1">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{field.label}</label>
                        <input
                          type="text"
                          value={field.val || ''}
                          onChange={(e) => setCompany({ ...company, [field.key]: e.target.value })}
                          className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none"
                        />
                      </div>
                    ))}
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Sede / Endereço Fiscal</label>
                      <input
                        type="text"
                        value={company.address || ''}
                        onChange={(e) => setCompany({ ...company, address: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-6 border-t border-white/5">
                    <button className="px-10 py-3 bg-primary text-background font-black rounded-xl shadow-platinum-glow text-[10px] uppercase tracking-widest hover:bg-primary-hover transition-all">
                      <Save className="inline mr-2" size={14} /> Consolidar Dados
                    </button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingUser ? 'REFINAR OPERADOR' : 'NOVO ACESSO ESTRATÉGICO'} size="md">
        <form onSubmit={handleSaveUser} className="space-y-6 p-2">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Nome Completo *</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Email Principal *</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Perfil de Acesso</label>
              <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none appearance-none">
                <option value="admin" className="bg-surface">Administrador</option>
                <option value="manager" className="bg-surface">Gerente</option>
                <option value="user" className="bg-surface">Operador</option>
                <option value="analyst" className="bg-surface">Analista</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
            <button type="button" onClick={() => setShowModal(false)} className="px-8 py-3 text-text-muted font-bold hover:text-white transition-all text-xs uppercase tracking-widest">Cancelar</button>
            <button type="submit" className="px-10 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover shadow-platinum-glow text-[10px] uppercase tracking-widest">Confirmar Operador</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}