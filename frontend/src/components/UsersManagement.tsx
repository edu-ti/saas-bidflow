import { useState, useEffect, Fragment } from 'react';
import api from '../lib/axios';
import { 
  User, Mail, Shield, ShieldCheck, Plus, Search, Loader2, 
  Edit2, Trash2, Zap, Lock, Settings, Users, Key,
  Check, X, AlertCircle, Save, BarChart3, KanbanSquare, 
  Radar, Activity, Wallet, CreditCard, Briefcase, Boxes, 
  Bot, MessageSquare, FileText, Send, Database, Target, DollarSign
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
  { 
    id: 'management', 
    label: 'Gestão Core', 
    icon: Database,
    pages: [
      { id: 'dashboard', label: 'Dashboard Estratégico' },
      { id: 'settings', label: 'Configurações da Empresa' },
      { id: 'users', label: 'Equipe / Utilizadores' },
      { id: 'reports', label: 'Relatórios & BI' },
    ]
  },
  { 
    id: 'commercial', 
    label: 'Comercial', 
    icon: Briefcase,
    pages: [
      { id: 'leads', label: 'Gestão de Leads' },
      { id: 'opportunities', label: 'Oportunidades (CRM)' },
      { id: 'proposals', label: 'Gerador de Propostas' },
      { id: 'clients', label: 'Base de Clientes' }
    ]
  },
  { 
    id: 'bidding', 
    label: 'Licitações & Radar', 
    icon: Target,
    pages: [
      { id: 'radar', label: 'Radar de Editais' },
      { id: 'monitoring', label: 'Monitoramento' },
      { id: 'funnel', label: 'Funil de Lances' }
    ]
  },
  { 
    id: 'financial', 
    label: 'Inteligência Financeira', 
    icon: DollarSign,
    pages: [
      { id: 'cashflow', label: 'Fluxo de Caixa' },
      { id: 'billing', label: 'Faturamento' },
      { id: 'tax', label: 'Gestão Fiscal' }
    ]
  },
  { 
    id: 'inventory', 
    label: 'Operacional', 
    icon: Boxes,
    pages: [
      { id: 'inventory', label: 'Inventário de Estoque' },
      { id: 'consignments', label: 'Consignações' },
    ]
  },
  { 
    id: 'marketing', 
    label: 'Marketing Neural', 
    icon: Zap,
    pages: [
      { id: 'campaigns', label: 'Campanhas de Email' },
      { id: 'automations', label: 'Automações' }
    ]
  },
];

