import { useState, useEffect } from 'react';
import { Plus, CreditCard, Search, Zap, Calendar, DollarSign, Filter, ArrowUpRight, ArrowDownLeft, ShieldCheck, X, Loader2, ChevronRight, TrendingUp, TrendingDown, Layout, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import Modal from './ui/Modal';
import { DatePicker } from './ui/DatePicker';
import { Select } from './ui/Select';
import { format } from 'date-fns';

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
  const [payables, setPayables] = useState<AccountsPayable[]>([]);
  const [receivables, setReceivables] = useState<AccountsReceivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'receivable' | 'payable'>('receivable');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
      setPayables(resPayable.data.data || []);
      setReceivables(resReceivable.data.data || []);
    } catch (error) {
      toast.error('Erro ao sincronizar dados da tesouraria');
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
        amount: parseFloat(formData.amount) || 0,
      });
      toast.success('Lançamento consolidado no ledger!');
      setIsModalOpen(false);
      setFormData({ reference_title: '', amount: '', due_date: '', status: 'Pending' });
      fetchFinance();
    } catch (error) {
      toast.error('Falha na operação financeira');
    }
  };

  const formatCurrency = (val: string) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(val) || 0);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'Paid': 'bg-success/10 text-success border-success/20',
      'Overdue': 'bg-danger/10 text-danger border-danger/20',
      'Cancelled': 'bg-bg-tertiary text-text-muted border-border',
      'Pending': 'bg-warning/10 text-warning border-warning/20',
    };
    const labels: Record<string, string> = {
      'Paid': 'Liquidado',
      'Overdue': 'Atrasado',
      'Cancelled': 'Cancelado',
      'Pending': 'Aguardando',
    };
    return (
      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${styles[status] || styles.Pending}`}>
        {labels[status] || 'Pendente'}
      </span>
    );
  };

  const currentData = (tab === 'receivable' ? receivables : payables).filter(item => 
    (item.reference_title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = currentData.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Financial Ledger
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Tesouraria global, fluxo de caixa e controle de adimplência.
          </p>
        </div>
        <div className="flex items-center gap-4 card px-6 py-4">
          <div className="flex flex-col items-end">
            <span className="text-xs font-medium text-text-muted">Posição Consolidada</span>
            <span className={`text-xl font-semibold tracking-tight transition-colors duration-500 ${tab === 'receivable' ? 'text-success' : 'text-danger'}`}>
              {formatCurrency(totalAmount.toString())}
            </span>
          </div>
          <div className="w-px h-10 bg-border mx-1" />
          <div className={`p-2.5 rounded-lg transition-all duration-500 ${tab === 'receivable' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
            {tab === 'receivable' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
        </div>
      </header>

      {/* Tabs & Actions */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between shrink-0">
        <div className="flex p-1 bg-bg-secondary border border-border rounded-lg w-fit">
          <button
            onClick={() => setTab('receivable')}
            className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
              tab === 'receivable' ? 'bg-background text-text-primary shadow-sm border border-border' : 'text-text-muted hover:text-text-primary border border-transparent'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            A Receber
          </button>
          <button
            onClick={() => setTab('payable')}
            className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
              tab === 'payable' ? 'bg-background text-text-primary shadow-sm border border-border' : 'text-text-muted hover:text-text-primary border border-transparent'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            A Pagar
          </button>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Lançamento</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por referência, cliente ou identificador digital..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full pl-9"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-outline flex items-center gap-2">
            <Filter size={16} />
            <span className="hidden sm:inline">Filtrar</span>
          </button>
          <button className="btn btn-outline flex items-center gap-2">
            <Calendar size={16} />
            <span className="hidden sm:inline">Período</span>
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="card overflow-hidden flex-1 overflow-y-auto min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-text-muted animate-pulse">Sincronizando Tesouraria Global...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-bg-tertiary border-b border-border text-text-secondary">
                <tr>
                  <th className="px-6 py-3 font-medium">Referência / ID</th>
                  <th className="px-6 py-3 font-medium">Data de Vencimento</th>
                  <th className="px-6 py-3 font-medium text-center">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Valor Líquido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-32 text-center">
                      <div className="w-16 h-16 bg-bg-tertiary border border-border rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <DollarSign size={32} className="text-text-muted" />
                      </div>
                      <p className="text-sm font-medium text-text-muted">Sem lançamentos registrados no horizonte atual</p>
                    </td>
                  </tr>
                ) : (
                  currentData.map(item => (
                    <tr key={item.id} className="hover:bg-bg-tertiary transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-text-primary group-hover:text-primary transition-colors">{item.reference_title}</div>
                        <div className="text-xs text-text-muted mt-1 font-mono">ID: #{item.id.toString().padStart(8, '0')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-text-secondary">
                           <Calendar size={14} className="text-text-muted" />
                           <span>{new Date(item.due_date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className={`px-6 py-4 text-right font-semibold transition-colors duration-300 ${tab === 'receivable' ? 'text-success' : 'text-danger'}`}>
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={tab === 'receivable' ? 'Lançar Receita' : 'Lançar Despesa'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Referência / Identificação <span className="text-danger">*</span></label>
            <div className="relative">
               <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
               <input
                type="text"
                value={formData.reference_title}
                onChange={e => setFormData({ ...formData, reference_title: e.target.value })}
                className="input w-full pl-9"
                placeholder="Ex: Pagamento Projeto Alpha"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Valor (R$) <span className="text-danger">*</span></label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="input w-full"
                  placeholder="0,00"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Data de Vencimento <span className="text-danger">*</span></label>
              <DatePicker
                selected={formData.due_date ? new Date(`${formData.due_date}T12:00:00`) : null}
                onChange={date => setFormData({ ...formData, due_date: date ? format(date, "yyyy-MM-dd") : '' })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Status do Lançamento</label>
            <div className="relative">
              <Select
                value={formData.status}
                onChange={v => setFormData({ ...formData, status: v })}
                options={[
                  { value: 'Pending', label: 'Aguardando Liquidação' },
                  { value: 'Paid', label: 'Liquidado (Conciliado)' },
                  { value: 'Overdue', label: 'Atrasado / Crítico' },
                  { value: 'Cancelled', label: 'Cancelado / Estornado' }
                ]}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-outline"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Consolidar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
