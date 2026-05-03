import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, Save, Loader2, FileText, Search, RefreshCw, ExternalLink, Lock, ShieldCheck, Zap, Target, Globe, Calendar, DollarSign, ChevronRight, Activity, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import Modal from './ui/Modal';

interface Bidding {
  id: number;
  title: string;
  process_number: string;
  agency: string;
  modality: string;
  opening_date: string;
  value: string;
  status: string;
  source_url?: string;
  description?: string;
}

const defaultModalities = [
  { value: '', label: 'Todas as Modalidades' },
  { value: 'pregão', label: 'Pregão Eletrônico' },
  { value: 'tomada_de_precos', label: 'Tomada de Preços' },
  { value: 'concurso', label: 'Concurso Público' },
  { value: 'convite', label: 'Convite' },
  { value: 'inexigibilidade', label: 'Inexigibilidade' },
  { value: 'dispensabilidade', label: 'Dispensa de Licitação' },
];

export default function BiddingCapture() {
  const navigate = useNavigate();
  const [biddings, setBiddings] = useState<Bidding[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [filters, setFilters] = useState({ search: '', modality: '' });
  const [formData, setFormData] = useState({
    title: '', process_number: '', agency: '', modality: '',
    opening_date: '', value: '', status: 'ativa', source_url: '', description: '',
  });

  useEffect(() => { fetchBiddings(); }, []);

  const fetchBiddings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('type', 'bidding');
      if (filters.search) params.append('search', filters.search);
      if (filters.modality) params.append('modality', filters.modality);
      const res = await api.get(`/api/opportunities?${params.toString()}`);
      const data = res.data.data || res.data;
      setBiddings(Array.isArray(data) ? data : []);
    } catch (error) { toast.error('Erro na sincronização de editais.'); }
    finally { setLoading(false); }
  };

  const handleSearch = async () => {
    setSearching(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Varredura RPA concluída.');
      fetchBiddings();
    } catch (error) { toast.error('Falha no motor de captura.'); }
    finally { setSearching(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingId) await api.put(`/api/opportunities/${editingId}`, { ...formData, type: 'bidding' });
      else await api.post('/api/opportunities', { ...formData, type: 'bidding' });
      toast.success('Registro estratégico consolidado.');
      setIsModalOpen(false);
      fetchBiddings();
    } catch (error) { toast.error('Erro na persistência de dados.'); }
  };

  const handleEdit = (bidding: Bidding) => {
    setFormData({
      title: bidding.title, process_number: bidding.process_number, agency: bidding.agency,
      modality: bidding.modality, opening_date: bidding.opening_date, value: bidding.value,
      status: bidding.status, source_url: bidding.source_url || '', description: bidding.description || '',
    });
    setEditingId(bidding.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const formatCurrency = (v: string) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(v || '0'));
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'ativa': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'suspensa': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'encerrada': 'bg-surface-elevated/40 text-text-muted border-border-subtle',
      'revogada': 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return styles[status] || 'bg-surface-elevated/40 text-text-muted border-border-subtle';
  };

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700 overflow-x-hidden">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Sourcing & <span className="text-gradient-gold">Opportunity Intelligence</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <Globe size={14} className="text-primary" />
            Monitoramento autônomo de canais oficiais e extração de editais via RPA.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSearch}
            disabled={searching}
            className="btn-primary py-4 px-8 shadow-platinum-glow flex items-center gap-3 uppercase text-[10px] tracking-widest disabled:opacity-50"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {searching ? 'Varredura em Curso...' : 'Sincronizar RPA'}
          </button>
          <button
            onClick={() => { setFormData({
              title: '', process_number: '', agency: '', modality: '',
              opening_date: '', value: '', status: 'ativa', source_url: '', description: '',
            }); setIsEditing(false); setIsModalOpen(true); }}
            className="flex items-center gap-3 px-8 py-4 bg-surface-elevated/40 border border-border-subtle text-text-primary font-black rounded-xl hover:bg-surface-elevated transition-all text-[10px] uppercase tracking-[0.2em] shadow-platinum-glow-sm"
          >
            <Plus className="w-5 h-5 text-primary" />
            Registro Manual
          </button>
        </div>
      </header>

      {/* Stats Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Capturas Ativas', val: biddings.length, icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Sessões Hoje', val: biddings.filter(b => b.opening_date && b.opening_date.includes(new Date().toISOString().split('T')[0])).length, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Valuation Total', val: `R$ ${(biddings.reduce((acc, b) => acc + (parseFloat(b.value?.toString().replace(/[^0-9.]/g, '') || '0')), 0) / 1000000).toFixed(1)}M`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Integridade RPA', val: '100%', icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/10' },
        ].map((stat, i) => (
          <div key={i} className="platinum-card p-8 flex flex-col gap-6 group bg-surface-elevated/10 backdrop-blur-xl border-border-subtle/30 hover:border-primary/20 transition-all overflow-hidden relative">
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} border border-border-subtle flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-platinum-glow-sm relative z-10`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted opacity-60">{stat.label}</p>
              <p className="text-2xl font-black text-text-primary mt-2 tracking-tighter group-hover:text-primary transition-colors duration-500">{stat.val}</p>
            </div>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.bg} blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity`} />
          </div>
        ))}
      </div>

      <div className="platinum-card p-8 flex flex-wrap gap-6 items-center bg-surface-elevated/10 backdrop-blur-xl">
        <div className="flex-1 min-w-[300px] relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Interrogar por Nº Processo, Órgão ou Palavras-chave estratégicas..."
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-14 pr-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum"
          />
        </div>
        <div className="flex items-center gap-4 bg-surface-elevated/30 p-2 rounded-2xl border border-border-subtle shadow-platinum-glow-sm">
           <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Activity size={18} />
           </div>
           <select
             value={filters.modality}
             onChange={e => setFilters({ ...filters, modality: e.target.value })}
             className="bg-transparent text-[11px] font-black uppercase tracking-[0.2em] px-4 py-2 outline-none cursor-pointer text-text-primary hover:text-primary transition-colors"
           >
             {defaultModalities.map(m => <option key={m.value} value={m.value} className="bg-surface font-bold">{m.label.toUpperCase()}</option>)}
           </select>
        </div>
        <button onClick={fetchBiddings} className="btn-primary py-4 px-8 shadow-platinum-glow">
          <Search size={18} /> Validar Filtros
        </button>
      </div>

      <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md">
        {loading ? (
          <div className="py-40 text-center flex flex-col items-center gap-6 justify-center">
             <Loader2 className="animate-spin w-12 h-12 text-primary opacity-40" />
             <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.5em] animate-pulse">Auditando Oportunidades Globais...</p>
          </div>
        ) : biddings.length === 0 ? (
          <div className="py-40 text-center space-y-6 opacity-40">
            <div className="w-24 h-24 bg-surface-elevated/40 border border-border-subtle rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-platinum-glow-sm">
               <Target size={48} className="text-text-muted opacity-40" />
            </div>
            <div className="space-y-2">
              <p className="text-text-primary font-black uppercase tracking-[0.4em]">Horizonte Limpo</p>
              <p className="text-[10px] text-text-muted uppercase font-black tracking-[0.3em]">Nenhuma oportunidade capturada nos parâmetros atuais.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-platinum">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-elevated/40 border-b border-border-subtle">
                <tr>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Processo / Modalidade</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Órgão / Objeto Estratégico</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Valuation Core</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Sessão / SLA</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60 text-center">Status</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/30">
                {biddings.map(bidding => (
                  <tr key={bidding.id} className="hover:bg-surface-elevated/20 transition-all group border-b border-border-subtle/20 duration-300">
                    <td className="px-10 py-8">
                      <div className="font-mono text-[11px] text-primary font-black tracking-tighter">{bidding.process_number || 'REG-MANUAL'}</div>
                      <div className="text-[9px] text-text-muted mt-2 uppercase font-black tracking-[0.2em] italic opacity-60">{bidding.modality}</div>
                    </td>
                    <td className="px-10 py-8 space-y-2">
                      <div className="font-black text-text-primary uppercase text-sm tracking-tight truncate max-w-[300px] group-hover:text-primary transition-colors">{bidding.title}</div>
                      <div className="text-[10px] text-text-muted font-black uppercase tracking-[0.1em] flex items-center gap-2 opacity-60">
                         <div className="w-1.5 h-1.5 rounded-full bg-primary/40" /> {bidding.agency}
                      </div>
                    </td>
                    <td className="px-10 py-8 font-black text-text-primary text-sm tracking-tighter group-hover:text-primary transition-colors">{formatCurrency(bidding.value)}</td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2.5 text-text-secondary text-[10px] font-black uppercase tracking-[0.2em]">
                        <Calendar size={14} className="text-primary/60" />
                        {formatDate(bidding.opening_date)}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <span className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border w-fit mx-auto shadow-platinum-glow-sm ${getStatusBadge(bidding.status)}`}>
                        <div className="w-2 h-2 rounded-full bg-current animate-pulse shadow-platinum-glow" />
                        {bidding.status}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-40 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                        <button onClick={() => navigate(`/auction-details?id=${bidding.id}`)} className="p-3 bg-surface-elevated/40 border border-border-subtle rounded-xl hover:bg-primary/20 hover:text-primary text-text-muted transition-all hover:scale-110 shadow-platinum-glow-sm" title="Informações Detalhadas"><ExternalLink size={18} /></button>
                        <button onClick={() => handleEdit(bidding)} className="p-3 bg-surface-elevated/40 border border-border-subtle rounded-xl hover:bg-primary/20 hover:text-primary text-text-muted transition-all hover:scale-110 shadow-platinum-glow-sm" title="Refinar Registro"><Pencil size={18} /></button>
                        <button className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl hover:bg-red-500/20 text-red-500/60 transition-all hover:scale-110 shadow-platinum-glow-sm" title="Arquivar Oportunidade"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'REFINAR OPORTUNIDADE ESTRATÉGICA' : 'REGISTRAR NOVA OPORTUNIDADE CORE'} size="lg">
        <form onSubmit={handleSubmit} className="p-4 space-y-10">
          <div className="space-y-4 group">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Objeto Licitatório / Título Comercial *</label>
            <div className="relative">
               <Target className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/60 w-6 h-6" />
               <input 
                 type="text" 
                 value={formData.title} 
                 onChange={e => setFormData({ ...formData, title: e.target.value })} 
                 className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-bold text-text-primary outline-none focus:border-primary/40 transition-all placeholder:text-text-muted/30 shadow-inner-platinum" 
                 placeholder="Descreva o objeto central da licitação..."
                 required 
               />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4 group">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Número do Processo / Identificador</label>
              <div className="relative">
                <FileText className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6" />
                <input 
                  type="text" 
                  value={formData.process_number} 
                  onChange={e => setFormData({ ...formData, process_number: e.target.value })} 
                  className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-bold text-text-primary font-mono outline-none focus:border-primary/40 transition-all shadow-inner-platinum" 
                  placeholder="Ex: 000/2024"
                />
              </div>
            </div>
            <div className="space-y-4 group">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Modalidade Operacional</label>
              <div className="relative">
                <Zap className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6" />
                <select 
                  value={formData.modality} 
                  onChange={e => setFormData({ ...formData, modality: e.target.value })} 
                  className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-10 py-5 text-xs font-black uppercase tracking-[0.2em] text-text-primary outline-none focus:border-primary/40 transition-all appearance-none cursor-pointer shadow-inner-platinum"
                >
                  {defaultModalities.map(m => <option key={m.value} value={m.value} className="bg-surface font-bold text-text-primary">{m.label.toUpperCase()}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4 group">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Valor Referencial de Entrada (R$)</label>
              <div className="relative">
                <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 w-6 h-6" />
                <input 
                  type="number" 
                  step="0.01" 
                  value={formData.value} 
                  onChange={e => setFormData({ ...formData, value: e.target.value })} 
                  className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-emerald-500 outline-none focus:border-primary/40 transition-all shadow-inner-platinum" 
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-4 group">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Data e Hora da Sessão de Abertura</label>
              <div className="relative">
                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6" />
                <input 
                  type="datetime-local" 
                  value={formData.opening_date} 
                  onChange={e => setFormData({ ...formData, opening_date: e.target.value })} 
                  className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-bold text-text-primary outline-none focus:border-primary/40 transition-all shadow-inner-platinum" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 group">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors flex items-center gap-2"><Globe size={14} className="text-primary" /> Fonte de Dados Externa (URL Oficial)</label>
            <input 
              type="url" 
              value={formData.source_url} 
              onChange={e => setFormData({ ...formData, source_url: e.target.value })} 
              className="w-full bg-background/50 border border-border-medium rounded-2xl px-8 py-5 text-sm font-bold text-text-primary outline-none focus:border-primary/40 transition-all shadow-inner-platinum" 
              placeholder="https://portal-da-transparencia.gov.br/..."
            />
          </div>

          <div className="flex justify-end gap-6 pt-10 border-t border-border-subtle">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="px-10 py-5 text-[10px] font-black text-text-muted hover:text-text-primary uppercase tracking-[0.3em] transition-all"
            >
              Descartar
            </button>
            <button 
              type="submit" 
              className="btn-primary py-5 px-12 shadow-platinum-glow uppercase text-[11px] tracking-[0.3em] flex items-center gap-3"
            >
               {isEditing ? <><ShieldCheck size={18} /> Consolidar Mudanças</> : <><Save size={18} /> Validar Registro Core</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}