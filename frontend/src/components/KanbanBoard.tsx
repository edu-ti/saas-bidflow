import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Sparkles, Loader2, FileWarning, Clock, FileText } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../lib/axios';

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
};

export default function KanbanBoard() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stages, setStages] = useState<FunnelStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<number | null>(null);

  // Fallback stages while API loads
  const defaultStages: FunnelStage[] = [
    { id: 1, name: 'Captado', color: '#3b82f6' },
    { id: 2, name: 'Análise Técnica', color: '#a855f7' },
    { id: 3, name: 'Proposta Enviada', color: '#f97316' },
    { id: 4, name: 'Homologado', color: '#22c55e' },
    { id: 5, name: 'Descartado', color: '#ef4444' },
  ];

  const fetchOpportunities = async (isPolling = false) => {
    try {
      const res = await api.get('/api/opportunities');
      const newData = res.data.data || res.data;
      
      setOpportunities(prev => {
        if (isPolling) {
          newData.forEach((newOpp: Opportunity) => {
            const oldOpp = prev.find(o => o.id === newOpp.id);
            if (oldOpp && !oldOpp.bidding_metadata && newOpp.bidding_metadata) {
              toast.success(`Novos insights de IA foram recebidos para a licitação: ${newOpp.title}`, {
                icon: '🤖',
                duration: 5000,
              });
            }
          });
        }
        return newData;
      });
      
    } catch (err) {
      if (!isPolling) {
        console.error("API Error", err);
        toast.error("Erro ao carregar oportunidades. Você está logado?");
      }
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  useEffect(() => {
    // Load stages from API once
    api.get('/api/funnel-stages')
      .then(res => setStages(res.data))
      .catch(() => setStages(defaultStages)); // fallback to defaults

    fetchOpportunities(false);
    const interval = setInterval(() => fetchOpportunities(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const oppId = parseInt(draggableId);
    const newStageId = parseInt(destination.droppableId);

    // Optimistic UI update
    const previousState = [...opportunities];
    setOpportunities(prev => prev.map(opp => 
      opp.id === oppId ? { ...opp, funnel_stage_id: newStageId } : opp
    ));

    try {
      setDraggingId(oppId);
      const res = await api.patch(`/api/opportunities/${oppId}/move`, {
        funnel_stage_id: newStageId
      });
      toast.success("Movido com sucesso!");
      
      // If contract auto created
      if (res.data.contract_auto_created) {
        toast.success("Contrato sugerido gerado automaticamente com status Ativo!", {
            icon: '📄'
        });
      }

    } catch (error) {
      console.error(error);
      toast.error("Falha ao mover. Revertendo...");
      setOpportunities(previousState);
    } finally {
      setDraggingId(null);
    }
  };

  const hasNewInsights = (meta: any) => {
    return meta && (meta.risco_edital || meta.data_limite_impugnacao || meta.exigencia_capital_social || meta.insights);
  };

  return (
    <div className="p-8 h-screen w-full flex flex-col bg-slate-50">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-6 text-slate-800">BidFlow Pipeline</h1>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-1 gap-6 overflow-x-auto pb-4">
            {(stages.length > 0 ? stages : defaultStages).map(stage => (
              <Droppable key={stage.id} droppableId={stage.id.toString()}>
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef} 
                    {...provided.droppableProps}
                    className={`min-w-[320px] max-w-[320px] bg-slate-100 rounded-lg p-4 flex flex-col shadow-sm border border-slate-200 transition-colors ${snapshot.isDraggingOver ? 'bg-slate-200' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-3 h-3 rounded-full block" style={{ backgroundColor: stage.color }}></span>
                      <h3 className="font-semibold text-slate-700">{stage.name}</h3>
                      <span className="ml-auto bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded-full font-medium">
                        {opportunities.filter(opp => opp.funnel_stage_id === stage.id).length}
                      </span>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
                      {opportunities.filter(opp => opp.funnel_stage_id === stage.id).map((opp, index) => (
                        <Draggable key={opp.id} draggableId={opp.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white p-4 rounded-md shadow-sm border border-slate-200 hover:shadow-md transition-all ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''} ${draggingId === opp.id ? 'opacity-50' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                  <p className="font-medium text-slate-800 text-sm leading-tight flex-1 pr-2">{opp.title}</p>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {opp.win_probability && (
                                      <div className="flex items-center" title={`${opp.win_probability}% Probabilidade de Vitória`}>
                                        <svg className="w-5 h-5 transform -rotate-90" viewBox="0 0 36 36">
                                          <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                          <path className={parseFloat(opp.win_probability) >= 70 ? "text-emerald-500" : parseFloat(opp.win_probability) >= 40 ? "text-amber-500" : "text-red-500"} strokeDasharray={`${parseFloat(opp.win_probability)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                        </svg>
                                        <span className="text-[9px] font-bold text-slate-600 ml-1">{Math.round(parseFloat(opp.win_probability))}%</span>
                                      </div>
                                    )}
                                    {hasNewInsights(opp.bidding_metadata) && (
                                      <span title="IA analisou este edital">
                                        <Sparkles size={16} className="text-yellow-500" />
                                      </span>
                                    )}
                                  </div>
                                </div>

                              {/* AI Badges Section */}
                              {opp.bidding_metadata && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {opp.bidding_metadata.risco_edital === 'Alto' && (
                                    <span className="flex items-center text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-semibold">
                                      <FileWarning size={10} className="mr-1" /> Alto Risco
                                    </span>
                                  )}
                                  {opp.bidding_metadata.data_limite_impugnacao && (
                                    <span className="flex items-center text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                                      <Clock size={10} className="mr-1" /> Impug: {opp.bidding_metadata.data_limite_impugnacao}
                                    </span>
                                  )}
                                  {opp.bidding_metadata.exigencia_capital_social && (
                                    <span className="flex items-center text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-semibold">
                                      <FileText size={10} className="mr-1" /> Cap. Social Exigido
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="flex justify-between items-center text-xs">
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium">
                                  {opp.type}
                                </span>
                                <span className="font-semibold text-emerald-600">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(opp.value))}
                                </span>
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
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}
