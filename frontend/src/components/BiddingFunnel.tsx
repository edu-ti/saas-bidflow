import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Plus, Pencil, Trash2, X, Save, Loader2, FileText, Calendar, Target, Filter, Sparkles, AlertCircle, Lock, ShieldCheck, Zap, TrendingUp, DollarSign, Building2 } from 'lucide-react';
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
    <div className="p-8 w-full min-h-screen bg-background space-y-8 text-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Pipeline <span className="text-gradient-gold">Licitatório</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <ShieldCheck size={12} className="text-primary" />
            Fluxo estratégico de participação e conformidade jurídica.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          aria-label="Registrar nova licitação no pipeline"
          className="flex items-center gap-3 px-6 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow uppercase text-xs tracking-widest"
        >
          <Plus className="w-4 h-4" />
          Novo Processo
        </button>
      </header>

      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary opacity-40" />
          <p className="font-black uppercase tracking-[0.3em] text-[10px] text-text-muted">Orquestrando Pipeline...</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar">
            {stages.map(stage => (
              <div key={stage.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
                <div className="flex items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.3)]" style={{ backgroundColor: stage.color }} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">{stage.name}</span>
                  </div>
                  <span className="text-[10px] font-black bg-white/5 px-2 py-1 rounded border border-white/5 text-text-muted">
                    {getBiddingsByStage(stage.id).length}
                  </span>
                </div>

                <Droppable droppableId={String(stage.id)}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 rounded-[1.5rem] p-3 min-h-[600px] transition-colors border ${
                        snapshot.isDraggingOver ? 'bg-primary/5 border-primary/20' : 'bg-white/[0.01] border-white/5'
                      }`}
                    >
                      <div className="space-y-3">
                        {getBiddingsByStage(stage.id).map((bidding, index) => (
                          <Draggable key={bidding.id} draggableId={String(bidding.id)} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`platinum-card p-4 group transition-all ${
                                  snapshot.isDragging ? 'shadow-platinum-glow-lg border-primary/40 scale-105' : 'hover:border-white/20'
                                }`}
                              >
                                <div className="space-y-3">
                                  <div className="flex justify-between items-start gap-2">
                                    <h3 className="font-bold text-xs text-white leading-relaxed group-hover:text-primary transition-colors line-clamp-2">
                                      {bidding.title}
                                    </h3>
                                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => handleEdit(bidding)} className="p-1 text-text-muted hover:text-primary"><Pencil size={12} /></button>
                                      <button onClick={() => handleDelete(bidding.id)} className="p-1 text-text-muted hover:text-red-400"><Trash2 size={12} /></button>
                                    </div>
                                  </div>

                                  <div className="space-y-1.5 border-t border-white/5 pt-3">
                                    <div className="flex items-center gap-2 text-[9px] text-text-muted uppercase tracking-widest">
                                      <Building2 size={10} className="text-primary/60" />
                                      <span className="truncate">{bidding.agency}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] text-text-muted font-mono tracking-wider">
                                      <Lock size={10} className="text-primary/60" />
                                      {bidding.process_number}
                                    </div>
                                  </div>

                                  <div className="flex justify-between items-center pt-1">
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-black text-white">
                                        R$ {parseFloat(bidding.value || '0').toLocaleString('pt-BR')}
                                      </span>
                                      <span className="text-[8px] text-text-muted uppercase tracking-widest font-bold">Valuation Base</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {bidding.win_probability !== undefined && (
                                        <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-lg border border-primary/20 text-[9px] font-black uppercase tracking-widest">
                                          <TrendingUp size={10} />
                                          {bidding.win_probability}%
                                        </div>
                                      )}
                                      {bidding.parsed_items?.resumo && (
                                        <div className="group/ai relative">
                                          <div className="p-1.5 bg-secondary/10 text-secondary rounded-lg border border-secondary/20 animate-pulse">
                                            <Sparkles size={12} />
                                          </div>
                                          <div className="absolute bottom-full right-0 mb-4 w-72 p-6 bg-surface border border-white/10 rounded-2xl shadow-platinum-glow-lg opacity-0 group-hover/ai:opacity-100 pointer-events-none transition-all z-50 transform translate-y-2 group-hover/ai:translate-y-0">
                                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
                                              <Zap size={14} className="text-secondary" />
                                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Strategic Insights IA</span>
                                            </div>
                                            <p className="text-xs text-text-secondary leading-relaxed italic mb-4">"{bidding.parsed_items.resumo}"</p>
                                            <div className="space-y-3">
                                              <div>
                                                <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Documentação:</p>
                                                <p className="text-[10px] text-text-muted">{bidding.parsed_items.documentacao}</p>
                                              </div>
                                              <div>
                                                <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Risco / Penalidades:</p>
                                                <p className="text-[10px] text-text-muted">{bidding.parsed_items.penalidades}</p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'REFINAR PROCESSO LICITATÓRIO' : 'INTEGRAR NOVA LICITAÇÃO'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Objeto da Licitação *</label>
            <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white transition-all" placeholder="Título completo do edital" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Número do Processo / Edital</label>
              <input type="text" value={formData.process_number} onChange={e => setFormData({ ...formData, process_number: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white font-mono" placeholder="000/2024" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Órgão Licitante</label>
              <input type="text" value={formData.agency} onChange={e => setFormData({ ...formData, agency: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white" placeholder="Prefeitura, Ministério, etc." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Modalidade Jurídica</label>
              <select value={formData.modality} onChange={e => setFormData({ ...formData, modality: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white appearance-none">
                <option value="">Selecione</option>
                <option value="pregão">Pregão Eletrônico</option>
                <option value="tomada_de_precos">Tomada de Preços</option>
                <option value="concurso">Concurso</option>
                <option value="convite">Convite</option>
                <option value="inexigibilidade">Inexigibilidade</option>
                <option value="dispensabilidade">Dispensa</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Data de Disputa</label>
              <input type="datetime-local" value={formData.opening_date} onChange={e => setFormData({ ...formData, opening_date: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Valuation Estimado (R$)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold text-sm">R$</div>
                <input type="number" step="0.01" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white font-black" placeholder="0.00" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Estágio do Pipeline</label>
              <select value={formData.funnel_stage_id} onChange={e => setFormData({ ...formData, funnel_stage_id: parseInt(e.target.value) })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white appearance-none">
                {stages.map(stage => (
                  <option key={stage.id} value={stage.id}>{stage.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Notas Estratégicas</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white resize-none" rows={3} placeholder="Resumo do objeto e observações técnicas..." />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 text-text-muted font-bold hover:text-white transition-all text-xs uppercase tracking-widest">Descartar</button>
            <button type="submit" className="px-10 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow text-xs uppercase tracking-widest">{isEditing ? 'Atualizar Pipeline' : 'Confirmar Integração'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}