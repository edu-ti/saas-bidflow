import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Image as ImageIcon, BookOpen, List, Settings, Save, Loader2, Sparkles, Layout, ShieldCheck, Zap, Activity, Target, ChevronRight, Briefcase } from 'lucide-react';
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
  
  const [currentItem, setCurrentItem] = useState<OpportunityItem>(createEmptyItem());
  const [paramName, setParamName] = useState('');
  const [paramValue, setParamValue] = useState('');

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleDelete = async () => {
    if (!opportunityToEdit) return;
    if (!window.confirm('Autorizar encerramento definitivo desta oportunidade?')) return;
    
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
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-500">
      <div className="bg-surface border border-border-subtle/30 rounded-[2.5rem] shadow-platinum w-full max-w-6xl my-4 overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-500">
        
        {/* Header - Platinum Style */}
        <div className="flex justify-between items-center p-10 border-b border-border-subtle/30 bg-surface-elevated/20 sticky top-0 z-20">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-text-primary uppercase tracking-tighter flex items-center gap-5">
              <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-platinum-glow-sm">
                <BookOpen size={28} className="text-primary" />
              </div>
              {opportunityToEdit ? 'Refinar Deal' : 'Consolidar Deal <span className="text-gradient-gold">Platinum</span>'}
            </h2>
            <div className="flex items-center gap-3 text-[10px] text-text-muted font-black uppercase tracking-[0.3em] opacity-60">
               <ShieldCheck size={14} className="text-primary" /> Arquitetura de Negócio com Inteligência Neural
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-surface-elevated/40 border border-border-subtle rounded-2xl text-text-muted hover:text-text-primary transition-all shadow-inner-platinum">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 scrollbar-platinum space-y-12">
          <form id="opp-form" onSubmit={handleSubmit} className="space-y-12">
            
            {/* Primários */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-3 space-y-4 group">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors flex items-center gap-3">
                  <Sparkles size={14} className="text-primary" /> Título do Projeto Estratégico *
                </label>
                <div className="relative">
                  <Activity size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted opacity-40 group-focus-within:text-primary group-focus-within:opacity-100 transition-all" />
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum uppercase tracking-tight"
                    placeholder="Ex: Expansão de Infraestrutura Network High-Level"
                  />
                </div>
              </div>
              <div className="space-y-4 group">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Cliente Target</label>
                <div className="relative">
                  <Briefcase size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted opacity-40 group-focus-within:text-primary group-focus-within:opacity-100 transition-all pointer-events-none" />
                  <select
                    value={organizationId}
                    onChange={(e) => setOrganizationId(e.target.value)}
                    className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-12 py-5 text-[11px] font-black uppercase tracking-widest text-text-primary focus:border-primary/40 outline-none transition-all appearance-none cursor-pointer shadow-inner-platinum"
                  >
                    <option value="" className="bg-surface">Selecione o Cliente...</option>
                    {organizations.map(org => (
                      <option key={org.id} value={org.id} className="bg-surface">{org.trade_name?.toUpperCase() || org.legal_name?.toUpperCase()}</option>
                    ))}
                  </select>
                  <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-text-muted opacity-40" />
                </div>
              </div>
              <div className="space-y-4 group">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Ponto de Contato Core</label>
                <div className="relative">
                  <Target size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted opacity-40 group-focus-within:text-primary group-focus-within:opacity-100 transition-all pointer-events-none" />
                  <select
                    value={contactId}
                    onChange={(e) => setContactId(e.target.value)}
                    className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-12 py-5 text-[11px] font-black uppercase tracking-widest text-text-primary focus:border-primary/40 outline-none transition-all appearance-none cursor-pointer shadow-inner-platinum"
                  >
                    <option value="" className="bg-surface">Vincular Contato...</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id} className="bg-surface">{c.name.toUpperCase()}</option>
                    ))}
                  </select>
                  <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-text-muted opacity-40" />
                </div>
              </div>
              <div className="space-y-4 group">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Workflow de Atendimento</label>
                <div className="relative">
                  <Zap size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-60 group-focus-within:opacity-100 transition-all pointer-events-none" />
                  <select
                    value={forwardTo}
                    onChange={(e) => setForwardTo(e.target.value)}
                    className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-12 py-5 text-[11px] font-black uppercase tracking-widest text-text-primary focus:border-primary/40 outline-none transition-all appearance-none cursor-pointer shadow-inner-platinum"
                  >
                    <option value="" className="bg-surface">Minha oportunidade</option>
                    <option value="Equipe Comercial" className="bg-surface">Equipe Comercial</option>
                    <option value="Diretoria" className="bg-surface">Diretoria</option>
                  </select>
                  <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-text-muted opacity-40" />
                </div>
              </div>
            </div>

            {/* Bill of Materials */}
            {items.length > 0 && (
              <div className="bg-surface-elevated/10 border border-border-subtle/30 rounded-[2.5rem] overflow-hidden shadow-platinum-glow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="px-10 py-6 bg-surface-elevated/20 border-b border-border-subtle/30 flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-text-primary uppercase tracking-[0.4em] flex items-center gap-4">
                    <List size={16} className="text-primary" />
                    Bill of Materials ({items.length} Ativos Consolidados)
                  </h3>
                  <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                     <Check size={12} /> Status: Validado
                  </div>
                </div>
                <div className="divide-y divide-border-subtle/10">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center px-10 py-8 hover:bg-surface-elevated/20 transition-all group duration-500">
                      <div className="space-y-2">
                        <div className="font-black text-text-primary text-sm group-hover:text-primary transition-colors uppercase tracking-tight">{item.description}</div>
                        <div className="flex items-center gap-5 text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">
                          <span className="bg-surface-elevated/40 px-2 py-1 rounded border border-border-subtle">{item.quantity} {item.unit_measure.toUpperCase()}</span>
                          <span className="text-primary/30">•</span>
                          <span>{item.unit_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} unit.</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-12">
                        <span className="text-2xl font-black text-text-primary tracking-tighter group-hover:text-primary transition-colors">{item.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        <button type="button" onClick={() => removeItem(idx)} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500/60 hover:text-red-500 transition-all shadow-inner-platinum">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Item Config Panel */}
            <div className="platinum-card p-10 space-y-12 relative overflow-hidden bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-platinum-glow-sm">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none select-none">
                <Layout size={240} className="text-primary" />
              </div>
              
              <div className="flex items-center gap-5 border-b border-border-subtle/30 pb-10 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner-platinum group-hover:scale-110 transition-transform">
                  <Plus size={32} />
                </div>
                <div className="space-y-1">
                   <h3 className="text-sm font-black text-text-primary uppercase tracking-[0.5em]">Engenharia Técnica de Ativo</h3>
                   <p className="text-[10px] text-text-muted font-black uppercase tracking-widest opacity-60">Configuração Paramétrica de Item de Cotação</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10">
                <div className="md:col-span-2 space-y-4 group">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Descrição Técnica do Ativo *</label>
                  <input
                    type="text"
                    value={currentItem.description}
                    onChange={(e) => updateCurrentItem('description', e.target.value)}
                    className="w-full bg-background/50 border border-border-medium rounded-2xl px-8 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum uppercase tracking-tight"
                    placeholder="Ex: Switch Core 48 Portas PoE L3"
                  />
                </div>
                <div className="space-y-4 group">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Fabricante / Brand</label>
                  <input
                    type="text"
                    value={currentItem.manufacturer}
                    onChange={(e) => updateCurrentItem('manufacturer', e.target.value)}
                    className="w-full bg-background/50 border border-border-medium rounded-2xl px-8 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum uppercase tracking-tight"
                    placeholder="Global Vendor"
                  />
                </div>
                <div className="row-span-2 flex flex-col items-center justify-center border-2 border-dashed border-border-medium rounded-[2.5rem] p-10 bg-surface-elevated/20 hover:border-primary/40 transition-all duration-500 cursor-pointer group shadow-inner-platinum">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-surface-elevated flex items-center justify-center border border-border-subtle group-hover:scale-110 transition-transform duration-500 shadow-inner-platinum mb-6">
                     <ImageIcon className="text-text-muted group-hover:text-primary transition-all opacity-40 group-hover:opacity-100" size={40} />
                  </div>
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-8 opacity-60 text-center">Evidência Visual (Item_Asset)</span>
                  <button type="button" className="text-[10px] font-black bg-primary/5 hover:bg-primary hover:text-white px-6 py-3 rounded-xl text-primary border border-primary/20 transition-all uppercase tracking-[0.2em] shadow-platinum-glow-sm">
                    Carregar Mídia
                  </button>
                </div>

                <div className="space-y-4 group">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Part Number / Modelo Core</label>
                  <input
                    type="text"
                    value={currentItem.model}
                    onChange={(e) => updateCurrentItem('model', e.target.value)}
                    className="w-full bg-background/50 border border-border-medium rounded-2xl px-8 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum font-mono uppercase tracking-widest"
                    placeholder="PN-XXXXX"
                  />
                </div>
                <div className="space-y-4 group">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Modalidade de Deal</label>
                  <div className="relative">
                    <select
                      value={currentItem.status}
                      onChange={(e) => updateCurrentItem('status', e.target.value)}
                      className="w-full bg-background/50 border border-border-medium rounded-2xl pl-8 pr-12 py-5 text-[11px] font-black uppercase tracking-widest text-text-primary focus:border-primary/40 outline-none transition-all appearance-none cursor-pointer shadow-inner-platinum"
                    >
                      <option value="Venda" className="bg-surface">Venda Direta</option>
                      <option value="Locação" className="bg-surface">Locação / HaaS</option>
                      <option value="Serviço" className="bg-surface">Serviço Profissional</option>
                    </select>
                    <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-text-muted opacity-40 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 group">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">SLA de Atendimento & Especificações de Campo (SOW)</label>
                <textarea
                  value={currentItem.detailed_description}
                  onChange={(e) => updateCurrentItem('detailed_description', e.target.value)}
                  className="w-full bg-background/50 border border-border-medium rounded-[2.5rem] px-8 py-8 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all min-h-[160px] shadow-inner-platinum placeholder:text-text-muted/20 leading-relaxed"
                  placeholder="Detalhamento técnico avançado para composição de proposta neural..."
                ></textarea>
              </div>

              {/* Parâmetros */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <Settings size={20} className="text-primary" />
                  <h4 className="text-[10px] font-black text-text-primary uppercase tracking-[0.5em]">Atributos Paramétricos Platinum</h4>
                </div>
                <div className="bg-surface-elevated/20 p-10 rounded-[2.5rem] border border-border-subtle/30 space-y-10 shadow-inner-platinum relative">
                  {currentItem.additional_parameters.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                      {currentItem.additional_parameters.map((param, idx) => (
                        <div key={idx} className="flex gap-6 items-center p-5 bg-background/60 rounded-2xl border border-border-subtle group hover:border-primary/40 transition-all shadow-platinum-glow-sm">
                          <div className="font-black text-[9px] text-primary uppercase tracking-[0.3em] bg-primary/5 px-4 py-2 rounded-xl border border-primary/20">{param.name}</div>
                          <div className="flex-1 text-[11px] font-black text-text-primary uppercase tracking-tight truncate">{param.value}</div>
                          <button type="button" onClick={() => handleRemoveParameter(idx)} className="text-text-muted hover:text-red-500 p-2 bg-surface-elevated/40 rounded-lg transition-all shadow-inner-platinum">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex flex-col md:flex-row gap-8 items-end">
                    <div className="flex-1 space-y-3 w-full">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2">Identificador</label>
                      <input
                        type="text"
                        value={paramName}
                        onChange={(e) => setParamName(e.target.value)}
                        className="w-full bg-background/50 border border-border-medium rounded-xl px-6 py-4 text-xs font-black text-text-primary uppercase tracking-widest shadow-inner-platinum"
                        placeholder="Ex: Cor / Voltagem"
                      />
                    </div>
                    <div className="flex-1 space-y-3 w-full">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2">Valor Nominal</label>
                      <input
                        type="text"
                        value={paramValue}
                        onChange={(e) => setParamValue(e.target.value)}
                        className="w-full bg-background/50 border border-border-medium rounded-xl px-6 py-4 text-xs font-black text-text-primary uppercase tracking-widest shadow-inner-platinum"
                        placeholder="Ex: Titanium Gray"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddParameter}
                      className="px-10 py-4 bg-surface-elevated/60 border border-border-subtle rounded-xl text-text-primary text-[10px] font-black uppercase tracking-[0.4em] hover:bg-primary hover:text-white transition-all shadow-platinum-glow-sm w-full md:w-auto"
                    >
                      Acoplar Parâmetro
                    </button>
                  </div>
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-10 border-t border-border-subtle/30 pt-12 relative z-10">
                <div className="space-y-4 group">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Volume</label>
                  <input
                    type="number"
                    min="1"
                    value={currentItem.quantity}
                    onChange={(e) => updateCurrentItem('quantity', e.target.value)}
                    className="w-full bg-background/50 border border-border-medium rounded-2xl px-8 py-5 text-base font-black text-text-primary shadow-inner-platinum text-center"
                  />
                </div>
                <div className="space-y-4 group">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Unitário (BRL)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentItem.unit_price}
                    onChange={(e) => updateCurrentItem('unit_price', e.target.value)}
                    className="w-full bg-background/50 border border-border-medium rounded-2xl px-8 py-5 text-base font-black text-text-primary shadow-inner-platinum text-right font-mono"
                  />
                </div>
                <div className="space-y-4 group">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Medida</label>
                  <input
                    type="text"
                    value={currentItem.unit_measure}
                    onChange={(e) => updateCurrentItem('unit_measure', e.target.value)}
                    className="w-full bg-background/50 border border-border-medium rounded-2xl px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-text-primary placeholder:text-text-muted/30 shadow-inner-platinum"
                    placeholder="Un, Kit, H..."
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.4em] px-2">Subtotal Parcial</label>
                  <div className="w-full h-[66px] flex items-center justify-end px-8 bg-primary/10 border border-primary/20 rounded-2xl font-black text-primary text-2xl tracking-tighter shadow-platinum-glow-sm">
                    {currentItem.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-8 pt-10">
                <button type="button" className="flex items-center gap-4 px-10 py-5 bg-surface-elevated/40 hover:bg-surface-elevated border border-border-subtle rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] text-text-primary transition-all shadow-inner-platinum group">
                  <BookOpen size={20} className="text-primary group-hover:scale-110 transition-transform" /> Selecionar Ativo do Hub Global
                </button>
                <div className="md:ml-auto w-full md:w-auto">
                  <button 
                    type="button" 
                    onClick={addItemToOpportunity}
                    className="w-full md:w-auto px-16 py-5 btn-primary shadow-platinum-glow text-[12px] font-black tracking-[0.5em] uppercase flex items-center justify-center gap-4 group"
                  >
                    <Plus size={20} className="group-hover:scale-125 transition-transform" /> Consolidar Item no Deal
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center py-16 border-y border-border-subtle/30 relative">
               <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[120px] font-black text-primary/[0.03] pointer-events-none select-none tracking-tighter">
                 VALUATION
               </div>
              <div className="flex items-center gap-10 relative z-10 ml-auto text-right">
                <div className="space-y-2">
                   <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.5em] opacity-60 italic">Valuation Geral da Estrutura de Negócio</p>
                   <p className="text-6xl font-black text-text-primary tracking-tighter text-gradient-gold drop-shadow-xl flex items-baseline gap-4">
                     <span className="text-2xl opacity-60">BRL</span>
                     {totalOpportunity.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                   </p>
                </div>
                <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-platinum-glow-sm">
                   <Zap size={32} className="animate-pulse" />
                </div>
              </div>
            </div>

            <div className="space-y-4 group">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors flex items-center gap-3">
                 <AlignLeft size={14} /> Observações Estratégicas & Pareceres de Campo
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-surface-elevated/10 border border-border-medium rounded-[2.5rem] px-10 py-10 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all min-h-[180px] shadow-inner-platinum placeholder:text-text-muted/20 leading-relaxed"
                placeholder="Diretrizes críticas para o sucesso do deal, SLAs mandatórios e condições comerciais diferenciadas..."
              ></textarea>
            </div>
          </form>
        </div>

        {/* Footer - Platinum Style */}
        <div className="flex flex-col md:flex-row justify-between items-center p-10 border-t border-border-subtle/30 bg-surface-elevated/40 sticky bottom-0 z-20 gap-8 backdrop-blur-xl">
          <div>
            {opportunityToEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-10 py-5 text-red-500 hover:bg-red-500/10 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] transition-all border border-transparent hover:border-red-500/30 flex items-center gap-4 group"
              >
                <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                Encerrar Oportunidade
              </button>
            )}
          </div>
          <div className="flex gap-6 w-full md:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 md:flex-none px-12 py-5 bg-surface-elevated/50 border border-border-subtle rounded-2xl text-text-primary font-black text-[11px] uppercase tracking-[0.4em] hover:bg-surface-elevated transition-all shadow-inner-platinum"
            >
              Cancelar Operação
            </button>
            <button
              type="submit"
              form="opp-form"
              disabled={loading}
              className="flex-1 md:flex-none px-16 py-5 btn-primary shadow-platinum-glow flex items-center justify-center gap-5 disabled:opacity-50 group"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save size={24} className="group-hover:scale-110 transition-transform" />}
              <span className="font-black text-[12px] uppercase tracking-[0.4em]">{loading ? 'Sincronizando...' : 'Consolidar Deal'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
