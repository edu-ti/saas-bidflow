import { useState, useEffect, Fragment } from 'react';
import api from '../lib/axios';
import { 
  User, Mail, Shield, ShieldCheck, Plus, Search, Loader2, 
  Edit2, Trash2, Zap, Lock, Settings, Users, Key,
  Check, X, AlertCircle, Save, BarChart3, KanbanSquare, 
  Radar, Activity, Wallet, CreditCard, Briefcase, Boxes, 
  Bot, MessageSquare, FileText, Send, Database, Target, DollarSign,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from './ConfirmModal';

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
  permissions: Record<string, Record<string, { view?: boolean; create?: boolean; edit?: boolean; delete?: boolean }>>;
}

interface PermissionNode {
  id: string;
  label: string;
  children?: PermissionNode[];
}

function getDescendantIds(nodes: PermissionNode[]): string[] {
  const ids: string[] = [];
  nodes.forEach(node => {
    ids.push(node.id);
    if (node.children) {
      ids.push(...getDescendantIds(node.children));
    }
  });
  return ids;
}

const MODULES: { id: string; label: string; icon: any; pages: PermissionNode[] }[] = [
  {
    id: 'management',
    label: 'Gestão Core',
    icon: Database,
    pages: [
      { id: 'dashboard', label: 'Dashboard' },
      {
        id: 'users',
        label: 'Equipe/Utilizadores',
        children: [
          { id: 'users-management', label: 'Usuários' },
          { id: 'roles', label: 'Perfis de Acesso' },
        ]
      },
      {
        id: 'reports',
        label: 'Relatórios & BI',
        children: [
          { id: 'reports-dashboard', label: 'Dashboard BI' },
          { id: 'reports-detailed', label: 'Relatórios Detalhes' },
          { id: 'reports-goals', label: 'Metas e Comissões' },
        ]
      },
      { id: 'licenses', label: 'Licenças e Certidões' },
    ]
  },
  {
    id: 'commercial',
    label: 'Comercial',
    icon: Briefcase,
    pages: [
      {
        id: 'contacts',
        label: 'Contatos',
        children: [
          { id: 'contacts-pf', label: 'Pessoas Físicas' },
          { id: 'contacts-pj', label: 'Entidades Jurídicas' },
          { id: 'contacts-suppliers', label: 'Fornecedores' },
        ]
      },
      { id: 'leads', label: 'Leads' },
      { id: 'proposals', label: 'Propostas' },
      { id: 'sales-funnel', label: 'Funil de Vendas' },
      { id: 'products', label: 'Catálogo de Produtos' },
      { id: 'agenda', label: 'Agenda Integrada' },
    ]
  },
  {
    id: 'bidding',
    label: 'Licitações',
    icon: Target,
    pages: [
      {
        id: 'bidding-manager',
        label: 'Gestor de Licitações',
        children: [
          {
            id: 'opportunities',
            label: 'OPORTUNIDADES',
            children: [
              { id: 'bulletins', label: 'Boletins de Licitações' },
              { id: 'search-bids', label: 'Encontrar Licitações' },
              { id: 'strategic-bids', label: 'Licitações Estratégicas' },
            ]
          },
          {
            id: 'ai-hub',
            label: 'INTELIGÊNCIA ARTIFICIAL',
            children: [
              { id: 'legal-consultant', label: 'Consultor Jurídico' },
              { id: 'bid-analyst', label: 'Analista em Edital' },
            ]
          },
          {
            id: 'bidding-gestao',
            label: 'GESTÃO',
            children: [
              { id: 'manage-bids', label: 'Gerenciar Licitações' },
              { id: 'documents', label: 'Documentos' },
            ]
          },
          {
            id: 'automation',
            label: 'AUTOMAÇÃO',
            children: [
              { id: 'chat-monitor', label: 'Monitorar Chat' },
            ]
          },
          {
            id: 'strategic-analysis',
            label: 'ANÁLISE ESTRATÉGICA',
            children: [
              { id: 'market-analysis', label: 'Análise de Mercado' },
              { id: 'competitors', label: 'Concorrentes' },
            ]
          },
        ]
      },
      { id: 'radar', label: 'Radar de Licitações' },
      { id: 'capture', label: 'Captura de Editais' },
      { id: 'monitoring', label: 'Monitoramento' },
      { id: 'bidding-funnel', label: 'Funil de Licitações' },
      { id: 'auction-details', label: 'Detalhes do Pregão' },
      { id: 'ai-generator', label: 'Gerador IA' },
    ]
  },
  {
    id: 'financial',
    label: 'Financeiro',
    icon: DollarSign,
    pages: [
      {
        id: 'financial-manager',
        label: 'Gestor Financeiro',
        children: [
          { id: 'cashflow', label: 'Fluxo de Caixa' },
          { id: 'invoices', label: 'Notas Fiscais' },
          { id: 'bank-reconciliation', label: 'Conciliação Bancária' },
          { id: 'tax-settings', label: 'Configurações Fiscais' },
        ]
      },
      { id: 'accounts-payable', label: 'Contas Pagar/Receber' },
      { id: 'contracts', label: 'Contratos (CLM)' },
    ]
  },
  {
    id: 'inventory',
    label: 'Ativos e Estoque',
    icon: Boxes,
    pages: [
      { id: 'inventory-page', label: 'Inventário' },
      { id: 'consignments', label: 'Gestão de Consignações' },
    ]
  },
  {
    id: 'modules',
    label: 'Módulos Adicionais',
    icon: Zap,
    pages: [
      { id: 'campaigns', label: 'Marketing/Campanhas' },
      { id: 'email-marketing', label: 'E-mail Marketing' },
      { id: 'chatbot', label: 'Construtor de Chatbots' },
      { id: 'support-center', label: 'Central de Atendimento' },
      {
        id: 'settings',
        label: 'Configurações',
        children: [
          {
            id: 'settings-account',
            label: 'CONTA',
            children: [
              { id: 'settings-profile', label: 'Meu Perfil' },
              { id: 'settings-alerts', label: 'Alerta e BI' },
              { id: 'settings-gateway', label: 'Gateway RPA' },
              { id: 'settings-crypto', label: 'Criptografia' },
            ]
          },
          {
            id: 'settings-admin',
            label: 'ADMINISTRAÇÃO',
            children: [
              { id: 'settings-core', label: 'Core Business' },
              { id: 'settings-access', label: 'Níveis de Acesso' },
              { id: 'settings-tax', label: 'Compliance Fiscal' },
            ]
          },
        ]
      },
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
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    permissions: {} as any
  });
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role_id: '' as string
  });
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    onConfirm?: () => void;
  }>({ title: '', message: '', type: 'info' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.allSettled([
        api.get('/api/tenant/users'),
        api.get('/api/roles')
      ]);
      console.log('usersRes:', usersRes);
      console.log('rolesRes:', rolesRes);
      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value.data.data || usersRes.value.data || []);
      } else if (usersRes.status === 'rejected') {
        console.error('Failed to fetch users:', usersRes.reason);
        toast.error('Erro ao carregar usuários. Verifique se tem permissões de administrador.');
      }
      if (rolesRes.status === 'fulfilled') {
        setRoles(rolesRes.value.data || []);
      } else if (rolesRes.status === 'rejected') {
        console.error('Failed to fetch roles:', rolesRes.reason);
        toast.error('Erro ao carregar perfis. Verifique se tem permissões de administrador.');
      }
    } catch (err) {
      console.error('Fetch data error:', err);
      toast.error('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const initializeNodePerms = (nodes: PermissionNode[], perms: Record<string, any>) => {
    nodes.forEach(node => {
      perms[node.id] = { view: false, create: false, edit: false, delete: false };
      if (node.children) {
        initializeNodePerms(node.children, perms);
      }
    });
  };

  const handleOpenRoleModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      const normalizedPerms: any = {};
      Object.keys(role.permissions || {}).forEach(modId => {
        normalizedPerms[modId] = {};
        Object.keys(role.permissions[modId]).forEach(pageId => {
          normalizedPerms[modId][pageId] = {
            view: role.permissions[modId][pageId].view || false,
            create: role.permissions[modId][pageId].create || false,
            edit: role.permissions[modId][pageId].edit || false,
            delete: role.permissions[modId][pageId].delete || false,
          };
        });
      });
      setRoleForm({
        name: role.name,
        permissions: normalizedPerms
      });
    } else {
      setEditingRole(null);
      const initialPerms: any = {};
      MODULES.forEach(m => {
        initialPerms[m.id] = {};
        initializeNodePerms(m.pages, initialPerms[m.id]);
      });
      setRoleForm({ name: '', permissions: initialPerms });
    }
    setShowRoleModal(true);
  };

  const togglePermission = (moduleId: string, pageId: string, actionId: string) => {
    const currentVal = roleForm.permissions?.[moduleId]?.[pageId]?.[actionId] || false;
    const newPerms = JSON.parse(JSON.stringify(roleForm.permissions || {}));
    
    if (!newPerms[moduleId]) newPerms[moduleId] = {};
    if (!newPerms[moduleId][pageId]) newPerms[moduleId][pageId] = {};
    
    newPerms[moduleId][pageId][actionId] = !currentVal;
    
    setRoleForm(prev => ({ ...prev, permissions: newPerms }));
  };

  const toggleAllPagePermissions = (moduleId: string, pageId: string, checked: boolean) => {
    setRoleForm(prev => {
      const newPerms = { ...prev.permissions };
      if (!newPerms[moduleId]) newPerms[moduleId] = {};
      
      newPerms[moduleId][pageId] = {
        view: checked,
        create: checked,
        edit: checked,
        delete: checked
      };

      return { ...prev, permissions: newPerms };
    });
  };

  const toggleColumnAction = (moduleId: string, pageIds: string[], actionId: string, checked: boolean) => {
    setRoleForm(prev => {
      const newPerms = { ...prev.permissions };
      if (!newPerms[moduleId]) newPerms[moduleId] = {};
      
      pageIds.forEach(id => {
        if (!newPerms[moduleId][id]) newPerms[moduleId][id] = {};
        newPerms[moduleId][id] = { ...newPerms[moduleId][id], [actionId]: checked };
      });

      return { ...prev, permissions: newPerms };
    });
  };

  

  const renderPermissionRows = (moduleId: string, nodes: PermissionNode[], depth: number = 0): JSX.Element[] => {
    return nodes.flatMap(node => {
      const hasChildren = node.children && node.children.length > 0;
      const paddingLeft = depth * 24 + 24;
      
      if (hasChildren) {
        const descIds = getDescendantIds(node.children!);
        
        return [
          <tr key={node.id} className="hover:bg-bg-secondary/30 transition-colors border-b border-border/50">
            <td className="py-3">
              <div className="flex items-center gap-2" style={{ paddingLeft: `${paddingLeft}px` }}>
                <span className="font-medium text-text-primary">{node.label}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-center">
              <button
                type="button"
                onClick={() => {
                  const allChecked = descIds.every(id => ACTIONS.every(a => roleForm.permissions[moduleId]?.[id]?.[a.id]));
                  const newVal = !allChecked;
                  setRoleForm(prev => {
                    const newPerms = JSON.parse(JSON.stringify(prev.permissions || {}));
                    descIds.forEach(id => {
                      if (!newPerms[moduleId]) newPerms[moduleId] = {};
                      newPerms[moduleId][id] = { view: newVal, create: newVal, edit: newVal, delete: newVal };
                    });
                    return { ...prev, permissions: newPerms };
                  });
                }}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  descIds.every(id => ACTIONS.every(a => roleForm.permissions[moduleId]?.[id]?.[a.id])) ? 'bg-primary text-white' : 'bg-bg-tertiary text-text-secondary border border-border hover:bg-bg-secondary'
                }`}
              >
                Todos
              </button>
            </td>
            {ACTIONS.map(action => {
              const actionAllChecked = descIds.every(id => roleForm.permissions[moduleId]?.[id]?.[action.id]);
              return (
                <td key={action.id} className="px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      const newVal = !actionAllChecked;
                      setRoleForm(prev => {
                        const newPerms = { ...prev.permissions };
                        if (!newPerms[moduleId]) newPerms[moduleId] = {};
                        descIds.forEach(id => {
                          if (!newPerms[moduleId][id]) newPerms[moduleId][id] = {};
                          newPerms[moduleId][id] = { ...newPerms[moduleId][id], [action.id]: newVal };
                        });
                        return { ...prev, permissions: newPerms };
                      });
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                      actionAllChecked ? 'bg-primary' : 'bg-bg-tertiary border border-border'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      actionAllChecked ? 'translate-x-2' : '-translate-x-2'
                    }`} />
                  </button>
                </td>
              );
            })}
          </tr>,
          ...renderPermissionRows(moduleId, node.children!, depth + 1)
        ];
      }
      
      const leafAllChecked = ACTIONS.every(a => roleForm.permissions[moduleId]?.[node.id]?.[a.id]);
      return [
        <tr key={node.id} className="hover:bg-bg-secondary/50 transition-colors border-b border-border">
          <td className="py-3">
            <div className="flex items-center gap-2" style={{ paddingLeft: `${paddingLeft}px` }}>
              <span className={`${depth > 0 ? 'text-sm text-text-secondary' : 'font-medium text-text-primary'}`}>
                {node.label}
              </span>
            </div>
          </td>
          <td className="px-4 py-3 text-center">
            <button
              type="button"
              onClick={() => {
                const allChecked = ACTIONS.every(a => roleForm.permissions[moduleId]?.[node.id]?.[a.id]);
                const newVal = !allChecked;
                setRoleForm(prev => {
                  const newPerms = { ...prev.permissions };
                  if (!newPerms[moduleId]) newPerms[moduleId] = {};
                  newPerms[moduleId][node.id] = { view: newVal, create: newVal, edit: newVal, delete: newVal };
                  return { ...prev, permissions: newPerms };
                });
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                leafAllChecked ? 'bg-primary text-white' : 'bg-bg-tertiary text-text-secondary border border-border hover:bg-bg-secondary'
              }`}
            >
              Todos
            </button>
          </td>
          {ACTIONS.map(action => (
            <td key={action.id} className="px-4 py-3 text-center">
              <button
                type="button"
                onClick={() => togglePermission(moduleId, node.id, action.id)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  roleForm.permissions[moduleId]?.[node.id]?.[action.id] ? 'bg-primary' : 'bg-bg-tertiary border border-border'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  roleForm.permissions[moduleId]?.[node.id]?.[action.id] ? 'translate-x-2' : '-translate-x-2'
                }`} />
              </button>
            </td>
          ))}
        </tr>
      ];
    });
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Saving role:', roleForm);
      console.log('Permissions:', JSON.stringify(roleForm.permissions, null, 2));
      if (editingRole) {
        await api.put(`/api/roles/${editingRole.id}`, roleForm);
        toast.success('Perfil de acesso atualizado.');
      } else {
        await api.post('/api/roles', roleForm);
        toast.success('Novo perfil de acesso consolidado.');
      }
      setShowRoleModal(false);
      fetchData();
    } catch (err: any) {
      console.error('Error saving role:', err);
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Erro na persistência do perfil.');
    }
  };

  const handleDeleteRole = async (id: number) => {
    setConfirmConfig({
      title: 'Excluir Perfil',
      message: 'Tem certeza que deseja excluir este perfil de acesso? Esta ação não pode ser desfeita.',
      type: 'warning',
      onConfirm: async () => {
        try {
          await api.delete(`/api/roles/${id}`);
          toast.success('Perfil removido.');
          fetchData();
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Erro ao remover perfil.');
        }
      }
    });
    setIsConfirmOpen(true);
  };

  const handleOpenUserModal = (user?: UserData) => {
    if (user) {
      console.log('Opening user modal for user:', user);
      setEditingUser(user);
      setUserForm({
        name: user.name,
        email: user.email,
        password: '',
        role_id: user.role_id?.toString() || ''
      });
    } else {
      setEditingUser(null);
      setUserForm({ name: '', email: '', password: '', role_id: '' });
    }
    setShowUserModal(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: userForm.name,
        email: userForm.email,
        role_id: userForm.role_id || null,
      };
      if (userForm.password) {
        payload.password = userForm.password;
      }
      await api.post('/api/tenant/users', payload);
      toast.success('Usuário criado com sucesso!');
      setShowUserModal(false);
      fetchData().catch(() => {});
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Erro ao criar usuário.');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const payload: any = {
        name: userForm.name,
        email: userForm.email,
        role_id: userForm.role_id || null,
      };
      if (userForm.password) {
        payload.password = userForm.password;
      }
      await api.put(`/api/tenant/users/${editingUser.id}`, payload);
      toast.success('Usuário atualizado com sucesso!');
      setShowUserModal(false);
      fetchData().catch(() => {});
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Erro ao atualizar usuário.');
    }
  };

  const handleDeleteUser = async (id: number) => {
    setConfirmConfig({
      title: 'Excluir Usuário',
      message: 'Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.',
      type: 'warning',
      onConfirm: async () => {
        try {
          await api.delete(`/api/tenant/users/${id}`);
          toast.success('Usuário removido.');
          fetchData();
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Erro ao remover usuário.');
        }
      }
    });
    setIsConfirmOpen(true);
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
            <button onClick={() => handleOpenUserModal()} className="btn btn-primary flex items-center gap-2">
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
                       <div className="flex items-center justify-end gap-1">
                         <button onClick={(e) => { console.log('User object:', u); handleOpenUserModal(u); }} className="p-2 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-bg-secondary"><Edit2 size={16} /></button>
                         <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-text-muted hover:text-danger transition-colors rounded-lg hover:bg-danger/10"><Trash2 size={16} /></button>
                       </div>
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
          <div className="bg-bg-primary border border-border rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-bg-secondary shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Arquitetura de Permissões</h2>
                <p className="text-sm text-text-secondary">Configuração de Perfil de Acesso</p>
              </div>
              <button onClick={() => setShowRoleModal(false)} className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSaveRole} className="p-6 space-y-8">
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
                        {MODULES.map(mod => (
                          <Fragment key={mod.id}>
                            <tr className="bg-bg-secondary">
                              <td colSpan={6} className="px-6 py-2.5">
                                <div className="flex items-center gap-2">
                                  <mod.icon size={14} className="text-text-secondary" />
                                  <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">{mod.label}</span>
                                </div>
                              </td>
                            </tr>
                            {renderPermissionRows(mod.id, mod.pages, 0)}
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
        </div>
      )}

      {/* User Creation/Edit Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-bg-primary border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-bg-secondary">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                <p className="text-sm text-text-secondary">{editingUser ? 'Atualizar dados do usuário' : 'Cadastrar membro da equipe'}</p>
              </div>
              <button onClick={() => setShowUserModal(false)} className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Nome*</label>
                <input
                  required
                  value={userForm.name}
                  onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                  className="input w-full"
                  placeholder="Nome completo"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">E-mail*</label>
                <input
                  required
                  type="email"
                  value={userForm.email}
                  onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                  className="input w-full"
                  placeholder="usuario@empresa.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">{editingUser ? 'Nova Senha (opcional)' : 'Senha*'}</label>
                <input
                  type="password"
                  required={!editingUser}
                  value={userForm.password}
                  onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                  className="input w-full"
                  placeholder={editingUser ? "Deixe em branco para manter a atual" : "Mínimo 8 caracteres"}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Perfil de Acesso</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                  <select
                    value={userForm.role_id}
                    onChange={e => setUserForm({ ...userForm, role_id: e.target.value })}
                    className="input w-full pl-10 pr-10 appearance-none cursor-pointer"
                  >
                    <option value="">Sem perfil (acesso básico)</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 pointer-events-none" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => setShowUserModal(false)} className="btn btn-outline">Cancelar</button>
                <button type="submit" className="btn btn-primary flex items-center gap-2">
                  <Save size={16} /> <span>{editingUser ? 'Salvar Alterações' : 'Criar Usuário'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        onConfirm={confirmConfig.onConfirm}
      />
    </div>
  );
}
