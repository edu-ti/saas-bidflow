import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Plus, Pencil, Trash2, X, Save, Loader2, FileText, Calendar, Target, Filter, Sparkles, AlertCircle, Lock, ShieldCheck, Zap, TrendingUp, DollarSign, Building2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import Modal from './ui/Modal';
import { DatePicker } from './ui/DatePicker';
import { Select } from './ui/Select';
import { format } from 'date-fns';

interface Bidding {
 id: number;
 title: string;
 process_number: string;
 agency: string;
 modality: string;
 opening_date: string;
 value: string;
 status: string;
 funnel_stage_id: number;
 description?: string;
 win_probability?: number;
 parsed_items?: {
 resumo?: string;
 documentacao?: string;
 penalidades?: string;
 };
}

interface FunnelStage {
 id: number;
 name: string;
 color: string;
 order: number;
}

const defaultStages = [
 { id: 1, name: 'Identificada', color: '#fbbf24', order: 1 }, // Amber Gold
 { id: 2, name: 'Análise Técnica', color: '#3b82f6', order: 2 }, // Blue
 { id: 3, name: 'Preparação', color: '#8b5cf6', order: 3 }, // Violet
 { id: 4, name: 'Apresentação', color: '#f59e0b', order: 4 }, // Amber
 { id: 5, name: 'Homologação', color: '#10b981', order: 5 }, // Emerald
 { id: 6, name: 'Recurso', color: '#f97316', order: 6 }, // Orange
 { id: 7, name: 'Adjudicação', color: '#0ea5e9', order: 7 }, // Sky
 { id: 8, name: 'Perdida', color: '#ef4444', order: 8 }, // Red
];

