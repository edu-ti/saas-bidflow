import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Image as ImageIcon, BookOpen } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

type Parameter = {
  name: string;
  value: string;
};

type OpportunityItem = {
  id?: number;
  product_id?: number | null;
  description: string;
  manufacturer: string;
  image_path?: string | File | null;
  model: string;
  status: string;
  detailed_description: string;
  additional_parameters: Parameter[];
  quantity: number;
  unit_price: number;
  unit_measure: string;
  subtotal: number;
};

type OpportunityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialStageId?: number | null;
  opportunityToEdit?: any | null;
};

export default function OpportunityModal({ isOpen, onClose, onSaved, initialStageId, opportunityToEdit }: OpportunityModalProps) {
  const [title, setTitle] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [contactId, setContactId] = useState('');
  const [forwardTo, setForwardTo] = useState('');
  const [notes, setNotes] = useState('');
  
  const [items, setItems] = useState<OpportunityItem[]>([]);
  
  // State for current item being edited/added
  const [currentItem, setCurrentItem] = useState<OpportunityItem>(createEmptyItem());
  const [paramName, setParamName] = useState('');
  const [paramValue, setParamValue] = useState('');

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form
      setTitle('');
      setOrganizationId('');
      setContactId('');
      setForwardTo('');
      setNotes('');
      setItems([]);
      setCurrentItem(createEmptyItem());
      setParamName('');
      setParamValue('');
      
      // Fetch dropdown data
      api.get('/api/organizations').then(res => setOrganizations(res.data.data || res.data)).catch(console.error);
      api.get('/api/contacts').then(res => setContacts(res.data.data || res.data)).catch(console.error);

      if (opportunityToEdit) {
        setLoading(true);
        api.get(`/api/opportunities/${opportunityToEdit.id}`)
          .then(res => {
            const opp = res.data;
            setTitle(opp.title || '');
            setOrganizationId(opp.organization_id?.toString() || '');
            setContactId(opp.contact_id?.toString() || '');
            setForwardTo(opp.forward_to || '');
            setNotes(opp.notes || '');
            
            if (opp.items && opp.items.length > 0) {
              setItems(opp.items.map((it: any) => ({
                ...it,
                additional_parameters: it.additional_parameters || []
              })));
            }
          })
          .catch(err => {
            console.error(err);
            toast.error('Erro ao carregar detalhes da oportunidade.');
          })
          .finally(() => setLoading(false));
      }
    }
  }, [isOpen, opportunityToEdit]);

  function createEmptyItem(): OpportunityItem {
    return {
      description: '',
      manufacturer: '',
      model: '',
      status: 'Venda',
      detailed_description: '',
      additional_parameters: [],
      quantity: 1,
      unit_price: 0,
      unit_measure: 'Unidade',
      subtotal: 0,
      image_path: null
    };
  }

  const handleAddParameter = () => {
    if (!paramName || !paramValue) return;
    setCurrentItem(prev => ({
      ...prev,
      additional_parameters: [...prev.additional_parameters, { name: paramName, value: paramValue }]
    }));
    setParamName('');
    setParamValue('');
  };

  const handleRemoveParameter = (index: number) => {
    setCurrentItem(prev => ({
      ...prev,
      additional_parameters: prev.additional_parameters.filter((_, i) => i !== index)
    }));
  };

  const updateCurrentItem = (field: keyof OpportunityItem, value: any) => {
    setCurrentItem(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'quantity' || field === 'unit_price') {
        updated.subtotal = (Number(updated.quantity) || 0) * (Number(updated.unit_price) || 0);
      }
      return updated;
    });
  };

  const addItemToOpportunity = () => {
    if (!currentItem.description) {
      toast.error('A descrição do item é obrigatória.');
      return;
    }
    setItems([...items, currentItem]);
    setCurrentItem(createEmptyItem());
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalOpportunity = items.reduce((acc, item) => acc + item.subtotal, 0) + currentItem.subtotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // If current item is partially filled but not added to the list
    let finalItems = [...items];
    if (currentItem.description) {
      finalItems.push(currentItem);
    }

    try {
      // In a real scenario with images, we'd use FormData. Here we send JSON assuming basic implementation.
      const payload = {
        title,
        organization_id: organizationId || null,
        contact_id: contactId || null,
        forward_to: forwardTo || null,
        notes,
        funnel_stage_id: initialStageId || null,
        items: finalItems
      };

      if (opportunityToEdit) {
        await api.put(`/api/opportunities/${opportunityToEdit.id}`, payload);
        toast.success('Oportunidade atualizada com sucesso!');
      } else {
        await api.post('/api/opportunities', payload);
        toast.success('Oportunidade criada com sucesso!');
      }
      
      onSaved();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Erro ao salvar oportunidade.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!opportunityToEdit) return;
    if (!window.confirm('Tem certeza que deseja excluir esta oportunidade permanentemente?')) return;
    
    setLoading(true);
    try {
      await api.delete(`/api/opportunities/${opportunityToEdit.id}`);
      toast.success('Oportunidade excluída com sucesso!');
      onSaved();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error('Erro ao excluir oportunidade.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-slate-800">
            {opportunityToEdit ? 'Editar Oportunidade' : 'Criar Oportunidade'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="opp-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Cabeçalho */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-slate-100 pb-6">
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">Título*</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente (Organização ou PF)</label>
                <select
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Selecione...</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.trade_name || org.legal_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contato (apenas para Organização)</label>
                <select
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Selecione...</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Encaminhar para (Pré-Proposta)</label>
                <select
                  value={forwardTo}
                  onChange={(e) => setForwardTo(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Minha oportunidade</option>
                  <option value="Equipe Comercial">Equipe Comercial</option>
                  <option value="Diretoria">Diretoria</option>
                </select>
              </div>
            </div>

            {/* Itens Adicionados */}
            {items.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3">Itens Salvos ({items.length})</h3>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-3 rounded border border-slate-200">
                      <div>
                        <span className="font-medium">{item.description}</span>
                        <span className="text-slate-500 text-sm ml-2">{item.quantity} {item.unit_measure} x R$ {item.unit_price}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-slate-700">R$ {item.subtotal.toFixed(2)}</span>
                        <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Novo Item */}
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h3 className="font-bold text-lg text-slate-800 mb-4 border-b border-slate-200 pb-2">Novo Item da Oportunidade</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descrição*</label>
                  <input
                    type="text"
                    value={currentItem.description}
                    onChange={(e) => updateCurrentItem('description', e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fabricante</label>
                  <input
                    type="text"
                    value={currentItem.manufacturer}
                    onChange={(e) => updateCurrentItem('manufacturer', e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="row-span-2 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-2 bg-white">
                  <span className="text-xs text-slate-500 mb-1">Imagem</span>
                  <div className="w-16 h-16 bg-slate-100 flex items-center justify-center rounded mb-2">
                    <ImageIcon className="text-slate-400" size={24} />
                  </div>
                  <button type="button" className="text-xs bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded text-slate-700">
                    Escolher
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Modelo</label>
                  <input
                    type="text"
                    value={currentItem.model}
                    onChange={(e) => updateCurrentItem('model', e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={currentItem.status}
                    onChange={(e) => updateCurrentItem('status', e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 bg-white"
                  >
                    <option value="Venda">Venda</option>
                    <option value="Locação">Locação</option>
                    <option value="Serviço">Serviço</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição Detalhada</label>
                <textarea
                  value={currentItem.detailed_description}
                  onChange={(e) => updateCurrentItem('detailed_description', e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 min-h-[80px]"
                ></textarea>
              </div>

              {/* Parâmetros Adicionais */}
              <div className="mb-4 bg-white p-4 rounded-md border border-slate-200">
                <h4 className="text-sm font-bold text-slate-700 mb-2">Parâmetros Adicionais</h4>
                {currentItem.additional_parameters.length === 0 ? (
                  <p className="text-xs text-slate-400 italic mb-3">Nenhum parâmetro adicional.</p>
                ) : (
                  <div className="mb-3 space-y-2">
                    {currentItem.additional_parameters.map((param, idx) => (
                      <div key={idx} className="flex gap-2 items-center text-sm">
                        <span className="font-semibold bg-slate-100 px-2 py-1 rounded border border-slate-200">{param.name}</span>
                        <span>:</span>
                        <span className="bg-slate-50 px-2 py-1 rounded border border-slate-200 flex-1">{param.value}</span>
                        <button type="button" onClick={() => handleRemoveParameter(idx)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Nome do Parâmetro</label>
                    <input
                      type="text"
                      placeholder="Ex: DC"
                      value={paramName}
                      onChange={(e) => setParamName(e.target.value)}
                      className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Valor do Parâmetro</label>
                    <input
                      type="text"
                      placeholder="Ex: R$ 4.264,00 ou Cor Preta"
                      value={paramValue}
                      onChange={(e) => setParamValue(e.target.value)}
                      className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddParameter}
                    className="px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-md text-slate-700 text-sm hover:bg-slate-200"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Valores e Quantidades */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade*</label>
                  <input
                    type="number"
                    min="1"
                    value={currentItem.quantity}
                    onChange={(e) => updateCurrentItem('quantity', e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Unitário*</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentItem.unit_price}
                    onChange={(e) => updateCurrentItem('unit_price', e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unidade de Medida</label>
                  <input
                    type="text"
                    value={currentItem.unit_measure}
                    onChange={(e) => updateCurrentItem('unit_measure', e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subtotal</label>
                  <div className="w-full bg-slate-100 border border-slate-200 rounded-md px-3 py-2 font-semibold text-slate-700">
                    R$ {currentItem.subtotal.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button type="button" className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 shadow-sm rounded-md text-sm hover:bg-slate-50 text-slate-700">
                  <BookOpen size={16} /> Do Catálogo
                </button>
                <button type="button" className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 shadow-sm rounded-md text-sm hover:bg-slate-50 text-slate-700">
                  <Plus size={16} /> Manual
                </button>
                <div className="ml-auto">
                  <button 
                    type="button" 
                    onClick={addItemToOpportunity}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Adicionar Item à Lista
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center mb-6">
              <span className="text-xl font-bold text-slate-800">Total Oportunidade: R$ {totalOpportunity.toFixed(2)}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mensagem/Notas Gerais</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 min-h-[100px]"
              ></textarea>
            </div>
          </form>
        </div>

        <div className="flex justify-between items-center p-6 border-t border-slate-200 bg-slate-50 sticky bottom-0 z-10">
          <div>
            {opportunityToEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-md font-medium transition-colors"
              >
                Excluir Oportunidade
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="opp-form"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium shadow-sm"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
