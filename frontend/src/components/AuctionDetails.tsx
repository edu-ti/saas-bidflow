import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, Edit, Trash2, Eye, Plus, Search, FileText, ArrowLeft, Printer, Info, Clock, MapPin, Building2, ExternalLink, ShieldCheck, Upload, FileCheck, MessageSquare, Lock, ChevronRight, DollarSign } from 'lucide-react';
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
      'Ativa': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'Em análise': 'bg-primary/10 text-primary border-primary/20',
      'Aguardando': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'Encerrada': 'bg-white/5 text-text-muted border-white/10',
    };
    return styles[status] || 'bg-white/5 text-text-muted border-white/10';
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-40" />
        <p className="font-black uppercase tracking-[0.2em] text-[10px] text-text-muted">Interrogando Base Platinum...</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="p-8 w-full min-h-screen bg-background space-y-8 text-white">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Pregões <span className="text-gradient-gold">Cadastrados</span>
            </h1>
            <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
              <Lock size={12} className="text-primary" />
              Gestão estratégica e monitoramento de sessões públicas em tempo real.
            </p>
          </div>
          <button 
            onClick={() => navigate('/bidding-capture')}
            className="flex items-center gap-3 px-6 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow text-xs uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" />
            Nova Oportunidade
          </button>
        </header>

        <div className="platinum-card overflow-hidden">
          <div className="p-4 bg-white/[0.01] border-b border-white/5 flex flex-col md:flex-row justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
              <input 
                type="text" 
                placeholder="Identificação do edital..." 
                className="w-full pl-11 pr-4 py-3 bg-background/50 border border-white/5 rounded-xl text-sm focus:border-primary/30 outline-none transition-all text-white"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Identificação</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Órgão Licitante</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-center">Data da Disputa</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-center">Status</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {biddingsList.map((bid) => (
                  <tr key={bid.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-6">
                      <div className="font-bold text-white group-hover:text-primary transition-colors uppercase">{bid.bidding_metadata?.edital || 'SEM EDITAL'}</div>
                      <div className="text-[10px] text-text-muted font-mono tracking-wider">{bid.process_number || '-'}</div>
                    </td>
                    <td className="px-6 py-6 max-w-xs">
                      <div className="truncate text-text-secondary italic text-xs" title={bid.agency}>{bid.agency || '-'}</div>
                      <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1">{bid.modality}</div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="text-white font-bold">{formatDate(bid.opening_date)}</div>
                      <div className="text-[10px] text-text-muted font-black">{formatTime(bid.opening_date)}</div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border ${getStatusBadge(bid.status)}`}>
                        {bid.status || 'Em análise'}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleViewDetails(bid.id)} className="p-2 text-text-muted hover:text-primary transition-all"><Eye size={16} /></button>
                        <button className="p-2 text-text-muted hover:text-primary transition-all"><Edit size={16} /></button>
                        <button className="p-2 text-text-muted hover:text-red-400 transition-all"><Trash2 size={16} /></button>
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
    <div className="p-8 w-full min-h-screen bg-background space-y-12 text-white">
      {/* Premium Breadcrumbs & Actions */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-4">
          <button 
            onClick={handleBackToList}
            className="flex items-center gap-2 text-text-muted hover:text-primary transition-all text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <ArrowLeft size={14} /> Voltar ao Painel
          </button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">{bidding.title}</h1>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
              <span className="flex items-center gap-1.5 text-primary"><ShieldCheck size={14} /> ID: {bidding.process_number}</span>
              <span className="flex items-center gap-1.5"><Building2 size={14} /> {bidding.modality}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-3 px-6 py-3 bg-surface-elevated/50 text-white font-bold rounded-xl border border-white/10 hover:bg-surface-elevated transition-all text-xs uppercase tracking-widest">
            <Printer size={16} className="text-primary" />
            Exportar Dossiê
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="platinum-card p-8 space-y-8">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <Info size={18} className="text-primary" />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">Análise do Edital</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Órgão Comprador</span>
                <p className="text-sm font-bold text-white uppercase leading-relaxed">{bidding.agency}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Valuation Base</span>
                <p className="text-xl font-black text-primary tracking-tight">{parseFloat(bidding.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Status de Operação</span>
                <div className="flex items-center gap-3 mt-1">
                  <select 
                    value={currentStatus}
                    onChange={(e) => setCurrentStatus(e.target.value)}
                    className="bg-background/50 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-primary/40 appearance-none"
                  >
                    <option value="Em análise" className="bg-surface">Em análise</option>
                    <option value="Aguardando" className="bg-surface">Aguardando</option>
                    <option value="Ativa" className="bg-surface">Ativa</option>
                    <option value="Encerrada" className="bg-surface">Encerrada</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/5 pt-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block">Data Sessão</span>
                  <p className="text-sm font-bold text-white">{formatDate(bidding.opening_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Clock size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block">Hora H</span>
                  <p className="text-sm font-bold text-white">{formatTime(bidding.opening_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <MapPin size={20} />
                </div>
                <div className="max-w-[150px]">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block">Portal Público</span>
                  <a href={`https://${bidding.source_url}`} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-primary truncate block hover:underline">{bidding.source_url}</a>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2"><AlignLeft size={12} /> Objeto da Contratação</span>
              <p className="text-sm text-text-secondary leading-relaxed italic bg-white/[0.02] p-4 rounded-xl border border-white/5">{bidding.description}</p>
            </div>
          </div>

          {/* Supplier Grid */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white flex items-center gap-3 px-2">
              <DollarSign size={16} className="text-primary" /> Análise de Concorrência e Itens
            </h3>
            
            {[
              { name: 'AMB DISTRIBUIDORA HOSPITALAR LTDA', valUnit: '5.500,00', fab: 'EMERGO', status: 'Líder' },
              { name: 'M V R DE SOUZA COMERCIO LTDA', valUnit: '7.700,00', fab: 'CMOS DRAKE', status: 'Qualificada' }
            ].map((supplier, idx) => (
              <div key={idx} className="platinum-card overflow-hidden">
                <div className="bg-white/[0.03] px-6 py-4 flex justify-between items-center border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-platinum-glow"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">{supplier.name}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">{supplier.status}</span>
                </div>
                <div className="p-6 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-[9px] font-black uppercase tracking-widest text-text-muted border-b border-white/5">
                      <tr>
                        <th className="pb-4">Nº / Descrição</th>
                        <th className="pb-4">Fabricante</th>
                        <th className="pb-4 text-right">Unitário</th>
                        <th className="pb-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <tr>
                        <td className="py-4 max-w-xs">
                          <div className="text-xs font-bold text-white truncate">Item 21: DEA - Desfibrilador Externo Automático</div>
                          <div className="text-[10px] text-text-muted">Qtd: 02 Unidades</div>
                        </td>
                        <td className="py-4 text-xs font-mono text-text-secondary uppercase">{supplier.fab}</td>
                        <td className="py-4 text-right font-black text-white text-sm">R$ {supplier.valUnit}</td>
                        <td className="py-4 text-right">
                          <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors">Detalhes</button>
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
        <div className="space-y-8">
          {/* Document widget */}
          <div className="platinum-card p-6 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <FileCheck size={14} className="text-primary" /> Repositório Documental
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-8 hover:border-primary/30 transition-all group cursor-pointer">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Upload size={24} className="text-text-muted group-hover:text-primary transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Upload de Edital / Proposta</span>
                </div>
              </div>
              <p className="text-[10px] text-center text-text-muted italic">Nenhum contrato ou empenho anexado até o momento.</p>
            </div>
          </div>

          {/* Activity/Notes widget */}
          <div className="platinum-card p-6 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <MessageSquare size={14} className="text-primary" /> Pareceres e Observações
            </h3>
            <textarea 
              rows={3} 
              placeholder="Inserir nota estratégica..."
              className="w-full bg-background/50 border border-white/10 rounded-xl p-4 text-xs text-white placeholder:text-text-muted focus:border-primary/40 outline-none resize-none transition-all"
            ></textarea>
            <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all">
              Registrar Parecer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}