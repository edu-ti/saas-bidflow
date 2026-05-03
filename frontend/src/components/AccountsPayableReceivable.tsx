import { useState, useEffect } from 'react';
import { Plus, CreditCard, Search, Zap, Calendar, DollarSign, Filter, ArrowUpRight, ArrowDownLeft, ShieldCheck, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import Modal from './ui/Modal';

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
      toast.success('Lançamento consolidado no ledger!');
      setIsModalOpen(false);
      setFormData({ reference_title: '', amount: '', due_date: '', status: 'Pending' });
      fetchFinance();
    } catch (error) {
      toast.error('Falha na operação financeira');
      console.error(error);
    }
  };

  const formatCurrency = (val: string) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(val) || 0);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'Paid': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'Overdue': 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_-5px_rgba(239,68,68,0.4)]',
      'Cancelled': 'bg-white/5 text-text-muted border-white/10',
      'Pending': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    };
    const labels: Record<string, string> = {
      'Paid': 'LIQUIDADO',
      'Overdue': 'ATRASADO',
      'Cancelled': 'CANCELADO',
      'Pending': 'AGUARDANDO',
    };
    return (
      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${styles[status] || styles.Pending}`}>
        {labels[status] || 'PENDENTE'}
      </span>
    );
  };

  const currentData = (tab === 'receivable' ? receivables : payables).filter(item => 
    item.reference_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = currentData.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-8 text-white animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Financial <span className="text-gradient-gold">Ledger</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <CreditCard size={12} className="text-primary" />
            Tesouraria global, fluxo de caixa e controle de adimplência.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Posição Consolidada</span>
            <span className={`text-xs font-bold uppercase tracking-tighter ${tab === 'receivable' ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(totalAmount.toString())}
            </span>
          </div>
          <div className="w-px h-8 bg-white/5" />
          <Zap className="text-primary w-5 h-5 animate-pulse" />
        </div>
      </header>

      {/* Tabs & New Entry */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
        <div className="flex gap-2 p-1 bg-white/[0.02] border border-white/5 rounded-2xl w-fit">
          <button
            onClick={() => setTab('receivable')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              tab === 'receivable' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]' : 'text-text-muted hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            Receitas (A Receber)
          </button>
          <button
            onClick={() => setTab('payable')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              tab === 'payable' ? 'bg-red-500/20 text-red-400 border border-red-500/20 shadow-[0_0_15px_-5px_rgba(239,68,68,0.3)]' : 'text-text-muted hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            Despesas (A Pagar)
          </button>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow uppercase text-[10px] tracking-widest"
        >
          <Plus className="w-4 h-4" />
          Novo Lançamento
        </button>
      </div>

      {/* Control Card */}
      <div className="platinum-card p-6 flex flex-wrap gap-6 items-center justify-between">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Filtrar por título, cliente ou nota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-background border border-white/5 rounded-xl text-sm text-white focus:border-primary/30 outline-none transition-all placeholder:text-text-muted"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-text-muted hover:text-primary transition-all">
            <Filter size={16} />
          </button>
          <button className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-text-muted hover:text-primary transition-all">
            <Calendar size={16} />
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="platinum-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 animate-pulse">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Sincronizando Tesouraria...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">ID / Referência</th>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Vencimento</th>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Status Operacional</th>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-right">Valor Consolidado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-16 text-center">
                      <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
                        <DollarSign size={32} className="text-primary" />
                      </div>
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Sem lançamentos registrados</p>
                    </td>
                  </tr>
                ) : (
                  currentData.map(item => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-bold text-white group-hover:text-primary transition-colors uppercase text-xs tracking-tight">{item.reference_title}</div>
                        <div className="text-[9px] text-text-muted font-black mt-1">ID: #{item.id.toString().padStart(6, '0')}</div>
                      </td>
                      <td className="px-8 py-6 text-text-secondary font-mono text-xs">
                        {new Date(item.due_date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-8 py-6">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className={`px-8 py-6 text-right font-black text-xs ${tab === 'receivable' ? 'text-emerald-400' : 'text-red-400'}`}>
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

      {/* Modal - Platinum Style */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={tab === 'receivable' ? 'LANÇAR RECEITA' : 'LANÇAR DESPESA'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-8 p-2">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Identificação da Transação *</label>
            <input
              type="text"
              value={formData.reference_title}
              onChange={e => setFormData({ ...formData, reference_title: e.target.value })}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all"
              placeholder="Ex: Pagamento Projeto Alpha"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Valor Nominal (BRL) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all font-mono"
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Data de Vencimento *</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all appearance-none"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Status Inicial</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all appearance-none"
            >
              <option value="Pending" className="bg-surface">Aguardando Pagamento</option>
              <option value="Paid" className="bg-surface">Liquidado (Pago)</option>
              <option value="Overdue" className="bg-surface">Atrasado / Crítico</option>
              <option value="Cancelled" className="bg-surface">Cancelado / Estornado</option>
            </select>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-8 py-4 text-[10px] font-black text-text-muted hover:text-white uppercase tracking-widest transition-all"
            >
              Descartar
            </button>
            <button
              type="submit"
              className="px-10 py-4 bg-primary text-background text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary-hover transition-all shadow-platinum-glow flex items-center gap-2"
            >
              <ShieldCheck size={16} />
              Consolidar Lançamento
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
