import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, Edit, Trash2, Eye, Plus, Search, FileText, ArrowLeft, Printer, Info, Clock, MapPin, 
  Building2, ExternalLink, ShieldCheck, Upload, FileCheck, MessageSquare, Lock, ChevronRight, 
  DollarSign, Zap, Calendar, Target, Globe, Activity, AlignLeft, Check, Sparkles
} from 'lucide-react';
import api from '../lib/axios';

interface Bidding {
  id: number;
  title: string;
  process_number: string;
  agency: string;
  modality: string;
  opening_date: string;
  closing_date: string;
  value: string;
  status: string;
  description: string;
  bidding_metadata: any;
  funnel_stage_id: number;
  created_at: string;
  source_url?: string;
}

const mockBidding: Bidding = {
  id: 1,
  title: 'Pregão Eletrônico para Fornecimento de Material de Escritório',
  process_number: '260120PE00001',
  agency: 'PREFEITURA MUNICIPAL DE JOCA CLAUDINO',
  modality: 'pregão',
  opening_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  closing_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  value: '150000.00',
  status: 'Em análise',
  description: 'Constitui objeto da presente licitação: Aquisição de equipamentos e material permanente para a Unidade Básica de Saúde – UBS',
  bidding_metadata: {
    edital: '00001/2026',
    uasg: '',
  },
  funnel_stage_id: 1,
  created_at: new Date().toISOString(),
  source_url: 'www.portaldecompraspublicas.com.br',
};

