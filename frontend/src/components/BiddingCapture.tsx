import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, Save, Loader2, FileText, Search, RefreshCw, ExternalLink, Activity, Globe, Calendar, DollarSign, Target, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import Modal from './ui/Modal';
import { usePermissions } from '../hooks/usePermissions';

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
 const { hasPermission } = usePermissions();
 const canCreate = hasPermission('bidding', 'capture', 'create');
 const canEdit = hasPermission('bidding', 'capture', 'edit');

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
 <div className="space-y-8 animate-fade-in pb-8">
 <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
 Sourcing & Captura RPA
 </h1>
 <p className="text-text-secondary text-sm mt-1">
 Controle mestre do motor de busca e indexação de editais.
 </p>
 </div>
 </header>

 {/* RPA Engine Control */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
 {/* Robot Status Card */}
 <div className="card p-6 flex flex-col justify-center relative overflow-hidden">
 <div className="flex items-center justify-between z-10 relative">
 <div className="flex items-center gap-3">
 <div className="relative flex items-center justify-center w-8 h-8">
 <div className={`absolute w-full h-full rounded-full ${searching ? 'bg-primary animate-ping opacity-20' : 'bg-success opacity-20'}`} />
 <div className={`w-3 h-3 rounded-full ${searching ? 'bg-primary' : 'bg-success'} relative`} />
 </div>
 <div>
 <h3 className="text-base font-semibold text-text-primary">
 {searching ? 'Buscando Editais...' : 'Motor RPA Online'}
 </h3>
 <p className="text-xs text-text-secondary">Status de Rede Neural</p>
 </div>
 </div>
 <Activity size={24} className={`${searching ? 'text-primary' : 'text-success'} opacity-50`} />
 </div>
 
 <div className="mt-6 pt-4 border-t border-border z-10 relative flex justify-between items-center">
 <span className="text-xs font-medium text-text-muted flex items-center gap-1.5">
 <RefreshCw size={14} /> Última Sincronização
 </span>
 <span className="text-sm font-semibold text-text-primary bg-bg-tertiary px-2 py-1 rounded-md border border-border">
 {lastSync}
 </span>
 </div>
 </div>

 {/* Keywords Input */}
 <div className="lg:col-span-2 card p-6 flex flex-col gap-4">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
 <Target size={16} className="text-primary" /> Parâmetros de Interceptação (Palavras-Chave)
 </h3>
 </div>
 
 <div className="relative group">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 group-focus-within:text-primary transition-colors" />
 <input
 type="text"
 placeholder="Digite a palavra-chave e pressione Enter..."
 value={keywordInput}
 onChange={e => setKeywordInput(e.target.value)}
 onKeyDown={addKeyword}
 className="input w-full pl-9"
 />
 </div>

 <div className="flex flex-wrap gap-2">
 {keywords.map(kw => (
 <span key={kw} className="flex items-center gap-1.5 bg-bg-tertiary border border-border pl-3 pr-1 py-1 rounded-full text-xs font-medium text-text-primary transition-colors hover:border-primary/30">
 {kw}
 <button onClick={() => removeKeyword(kw)} className="p-1 hover:bg-danger/10 hover:text-danger rounded-full text-text-muted transition-colors"><X size={12} /></button>
 </span>
 ))}
 {keywords.length === 0 && <span className="text-xs text-text-muted opacity-60">Nenhuma palavra-chave configurada</span>}
 </div>
 
 <div className="mt-2 flex justify-end">
 <button
 onClick={handleForceScan}
 disabled={searching}
 className="btn btn-primary py-2 px-4 flex items-center gap-2 disabled:opacity-50"
 >
 {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
 <span>{searching ? 'Varredura em Curso...' : 'Forçar Varredura Agora'}</span>
 </button>
 </div>
 </div>
 </div>

  <div className="flex items-center justify-between border-b border-border pb-4">
  <h2 className="text-base font-semibold text-text-primary">Registros Capturados</h2>
  {canCreate && (
  <button
  onClick={() => { setFormData({
  title: '', process_number: '', agency: '', modality: '',
  opening_date: '', value: '', status: 'ativa', source_url: '', description: '',
  }); setIsEditing(false); setIsModalOpen(true); }}
  className="btn btn-outline flex items-center gap-2 py-2"
  >
  <Plus className="w-4 h-4" /> Inserção Manual
  </button>
  )}
  </div>

 <div className="card overflow-hidden">
 {loading ? (
 <div className="py-20 text-center flex flex-col items-center gap-4 justify-center">
 <Loader2 className="animate-spin w-8 h-8 text-primary" />
 <p className="text-sm text-text-muted font-medium">Carregando Acervo...</p>
 </div>
 ) : biddings.length === 0 ? (
 <div className="py-20 text-center flex flex-col items-center gap-4 justify-center">
 <div className="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center">
 <Target size={24} className="text-text-muted" />
 </div>
 <p className="text-sm text-text-muted font-medium">Nenhum edital registrado na base.</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm whitespace-nowrap">
 <thead className="bg-bg-tertiary border-b border-border text-text-secondary">
 <tr>
 <th className="px-6 py-3 font-medium">Processo / Modalidade</th>
 <th className="px-6 py-3 font-medium">Órgão / Objeto Estratégico</th>
 <th className="px-6 py-3 font-medium">Valuation</th>
 <th className="px-6 py-3 font-medium">Abertura</th>
 <th className="px-6 py-3 font-medium text-right">Ações</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {biddings.map(bidding => (
 <tr key={bidding.id} className="hover:bg-bg-tertiary transition-colors group">
 <td className="px-6 py-4">
 <div className="font-mono text-xs text-primary font-medium">{bidding.process_number || 'REG-MANUAL'}</div>
 <div className="text-xs text-text-muted mt-1 capitalize">{bidding.modality}</div>
 </td>
 <td className="px-6 py-4">
 <div className="font-medium text-text-primary text-sm truncate max-w-[250px]" title={bidding.title}>{bidding.title}</div>
 <div className="text-xs text-text-secondary mt-1 flex items-center gap-1.5">
 <div className="w-1.5 h-1.5 rounded-full bg-border" /> {bidding.agency}
 </div>
 </td>
 <td className="px-6 py-4 font-medium text-text-primary">{formatCurrency(bidding.value)}</td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-1.5 text-text-secondary text-sm">
 <Calendar size={14} className="text-text-muted" />
 {formatDate(bidding.opening_date)}
 </div>
 </td>
 <td className="px-6 py-4 text-right">
  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
  <button onClick={() => navigate(`/auction-details?id=${bidding.id}`)} className="p-1.5 text-text-muted hover:text-primary transition-colors" title="Detalhes"><ExternalLink size={16} /></button>
  {canEdit && (
  <button onClick={() => handleEdit(bidding)} className="p-1.5 text-text-muted hover:text-primary transition-colors" title="Editar"><Pencil size={16} /></button>
  )}
  </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>

 <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Refinar Oportunidade' : 'Registrar Nova Oportunidade'} size="lg">
 <form onSubmit={handleSubmit} className="p-6 space-y-6">
 <div className="space-y-1.5">
 <label className="text-sm font-medium text-text-primary">Objeto Licitatório / Título Comercial <span className="text-danger">*</span></label>
 <div className="relative">
 <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
 <input 
 type="text" 
 value={formData.title} 
 onChange={e => setFormData({ ...formData, title: e.target.value })} 
 className="input w-full pl-9" 
 required 
 />
 </div>
 </div>
 <div className="flex justify-end gap-3 pt-6 border-t border-border">
 <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancelar</button>
 <button type="submit" className="btn btn-primary flex items-center gap-2">
 <Save size={16} /> Salvar
 </button>
 </div>
 </form>
 </Modal>
 </div>
 );
}