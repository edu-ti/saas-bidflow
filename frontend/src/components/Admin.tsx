import { useState, useEffect, useCallback } from 'react';
import { usePermissions } from '../hooks/usePermissions';
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
  const { hasPermission } = usePermissions();
  const canCreateUser = hasPermission('modules', 'settings-admin', 'create');
  const canUpdateUser = hasPermission('modules', 'settings-admin', 'update');
  const canDeleteUser = hasPermission('modules', 'settings-admin', 'delete');
  const canUpdateCompany = hasPermission('modules', 'settings-admin', 'update');

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
        toast.success('Perfil atualizado com sucesso.');
      } else {
        await api.post('/api/tenant/users', formData);
        toast.success('Novo usuário adicionado.');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      toast.error('Erro ao salvar usuário.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Administração do Sistema
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Configurações globais, segurança e gestão de acessos.
          </p>
        </div>
        <div className="flex items-center gap-4 card px-6 py-4">
           <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-medium text-text-muted">Tenant Node</span>
              <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-md">Ativo</span>
           </div>
           <div className="w-px h-10 bg-border mx-1" />
           <div className="p-2 bg-success/10 rounded-lg text-success">
             <Activity className="w-5 h-5 animate-pulse" />
           </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Vertical Nav */}
        <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0">
          {[
            { id: 'users', label: 'Utilizadores', icon: Users, desc: 'Gestão de acessos', color: 'text-primary' },
            { id: 'company', label: 'Empresa', icon: Building2, desc: 'Dados corporativos', color: 'text-primary' },
            { id: 'security', label: 'Segurança', icon: Shield, desc: 'Auditoria e acessos', color: 'text-primary' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`p-4 rounded-xl border transition-all text-left group flex items-center justify-between ${
                activeTab === tab.id 
                  ? 'bg-bg-tertiary border-border' 
                  : 'bg-transparent border-transparent hover:bg-bg-secondary'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-bg-tertiary text-text-muted group-hover:text-text-primary'}`}>
                  <tab.icon size={18} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${activeTab === tab.id ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>{tab.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{tab.desc}</p>
                </div>
              </div>
              {activeTab === tab.id && <ChevronRight size={16} className="text-text-muted" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[500px]">
          {activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="card p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Pesquisar utilizador..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input w-full pl-9"
                  />
                </div>
                {canCreateUser && (
                  <button
                    onClick={() => handleOpenModal()}
                    className="btn btn-primary flex items-center gap-2 w-full md:w-auto justify-center"
                  >
                    <Plus className="w-4 h-4" /> <span>Adicionar Utilizador</span>
                  </button>
                )}
              </div>

              <div className="card overflow-hidden">
                {loading ? (
                  <div className="py-32 text-center flex flex-col items-center gap-4">
                     <Loader2 className="animate-spin w-8 h-8 text-primary" />
                     <p className="text-sm font-medium text-text-muted">Carregando utilizadores...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-bg-tertiary border-b border-border text-text-secondary">
                        <tr>
                          <th className="px-6 py-3 font-medium">Utilizador</th>
                          <th className="px-6 py-3 font-medium">Cargo</th>
                          <th className="px-6 py-3 font-medium">Status</th>
                          <th className="px-6 py-3 font-medium text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                          <tr key={user.id} className="hover:bg-bg-tertiary transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-bg-secondary border border-border flex items-center justify-center text-text-secondary font-semibold">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-text-primary group-hover:text-primary transition-colors">{user.name}</p>
                                  <p className="text-xs text-text-muted mt-0.5">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-bg-secondary text-text-primary rounded text-xs font-medium border border-border">
                                  {user.role}
                                </span>
                                {user.position && <span className="text-xs text-text-muted">{user.position}</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-2">
                                 <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-success' : 'bg-danger'}`} />
                                 <span className="text-xs font-medium text-text-secondary capitalize">{user.status}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {canUpdateUser && (
                                  <button onClick={() => handleOpenModal(user)} className="p-2 text-text-muted hover:text-primary hover:bg-bg-secondary rounded-lg transition-colors">
                                    <Pencil size={16} />
                                  </button>
                                )}
                                {canDeleteUser && (
                                  <button className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                  </button>
                                )}
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
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
               <div className="card p-6 space-y-8">
                  <div className="flex items-center gap-3 border-b border-border pb-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-text-primary">Dados da Empresa</h3>
                      <p className="text-sm text-text-muted">Informações cadastrais e fiscais</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-text-primary">Razão Social / Nome Fantasia</label>
                      <input
                        type="text"
                        value={company.name || ''}
                        onChange={(e) => setCompany({ ...company, name: e.target.value })}
                        className="input w-full"
                        placeholder="Ex: BidFlow Enterprise LTDA"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-text-primary">CNPJ</label>
                      <input
                        type="text"
                        value={company.cnpj || ''}
                        onChange={(e) => setCompany({ ...company, cnpj: e.target.value })}
                        className="input w-full"
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-text-primary">Email Institucional</label>
                      <input
                        type="text"
                        value={company.email || ''}
                        onChange={(e) => setCompany({ ...company, email: e.target.value })}
                        className="input w-full"
                        placeholder="contato@empresa.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-text-primary">Telefone</label>
                      <input
                        type="text"
                        value={company.phone || ''}
                        onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                        className="input w-full"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-sm font-medium text-text-primary">Endereço Completo</label>
                      <input
                        type="text"
                        value={company.address || ''}
                        onChange={(e) => setCompany({ ...company, address: e.target.value })}
                        className="input w-full"
                        placeholder="Logradouro, Nº, Bairro, Cidade - UF, CEP"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-6 border-t border-border">
                    {canUpdateCompany && (
                      <button className="btn btn-primary flex items-center gap-2">
                        <Save className="w-4 h-4" /> <span>Salvar Alterações</span>
                      </button>
                    )}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Uptime Sistema', val: '99.98%', icon: Activity, color: 'text-success', bg: 'bg-success/10' },
                    { label: 'Certificados', val: 'Ativos', icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Auditoria', val: 'Monitorando', icon: Server, color: 'text-warning', bg: 'bg-warning/10' },
                  ].map((stat, i) => (
                    <div key={i} className="card p-5 flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                        <stat.icon size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-text-muted">{stat.label}</p>
                        <p className="text-base font-semibold text-text-primary mt-0.5">{stat.val}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'security' && (
             <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="card p-10 text-center flex flex-col items-center">
                   <div className="w-20 h-20 bg-bg-secondary rounded-2xl flex items-center justify-center mb-6 border border-border">
                      <ShieldAlert size={40} className="text-text-muted" />
                   </div>
                   <h2 className="text-xl font-semibold text-text-primary mb-2">Configurações de Segurança</h2>
                   <p className="text-text-secondary text-sm max-w-md mx-auto mb-8">
                      Este módulo gerencia chaves de criptografia, auditoria de logins e permissões avançadas de acesso à plataforma.
                   </p>
                   <button className="btn btn-outline" disabled>
                      Recursos Avançados em Breve
                   </button>
                </div>
             </div>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingUser ? 'Editar Utilizador' : 'Novo Utilizador'} size="md">
        <form onSubmit={handleSaveUser} className="p-6 space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Nome Completo <span className="text-danger">*</span></label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
              <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input w-full pl-9" placeholder="Nome do colaborador" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Email <span className="text-danger">*</span></label>
              <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                 <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="input w-full pl-9" placeholder="email@empresa.com" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Perfil de Acesso</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="input w-full pl-9 appearance-none">
                  <option value="admin">Administrador</option>
                  <option value="manager">Gerente</option>
                  <option value="user">Operador</option>
                  <option value="analyst">Analista</option>
                </select>
                <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
             <label className="text-sm font-medium text-text-primary">Cargo / Posição</label>
             <input type="text" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} className="input w-full" placeholder="Ex: Diretor Comercial" />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancelar</button>
            {(editingUser ? canUpdateUser : canCreateUser) && (
              <button type="submit" className="btn btn-primary">
                 Salvar
              </button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}