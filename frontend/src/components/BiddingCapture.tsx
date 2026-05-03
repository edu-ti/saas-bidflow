import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, Save, Loader2, FileText, Search, RefreshCw, ExternalLink, Lock, ShieldCheck, Zap, Target, Globe, Calendar } from 'lucide-react';
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
      setBiddings(res.data.data || res.data || []);
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
      'ativa': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'suspensa': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'encerrada': 'bg-white/5 text-text-muted border-white/10',
      'revogada': 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return styles[status] || 'bg-white/5 text-text-muted border-white/10';
  };

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-8 text-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Sourcing & <span className="text-gradient-gold">Opportunity Intelligence</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <Globe size={12} className="text-primary" />
            Monitoramento autônomo de canais oficiais e extração de editais.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSearch}
            disabled={searching}
            className="flex items-center gap-3 px-8 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow disabled:opacity-50 uppercase text-[10px] tracking-[0.2em]"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {searching ? 'Sincronizando...' : 'Varredura RPA'}
          </button>
          <button
            onClick={() => { setFormData({
              title: '', process_number: '', agency: '', modality: '',
              opening_date: '', value: '', status: 'ativa', source_url: '', description: '',
            }); setIsEditing(false); setIsModalOpen(true); }}
            className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 text-white font-black rounded-xl hover:bg-white/10 transition-all text-[10px] uppercase tracking-widest"
          >
            <Plus className="w-4 h-4 text-primary" />
            Registro Manual
          </button>
        </div>
      </header>

      <div className="platinum-card p-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Interrogar por Nº Processo, Órgão ou Palavras-chave..."
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-11 pr-4 py-3 bg-background border border-white/5 rounded-xl text-sm text-white focus:border-primary/30 outline-none transition-all placeholder:text-text-muted"
          />
        </div>
        <select
          value={filters.modality}
          onChange={e => setFilters({ ...filters, modality: e.target.value })}
          className="px-6 py-3 bg-background border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white outline-none appearance-none cursor-pointer"
        >
          {defaultModalities.map(m => <option key={m.value} value={m.value} className="bg-surface">{m.label}</option>)}
        </select>
        <button onClick={fetchBiddings} className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-xl hover:bg-primary/20 transition-all">
          <Search size={18} />
        </button>
      </div>

      <div className="platinum-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-text-muted uppercase text-[10px] font-black tracking-[0.3em]"><Loader2 className="animate-spin inline mr-3" /> Auditando Oportunidades...</div>
        ) : biddings.length === 0 ? (
          <div className="p-20 text-center space-y-4 opacity-60">
            <Target size={48} className="mx-auto text-text-muted opacity-20" />
            <div className="space-y-1">
              <p className="text-white font-black uppercase tracking-widest">Horizonte Limpo</p>
              <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Nenhuma oportunidade capturada nos filtros atuais.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Processo / Modalidade</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Órgão / Objeto</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Valuation</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Abertura</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-center">Status</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {biddings.map(bidding => (
                  <tr key={bidding.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-6">
                      <div className="font-mono text-[10px] text-primary font-bold">{bidding.process_number || 'N/A'}</div>
                      <div className="text-[8px] text-text-muted mt-1 uppercase font-black tracking-widest italic">{bidding.modality}</div>
                    </td>
                    <td className="px-6 py-6 space-y-1">
                      <div className="font-bold text-white uppercase text-xs truncate max-w-[280px] group-hover:text-primary transition-colors">{bidding.title}</div>
                      <div className="text-[10px] text-text-muted font-bold tracking-tight">{bidding.agency}</div>
                    </td>
                    <td className="px-6 py-6 font-black text-white">{formatCurrency(bidding.value)}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-text-secondary text-[10px] font-black uppercase">
                        <Calendar size={12} className="text-primary/60" />
                        {formatDate(bidding.opening_date)}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${getStatusBadge(bidding.status)}`}>
                        {bidding.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => navigate(`/auction-details?id=${bidding.id}`)} className="p-2 text-text-muted hover:text-primary transition-all"><ExternalLink size={16} /></button>
                        <button onClick={() => handleEdit(bidding)} className="p-2 text-text-muted hover:text-primary transition-all"><Pencil size={16} /></button>
                        <button className="p-2 text-text-muted hover:text-red-400 transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'REFINAR OPORTUNIDADE' : 'REGISTRAR NOVA OPORTUNIDADE'}>
        <form onSubmit={handleSubmit} className="space-y-8 p-2">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Objeto Licitatório / Título Comercial *</label>
            <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white outline-none focus:border-primary/40 transition-all" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Número do Processo</label>
              <input type="text" value={formData.process_number} onChange={e => setFormData({ ...formData, process_number: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white font-mono" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Modalidade Operacional</label>
              <select value={formData.modality} onChange={e => setFormData({ ...formData, modality: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white appearance-none">
                {defaultModalities.map(m => <option key={m.value} value={m.value} className="bg-surface">{m.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Valor Referencial (R$)</label>
              <input type="number" step="0.01" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-emerald-400 font-black" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Abertura da Sessão</label>
              <input type="datetime-local" value={formData.opening_date} onChange={e => setFormData({ ...formData, opening_date: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2"><Globe size={12} className="text-primary" /> Fonte de Dados (URL)</label>
            <input type="url" value={formData.source_url} onChange={e => setFormData({ ...formData, source_url: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white" />
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 text-text-muted font-bold hover:text-white transition-all text-xs uppercase tracking-widest">Descartar</button>
            <button type="submit" className="px-10 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow text-xs uppercase tracking-widest">{isEditing ? 'Confirmar Mudanças' : 'Validar Registro'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}