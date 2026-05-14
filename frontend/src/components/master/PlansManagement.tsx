import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle, XCircle, ShieldCheck, DollarSign, Users, Layout, Zap, Loader2, Save, Sparkles, Activity, Target, Check, ChevronRight } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import Modal, { ConfirmDialog } from '../ui/Modal';

interface Plan {
 id: number;
 name: string;
 description: string;
 monthly_price: number;
 max_users: number;
 active: boolean;
 features: string[];
}

const AVAILABLE_MODULES = [
  { key: 'management', label: '1. Gestão (Dash, Equipe, BI, Licenças)' },
  { key: 'commercial', label: '2. Comercial (Clientes, Leads, Propostas, Funil, Catálogo, Agenda)' },
  { key: 'bidding', label: '3. Licitações (Radar, Editais, Monitoramento, Funil, Pregão, IA)' },
  { key: 'financial', label: '4. Financeiro (Motor, Contas, Contratos CLM, Compliance Fiscal)' },
  { key: 'inventory', label: '5. Estoque (Inventário, Consignado)' },
  { key: 'modules', label: '6. Configurações (Meu Perfil, Alertas, Gateway RPA, Criptografia, Core Business, Níveis de Acesso)' },
  { key: 'marketing', label: '7. Add-on: Marketing (Campanhas, E-mail)' },
  { key: 'chatbot', label: '8. Add-on: Chatbot & Conversas' },
];