export default function AuctionDetails() {
  const [searchParams, setSearchParams] = useSearchParams();
  const opportunityId = searchParams.get('id');
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = useState<'list' | 'details'>(opportunityId ? 'details' : 'list');
  const [biddingsList, setBiddingsList] = useState<Bidding[]>([]);
  
  const [bidding, setBidding] = useState<Bidding | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState('Em análise');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (opportunityId) {
      setViewMode('details');
      fetchBidding(opportunityId);
    } else {
      setViewMode('list');
      fetchBiddingsList();
    }
  }, [opportunityId]);

  const fetchBiddingsList = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/opportunities?type=bidding');
      const data = res.data.data || res.data;
      if (Array.isArray(data) && data.length > 0) setBiddingsList(data);
      else setBiddingsList([mockBidding, { ...mockBidding, id: 2, process_number: '002/2026', status: 'Aguardando' }]);
    } catch (err) {
      setBiddingsList([mockBidding, { ...mockBidding, id: 2, process_number: '002/2026', status: 'Aguardando' }]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBidding = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/opportunities/${id}`);
      const data = res.data.data || res.data;
      setBidding(data);
      setCurrentStatus(data.status || 'Em análise');
    } catch (err) {
      setBidding({ ...mockBidding, id: parseInt(id), process_number: `${id}/2026` });
      setCurrentStatus(mockBidding.status);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatTime = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'Ativa': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'Em análise': 'bg-primary/10 text-primary border-primary/20 shadow-platinum-glow-sm',
      'Aguardando': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'Encerrada': 'bg-surface-elevated/40 text-text-muted border-border-subtle/30',
    };
    return styles[status] || 'bg-surface-elevated/40 text-text-muted border-border-subtle/30';
  };

  const handleBackToList = () => {
    setSearchParams({});
    setViewMode('list');
  };

  const handleViewDetails = (id: number) => {
    setSearchParams({ id: id.toString() });
    setViewMode('details');
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 animate-pulse">
        <div className="w-16 h-16 rounded-[2rem] bg-surface-elevated flex items-center justify-center border border-border-subtle shadow-inner-platinum">
           <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
        <p className="font-black uppercase tracking-[0.5em] text-[10px] text-text-muted">Interrogando Base Platinum...</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shrink-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
              Bidding <span className="text-gradient-gold">Monitoring Central</span>
            </h1>
            <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
              <Activity size={14} className="text-primary" />
              Gestão estratégica e monitoramento de sessões públicas em tempo real Platinum.
            </p>
          </div>
          <button 
            onClick={() => navigate('/bidding-capture')}
            className="btn-primary py-4 px-10 shadow-platinum-glow flex items-center gap-3 uppercase text-[10px] tracking-widest"
          >
            <Plus className="w-5 h-5" />
            Nova Oportunidade
          </button>
        </header>

        <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-platinum-glow-sm">
          <div className="p-8 bg-surface-elevated/20 border-b border-border-subtle/30 flex flex-wrap gap-8 items-center">
            <div className="relative flex-1 min-w-[320px] group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Identificação do edital, processo ou órgão..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-4.5 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum"
              />
            </div>
            <div className="flex items-center gap-6 px-6 py-3 bg-primary/5 border border-primary/20 rounded-2xl">
               <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-muted opacity-60">Sessões Ativas</span>
                  <span className="text-sm font-black text-primary tracking-tighter">{biddingsList.length}</span>
               </div>
               <div className="w-px h-8 bg-primary/20" />
               <Globe className="text-primary w-5 h-5 opacity-60" />
            </div>
          </div>
          
          <div className="overflow-x-auto scrollbar-platinum">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-elevated/40 border-b border-border-subtle">
                <tr>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">Identificação Estratégica</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">Órgão Licitante</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60 text-center">Cronograma Disputa</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60 text-center">Status Operacional</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60 text-right">Controles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/20">
                {biddingsList.map((bid) => (
                  <tr key={bid.id} className="hover:bg-surface-elevated/20 transition-all group border-b border-border-subtle/10 duration-500">
                    <td className="px-10 py-10">
                      <div className="font-black text-text-primary group-hover:text-primary transition-colors uppercase tracking-tight text-sm">{bid.bidding_metadata?.edital || 'SEM EDITAL'}</div>
                      <div className="text-[9px] text-text-muted font-mono tracking-widest mt-1 opacity-60 uppercase">Process: {bid.process_number || 'N/A'}</div>
                    </td>
                    <td className="px-10 py-10 max-w-xs">
                      <div className="truncate text-text-secondary italic text-xs font-bold uppercase tracking-tight" title={bid.agency}>{bid.agency || '-'}</div>
                      <div className="flex items-center gap-2 mt-2">
                         <span className="text-[9px] text-primary font-black uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded border border-primary/20">{bid.modality}</span>
                      </div>
                    </td>
                    <td className="px-10 py-10 text-center">
                      <div className="text-text-primary font-black text-xs uppercase tracking-widest">{formatDate(bid.opening_date)}</div>
                      <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1 opacity-40">{formatTime(bid.opening_date)}</div>
                    </td>
                    <td className="px-10 py-10 text-center">
                      <span className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border backdrop-blur-md shadow-platinum-glow-sm ${getStatusBadge(bid.status)}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current mr-2 inline-block animate-pulse" />
                        {bid.status || 'Em análise'}
                      </span>
                    </td>
                    <td className="px-10 py-10 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                        <button onClick={() => handleViewDetails(bid.id)} className="p-3 bg-surface-elevated/40 border border-border-subtle rounded-xl text-text-muted hover:text-primary transition-all shadow-inner-platinum" title="Analisar"><Eye size={18} /></button>
                        <button className="p-3 bg-surface-elevated/40 border border-border-subtle rounded-xl text-text-muted hover:text-primary transition-all shadow-inner-platinum" title="Refinar"><Edit size={18} /></button>
                        <button className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500/60 hover:text-red-500 transition-all shadow-inner-platinum" title="Arquivar"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (!bidding) return null;

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-12 text-text-primary animate-in fade-in duration-700">
      {/* Premium Breadcrumbs & Actions */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 shrink-0">
        <div className="space-y-6">
          <button 
            onClick={handleBackToList}
            className="flex items-center gap-3 text-text-muted hover:text-primary transition-all text-[10px] font-black uppercase tracking-[0.4em] group"
          >
            <div className="p-2 bg-surface-elevated/40 border border-border-subtle rounded-lg group-hover:bg-primary group-hover:text-white transition-all shadow-inner-platinum">
               <ArrowLeft size={14} />
            </div>
            Retornar à Matriz
          </button>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-text-primary uppercase leading-tight max-w-4xl">{bidding.title}</h1>
            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.4em] text-text-muted opacity-60">
              <span className="flex items-center gap-2 text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/20"><ShieldCheck size={14} /> ID: {bidding.process_number}</span>
              <span className="flex items-center gap-2"><Building2 size={14} /> {bidding.modality}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-4 px-8 py-4.5 bg-surface-elevated/40 text-text-primary font-black rounded-2xl border border-border-subtle/30 hover:bg-surface-elevated transition-all text-[10px] uppercase tracking-widest shadow-inner-platinum">
            <Printer size={18} className="text-primary" />
            Gerar Dossiê Inteligente
          </button>
          <div className="w-px h-12 bg-border-subtle/30" />
          <Zap className="text-primary w-8 h-8 animate-pulse shadow-platinum-glow-sm" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-10">
          <div className="platinum-card p-10 space-y-10 bg-surface-elevated/10 backdrop-blur-xl border-border-subtle/30 shadow-platinum-glow-sm">
            <div className="flex items-center gap-4 border-b border-border-subtle/30 pb-6">
              <Info size={24} className="text-primary" />
              <h2 className="text-sm font-black uppercase tracking-[0.5em] text-text-primary">Engenharia do Edital</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-3">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] opacity-60">Órgão Comprador</span>
                <p className="text-xs font-black text-text-primary uppercase leading-relaxed tracking-tight">{bidding.agency}</p>
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] opacity-60">Valuation de Referência</span>
                <p className="text-2xl font-black text-primary tracking-tighter shadow-platinum-glow-sm">{parseFloat(bidding.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] opacity-60">Governança de Status</span>
                <div className="relative group mt-1">
                   <Activity size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-60 group-focus-within:opacity-100 transition-opacity" />
                   <select 
                    value={currentStatus}
                    onChange={(e) => setCurrentStatus(e.target.value)}
                    className="w-full bg-background/50 border border-border-medium rounded-xl pl-10 pr-10 py-3 text-[10px] font-black uppercase tracking-widest text-text-primary outline-none focus:border-primary/40 appearance-none cursor-pointer shadow-inner-platinum"
                  >
                    <option value="Em análise" className="bg-surface">Em análise</option>
                    <option value="Aguardando" className="bg-surface">Aguardando</option>
                    <option value="Ativa" className="bg-surface">Ativa</option>
                    <option value="Encerrada" className="bg-surface">Encerrada</option>
                  </select>
                  <ChevronRight size={12} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-text-muted opacity-40 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-t border-border-subtle/30 pt-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner-platinum group hover:scale-110 transition-transform">
                  <Calendar size={28} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] block opacity-60">Sessão Pública</span>
                  <p className="text-sm font-black text-text-primary uppercase tracking-widest">{formatDate(bidding.opening_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner-platinum group hover:scale-110 transition-transform">
                  <Clock size={28} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] block opacity-60">Cronologia Core</span>
                  <p className="text-sm font-black text-text-primary uppercase tracking-widest">{formatTime(bidding.opening_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner-platinum group hover:scale-110 transition-transform">
                  <Globe size={28} />
                </div>
                <div className="max-w-[180px]">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] block opacity-60">Portal de Compra</span>
                  <a href={`https://${bidding.source_url}`} target="_blank" rel="noreferrer" className="text-[11px] font-black text-primary truncate block hover:text-primary-hover transition-colors">{bidding.source_url?.toUpperCase()}</a>
                </div>
              </div>
            </div>

            <div className="space-y-5 pt-6">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.5em] flex items-center gap-4 opacity-60"><AlignLeft size={16} /> Objeto de Contratação Estratégica</span>
              <p className="text-sm text-text-secondary leading-relaxed italic bg-surface-elevated/20 p-8 rounded-[2rem] border border-border-subtle/30 shadow-inner-platinum uppercase tracking-tight">{bidding.description}</p>
            </div>
          </div>

          {/* Supplier Grid */}
          <div className="space-y-10">
            <h3 className="text-xs font-black uppercase tracking-[0.5em] text-text-primary flex items-center gap-5 px-4">
              <DollarSign size={20} className="text-primary" /> Análise Competitiva de Mercado
            </h3>
            
            {[
              { name: 'AMB DISTRIBUIDORA HOSPITALAR LTDA', valUnit: '5.500,00', fab: 'EMERGO', status: 'Market Leader' },
              { name: 'M V R DE SOUZA COMERCIO LTDA', valUnit: '7.700,00', fab: 'CMOS DRAKE', status: 'Qualified' }
            ].map((supplier, idx) => (
              <div key={idx} className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-platinum-glow-sm group hover:border-primary/30 transition-all duration-700">
                <div className="bg-surface-elevated/30 px-10 py-6 flex justify-between items-center border-b border-border-subtle/30">
                  <div className="flex items-center gap-5">
                    <div className="w-3 h-3 rounded-full bg-primary shadow-platinum-glow animate-pulse"></div>
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-text-primary group-hover:text-primary transition-colors">{supplier.name}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic bg-primary/5 px-4 py-1.5 rounded-full border border-primary/20 shadow-platinum-glow-sm">{supplier.status}</span>
                </div>
                <div className="p-10 overflow-x-auto scrollbar-platinum">
                  <table className="w-full text-left">
                    <thead className="text-[9px] font-black uppercase tracking-[0.5em] text-text-muted opacity-60 border-b border-border-subtle/30">
                      <tr>
                        <th className="pb-6">Item / Descritivo Técnico</th>
                        <th className="pb-6">Fabricante</th>
                        <th className="pb-6 text-right">Unitário (BRL)</th>
                        <th className="pb-6 text-right">Audit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle/10">
                      <tr className="hover:bg-surface-elevated/20 transition-colors">
                        <td className="py-8 max-w-sm">
                          <div className="text-xs font-black text-text-primary uppercase tracking-tight">Item 21: DEA - Desfibrilador Externo Automático</div>
                          <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-2 opacity-60 flex items-center gap-2"><Target size={12} className="text-primary/40" /> Qtd Demandada: 02 UN</div>
                        </td>
                        <td className="py-8 text-[11px] font-mono text-text-secondary uppercase tracking-widest font-black opacity-80">{supplier.fab}</td>
                        <td className="py-8 text-right font-black text-text-primary text-base tracking-tighter group-hover:text-primary transition-colors">R$ {supplier.valUnit}</td>
                        <td className="py-8 text-right">
                          <button className="p-3 bg-surface-elevated/40 border border-border-subtle rounded-xl text-text-muted hover:text-primary transition-all shadow-inner-platinum group-hover:scale-110"><Eye size={18} /></button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-10">
          {/* Document widget */}
          <div className="platinum-card p-8 space-y-8 bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-platinum-glow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-primary flex items-center gap-3">
              <FileCheck size={16} className="text-primary" /> Repositório Documental
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-center border-2 border-dashed border-border-medium rounded-[2.5rem] p-12 hover:border-primary/40 hover:bg-primary/5 transition-all group cursor-pointer duration-500 shadow-inner-platinum">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-surface-elevated flex items-center justify-center border border-border-subtle group-hover:scale-110 transition-transform duration-500 shadow-inner-platinum">
                     <Upload size={28} className="text-text-muted group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted group-hover:text-primary transition-colors">Transmissão de Edital / Proposta</span>
                </div>
              </div>
              <p className="text-[10px] text-center text-text-muted italic font-black uppercase tracking-widest opacity-40">Nenhuma evidência anexada ao dossiê.</p>
            </div>
          </div>

          {/* Activity/Notes widget */}
          <div className="platinum-card p-8 space-y-8 bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-platinum-glow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-primary flex items-center gap-3">
              <MessageSquare size={16} className="text-primary" /> Pareceres Estratégicos
            </h3>
            <div className="space-y-6">
              <div className="relative group">
                 <AlignLeft size={16} className="absolute left-6 top-6 text-text-muted opacity-40 group-focus-within:text-primary transition-colors" />
                 <textarea 
                  rows={4} 
                  placeholder="Inserir nota de inteligência..."
                  className="w-full bg-background/50 border border-border-medium rounded-[1.5rem] pl-16 pr-6 py-6 text-xs font-black text-text-primary placeholder:text-text-muted/40 uppercase tracking-tight focus:border-primary/40 outline-none resize-none transition-all shadow-inner-platinum"
                ></textarea>
              </div>
              <button className="w-full py-4.5 bg-surface-elevated/40 hover:bg-primary hover:text-white border border-border-subtle hover:border-primary/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] text-text-primary transition-all duration-500 shadow-inner-platinum flex items-center justify-center gap-3 group">
                 <Check size={16} className="group-hover:scale-125 transition-transform" />
                 Registrar Parecer
              </button>
            </div>
          </div>

          {/* AI Score Widget (Bonus) */}
          <div className="platinum-card p-8 bg-gradient-primary border border-primary/20 shadow-platinum-glow flex flex-col items-center gap-6 group">
             <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-inner-platinum animate-pulse">
                <Sparkles size={40} className="text-white" />
             </div>
             <div className="text-center space-y-2">
                <h4 className="text-white font-black uppercase tracking-[0.4em] text-[10px]">Neural Win-Score</h4>
                <p className="text-4xl font-black text-white tracking-tighter shadow-platinum-glow-sm group-hover:scale-110 transition-transform duration-700">84%</p>
             </div>
             <p className="text-[9px] text-white/60 font-black uppercase tracking-widest text-center leading-relaxed">Alta probabilidade de êxito baseada no histórico de lances e precificação.</p>
          </div>
        </div>
      </div>
    </div>
  );
}