export default function BiddingFunnel() {
 const [biddings, setBiddings] = useState<Bidding[]>([]);
 const [stages, setStages] = useState<FunnelStage[]>(defaultStages);
 const [loading, setLoading] = useState(true);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [isEditing, setIsEditing] = useState(false);
 const [editingId, setEditingId] = useState<number | null>(null);
 const [formData, setFormData] = useState({
 title: '',
 process_number: '',
 agency: '',
 modality: '',
 opening_date: '',
 value: '',
 status: 'ativa',
 funnel_stage_id: 1,
 description: '',
 });

 useEffect(() => {
 fetchData();
 }, []);

 const fetchData = async () => {
 try {
 const res = await api.get('/api/opportunities?type=bidding');
 setBiddings(res.data.data || res.data || []);
 } catch (error) {
 toast.error('Erro na sincronização do pipeline');
 } finally {
 setLoading(false);
 }
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 try {
 if (isEditing && editingId) {
 await api.put(`/api/opportunities/${editingId}`, { ...formData, type: 'bidding' });
 toast.success('Pipeline atualizado!');
 } else {
 await api.post('/api/opportunities', { ...formData, type: 'bidding' });
 toast.success('Nova oportunidade integrada!');
 }
 setIsModalOpen(false);
 resetForm();
 fetchData();
 } catch (error) {
 toast.error('Falha na operação estratégica');
 }
 };

 const handleEdit = (bidding: Bidding) => {
 setFormData({
 title: bidding.title,
 process_number: bidding.process_number,
 agency: bidding.agency,
 modality: bidding.modality,
 opening_date: bidding.opening_date,
 value: bidding.value,
 status: bidding.status,
 funnel_stage_id: bidding.funnel_stage_id,
 description: bidding.description || '',
 });
 setEditingId(bidding.id);
 setIsEditing(true);
 setIsModalOpen(true);
 };

 const handleDelete = async (id: number) => {
 if (!confirm('Confirmar exclusão definitiva do processo?')) return;
 try {
 await api.delete(`/api/opportunities/${id}`);
 toast.success('Oportunidade removida.');
 fetchData();
 } catch (error) {
 toast.error('Falha na exclusão');
 }
 };

 const resetForm = () => {
 setFormData({
 title: '', process_number: '', agency: '', modality: '',
 opening_date: '', value: '', status: 'ativa', funnel_stage_id: 1, description: '',
 });
 setEditingId(null);
 setIsEditing(false);
 };

 const onDragEnd = async (result: DropResult) => {
 if (!result.destination) return;
 const { draggableId, destination } = result;
 const newStageId = parseInt(destination.droppableId);

 setBiddings(prev =>
 prev.map(b => b.id === parseInt(draggableId) ? { ...b, funnel_stage_id: newStageId } : b)
 );

 try {
 await api.patch(`/api/opportunities/${draggableId}/move`, { funnel_stage_id: newStageId });
 toast.success('Status sincronizado');
 } catch (error) {
 toast.error('Erro na movimentação');
 fetchData();
 }
 };

 const getBiddingsByStage = (stageId: number) =>
 biddings.filter(b => b.funnel_stage_id === stageId);

 return (
 <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
 <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
 <div className="space-y-1">
 <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
 Pipeline <span className="text-primary">Licitatório</span>
 </h1>
 <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
 <ShieldCheck size={14} className="text-primary" />
 Fluxo estratégico de participação e conformidade jurídica.
 </p>
 </div>
 <button
 onClick={() => { resetForm(); setIsModalOpen(true); }}
 aria-label="Registrar nova licitação no pipeline"
 className="btn btn-primary py-4 px-10 rounded-full flex items-center gap-3 uppercase text-xs tracking-widest"
 >
 <Plus className="w-5 h-5" />
 Novo Processo
 </button>
 </header>

 {loading ? (
 <div className="p-40 flex flex-col items-center justify-center gap-6">
 <Loader2 className="w-16 h-16 animate-spin text-primary opacity-40" />
 <p className="font-semibold uppercase text-xs text-text-muted animate-pulse">Orquestrando Pipeline Licitatório...</p>
 </div>
 ) : (
 <DragDropContext onDragEnd={onDragEnd}>
 <div className="flex gap-8 overflow-x-auto pb-10 ">
 {stages.map(stage => (
 <div key={stage.id} className="flex-shrink-0 w-96 flex flex-col gap-6">
 <div className="flex items-center justify-between px-6">
 <div className="flex items-center gap-3">
 <div className="w-2.5 h-2.5 rounded-full transition-all duration-500 group-hover:scale-125" style={{ backgroundColor: stage.color }} />
 <span className="text-xs font-semibold uppercase text-text-primary opacity-80">{stage.name}</span>
 </div>
 <span className="text-xs font-semibold bg-bg-tertiary/40 px-3 py-1 rounded-xl border border-border text-text-muted ">
 {getBiddingsByStage(stage.id).length}
 </span>
 </div>

 <Droppable droppableId={String(stage.id)}>
 {(provided, snapshot) => (
 <div
 {...provided.droppableProps}
 ref={provided.innerRef}
 className={`flex-1 rounded-2xl p-5 min-h-[700px] transition-all duration-500 border-2 overflow-y-auto ${
 snapshot.isDraggingOver 
 ? 'bg-primary/5 border-primary/30 ' 
 : 'bg-bg-tertiary border-border backdrop-blur-md'
 }`}
 >
 <div className="space-y-6">
 {getBiddingsByStage(stage.id).map((bidding, index) => (
 <Draggable key={bidding.id} draggableId={String(bidding.id)} index={index}>
 {(provided, snapshot) => (
 <div
 ref={provided.innerRef}
 {...provided.draggableProps}
 {...provided.dragHandleProps}
 className={`card p-6 group transition-all duration-500 relative overflow-hidden rounded-2xl ${
 snapshot.isDragging 
 ? ' border-primary/60 scale-105 bg-bg-secondary z-50' 
 : 'border border-border hover:border-primary/40 hover:translate-y-[-4px] bg-bg-secondary shadow-sm'
 }`}
 >
 <div className="space-y-6 relative z-10">
 <div className="flex justify-between items-start gap-4">
 <h3 className={`font-semibold text-xs text-text-primary leading-relaxed uppercase tracking-tight transition-all duration-500 ${snapshot.isDragging ? 'text-primary' : 'group-hover:text-primary'} line-clamp-2`}>
 {bidding.title}
 </h3>
 <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
 <button onClick={() => handleEdit(bidding)} className="p-2.5 bg-bg-tertiary/40 border border-border text-text-muted hover:text-primary hover:scale-110 rounded-xl transition-all "><Pencil size={14} /></button>
 <button onClick={() => handleDelete(bidding.id)} className="p-2.5 bg-red-500/5 border border-red-500/10 text-text-muted hover:text-red-500 hover:scale-110 rounded-xl transition-all "><Trash2 size={14} /></button>
 </div>
 </div>

 <div className="space-y-3 border-t border-border/20 pt-5">
 <div className="flex items-center gap-3 text-xs text-text-secondary uppercase tracking-widest font-semibold">
 <Building2 size={14} className="text-primary/60" />
 <span className="truncate">{bidding.agency}</span>
 </div>
 <div className="flex items-center gap-3 text-xs text-text-muted font-mono tracking-tight font-semibold opacity-60">
 <Lock size={14} className="text-primary/40" />
 {bidding.process_number}
 </div>
 </div>

 <div className="flex justify-between items-center pt-3">
 <div className="flex flex-col gap-1">
 <span className="text-sm font-semibold text-text-primary tracking-tight group-hover:text-primary transition-colors">
 R$ {parseFloat(bidding.value || '0').toLocaleString('pt-BR')}
 </span>
 <span className="text-xs text-text-muted uppercase tracking-widest font-semibold opacity-40">Valuation Target</span>
 </div>

 <div className="flex items-center gap-3">
 {bidding.win_probability !== undefined && (
 <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-xl border border-primary/20 text-xs font-semibold uppercase tracking-widest ">
 <TrendingUp size={12} />
 {bidding.win_probability}%
 </div>
 )}
 {bidding.parsed_items?.resumo && (
 <div className="group/ai relative">
 <div className="p-2 bg-secondary/10 text-secondary rounded-xl border border-secondary/20 animate-pulse cursor-help ">
 <Sparkles size={14} />
 </div>
 <div className="absolute bottom-full right-0 mb-6 w-85 p-8 bg-bg-tertiary border border-border rounded-xl opacity-0 group-hover/ai:opacity-100 pointer-events-none transition-all duration-500 z-50 transform translate-y-4 group-hover/ai:translate-y-0 backdrop-blur-2xl">
 <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/30">
 <Zap size={18} className="text-secondary" />
 <span className="text-xs font-semibold uppercase text-secondary">Insights</span>
 </div>
 <p className="text-sm text-text-secondary leading-relaxed italic mb-8 font-medium border-l-2 border-secondary/30 pl-4">"{bidding.parsed_items.resumo}"</p>
 <div className="space-y-6">
 <div>
 <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 flex items-center gap-2"><FileText size={12} /> Documentação Exigida:</p>
 <p className="text-xs text-text-muted font-bold leading-relaxed opacity-80">{bidding.parsed_items.documentacao}</p>
 </div>
 <div>
 <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2"><AlertCircle size={12} /> Risco / Penalidades:</p>
 <p className="text-xs text-text-muted font-bold leading-relaxed opacity-80">{bidding.parsed_items.penalidades}</p>
 </div>
 </div>
 <div className="mt-8 pt-5 border-t border-border/30 text-right">
 <span className="text-xs font-semibold text-text-muted uppercase opacity-30">AI Analysis Module v4.5</span>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
 </div>
 )}
 </Draggable>
 ))}
 {provided.placeholder}
 </div>
 </div>
 )}
 </Droppable>
 </div>
 ))}
 </div>
 </DragDropContext>
 )}

 <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Editar Licitação' : 'Nova Licitação'} size="lg">
 <form onSubmit={handleSubmit} className="space-y-10 p-2">
 <div className="space-y-3">
 <label className="text-xs font-semibold text-text-muted uppercase tracking-widest px-1">Objeto da Licitação *</label>
 <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-6 py-4 bg-background border border-border rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 " placeholder="Título completo do edital" required />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
 <div className="space-y-3">
 <label className="text-xs font-semibold text-text-muted uppercase tracking-widest px-1">Número do Processo / Edital</label>
 <input type="text" value={formData.process_number} onChange={e => setFormData({ ...formData, process_number: e.target.value })} className="w-full px-6 py-4 bg-background border border-border rounded-2xl text-sm font-semibold text-text-primary focus:border-primary/40 outline-none font-mono transition-all " placeholder="000/2024" />
 </div>
 <div className="space-y-3">
 <label className="text-xs font-semibold text-text-muted uppercase tracking-widest px-1">Órgão Licitante</label>
 <input type="text" value={formData.agency} onChange={e => setFormData({ ...formData, agency: e.target.value })} className="w-full px-6 py-4 bg-background border border-border rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all " placeholder="Prefeitura, Ministério, etc." />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
 <div className="space-y-3">
 <label className="text-xs font-semibold text-text-muted uppercase tracking-widest px-1">Modalidade Jurídica</label>
 <Select
 value={formData.modality}
 onChange={v => setFormData({ ...formData, modality: v })}
 options={[
 { value: 'pregão', label: 'Pregão Eletrônico' },
 { value: 'tomada_de_precos', label: 'Tomada de Preços' },
 { value: 'concurso', label: 'Concurso Público' },
 { value: 'convite', label: 'Convite' },
 { value: 'inexigibilidade', label: 'Inexigibilidade' },
 { value: 'dispensabilidade', label: 'Dispensa de Licitação' }
 ]}
 />
 </div>
 <div className="space-y-3">
 <label className="text-xs font-semibold text-text-muted uppercase tracking-widest px-1">Data de Disputa</label>
 <DatePicker
 selected={formData.opening_date ? new Date(formData.opening_date) : null}
 onChange={date => setFormData({ ...formData, opening_date: date ? format(date, "yyyy-MM-dd'T'HH:mm") : '' })}
 showTimeSelect
 placeholderText="dd/mm/aaaa --:--"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
 <div className="space-y-3">
 <label className="text-xs font-semibold text-text-muted uppercase tracking-widest px-1">Valuation Estimado (R$)</label>
 <div className="relative">
 <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-semibold text-sm">R$</div>
 <input type="number" step="0.01" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} className="w-full pl-16 pr-6 py-4 bg-background border border-border rounded-2xl text-sm font-semibold text-text-primary focus:border-primary/40 outline-none transition-all font-mono " placeholder="0,00" />
 </div>
 </div>
 <div className="space-y-3">
 <label className="text-xs font-semibold text-text-muted uppercase tracking-widest px-1">Estágio do Pipeline</label>
 <Select
 value={String(formData.funnel_stage_id)}
 onChange={v => setFormData({ ...formData, funnel_stage_id: parseInt(v) })}
 options={stages.map(stage => ({ value: String(stage.id), label: stage.name }))}
 />
 </div>
 </div>

 <div className="space-y-3">
 <label className="text-xs font-semibold text-text-muted uppercase tracking-widest px-1">Notas</label>
 <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-6 py-4 bg-background border border-border rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all resize-none placeholder:text-text-muted/40 " rows={4} placeholder="Resumo do objeto, riscos identificados e observações técnicas..." />
 </div>

 <div className="flex justify-end gap-6 pt-10 border-t border-border/30">
 <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-text-muted font-semibold hover:text-text-primary transition-all text-xs uppercase tracking-widest">Descartar</button>
 <button type="submit" className="btn btn-primary py-4 px-12 uppercase text-xs tracking-widest flex items-center gap-3">
 <Zap size={20} />
 {isEditing ? 'Atualizar Pipeline Master' : 'Salvar'}
 </button>
 </div>
 </form>
 </Modal>
 </div>
 );
}