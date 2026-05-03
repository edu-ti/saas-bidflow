import { useState, useEffect, useCallback } from 'react';
import {
  Users, Building2, Settings as SettingsIcon, Plus, Search, Loader2, Pencil, Trash2,
  MoreVertical, Check, X, Mail, Phone, Shield, UserCheck, UserX, Save, ShieldCheck,
  Zap, BarChart3, Target, Globe, Server, Lock, ChevronRight, Activity, ShieldAlert
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
    } catch (err) { }
    finally { setLoading(false); }
  }, []);

  const fetchCompany = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const userData = storedUser ? JSON.parse(storedUser) : {};
      const res = await api.get(`/api/companies/${userData.company_id}`);
      setCompany(res.data);
    } catch (err) { }
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
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700 overflow-x-hidden">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Administrative <span className="text-gradient-gold">Control Center</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <Lock size={14} className="text-primary" />
            Configurações globais de segurança, governança e identidade corporativa Platinum.
          </p>
        </div>
        <div className="flex items-center gap-5">
          <div className="bg-surface-elevated/20 border border-border-subtle px-6 py-3 rounded-2xl flex items-center gap-4 shadow-platinum-glow-sm backdrop-blur-md">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 blur-[2px]" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted opacity-80 italic">Tenant Node: <span className="text-emerald-500">Active</span></span>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Vertical Nav */}
        <div className="w-full lg:w-80 flex flex-col gap-3 shrink-0">
          {[
            { id: 'users', label: 'Utilizadores', icon: Users, desc: 'Gestão de acessos core', color: 'text-primary' },
            { id: 'company', label: 'Empresa', icon: Building2, desc: 'Identidade e Dados fiscais', color: 'text-blue-500' },
            { id: 'security', label: 'Segurança', icon: Shield, desc: 'Auditoria e Chaves RSA', color: 'text-amber-500' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`p-5 rounded-[2rem] border transition-all duration-500 text-left group relative overflow-hidden ${
                activeTab === tab.id 
                  ? 'bg-surface-elevated border-primary/40 shadow-platinum-glow' 
                  : 'bg-surface-elevated/10 border-transparent hover:bg-surface-elevated/20 hover:border-border-subtle'
              }`}
            >
              <div className="flex items-center gap-5 relative z-10">
                <div className={`p-3.5 rounded-2xl transition-all duration-500 ${activeTab === tab.id ? 'bg-primary text-background shadow-platinum-glow-sm scale-110' : 'bg-surface-elevated/40 text-text-muted group-hover:text-primary'}`}>
                  <tab.icon size={22} />
                </div>
                <div>
                  <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${activeTab === tab.id ? 'text-text-primary' : 'text-text-muted group-hover:text-text-primary'}`}>{tab.label}</p>
                  <p className="text-[9px] text-text-muted/60 uppercase tracking-tight mt-1 font-bold">{tab.desc}</p>
                </div>
                {activeTab === tab.id && <ChevronRight size={14} className="ml-auto text-primary" />}
              </div>
              {activeTab === tab.id && <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-8 overflow-hidden min-h-[600px]">
          {activeTab === 'users' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
              <div className="platinum-card p-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-surface-elevated/10 backdrop-blur-xl">
                <div className="relative flex-1 w-full group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Pesquisar por nome, email ou cargo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-background/50 border border-border-subtle rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum"
                  />
                </div>
                <button
                  onClick={() => handleOpenModal()}
                  className="btn-primary py-4 px-10 shadow-platinum-glow w-full md:w-auto"
                >
                  <Plus className="w-5 h-5" /> Adicionar Operador
                </button>
              </div>

              <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md">
                {loading ? (
                  <div className="py-40 text-center opacity-40 flex flex-col items-center gap-6">
                     <Loader2 className="animate-spin w-12 h-12 text-primary" />
                     <p className="text-[10px] font-black uppercase tracking-[0.4em]">Indexando Diretório Global...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto scrollbar-platinum">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-surface-elevated/30 border-b border-border-subtle">
                          <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Operador / Identidade</th>
                          <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Qualificação</th>
                          <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Acesso</th>
                          <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60 text-right">Controles</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle/30">
                        {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                          <tr key={user.id} className="hover:bg-surface-elevated/20 transition-all group border-b border-border-subtle/20 duration-300">
                            <td className="px-10 py-8">
                              <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-surface-elevated/60 border border-border-subtle flex items-center justify-center text-primary font-black uppercase text-lg shadow-platinum-glow-sm group-hover:scale-110 transition-transform duration-300">
                                  {user.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-black text-text-primary group-hover:text-primary transition-colors tracking-tight text-sm uppercase">{user.name}</p>
                                  <p className="text-[10px] text-text-muted font-black tracking-widest mt-1 opacity-60">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-8">
                              <span className="px-3.5 py-1.5 rounded-xl bg-surface-elevated/40 border border-border-subtle text-text-muted text-[9px] font-black uppercase tracking-[0.2em] group-hover:text-text-primary transition-colors">
                                {user.role} <span className="opacity-40 px-1">|</span> {user.position || 'Standard Core'}
                              </span>
                            </td>
                            <td className="px-10 py-8">
                               <div className="flex items-center gap-3">
                                 <div className={`w-2.5 h-2.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
                                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted group-hover:text-text-primary transition-colors">{user.status}</span>
                               </div>
                            </td>
                            <td className="px-10 py-8 text-right">
                              <div className="flex items-center justify-end gap-3 opacity-40 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                                <button onClick={() => handleOpenModal(user)} className="p-3 bg-surface-elevated/40 border border-border-subtle rounded-xl hover:bg-primary/20 hover:text-primary text-text-muted transition-all hover:scale-110 shadow-platinum-glow-sm"><Pencil size={18} /></button>
                                <button className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl hover:bg-red-500/20 text-red-500/60 transition-all hover:scale-110 shadow-platinum-glow-sm"><Trash2 size={18} /></button>
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
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-700">
               <div className="platinum-card p-10 space-y-10 bg-surface-elevated/10 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-text-primary uppercase tracking-[0.3em] flex items-center gap-4">
                      <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-platinum-glow-sm">
                        <Building2 size={20} />
                      </div>
                      Identidade Corporativa Core
                    </h3>
                    <div className="px-4 py-1.5 bg-surface-elevated/40 rounded-full border border-border-subtle text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Compliance: Verified</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {[
                      { label: 'Razão Social / Nome Fantasia', val: company.name, key: 'name', placeholder: 'Ex: BidFlow Enterprise LTDA' },
                      { label: 'CNPJ / RPA Tax ID', val: company.cnpj, key: 'cnpj', placeholder: '00.000.000/0000-00' },
                      { label: 'Email Institucional Master', val: company.email, key: 'email', placeholder: 'contato@empresa.com' },
                      { label: 'Telefone Principal / Suporte', val: company.phone, key: 'phone', placeholder: '+55 (00) 00000-0000' },
                    ].map(field => (
                      <div key={field.key} className="space-y-3 group">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1 group-focus-within:text-primary transition-colors">{field.label}</label>
                        <input
                          type="text"
                          value={field.val || ''}
                          onChange={(e) => setCompany({ ...company, [field.key]: e.target.value })}
                          className="w-full px-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/30 shadow-inner-platinum"
                          placeholder={field.placeholder}
                        />
                      </div>
                    ))}
                    <div className="md:col-span-2 space-y-3 group">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1 group-focus-within:text-primary transition-colors">Sede Global / Endereço Fiscal Platinum</label>
                      <input
                        type="text"
                        value={company.address || ''}
                        onChange={(e) => setCompany({ ...company, address: e.target.value })}
                        className="w-full px-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/30 shadow-inner-platinum"
                        placeholder="Logradouro, Nº, Bairro, Cidade - UF, CEP"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-10 border-t border-border-subtle">
                    <button className="btn-primary py-4 px-12 shadow-platinum-glow uppercase text-[11px] tracking-[0.2em]">
                      <Save className="w-5 h-5" /> Consolidar Dados Mestres
                    </button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { label: 'Uptime Sistema', val: '99.98%', icon: Activity, color: 'text-emerald-500' },
                    { label: 'Certificados', val: 'Active RSA', icon: ShieldCheck, color: 'text-blue-500' },
                    { label: 'Logs Auditoria', val: '24/7 Monitoring', icon: Server, color: 'text-amber-500' },
                  ].map((stat, i) => (
                    <div key={i} className="platinum-card p-6 bg-surface-elevated/10 flex items-center gap-5 border border-border-subtle/30 backdrop-blur-sm">
                      <div className={`p-3 rounded-2xl bg-surface-elevated/40 ${stat.color}`}>
                        <stat.icon size={20} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">{stat.label}</p>
                        <p className="text-sm font-black text-text-primary tracking-tight mt-0.5">{stat.val}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'security' && (
             <div className="space-y-8 animate-in slide-in-from-left-8 duration-700">
                <div className="platinum-card p-12 text-center bg-surface-elevated/10 backdrop-blur-xl border-dashed border-2 border-border-subtle">
                   <div className="w-24 h-24 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-platinum-glow-sm relative">
                      <div className="absolute inset-0 bg-amber-500/5 rounded-3xl animate-ping opacity-20" />
                      <ShieldAlert size={48} className="text-amber-500 relative z-10" />
                   </div>
                   <h2 className="text-2xl font-black text-text-primary uppercase tracking-tighter mb-4">Camada de Segurança Nível 5</h2>
                   <p className="text-text-muted max-w-lg mx-auto text-sm font-medium leading-relaxed mb-10 opacity-70">
                      Este módulo gerencia chaves de criptografia RSA-2048, auditoria de logins (IP/UA) e permissões granulares de acesso à API BidFlow.
                   </p>
                   <button className="btn-primary py-4 px-12 shadow-platinum-glow mx-auto opacity-40 cursor-not-allowed">
                      Configurações Avançadas de Criptografia
                   </button>
                   <p className="mt-8 text-[9px] font-black uppercase tracking-[0.5em] text-text-muted opacity-40 flex items-center justify-center gap-4 italic">
                      <Lock size={10} /> Encrypted Session <Lock size={10} />
                   </p>
                </div>
             </div>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingUser ? 'REFINAR OPERADOR ESTRATÉGICO' : 'NOVO ACESSO CORE'} size="md">
        <form onSubmit={handleSaveUser} className="space-y-10 p-2">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Nome Completo do Colaborador *</label>
            <div className="relative">
              <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/60 w-5 h-5" />
              <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full pl-14 pr-5 py-4 bg-background border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum" placeholder="Nome Completo" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Email Principal (SSO) *</label>
              <div className="relative">
                 <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                 <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full pl-14 pr-5 py-4 bg-background border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum" placeholder="email@empresa.com" />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Perfil de Acesso</label>
              <div className="relative">
                <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full pl-14 pr-10 py-4 bg-background border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none appearance-none cursor-pointer">
                  <option value="admin" className="bg-surface font-bold text-text-primary">Administrador Master</option>
                  <option value="manager" className="bg-surface font-bold text-text-primary">Gerente de Operações</option>
                  <option value="user" className="bg-surface font-bold text-text-primary">Operador de Funil</option>
                  <option value="analyst" className="bg-surface font-bold text-text-primary">Analista de BI</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
             <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Cargo / Posição Estratégica</label>
             <input type="text" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} className="w-full px-6 py-4 bg-background border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum" placeholder="Ex: Diretor de Licitações" />
          </div>

          <div className="flex justify-end gap-6 pt-10 border-t border-border-subtle">
            <button type="button" onClick={() => setShowModal(false)} className="px-10 py-4 text-text-muted font-black hover:text-text-primary uppercase tracking-[0.3em] transition-all text-[10px]">Descartar</button>
            <button type="submit" className="btn-primary py-4 px-12 shadow-platinum-glow uppercase text-[10px] tracking-[0.3em]">
               <ShieldCheck className="w-5 h-5" /> Confirmar Operador
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}