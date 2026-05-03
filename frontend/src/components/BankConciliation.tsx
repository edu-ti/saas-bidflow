import { useState, useEffect, useRef } from 'react';
import { Upload, Check, X, Link2, Loader2, FileSpreadsheet, Landmark, ArrowRightLeft, Sparkles, Database, Globe, Activity, ShieldCheck, Zap, ChevronRight, Target } from 'lucide-react';
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
    <div className="h-full flex flex-col items-center justify-center gap-6 animate-pulse">
      <div className="w-16 h-16 rounded-[2rem] bg-surface-elevated flex items-center justify-center border border-border-subtle shadow-inner-platinum">
         <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
      <p className="font-black uppercase tracking-[0.5em] text-[10px] text-text-muted">Sincronizando Módulos Bancários Platinum...</p>
    </div>
  );

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Bank <span className="text-gradient-gold">Conciliation</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <Landmark size={14} className="text-primary" />
            Inteligência de processamento OFX e liquidação bancária automatizada.
          </p>
        </div>
        <div className="flex items-center gap-5 bg-surface-elevated/20 border border-border-subtle/30 p-5 rounded-2xl shadow-inner-platinum">
           <div className="flex flex-col items-end gap-1">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-text-muted italic opacity-60">Status de Rede</span>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md">Pipes Ativos</span>
           </div>
           <div className="w-px h-10 bg-border-subtle/30" />
           <Zap className="text-primary w-6 h-6 animate-pulse shadow-platinum-glow-sm" />
        </div>
      </header>

      {/* Upload & Account Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="platinum-card p-8 space-y-6 bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-platinum-glow-sm">
          <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-[0.4em] opacity-80">
            <Database size={14} /> Origem Estratégica
          </div>
          <div className="relative group">
            <Target size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
            <select 
              value={selectedAccount} 
              onChange={e => {
                setSelectedAccount(e.target.value);
                if (e.target.value) loadActiveRecon(e.target.value);
                else setActiveRecon(null);
              }} 
              className="w-full pl-14 pr-12 py-4.5 bg-background/50 border border-border-medium rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-text-primary focus:border-primary/40 outline-none transition-all appearance-none cursor-pointer shadow-inner-platinum"
            >
              <option value="" className="bg-surface">Selecionar Conta Bancária...</option>
              {accounts.map(a => <option key={a.id} value={a.id} className="bg-surface">{a.bank_name.toUpperCase()} · CC {a.number}</option>)}
            </select>
            <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-text-muted opacity-40 pointer-events-none" />
          </div>
          <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl space-y-3 shadow-inner-platinum">
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
               <ShieldCheck size={12} /> Diretriz Platinum
            </p>
            <p className="text-[10px] text-text-muted font-black leading-relaxed uppercase tracking-widest opacity-60">Importe arquivos .OFX para processamento via motor neural de conciliação sugerida BidFlow.</p>
          </div>
        </div>

        <div className="lg:col-span-2"
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <div className={`h-full platinum-card border-2 border-dashed p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-6 group duration-500 ${isDragOver ? 'border-primary bg-primary/5 shadow-platinum-glow' : 'border-border-medium bg-surface-elevated/10 hover:border-primary/40 hover:bg-surface-elevated/20'}`}
            onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept=".ofx,.xml" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
            
            {uploading ? (
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                 <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : (
              <div className="relative">
                <div className="absolute -inset-8 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-20 h-20 rounded-[2rem] bg-surface-elevated flex items-center justify-center border border-border-subtle shadow-inner-platinum group-hover:scale-110 transition-transform duration-500">
                   <Upload className="w-10 h-10 text-text-muted group-hover:text-primary transition-colors" />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <p className="text-base font-black text-text-primary uppercase tracking-tighter group-hover:text-primary transition-colors">Transmissão de Ledger OFX</p>
              <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em] opacity-60 italic">Arraste para o grid ou clique para navegar no repositório</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Reconciliation Workflow */}
      {activeRecon && activeRecon.items && (
        <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-platinum-glow animate-in slide-in-from-bottom-8 duration-700">
          <div className="px-10 py-8 bg-surface-elevated/20 border-b border-border-subtle/30 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner-platinum">
                <ArrowRightLeft size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text-primary uppercase tracking-tighter">Sessão Ativa: {activeRecon.file_name.toUpperCase()}</h3>
                <div className="flex items-center gap-4 text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60">
                  <span className="flex items-center gap-2"><Sparkles size={12} className="text-primary" /> Neural Engine Active</span>
                  <div className="w-1 h-1 rounded-full bg-border-subtle" />
                  <span className="text-text-primary">{activeRecon.items.length} Transações Auditadas</span>
                </div>
              </div>
            </div>
            <button onClick={() => setActiveRecon(null)} className="p-4 bg-surface-elevated/40 border border-border-subtle rounded-2xl text-text-muted hover:text-text-primary transition-all shadow-inner-platinum"><X size={24} /></button>
          </div>

          <div className="overflow-x-auto scrollbar-platinum">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-elevated/40 border-b border-border-subtle">
                  <th colSpan={3} className="px-10 py-5 text-center text-[11px] font-black text-primary uppercase tracking-[0.5em] border-r border-border-subtle/30 bg-primary/5">Extrato Bancário Digital</th>
                  <th colSpan={3} className="px-10 py-5 text-center text-[11px] font-black text-text-muted uppercase tracking-[0.5em] opacity-60">Sistema Neural BidFlow</th>
                </tr>
                <tr className="bg-surface-elevated/20 border-b border-border-subtle/30">
                  <th className="px-10 py-5 text-left text-[9px] font-black text-text-muted uppercase tracking-[0.4em] opacity-60">Cronologia / Descritivo</th>
                  <th className="px-10 py-5 text-right text-[9px] font-black text-text-muted uppercase tracking-[0.4em] opacity-60">Montante</th>
                  <th className="px-10 py-5 text-center text-[9px] font-black text-text-muted uppercase tracking-[0.4em] opacity-60 border-r border-border-subtle/30">Fluxo</th>
                  <th className="px-10 py-5 text-left text-[9px] font-black text-text-muted uppercase tracking-[0.4em] opacity-60">Sugestão de Correlação</th>
                  <th className="px-10 py-5 text-center text-[9px] font-black text-text-muted uppercase tracking-[0.4em] opacity-60">Validação</th>
                  <th className="px-10 py-5 text-center text-[9px] font-black text-text-muted uppercase tracking-[0.4em] opacity-60">Controle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/20">
                {activeRecon.items.map(item => {
                  const isMatched = item.match_status === 'matched';
                  const isSuggested = item.match_status === 'suggested_match';
                  const matchedSys = item.payable || item.receivable;

                  return (
                    <tr key={item.id} className={`group hover:bg-surface-elevated/30 transition-all duration-500 border-b border-border-subtle/10 ${isMatched ? 'bg-emerald-500/[0.03]' : ''}`}>
                      {/* Lado Esquerdo (Banco) */}
                      <td className="px-10 py-8">
                        <div className="font-black text-[11px] text-text-primary uppercase tracking-widest">{item.transaction_date}</div>
                        <div className="mt-2 text-[10px] text-text-muted font-bold truncate max-w-[280px] uppercase tracking-tighter opacity-60 group-hover:opacity-100 group-hover:text-text-primary transition-all" title={item.description || '-'}>{item.description || '-'}</div>
                      </td>
                      <td className={`px-10 py-8 text-right font-black text-base tracking-tighter ${Number(item.amount) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{fmt(item.amount)}</td>
                      <td className="px-10 py-8 text-center border-r border-border-subtle/30">
                        <span className={`text-[10px] font-black px-4 py-1.5 rounded-xl border backdrop-blur-md shadow-platinum-glow-sm ${item.type === 'credit' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' : 'text-red-500 border-red-500/20 bg-red-500/10'}`}>
                          {item.type === 'credit' ? 'CREDIT' : 'DEBIT'}
                        </span>
                      </td>
                      
                      {/* Lado Direito (Sistema) */}
                      <td className="px-10 py-8">
                        {matchedSys ? (
                          <div className="space-y-2">
                            <div className="font-black text-xs text-primary uppercase tracking-tight truncate max-w-[280px] group-hover:scale-105 transition-transform origin-left duration-500">{matchedSys.reference_title || 'Lançamento Estruturado'}</div>
                            <div className="text-[10px] text-text-muted font-black uppercase tracking-widest opacity-60 flex items-center gap-3">
                               <div className="w-1 h-1 rounded-full bg-primary/40" />
                               Venc. {new Date(matchedSys.due_date).toLocaleDateString('pt-BR')} • {fmt(matchedSys.amount)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10px] text-text-muted/40 italic font-black uppercase tracking-widest flex items-center gap-3">
                             <Target size={12} className="opacity-20" /> Nenhuma correlação auditada
                          </div>
                        )}
                      </td>
                      <td className="px-10 py-8 text-center">
                        {isMatched && <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full flex items-center justify-center gap-3 uppercase tracking-widest shadow-platinum-glow-sm"><Check size={14} className="animate-pulse" /> Consolidado</span>}
                        {isSuggested && <span className="text-[10px] font-black text-primary bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-platinum-glow-sm flex items-center justify-center gap-2"><Sparkles size={12} /> Sugestão Neural</span>}
                        {item.match_status === 'unmatched' && <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-inner-platinum">Pendente</span>}
                        {item.match_status === 'ignored' && <span className="text-[10px] font-black text-text-muted bg-surface-elevated/40 border border-border-subtle px-4 py-1.5 rounded-full uppercase tracking-widest opacity-40">Ignorado</span>}
                      </td>
                      <td className="px-10 py-8 text-center">
                        {!isMatched && isSuggested && (
                          <button onClick={() => handleReconcile(item)} className="px-8 py-3 bg-primary text-white text-[11px] font-black rounded-2xl shadow-platinum-glow hover:bg-primary-hover transition-all duration-500 uppercase tracking-[0.2em] flex items-center gap-3 mx-auto group/btn">
                            <Check size={16} className="group-hover/btn:scale-125 transition-transform" /> Confirmar
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
      <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-platinum-glow-sm">
        <div className="px-10 py-8 bg-surface-elevated/20 border-b border-border-subtle/30 flex items-center justify-between">
           <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-surface-elevated/40 border border-border-subtle flex items-center justify-center text-primary shadow-inner-platinum">
                 <FileSpreadsheet size={24} />
              </div>
              <div className="space-y-1">
                 <h3 className="text-sm font-black text-text-primary uppercase tracking-[0.3em]">Repositório de Transmissões OFX</h3>
                 <p className="text-[10px] text-text-muted font-black uppercase tracking-widest opacity-60 italic">Grid de Auditoria Global de Importações</p>
              </div>
           </div>
           <div className="flex items-center gap-3 bg-emerald-500/5 px-4 py-2 rounded-xl border border-emerald-500/10">
              <Globe size={14} className="text-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Sincronização Ledger Ativa</span>
           </div>
        </div>
        
        {reconciliations.length === 0 ? (
          <div className="py-40 text-center space-y-6 opacity-30">
            <div className="w-24 h-24 rounded-[2.5rem] bg-surface-elevated mx-auto flex items-center justify-center border border-border-subtle shadow-inner-platinum">
               <Landmark size={40} className="text-text-muted" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-text-muted">Nenhum histórico disponível no repositório</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-platinum">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-elevated/40 border-b border-border-subtle">
                  <th className="px-10 py-6 text-left text-[10px] font-black text-text-muted uppercase tracking-[0.4em] opacity-60">Arquivo Ledger</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-text-muted uppercase tracking-[0.4em] opacity-60">Unidade Bancária</th>
                  <th className="px-10 py-6 text-center text-[10px] font-black text-text-muted uppercase tracking-[0.4em] opacity-60">Transações</th>
                  <th className="px-10 py-6 text-center text-[10px] font-black text-text-muted uppercase tracking-[0.4em] opacity-60">Eficiência de Match</th>
                  <th className="px-10 py-6 text-center text-[10px] font-black text-text-muted uppercase tracking-[0.4em] opacity-60">Status Neural</th>
                  <th className="px-10 py-6 text-right text-[10px] font-black text-text-muted uppercase tracking-[0.4em] opacity-60">Operações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/20">
                {reconciliations.map(r => (
                  <tr key={r.id} className="hover:bg-surface-elevated/50 transition-all group border-b border-border-subtle/10 duration-500">
                    <td className="px-10 py-10 font-mono text-[11px] text-text-secondary group-hover:text-primary transition-colors uppercase tracking-widest">{r.file_name}</td>
                    <td className="px-10 py-10">
                      <div className="text-xs font-black text-text-primary uppercase tracking-tighter group-hover:text-primary transition-colors">{r.bank_account?.bank_name.toUpperCase() ?? 'S/A'}</div>
                      <div className="text-[9px] text-text-muted font-black uppercase tracking-widest mt-1 opacity-40">Conta Digital Central</div>
                    </td>
                    <td className="px-10 py-10 text-center font-black text-text-primary text-base tracking-tighter">{r.total_transactions}</td>
                    <td className="px-10 py-10 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="font-black text-emerald-500 text-sm tracking-tighter">{r.matched_transactions} ({Math.round((r.matched_transactions / r.total_transactions) * 100)}%)</span>
                        <div className="w-24 h-1.5 bg-surface-elevated/60 rounded-full overflow-hidden border border-border-subtle/20 shadow-inner-platinum">
                          <div className="h-full bg-emerald-500 shadow-platinum-glow-sm transition-all duration-1000" style={{ width: `${(r.matched_transactions / r.total_transactions) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-10 text-center">
                      <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md shadow-platinum-glow-sm ${r.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current mr-2 inline-block animate-pulse" />
                        {r.status === 'completed' ? 'CONCLUÍDA' : r.status === 'reconciling' ? 'PROCESSANDO' : 'IMPORTADA'}
                      </span>
                    </td>
                    <td className="px-10 py-10 text-right">
                      <button onClick={() => {
                        setSelectedAccount(r.bank_account?.id?.toString() || '');
                        loadActiveRecon(r.bank_account?.id?.toString() || '');
                        setActiveRecon(r);
                      }} className="px-8 py-3 bg-surface-elevated/40 border border-border-subtle rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] text-text-muted hover:text-white hover:bg-primary hover:border-primary/20 transition-all shadow-inner-platinum">Explorar Ledger</button>
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
