import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
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

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [maxUsers, setMaxUsers] = useState('1');
  const [active, setActive] = useState(true);
  const [features, setFeatures] = useState<string[]>([]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/api/master/plans');
      setPlans(res.data);
    } catch (err) {
      toast.error('Erro ao carregar planos');
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
        toast.success('Plano atualizado com sucesso!');
      } else {
        await api.post('/api/master/plans', payload);
        toast.success('Plano criado com sucesso!');
      }
      await fetchPlans();
      closeModal();
    } catch (err) {
      const error = err as any;
      const msg = error.response?.data?.message || 'Erro ao salvar o plano';
      toast.error(msg);
      console.error('Plan save error:', error.response?.data);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este plano?')) return;
    try {
      await api.delete(`/api/master/plans/${id}`);
      toast.success('Plano excluído com sucesso');
      fetchPlans();
    } catch (err) {
      toast.error('Erro ao excluir plano');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Gestão de Planos</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Configure os planos de assinatura do sistema</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus size={20} />
          Novo Plano
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-slate-500">Carregando planos...</p>
        ) : plans.length === 0 ? (
          <p className="text-slate-500">Nenhum plano cadastrado.</p>
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{plan.name}</h3>
                  {plan.active ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                      <CheckCircle size={14} /> Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                      <XCircle size={14} /> Inativo
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">R$ {Number(plan.monthly_price).toFixed(2)}</span>
                  <span className="text-slate-500 text-sm">/mês</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2 min-h-[40px]">
                  {plan.description || 'Sem descrição'}
                </p>
                <div className="flex items-center justify-between text-sm text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-4">
                  <span>Máx. Usuários:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{plan.max_users}</span>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                <button
                  onClick={() => openModal(plan)}
                  className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingPlan ? 'Editar Plano' : 'Novo Plano'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Plano</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Preço Mensal (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Limite de Usuários</label>
              <input
                type="number"
                min="1"
                required
                value={maxUsers}
                onChange={(e) => setMaxUsers(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="active" className="text-sm text-slate-700 dark:text-slate-300">
              Plano Ativo
            </label>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2 mt-4">
              Módulos Inclusos neste Plano
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AVAILABLE_MODULES.map((mod) => (
                <label key={mod.key} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
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
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-900"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{mod.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Salvar Plano
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
