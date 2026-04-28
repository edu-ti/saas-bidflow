import { useState, useEffect } from 'react';
import { Plus, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import Modal from './ui/Modal';
import { useTheme } from '../context/ThemeContext';

interface AccountsPayable {
  id: number;
  reference_title: string;
  amount: string;
  due_date: string;
  status: string;
}

interface AccountsReceivable {
  id: number;
  reference_title: string;
  amount: string;
  due_date: string;
  status: string;
}

export default function AccountsPayableReceivable() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [payables, setPayables] = useState<AccountsPayable[]>([]);
  const [receivables, setReceivables] = useState<AccountsReceivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'receivable' | 'payable'>('receivable');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    reference_title: '',
    amount: '',
    due_date: '',
    status: 'Pending',
  });

  useEffect(() => {
    fetchFinance();
  }, []);

  const fetchFinance = async () => {
    try {
      const [resPayable, resReceivable] = await Promise.all([
        api.get('/api/accounts-payable'),
        api.get('/api/accounts-receivable')
      ]);
      setPayables(resPayable.data.data);
      setReceivables(resReceivable.data.data);
    } catch (error) {
      toast.error('Erro ao carregar dados financeiros');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const endpoint = tab === 'receivable' ? '/api/accounts-receivable' : '/api/accounts-payable';
      await api.post(endpoint, {
        ...formData,
        amount: parseFloat(formData.amount),
      });
      toast.success('Lançamento criado com sucesso!');
      setIsModalOpen(false);
      setFormData({ reference_title: '', amount: '', due_date: '', status: 'Pending' });
      fetchFinance();
    } catch (error) {
      toast.error('Erro ao criar lançamento');
      console.error(error);
    }
  };

  const formatCurrency = (val: string) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(val));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid': return <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-2.5 py-0.5 rounded-full text-xs font-medium">Pago</span>;
      case 'Overdue': return <span className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 px-2.5 py-0.5 rounded-full text-xs font-medium">Atrasado</span>;
      case 'Cancelled': return <span className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full text-xs font-medium">Cancelado</span>;
      default: return <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 px-2.5 py-0.5 rounded-full text-xs font-medium">Pendente</span>;
    }
  };

  const currentData = tab === 'receivable' ? receivables : payables;

  const base = dark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900';
  const card = dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const sub = dark ? 'text-slate-400' : 'text-slate-500';
  const th = dark ? 'bg-slate-700/60 text-slate-300' : 'bg-slate-50 text-slate-600';
  const tr = dark ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50/60';
  const input = dark ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900';

  return (
    <div className={`min-h-screen p-6 lg:p-8 ${base}`}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-500" />
            Contas a Pagar e Receber
          </h1>
          <p className={`text-sm mt-1 ${sub}`}>Gestão global de Tesouraria</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          Novo Lançamento
        </button>
      </div>

      <div className={`mb-6 border-b ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex space-x-8">
          <button
            onClick={() => setTab('receivable')}
            className={`pb-4 text-sm font-medium transition-colors border-b-2 ${tab === 'receivable' ? 'border-emerald-500 text-emerald-500' : `border-transparent ${sub} hover:text-emerald-500`}`}>
            Contas a Receber
          </button>
          <button
            onClick={() => setTab('payable')}
            className={`pb-4 text-sm font-medium transition-colors border-b-2 ${tab === 'payable' ? 'border-red-500 text-red-500' : `border-transparent ${sub} hover:text-red-500`}`}>
            Contas a Pagar
          </button>
        </div>
      </div>

      <div className={`rounded-xl shadow-sm border overflow-hidden ${card}`}>
        {loading ? (
          <div className={`p-8 text-center ${sub}`}>A carregar registos financeiros...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={`border-b ${dark ? 'border-slate-700' : 'border-slate-200'} ${th}`}>
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase text-xs">Título / Referência</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs">Vencimento</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs">Status</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Valor</th>
                </tr>
              </thead>
              <tbody className={dark ? 'divide-y divide-slate-700' : 'divide-y divide-slate-200'}>
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={`px-6 py-8 text-center ${sub}`}>
                      Nenhum registo financeiro encontrado.
                    </td>
                  </tr>
                ) : (
                  currentData.map(item => (
                    <tr key={item.id} className={`transition-colors ${tr}`}>
                      <td className="px-6 py-4 font-medium">{item.reference_title}</td>
                      <td className={`px-6 py-4 ${sub}`}>{new Date(item.due_date).toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                      <td className={`px-6 py-4 text-right font-bold ${tab === 'receivable' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {tab === 'payable' && '- '}{formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Novo Lançamento - ${tab === 'receivable' ? 'Contas a Receber' : 'Contas a Pagar'}`}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
              Título / Referência *
            </label>
            <input
              type="text"
              value={formData.reference_title}
              onChange={e => setFormData({ ...formData, reference_title: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
              placeholder="Ex: Projeto XYZ"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1.5 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                Data de Vencimento *
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
              Status
            </label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
            >
              <option value="Pending">Pendente</option>
              <option value="Paid">Pago</option>
              <option value="Overdue">Atrasado</option>
              <option value="Cancelled">Cancelado</option>
            </select>
          </div>

          <div className={`flex justify-end gap-3 pt-4 mt-2 border-t ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${dark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Criar Lançamento
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
