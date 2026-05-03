import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { Sparkles, Loader2, Search, FileText, Zap, ShieldCheck, Download, AlertCircle, ChevronRight, Target, Database, Globe, Activity, Layout, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface ParsedItem {
  description: string;
  quantity: number;
  matched_product_id: number | null;
}

interface Opportunity {
  id: number;
  title: string;
  win_probability: string | null;
  parsed_items: ParsedItem[] | null;
}

export default function AIProposalDraft() {
  const [opportunityId, setOpportunityId] = useState<string>('1');
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [polling, setPolling] = useState(false);

  const loadOpportunity = () => {
    if (!opportunityId) return;
    setLoading(true);
    api.get(`/api/opportunities`)
      .then(res => {
        const ops = res.data.data || res.data || [];
        const target = ops.find((o: any) => String(o.id) === opportunityId);
        if (target) {
          setOpportunity(target);
          toast.success('Dados estratégicos sincronizados.');
        } else {
          toast.error('Oportunidade não localizada no grid.');
        }
      })
      .catch(() => toast.error('Falha na orquestração Core AI'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (polling) {
      interval = setInterval(() => {
        loadOpportunity();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [polling, opportunityId]);

  const handleParseNotice = () => {
    setParsing(true);
    setPolling(true);
    
    api.post(`/api/opportunities/${opportunityId}/parse-notice`)
      .then(() => {
        toast.promise(
          new Promise((resolve) => setTimeout(resolve, 6000)),
          {
            loading: 'Processando Deep Neural Mapping RAG...',
            success: 'Mapeamento concluído com alta precisão!',
            error: 'Erro na matriz de processamento IA',
          }
        ).then(() => {
          setPolling(false);
          setParsing(false);
          loadOpportunity();
        });
      })
      .catch(() => {
        setParsing(false);
        setPolling(false);
      });
  };

  const handleGeneratePDF = () => {
    window.open(`http://localhost:8000/api/opportunities/${opportunityId}/proposal-draft/pdf`, '_blank');
  };

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            GenAI <span className="text-gradient-gold">Strategic Drafting</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <Zap size={14} className="text-primary" />
            Mapeamento neural de editais vs Catálogo de Ativos Platinum.
          </p>
        </div>
        
        <div className="flex items-center gap-5 bg-surface-elevated/20 border border-border-subtle/30 p-5 rounded-2xl shadow-inner-platinum backdrop-blur-md">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors w-4 h-4" />
            <input 
              type="text" 
              placeholder="ID OPORTUNIDADE" 
              value={opportunityId} 
              onChange={e => setOpportunityId(e.target.value)}
              className="bg-background/50 border border-border-medium pl-10 pr-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-text-primary outline-none focus:border-primary/40 w-44 transition-all shadow-inner-platinum"
            />
          </div>
          <button 
            onClick={loadOpportunity}
            disabled={loading}
            className="px-8 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow disabled:opacity-50 flex items-center gap-3"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Activity size={16} />}
            Sincronizar
          </button>
        </div>
      </header>

      {!opportunity ? (
        <div className="platinum-card p-32 flex flex-col items-center justify-center gap-8 border-dashed border-border-medium bg-surface-elevated/10 backdrop-blur-md animate-in zoom-in-95 duration-700">
          <div className="w-24 h-24 rounded-[2.5rem] bg-surface-elevated flex items-center justify-center border border-border-subtle shadow-inner-platinum opacity-40">
             <Database size={40} className="text-text-muted" />
          </div>
          <div className="text-center space-y-3">
            <h3 className="text-sm font-black uppercase tracking-[0.5em] text-text-primary">Aguardando Input Estratégico</h3>
            <p className="text-[10px] text-text-muted uppercase tracking-[0.3em] font-black opacity-60">Insira o ID da oportunidade para iniciar a orquestração IA.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="platinum-card p-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 bg-surface-elevated/10 backdrop-blur-xl border-border-subtle/30 shadow-platinum-glow-sm">
            <div className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner-platinum group hover:scale-110 transition-transform">
                  <FileText size={28} />
                </div>
                <div className="space-y-1">
                   <h2 className="text-xl font-black text-text-primary uppercase tracking-tighter leading-tight max-w-2xl">{opportunity.title}</h2>
                   <div className="text-[10px] text-text-muted font-black uppercase tracking-widest opacity-60">Ref_Opportunity_ID: #{opportunity.id.toString().padStart(4, '0')}</div>
                </div>
              </div>
              <div className="flex items-center gap-8 border-t border-border-subtle/30 pt-6">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-text-muted opacity-60">Win Probability</span>
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-platinum-glow-sm">
                    <Target size={14} className="text-emerald-500" />
                    <span className="text-sm font-black text-emerald-500 tracking-tighter">{opportunity.win_probability || '---'}%</span>
                  </div>
                </div>
                <div className="w-px h-8 bg-border-subtle/30" />
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted opacity-80">
                  <ShieldCheck size={16} className="text-primary" /> Auditado via RAG Core
                </div>
              </div>
            </div>
            
            {!opportunity.parsed_items ? (
              <button 
                onClick={handleParseNotice}
                disabled={parsing}
                className="w-full lg:w-auto px-10 py-5 bg-primary text-white font-black rounded-[2rem] hover:bg-primary-hover transition-all shadow-platinum-glow flex items-center justify-center gap-4 uppercase text-[11px] tracking-[0.4em] disabled:opacity-60"
              >
                {parsing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Extraindo via RAG...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 shadow-platinum-glow-sm" />
                    Mapear Edital via IA
                  </>
                )}
              </button>
            ) : (
              <button 
                onClick={handleGeneratePDF}
                className="w-full lg:w-auto px-10 py-5 bg-emerald-500 text-white font-black rounded-[2rem] hover:bg-emerald-600 transition-all shadow-platinum-glow flex items-center justify-center gap-4 uppercase text-[11px] tracking-[0.4em]"
              >
                <Download className="w-6 h-6" />
                Gerar Proposta Platinum
              </button>
            )}
          </div>

          {opportunity.parsed_items && (
            <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-platinum-glow-sm">
              <div className="px-10 py-8 bg-surface-elevated/20 border-b border-border-subtle/30 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner-platinum">
                     <Zap size={20} />
                  </div>
                  <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.4em]">Deep Mapping Index</h3>
                </div>
                <div className="flex items-center gap-3 px-5 py-2 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase tracking-widest shadow-platinum-glow-sm">
                  <Activity size={12} className="animate-pulse" /> 85% Confidence Level
                </div>
              </div>
              <div className="overflow-x-auto scrollbar-platinum">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-elevated/40 border-b border-border-subtle">
                    <tr>
                      <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">Exigência Licitatória (RAG Extraction)</th>
                      <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60 text-center">Volume Unitário</th>
                      <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">Matching Ativo (Inventory SKU)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/10">
                    {opportunity.parsed_items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-surface-elevated/20 transition-all group duration-500">
                        <td className="px-10 py-10 text-text-secondary leading-relaxed italic text-xs font-bold uppercase tracking-tight opacity-80 group-hover:opacity-100 transition-opacity max-w-xl">{item.description}</td>
                        <td className="px-10 py-10 text-center">
                          <span className="font-black text-text-primary bg-surface-elevated/40 px-5 py-2 rounded-xl border border-border-subtle shadow-inner-platinum text-base tracking-tighter">{item.quantity}</span>
                        </td>
                        <td className="px-10 py-10">
                          {item.matched_product_id ? (
                            <div className="flex items-center gap-4 text-emerald-500 bg-emerald-500/10 px-6 py-3 rounded-2xl border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.2em] shadow-platinum-glow-sm">
                              <Check size={16} />
                              Auto-Match: SKU #{item.matched_product_id.toString().padStart(5, '0')}
                            </div>
                          ) : (
                            <div className="flex items-center gap-4">
                              <div className="relative flex-1 group/select">
                                <Activity size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 opacity-60" />
                                <select className="w-full bg-red-500/10 border border-red-500/20 text-red-500 pl-10 pr-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-red-500/40 cursor-pointer appearance-none shadow-inner-platinum">
                                  <option className="bg-surface">Audit Manual Mandatório</option>
                                  <option className="bg-surface">Vincular Ativo Manualmente...</option>
                                </select>
                                <ChevronRight size={12} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-red-500/40" />
                              </div>
                              <AlertCircle size={20} className="text-red-500 animate-pulse" />
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
        </div>
      )}
    </div>
  );
}
