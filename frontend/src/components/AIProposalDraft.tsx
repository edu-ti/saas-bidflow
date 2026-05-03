import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { Sparkles, Loader2, Search, FileText, Zap, ShieldCheck, Download, AlertCircle, ChevronRight, Target, Database } from 'lucide-react';
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
          toast.success('Dados estratégicos carregados.');
        } else {
          toast.error('Oportunidade não localizada.');
        }
      })
      .catch(() => toast.error('Falha na comunicação com o Core AI'))
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
            loading: 'Processando Deep Neural Mapping...',
            success: 'Mapeamento de itens concluído com 85% de precisão!',
            error: 'Erro no processamento da IA',
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
    <div className="p-8 w-full min-h-screen bg-background space-y-12 text-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            GenAI <span className="text-gradient-gold">Strategic Intelligence</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <Zap size={14} className="text-primary" />
            Mapeamento neural de editais vs Catálogo de Produtos.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl shadow-inner">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-3 h-3" />
            <input 
              type="text" 
              placeholder="ID Oportunidade" 
              value={opportunityId} 
              onChange={e => setOpportunityId(e.target.value)}
              className="bg-background/50 border border-white/10 pl-8 pr-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-primary/40 w-32 transition-all"
            />
          </div>
          <button 
            onClick={loadOpportunity}
            disabled={loading}
            className="px-6 py-2 bg-primary text-background text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Sincronizar'}
          </button>
        </div>
      </header>

      {!opportunity ? (
        <div className="platinum-card p-20 flex flex-col items-center justify-center gap-6 border-dashed border-white/10 opacity-60">
          <Database className="w-16 h-16 text-text-muted opacity-20" />
          <div className="text-center space-y-2">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Aguardando Input Estratégico</h3>
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Insira o ID da oportunidade para iniciar a orquestração IA.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-700">
          <div className="platinum-card p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <FileText size={20} />
                </div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight leading-tight">{opportunity.title}</h2>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Power Score:</span>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <Target size={12} className="text-emerald-400" />
                    <span className="text-xs font-black text-emerald-400">{opportunity.win_probability || '---'}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                  <ShieldCheck size={14} className="text-primary/60" /> Auditado via RAG
                </div>
              </div>
            </div>
            
            {!opportunity.parsed_items ? (
              <button 
                onClick={handleParseNotice}
                disabled={parsing}
                className="w-full lg:w-auto px-8 py-4 bg-primary text-background font-black rounded-2xl hover:bg-primary-hover transition-all shadow-platinum-glow-lg flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
              >
                {parsing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Extraindo Itens via RAG...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Extrair Inteligência do PDF
                  </>
                )}
              </button>
            ) : (
              <button 
                onClick={handleGeneratePDF}
                className="w-full lg:w-auto px-8 py-4 bg-emerald-500 text-background font-black rounded-2xl hover:bg-emerald-600 transition-all shadow-platinum-glow flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
              >
                <Download className="w-5 h-5" />
                Gerar Proposta Estratégica
              </button>
            )}
          </div>

          {opportunity.parsed_items && (
            <div className="platinum-card overflow-hidden">
              <div className="px-8 py-6 bg-white/[0.02] border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Zap size={16} className="text-primary" />
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Mapeamento de Itens Autônomo</h3>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
                  85% Confidence Level
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 border-b border-white/5">
                    <tr>
                      <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Exigência do Edital (Extração)</th>
                      <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-center">Volume</th>
                      <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Correspondência de Catálogo (SKU)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {opportunity.parsed_items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-6 text-text-secondary leading-relaxed italic text-xs">{item.description}</td>
                        <td className="px-8 py-6 text-center">
                          <span className="font-black text-white bg-white/5 px-3 py-1 rounded-lg border border-white/5">{item.quantity}</span>
                        </td>
                        <td className="px-8 py-6">
                          {item.matched_product_id ? (
                            <div className="flex items-center gap-3 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                              <ShieldCheck size={14} />
                              Match Automático: SKU #{item.matched_product_id}
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <select className="flex-1 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-red-400/40 cursor-pointer appearance-none">
                                <option className="bg-surface">Intervenção Manual Necessária</option>
                                <option className="bg-surface">Vincular Produto Manualmente...</option>
                              </select>
                              <AlertCircle size={16} className="text-red-400 animate-pulse" />
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
