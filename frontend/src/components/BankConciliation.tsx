import { useState, useEffect, useRef } from 'react';
import { Upload, Check, X, Link2, Loader2, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useTheme } from '../context/ThemeContext';

interface BankAccount { id: number; bank_name: string; agency: string; number: string; current_balance: string; }
interface PayableReceivable { id: number; reference_title: string; amount: string; due_date: string; }
interface ReconItem { 
  id: number; 
  transaction_date: string; 
  amount: string; 
  description: string; 
  type: 'credit'|'debit'; 
  match_status: 'unmatched'|'suggested_match'|'matched'|'ignored'; 
  payable_id: number | null;
  receivable_id: number | null;
  payable?: PayableReceivable;
  receivable?: PayableReceivable;
}
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
      const r = await api.post('/api/financial/ofx-upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(r.data.message || 'OFX importado!');
      
      const reconId = r.data.data.id;
      const r2 = await api.get(`/api/financial/reconciliation/${selectedAccount}`);
      setActiveRecon({ ...r.data.data, items: r2.data.data || [] });
      
      const updated = await api.get('/api/financial/reconciliations');
      setReconciliations(updated.data.data ?? []);
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Erro no import'); }
    finally { setUploading(false); }
  };

  const loadActiveRecon = async (accountId: string) => {
    try {
      const r = await api.get(`/api/financial/reconciliation/${accountId}`);
      if (r.data.data && r.data.data.length > 0) {
        setActiveRecon((prev: any) => ({ ...prev, items: r.data.data }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleReconcile = async (item: ReconItem) => {
    try {
      await api.post(`/api/financial/reconcile`, { 
        item_id: item.id, 
        payable_id: item.payable_id, 
        receivable_id: item.receivable_id 
      });
      toast.success('Conciliação confirmada!');
      if (activeRecon && selectedAccount) {
        await loadActiveRecon(selectedAccount);
        const r = await api.get('/api/financial/reconciliations');
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
          <select value={selectedAccount} onChange={e => {
            setSelectedAccount(e.target.value);
            if (e.target.value) loadActiveRecon(e.target.value);
            else setActiveRecon(null);
          }} className={`w-full px-3 py-2.5 rounded-lg border text-sm ${input}`}>
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
            <input ref={fileRef} type="file" accept=".ofx,.xml" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
            {uploading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" /> : <Upload className={`w-8 h-8 mx-auto mb-2 ${sub}`} />}
            <p className={`text-sm font-medium ${dark ? 'text-slate-200' : 'text-slate-700'}`}>Arraste o arquivo OFX ou clique para selecionar</p>
            <p className={`text-xs mt-1 ${sub}`}>Formato suportado: .ofx (Open Financial Exchange)</p>
          </div>
        </div>
      </div>

      {/* Active Reconciliation */}
      {activeRecon && activeRecon.items && (
        <div className={`rounded-xl border mb-6 overflow-hidden ${card}`}>
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">Conciliação: {activeRecon.file_name}</h3>
              <p className={`text-xs ${sub}`}>Status: {activeRecon.status}</p>
            </div>
            <button onClick={() => setActiveRecon(null)} className={`p-1.5 rounded-lg ${dark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}><X className="w-4 h-4" /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className={th}>
                <th colSpan={3} className="px-4 py-2.5 border-r border-slate-200 dark:border-slate-700 text-center font-bold text-slate-700 dark:text-slate-200">Extrato do Banco (OFX)</th>
                <th colSpan={3} className="px-4 py-2.5 text-center font-bold text-slate-700 dark:text-slate-200">Sistema BidFlow</th>
              </tr><tr className={`border-b ${dark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
                <th className="px-4 py-2.5 text-left text-xs font-semibold">Data/Desc</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold">Valor</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold border-r border-slate-200 dark:border-slate-700">Tipo</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold">Sugestão (Pagar/Receber)</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold">Status</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold">Ação</th>
              </tr></thead>
              <tbody className={dark ? 'divide-y divide-slate-700' : 'divide-y divide-slate-100'}>
                {activeRecon.items.map(item => {
                  const isMatched = item.match_status === 'matched';
                  const isSuggested = item.match_status === 'suggested_match';
                  const matchedSys = item.payable || item.receivable;

                  return (
                    <tr key={item.id} className={isMatched ? (dark ? 'bg-emerald-900/10' : 'bg-emerald-50/50') : ''}>
                      {/* Lado Esquerdo (Banco) */}
                      <td className="px-4 py-2.5 text-xs">
                        <div className="font-medium">{item.transaction_date}</div>
                        <div className={`mt-0.5 truncate max-w-[200px] ${sub}`} title={item.description || '-'}>{item.description || '-'}</div>
                      </td>
                      <td className={`px-4 py-2.5 text-right font-semibold text-xs ${Number(item.amount) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{fmt(item.amount)}</td>
                      <td className="px-4 py-2.5 text-center text-xs border-r border-slate-200 dark:border-slate-700">{item.type === 'credit' ? '↑ C' : '↓ D'}</td>
                      
                      {/* Lado Direito (Sistema) */}
                      <td className="px-4 py-2.5 text-xs">
                        {matchedSys ? (
                          <div>
                            <div className="font-semibold text-blue-600 dark:text-blue-400 truncate max-w-[200px]">{matchedSys.reference_title || 'Lançamento Encontrado'}</div>
                            <div className={`mt-0.5 ${sub}`}>Venc: {new Date(matchedSys.due_date).toLocaleDateString('pt-BR')} · {fmt(matchedSys.amount)}</div>
                          </div>
                        ) : (
                          <div className={`italic ${sub}`}>Nenhum lançamento encontrado</div>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {isMatched && <span className="text-xs text-emerald-500 font-medium flex items-center justify-center gap-1"><Check className="w-3 h-3" />Conciliado</span>}
                        {isSuggested && <span className="text-xs text-blue-500 font-medium">Sugestão</span>}
                        {item.match_status === 'unmatched' && <span className="text-xs text-amber-500 font-medium">Pendente</span>}
                        {item.match_status === 'ignored' && <span className="text-xs text-slate-400 font-medium">Ignorado</span>}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {!isMatched && isSuggested && (
                          <button onClick={() => handleReconcile(item)} className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm font-medium transition-colors">
                            Confirmar Conciliação
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History */}
      <div className={`rounded-xl border overflow-hidden ${card}`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-sm flex items-center gap-2"><FileSpreadsheet className="w-4 h-4" />Histórico de Importações OFX</h3>
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
                      <button onClick={() => {
                        setSelectedAccount(r.bank_account?.id?.toString() || '');
                        loadActiveRecon(r.bank_account?.id?.toString() || '');
                        setActiveRecon(r);
                      }} className="px-3 py-1 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg font-medium">Ver</button>
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
