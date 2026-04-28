import { useState, useEffect, useCallback } from 'react';
import { FileText, Send, XCircle, Plus, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import Modal from './ui/Modal';
import { useTheme } from '../context/ThemeContext';

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
  draft:      { label: 'Rascunho',   cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
  sent:       { label: 'Transmitida',cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  authorized: { label: 'Autorizada', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  cancelled:  { label: 'Cancelada',  cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
};

function fmt(v: string | number) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function InvoiceManager() {
  const { theme } = useTheme();
  const dark = theme === 'dark';
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
    } catch { toast.error('Erro ao carregar notas'); }
    finally { setLoading(false); }
  }, [search, filterType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/financial/invoices', { ...form, total_value: Number(form.total_value), items_json: JSON.parse(form.items_json || '[]') });
      toast.success('Nota fiscal criada!');
      setModalOpen(false);
      fetchData();
    } catch { toast.error('Erro ao criar nota'); }
    finally { setSaving(false); }
  };

  const handleTransmit = async (id: number) => {
    if (!confirm('Transmitir esta NF-e?')) return;
    try {
      await api.post(`/api/financial/invoices/${id}/transmit`);
      toast.success('Nota transmitida!');
      fetchData();
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Erro na transmissão'); }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Cancelar esta NF-e?')) return;
    try {
      await api.post(`/api/financial/invoices/${id}/cancel`);
      toast.success('Nota cancelada!');
      fetchData();
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Erro ao cancelar'); }
  };

  const card = dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const input = dark ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900';
  const sub = dark ? 'text-slate-400' : 'text-slate-500';
  const th = dark ? 'bg-slate-700/60 text-slate-300' : 'bg-slate-50 text-slate-600';
  const tr = dark ? 'border-slate-700 hover:bg-slate-700/40' : 'border-slate-100 hover:bg-slate-50/60';

  return (
    <div>
      {/* Filter bar */}
      <div className={`rounded-xl border p-4 mb-6 flex flex-col sm:flex-row gap-3 items-center ${card}`}>
        <div className="relative flex-1 w-full">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${sub}`} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por número ou destinatário..."
            className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`} />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className={`px-4 py-2.5 rounded-lg border text-sm ${input}`}>
          <option value="">Todos os tipos</option>
          <option value="output">Saída</option>
          <option value="input">Entrada</option>
        </select>
        <button onClick={() => { setForm({ type:'output', number:'', total_value:'', recipient_name:'', recipient_document:'', notes:'', items_json:'[]' }); setModalOpen(true); }}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl text-sm whitespace-nowrap shadow-lg shadow-blue-500/20">
          <Plus className="w-4 h-4 inline mr-1" />Nova NF-e
        </button>
      </div>

      {/* Table */}
      <div className={`rounded-xl border overflow-hidden ${card}`}>
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : invoices.length === 0 ? (
          <div className={`py-20 text-center ${sub}`}><FileText className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Nenhuma nota fiscal</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className={th}>
                <th className="px-4 py-3 text-left text-xs uppercase font-semibold">Número</th>
                <th className="px-4 py-3 text-left text-xs uppercase font-semibold">Tipo</th>
                <th className="px-4 py-3 text-left text-xs uppercase font-semibold">Destinatário</th>
                <th className="px-4 py-3 text-left text-xs uppercase font-semibold">Valor</th>
                <th className="px-4 py-3 text-left text-xs uppercase font-semibold">Status</th>
                <th className="px-4 py-3 text-right text-xs uppercase font-semibold">Ações</th>
              </tr></thead>
              <tbody className={dark ? 'divide-y divide-slate-700' : 'divide-y divide-slate-100'}>
                {invoices.map(inv => (
                  <tr key={inv.id} className={`transition-colors ${tr}`}>
                    <td className="px-4 py-3 font-mono text-xs">{inv.number || `#${inv.id}`}</td>
                    <td className="px-4 py-3">{inv.type === 'output' ? '📤 Saída' : '📥 Entrada'}</td>
                    <td className="px-4 py-3 font-medium">{inv.recipient_name || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-blue-500">{fmt(inv.total_value)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_MAP[inv.status]?.cls}`}>
                        {STATUS_MAP[inv.status]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.status === 'draft' && (
                          <button onClick={() => handleTransmit(inv.id)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium flex items-center gap-1">
                            <Send className="w-3 h-3" />Transmitir
                          </button>
                        )}
                        {['sent','authorized'].includes(inv.status) && (
                          <button onClick={() => handleCancel(inv.id)} className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 text-xs rounded-lg font-medium flex items-center gap-1">
                            <XCircle className="w-3 h-3" />Cancelar
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

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nova Nota Fiscal" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>Tipo *</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value as 'input'|'output'})} className={`w-full px-3 py-2.5 rounded-lg border text-sm ${input}`}>
                <option value="output">Saída (Venda)</option>
                <option value="input">Entrada (Compra)</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>Número</label>
              <input value={form.number} onChange={e => setForm({...form, number: e.target.value})} placeholder="Auto" className={`w-full px-3 py-2.5 rounded-lg border text-sm ${input}`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>Destinatário</label>
              <input value={form.recipient_name} onChange={e => setForm({...form, recipient_name: e.target.value})} className={`w-full px-3 py-2.5 rounded-lg border text-sm ${input}`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>CPF/CNPJ</label>
              <input value={form.recipient_document} onChange={e => setForm({...form, recipient_document: e.target.value})} className={`w-full px-3 py-2.5 rounded-lg border text-sm ${input}`} />
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>Valor Total *</label>
            <input type="number" step="0.01" required value={form.total_value} onChange={e => setForm({...form, total_value: e.target.value})} className={`w-full px-3 py-2.5 rounded-lg border text-sm ${input}`} />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>Observações</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className={`w-full px-3 py-2.5 rounded-lg border text-sm resize-none ${input}`} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className={`px-4 py-2 rounded-lg text-sm font-medium border ${dark ? 'border-slate-600 text-slate-300' : 'border-slate-300 text-slate-600'}`}>Cancelar</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60 flex items-center gap-1.5">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}Criar Nota
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
