import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Plus, Pencil, Trash2, X, Save, Loader2, FileText, Calendar, Target, Filter, Sparkles, AlertCircle, Lock, ShieldCheck, Zap, TrendingUp, DollarSign, Building2, ChevronRight } from 'lucide-react';
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
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Pipeline <span className="text-gradient-gold">Licitatório</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <ShieldCheck size={14} className="text-primary" />
            Fluxo estratégico de participação e conformidade jurídica.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          aria-label="Registrar nova licitação no pipeline"
          className="btn-primary py-4 px-10 shadow-platinum-glow flex items-center gap-3 uppercase text-[10px] tracking-widest"
        >
          <Plus className="w-5 h-5" />
          Novo Processo Platinum
        </button>
      </header>

      {loading ? (
        <div className="p-40 flex flex-col items-center justify-center gap-6">
          <Loader2 className="w-16 h-16 animate-spin text-primary opacity-40" />
          <p className="font-black uppercase tracking-[0.5em] text-[10px] text-text-muted animate-pulse">Orquestrando Pipeline Licitatório...</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-8 overflow-x-auto pb-10 scrollbar-platinum">
            {stages.map(stage => (
              <div key={stage.id} className="flex-shrink-0 w-96 flex flex-col gap-6">
                <div className="flex items-center justify-between px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shadow-platinum-glow-sm transition-all duration-500 group-hover:scale-125" style={{ backgroundColor: stage.color }} />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-primary opacity-80">{stage.name}</span>
                  </div>
                  <span className="text-[10px] font-black bg-surface-elevated/40 px-3 py-1 rounded-xl border border-border-subtle text-text-muted shadow-inner-platinum">
                    {getBiddingsByStage(stage.id).length}
                  </span>
                </div>

                <Droppable droppableId={String(stage.id)}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 rounded-[3rem] p-5 min-h-[700px] transition-all duration-500 border-2 overflow-y-auto scrollbar-platinum ${
                        snapshot.isDraggingOver 
                          ? 'bg-primary/5 border-primary/30 shadow-platinum-glow' 
                          : 'bg-surface-elevated/10 border-border-subtle/30 backdrop-blur-md'
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
                                className={`platinum-card p-6 group transition-all duration-500 relative overflow-hidden ${
                                  snapshot.isDragging 
                                    ? 'shadow-platinum-glow-lg border-primary/60 scale-105 bg-surface-elevated z-50' 
                                    : 'hover:border-primary/40 hover:translate-y-[-4px] bg-surface-elevated/20'
                                }`}
                              >
                                <div className="space-y-6 relative z-10">
                                  <div className="flex justify-between items-start gap-4">
                                    <h3 className={`font-black text-xs text-text-primary leading-relaxed uppercase tracking-tight transition-all duration-500 ${snapshot.isDragging ? 'text-primary' : 'group-hover:text-primary'} line-clamp-2`}>
                                      {bidding.title}
                                    </h3>
                                    <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                      <button onClick={() => handleEdit(bidding)} className="p-2.5 bg-surface-elevated/40 border border-border-subtle text-text-muted hover:text-primary hover:scale-110 rounded-xl transition-all shadow-platinum-glow-sm"><Pencil size={14} /></button>
                                      <button onClick={() => handleDelete(bidding.id)} className="p-2.5 bg-red-500/5 border border-red-500/10 text-text-muted hover:text-red-500 hover:scale-110 rounded-xl transition-all shadow-platinum-glow-sm"><Trash2 size={14} /></button>
                                    </div>
                                  </div>

                                  <div className="space-y-3 border-t border-border-subtle/20 pt-5">
                                    <div className="flex items-center gap-3 text-[10px] text-text-secondary uppercase tracking-widest font-black">
                                      <Building2 size={14} className="text-primary/60" />
                                      <span className="truncate">{bidding.agency}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-text-muted font-mono tracking-tighter font-black opacity-60">
                                      <Lock size={14} className="text-primary/40" />
                                      {bidding.process_number}
                                    </div>
                                  </div>

                                  <div className="flex justify-between items-center pt-3">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-sm font-black text-text-primary tracking-tighter group-hover:text-primary transition-colors">
                                        R$ {parseFloat(bidding.value || '0').toLocaleString('pt-BR')}
                                      </span>
                                      <span className="text-[8px] text-text-muted uppercase tracking-[0.3em] font-black opacity-40">Valuation Target</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      {bidding.win_probability !== undefined && (
                                        <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-xl border border-primary/20 text-[9px] font-black uppercase tracking-widest shadow-platinum-glow-sm">
                                          <TrendingUp size={12} />
                                          {bidding.win_probability}%
                                        </div>
                                      )}
                                      {bidding.parsed_items?.resumo && (
                                        <div className="group/ai relative">
                                          <div className="p-2 bg-secondary/10 text-secondary rounded-xl border border-secondary/20 animate-pulse cursor-help shadow-platinum-glow-sm">
                                            <Sparkles size={14} />
                                          </div>
                                          <div className="absolute bottom-full right-0 mb-6 w-85 p-8 bg-surface-elevated border border-border-medium rounded-[2.5rem] shadow-platinum-glow-lg opacity-0 group-hover/ai:opacity-100 pointer-events-none transition-all duration-500 z-50 transform translate-y-4 group-hover/ai:translate-y-0 backdrop-blur-2xl">
                                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-subtle/30">
                                              <Zap size={18} className="text-secondary" />
                                              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">Strategic Insights Platinum</span>
                                            </div>
                                            <p className="text-[11px] text-text-secondary leading-relaxed italic mb-8 font-medium border-l-2 border-secondary/30 pl-4">"{bidding.parsed_items.resumo}"</p>
                                            <div className="space-y-6">
                                              <div>
                                                <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-3 flex items-center gap-2"><FileText size={12} /> Documentação Exigida:</p>
                                                <p className="text-[10px] text-text-muted font-bold leading-relaxed opacity-80">{bidding.parsed_items.documentacao}</p>
                                              </div>
                                              <div>
                                                <p className="text-[9px] font-black text-red-500 uppercase tracking-[0.3em] mb-3 flex items-center gap-2"><AlertCircle size={12} /> Risco / Penalidades:</p>
                                                <p className="text-[10px] text-text-muted font-bold leading-relaxed opacity-80">{bidding.parsed_items.penalidades}</p>
                                              </div>
                                            </div>
                                            <div className="mt-8 pt-5 border-t border-border-subtle/30 text-right">
                                              <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.4em] opacity-30">AI Analysis Module v4.5</span>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'REFINAR PROCESSO LICITATÓRIO PLATINUM' : 'INTEGRAR NOVA LICITAÇÃO ESTRATÉGICA'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-10 p-2">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Objeto da Licitação *</label>
            <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-6 py-4 bg-background border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum" placeholder="Título completo do edital" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Número do Processo / Edital</label>
              <input type="text" value={formData.process_number} onChange={e => setFormData({ ...formData, process_number: e.target.value })} className="w-full px-6 py-4 bg-background border border-border-medium rounded-2xl text-sm font-black text-text-primary focus:border-primary/40 outline-none font-mono transition-all shadow-inner-platinum" placeholder="000/2024" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Órgão Licitante</label>
              <input type="text" value={formData.agency} onChange={e => setFormData({ ...formData, agency: e.target.value })} className="w-full px-6 py-4 bg-background border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum" placeholder="Prefeitura, Ministério, etc." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Modalidade Jurídica</label>
              <select value={formData.modality} onChange={e => setFormData({ ...formData, modality: e.target.value })} className="w-full px-6 py-4 bg-background border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all appearance-none cursor-pointer shadow-inner-platinum">
                <option value="" className="bg-surface font-bold text-text-primary">Selecione a Modalidade</option>
                <option value="pregão" className="bg-surface font-bold text-text-primary">Pregão Eletrônico</option>
                <option value="tomada_de_precos" className="bg-surface font-bold text-text-primary">Tomada de Preços</option>
                <option value="concurso" className="bg-surface font-bold text-text-primary">Concurso Público</option>
                <option value="convite" className="bg-surface font-bold text-text-primary">Convite</option>
                <option value="inexigibilidade" className="bg-surface font-bold text-text-primary">Inexigibilidade</option>
                <option value="dispensabilidade" className="bg-surface font-bold text-text-primary">Dispensa de Licitação</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Data de Disputa</label>
              <input type="datetime-local" value={formData.opening_date} onChange={e => setFormData({ ...formData, opening_date: e.target.value })} className="w-full px-6 py-4 bg-background border border-border-medium rounded-2xl text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Valuation Estimado (R$)</label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black text-sm">R$</div>
                <input type="number" step="0.01" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} className="w-full pl-16 pr-6 py-4 bg-background border border-border-medium rounded-2xl text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all font-mono shadow-inner-platinum" placeholder="0,00" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Estágio do Pipeline</label>
              <select value={formData.funnel_stage_id} onChange={e => setFormData({ ...formData, funnel_stage_id: parseInt(e.target.value) })} className="w-full px-6 py-4 bg-background border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all appearance-none cursor-pointer shadow-inner-platinum">
                {stages.map(stage => (
                  <option key={stage.id} value={stage.id} className="bg-surface font-bold text-text-primary">{stage.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Notas Estratégicas Platinum</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-6 py-4 bg-background border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all resize-none placeholder:text-text-muted/40 shadow-inner-platinum" rows={4} placeholder="Resumo do objeto, riscos identificados e observações técnicas..." />
          </div>

          <div className="flex justify-end gap-6 pt-10 border-t border-border-subtle/30">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-text-muted font-black hover:text-text-primary transition-all text-[10px] uppercase tracking-[0.3em]">Descartar</button>
            <button type="submit" className="btn-primary py-4 px-12 uppercase text-[10px] tracking-widest shadow-platinum-glow flex items-center gap-3">
               <Zap size={20} />
               {isEditing ? 'Atualizar Pipeline Master' : 'Confirmar Integração Platinum'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}