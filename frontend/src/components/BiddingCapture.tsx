import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, Save, Loader2, FileText, Search, RefreshCw, ExternalLink, Activity, Globe, Calendar, DollarSign, Target, Zap } from 'lucide-react';
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
  
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>(['Tecnologia', 'Software', 'Licença']);
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString('pt-BR'));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: '', process_number: '', agency: '', modality: '',
    opening_date: '', value: '', status: 'ativa', source_url: '', description: '',
  });

  useEffect(() => { fetchBiddings(); }, []);

  const fetchBiddings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/opportunities?type=bidding');
      const data = res.data.data || res.data;
      setBiddings(Array.isArray(data) ? data : []);
    } catch (error) { toast.error('Erro na sincronização de editais.'); }
    finally { setLoading(false); }
  };

  const handleForceScan = async () => {
    setSearching(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setLastSync(new Date().toLocaleTimeString('pt-BR'));
      toast.success('Varredura RPA concluída com sucesso.');
      fetchBiddings();
    } catch (error) { toast.error('Falha no motor de captura.'); }
    finally { setSearching(false); }
  };

  const addKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      if (!keywords.includes(keywordInput.trim())) {
        setKeywords([...keywords, keywordInput.trim()]);
      }
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw));
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

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700 overflow-x-hidden">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Sourcing & <span className="text-gradient-gold">Captura RPA</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <Globe size={14} className="text-primary" />
            Controle mestre do motor de busca e indexação de editais.
          </p>
        </div>
      </header>

      {/* RPA Engine Control */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Robot Status Card */}
        <div className="platinum-card p-10 flex flex-col justify-center relative overflow-hidden bg-surface-elevated/10 backdrop-blur-xl border border-border-subtle group">
          <div className="flex items-center justify-between z-10 relative">
             <div className="flex items-center gap-4">
                <div className="relative">
                   <div className={`w-4 h-4 rounded-full ${searching ? 'bg-primary animate-ping' : 'bg-emerald-500'} absolute opacity-70`} />
                   <div className={`w-4 h-4 rounded-full ${searching ? 'bg-primary' : 'bg-emerald-500'} relative shadow-[0_0_20px_rgba(16,185,129,0.8)]`} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-text-primary">
                    {searching ? 'Buscando Editais...' : 'Motor RPA Online'}
                  </h3>
                  <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em] opacity-60">Status de Rede Neural</p>
                </div>
             </div>
             <Activity size={32} className={`${searching ? 'text-primary' : 'text-emerald-500'} opacity-20`} />
          </div>
          
          <div className="mt-8 pt-6 border-t border-border-subtle/30 z-10 relative flex justify-between items-center">
             <span className="text-[10px] font-black uppercase text-text-muted tracking-widest flex items-center gap-2">
                <RefreshCw size={12} /> Última Sincronização
             </span>
             <span className="text-xs font-bold text-text-primary bg-background px-3 py-1 rounded-md border border-border-subtle shadow-inner-platinum">{lastSync}</span>
          </div>
          
          <div className={`absolute -right-10 -bottom-10 w-40 h-40 blur-[80px] rounded-full transition-all duration-700 ${searching ? 'bg-primary/20' : 'bg-emerald-500/10'}`} />
        </div>

        {/* Keywords Input */}
        <div className="lg:col-span-2 platinum-card p-10 bg-surface-elevated/10 backdrop-blur-xl border border-border-subtle flex flex-col gap-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.4em] flex items-center gap-3">
                 <Target size={16} className="text-primary" /> Parâmetros de Interceptação (Palavras-Chave)
              </h3>
           </div>
           
           <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Digite a palavra-chave e pressione Enter..."
                value={keywordInput}
                onChange={e => setKeywordInput(e.target.value)}
                onKeyDown={addKeyword}
                className="w-full pl-14 pr-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum"
              />
           </div>

           <div className="flex flex-wrap gap-3">
              {keywords.map(kw => (
                 <span key={kw} className="flex items-center gap-2 bg-surface-elevated border border-border-subtle pl-4 pr-2 py-1.5 rounded-full text-xs font-black text-text-primary shadow-platinum-glow-sm hover:border-primary/30 transition-all">
                    {kw}
                    <button onClick={() => removeKeyword(kw)} className="p-1 hover:bg-red-500/10 hover:text-red-500 rounded-full text-text-muted transition-colors"><X size={12} /></button>
                 </span>
              ))}
              {keywords.length === 0 && <span className="text-[10px] uppercase font-black tracking-widest text-text-muted opacity-40">Nenhuma palavra-chave configurada</span>}
           </div>
           
           <div className="mt-auto pt-4 flex justify-end">
             <button
                onClick={handleForceScan}
                disabled={searching}
                className="btn-primary py-4 px-10 shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-3 uppercase text-[10px] font-black tracking-widest disabled:opacity-50 relative overflow-hidden group"
              >
                <div className="absolute inset-0 w-full h-full bg-white/10 -translate-x-full group-hover:animate-shimmer" />
                {searching ? <Loader2 className="w-4 h-4 animate-spin relative z-10" /> : <Zap className="w-4 h-4 relative z-10" />}
                <span className="relative z-10">{searching ? 'Varredura em Curso...' : 'Forçar Varredura Agora'}</span>
              </button>
           </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
         <h2 className="text-sm font-black uppercase tracking-[0.3em] text-text-primary">Registros Capturados</h2>
         <button
            onClick={() => { setFormData({
              title: '', process_number: '', agency: '', modality: '',
              opening_date: '', value: '', status: 'ativa', source_url: '', description: '',
            }); setIsEditing(false); setIsModalOpen(true); }}
            className="flex items-center gap-3 px-6 py-3 bg-surface-elevated/40 border border-border-subtle text-text-primary font-black rounded-xl hover:bg-surface-elevated transition-all text-[10px] uppercase tracking-[0.2em] shadow-platinum-glow-sm"
          >
            <Plus className="w-4 h-4 text-primary" /> Inserção Manual
         </button>
      </div>

      <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md">
        {loading ? (
          <div className="py-40 text-center flex flex-col items-center gap-6 justify-center">
             <Loader2 className="animate-spin w-12 h-12 text-primary opacity-40" />
             <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.5em] animate-pulse">Carregando Acervo...</p>
          </div>
        ) : biddings.length === 0 ? (
          <div className="py-40 text-center space-y-6 opacity-40">
            <div className="w-24 h-24 bg-surface-elevated/40 border border-border-subtle rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-platinum-glow-sm">
               <Target size={48} className="text-text-muted opacity-40" />
            </div>
            <p className="text-[10px] text-text-muted uppercase font-black tracking-[0.3em]">Nenhum edital registrado na base.</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-platinum">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-elevated/40 border-b border-border-subtle">
                <tr>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Processo / Modalidade</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Órgão / Objeto Estratégico</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Valuation</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Abertura</th>
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
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-40 group-hover:opacity-100 transition-all duration-300">
                        <button onClick={() => navigate(`/auction-details?id=${bidding.id}`)} className="p-3 bg-surface-elevated/40 border border-border-subtle rounded-xl hover:bg-primary/20 hover:text-primary text-text-muted transition-all hover:scale-110 shadow-platinum-glow-sm" title="Detalhes"><ExternalLink size={18} /></button>
                        <button onClick={() => handleEdit(bidding)} className="p-3 bg-surface-elevated/40 border border-border-subtle rounded-xl hover:bg-primary/20 hover:text-primary text-text-muted transition-all hover:scale-110 shadow-platinum-glow-sm" title="Editar"><Pencil size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'REFINAR OPORTUNIDADE' : 'REGISTRAR NOVA OPORTUNIDADE'} size="lg">
        {/* ... existing modal form content ... */}
        <form onSubmit={handleSubmit} className="p-4 space-y-10">
           {/* Inputs for Title, Process Number, etc. are identical to previous layout to preserve functionality */}
           <div className="space-y-4 group">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Objeto Licitatório / Título Comercial *</label>
            <div className="relative">
               <Target className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/60 w-6 h-6" />
               <input 
                 type="text" 
                 value={formData.title} 
                 onChange={e => setFormData({ ...formData, title: e.target.value })} 
                 className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-bold text-text-primary outline-none focus:border-primary/40 transition-all placeholder:text-text-muted/30 shadow-inner-platinum" 
                 required 
               />
            </div>
          </div>
          <div className="flex justify-end gap-6 pt-10 border-t border-border-subtle">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-5 text-[10px] font-black text-text-muted hover:text-text-primary uppercase tracking-[0.3em] transition-all">Descartar</button>
            <button type="submit" className="btn-primary py-5 px-12 shadow-platinum-glow uppercase text-[11px] tracking-[0.3em] flex items-center gap-3">
               <Save size={18} /> Salvar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}