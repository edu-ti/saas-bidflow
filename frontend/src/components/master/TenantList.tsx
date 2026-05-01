import { useState, useEffect, useMemo } from 'react';
import { Building2, Search, ArrowRight, UserCircle, Plus, Edit } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';

interface Tenant {
  id: number;
  name: string;
  cnpj: string;
  status: string;
  plan_id?: number;
  plan_name?: string;
  users_count: number;
  created_at: string;
  admin_name?: string;
  admin_email?: string;
  addons?: string[];
}

const AVAILABLE_MODULES = [
  { key: 'management', label: '1. Gestão (Dash, Config, Equipe, BI, Licenças)' },
  { key: 'commercial', label: '2. Comercial (Clientes, Leads, Propostas, Funil, Catálogo, Agenda)' },
  { key: 'bidding', label: '3. Licitações (Radar, Editais, Monitoramento, Funil, Pregão, IA)' },
  { key: 'financial', label: '4. Financeiro (Motor, Contas, Contratos CLM)' },
  { key: 'inventory', label: '5. Estoque (Inventário, Consignado)' },
  { key: 'marketing', label: '6. Add-on: Marketing (Campanhas, E-mail)' },
  { key: 'chatbot', label: '7. Add-on: Chatbot & Conversas' },
];

interface Plan {
  id: number;
  name: string;
  monthly_price: number;
  features?: string[];
}

export default function TenantList() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  
  // Form states
  const [companyName, setCompanyName] = useState('');
  const [companyCnpj, setCompanyCnpj] = useState('');
  const [planId, setPlanId] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [addons, setAddons] = useState<string[]>([]);

  const selectedPlanFeatures = useMemo(() => {
    if (!planId) return [];
    const plan = plans.find(p => p.id.toString() === planId);
    return plan?.features || [];
  }, [planId, plans]);

  useEffect(() => {
    if (selectedPlanFeatures.length > 0) {
      setAddons(prev => {
        const filtered = prev.filter(addon => !selectedPlanFeatures.includes(addon));
        return filtered.length !== prev.length ? filtered : prev;
      });
    }
  }, [selectedPlanFeatures]);

  useEffect(() => {
    fetchTenants();
    fetchPlans();
  }, []);

  const fetchTenants = async () => {
    try {
      const res = await api.get('/api/master/tenants');
      setTenants(res.data.data || res.data);
    } catch (err) {
      toast.error('Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await api.get('/api/master/plans');
      setPlans(res.data);
    } catch (err) {
      toast.error('Erro ao carregar planos');
    }
  };

  const handleImpersonate = async (tenantId: number, tenantName: string) => {
    try {
      const toastId = toast.loading(`Iniciando sessão como ${tenantName}...`);
      const res = await api.post(`/api/master/tenants/${tenantId}/impersonate`);
      
      localStorage.setItem('api_token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      toast.success(`Sessão iniciada na empresa ${tenantName}`, { id: toastId });
      window.location.href = '/';
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao iniciar sessão');
    }
  };

  const openModal = (tenant?: Tenant) => {
    if (tenant) {
      setEditingTenant(tenant);
      setCompanyName(tenant.name);
      setCompanyCnpj(tenant.cnpj || '');
      setPlanId(tenant.plan_id ? tenant.plan_id.toString() : '');
      setAdminName(tenant.admin_name || '');
      setAdminEmail(tenant.admin_email || '');
      setAdminPassword('');
      setAddons(tenant.addons || []);
    } else {
      setEditingTenant(null);
      setCompanyName('');
      setCompanyCnpj('');
      setPlanId('');
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      setAddons([]);
    }
    setIsModalOpen(true);
  };

  const handleSaveTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planId) {
      toast.error('Selecione um plano');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTenant) {
        // Edit existing tenant
        await api.put(`/api/master/tenants/${editingTenant.id}`, {
          name: companyName,
          document: companyCnpj,
          plan_id: planId,
          admin_name: adminName,
          admin_email: adminEmail,
          password: adminPassword || undefined,
          addons,
        });
        toast.success('Empresa atualizada com sucesso!');
      } else {
        // Create new tenant
        await api.post('/api/master/tenants', {
          name: companyName,
          document: companyCnpj,
          plan_id: planId,
          admin_name: adminName,
          admin_email: adminEmail,
          password: adminPassword,
        });
        toast.success('Empresa cadastrada com sucesso!');
      }
      
      setIsModalOpen(false);
      fetchTenants();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar empresa');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    (t.cnpj && t.cnpj.includes(search)) ||
    (t.plan_name && t.plan_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Gestão de Empresas</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Lista de todos os tenants registrados na plataforma</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar empresa ou CNPJ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-80 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus size={20} />
            Cadastrar Empresa
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Empresa</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">CNPJ</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Plano</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 text-center">Usuários</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Criada em</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-2"></div>
                      <p>Carregando empresas...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma empresa encontrada com os critérios de busca.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{tenant.name}</p>
                          <p className="text-xs text-slate-500">ID: {tenant.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-mono">
                      {tenant.cnpj || 'Não informado'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 text-xs font-medium">
                        {tenant.plan_name || 'Nenhum'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium">
                        <UserCircle className="w-3.5 h-3.5" />
                        {tenant.users_count}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        tenant.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${tenant.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {tenant.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                      <button
                        onClick={() => openModal(tenant)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Editar Empresa"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleImpersonate(tenant.id, tenant.name)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                      >
                        Acessar Painel
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTenant ? 'Editar Empresa' : 'Cadastrar Nova Empresa'}>
        <form onSubmit={handleSaveTenant} className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
              Dados da Empresa
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Razão Social / Nome</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CNPJ</label>
                <input
                  type="text"
                  required
                  value={companyCnpj}
                  onChange={(e) => setCompanyCnpj(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Plano de Assinatura</label>
                <select
                  required
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">Selecione um plano</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>{plan.name} - R$ {Number(plan.monthly_price).toFixed(2)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
              Dados do Administrador
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
              <input
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail de Login</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {editingTenant ? 'Nova Senha (Opcional)' : 'Senha Provisória'}
                </label>
                <input
                  type="password"
                  required={!editingTenant}
                  minLength={6}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder={editingTenant ? 'Deixe em branco para não alterar' : ''}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {editingTenant && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
                Módulos Adicionais (Add-ons)
              </h3>
              <p className="text-xs text-slate-500 mb-2">
                Ligue ou desligue módulos avulsos para esta empresa. O plano principal já inclui módulos base.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AVAILABLE_MODULES.map((mod) => {
                  const isIncludedInPlan = selectedPlanFeatures.includes(mod.key);
                  const isChecked = isIncludedInPlan || addons.includes(mod.key);

                  return (
                    <label 
                      key={mod.key} 
                      className={`flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors ${
                        isIncludedInPlan 
                          ? 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50' 
                          : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isIncludedInPlan}
                        onChange={(e) => {
                          if (isIncludedInPlan) return;
                          if (e.target.checked) {
                            setAddons([...addons, mod.key]);
                          } else {
                            setAddons(addons.filter(k => k !== mod.key));
                          }
                        }}
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-900 disabled:opacity-50"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {mod.label}
                        {isIncludedInPlan && (
                          <span className="ml-2 text-[10px] font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Incluso no plano
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {isSubmitting ? 'Salvando...' : (editingTenant ? 'Salvar Alterações' : 'Cadastrar Empresa')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
