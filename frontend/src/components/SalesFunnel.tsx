import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Sparkles, Loader2, FileWarning, Clock, FileText, Plus, Settings, Trash2, Edit2, MoreVertical, Lock, TrendingUp, DollarSign } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../lib/axios';
import { useWebSocket } from '../hooks/useWebSocket';

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

  // WebSocket hook for real-time updates
  const { sendMessage } = useWebSocket(
    import.meta.env.VITE_WS_URL || 'ws://localhost:8080',
    {
      onMessage: (data) => {
        if (data.type === 'opportunity.updated') {
          setOpportunities(prev => {
            const exists = prev.find(o => o.id === data.opportunity.id);
            if (exists) {
              return prev.map(o => o.id === data.opportunity.id ? { ...o, ...data.opportunity } : o);
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
      opp.id === oppId ? { ...opp, funnel_stage_id: newStageId } : opp
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
    <div className="p-8 h-screen w-full flex flex-col bg-background space-y-10 overflow-hidden animate-in fade-in duration-700">
      <Toaster position="top-right" />
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Pipeline <span className="text-gradient-gold">Comercial</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <Lock size={14} className="text-primary" />
            Fluxo comercial monitorado com inteligência de conversão Platinum.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => { setStageToEdit(null); setIsStageModalOpen(true); }}
            aria-label="Configurar novas etapas do funil"
            className="flex items-center gap-3 px-8 py-3 bg-surface-elevated/40 text-text-primary font-black rounded-xl border border-border-subtle hover:bg-surface-elevated transition-all text-[10px] uppercase tracking-widest shadow-platinum-glow-sm"
          >
            <Settings size={16} className="text-primary" />
            Fases
          </button>
          <button 
            onClick={() => handleCreateOpp()}
            aria-label="Criar nova oportunidade comercial"
            className="btn-primary py-3 px-8 shadow-platinum-glow"
          >
            <Plus size={16} />
            Novo Deal
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex gap-6 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="min-w-[320px] bg-surface-elevated/20 rounded-[2rem] p-6 space-y-6 animate-pulse border border-border-subtle/30">
              <div className="h-6 bg-surface-elevated/40 rounded-lg w-1/2" />
              <div className="h-32 bg-surface-elevated/40 rounded-2xl" />
              <div className="h-32 bg-surface-elevated/40 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-1 gap-6 overflow-x-auto pb-6 scrollbar-platinum">
            {stages.map(stage => (
              <Droppable key={stage.id} droppableId={stage.id.toString()}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-w-[340px] max-w-[340px] bg-surface-elevated/20 rounded-[2rem] p-5 flex flex-col border border-border-subtle transition-all duration-300 ${snapshot.isDraggingOver ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/20 shadow-platinum-glow' : ''}`}
                  >
                    {/* Stage Header */}
                    <div className="flex items-center justify-between mb-8 px-2 group">
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 rounded-full shadow-sm" style={{ backgroundColor: stage.color }}></div>
                        <h3 className="font-black text-text-primary text-[11px] tracking-[0.2em] uppercase">{stage.name}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-surface-elevated/60 text-text-muted text-[9px] px-2.5 py-1 rounded-lg font-black border border-border-subtle">
                          {opportunities.filter(opp => opp.funnel_stage_id === stage.id).length}
                        </span>
                        <div className="hidden group-hover:flex items-center gap-2">
                          <button onClick={() => handleEditStage(stage)} className="text-text-muted hover:text-primary p-1.5 hover:bg-surface-elevated rounded-lg transition-all" title="Editar">
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => handleDeleteStage(stage.id)} className="text-text-muted hover:text-red-400 p-1.5 hover:bg-red-400/5 rounded-lg transition-all" title="Excluir">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Opportunity Cards */}
                    <div className="flex-1 flex flex-col gap-5 overflow-y-auto min-h-[200px] scrollbar-hide px-1">
                      {opportunities.filter(opp => opp.funnel_stage_id === stage.id).map((opp, index) => (
                        <Draggable key={opp.id} draggableId={opp.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => handleEditOpp(opp)}
                              className={`bg-background/60 p-6 rounded-[1.5rem] border border-border-subtle hover:border-primary/40 hover:bg-surface-elevated transition-all cursor-pointer group/card shadow-sm ${snapshot.isDragging ? 'shadow-platinum-glow-lg rotate-1 z-50 bg-surface-elevated scale-105 border-primary/50' : ''} ${draggingId === opp.id ? 'opacity-40 grayscale' : ''}`}
                            >
                              <div className="space-y-5">
                                <div className="flex justify-between items-start gap-4">
                                  <p className="font-black text-text-primary text-xs leading-relaxed group-hover/card:text-primary transition-colors uppercase tracking-tight">{opp.title}</p>
                                  <MoreVertical size={14} className="text-text-muted opacity-0 group-hover/card:opacity-100 transition-opacity shrink-0" />
                                </div>

                                <div className="flex justify-between items-end pt-4 border-t border-border-subtle/50">
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] block">Potencial Base</span>
                                    <div className="flex items-center gap-1.5 text-text-primary font-black tracking-tighter text-sm">
                                      <DollarSign size={14} className="text-primary/60" />
                                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(opp.value))}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-md border uppercase tracking-widest ${opp.type === 'bidding' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                      {opp.type === 'bidding' ? 'Licitação' : 'Comercial'}
                                    </span>
                                    {opp.win_probability && (
                                      <div className="flex items-center gap-2">
                                        <div className="w-16 h-1.5 bg-surface-elevated/60 rounded-full overflow-hidden border border-border-subtle">
                                          <div className="h-full bg-secondary shadow-[0_0_8px_rgba(var(--color-secondary-rgb),0.4)]" style={{ width: opp.win_probability }}></div>
                                        </div>
                                        <span className="text-[10px] text-text-muted font-black">{opp.win_probability}</span>
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
                        aria-label={`Adicionar deal em ${stage.name}`}
                        className="mt-4 py-6 flex flex-col items-center justify-center gap-3 text-text-muted hover:text-primary hover:bg-primary/5 rounded-[1.5rem] border-2 border-dashed border-border-subtle hover:border-primary/40 transition-all group/new"
                      >
                        <Plus size={20} className="group-hover/new:scale-125 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em]">Integrar Deal</span>
                      </button>
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
            
            {/* New Stage Placeholder */}
            <div className="min-w-[340px] flex flex-col">
              <button 
                onClick={() => { setStageToEdit(null); setIsStageModalOpen(true); }}
                aria-label="Adicionar nova fase estratégica"
                className="w-full h-24 border-2 border-dashed border-border-subtle rounded-[2rem] flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all font-black gap-4 group/stage shadow-sm"
              >
                <div className="p-2 bg-surface-elevated rounded-xl group-hover/stage:bg-primary/10 transition-colors">
                  <Plus size={20} />
                </div>
                <span className="text-[10px] uppercase tracking-[0.3em]">Nova Fase Estratégica</span>
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
