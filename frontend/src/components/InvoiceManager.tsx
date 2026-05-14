import { useState, useEffect, useCallback } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { FileText, Send, XCircle, Plus, Loader2, Search, Zap, ShieldCheck, ChevronRight, Layout, DollarSign, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import Modal, { ConfirmDialog } from './ui/Modal';
import { Select } from './ui/Select';

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
  draft:      { label: 'Rascunho',   cls: 'bg-bg-tertiary text-text-muted border-border' },
  sent:       { label: 'Transmitida',cls: 'bg-primary/10 text-primary border-primary/20' },
  authorized: { label: 'Autorizada', cls: 'bg-success/10 text-success border-success/20' },
  cancelled:  { label: 'Cancelada',  cls: 'bg-danger/10 text-danger border-danger/20' },
};

function fmt(v: string | number) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function InvoiceManager() {
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('financial', 'invoices', 'create');
  const canTransmit = hasPermission('financial', 'invoices', 'transmit');
  const canCancel = hasPermission('financial', 'invoices', 'cancel');

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'transmit' | 'cancel' | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
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

  const openConfirm = (id: number, action: 'transmit' | 'cancel') => {
    setConfirmId(id);
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmId || !confirmAction) return;
    try {
      if (confirmAction === 'transmit') {
        await api.post(`/api/financial/invoices/${confirmId}/transmit`);
        toast.success('Transmissão concluída com sucesso!');
      } else {
        await api.post(`/api/financial/invoices/${confirmId}/cancel`);
        toast.success('Nota cancelada no repositório fiscal.');
      }
      fetchData();
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Erro na operação'); }
    finally {
      setConfirmOpen(false);
      setConfirmId(null);
      setConfirmAction(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Repositório Fiscal & Compliance
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Orquestração de emissão, transmissão e cancelamento de documentos fiscais eletrônicos.
          </p>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="card p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Buscar por número, chave ou destinatário..."
            className="input w-full pl-9" 
          />
        </div>
        <div className="w-full sm:w-[220px]">
          <Select 
            value={filterType} 
            onChange={v => setFilterType(v)} 
            options={[
              { value: '', label: 'Todas as Operações' },
              { value: 'output', label: 'Fluxo de Saída' },
              { value: 'input', label: 'Fluxo de Entrada' }
            ]}
          />
        </div>
        {canCreate && (
          <button 
            onClick={() => { setForm({ type:'output', number:'', total_value:'', recipient_name:'', recipient_document:'', notes:'', items_json:'[]' }); setModalOpen(true); }}
            className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Plus size={16} /> <span>Nova NF-e</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm font-medium text-text-muted animate-pulse">Sincronizando SEFAZ...</span>
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-bg-tertiary rounded-2xl flex items-center justify-center border border-border">
               <FileText className="w-8 h-8 text-text-muted" />
            </div>
            <p className="text-sm font-medium text-text-muted">Nenhum registro fiscal encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-bg-tertiary border-b border-border text-text-secondary">
                <tr>
                  <th className="px-6 py-3 font-medium">Identificador</th>
                  <th className="px-6 py-3 font-medium">Natureza</th>
                  <th className="px-6 py-3 font-medium">Destinatário</th>
                  <th className="px-6 py-3 font-medium">Valor Total</th>
                  <th className="px-6 py-3 font-medium">Status SEFAZ</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-bg-tertiary transition-colors group">
                    <td className="px-6 py-4 font-medium text-text-primary group-hover:text-primary transition-colors">{inv.number || `DRAFT_#${inv.id}`}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-text-primary flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${inv.type === 'output' ? 'bg-success' : 'bg-primary'}`} />
                        {inv.type === 'output' ? 'Saída' : 'Entrada'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary truncate max-w-[200px]" title={inv.recipient_name || ''}>{inv.recipient_name || 'DESTINATÁRIO PENDENTE'}</td>
                    <td className="px-6 py-4 font-semibold text-text-primary">{fmt(inv.total_value)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium border items-center gap-1.5 ${STATUS_MAP[inv.status]?.cls}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        {STATUS_MAP[inv.status]?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {inv.status === 'draft' && canTransmit && (
                          <button onClick={() => openConfirm(inv.id, 'transmit')} className="btn btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5">
                            <Send className="w-3.5 h-3.5" /> Transmitir
                          </button>
                        )}
                        {['sent','authorized'].includes(inv.status) && canCancel && (
                          <button onClick={() => openConfirm(inv.id, 'cancel')} className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors" title="Cancelar Nota">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 text-text-muted hover:text-primary hover:bg-bg-secondary rounded-lg transition-colors" title="Ver Detalhes">
                           <Layout size={16} />
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nova Emissão Fiscal" size="lg">
        <form onSubmit={handleCreate} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Natureza da Operação <span className="text-danger">*</span></label>
              <Select
                value={form.type}
                onChange={v => setForm({...form, type: v as 'input'|'output'})}
                options={[
                  { value: 'output', label: 'Saída (Venda/Serviço)' },
                  { value: 'input', label: 'Entrada (Compra/Estorno)' }
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Número de Referência</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                <input value={form.number} onChange={e => setForm({...form, number: e.target.value})} placeholder="Gerado automaticamente" className="input w-full pl-9" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Razão Social / Destinatário</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                <input value={form.recipient_name} onChange={e => setForm({...form, recipient_name: e.target.value})} className="input w-full pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">CPF / CNPJ</label>
              <div className="relative">
                <Database className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                <input value={form.recipient_document} onChange={e => setForm({...form, recipient_document: e.target.value})} className="input w-full pl-9" />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Valor Total (R$) <span className="text-danger">*</span></label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-success w-4 h-4" />
              <input type="number" step="0.01" required value={form.total_value} onChange={e => setForm({...form, total_value: e.target.value})} className="input w-full pl-9 font-semibold text-success" placeholder="0.00" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Observações / Dados Adicionais</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} className="input w-full" placeholder="Informações complementares de interesse do fisco..." />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">Cancelar</button>
            <button type="submit" disabled={saving} className="btn btn-primary flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={16} />} 
              <span>Emitir Documento</span>
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        title={confirmAction === 'transmit' ? 'Transmitir NF-e' : 'Cancelar NF-e'}
        message={confirmAction === 'transmit' ? 'Iniciar transmissão para SEFAZ?' : 'Solicitar cancelamento desta NF-e?'}
        confirmText={confirmAction === 'transmit' ? 'Transmitir' : 'Cancelar'}
        cancelText="Cancelar"
        variant={confirmAction === 'cancel' ? 'danger' : 'warning'}
      />
    </div>
  );
}