export default function PlansManagement() {
 const [plans, setPlans] = useState<Plan[]>([]);
 const [loading, setLoading] = useState(true);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

 const [name, setName] = useState('');
 const [description, setDescription] = useState('');
 const [price, setPrice] = useState('');
 const [maxUsers, setMaxUsers] = useState('1');
 const [active, setActive] = useState(true);
  const [features, setFeatures] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

 useEffect(() => {
 fetchPlans();
 }, []);

 const fetchPlans = async () => {
 setLoading(true);
 try {
 const res = await api.get('/api/master/plans');
 setPlans(res.data);
 } catch (err) {
 toast.error('Erro na indexação de níveis de serviço.');
 } finally {
 setLoading(false);
 }
 };

 const openModal = (plan?: Plan) => {
 if (plan) {
 setEditingPlan(plan);
 setName(plan.name);
 setDescription(plan.description || '');
 setPrice(plan.monthly_price.toString());
 setMaxUsers(plan.max_users.toString());
 setActive(plan.active);
 setFeatures(plan.features || []);
 } else {
 setEditingPlan(null);
 setName('');
 setDescription('');
 setPrice('');
 setMaxUsers('1');
 setActive(true);
 setFeatures([]);
 }
 setIsModalOpen(true);
 };

 const closeModal = () => {
 setIsModalOpen(false);
 setEditingPlan(null);
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setSaving(true);
 const payload = {
 name,
 description,
 monthly_price: parseFloat(price) || 0,
 max_users: parseInt(maxUsers) || 1,
 active,
 features,
 };

 try {
 if (editingPlan) {
 await api.put(`/api/master/plans/${editingPlan.id}`, payload);
 toast.success('Arquitetura de Tier atualizada!');
 } else {
 await api.post('/api/master/plans', payload);
 toast.success('Novo Nível de Serviço consolidado!');
 }
 await fetchPlans();
 closeModal();
 } catch (err: any) {
 toast.error(err.response?.data?.message || 'Erro na validação do plano');
 } finally {
 setSaving(false);
 }
 };

  const openDeleteConfirm = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/api/master/plans/${deleteId}`);
      toast.success('Plano removido do ecossistema.');
      fetchPlans();
    } catch (err) {
      toast.error('Erro na deleção do registro.');
    } finally {
      setDeleteId(null);
      setConfirmOpen(false);
    }
  };

 return (
 <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
 <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shrink-0">
 <div className="space-y-1">
 <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
 Product <span className="text-primary">Tier Architecture</span>
 </h1>
 <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
 <ShieldCheck size={14} className="text-primary" />
 Configuração de níveis de serviço, cotas de usuários e matriz de funcionalidades.
 </p>
 </div>
  <button
  onClick={() => openModal()}
  className="btn btn-primary py-2.5 px-6 flex items-center gap-2 uppercase text-xs tracking-widest group"
  >
 <Plus size={20} className="group-hover:scale-125 transition-transform" />
 Novo Nível de Serviço
 </button>
 </header>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {loading ? (
 <div className="col-span-full py-40 flex flex-col items-center justify-center gap-8">
 <div className="w-16 h-16 rounded-xl bg-bg-tertiary flex items-center justify-center border border-border ">
 <Loader2 className="animate-spin text-primary w-8 h-8" />
 </div>
 <p className="text-xs font-semibold text-text-secondary uppercase animate-pulse">Indexando Malha de Produtos...</p>
 </div>
 ) : plans.length === 0 ? (
 <div className="col-span-full py-40 flex flex-col items-center gap-6 opacity-30">
 <Layout size={64} className="text-text-secondary" />
 <p className="text-sm font-semibold uppercase text-text-secondary">Nenhum tier de serviço detectado na infraestrutura.</p>
 </div>
 ) : (
 plans.map((plan) => (
 <div key={plan.id} className="card bg-bg-tertiary/10 backdrop-blur-xl border-border/30 overflow-hidden flex flex-col group hover:border-primary/40 transition-all duration-700 ">
  <div className="p-6 flex-1 space-y-5">
  <div className="flex justify-between items-start">
  <div className="space-y-1">
  <h3 className="text-lg font-semibold text-text-primary uppercase tracking-tight group-hover:text-primary transition-colors">{plan.name}</h3>
  <div className="text-xs text-text-secondary font-semibold uppercase tracking-widest opacity-60">ID: {plan.id.toString().padStart(3, '0')}</div>
  </div>
  {plan.active ? (
  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold text-xs uppercase tracking-widest">
  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ativo
  </span>
  ) : (
  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-tertiary/40 text-text-secondary border border-border font-semibold text-xs uppercase tracking-widest">
  <XCircle size={12} /> Inativo
  </span>
  )}
  </div>

  <div className="flex items-baseline gap-2 border-y border-border/30 py-4">
  <span className="text-xl font-semibold text-text-primary tracking-tight text-primary">R$ {Number(plan.monthly_price).toFixed(2)}</span>
  <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider opacity-80">/ mês</span>
  </div>

  <p className="text-text-secondary text-sm font-medium leading-relaxed opacity-70 min-h-[40px] line-clamp-2">
  {plan.description || 'Sem descrição disponível.'}
  </p>

  <div className="space-y-3 pt-2">
  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-text-secondary group-hover:text-text-primary transition-colors">
  <span className="flex items-center gap-2"><Users size={12} className="text-primary opacity-60" /> Usuários:</span>
  <span className="text-text-primary bg-bg-tertiary/40 px-2 py-0.5 rounded-md border border-border">{plan.max_users}</span>
  </div>
  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-text-secondary group-hover:text-text-primary transition-colors">
  <span className="flex items-center gap-2"><Zap size={12} className="text-primary opacity-60" /> Módulos:</span>
  <span className="text-text-primary bg-primary/5 px-2 py-0.5 rounded-md border border-primary/20">{plan.features?.length || 0}</span>
  </div>
  </div>
  </div>

  <div className="bg-bg-tertiary/30 px-6 py-4 border-t border-border/30 flex justify-end gap-3">
  <button
  onClick={() => openModal(plan)}
  className="p-2.5 text-text-secondary hover:text-primary bg-bg-tertiary/40 border border-border rounded-xl transition-all hover:scale-105"
  title="Editar"
  >
  <Edit size={16} />
  </button>
           <button
             onClick={() => openDeleteConfirm(plan.id)}
             className="p-2.5 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500/60 hover:text-red-500 transition-all hover:scale-105"
             title="Excluir"
           >
  <Trash2 size={16} />
  </button>
  </div>
 </div>
 ))
 )}
 </div>

  <Modal isOpen={isModalOpen} onClose={closeModal} title={editingPlan ? 'Editar Plano' : 'Novo Plano'} size="lg">
  <form onSubmit={handleSubmit} className="p-6 space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="space-y-2 group">
  <label className="text-xs font-semibold text-text-secondary uppercase group-focus-within:text-primary transition-colors">Nome do Plano *</label>
  <div className="relative">
  <Layout className="absolute left-3 top-1/2 -translate-y-1/2 text-primary opacity-60 w-4 h-4 group-focus-within:opacity-100 transition-all" />
  <input
  type="text"
  required
  value={name}
  onChange={(e) => setName(e.target.value)}
  className="w-full bg-background/50 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm font-semibold text-text-primary outline-none focus:border-primary/40 transition-all uppercase tracking-tight"
  placeholder="Ex: Enterprise"
  />
  </div>
  </div>
  <div className="space-y-2 group">
  <label className="text-xs font-semibold text-text-secondary uppercase group-focus-within:text-emerald-500 transition-colors">Preço Mensal (R$)</label>
  <div className="relative">
  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 w-4 h-4" />
  <input
  type="number"
  step="0.01"
  required
  value={price}
  onChange={(e) => setPrice(e.target.value)}
  className="w-full bg-background/50 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm font-semibold text-emerald-500 outline-none focus:border-emerald-500/40 transition-all font-mono"
  placeholder="0,00"
  />
  </div>
  </div>
  </div>

  <div className="space-y-2 group">
  <label className="text-xs font-semibold text-text-secondary uppercase group-focus-within:text-primary transition-colors">Descrição</label>
  <textarea
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  className="w-full bg-background/50 border border-border rounded-lg px-4 py-3 text-sm font-semibold text-text-primary outline-none focus:border-primary/40 transition-all min-h-[100px] placeholder:text-text-secondary/20 leading-relaxed"
  placeholder="Descreva o plano..."
  />
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border/30 pt-6">
  <div className="space-y-2 group">
  <label className="text-xs font-semibold text-text-secondary uppercase group-focus-within:text-primary transition-colors">Máx. Usuários</label>
  <div className="relative">
  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary opacity-40 w-4 h-4 group-focus-within:text-primary group-focus-within:opacity-100 transition-all" />
  <input
  type="number"
  min="1"
  required
  value={maxUsers}
  onChange={(e) => setMaxUsers(e.target.value)}
  className="w-full bg-background/50 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm font-semibold text-text-primary outline-none focus:border-primary/40 transition-all text-center"
  />
  </div>
  </div>
  <div className="flex flex-col justify-end gap-2 pb-1">
  <label className="flex items-center gap-3 cursor-pointer group w-fit">
  <div className="relative">
  <input
  type="checkbox"
  checked={active}
  onChange={(e) => setActive(e.target.checked)}
  className="hidden"
  />
  <div className={`w-12 h-7 rounded-full transition-all duration-300 border border-border ${active ? 'bg-emerald-500' : 'bg-bg-tertiary'}`}>
  <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-md ${active ? 'left-6' : 'left-1'}`} />
  </div>
  </div>
  <div className="space-y-0.5">
  <span className="text-xs font-semibold text-text-secondary uppercase tracking-widest group-hover:text-text-primary transition-colors">Status</span>
  <p className={`text-xs font-semibold uppercase tracking-widest ${active ? 'text-emerald-500' : 'text-text-secondary opacity-60'}`}>
  {active ? 'Ativo' : 'Inativo'}
  </p>
  </div>
  </label>
  </div>
  </div>

  <div className="space-y-4 border-t border-border/30 pt-6">
  <h3 className="text-xs font-semibold text-text-primary uppercase flex items-center gap-2">
  <Zap size={16} className="text-primary" /> Módulos Incluídos
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  {AVAILABLE_MODULES.map((mod) => (
  <label key={mod.key} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all duration-300 ${
  features.includes(mod.key)
  ? 'bg-primary/5 border-primary/40'
  : 'bg-background/30 border-border/50 hover:border-primary/20'
  }`}>
  <div className="relative flex items-center justify-center">
  <input
  type="checkbox"
  checked={features.includes(mod.key)}
  onChange={(e) => {
  if (e.target.checked) {
  setFeatures([...features, mod.key]);
  } else {
  setFeatures(features.filter(k => k !== mod.key));
  }
  }}
  className="w-5 h-5 rounded border-border text-primary focus:ring-primary bg-background cursor-pointer"
  />
  {features.includes(mod.key) && <Check size={12} className="absolute text-primary pointer-events-none" />}
  </div>
  <span className={`text-xs font-semibold uppercase tracking-wider leading-relaxed ${features.includes(mod.key) ? 'text-text-primary' : 'text-text-secondary opacity-80'}`}>{mod.label}</span>
  </label>
  ))}
  </div>
  </div>

  <div className="flex flex-col md:flex-row justify-end gap-3 pt-6 border-t border-border/30">
  <button
  type="button"
  onClick={closeModal}
  className="px-6 py-2.5 text-sm font-semibold text-text-secondary hover:text-text-primary uppercase transition-all bg-bg-tertiary/40 border border-border rounded-lg hover:bg-bg-tertiary"
  >
  Cancelar
  </button>
  <button
  type="submit"
  disabled={saving}
  className="btn btn-primary py-2.5 px-8 uppercase text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50 group"
  >
  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} className="group-hover:scale-110 transition-transform" />}
  {saving ? 'Salvando...' : (editingPlan ? 'Salvar' : 'Criar Plano')}
  </button>
  </div>
  </form>
   </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Plano"
        message="Confirmar deleção permanente deste tier de serviço?"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
  </div>
  );
}
