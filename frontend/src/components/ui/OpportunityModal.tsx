import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, BookOpen, List, Settings, Save, Loader2, Sparkles, ShieldCheck, Zap, Activity, Check, AlignLeft } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { Modal, ConfirmDialog } from './Modal';
import { Select } from './Select';

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
  
  const [currentItem, setCurrentItem] = useState<OpportunityItem>(createEmptyItem());
  const [paramName, setParamName] = useState('');
  const [paramValue, setParamValue] = useState('');

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setOrganizationId('');
      setContactId('');
      setForwardTo('');
      setNotes('');
      setItems([]);
      setCurrentItem(createEmptyItem());
      setParamName('');
      setParamValue('');
      
      api.get('/api/organizations').then(res => setOrganizations(res.data.data || res.data)).catch(console.error);
      api.get('/api/contacts').then(res => setContacts(res.data.data || res.data)).catch(console.error);

      if (opportunityToEdit) {
        setLoading(true);
        api.get(`/api/opportunities/${opportunityToEdit.id}`)
          .then(res => {
            const opp = res.data.data || res.data;
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

    let finalItems = [...items];
    if (currentItem.description) {
      finalItems.push(currentItem);
    }

    try {
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
        toast.success('Oportunidade atualizada!');
      } else {
        await api.post('/api/opportunities', payload);
        toast.success('Nova oportunidade consolidada!');
      }
      
      onSaved();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Erro operacional ao salvar deal.');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirm = () => {
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!opportunityToEdit) return;
    setLoading(true);
    try {
      await api.delete(`/api/opportunities/${opportunityToEdit.id}`);
      toast.success('Oportunidade arquivada com sucesso.');
      onSaved();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error('Erro na deleção do registro.');
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={opportunityToEdit ? 'Editar Oportunidade' : 'Nova Oportunidade'}
      description="Consolidação de negócio com dados estratégicos"
      size="full"
    >
      <form id="opp-form" onSubmit={handleSubmit} className="space-y-6 p-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-sm font-medium text-text-primary flex items-center gap-2">
              <Activity size={14} className="text-primary" />
              Título do Projeto *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Ex: Expansão de Infraestrutura Network"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Cliente</label>
            <Select
              value={organizationId}
              onChange={(v) => setOrganizationId(v)}
              options={[
                { value: '', label: 'Selecione o Cliente...' },
                ...organizations.map(org => ({ value: org.id.toString(), label: org.trade_name || org.legal_name }))
              ]}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Contato</label>
            <Select
              value={contactId}
              onChange={(v) => setContactId(v)}
              options={[
                { value: '', label: 'Vincular Contato...' },
                ...contacts.map(c => ({ value: c.id.toString(), label: c.name }))
              ]}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Atendimento</label>
            <Select
              value={forwardTo}
              onChange={(v) => setForwardTo(v)}
              options={[
                { value: '', label: 'Minha oportunidade' },
                { value: 'Equipe Comercial', label: 'Equipe Comercial' },
                { value: 'Diretoria', label: 'Diretoria' }
              ]}
            />
          </div>
        </div>

        {items.length > 0 && (
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-bg-tertiary/30">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <List size={16} className="text-primary" />
                Itens Consolidados ({items.length})
              </h3>
              <span className="badge badge-success text-xs">Validado</span>
            </div>
            <div className="divide-y divide-border">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center px-6 py-4 hover:bg-bg-tertiary/50 transition-colors">
                  <div>
                    <div className="font-medium text-sm text-text-primary">{item.description}</div>
                    <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                      <span className="badge badge-default">{item.quantity} {item.unit_measure}</span>
                      <span>{item.unit_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} unit.</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-semibold text-text-primary">{item.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    <button type="button" onClick={() => removeItem(idx)} className="btn btn-ghost p-2 text-red-500 hover:bg-red-500/10">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Plus size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Adicionar Item</h3>
              <p className="text-xs text-text-muted">Configuração do item da proposta</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Descrição Técnica *</label>
              <input
                type="text"
                value={currentItem.description}
                onChange={(e) => updateCurrentItem('description', e.target.value)}
                className="input"
                placeholder="Ex: Switch Core 48 Portas PoE L3"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Fabricante</label>
              <input
                type="text"
                value={currentItem.manufacturer}
                onChange={(e) => updateCurrentItem('manufacturer', e.target.value)}
                className="input"
                placeholder="Global Vendor"
              />
            </div>
            <div className="row-span-2 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/40 transition-colors">
              <ImageIcon className="text-text-muted/50 mb-3" size={32} />
              <span className="text-xs text-text-muted font-medium mb-2">Imagem do Item</span>
              <button type="button" className="btn btn-outline text-xs">Carregar</button>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Modelo / Part Number</label>
              <input
                type="text"
                value={currentItem.model}
                onChange={(e) => updateCurrentItem('model', e.target.value)}
                className="input font-mono"
                placeholder="PN-XXXXX"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Modalidade</label>
              <Select
                value={currentItem.status}
                onChange={(v) => updateCurrentItem('status', v)}
                options={[
                  { value: 'Venda', label: 'Venda Direta' },
                  { value: 'Locação', label: 'Locação / HaaS' },
                  { value: 'Serviço', label: 'Serviço Profissional' }
                ]}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Especificações Técnicas (SOW)</label>
            <textarea
              value={currentItem.detailed_description}
              onChange={(e) => updateCurrentItem('detailed_description', e.target.value)}
              className="input resize-none min-h-[100px]"
              placeholder="Detalhamento técnico avançado para composição da proposta..."
            ></textarea>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Settings size={16} className="text-primary" />
              Atributos Paramétricos
            </h4>
            <div className="bg-bg-tertiary/50 border border-border rounded-xl p-4 space-y-4">
              {currentItem.additional_parameters.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentItem.additional_parameters.map((param, idx) => (
                    <div key={idx} className="flex gap-3 items-center p-3 bg-bg-primary border border-border rounded-lg">
                      <span className="badge badge-primary text-xs">{param.name}</span>
                      <span className="flex-1 text-sm text-text-primary truncate">{param.value}</span>
                      <button type="button" onClick={() => handleRemoveParameter(idx)} className="btn btn-ghost p-1 text-red-500 hover:bg-red-500/10">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex flex-col md:flex-row gap-3 items-end">
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">Identificador</label>
                  <input
                    type="text"
                    value={paramName}
                    onChange={(e) => setParamName(e.target.value)}
                    className="input text-sm"
                    placeholder="Ex: Cor, Voltagem"
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">Valor</label>
                  <input
                    type="text"
                    value={paramValue}
                    onChange={(e) => setParamValue(e.target.value)}
                    className="input text-sm"
                    placeholder="Ex: Titanium Gray"
                  />
                </div>
                <button type="button" onClick={handleAddParameter} className="btn btn-secondary text-xs">
                  Adicionar
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-border">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Quantidade</label>
              <input
                type="number"
                min="1"
                value={currentItem.quantity}
                onChange={(e) => updateCurrentItem('quantity', e.target.value)}
                className="input text-center"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Unitário (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentItem.unit_price}
                onChange={(e) => updateCurrentItem('unit_price', e.target.value)}
                className="input text-right font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Unidade</label>
              <input
                type="text"
                value={currentItem.unit_measure}
                onChange={(e) => updateCurrentItem('unit_measure', e.target.value)}
                className="input"
                placeholder="Un, Kit, H..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-primary">Subtotal</label>
              <div className="input flex items-center justify-end font-semibold text-primary bg-primary/5">
                {currentItem.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pt-2">
            <button type="button" className="btn btn-outline text-xs">
              <BookOpen size={16} /> Selecionar do Catálogo
            </button>
            <div className="flex-1 flex justify-end">
              <button type="button" onClick={addItemToOpportunity} className="btn btn-primary">
                <Plus size={16} />
                Adicionar Item
              </button>
            </div>
          </div>
        </div>

        <div className="card p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-xs text-text-muted font-medium">Valor Total da Oportunidade</p>
              <p className="text-3xl font-bold text-text-primary tracking-tight">
                {totalOpportunity.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <span className="badge badge-success flex items-center gap-1">
            <ShieldCheck size={12} />
            BRL
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-primary flex items-center gap-2">
            <AlignLeft size={14} />
            Observações
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input resize-none min-h-[120px]"
            placeholder="Diretrizes críticas, SLAs e condições comerciais..."
          ></textarea>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border">
          <div>
            {opportunityToEdit && (
              <button type="button" onClick={openDeleteConfirm} disabled={loading} className="btn btn-ghost text-red-500 hover:bg-red-500/10">
                <Trash2 size={16} />
                Excluir Oportunidade
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancelar
            </button>
            <button type="submit" form="opp-form" disabled={loading} className="btn btn-primary">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? 'Salvando...' : 'Salvar Oportunidade'}
            </button>
          </div>
        </div>
      </form>
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Oportunidade"
        message="Autorizar encerramento definitivo desta oportunidade?"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </Modal>
  );
}
