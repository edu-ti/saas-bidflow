import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle, XCircle, ShieldCheck, DollarSign, Users, Layout, Zap, Loader2, Save, Sparkles, Activity, Target, Check, ChevronRight } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';

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
  { key: 'management', label: '1. Gestão (Dash, Config, Equipe, BI, Licenças)' },
  { key: 'commercial', label: '2. Comercial (Clientes, Leads, Propostas, Funil, Catálogo, Agenda)' },
  { key: 'bidding', label: '3. Licitações (Radar, Editais, Monitoramento, Funil, Pregão, IA)' },
  { key: 'financial', label: '4. Financeiro (Motor, Contas, Contratos CLM)' },
  { key: 'inventory', label: '5. Estoque (Inventário, Consignado)' },
  { key: 'marketing', label: '6. Add-on: Marketing (Campanhas, E-mail)' },
  { key: 'chatbot', label: '7. Add-on: Chatbot & Conversas' },
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

  const handleDelete = async (id: number) => {
    if (!window.confirm('Confirmar deleção permanente deste tier de serviço?')) return;
    try {
      await api.delete(`/api/master/plans/${id}`);
      toast.success('Plano removido do ecossistema.');
      fetchPlans();
    } catch (err) {
      toast.error('Erro na deleção do registro.');
    }
  };

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Product <span className="text-gradient-gold">Tier Architecture</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <ShieldCheck size={14} className="text-primary" />
            Configuração de níveis de serviço, cotas de usuários e matriz de funcionalidades Platinum.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary py-4 px-10 shadow-platinum-glow flex items-center gap-4 uppercase text-[10px] tracking-[0.3em] group"
        >
          <Plus size={20} className="group-hover:scale-125 transition-transform" />
          Novo Nível de Serviço
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-40 flex flex-col items-center justify-center gap-8">
            <div className="w-16 h-16 rounded-[2rem] bg-surface-elevated flex items-center justify-center border border-border-subtle shadow-inner-platinum">
               <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.5em] animate-pulse">Indexando Malha de Produtos...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-full py-40 flex flex-col items-center gap-6 opacity-30">
             <Layout size={64} className="text-text-secondary" />
             <p className="text-[11px] font-black uppercase tracking-[0.5em] text-text-secondary">Nenhum tier de serviço detectado na infraestrutura.</p>
          </div>
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className="platinum-card bg-surface-elevated/10 backdrop-blur-xl border-border-subtle/30 overflow-hidden flex flex-col group hover:border-primary/40 transition-all duration-700 shadow-platinum-glow-sm">
              <div className="p-10 flex-1 space-y-10">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter group-hover:text-primary transition-colors">{plan.name}</h3>
                    <div className="text-[9px] text-text-secondary font-black uppercase tracking-widest opacity-60">PLATINUM_REF: {plan.id.toString().padStart(3, '0')}</div>
                  </div>
                  {plan.active ? (
                    <span className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black text-[9px] uppercase tracking-widest shadow-platinum-glow-sm">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Ativo
                    </span>
                  ) : (
                    <span className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-surface-elevated/40 text-text-secondary border border-border-subtle font-black text-[9px] uppercase tracking-widest">
                      <XCircle size={14} /> Inativo
                    </span>
                  )}
                </div>
                
                <div className="flex items-baseline gap-3 border-y border-border-subtle/30 py-6">
                  <span className="text-4xl font-black text-text-primary tracking-tighter text-gradient-gold">R$ {Number(plan.monthly_price).toFixed(2)}</span>
                  <span className="text-text-secondary text-[10px] font-black uppercase tracking-[0.2em] opacity-80">/ Mensalidade Core</span>
                </div>

                <p className="text-text-secondary text-[11px] font-black uppercase tracking-tight leading-relaxed italic opacity-80 min-h-[50px] line-clamp-3">
                  {plan.description || 'Nenhuma especificação técnica disponível para este nível de serviço.'}
                </p>

                <div className="space-y-5 pt-4">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary group-hover:text-text-primary transition-colors">
                    <span className="flex items-center gap-3"><Users size={14} className="text-primary opacity-60" /> Cota de Operadores:</span>
                    <span className="text-text-primary bg-surface-elevated/40 px-3 py-1 rounded-lg border border-border-subtle shadow-inner-platinum">{plan.max_users} Nodes</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary group-hover:text-text-primary transition-colors">
                    <span className="flex items-center gap-3"><Zap size={14} className="text-primary opacity-60" /> Malha de Módulos:</span>
                    <span className="text-text-primary bg-primary/5 px-3 py-1 rounded-lg border border-primary/20 shadow-platinum-glow-sm">{plan.features?.length || 0} Ativos</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-elevated/30 px-10 py-6 border-t border-border-subtle/30 flex justify-end gap-4">
                <button
                  onClick={() => openModal(plan)}
                  className="p-4 text-text-secondary hover:text-primary bg-surface-elevated/40 border border-border-subtle rounded-2xl transition-all shadow-inner-platinum hover:scale-110"
                  title="Refinar Nível"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-red-500/60 hover:text-red-500 transition-all shadow-inner-platinum hover:scale-110"
                  title="Deletar Registro"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingPlan ? 'REFINAR NÍVEL DE SERVIÇO' : 'ARQUITETAR NOVO PLANO PLATINUM'} size="lg">
        <form onSubmit={handleSubmit} className="p-10 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4 group">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em] px-4 group-focus-within:text-primary transition-colors">Designação do Tier Platinum *</label>
              <div className="relative mt-2">
                <Layout className="absolute left-8 top-1/2 -translate-y-1/2 text-primary opacity-60 w-6 h-6 group-focus-within:opacity-100 transition-all" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background/50 border border-border-medium rounded-[1.5rem] pl-20 pr-8 py-6 text-sm font-black text-text-primary outline-none focus:border-primary/40 transition-all shadow-inner-platinum uppercase tracking-tight"
                  placeholder="Ex: Enterprise High-Performance"
                />
              </div>
            </div>
            <div className="space-y-4 group">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em] px-4 group-focus-within:text-emerald-500 transition-colors">Valuation Mensal (BRL)</label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-8 top-1/2 -translate-y-1/2 text-emerald-500 w-6 h-6" />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-background/50 border border-border-medium rounded-[1.5rem] pl-20 pr-8 py-6 text-base font-black text-emerald-500 outline-none focus:border-emerald-500/40 transition-all shadow-inner-platinum font-mono"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 group">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em] px-4 group-focus-within:text-primary transition-colors">Diretriz Estratégica do Produto</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-background/50 border border-border-medium rounded-[2.5rem] px-10 py-10 text-sm font-black text-text-primary outline-none focus:border-primary/40 transition-all shadow-inner-platinum min-h-[150px] placeholder:text-text-secondary/20 leading-relaxed"
              placeholder="Descreva o posicionamento de mercado e os diferenciais competitivos deste tier..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-border-subtle/30 pt-10">
            <div className="space-y-4 group">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em] px-4 group-focus-within:text-primary transition-colors">Cota de Operadores Simultâneos</label>
              <div className="relative mt-2">
                <Users className="absolute left-8 top-1/2 -translate-y-1/2 text-text-secondary opacity-40 w-6 h-6 group-focus-within:text-primary group-focus-within:opacity-100 transition-all" />
                <input
                  type="number"
                  min="1"
                  required
                  value={maxUsers}
                  onChange={(e) => setMaxUsers(e.target.value)}
                  className="w-full bg-background/50 border border-border-medium rounded-[1.5rem] pl-20 pr-8 py-6 text-base font-black text-text-primary outline-none focus:border-primary/40 transition-all shadow-inner-platinum text-center"
                />
              </div>
            </div>
            <div className="flex flex-col justify-end gap-4 pb-6">
               <label className="flex items-center gap-5 cursor-pointer group w-fit">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="hidden"
                    />
                    <div className={`w-16 h-9 rounded-full transition-all duration-700 border border-border-subtle shadow-inner-platinum ${active ? 'bg-emerald-500' : 'bg-surface-elevated'}`}>
                       <div className={`absolute top-1.5 w-6 h-6 rounded-full bg-white transition-all duration-500 shadow-lg ${active ? 'left-8.5' : 'left-1.5'}`} />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                     <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] group-hover:text-text-primary transition-colors">Status Comercial</span>
                     <p className={`text-[9px] font-black uppercase tracking-widest ${active ? 'text-emerald-500' : 'text-text-secondary opacity-60'}`}>
                        {active ? 'Disponível no Marketplace' : 'Indisponível para Venda'}
                     </p>
                  </div>
               </label>
            </div>
          </div>

          <div className="space-y-10 border-t border-border-subtle/30 pt-10">
            <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.5em] flex items-center gap-5">
              <Zap size={20} className="text-primary shadow-platinum-glow-sm" /> Matriz de Malha Funcional
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {AVAILABLE_MODULES.map((mod) => (
                <label key={mod.key} className={`flex items-center gap-6 p-8 border rounded-[1.5rem] cursor-pointer transition-all duration-700 shadow-inner-platinum ${
                  features.includes(mod.key) 
                  ? 'bg-primary/5 border-primary/40' 
                  : 'bg-background/30 border-border-subtle/50 hover:border-primary/20'
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
                      className="w-7 h-7 rounded-lg border-border-medium text-primary focus:ring-primary bg-background shadow-inner-platinum cursor-pointer"
                    />
                    {features.includes(mod.key) && <Check size={16} className="absolute text-primary animate-in zoom-in-50" />}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed ${features.includes(mod.key) ? 'text-text-primary' : 'text-text-secondary opacity-80'}`}>{mod.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-end gap-6 pt-12 border-t border-border-subtle/30">
            <button
              type="button"
              onClick={closeModal}
              className="px-12 py-5 text-[11px] font-black text-text-secondary hover:text-text-primary uppercase tracking-[0.4em] transition-all bg-surface-elevated/40 border border-border-subtle rounded-2xl hover:bg-surface-elevated"
            >
              Abortar Operação
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary py-5 px-16 shadow-platinum-glow uppercase text-[12px] font-black tracking-[0.5em] flex items-center justify-center gap-5 disabled:opacity-50 group"
            >
              {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save size={24} className="group-hover:scale-110 transition-transform" />}
              {saving ? 'Sincronizando Malha...' : (editingPlan ? 'Consolidar Tier' : 'Validar Arquitetura')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
