import { useState, useEffect, useRef } from 'react';
import { Upload, Check, X, Link2, Loader2, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useTheme } from '../context/ThemeContext';

interface BankAccount { id: number; bank_name: string; agency: string; number: string; current_balance: string; }
interface ReconItem { id: number; transaction_date: string; amount: string; description: string; type: 'credit'|'debit'; match_status: 'unmatched'|'matched'|'ignored'; matched_statement_id: number|null; }
interface Reconciliation { id: number; file_name: string; status: string; total_transactions: number; matched_transactions: number; bank_account?: BankAccount; items: ReconItem[]; }

function fmt(v: string|number) { return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

export default function BankConciliation() {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const fileRef = useRef<HTMLInputElement>(null);

  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [activeRecon, setActiveRecon] = useState<Reconciliation | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/api/financial/bank-accounts'),
      api.get('/api/financial/reconciliations'),
    ]).then(([a, r]) => {
      setAccounts(a.data.data ?? []);
      setReconciliations(r.data.data ?? []);
    }).catch(() => toast.error('Erro ao carregar dados'))
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (file: File) => {
    if (!selectedAccount) { toast.error('Selecione uma conta bancária'); return; }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('bank_account_id', selectedAccount);
      const r = await api.post('/api/financial/ofx-import', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(r.data.message || 'OFX importado!');
      setActiveRecon(r.data.data);
      const updated = await api.get('/api/financial/reconciliations');
      setReconciliations(updated.data.data ?? []);
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Erro no import'); }
    finally { setUploading(false); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleReconcile = async (itemId: number, statementId: number | null) => {
    try {
      await api.post(`/api/financial/reconciliation-items/${itemId}/reconcile`, { statement_id: statementId });
      toast.success('Item conciliado!');
      if (activeRecon) {
        const r = await api.get('/api/financial/reconciliations');
        const updated = (r.data.data as Reconciliation[]).find(rc => rc.id === activeRecon.id);
        if (updated) setActiveRecon(updated);
        setReconciliations(r.data.data ?? []);
      }
    } catch { toast.error('Erro ao conciliar'); }
  };

  const card = dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const sub = dark ? 'text-slate-400' : 'text-slate-500';
  const input = dark ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900';
  const th = dark ? 'bg-slate-700/60 text-slate-300' : 'bg-slate-50 text-slate-600';

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div>
      {/* Upload Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div>
          <label className={`block text-sm font-medium mb-1.5 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>Conta Bancária</label>
          <select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)} className={`w-full px-3 py-2.5 rounded-lg border text-sm ${input}`}>
            <option value="">Selecione...</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.bank_name} · Ag {a.agency} · CC {a.number}</option>)}
          </select>
        </div>
        <div className="lg:col-span-2"
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <div className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${isDragOver ? 'border-blue-500 bg-blue-500/5' : dark ? 'border-slate-600 hover:border-slate-500' : 'border-slate-300 hover:border-blue-400'}`}
            onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept=".ofx,.OFX" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
            {uploading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" /> : <Upload className={`w-8 h-8 mx-auto mb-2 ${sub}`} />}
            <p className={`text-sm font-medium ${dark ? 'text-slate-200' : 'text-slate-700'}`}>Arraste o arquivo OFX ou clique para selecionar</p>
            <p className={`text-xs mt-1 ${sub}`}>Formato suportado: .ofx (Open Financial Exchange)</p>
          </div>
        </div>
      </div>

      {/* Active Reconciliation */}
      {activeRecon && (
        <div className={`rounded-xl border mb-6 overflow-hidden ${card}`}>
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">Conciliação: {activeRecon.file_name}</h3>
              <p className={`text-xs ${sub}`}>{activeRecon.matched_transactions}/{activeRecon.total_transactions} conciliadas · Status: {activeRecon.status}</p>
            </div>
            <button onClick={() => setActiveRecon(null)} className={`p-1.5 rounded-lg ${dark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}><X className="w-4 h-4" /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className={th}>
                <th className="px-4 py-2.5 text-left text-xs font-semibold">Data</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold">Descrição</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold">Valor</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold">Tipo</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold">Status</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold">Ação</th>
              </tr></thead>
              <tbody className={dark ? 'divide-y divide-slate-700' : 'divide-y divide-slate-100'}>
                {activeRecon.items.map(item => (
                  <tr key={item.id} className={item.match_status === 'matched' ? (dark ? 'bg-emerald-900/10' : 'bg-emerald-50/50') : ''}>
                    <td className="px-4 py-2.5 text-xs">{item.transaction_date}</td>
                    <td className="px-4 py-2.5 text-xs">{item.description || '-'}</td>
                    <td className={`px-4 py-2.5 text-right font-semibold text-xs ${Number(item.amount) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{fmt(item.amount)}</td>
                    <td className="px-4 py-2.5 text-center text-xs">{item.type === 'credit' ? '↑ Crédito' : '↓ Débito'}</td>
                    <td className="px-4 py-2.5 text-center">
                      {item.match_status === 'matched' && <span className="text-xs text-emerald-500 font-medium flex items-center justify-center gap-1"><Check className="w-3 h-3" />OK</span>}
                      {item.match_status === 'unmatched' && <span className="text-xs text-amber-500 font-medium">Pendente</span>}
                      {item.match_status === 'ignored' && <span className="text-xs text-slate-400 font-medium">Ignorado</span>}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {item.match_status === 'unmatched' && (
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleReconcile(item.id, null)} className="px-2 py-1 text-xs bg-slate-500/10 hover:bg-slate-500/20 text-slate-500 rounded font-medium">Ignorar</button>
                          <button onClick={() => handleReconcile(item.id, item.matched_statement_id ?? 0)} className="px-2 py-1 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded font-medium flex items-center gap-1"><Link2 className="w-3 h-3" />Conciliar</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History */}
      <div className={`rounded-xl border overflow-hidden ${card}`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-sm flex items-center gap-2"><FileSpreadsheet className="w-4 h-4" />Histórico de Conciliações</h3>
        </div>
        {reconciliations.length === 0 ? (
          <div className={`py-12 text-center ${sub}`}><p className="text-sm">Nenhuma conciliação realizada</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className={th}>
                <th className="px-4 py-2.5 text-left text-xs font-semibold">Arquivo</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold">Conta</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold">Transações</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold">Conciliadas</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold">Status</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold">Ação</th>
              </tr></thead>
              <tbody className={dark ? 'divide-y divide-slate-700' : 'divide-y divide-slate-100'}>
                {reconciliations.map(r => (
                  <tr key={r.id} className={`transition-colors ${dark ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50/60'}`}>
                    <td className="px-4 py-2.5 font-mono text-xs">{r.file_name}</td>
                    <td className="px-4 py-2.5 text-xs">{r.bank_account?.bank_name ?? '-'}</td>
                    <td className="px-4 py-2.5 text-center font-semibold">{r.total_transactions}</td>
                    <td className="px-4 py-2.5 text-center font-semibold text-emerald-500">{r.matched_transactions}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                        {r.status === 'completed' ? 'Concluída' : r.status === 'reconciling' ? 'Em Andamento' : 'Importada'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button onClick={() => setActiveRecon(r)} className="px-3 py-1 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg font-medium">Ver</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
