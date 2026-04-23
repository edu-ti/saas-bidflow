import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Plus, Pencil, Trash2, X, Save, Loader2, FileText, Calendar, Target, Filter } from 'lucide-react';
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
}

interface FunnelStage {
  id: number;
  name: string;
  color: string;
  order: number;
}

const defaultStages = [
  { id: 1, name: 'Identificada', color: '#3b82f6', order: 1 },
  { id: 2, name: 'Análise', color: '#8b5cf6', order: 2 },
  { id: 3, name: 'Preparação', color: '#a855f7', order: 3 },
  { id: 4, name: 'Apresentação', color: '#f59e0b', order: 4 },
  { id: 5, name: 'Homologação', color: '#f97316', order: 5 },
  { id: 6, name: 'Recurso', color: '#eab308', order: 6 },
  { id: 7, name: 'Adjudicação', color: '#10b981', order: 7 },
  { id: 8, name: 'Perdida', color: '#ef4444', order: 8 },
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
      setBiddings(res.data.data || res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingId) {
        await api.put(`/api/opportunities/${editingId}`, { ...formData, type: 'bidding' });
        toast.success('Licitação atualizada!');
      } else {
        await api.post('/api/opportunities', { ...formData, type: 'bidding' });
        toast.success('Licitação criada!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(isEditing ? 'Erro ao atualizar' : 'Erro ao criar');
      console.error(error);
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
    if (!confirm('Eliminar esta licitação?')) return;
    try {
      await api.delete(`/api/opportunities/${id}`);
      toast.success('Licitação eliminada!');
      fetchData();
    } catch (error) {
      toast.error('Erro ao eliminar');
      console.error(error);
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

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
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
    } catch (error) {
      toast.error('Erro ao mover');
      fetchData();
    }
  };

  const getBiddingsByStage = (stageId: number) =>
    biddings.filter(b => b.funnel_stage_id === stageId);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Funil de Licitações</h1>
          <p className="text-sm text-slate-500">Gestão de oportunidades de licitações</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          NovaLicitação
        </button>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 p-8">A carregar...</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map(stage => (
              <div key={stage.id} className="flex-shrink-0 w-72">
                <div
                  className="px-4 py-3 rounded-t-lg font-semibold text-white text-sm"
                  style={{ backgroundColor: stage.color }}
                >
                  {stage.name} ({getBiddingsByStage(stage.id).length})
                </div>
                <Droppable droppableId={String(stage.id)}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="bg-slate-100 rounded-b-lg p-2 min-h-[500px]"
                    >
                      {getBiddingsByStage(stage.id).map((bidding, index) => (
                        <Draggable key={bidding.id} draggableId={String(bidding.id)} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white rounded-lg shadow-sm p-3 mb-2 cursor-grab hover:shadow-md transition-shadow"
                            >
                              <div className="font-medium text-sm text-slate-900">{bidding.title}</div>
                              <div className="text-xs text-slate-500 mt-1">
                                <div>{bidding.process_number}</div>
                                <div>{bidding.agency}</div>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-xs font-medium text-slate-600">
                                  R$ {parseFloat(bidding.value || '0').toLocaleString('pt-BR')}
                                </span>
                                <div className="flex gap-1">
                                  <button onClick={() => handleEdit(bidding)} className="p-1 text-slate-400 hover:text-blue-600">
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button onClick={() => handleDelete(bidding.id)} className="p-1 text-slate-400 hover:text-red-600">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Editar Licitação' : 'Nova Licitação'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Título *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              placeholder="Título da licitação"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Número do Processo</label>
              <input
                type="text"
                value={formData.process_number}
                onChange={e => setFormData({ ...formData, process_number: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
                placeholder="000/2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Órgão</label>
              <input
                type="text"
                value={formData.agency}
                onChange={e => setFormData({ ...formData, agency: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
                placeholder="Órgão executor"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Modalidade</label>
              <select
                value={formData.modality}
                onChange={e => setFormData({ ...formData, modality: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              >
                <option value="">Selecione</option>
                <option value="pregão">Pregão</option>
                <option value="tomada_de_precos">Tomada de Preços</option>
                <option value="concurso">Concurso</option>
                <option value="convite">Convite</option>
                <option value="inexigibilidade">Inexigibilidade</option>
                <option value="dispensabilidade">Dispensa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Data de Abertura</label>
              <input
                type="datetime-local"
                value={formData.opening_date}
                onChange={e => setFormData({ ...formData, opening_date: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Valor Estimado (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.value}
                onChange={e => setFormData({ ...formData, value: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Estágio</label>
              <select
                value={formData.funnel_stage_id}
                onChange={e => setFormData({ ...formData, funnel_stage_id: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              >
                {stages.map(stage => (
                  <option key={stage.id} value={stage.id}>{stage.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              rows={3}
              placeholder="Descrição da licitação"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm"
            >
              <X className="w-4 h-4 inline mr-2" />
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm"
            >
              <Save className="w-4 h-4 inline mr-2" />
              {isEditing ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}