const ACTIONS = [
  { id: 'view', label: 'Ver' },
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
    permissions: {} as any
  });

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const allowedModules = currentUser.allowed_modules || [];

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
        initialPerms[m.id] = {};
        m.pages.forEach(p => {
          initialPerms[m.id][p.id] = { view: false, create: false, edit: false, delete: false };
        });
      });
      setRoleForm({ name: '', permissions: initialPerms });
    }
    setShowRoleModal(true);
  };

  const togglePermission = (moduleId: string, pageId: string, actionId: string) => {
    setRoleForm(prev => {
      const newPerms = { ...prev.permissions };
      if (!newPerms[moduleId]) newPerms[moduleId] = {};
      if (!newPerms[moduleId][pageId]) newPerms[moduleId][pageId] = {};
      
      newPerms[moduleId][pageId] = {
        ...newPerms[moduleId][pageId],
        [actionId]: !newPerms[moduleId][pageId][actionId]
      };

      return { ...prev, permissions: newPerms };
    });
  };

  const toggleAllPagePermissions = (moduleId: string, pageId: string) => {
    setRoleForm(prev => {
      const newPerms = { ...prev.permissions };
      if (!newPerms[moduleId]) newPerms[moduleId] = {};
      
      const currentPage = newPerms[moduleId][pageId] || {};
      const isAllChecked = ACTIONS.every(a => currentPage[a.id]);
      
      newPerms[moduleId][pageId] = {
        view: !isAllChecked,
        create: !isAllChecked,
        edit: !isAllChecked,
        delete: !isAllChecked
      };

      return { ...prev, permissions: newPerms };
    });
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
    <div className="space-y-8 animate-fade-in pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">
            Gestão de Acessos
          </h2>
          <p className="text-sm text-text-secondary mt-1 flex items-center gap-2">
            <Lock size={14} className="text-text-muted" />
            Gerencie os usuários e seus perfis de permissões.
          </p>
        </div>
        
        <div className="flex gap-3">
          {activeTab === 'users' ? (
            <button className="btn btn-primary flex items-center gap-2">
              <Plus size={16} /> <span>Novo Usuário</span>
            </button>
          ) : (
            <button 
              onClick={() => handleOpenRoleModal()}
              className="btn btn-primary flex items-center gap-2"
            >
              <Shield size={16} /> <span>Novo Perfil</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-6">
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-medium transition-all border-b-2 ${activeTab === 'users' ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-text-primary'}`}
        >
          Usuários
        </button>
        <button 
          onClick={() => setActiveTab('roles')}
          className={`pb-3 text-sm font-medium transition-all border-b-2 ${activeTab === 'roles' ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-text-primary'}`}
        >
          Perfis de Acesso
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="card overflow-hidden">
          <div className="p-4 md:p-6 bg-bg-secondary border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Pesquisar usuários..."
                className="input w-full pl-10 bg-bg-primary"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-bg-tertiary border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium text-text-secondary">Usuário</th>
                  <th className="px-6 py-4 font-medium text-text-secondary">Email</th>
                  <th className="px-6 py-4 font-medium text-text-secondary">Perfil</th>
                  <th className="px-6 py-4 font-medium text-text-secondary">Status</th>
                  <th className="px-6 py-4 font-medium text-text-secondary text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-bg-primary">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-bg-secondary transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-text-primary">{u.name}</span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                        <Key size={12} /> {u.role_name || 'Admin Principal'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-success/10 text-success">
                        Ativo
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-2 text-text-muted hover:text-primary transition-colors opacity-0 group-hover:opacity-100"><Edit2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map(role => (
            <div key={role.id} className="card p-6 space-y-6 hover:border-primary/50 transition-colors">
               <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-text-primary">{role.name}</h3>
                    <p className="text-xs text-text-muted">Perfil de Acesso</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenRoleModal(role)} className="p-2 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-bg-secondary"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteRole(role.id)} className="p-2 text-text-muted hover:text-danger transition-colors rounded-lg hover:bg-danger/10"><Trash2 size={16} /></button>
                  </div>
               </div>
               
               <div className="pt-4 border-t border-border flex flex-wrap gap-2">
                  {Object.keys(role.permissions).slice(0, 3).map(mod => (
                    <span key={mod} className="px-2 py-1 bg-bg-secondary text-text-secondary text-xs font-medium rounded border border-border">
                      {mod}
                    </span>
                  ))}
                  {Object.keys(role.permissions).length > 3 && <span className="px-2 py-1 bg-bg-tertiary text-text-muted text-xs font-medium rounded border border-border">+{Object.keys(role.permissions).length - 3}</span>}
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Role Modal with Matrix UI */}
      {showRoleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-bg-primary border border-border rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-bg-secondary">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Arquitetura de Permissões</h2>
                <p className="text-sm text-text-secondary">Configuração de Perfil de Acesso</p>
              </div>
              <button onClick={() => setShowRoleModal(false)} className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveRole} className="p-6 space-y-8 overflow-y-auto flex-1">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Nome do Perfil</label>
                <input
                  required
                  value={roleForm.name}
                  onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="input w-full"
                  placeholder="EX: Gestor Comercial"
                />
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium text-text-primary">Matriz de Permissões</p>
                <div className="card overflow-hidden border-border">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-bg-tertiary border-b border-border">
                      <tr>
                        <th className="px-6 py-3 font-medium text-text-secondary">Recurso / Página</th>
                        <th className="px-4 py-3 font-medium text-text-secondary text-center">Acesso Total</th>
                        {ACTIONS.map(a => (
                          <th key={a.id} className="px-4 py-3 font-medium text-text-secondary text-center">{a.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {MODULES.filter(m => m.id === 'management' || allowedModules.includes(m.id)).map(mod => (
                        <Fragment key={mod.id}>
                          <tr className="bg-bg-secondary">
                            <td colSpan={6} className="px-6 py-2.5">
                              <div className="flex items-center gap-2">
                                <mod.icon size={14} className="text-text-secondary" />
                                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">{mod.label}</span>
                              </div>
                            </td>
                          </tr>
                          {mod.pages.map(page => (
                            <tr key={page.id} className="hover:bg-bg-secondary/50 transition-colors">
                              <td className="px-6 py-3">
                                <span className="pl-4 border-l-2 border-border font-medium text-text-primary">{page.label}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button 
                                  type="button"
                                  onClick={() => toggleAllPagePermissions(mod.id, page.id)}
                                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                    ACTIONS.every(a => roleForm.permissions[mod.id]?.[page.id]?.[a.id])
                                    ? 'bg-primary text-white'
                                    : 'bg-bg-tertiary text-text-secondary border border-border hover:bg-bg-secondary'
                                  }`}
                                >
                                  Todos
                                </button>
                              </td>
                              {ACTIONS.map(action => (
                                <td key={action.id} className="px-4 py-3 text-center">
                                  <button 
                                    type="button"
                                    onClick={() => togglePermission(mod.id, page.id, action.id)}
                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${roleForm.permissions[mod.id]?.[page.id]?.[action.id] ? 'bg-primary' : 'bg-bg-tertiary border border-border'}`}
                                  >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${roleForm.permissions[mod.id]?.[page.id]?.[action.id] ? 'translate-x-2' : '-translate-x-2'}`} />
                                  </button>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <button type="button" onClick={() => setShowRoleModal(false)} className="btn btn-outline">Cancelar</button>
                <button type="submit" className="btn btn-primary flex items-center gap-2">
                  <Save size={16} /> <span>Salvar Perfil</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
