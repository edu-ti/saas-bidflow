import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { 
  User, Mail, Shield, ShieldCheck, Plus, Search, Loader2, 
  Edit2, Trash2, Zap, Lock, Settings, Users, Key,
  Check, X, AlertCircle, Save, BarChart3, KanbanSquare, 
  Radar, Activity, Wallet, CreditCard, Briefcase, Boxes, 
  Bot, MessageSquare, FileText, Send, Database
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserData {
  id: number;
  name: string;
  email: string;
  role_id: number | null;
  role_name?: string;
  status: string;
}

interface Role {
  id: number;
  name: string;
  permissions: Record<string, Record<string, boolean>>;
}

const MODULES = [
  // Gestão
  { id: 'dashboard', label: 'Dashboard Geral', icon: Zap },
  { id: 'reports', label: 'Relatórios & BI', icon: BarChart3 },
  
  // Comercial
  { id: 'leads', label: 'Gestão de Leads', icon: Users },
  { id: 'clients', label: 'Base de Clientes', icon: User },
  { id: 'proposals', label: 'Propostas de Valor', icon: FileText },
  { id: 'sales_funnel', label: 'Funil de Vendas', icon: KanbanSquare },
  
  // Licitações
  { id: 'bidding_radar', label: 'Radar de Licitações', icon: Radar },
  { id: 'bidding_capture', label: 'Captação de Editais', icon: Activity },
  { id: 'bidding_funnel', label: 'Funil de Licitações', icon: KanbanSquare },
  
  // Operacional/Financeiro
  { id: 'finance', label: 'Motor Financeiro', icon: Wallet },
  { id: 'accounts', label: 'Contas Pagar/Receber', icon: CreditCard },
  { id: 'contracts', label: 'Gestão de Contratos', icon: Briefcase },
  
  // Estoque/Adicionais
  { id: 'inventory', label: 'Inventário de Estoque', icon: Boxes },
  { id: 'marketing', label: 'Marketing / Campanhas', icon: Send },
  { id: 'chatbot', label: 'Chatbot Architect', icon: Bot },
  
  // Configurações
  { id: 'admin', label: 'Configurações Empresa', icon: Settings },
  { id: 'users', label: 'Equipe e Perfis', icon: Lock },
];

const ACTIONS = [
  { id: 'view', label: 'Visualizar' },
  { id: 'create', label: 'Criar' },
  { id: 'edit', label: 'Editar' },
  { id: 'delete', label: 'Excluir' },
];

export default function UsersManagement() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [users, setUsers] = useState<UserData[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    permissions: {} as Record<string, Record<string, boolean>>
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/api/tenant/users'),
        api.get('/api/roles')
      ]);
      setUsers(usersRes.data.data || usersRes.data || []);
      setRoles(rolesRes.data || []);
    } catch (err) {
      toast.error('Falha na orquestração de dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenRoleModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setRoleForm({
        name: role.name,
        permissions: role.permissions || {}
      });
    } else {
      setEditingRole(null);
      // Initialize permissions
      const initialPerms: any = {};
      MODULES.forEach(m => {
        initialPerms[m.id] = { view: false, create: false, edit: false, delete: false };
      });
      setRoleForm({ name: '', permissions: initialPerms });
    }
    setShowRoleModal(true);
  };

  const togglePermission = (moduleId: string, actionId: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleId]: {
          ...(prev.permissions[moduleId] || {}),
          [actionId]: !prev.permissions[moduleId]?.[actionId]
        }
      }
    }));
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await api.put(`/api/roles/${editingRole.id}`, roleForm);
        toast.success('Perfil de acesso atualizado.');
      } else {
        await api.post('/api/roles', roleForm);
        toast.success('Novo perfil de acesso consolidado.');
      }
      setShowRoleModal(false);
      fetchData();
    } catch (err) {
      toast.error('Erro na persistência do perfil.');
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (!confirm('Excluir este perfil de acesso?')) return;
    try {
      await api.delete(`/api/roles/${id}`);
      toast.success('Perfil removido.');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao remover perfil.');
    }
  };

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Access <span className="text-gradient-gold">Governance</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <Lock size={14} className="text-primary" />
            Gestão de usuários e matriz de permissões Platinum.
          </p>
        </div>
        
        <div className="flex gap-4">
          {activeTab === 'users' ? (
            <button className="btn-primary py-4 px-10 shadow-platinum-glow flex items-center gap-3 uppercase text-[10px] tracking-widest">
              <Plus className="w-5 h-5" /> Vincular Especialista
            </button>
          ) : (
            <button 
              onClick={() => handleOpenRoleModal()}
              className="btn-primary py-4 px-10 shadow-platinum-glow flex items-center gap-3 uppercase text-[10px] tracking-widest"
            >
              <Shield className="w-5 h-5" /> Novo Perfil de Acesso
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-border-subtle gap-10 px-4">
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-4 text-[10px] font-black uppercase tracking-[0.4em] transition-all relative ${activeTab === 'users' ? 'text-primary' : 'text-text-muted hover:text-text-secondary'}`}
        >
          Usuários
          {activeTab === 'users' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary shadow-platinum-glow animate-in slide-in-from-bottom-2" />}
        </button>
        <button 
          onClick={() => setActiveTab('roles')}
          className={`pb-4 text-[10px] font-black uppercase tracking-[0.4em] transition-all relative ${activeTab === 'roles' ? 'text-primary' : 'text-text-muted hover:text-text-secondary'}`}
        >
          Perfis de Acesso
          {activeTab === 'roles' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary shadow-platinum-glow animate-in slide-in-from-bottom-2" />}
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-xl border-border-subtle/30">
          {/* User Table (Keep original logic but updated for Roles) */}
          <div className="p-8 bg-surface-elevated/20 border-b border-border-subtle flex items-center gap-6">
            <div className="relative max-w-md w-full group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Pesquisar membros..."
                className="w-full pl-14 pr-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-elevated/30 border-b border-border-subtle">
                <tr>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Membro</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Identificação</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Perfil</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Estado</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted text-right opacity-60">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/30">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-surface-elevated/20 transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6 font-black uppercase tracking-tight text-sm">
                        {u.name}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-text-secondary font-bold text-xs">{u.email}</td>
                    <td className="px-10 py-8">
                      <span className="flex items-center gap-3 px-4 py-2 bg-primary/5 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest rounded-xl">
                        <Key size={12} /> {u.role_name || 'Admin Principal'}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">Operacional</span>
                    </td>
                    <td className="px-10 py-8 text-right opacity-0 group-hover:opacity-100 transition-all">
                       <button className="p-3 bg-surface-elevated/40 border border-border-subtle rounded-xl text-text-muted hover:text-primary"><Edit2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roles.map(role => (
            <div key={role.id} className="platinum-card p-8 bg-surface-elevated/10 backdrop-blur-xl border-border-subtle/30 space-y-6 group hover:border-primary/40 transition-all duration-500">
               <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-text-primary uppercase tracking-tighter">{role.name}</h3>
                    <p className="text-[9px] text-text-muted font-black uppercase tracking-widest">Perfil de Acesso Platinum</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenRoleModal(role)} className="p-2.5 bg-surface-elevated/40 rounded-xl text-text-muted hover:text-primary transition-all"><Edit2 size={14} /></button>
                    <button onClick={() => handleDeleteRole(role.id)} className="p-2.5 bg-red-500/5 rounded-xl text-red-500/60 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                  </div>
               </div>
               
               <div className="pt-6 border-t border-border-subtle/20 flex flex-wrap gap-2">
                  {Object.keys(role.permissions).slice(0, 3).map(mod => (
                    <span key={mod} className="px-3 py-1.5 bg-primary/5 text-primary text-[8px] font-black uppercase tracking-widest rounded-lg border border-primary/10">
                      {mod.toUpperCase()}
                    </span>
                  ))}
                  {Object.keys(role.permissions).length > 3 && <span className="px-3 py-1.5 bg-surface-elevated/40 text-text-muted text-[8px] font-black uppercase tracking-widest rounded-lg">+{Object.keys(role.permissions).length - 3}</span>}
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Role Modal with Matrix UI */}
      {showRoleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl p-6 animate-in fade-in duration-500">
          <div className="bg-surface-elevated border border-border-subtle rounded-[3rem] shadow-platinum-glow w-full max-w-5xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col">
            <div className="px-10 py-8 border-b border-border-subtle flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-text-primary uppercase tracking-[0.4em]">Arquitetura de Permissões</h2>
                <p className="text-[10px] text-text-muted uppercase tracking-[0.3em] font-black">Configuração de Matriz de Acesso Platinum</p>
              </div>
              <button onClick={() => setShowRoleModal(false)} className="p-3 hover:text-primary transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleSaveRole} className="p-10 space-y-10 overflow-y-auto scrollbar-platinum flex-1">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2">Nome do Perfil Estratégico</label>
                <input
                  required
                  value={roleForm.name}
                  onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="w-full bg-background/50 border border-border-medium rounded-2xl px-6 py-5 text-sm font-black uppercase tracking-widest text-primary outline-none focus:border-primary shadow-inner-platinum"
                  placeholder="EX: GESTOR COMERCIAL SÊNIOR"
                />
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2">Matriz Operacional de Permissões</p>
                <div className="platinum-card overflow-hidden bg-background/30 border-border-subtle/50">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-surface-elevated/50 border-b border-border-subtle">
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Módulo do Ecossistema</th>
                        {ACTIONS.map(a => (
                          <th key={a.id} className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted text-center">{a.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle/20">
                      {MODULES.map(mod => (
                        <tr key={mod.id} className="hover:bg-primary/5 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><mod.icon size={16} /></div>
                              <span className="text-xs font-black uppercase tracking-widest text-text-primary">{mod.label}</span>
                            </div>
                          </td>
                          {ACTIONS.map(action => (
                            <td key={action.id} className="px-6 py-5 text-center">
                              <button 
                                type="button"
                                onClick={() => togglePermission(mod.id, action.id)}
                                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${roleForm.permissions[mod.id]?.[action.id] ? 'bg-primary' : 'bg-surface-elevated border border-border-subtle'}`}
                              >
                                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${roleForm.permissions[mod.id]?.[action.id] ? 'left-7 bg-white shadow-platinum-glow' : 'left-1 bg-text-muted/40'}`} />
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-6 pt-6">
                <button type="button" onClick={() => setShowRoleModal(false)} className="px-8 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Cancelar</button>
                <button type="submit" className="btn-primary px-12 py-4 flex items-center gap-3 uppercase text-[10px] tracking-widest shadow-platinum-glow">
                  <Save size={16} /> Consolidar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
