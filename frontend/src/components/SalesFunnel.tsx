import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Sparkles, Loader2, FileWarning, Clock, FileText, Plus, Settings, Trash2, Edit2, MoreVertical, Lock } from 'lucide-react';
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
    <div className="p-8 h-screen w-full flex flex-col bg-background space-y-8 overflow-hidden">
      <Toaster position="top-right" />
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Pipeline <span className="text-gradient-gold">Estratégico</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <Lock size={12} className="text-primary" />
            Fluxo comercial monitorado com inteligência de conversão Platinum.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setStageToEdit(null); setIsStageModalOpen(true); }}
            aria-label="Configurar novas etapas do funil"
            className="flex items-center gap-3 px-6 py-3 bg-surface-elevated/50 text-white font-bold rounded-xl border border-white/10 hover:bg-surface-elevated transition-all text-xs uppercase tracking-widest"
          >
            <Settings size={16} className="text-primary" />
            Fases
          </button>
          <button 
            onClick={() => handleCreateOpp()}
            aria-label="Criar nova oportunidade comercial"
            className="flex items-center gap-3 px-6 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow text-xs uppercase tracking-widest"
          >
            <Plus size={16} />
            Novo Deal
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex gap-6 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="min-w-[320px] bg-white/5 rounded-2xl p-4 space-y-4 animate-pulse">
              <div className="h-6 bg-white/5 rounded w-1/2" />
              <div className="h-24 bg-white/5 rounded-xl" />
              <div className="h-24 bg-white/5 rounded-xl" />
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
                    className={`min-w-[320px] max-w-[320px] bg-surface-elevated/30 rounded-2xl p-4 flex flex-col border border-white/5 transition-all ${snapshot.isDraggingOver ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/20 shadow-platinum-glow' : ''}`}
                  >
                    {/* Stage Header */}
                    <div className="flex items-center justify-between mb-6 px-1 group">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: stage.color }}></div>
                        <h3 className="font-bold text-white text-sm tracking-tight uppercase">{stage.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-white/5 text-text-muted text-[10px] px-2 py-0.5 rounded-md font-black">
                          {opportunities.filter(opp => opp.funnel_stage_id === stage.id).length}
                        </span>
                        <div className="hidden group-hover:flex items-center gap-1">
                          <button onClick={() => handleEditStage(stage)} className="text-text-muted hover:text-primary p-1 transition-colors" title="Editar">
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => handleDeleteStage(stage.id)} className="text-text-muted hover:text-red-400 p-1 transition-colors" title="Excluir">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Opportunity Cards */}
                    <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-h-[200px] scrollbar-hide">
                      {opportunities.filter(opp => opp.funnel_stage_id === stage.id).map((opp, index) => (
                        <Draggable key={opp.id} draggableId={opp.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => handleEditOpp(opp)}
                              className={`bg-background/40 p-5 rounded-xl border border-white/5 hover:border-primary/30 hover:bg-surface-elevated transition-all cursor-pointer group/card ${snapshot.isDragging ? 'shadow-2xl rotate-1 z-50 bg-surface-elevated scale-105 border-primary/50' : ''} ${draggingId === opp.id ? 'opacity-40 grayscale' : ''}`}
                            >
                              <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                  <p className="font-bold text-white text-sm leading-tight group-hover/card:text-primary transition-colors">{opp.title}</p>
                                  <MoreVertical size={14} className="text-text-muted opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                </div>

                                <div className="flex justify-between items-end">
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block">Potencial</span>
                                    <span className="text-white font-black tracking-tight">
                                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(opp.value))}
                                    </span>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                                      {opp.type === 'bidding' ? 'Licitação' : 'Comercial'}
                                    </span>
                                    {opp.win_probability && (
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                          <div className="h-full bg-secondary" style={{ width: opp.win_probability }}></div>
                                        </div>
                                        <span className="text-[10px] text-text-muted font-bold">{opp.win_probability}</span>
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
                        className="mt-2 py-4 flex items-center justify-center gap-2 text-text-muted hover:text-primary hover:bg-primary/5 rounded-xl border border-dashed border-white/5 hover:border-primary/30 transition-all text-[10px] font-black uppercase tracking-[0.2em]"
                      >
                        <Plus size={14} /> Novo Negócio
                      </button>
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
            
            {/* New Stage Placeholder */}
            <div className="min-w-[320px]">
              <button 
                onClick={() => { setStageToEdit(null); setIsStageModalOpen(true); }}
                aria-label="Adicionar nova fase estratégica"
                className="w-full h-16 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all font-black gap-3 text-xs uppercase tracking-widest"
              >
                <Plus size={18} /> Adicionar Fase
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
