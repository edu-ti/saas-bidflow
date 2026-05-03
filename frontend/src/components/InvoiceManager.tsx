import { useState, useEffect, useCallback } from 'react';
import { FileText, Send, XCircle, Plus, Loader2, Search, Zap, ShieldCheck } from 'lucide-react';
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
  draft:      { label: 'Rascunho',   cls: 'bg-white/5 text-text-muted border-white/10' },
  sent:       { label: 'Transmitida',cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  authorized: { label: 'Autorizada', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  cancelled:  { label: 'Cancelada',  cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
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
    <div className="space-y-6">
      {/* Platinum Filter Bar */}
      <div className="platinum-card p-5 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Localizar por número, chave ou destinatário..."
            className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-text-muted/30" 
          />
        </div>
        <select 
          value={filterType} 
          onChange={e => setFilterType(e.target.value)} 
          className="px-6 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-white focus:border-primary/40 outline-none transition-all appearance-none min-w-[180px]"
        >
          <option value="" className="bg-surface">Todas as Operações</option>
          <option value="output" className="bg-surface">Fluxo de Saída</option>
          <option value="input" className="bg-surface">Fluxo de Entrada</option>
        </select>
        <button 
          onClick={() => { setForm({ type:'output', number:'', total_value:'', recipient_name:'', recipient_document:'', notes:'', items_json:'[]' }); setModalOpen(true); }}
          className="px-8 py-3.5 bg-primary text-background font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-primary-hover transition-all shadow-platinum-glow flex items-center gap-2"
        >
          <Plus size={14} /> Nova NF-e
        </button>
      </div>

      {/* Platinum Table */}
      <div className="platinum-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-40">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Consultando Ledger Fiscal...</span>
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-24 text-center space-y-4 opacity-30">
            <FileText className="w-16 h-16 mx-auto text-text-muted" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Nenhum registro encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Identificador</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Natureza</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Destinatário</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Valor Operacional</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Integridade</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-text-muted uppercase tracking-widest">Ações Estratégicas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-5 font-mono text-xs text-white/80 group-hover:text-primary transition-colors">{inv.number || `#${inv.id}`}</td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                        {inv.type === 'output' ? <Zap size={10} className="text-emerald-400" /> : <ShieldCheck size={10} className="text-blue-400" />}
                        {inv.type === 'output' ? 'Saída' : 'Entrada'}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-bold text-white text-sm">{inv.recipient_name || '-'}</td>
                    <td className="px-6 py-5 font-black text-white text-sm">{fmt(inv.total_value)}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${STATUS_MAP[inv.status]?.cls}`}>
                        {STATUS_MAP[inv.status]?.label}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-3">
                        {inv.status === 'draft' && (
                          <button onClick={() => handleTransmit(inv.id)} className="px-4 py-2 bg-primary hover:bg-primary-hover text-background text-[10px] font-black rounded-lg transition-all flex items-center gap-2 uppercase tracking-widest">
                            <Send className="w-3 h-3" /> Transmitir
                          </button>
                        )}
                        {['sent','authorized'].includes(inv.status) && (
                          <button onClick={() => handleCancel(inv.id)} className="px-4 py-2 bg-white/5 hover:bg-red-500/10 text-red-400 border border-white/10 hover:border-red-500/20 text-[10px] font-black rounded-lg transition-all flex items-center gap-2 uppercase tracking-widest">
                            <XCircle className="w-3 h-3" /> Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal - Styled via props / global styles if applicable */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nova Emissão Fiscal" size="lg">
        <form onSubmit={handleCreate} className="space-y-6 p-2">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest">Natureza da Operação*</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value as 'input'|'output'})} className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/40 appearance-none">
                <option value="output" className="bg-surface">Saída (Venda/Serviço)</option>
                <option value="input" className="bg-surface">Entrada (Compra/Estorno)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest">Número (Referência)</label>
              <input value={form.number} onChange={e => setForm({...form, number: e.target.value})} placeholder="Numeração Automática" className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/40" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest">Razão Social / Destinatário</label>
              <input value={form.recipient_name} onChange={e => setForm({...form, recipient_name: e.target.value})} className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/40" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest">CPF / CNPJ</label>
              <input value={form.recipient_document} onChange={e => setForm({...form, recipient_document: e.target.value})} className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/40" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest">Valor Total da Operação*</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-xs">R$</span>
              <input type="number" step="0.01" required value={form.total_value} onChange={e => setForm({...form, total_value: e.target.value})} className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-primary/40" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest">Observações Tributárias</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/40 resize-none" />
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
            <button type="button" onClick={() => setModalOpen(false)} className="px-8 py-3 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/5 transition-all">Cancelar</button>
            <button type="submit" disabled={saving} className="px-10 py-3 bg-primary hover:bg-primary-hover text-background rounded-xl text-[10px] font-black uppercase tracking-widest shadow-platinum-glow flex items-center gap-2 transition-all disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Consolidar Emissão
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
