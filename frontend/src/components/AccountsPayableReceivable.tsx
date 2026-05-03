import { useState, useEffect } from 'react';
import { Plus, CreditCard, Search, Zap, Calendar, DollarSign, Filter, ArrowUpRight, ArrowDownLeft, ShieldCheck, X, Loader2, ChevronRight, TrendingUp, TrendingDown, Layout, Database } from 'lucide-react';
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
      'Paid': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-platinum-glow-sm',
      'Overdue': 'bg-red-500/10 text-red-500 border-red-500/20 shadow-platinum-glow-sm',
      'Cancelled': 'bg-surface-elevated/40 text-text-muted border-border-subtle',
      'Pending': 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-platinum-glow-sm',
    };
    const labels: Record<string, string> = {
      'Paid': 'LIQUIDADO',
      'Overdue': 'ATRASADO',
      'Cancelled': 'CANCELADO',
      'Pending': 'AGUARDANDO',
    };
    return (
      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border backdrop-blur-md transition-all group-hover:scale-105 shadow-platinum-glow-sm ${styles[status] || styles.Pending}`}>
        {labels[status] || 'PENDENTE'}
      </span>
    );
  };

  const currentData = (tab === 'receivable' ? receivables : payables).filter(item => 
    (item.reference_title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = currentData.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Financial <span className="text-gradient-gold">Ledger</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <CreditCard size={14} className="text-primary" />
            Tesouraria global, fluxo de caixa e controle de adimplência Platinum.
          </p>
        </div>
        <div className="flex items-center gap-6 bg-surface-elevated/20 border border-border-subtle/30 px-10 py-6 rounded-[2.5rem] shadow-platinum-glow-sm backdrop-blur-md">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted opacity-60">Posição Consolidada</span>
            <span className={`text-2xl font-black tracking-tighter uppercase transition-colors duration-500 ${tab === 'receivable' ? 'text-emerald-500' : 'text-red-500'}`}>
              {formatCurrency(totalAmount.toString())}
            </span>
          </div>
          <div className="w-px h-12 bg-border-subtle/30 mx-2" />
          <div className={`p-3 rounded-2xl shadow-platinum-glow-sm transition-all duration-500 ${tab === 'receivable' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
            {tab === 'receivable' ? <TrendingUp className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />}
          </div>
        </div>
      </header>

      {/* Tabs & Actions */}
      <div className="flex flex-col lg:flex-row gap-8 items-center justify-between shrink-0">
        <div className="flex gap-4 p-2 bg-surface-elevated/20 border border-border-subtle/30 rounded-[3rem] w-fit shadow-inner-platinum">
          <button
            onClick={() => setTab('receivable')}
            className={`flex items-center gap-3 px-10 py-4 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 ${
              tab === 'receivable' ? 'bg-emerald-500 text-white shadow-platinum-glow-sm' : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated/40'
            }`}
          >
            <ArrowDownLeft className="w-5 h-5" />
            A Receber Neural
          </button>
          <button
            onClick={() => setTab('payable')}
            className={`flex items-center gap-3 px-10 py-4 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 ${
              tab === 'payable' ? 'bg-red-500 text-white shadow-platinum-glow-sm' : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated/40'
            }`}
          >
            <ArrowUpRight className="w-5 h-5" />
            A Pagar RPA
          </button>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary py-5 px-12 shadow-platinum-glow flex items-center gap-4 uppercase text-[11px] tracking-[0.3em]"
        >
          <Plus className="w-6 h-6" />
          Novo Lançamento Ledger
        </button>
      </div>

      {/* Filters */}
      <div className="platinum-card p-8 flex flex-col md:flex-row gap-8 items-center justify-between bg-surface-elevated/10 backdrop-blur-xl shrink-0 border-border-subtle/30">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Interrogar por referência, cliente ou identificador digital..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-6 py-4.5 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum"
          />
        </div>
        <div className="flex items-center gap-5">
          <button className="p-4.5 bg-surface-elevated/40 border border-border-subtle rounded-2xl text-text-muted hover:text-primary transition-all shadow-inner-platinum hover:scale-110">
            <Filter size={20} />
          </button>
          <button className="p-4.5 bg-surface-elevated/40 border border-border-subtle rounded-2xl text-text-muted hover:text-primary transition-all shadow-inner-platinum hover:scale-110">
            <Calendar size={20} />
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 flex-1 overflow-y-auto min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-8 opacity-40">
            <Loader2 className="w-14 h-14 animate-spin text-primary" />
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.5em] animate-pulse">Sincronizando Tesouraria Global...</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-platinum">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-elevated/40 border-b border-border-subtle">
                <tr>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">ID / Referência Estratégica</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">Data de Vencimento</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60 text-center">Status Operacional</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60 text-right">Valor Líquido Consolidado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/20">
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-10 py-40 text-center">
                      <div className="w-24 h-24 bg-surface-elevated/40 border border-border-subtle rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 opacity-30 shadow-inner-platinum">
                        <DollarSign size={48} className="text-primary" />
                      </div>
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.5em] opacity-60">Sem lançamentos registrados no horizonte atual</p>
                    </td>
                  </tr>
                ) : (
                  currentData.map(item => (
                    <tr key={item.id} className="hover:bg-surface-elevated/20 transition-all group border-b border-border-subtle/10 duration-300">
                      <td className="px-10 py-8">
                        <div className="font-black text-text-primary group-hover:text-primary transition-colors uppercase text-sm tracking-tight">{item.reference_title}</div>
                        <div className="text-[10px] text-text-muted font-black mt-2 opacity-50 uppercase tracking-widest">ID_LEDGER: #{item.id.toString().padStart(8, '0')}</div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-3 text-text-secondary font-black text-[11px] uppercase tracking-widest opacity-80">
                           <Calendar size={14} className="text-primary/40" />
                           {new Date(item.due_date).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className={`px-10 py-8 text-right font-black text-base tracking-tighter transition-colors duration-500 ${tab === 'receivable' ? 'text-emerald-500 group-hover:text-emerald-400' : 'text-red-500 group-hover:text-red-400'}`}>
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
        title={tab === 'receivable' ? 'LANÇAR RECEITA ESTRATÉGICA PLATINUM' : 'LANÇAR DESPESA CORE OPERACIONAL'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="p-4 space-y-12">
          <div className="space-y-4 group">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Identificação da Transação Core *</label>
            <div className="relative">
               <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/60 w-6 h-6" />
               <input
                type="text"
                value={formData.reference_title}
                onChange={e => setFormData({ ...formData, reference_title: e.target.value })}
                className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/30 shadow-inner-platinum"
                placeholder="Ex: Liquidação Projeto Alpha / Fat: 8829-B"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4 group">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Valor Nominal (BRL) *</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted font-black text-[11px] uppercase opacity-40">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-background/50 border border-border-medium rounded-2xl pl-14 pr-6 py-5 text-base font-black text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum"
                  placeholder="0,00"
                  required
                />
              </div>
            </div>

            <div className="space-y-4 group">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Data de Vencimento *</label>
              <div className="relative">
                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6 opacity-40" />
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all appearance-none cursor-pointer shadow-inner-platinum"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 group">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Status do Lançamento</label>
            <div className="relative">
               <Database className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6 opacity-40" />
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-12 py-5 text-xs font-black uppercase tracking-[0.2em] text-text-primary focus:border-primary/40 outline-none transition-all appearance-none cursor-pointer shadow-inner-platinum"
              >
                <option value="Pending" className="bg-surface font-bold text-text-primary">AGUARDANDO LIQUIDAÇÃO</option>
                <option value="Paid" className="bg-surface font-bold text-text-primary">LIQUIDADO (CONCILIADO)</option>
                <option value="Overdue" className="bg-surface font-bold text-text-primary">ATRASADO / CRÍTICO</option>
                <option value="Cancelled" className="bg-surface font-bold text-text-primary">CANCELADO / ESTORNADO</option>
              </select>
              <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-text-muted opacity-40 pointer-events-none" />
            </div>
          </div>

          <div className="flex justify-end gap-6 pt-10 border-t border-border-subtle/30">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-10 py-5 text-[10px] font-black text-text-muted hover:text-text-primary uppercase tracking-[0.3em] transition-all"
            >
              Descartar
            </button>
            <button
              type="submit"
              className="btn-primary py-5 px-14 shadow-platinum-glow flex items-center gap-4 uppercase text-[11px] tracking-[0.4em]"
            >
              <ShieldCheck size={22} className="shadow-platinum-glow-sm" />
              Consolidar no Ledger
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
