import { useState, useEffect, useCallback } from 'react';
import { FileText, Send, XCircle, Plus, Loader2, Search, Zap, ShieldCheck, ChevronRight, Layout, DollarSign, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import Modal from './ui/Modal';

interface Invoice {
  id: number;
  type: 'input' | 'output';
  status: 'draft' | 'sent' | 'authorized' | 'cancelled';
  number: string | null;
  total_value: string;
  recipient_name: string | null;
  recipient_document: string | null;
  notes: string | null;
  authorized_at: string | null;
  created_at: string;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft:      { label: 'Rascunho',   cls: 'bg-surface-elevated/40 text-text-muted border-border-subtle' },
  sent:       { label: 'Transmitida',cls: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  authorized: { label: 'Autorizada', cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  cancelled:  { label: 'Cancelada',  cls: 'bg-red-500/10 text-red-500 border-red-500/20' },
};

function fmt(v: string | number) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function InvoiceManager() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: 'output' as 'input'|'output', number: '', total_value: '', recipient_name: '', recipient_document: '', notes: '', items_json: '[]' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string,string> = {};
      if (search) params.search = search;
      if (filterType) params.type = filterType;
      const r = await api.get('/api/financial/invoices', { params });
      setInvoices(r.data.data ?? []);
    } catch { toast.error('Erro ao sincronizar repositório fiscal'); }
    finally { setLoading(false); }
  }, [search, filterType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/financial/invoices', { ...form, total_value: Number(form.total_value), items_json: JSON.parse(form.items_json || '[]') });
      toast.success('Documento fiscal emitido!');
      setModalOpen(false);
      fetchData();
    } catch { toast.error('Falha na emissão da nota'); }
    finally { setSaving(false); }
  };

  const handleTransmit = async (id: number) => {
    if (!confirm('Iniciar transmissão para SEFAZ?')) return;
    try {
      await api.post(`/api/financial/invoices/${id}/transmit`);
      toast.success('Transmissão concluída com sucesso!');
      fetchData();
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Erro crítico na transmissão'); }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Solicitar cancelamento desta NF-e?')) return;
    try {
      await api.post(`/api/financial/invoices/${id}/cancel`);
      toast.success('Nota cancelada no repositório fiscal.');
      fetchData();
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Erro ao processar cancelamento'); }
  };

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Repositório <span className="text-gradient-gold">Fiscal & Compliance</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <Database size={14} className="text-primary" />
            Orquestração de emissão, transmissão e cancelamento de documentos fiscais eletrônicos.
          </p>
        </div>
      </header>

      {/* Platinum Filter Bar */}
      <div className="platinum-card p-8 flex flex-col sm:flex-row gap-6 items-center bg-surface-elevated/10 backdrop-blur-xl border-border-subtle/30 shadow-platinum-glow-sm">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Interrogar por número, chave ou destinatário digital..."
            className="w-full pl-14 pr-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum" 
          />
        </div>
        <div className="relative">
          <select 
            value={filterType} 
            onChange={e => setFilterType(e.target.value)} 
            className="pl-6 pr-12 py-4 bg-background/50 border border-border-medium rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-primary focus:border-primary/40 outline-none transition-all appearance-none cursor-pointer min-w-[220px] shadow-inner-platinum"
          >
            <option value="" className="bg-surface">Todas as Operações Core</option>
            <option value="output" className="bg-surface">Fluxo de Saída Neural</option>
            <option value="input" className="bg-surface">Fluxo de Entrada RPA</option>
          </select>
          <ChevronRight size={14} className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-text-muted opacity-40 pointer-events-none" />
        </div>
        <button 
          onClick={() => { setForm({ type:'output', number:'', total_value:'', recipient_name:'', recipient_document:'', notes:'', items_json:'[]' }); setModalOpen(true); }}
          className="btn-primary py-4 px-10 shadow-platinum-glow flex items-center gap-3 uppercase text-[10px] tracking-widest whitespace-nowrap"
        >
          <Plus size={18} /> Nova Emissão NF-e
        </button>
      </div>

      {/* Platinum Table */}
      <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6 opacity-40">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Sincronizando Ledger Fiscal SEFAZ...</span>
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-40 text-center space-y-6 opacity-40">
            <div className="w-20 h-20 bg-surface-elevated rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border-subtle shadow-inner-platinum">
               <FileText className="w-10 h-10 text-text-muted" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Nenhum registro fiscal no horizonte atual</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-platinum">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-elevated/40 border-b border-border-subtle">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60">Identificador Digital</th>
                  <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60">Natureza Operacional</th>
                  <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60">Destinatário</th>
                  <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60">Valuation de Ciclo</th>
                  <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60">Integridade SEFAZ</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60">Ações Estratégicas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/20">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-surface-elevated/20 transition-all group border-b border-border-subtle/10 duration-300">
                    <td className="px-8 py-8 font-black text-[11px] text-text-primary tracking-widest group-hover:text-primary transition-colors">{inv.number || `DRAFT_#${inv.id}`}</td>
                    <td className="px-8 py-8">
                      <span className="text-[10px] font-black text-text-primary uppercase tracking-[0.2em] flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full shadow-platinum-glow ${inv.type === 'output' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                        {inv.type === 'output' ? 'Saída_Digital' : 'Entrada_RPA'}
                      </span>
                    </td>
                    <td className="px-8 py-8 font-black text-text-primary text-xs uppercase tracking-tight group-hover:translate-x-1 transition-all duration-300">{inv.recipient_name || 'DESTINATÁRIO_PENDENTE'}</td>
                    <td className="px-8 py-8 font-black text-text-primary tracking-tighter text-sm group-hover:text-primary transition-colors">{fmt(inv.total_value)}</td>
                    <td className="px-8 py-8">
                      <span className={`inline-flex px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-platinum-glow-sm ${STATUS_MAP[inv.status]?.cls}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse" />
                        {STATUS_MAP[inv.status]?.label}
                      </span>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                        {inv.status === 'draft' && (
                          <button onClick={() => handleTransmit(inv.id)} className="btn-primary py-2.5 px-6 text-[9px] font-black rounded-xl shadow-platinum-glow flex items-center gap-2">
                            <Send className="w-3 h-3" /> Transmitir SEFAZ
                          </button>
                        )}
                        {['sent','authorized'].includes(inv.status) && (
                          <button onClick={() => handleCancel(inv.id)} className="px-5 py-2.5 bg-red-500/5 hover:bg-red-500/10 text-red-500/60 border border-red-500/10 hover:border-red-500/20 text-[9px] font-black rounded-xl transition-all flex items-center gap-2 uppercase tracking-widest shadow-inner-platinum">
                            <XCircle className="w-3.5 h-3.5" /> Cancelar Operação
                          </button>
                        )}
                        <button className="p-3 bg-surface-elevated/40 text-text-muted hover:text-primary rounded-xl border border-border-subtle shadow-inner-platinum transition-all">
                           <Layout size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="NOVA EMISSÃO FISCAL PLATINUM" size="lg">
        <form onSubmit={handleCreate} className="p-4 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4 group">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Natureza da Operação Core*</label>
              <div className="relative">
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value as 'input'|'output'})} className="w-full bg-background/50 border border-border-medium rounded-2xl pl-6 pr-12 py-5 text-xs font-black uppercase tracking-widest text-text-primary focus:border-primary/40 outline-none appearance-none cursor-pointer shadow-inner-platinum">
                  <option value="output" className="bg-surface">Saída Neural (Venda/Serviço)</option>
                  <option value="input" className="bg-surface">Entrada RPA (Compra/Estorno)</option>
                </select>
                <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-text-muted opacity-40 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-4 group">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Número de Referência</label>
              <div className="relative">
                <FileText className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6 opacity-40" />
                <input value={form.number} onChange={e => setForm({...form, number: e.target.value})} placeholder="SEQ_AUTOMATIC_PLATINUM" className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-bold text-text-primary focus:border-primary/40 outline-none shadow-inner-platinum" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4 group">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Razão Social / Destinatário Digital</label>
              <div className="relative">
                <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/60 w-6 h-6" />
                <input value={form.recipient_name} onChange={e => setForm({...form, recipient_name: e.target.value})} className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-bold text-text-primary focus:border-primary/40 outline-none shadow-inner-platinum" />
              </div>
            </div>
            <div className="space-y-4 group">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">CPF / CNPJ Validado</label>
              <div className="relative">
                <Database className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6 opacity-40" />
                <input value={form.recipient_document} onChange={e => setForm({...form, recipient_document: e.target.value})} className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-bold text-text-primary focus:border-primary/40 outline-none shadow-inner-platinum" />
              </div>
            </div>
          </div>
          <div className="space-y-4 group">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Valuation Total da Operação Fiscal*</label>
            <div className="relative">
              <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 w-6 h-6" />
              <input type="number" step="0.01" required value={form.total_value} onChange={e => setForm({...form, total_value: e.target.value})} className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-xl font-black text-emerald-500 outline-none focus:border-primary/40 shadow-inner-platinum" placeholder="0.00" />
            </div>
          </div>
          <div className="space-y-4 group">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Cláusulas & Observações Tributárias</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} className="w-full bg-background/50 border border-border-medium rounded-2xl px-8 py-5 text-sm font-medium text-text-primary outline-none focus:border-primary/40 resize-none shadow-inner-platinum" placeholder="Especifique as regras fiscais e desonerações..." />
          </div>
          <div className="flex justify-end gap-6 pt-10 border-t border-border-subtle/30">
            <button type="button" onClick={() => setModalOpen(false)} className="px-10 py-5 text-[10px] font-black text-text-muted hover:text-text-primary uppercase tracking-[0.3em] transition-all">Descartar</button>
            <button type="submit" disabled={saving} className="btn-primary py-5 px-12 shadow-platinum-glow uppercase text-[11px] tracking-[0.4em] flex items-center gap-4 transition-all disabled:opacity-50">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus size={20} />} Consolidar Registro Fiscal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
