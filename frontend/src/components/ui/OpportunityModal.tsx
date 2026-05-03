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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-background border border-white/10 rounded-2xl shadow-platinum-glow w-full max-w-5xl my-8 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Header - Platinum Style */}
        <div className="flex justify-between items-center p-8 border-b border-white/5 bg-white/[0.02] sticky top-0 z-10">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <BookOpen size={24} className="text-primary" />
              {opportunityToEdit ? 'Refinar Oportunidade' : 'Nova Arquitetura de Negócio'}
            </h2>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em]">Configuração de Deal Estratégico Platinum</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-white transition-colors bg-white/5 p-2 rounded-xl border border-white/5">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
          <form id="opp-form" onSubmit={handleSubmit} className="space-y-10">
            
            {/* Cabeçalho - Dados Primários */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-3 space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest">Título do Projeto*</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Ex: Expansão de Infraestrutura Network"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest">Cliente Estratégico</label>
                <select
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all appearance-none"
                >
                  <option value="" className="bg-surface">Selecione o Cliente...</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id} className="bg-surface">{org.trade_name || org.legal_name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest">Ponto de Contato</label>
                <select
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all appearance-none"
                >
                  <option value="" className="bg-surface">Vincular Contato...</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id} className="bg-surface">{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest">Workflow Interno</label>
                <select
                  value={forwardTo}
                  onChange={(e) => setForwardTo(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all appearance-none"
                >
                  <option value="" className="bg-surface">Minha oportunidade</option>
                  <option value="Equipe Comercial" className="bg-surface">Equipe Comercial</option>
                  <option value="Diretoria" className="bg-surface">Diretoria</option>
                </select>
              </div>
            </div>

            {/* Itens Adicionados - Platinum Card */}
            {items.length > 0 && (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 bg-white/5 border-b border-white/5">
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <List size={14} className="text-primary" />
                    Bill of Materials ({items.length} itens)
                  </h3>
                </div>
                <div className="divide-y divide-white/5">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-6 hover:bg-white/[0.01] transition-colors group">
                      <div className="space-y-1">
                        <span className="font-bold text-white text-sm group-hover:text-primary transition-colors">{item.description}</span>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                          <span>{item.quantity} {item.unit_measure}</span>
                          <span className="text-white/20">•</span>
                          <span>R$ {item.unit_price.toLocaleString('pt-BR')} unit.</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <span className="text-lg font-black text-white tracking-tighter">R$ {item.subtotal.toLocaleString('pt-BR')}</span>
                        <button type="button" onClick={() => removeItem(idx)} className="text-text-muted hover:text-red-400 p-2 bg-white/5 rounded-lg border border-white/5 transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Configuração de Item - Platinum Panel */}
            <div className="platinum-card p-8 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Plus size={120} className="text-primary" />
              </div>
              
              <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Plus size={20} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">Configuração Técnica de Item</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest">Descrição do Ativo*</label>
                  <input
                    type="text"
                    value={currentItem.description}
                    onChange={(e) => updateCurrentItem('description', e.target.value)}
                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all"
                    placeholder="Ex: Switch Core 48 Portas PoE"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest">Fabricante</label>
                  <input
                    type="text"
                    value={currentItem.manufacturer}
                    onChange={(e) => updateCurrentItem('manufacturer', e.target.value)}
                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all"
                  />
                </div>
                <div className="row-span-2 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-6 bg-white/[0.01] hover:border-primary/30 transition-all cursor-pointer group">
                  <ImageIcon className="text-text-muted group-hover:text-primary transition-all mb-3" size={32} />
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-4">Evidência Visual</span>
                  <button type="button" className="text-[10px] font-black bg-white/5 hover:bg-primary hover:text-background px-4 py-2 rounded-lg text-white border border-white/10 transition-all uppercase tracking-widest">
                    Selecionar
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest">Part Number / Modelo</label>
                  <input
                    type="text"
                    value={currentItem.model}
                    onChange={(e) => updateCurrentItem('model', e.target.value)}
                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest">Modalidade</label>
                  <select
                    value={currentItem.status}
                    onChange={(e) => updateCurrentItem('status', e.target.value)}
                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all appearance-none"
                  >
                    <option value="Venda" className="bg-surface">Venda</option>
                    <option value="Locação" className="bg-surface">Locação</option>
                    <option value="Serviço" className="bg-surface">Serviço</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest">Descrição Técnica Detalhada</label>
                <textarea
                  value={currentItem.detailed_description}
                  onChange={(e) => updateCurrentItem('detailed_description', e.target.value)}
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all min-h-[100px]"
                  placeholder="Espeficicações avançadas, SLAs, garantias..."
                ></textarea>
              </div>

              {/* Parâmetros Adicionais - Dark Style */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Settings size={14} className="text-primary" />
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Atributos Customizados</h4>
                </div>
                <div className="bg-white/[0.01] p-6 rounded-2xl border border-white/5 space-y-4">
                  {currentItem.additional_parameters.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {currentItem.additional_parameters.map((param, idx) => (
                        <div key={idx} className="flex gap-3 items-center p-3 bg-white/5 rounded-xl border border-white/5 group">
                          <div className="font-black text-[9px] text-primary uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">{param.name}</div>
                          <div className="flex-1 text-[10px] font-bold text-white uppercase truncate">{param.value}</div>
                          <button type="button" onClick={() => handleRemoveParameter(idx)} className="text-text-muted hover:text-red-400 p-1 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">Chave (Ex: Cor)</label>
                      <input
                        type="text"
                        value={paramName}
                        onChange={(e) => setParamName(e.target.value)}
                        className="w-full bg-background/30 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">Valor (Ex: Titanium)</label>
                      <input
                        type="text"
                        value={paramValue}
                        onChange={(e) => setParamValue(e.target.value)}
                        className="w-full bg-background/30 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddParameter}
                      className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      Vincular
                    </button>
                  </div>
                </div>
              </div>

              {/* Valores e Quantidades - Premium Look */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 border-t border-white/5 pt-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    value={currentItem.quantity}
                    onChange={(e) => updateCurrentItem('quantity', e.target.value)}
                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest">Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentItem.unit_price}
                    onChange={(e) => updateCurrentItem('unit_price', e.target.value)}
                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest">Medida</label>
                  <input
                    type="text"
                    value={currentItem.unit_measure}
                    onChange={(e) => updateCurrentItem('unit_measure', e.target.value)}
                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-text-muted/30"
                    placeholder="Un, Kit, Hectare..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest">Subtotal Calculado</label>
                  <div className="w-full h-[50px] flex items-center px-4 bg-primary/5 border border-primary/20 rounded-xl font-black text-white text-lg tracking-tight">
                    R$ {currentItem.subtotal.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 pt-4">
                <button type="button" className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all">
                  <BookOpen size={16} className="text-primary" /> Do Catálogo
                </button>
                <div className="ml-auto">
                  <button 
                    type="button" 
                    onClick={addItemToOpportunity}
                    className="px-8 py-3.5 bg-primary text-background font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-primary-hover transition-all shadow-platinum-glow"
                  >
                    Adicionar Item ao Negócio
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center py-6 border-y border-white/5">
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Total Geral da Oportunidade</span>
                <span className="text-4xl font-black text-white tracking-tighter shadow-platinum-glow">
                  R$ {totalOpportunity.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest">Observações Estratégicas</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all min-h-[120px]"
                placeholder="Notas sobre a concorrência, urgência do cliente, prazos críticos..."
              ></textarea>
            </div>
          </form>
        </div>

        {/* Footer - Platinum Style */}
        <div className="flex justify-between items-center p-8 border-t border-white/5 bg-white/[0.02] sticky bottom-0 z-10">
          <div>
            {opportunityToEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-6 py-3 text-red-500 hover:bg-red-500/10 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-transparent hover:border-red-500/20"
              >
                Encerrar Oportunidade
              </button>
            )}
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="opp-form"
              disabled={loading}
              className="px-10 py-3.5 bg-primary text-background font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-primary-hover transition-all shadow-platinum-glow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? 'Sincronizando...' : 'Consolidar Negócio'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
