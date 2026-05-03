import { useState, useEffect, useRef } from 'react';
import { Upload, Check, X, Link2, Loader2, FileSpreadsheet, Landmark, ArrowRightLeft, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';

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
    <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-40">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sincronizando Módulos Bancários...</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Upload & Account Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="platinum-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
            <Landmark size={12} /> Origem dos Dados
          </div>
          <select 
            value={selectedAccount} 
            onChange={e => {
              setSelectedAccount(e.target.value);
              if (e.target.value) loadActiveRecon(e.target.value);
              else setActiveRecon(null);
            }} 
            className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all appearance-none"
          >
            <option value="" className="bg-surface">Selecionar Conta Bancária...</option>
            {accounts.map(a => <option key={a.id} value={a.id} className="bg-surface">{a.bank_name} · Ag {a.agency} · CC {a.number}</option>)}
          </select>
          <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Dica Platinum</p>
            <p className="text-[10px] text-text-muted font-bold leading-relaxed">Importe arquivos .OFX para que nossa inteligência sugira conciliações automáticas com base em valores e datas.</p>
          </div>
        </div>

        <div className="lg:col-span-2"
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <div className={`h-full platinum-card border-2 border-dashed p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 ${isDragOver ? 'border-primary bg-primary/5 shadow-platinum-glow' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.01]'}`}
            onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept=".ofx,.xml" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
            
            {uploading ? (
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            ) : (
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Upload className="w-10 h-10 text-text-muted relative z-10" />
              </div>
            )}
            
            <div className="space-y-1">
              <p className="text-sm font-black text-white uppercase tracking-tighter">Arraste o arquivo OFX</p>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Ou clique para navegar no repositório local</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Reconciliation Workflow */}
      {activeRecon && activeRecon.items && (
        <div className="platinum-card overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
          <div className="px-8 py-6 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <ArrowRightLeft size={20} />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-white uppercase tracking-tighter">Sessão Ativa: {activeRecon.file_name}</h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Sparkles size={10} className="text-primary" /> Inteligência Operacional</span>
                  <span className="text-white/10">•</span>
                  <span>{activeRecon.items.length} Transações Detectadas</span>
                </div>
              </div>
            </div>
            <button onClick={() => setActiveRecon(null)} className="p-2.5 rounded-xl text-text-muted hover:text-white hover:bg-white/5 border border-white/5 transition-all"><X size={18} /></button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/[0.01]">
                  <th colSpan={3} className="px-8 py-4 text-center text-[10px] font-black text-text-muted uppercase tracking-[0.2em] border-r border-white/5">Extrato Bancário Digital</th>
                  <th colSpan={3} className="px-8 py-4 text-center text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Ecossistema BidFlow</th>
                </tr>
                <tr className="bg-white/[0.02] border-y border-white/5">
                  <th className="px-8 py-4 text-left text-[9px] font-black text-text-muted uppercase tracking-widest">Temporalidade / Descritivo</th>
                  <th className="px-8 py-4 text-right text-[9px] font-black text-text-muted uppercase tracking-widest">Montante</th>
                  <th className="px-8 py-4 text-center text-[9px] font-black text-text-muted uppercase tracking-widest border-r border-white/5">Fluxo</th>
                  <th className="px-8 py-4 text-left text-[9px] font-black text-text-muted uppercase tracking-widest">Correlação Sugerida</th>
                  <th className="px-8 py-4 text-center text-[9px] font-black text-text-muted uppercase tracking-widest">Validação</th>
                  <th className="px-8 py-4 text-center text-[9px] font-black text-text-muted uppercase tracking-widest">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activeRecon.items.map(item => {
                  const isMatched = item.match_status === 'matched';
                  const isSuggested = item.match_status === 'suggested_match';
                  const matchedSys = item.payable || item.receivable;

                  return (
                    <tr key={item.id} className={`group hover:bg-white/[0.01] transition-colors ${isMatched ? 'bg-emerald-500/[0.02]' : ''}`}>
                      {/* Lado Esquerdo (Banco) */}
                      <td className="px-8 py-5">
                        <div className="font-bold text-xs text-white uppercase tracking-tighter">{item.transaction_date}</div>
                        <div className="mt-1 text-[10px] text-text-muted font-bold truncate max-w-[220px] uppercase tracking-widest group-hover:text-white transition-colors" title={item.description || '-'}>{item.description || '-'}</div>
                      </td>
                      <td className={`px-8 py-5 text-right font-black text-sm tracking-tight ${Number(item.amount) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(item.amount)}</td>
                      <td className="px-8 py-5 text-center border-r border-white/5">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${item.type === 'credit' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' : 'text-red-400 border-red-400/20 bg-red-400/5'}`}>
                          {item.type === 'credit' ? 'CREDIT' : 'DEBIT'}
                        </span>
                      </td>
                      
                      {/* Lado Direito (Sistema) */}
                      <td className="px-8 py-5">
                        {matchedSys ? (
                          <div className="space-y-1">
                            <div className="font-bold text-xs text-primary uppercase tracking-tighter truncate max-w-[220px]">{matchedSys.reference_title || 'Lançamento Estruturado'}</div>
                            <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Venc. {new Date(matchedSys.due_date).toLocaleDateString('pt-BR')} • {fmt(matchedSys.amount)}</div>
                          </div>
                        ) : (
                          <div className="text-[10px] text-text-muted/40 italic font-bold uppercase tracking-widest">Nenhuma correlação detectada</div>
                        )}
                      </td>
                      <td className="px-8 py-5 text-center">
                        {isMatched && <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded-full flex items-center justify-center gap-1 uppercase tracking-widest"><Check size={10} /> Consolidado</span>}
                        {isSuggested && <span className="text-[9px] font-black text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full uppercase tracking-widest">Sugestão IA</span>}
                        {item.match_status === 'unmatched' && <span className="text-[9px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full uppercase tracking-widest">Pendente</span>}
                        {item.match_status === 'ignored' && <span className="text-[9px] font-black text-text-muted bg-white/5 border border-white/10 px-3 py-1 rounded-full uppercase tracking-widest">Ignorado</span>}
                      </td>
                      <td className="px-8 py-5 text-center">
                        {!isMatched && isSuggested && (
                          <button onClick={() => handleReconcile(item)} className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-background text-[10px] font-black rounded-xl shadow-platinum-glow transition-all uppercase tracking-widest flex items-center gap-2 mx-auto">
                            <Check size={12} /> Confirmar
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
      <div className="platinum-card overflow-hidden">
        <div className="px-8 py-6 bg-white/[0.02] border-b border-white/5 flex items-center gap-3">
          <FileSpreadsheet className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-black text-white uppercase tracking-tighter">Repositório de Importações OFX</h3>
        </div>
        
        {reconciliations.length === 0 ? (
          <div className="py-24 text-center space-y-4 opacity-30">
            <Landmark className="w-16 h-16 mx-auto text-text-muted" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Nenhum histórico disponível</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-8 py-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Arquivo Ledger</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Unidade Bancária</th>
                  <th className="px-8 py-4 text-center text-[10px] font-black text-text-muted uppercase tracking-widest">Transações</th>
                  <th className="px-8 py-4 text-center text-[10px] font-black text-text-muted uppercase tracking-widest">Eficiência</th>
                  <th className="px-8 py-4 text-center text-[10px] font-black text-text-muted uppercase tracking-widest">Status de Ciclo</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black text-text-muted uppercase tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reconciliations.map(r => (
                  <tr key={r.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-8 py-5 font-mono text-xs text-white/80 group-hover:text-primary transition-colors">{r.file_name}</td>
                    <td className="px-8 py-5">
                      <div className="text-xs font-bold text-white uppercase tracking-tighter">{r.bank_account?.bank_name ?? 'S/A'}</div>
                    </td>
                    <td className="px-8 py-5 text-center font-black text-white text-sm">{r.total_transactions}</td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-black text-emerald-400 text-sm">{r.matched_transactions}</span>
                        <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400" style={{ width: `${(r.matched_transactions / r.total_transactions) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${r.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                        {r.status === 'completed' ? 'Concluída' : r.status === 'reconciling' ? 'Processando' : 'Importada'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => {
                        setSelectedAccount(r.bank_account?.id?.toString() || '');
                        loadActiveRecon(r.bank_account?.id?.toString() || '');
                        setActiveRecon(r);
                      }} className="px-6 py-2 bg-white/5 hover:bg-primary hover:text-background border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Explorar</button>
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
