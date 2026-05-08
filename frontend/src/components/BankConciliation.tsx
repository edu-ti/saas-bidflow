import { useState, useEffect, useRef } from 'react';
import { Upload, Check, X, Link2, Loader2, FileSpreadsheet, Landmark, ArrowRightLeft, Sparkles, Database, Globe, Activity, ShieldCheck, Zap, ChevronRight, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { Select } from './ui/Select';

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
    }).catch(() => toast.error('Erro ao sincronizar contas bancárias'))
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (file: File) => {
    if (!selectedAccount) { toast.error('Defina a conta bancária de destino'); return; }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('bank_account_id', selectedAccount);
      const r = await api.post('/api/financial/ofx-upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(r.data.message || 'Extrato OFX processado com inteligência!');
      
      const r2 = await api.get(`/api/financial/reconciliation/${selectedAccount}`);
      setActiveRecon({ ...r.data.data, items: r2.data.data || [] });
      
      const updated = await api.get('/api/financial/reconciliations');
      setReconciliations(updated.data.data ?? []);
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Falha no processamento do arquivo'); }
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
      toast.success('Conciliação consolidada!');
      if (activeRecon && selectedAccount) {
        await loadActiveRecon(selectedAccount);
        const r = await api.get('/api/financial/reconciliations');
        setReconciliations(r.data.data ?? []);
      }
    } catch { toast.error('Erro ao consolidar lançamento'); }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-4 animate-pulse pt-20">
      <Loader2 className="animate-spin text-primary w-8 h-8" />
      <p className="font-medium text-sm text-text-muted">Sincronizando Módulos Bancários...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Conciliação Bancária
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Inteligência de processamento OFX e liquidação automatizada.
          </p>
        </div>
        <div className="flex items-center gap-4 card px-6 py-4">
           <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-medium text-text-muted">Status de Rede</span>
              <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-md">Pipes Ativos</span>
           </div>
           <div className="w-px h-10 bg-border mx-1" />
           <div className="p-2 bg-primary/10 rounded-lg text-primary">
             <Zap className="w-5 h-5 animate-pulse" />
           </div>
        </div>
      </header>

      {/* Upload & Account Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 space-y-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Database size={16} className="text-primary" /> Origem Estratégica
          </div>
          <div className="relative group z-20">
            <Target size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none z-10" />
            <Select 
              value={selectedAccount} 
              onChange={(value) => {
                setSelectedAccount(value);
                if (value) loadActiveRecon(value);
                else setActiveRecon(null);
              }} 
              options={[
                { value: '', label: 'Selecionar Conta Bancária...' },
                ...accounts.map(a => ({
                  value: a.id.toString(),
                  label: `${a.bank_name.toUpperCase()} · CC ${a.number}`
                }))
              ]}
              className="pl-8"
            />
          </div>
          <div className="p-4 bg-bg-tertiary border border-border rounded-lg space-y-2">
            <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
               <ShieldCheck size={14} className="text-primary" /> Diretriz do Sistema
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">Importe arquivos .OFX para processamento via motor de conciliação sugerida BidFlow.</p>
          </div>
        </div>

        <div className="lg:col-span-2"
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <div className={`h-full border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 ${isDragOver ? 'border-primary bg-primary/5' : 'border-border bg-bg-secondary hover:border-text-muted hover:bg-bg-tertiary'}`}
            onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept=".ofx,.xml" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
            
            {uploading ? (
              <div className="p-4 rounded-full bg-bg-tertiary">
                 <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="p-4 rounded-full bg-bg-tertiary text-text-muted group-hover:text-primary transition-colors">
                 <Upload className="w-8 h-8" />
              </div>
            )}
            
            <div>
              <p className="text-sm font-semibold text-text-primary">Transmissão de Ledger OFX</p>
              <p className="text-xs text-text-muted mt-1">Arraste para o grid ou clique para navegar no repositório</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Reconciliation Workflow */}
      {activeRecon && activeRecon.items && (
        <div className="card overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="px-6 py-4 bg-bg-tertiary border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-bg-secondary border border-border text-text-primary">
                <ArrowRightLeft size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">Sessão Ativa: {activeRecon.file_name}</h3>
                <div className="flex items-center gap-2 text-xs font-medium text-text-muted mt-1">
                  <span className="flex items-center gap-1.5"><Sparkles size={12} className="text-primary" /> Sugestões Ativas</span>
                  <div className="w-1 h-1 rounded-full bg-border" />
                  <span>{activeRecon.items.length} Transações</span>
                </div>
              </div>
            </div>
            <button onClick={() => setActiveRecon(null)} className="p-2 bg-bg-secondary border border-border rounded-lg text-text-muted hover:text-text-primary transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-bg-tertiary border-b border-border text-text-secondary">
                  <th className="px-6 py-3 font-medium">Data / Descrição</th>
                  <th className="px-6 py-3 font-medium text-right">Valor</th>
                  <th className="px-6 py-3 font-medium text-center">Tipo</th>
                  <th className="px-6 py-3 font-medium">Match Sugerido</th>
                  <th className="px-6 py-3 font-medium text-center">Status</th>
                  <th className="px-6 py-3 font-medium text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeRecon.items.map(item => {
                  const isMatched = item.match_status === 'matched';
                  const isSuggested = item.match_status === 'suggested_match';
                  const matchedSys = item.payable || item.receivable;

                  return (
                    <tr key={item.id} className={`group hover:bg-bg-tertiary transition-colors ${isMatched ? 'bg-success/5' : ''}`}>
                      {/* Lado Esquerdo (Banco) */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-text-primary">{item.transaction_date}</div>
                        <div className="text-xs text-text-muted mt-0.5 truncate max-w-[200px]" title={item.description || '-'}>{item.description || '-'}</div>
                      </td>
                      <td className={`px-6 py-4 text-right font-semibold ${Number(item.amount) >= 0 ? 'text-success' : 'text-danger'}`}>{fmt(item.amount)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-md border ${item.type === 'credit' ? 'text-success border-success/20 bg-success/10' : 'text-danger border-danger/20 bg-danger/10'}`}>
                          {item.type === 'credit' ? 'C' : 'D'}
                        </span>
                      </td>
                      
                      {/* Lado Direito (Sistema) */}
                      <td className="px-6 py-4">
                        {matchedSys ? (
                          <div>
                            <div className="font-semibold text-sm text-text-primary truncate max-w-[200px]">{matchedSys.reference_title || 'Lançamento Estruturado'}</div>
                            <div className="text-xs text-text-muted mt-0.5">
                               Venc. {new Date(matchedSys.due_date).toLocaleDateString('pt-BR')} • {fmt(matchedSys.amount)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-text-muted italic flex items-center gap-2">
                             Sem correlação
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isMatched && <span className="text-xs font-medium text-success bg-success/10 border border-success/20 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5"><Check size={12} /> Consolidado</span>}
                        {isSuggested && <span className="text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5"><Sparkles size={12} /> Sugestão</span>}
                        {item.match_status === 'unmatched' && <span className="text-xs font-medium text-warning bg-warning/10 border border-warning/20 px-2.5 py-1 rounded-md">Pendente</span>}
                        {item.match_status === 'ignored' && <span className="text-xs font-medium text-text-muted bg-bg-tertiary border border-border px-2.5 py-1 rounded-md">Ignorado</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {!isMatched && isSuggested && (
                          <button onClick={() => handleReconcile(item)} className="btn btn-primary py-1.5 px-3 text-xs inline-flex items-center gap-1.5">
                            <Check size={14} /> Confirmar
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

      {/* History Ledger */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 bg-bg-tertiary border-b border-border flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-bg-secondary border border-border text-text-primary">
                 <FileSpreadsheet size={20} />
              </div>
              <div>
                 <h3 className="text-base font-semibold text-text-primary">Histórico de Importações</h3>
                 <p className="text-xs text-text-muted mt-0.5">Arquivos OFX processados</p>
              </div>
           </div>
        </div>
        
        {reconciliations.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-bg-tertiary border border-border flex items-center justify-center mb-4">
               <Landmark size={24} className="text-text-muted" />
            </div>
            <p className="text-sm font-medium text-text-muted">Nenhum histórico disponível</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-bg-tertiary border-b border-border text-text-secondary">
                <tr>
                  <th className="px-6 py-3 font-medium">Arquivo</th>
                  <th className="px-6 py-3 font-medium">Conta Bancária</th>
                  <th className="px-6 py-3 font-medium text-center">Transações</th>
                  <th className="px-6 py-3 font-medium text-center">Eficiência</th>
                  <th className="px-6 py-3 font-medium text-center">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reconciliations.map(r => (
                  <tr key={r.id} className="hover:bg-bg-tertiary transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-text-secondary group-hover:text-primary transition-colors">{r.file_name}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary">{r.bank_account?.bank_name ?? 'S/A'}</div>
                      <div className="text-xs text-text-muted mt-0.5">CC {r.bank_account?.number}</div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-text-primary">{r.total_transactions}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="font-medium text-success text-xs">{r.matched_transactions} ({Math.round((r.matched_transactions / r.total_transactions) * 100)}%)</span>
                        <div className="w-20 h-1.5 bg-bg-secondary rounded-full overflow-hidden border border-border">
                          <div className="h-full bg-success transition-all duration-1000" style={{ width: `${(r.matched_transactions / r.total_transactions) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1.5 border ${r.status === 'completed' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        {r.status === 'completed' ? 'Concluída' : r.status === 'reconciling' ? 'Processando' : 'Importada'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => {
                        setSelectedAccount(r.bank_account?.id?.toString() || '');
                        loadActiveRecon(r.bank_account?.id?.toString() || '');
                        setActiveRecon(r);
                      }} className="btn btn-outline py-1.5 px-3 text-xs">Visualizar</button>
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
