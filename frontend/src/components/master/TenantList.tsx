import { useState, useEffect, useMemo } from 'react';
import { Building2, Search, ArrowRight, UserCircle, Plus, Edit, ShieldCheck, Globe, Loader2, Save, Layout, Zap, Key, Activity, Target, Trash2, Check, RefreshCw, ChevronRight } from 'lucide-react';
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
  max_users?: number;
  created_at: string;
  admin_name?: string;
  admin_email?: string;
  addons?: string[];
}

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
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  
  const [companyName, setCompanyName] = useState('');
  const [companyCnpj, setCompanyCnpj] = useState('');
  const [planId, setPlanId] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [status, setStatus] = useState('active');
  const [addons, setAddons] = useState<string[]>([]);

  useEffect(() => {
    fetchTenants();
    fetchPlans();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/master/tenants');
      setTenants(res.data.data || res.data);
    } catch (err) {
      toast.error('Erro na varredura de clusters corporativos.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await api.get('/api/master/plans');
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImpersonate = async (tenantId: number, tenantName: string) => {
    try {
      const toastId = toast.loading(`Orquestrando túnel neural para ${tenantName}...`);
      const res = await api.post(`/api/master/tenants/${tenantId}/impersonate`);
      
      localStorage.setItem('api_token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      toast.success(`Túnel estabelecido com sucesso na empresa ${tenantName}`, { id: toastId });
      window.location.href = '/';
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Falha na autenticação do túnel');
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
      setStatus(tenant.status || 'active');
      setAddons(tenant.addons || []);
    } else {
      setEditingTenant(null);
      setCompanyName('');
      setCompanyCnpj('');
      setPlanId('');
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      setStatus('active');
      setAddons([]);
    }
    setIsModalOpen(true);
  };

  const handleSaveTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planId) { toast.error('Defina o Tier de Assinatura'); return; }

    setIsSubmitting(true);
    try {
      const payload = {
        name: companyName,
        document: companyCnpj,
        plan_id: planId,
        admin_name: adminName,
        admin_email: adminEmail,
        password: adminPassword || undefined,
        status,
        addons,
      };

      if (editingTenant) {
        await api.put(`/api/master/tenants/${editingTenant.id}`, payload);
        toast.success('Clusters atualizados com sucesso!');
      } else {
        await api.post('/api/master/tenants', payload);
        toast.success('Nova instância provisionada com sucesso!');
      }
      
      setIsModalOpen(false);
      fetchTenants();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro crítico no provisionamento');
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
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Tenant <span className="text-gradient-gold">Governance</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <Globe size={14} className="text-primary" />
            Gestão de infraestrutura multi-tenant e provisionamento de ecossistemas Platinum.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-5 w-full lg:w-auto">
          <div className="relative group flex-1 lg:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Varredura de instâncias..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-4 w-full lg:w-80 rounded-2xl border border-border-medium bg-surface-elevated/10 text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum font-black text-[10px] uppercase tracking-widest placeholder:text-text-secondary/60"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="btn-primary py-4 px-10 shadow-platinum-glow flex items-center gap-4 uppercase text-[10px] tracking-[0.3em] whitespace-nowrap group"
          >
            <Plus size={20} className="group-hover:scale-125 transition-transform" />
            Provisionar Empresa
          </button>
        </div>
      </header>

      <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-platinum-glow-sm">
        <div className="px-10 py-6 bg-surface-elevated/20 border-b border-border-subtle/30 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner-platinum">
                 <ShieldCheck size={20} />
              </div>
              <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.4em]">Clusters Corporativos Ativos</h3>
           </div>
           <button onClick={fetchTenants} className="p-3 text-text-secondary hover:text-primary transition-all rounded-xl hover:bg-primary/5">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>
        
        <div className="overflow-x-auto scrollbar-platinum">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-elevated/40 border-b border-border-subtle">
              <tr>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-secondary">Instância / Branding</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-secondary">Matriz Documental</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-secondary">Power Tier</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-secondary text-center">Nodes</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-secondary">Estado</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-secondary text-right">Ações de Tunelamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-10 py-40">
                    <div className="flex flex-col items-center justify-center gap-8">
                      <div className="w-16 h-16 rounded-[2rem] bg-surface-elevated flex items-center justify-center border border-border-subtle shadow-inner-platinum">
                         <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-text-secondary animate-pulse">Sincronizando Malha Neural Multi-Tenant...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-10 py-40 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-30">
                       <Building2 size={60} className="text-text-secondary" />
                       <p className="text-[11px] font-black uppercase tracking-[0.5em] text-text-secondary">Nenhuma instância detectada na varredura global.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-surface-elevated/30 transition-all group border-b border-border-subtle/10 duration-500">
                    <td className="px-10 py-10">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-border-subtle/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-700 shadow-inner-platinum relative overflow-hidden">
                          <Building2 className="w-7 h-7 text-primary shadow-platinum-glow-sm relative z-10" />
                          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                          <p className="font-black text-text-primary uppercase tracking-tighter text-base group-hover:text-primary transition-colors">{tenant.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                             <span className="text-[9px] text-text-secondary font-black uppercase tracking-widest">ID: {tenant.id.toString().padStart(4, '0')}</span>
                             <div className="w-1 h-1 rounded-full bg-border-subtle" />
                             <span className="text-[9px] text-text-secondary font-black uppercase tracking-widest italic">{new Date(tenant.created_at).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-10">
                       <div className="text-[11px] text-text-secondary font-black tracking-[0.2em] bg-surface-elevated/40 px-4 py-2 rounded-xl border border-border-subtle shadow-inner-platinum inline-block uppercase">
                          {tenant.cnpj || 'DRAFT_CNPJ'}
                       </div>
                    </td>
                    <td className="px-10 py-10">
                      <span className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest shadow-platinum-glow-sm">
                        <Zap size={12} className="animate-pulse" />
                        {tenant.plan_name || 'LEGACY_CORE'}
                      </span>
                    </td>
                    <td className="px-10 py-10 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <span className="text-lg font-black text-text-primary tracking-tighter">{tenant.users_count}</span>
                        <div className="w-12 h-1 bg-surface-elevated/60 rounded-full overflow-hidden border border-border-subtle/20">
                           <div className="h-full bg-primary" style={{ width: `${Math.min((tenant.users_count / (tenant.max_users || 100)) * 100, 100)}%` }} />
                        </div>
                        <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Limit: {tenant.max_users || '∞'}</span>
                      </div>
                    </td>
                    <td className="px-10 py-10">
                      <span className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border backdrop-blur-md shadow-platinum-glow-sm ${
                        tenant.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : tenant.status === 'past_due'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        <div className={`w-2 h-2 rounded-full bg-current ${tenant.status === 'active' ? 'animate-pulse shadow-platinum-glow' : ''}`}></div>
                        {tenant.status === 'active' ? 'Operational' : tenant.status === 'past_due' ? 'Review Needed' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-10 py-10 text-right">
                      <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-6 group-hover:translate-x-0">
                        <button
                          onClick={() => openModal(tenant)}
                          className="p-4 text-text-secondary hover:text-primary bg-surface-elevated/40 border border-border-subtle rounded-2xl transition-all shadow-inner-platinum hover:scale-110"
                          title="Refinar Parâmetros"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleImpersonate(tenant.id, tenant.name)}
                          className="btn-primary py-3.5 px-8 text-[10px] font-black tracking-[0.2em] shadow-platinum-glow flex items-center gap-4 group/btn"
                        >
                          Acessar <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTenant ? 'REFINAR INSTÂNCIA CORPORATIVA' : 'PROVISIONAR NOVO TENANT PLATINUM'} size="lg">
        <form onSubmit={handleSaveTenant} className="p-10 space-y-12">
          
          <div className="space-y-10">
            <div className="flex items-center gap-4 border-b border-border-subtle/30 pb-6">
               <Activity size={20} className="text-primary" />
               <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.5em]">Arquitetura de Malha Corporativa</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="col-span-2 group">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em] px-4 group-focus-within:text-primary transition-colors">Razão Social / Nome de Operação Platinum *</label>
                <div className="relative mt-3">
                   <Building2 className="absolute left-8 top-1/2 -translate-y-1/2 text-primary opacity-60 w-6 h-6 group-focus-within:opacity-100 transition-opacity" />
                   <input
                     type="text"
                     required
                     value={companyName}
                     onChange={(e) => setCompanyName(e.target.value)}
                     className="w-full bg-background/50 border border-border-medium rounded-[1.5rem] pl-20 pr-8 py-6 text-base font-black text-text-primary outline-none focus:border-primary/40 transition-all shadow-inner-platinum uppercase tracking-tight"
                     placeholder="EX: BIDFLOW GLOBAL SOLUTIONS S/A"
                   />
                </div>
              </div>
              
              <div className="group">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em] px-4 group-focus-within:text-primary transition-colors">CNPJ Digital de Auditoria</label>
                <div className="relative mt-3">
                   <ShieldCheck className="absolute left-8 top-1/2 -translate-y-1/2 text-text-secondary opacity-60 w-6 h-6 group-focus-within:text-primary group-focus-within:opacity-100 transition-all" />
                   <input
                     type="text"
                     required
                     value={companyCnpj}
                     onChange={(e) => setCompanyCnpj(e.target.value)}
                     className="w-full bg-background/50 border border-border-medium rounded-[1.5rem] pl-20 pr-8 py-6 text-sm font-black text-text-primary outline-none focus:border-primary/40 transition-all shadow-inner-platinum tracking-[0.2em]"
                     placeholder="00.000.000/0000-00"
                   />
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em] px-4 group-focus-within:text-primary transition-colors">Power Tier de Assinatura</label>
                <div className="relative mt-3">
                   <Zap className="absolute left-8 top-1/2 -translate-y-1/2 text-primary opacity-60 w-6 h-6" />
                   <select
                     required
                     value={planId}
                     onChange={(e) => setPlanId(e.target.value)}
                     className="w-full bg-background/50 border border-border-medium rounded-[1.5rem] pl-20 pr-12 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-text-primary outline-none focus:border-primary/40 transition-all appearance-none cursor-pointer shadow-inner-platinum"
                   >
                     <option value="" className="bg-surface">SELECIONAR TIER...</option>
                     {plans.map(plan => (
                       <option key={plan.id} value={plan.id} className="bg-surface">{plan.name.toUpperCase()} · BRL {Number(plan.monthly_price).toFixed(0)}</option>
                     ))}
                   </select>
                   <ChevronRight size={14} className="absolute right-8 top-1/2 -translate-y-1/2 rotate-90 text-text-secondary opacity-60" />
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em] px-4 group-focus-within:text-primary transition-colors">Status do Cluster Multi-Tenant</label>
                <div className="relative mt-3">
                   <Layout className="absolute left-8 top-1/2 -translate-y-1/2 text-text-secondary opacity-60 w-6 h-6 group-focus-within:text-primary transition-all" />
                   <select
                     required
                     value={status}
                     onChange={(e) => setStatus(e.target.value)}
                     className="w-full bg-background/50 border border-border-medium rounded-[1.5rem] pl-20 pr-12 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-text-primary outline-none focus:border-primary/40 transition-all appearance-none cursor-pointer shadow-inner-platinum"
                   >
                     <option value="active" className="bg-surface">OPERACIONAL (NOMINAL)</option>
                     <option value="past_due" className="bg-surface">PENDÊNCIA FINANCEIRA (ALERTA)</option>
                     <option value="suspended" className="bg-surface">SUSPENSO (OFFLINE)</option>
                     <option value="cancelled" className="bg-surface">CANCELADO / PURGED</option>
                   </select>
                   <ChevronRight size={14} className="absolute right-8 top-1/2 -translate-y-1/2 rotate-90 text-text-secondary opacity-60" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="flex items-center gap-4 border-b border-border-subtle/30 pb-6">
               <UserCircle size={20} className="text-primary" />
               <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.5em]">Identidade Neural do Super Admin</h3>
            </div>
            
            <div className="group">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em] px-4 group-focus-within:text-primary transition-colors">Nome Completo do Gestor de Cluster</label>
              <div className="relative mt-3">
                <UserCircle className="absolute left-8 top-1/2 -translate-y-1/2 text-primary opacity-60 w-6 h-6 group-focus-within:opacity-100 transition-all" />
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full bg-background/50 border border-border-medium rounded-[1.5rem] pl-20 pr-8 py-6 text-sm font-black text-text-primary outline-none focus:border-primary/40 transition-all shadow-inner-platinum uppercase tracking-tight"
                  placeholder="NOME DO ADMINISTRADOR"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="group">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em] px-4 group-focus-within:text-primary transition-colors">E-mail Primário de Túnel</label>
                <div className="relative mt-3">
                  <Globe className="absolute left-8 top-1/2 -translate-y-1/2 text-text-secondary opacity-60 w-6 h-6 group-focus-within:text-primary group-focus-within:opacity-100 transition-all" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full bg-background/50 border border-border-medium rounded-[1.5rem] pl-20 pr-8 py-6 text-sm font-black text-text-primary outline-none focus:border-primary/40 transition-all shadow-inner-platinum font-mono lowercase tracking-wider"
                    placeholder="admin@bidflow.io"
                  />
                </div>
              </div>
              
              <div className="group">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em] px-4 group-focus-within:text-primary transition-colors">
                  {editingTenant ? 'Nova RSA de Acesso (Criptografada)' : 'Senha Neural Provisória'}
                </label>
                <div className="relative mt-3">
                  <Key className="absolute left-8 top-1/2 -translate-y-1/2 text-primary opacity-60 w-6 h-6 group-focus-within:opacity-100 transition-all" />
                  <input
                    type="password"
                    required={!editingTenant}
                    minLength={6}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder={editingTenant ? 'MANTER CRIPTOGRAFIA ATUAL' : '••••••••'}
                    className="w-full bg-background/50 border border-border-medium rounded-[1.5rem] pl-20 pr-8 py-6 text-sm font-black text-text-primary outline-none focus:border-primary/40 transition-all shadow-inner-platinum"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-end gap-6 pt-12 border-t border-border-subtle/30">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-12 py-5 text-[11px] font-black text-text-secondary hover:text-text-primary uppercase tracking-[0.4em] transition-all bg-surface-elevated/40 border border-border-subtle rounded-2xl hover:bg-surface-elevated"
            >
              Abortar Operação
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary py-5 px-16 shadow-platinum-glow uppercase text-[12px] font-black tracking-[0.4em] flex items-center justify-center gap-5 disabled:opacity-50 group"
            >
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save size={24} className="group-hover:scale-110 transition-transform" />}
              {isSubmitting ? 'Sincronizando Malha...' : (editingTenant ? 'Consolidar Cluster' : 'Provisionar Ecossistema')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
