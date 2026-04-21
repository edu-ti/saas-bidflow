import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Sparkles, Loader2, FileWarning, Clock, FileText, Plus, Settings, Trash2, Edit2, MoreVertical } from 'lucide-react';
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
        // Fallback or seed initial stages
        setStages([
          { id: 1, name: 'Prospectando', color: '#3b82f6' },
          { id: 2, name: 'Proposta', color: '#a855f7' },
          { id: 3, name: 'Negociação', color: '#f59e0b' },
          { id: 4, name: 'Fechado', color: '#10b981' },
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
      if (!isPolling) {
        console.error("API Error", err);
      }
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
      toast.success("Oportunidade movida!");
    } catch (error) {
      console.error(error);
      toast.error("Falha ao mover. Revertendo...");
      setOpportunities(previousState);
    } finally {
      setDraggingId(null);
    }
  };

  const handleDeleteStage = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta etapa?')) return;
    try {
      await api.delete(`/api/funnel-stages/${id}`);
      toast.success('Etapa excluída!');
      fetchStages();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao excluir etapa.');
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
    <div className="p-6 h-screen w-full flex flex-col bg-slate-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Funil de Vendas</h1>
          <p className="text-slate-500 text-sm">Gerencie suas oportunidades de negócio em etapas customizáveis.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setStageToEdit(null);
              setIsStageModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium"
          >
            <Settings size={18} />
            Nova Etapa
          </button>
          <button 
            onClick={() => handleCreateOpp()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
          >
            <Plus size={18} />
            Criar Oportunidade
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
            {stages.map(stage => (
              <Droppable key={stage.id} droppableId={stage.id.toString()}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-w-[300px] max-w-[300px] bg-slate-100 rounded-xl p-3 flex flex-col shadow-sm border border-slate-200 transition-colors ${snapshot.isDraggingOver ? 'bg-slate-200' : ''}`}
                  >
                    {/* Column Header */}
                    <div className="flex items-center gap-2 mb-3 px-1 group">
                      <span className="w-3 h-3 rounded-full block flex-shrink-0" style={{ backgroundColor: stage.color }}></span>
                      <h3 className="font-semibold text-slate-800 truncate flex-1">{stage.name}</h3>
                      <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold">
                        {opportunities.filter(opp => opp.funnel_stage_id === stage.id).length}
                      </span>
                      
                      {/* Column Actions (visible on hover) */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button onClick={() => handleEditStage(stage)} className="text-slate-400 hover:text-blue-500 p-1" title="Editar Etapa">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDeleteStage(stage.id)} className="text-slate-400 hover:text-red-500 p-1" title="Excluir Etapa">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Draggable Items */}
                    <div className="flex-1 flex flex-col gap-2 overflow-y-auto min-h-[150px]">
                      {opportunities.filter(opp => opp.funnel_stage_id === stage.id).map((opp, index) => (
                        <Draggable key={opp.id} draggableId={opp.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => handleEditOpp(opp)}
                              className={`bg-white p-3.5 rounded-lg shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer ${snapshot.isDragging ? 'shadow-lg rotate-2 z-50' : ''} ${draggingId === opp.id ? 'opacity-50' : ''}`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-medium text-slate-800 text-sm leading-snug">{opp.title}</p>
                              </div>

                              <div className="flex justify-between items-center mt-3 text-xs">
                                <span className="px-2 py-1 bg-slate-50 border border-slate-100 text-slate-600 rounded-md font-medium">
                                  {opp.type || 'Nova'}
                                </span>
                                <span className="font-bold text-slate-700">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(opp.value))}
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {/* Add Opp Button at bottom of column */}
                      <button 
                        onClick={() => handleCreateOpp(stage.id)}
                        className="mt-2 py-2 flex items-center justify-center gap-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-md transition-colors text-sm font-medium w-full"
                      >
                        <Plus size={16} /> Adicionar
                      </button>
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
            
            {/* Add Column Placeholder */}
            <div className="min-w-[300px] max-w-[300px]">
              <button 
                onClick={() => {
                  setStageToEdit(null);
                  setIsStageModalOpen(true);
                }}
                className="w-full h-[50px] border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all font-medium gap-2"
              >
                <Plus size={20} /> Adicionar Etapa
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
