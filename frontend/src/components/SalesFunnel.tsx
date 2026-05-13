import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Sparkles, Loader2, FileWarning, Clock, FileText, Plus, Settings, Trash2, Edit2, MoreVertical, Lock, TrendingUp, DollarSign } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../lib/axios';
import { useWebSocket } from '../hooks/useWebSocket';
import { usePermissions } from '../hooks/usePermissions';

// Modals
import StageModal from './ui/StageModal';
import OpportunityModal from './ui/OpportunityModal';

type Opportunity = {
 id: number;
 title: string;
 type: string;
 value: string;
 funnel_stage_id: number | null;
 win_probability?: string;
 bidding_metadata?: any;
};

type FunnelStage = {
 id: number;
 name: string;
 color: string;
 order?: number;
};

export default function SalesFunnel() {
 const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
 const [stages, setStages] = useState<FunnelStage[]>([]);
 const [loading, setLoading] = useState(true);
 const [draggingId, setDraggingId] = useState<number | null>(null);
 const [usePollingFallback, setUsePollingFallback] = useState(true);

 // Modal States
 const [isStageModalOpen, setIsStageModalOpen] = useState(false);
 const [isOppModalOpen, setIsOppModalOpen] = useState(false);
 const [stageToEdit, setStageToEdit] = useState<FunnelStage | null>(null);
 const [initialStageForOpp, setInitialStageForOpp] = useState<number | null>(null);
  const [oppToEdit, setOppToEdit] = useState<Opportunity | null>(null);

  const { hasPermission } = usePermissions();
  const canDeleteStage = hasPermission('commercial', 'sales-funnel', 'delete');

  // WebSocket hook for real-time updates
 const { sendMessage } = useWebSocket(
 import.meta.env.VITE_WS_URL || 'ws://localhost:8080',
 {
 onMessage: (data) => {
 if (data.type === 'opportunity.updated') {
 setOpportunities(prev => {
 const exists = prev.find(o => o.id === data.opportunity.id);
 if (exists) {
 return prev.map(o => o.id === data.opportunity.id ? {...o,...data.opportunity } : o);
 }
 return [...prev, data.opportunity];
 });
 }
 },
 onConnect: () => {
 setUsePollingFallback(false);
 },
 onError: () => {
 setUsePollingFallback(true);
 },
 autoReconnect: true,
 reconnectInterval: 5000,
 }
 );

 const fetchStages = async () => {
 try {
 const res = await api.get('/api/funnel-stages');
 if (res.data && res.data.length > 0) {
 setStages(res.data);
 } else {
 setStages([
 { id: 1, name: 'Prospectando', color: '#fbbf24' },
 { id: 2, name: 'Proposta', color: '#fcd34d' },
 { id: 3, name: 'Negociação', color: '#10b981' },
 { id: 4, name: 'Fechado', color: '#3b82f6' },
 { id: 5, name: 'Controle de Entrega', color: '#6366f1' },
 { id: 6, name: 'Treinamentos', color: '#8b5cf6' },
 { id: 7, name: 'Pós-venda', color: '#ec4899' },
 { id: 8, name: 'Recusado', color: '#ef4444' }
 ]);
 }
 } catch (err) {
 console.error(err);
 }
 };

 const fetchOpportunities = async (isPolling = false) => {
 try {
 const res = await api.get('/api/opportunities');
 const newData = res.data.data || res.data;
 setOpportunities(newData);
 } catch (err) {
 if (!isPolling) console.error("API Error", err);
 } finally {
 if (!isPolling) setLoading(false);
 }
 };

 useEffect(() => {
 fetchStages();
 fetchOpportunities(false);

 if (usePollingFallback) {
 const interval = setInterval(() => fetchOpportunities(true), 15000);
 return () => clearInterval(interval);
 }
 }, [usePollingFallback]);

 const onDragEnd = async (result: DropResult) => {
 const { source, destination, draggableId } = result;

 if (!destination) return;
 if (source.droppableId === destination.droppableId) return;

 const oppId = parseInt(draggableId);
 const newStageId = parseInt(destination.droppableId);

 const previousState = [...opportunities];
 setOpportunities(prev => prev.map(opp =>
 opp.id === oppId ? {...opp, funnel_stage_id: newStageId } : opp
 ));

 try {
 setDraggingId(oppId);
 await api.patch(`/api/opportunities/${oppId}/move`, {
 funnel_stage_id: newStageId
 });
 toast.success("Pipeline atualizado com sucesso!");
 } catch (error) {
 toast.error("Erro na sincronização. Revertendo...");
 setOpportunities(previousState);
 } finally {
 setDraggingId(null);
 }
 };

 const handleDeleteStage = async (id: number) => {
 if (!window.confirm('Excluir esta etapa estratégica?')) return;
 try {
 await api.delete(`/api/funnel-stages/${id}`);
 toast.success('Fase removida.');
 fetchStages();
 } catch (err: any) {
 toast.error(err.response?.data?.message || 'Erro ao remover fase.');
 }
 };

 const handleEditStage = (stage: FunnelStage) => {
 setStageToEdit(stage);
 setIsStageModalOpen(true);
 };

 const handleCreateOpp = (stageId?: number) => {
 setOppToEdit(null);
 setInitialStageForOpp(stageId || null);
 setIsOppModalOpen(true);
 };

 const handleEditOpp = (opp: Opportunity) => {
 setOppToEdit(opp);
 setIsOppModalOpen(true);
 };

 return (
 <div className="h-screen w-full flex flex-col space-y-8 animate-fade-in pb-8">
 <Toaster position="top-right" />
 
 <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 px-8 pt-8">
 <div>
 <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
 Pipeline Comercial
 </h1>
 <p className="text-text-secondary text-sm mt-1">
 Fluxo comercial monitorado com inteligência de conversão.
 </p>
 </div>
 <div className="flex gap-3">
 <button 
 onClick={() => { setStageToEdit(null); setIsStageModalOpen(true); }}
 className="btn btn-outline flex items-center gap-2"
 >
 <Settings size={16} />
 <span>Fases</span>
 </button>
 <button 
 onClick={() => handleCreateOpp()}
 className="btn btn-primary flex items-center gap-2"
 >
 <Plus size={16} />
 <span>Novo Deal</span>
 </button>
 </div>
 </header>

 {loading ? (
 <div className="flex-1 flex gap-4 overflow-hidden px-8">
 {[1, 2, 3, 4].map(i => (
 <div key={i} className="min-w-[320px] bg-bg-tertiary rounded-xl p-4 space-y-4 animate-pulse border border-border">
 <div className="h-5 bg-bg-secondary rounded w-1/2" />
 <div className="h-24 bg-bg-secondary rounded-lg" />
 <div className="h-24 bg-bg-secondary rounded-lg" />
 </div>
 ))}
 </div>
 ) : (
 <DragDropContext onDragEnd={onDragEnd}>
 <div className="flex flex-1 gap-4 overflow-x-auto pb-4 px-8 scrollbar-hide">
 {stages.map(stage => (
 <Droppable key={stage.id} droppableId={stage.id.toString()}>
 {(provided, snapshot) => (
 <div
 ref={provided.innerRef}
 {...provided.droppableProps}
 className={`min-w-[320px] max-w-[320px] bg-bg-tertiary rounded-xl p-4 flex flex-col border transition-colors duration-200 ${snapshot.isDraggingOver ? 'border-primary bg-primary/5' : 'border-border'}`}
 >
 {/* Stage Header */}
 <div className="flex items-center justify-between mb-4 px-1 group">
 <div className="flex items-center gap-2.5">
 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }}></div>
 <h3 className="font-semibold text-text-primary text-sm tracking-tight">{stage.name}</h3>
 </div>
 <div className="flex items-center gap-2">
 <span className="bg-bg-tertiary text-text-muted text-xs px-2 py-0.5 rounded font-medium border border-border">
 {opportunities.filter(opp => opp.funnel_stage_id === stage.id).length}
 </span>
  <div className="hidden group-hover:flex items-center gap-1">
  <button onClick={() => handleEditStage(stage)} className="text-text-muted hover:text-primary p-1 hover:bg-bg-tertiary rounded transition-colors" title="Editar">
  <Edit2 size={12} />
  </button>
  {canDeleteStage && (
  <button onClick={() => handleDeleteStage(stage.id)} className="text-text-muted hover:text-danger p-1 hover:bg-danger/10 rounded transition-colors" title="Excluir">
  <Trash2 size={12} />
  </button>
  )}
  </div>
 </div>
 </div>

 {/* Opportunity Cards */}
 <div className="flex-1 flex flex-col gap-3 overflow-y-auto min-h-[150px] scrollbar-hide">
 {opportunities.filter(opp => opp.funnel_stage_id === stage.id).map((opp, index) => (
 <Draggable key={opp.id} draggableId={opp.id.toString()} index={index}>
 {(provided, snapshot) => (
 <div
 ref={provided.innerRef}
 {...provided.draggableProps}
 {...provided.dragHandleProps}
 onClick={() => handleEditOpp(opp)}
 className={`bg-bg-secondary p-4 rounded-lg border hover:border-primary/40 transition-colors cursor-pointer group/card shadow-sm ${snapshot.isDragging ? 'border-primary shadow-md rotate-1 z-50 scale-105' : 'border-border'} ${draggingId === opp.id ? 'opacity-50' : ''}`}
 >
 <div className="space-y-3">
 <div className="flex justify-between items-start gap-3">
 <p className="font-medium text-text-primary text-sm leading-snug group-hover/card:text-primary transition-colors">{opp.title}</p>
 <MoreVertical size={14} className="text-text-muted opacity-0 group-hover/card:opacity-100 transition-opacity shrink-0" />
 </div>

 <div className="flex justify-between items-end pt-3 border-t border-border">
 <div className="space-y-0.5">
 <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">Valor</span>
 <div className="flex items-center gap-1 text-text-primary font-semibold text-xs">
 <DollarSign size={12} className="text-text-muted" />
 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(opp.value))}
 </div>
 </div>
 <div className="flex flex-col items-end gap-1.5">
 <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border uppercase ${opp.type === 'bidding' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
 {opp.type === 'bidding' ? 'Licitação' : 'Comercial'}
 </span>
 {opp.win_probability && (
 <div className="flex items-center gap-1.5">
 <div className="w-12 h-1 bg-bg-tertiary rounded-full overflow-hidden border border-border">
 <div className="h-full bg-secondary" style={{ width: opp.win_probability }}></div>
 </div>
 <span className="text-xs text-text-muted font-medium">{opp.win_probability}</span>
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
 
 <button 
 onClick={() => handleCreateOpp(stage.id)}
 className="mt-2 py-3 flex flex-row items-center justify-center gap-2 text-text-secondary hover:text-primary hover:bg-bg-tertiary rounded-lg border border-dashed border-border hover:border-primary/30 transition-colors"
 >
 <Plus size={14} />
 <span className="text-xs font-medium">Novo Deal</span>
 </button>
 </div>
 </div>
 )}
 </Droppable>
 ))}
 
 {/* New Stage Placeholder */}
 <div className="min-w-[320px] flex flex-col">
 <button 
 onClick={() => { setStageToEdit(null); setIsStageModalOpen(true); }}
 className="w-full h-16 border border-dashed border-border rounded-xl flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/30 hover:bg-bg-secondary transition-colors gap-2"
 >
 <Plus size={16} />
 <span className="text-sm font-medium">Nova Fase Estratégica</span>
 </button>
 </div>
 </div>
 </DragDropContext>
 )}

 <StageModal
 isOpen={isStageModalOpen}
 onClose={() => setIsStageModalOpen(false)}
 onSaved={fetchStages}
 stageToEdit={stageToEdit}
 />

 <OpportunityModal
 isOpen={isOppModalOpen}
 onClose={() => {
 setIsOppModalOpen(false);
 setOppToEdit(null);
 }}
 onSaved={fetchOpportunities}
 initialStageId={initialStageForOpp}
 opportunityToEdit={oppToEdit}
 />
 </div>
 );
}
