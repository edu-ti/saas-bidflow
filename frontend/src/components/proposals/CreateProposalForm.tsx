import React, { useState, useCallback, useRef } from 'react';
import { Search, Plus, Image as ImageIcon, Trash2, ShieldCheck, FileText, Truck, Zap, User, Save, Upload, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { DatePicker } from '../ui/DatePicker';
import { Select } from '../ui/Select';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

type TransactionType = 'venda' | 'locacao' | 'servico';

interface PropostaItem {
  id: string;
  descricao: string;
  fabricante: string;
  modelo: string;
  tipo: TransactionType;
  meses_locacao: number;
  descricao_detalhada: string;
  imagem_url: string;
  parametros: { nome: string; valor: string }[];
  quantidade: number;
  valor_unitario: string;
  unidade_medida: string;
  desconto_percent: number;
}

function emptyItem(): PropostaItem {
  return {
    id: 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    descricao: '',
    fabricante: '',
    modelo: '',
    tipo: 'venda',
    meses_locacao: 12,
    descricao_detalhada: '',
    imagem_url: '',
    parametros: [],
    quantidade: 1,
    valor_unitario: '0',
    unidade_medida: 'Unidade',
    desconto_percent: 0,
  };
}

function formatCurrency(value: number): string {
  return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseCurrency(value: string): number {
  if (!value) return 0;
  const cleaned = value
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  return parseFloat(cleaned) || 0;
}

function formatInputCurrency(value: string): string {
  const num = parseCurrency(value);
  if (num === 0 && !value) return '';
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CreateProposalForm({ onClose }: { onClose: () => void }) {
  const [clientType, setClientType] = useState<'pj' | 'pf'>('pj');
  const [selectedClient, setSelectedClient] = useState<{ id: number | null; name: string }>({ id: null, name: '' });
  const [validityDate, setValidityDate] = useState<Date | null>(null);
  const [status, setStatus] = useState('rascunho');
  const [incoterm, setIncoterm] = useState('cif');
  const [freteValor, setFreteValor] = useState('0');
  const [motivoStatus, setMotivoStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [showErrors, setShowErrors] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [items, setItems] = useState<PropostaItem[]>([emptyItem()]);

  const [faturamento, setFaturamento] = useState('Realizado diretamente pela fábrica.');
  const [treinamento, setTreinamento] = useState('Capacitação técnica por especialistas.');
  const [condicoesPagamento, setCondicoesPagamento] = useState('À vista');
  const [prazoEntrega, setPrazoEntrega] = useState('Até 30 dias após a confirmação do pedido de compra.');
  const [garantiaEquipamentos, setGarantiaEquipamentos] = useState('12 meses a partir da data de emissão da nota Fiscal.');
  const [garantiaAcessorios, setGarantiaAcessorios] = useState('6 meses, conforme especificações do fabricante.');
  const [instalacao, setInstalacao] = useState('Realizada pela equipe técnica, garantindo conformidade e segurança.');
  const [assistenciaTecnica, setAssistenciaTecnica] = useState('Disponível com suporte especializado para manutenção e pós garantia.');
  const [observacoes, setObservacoes] = useState('Nenhuma');

  const { hasPermission } = usePermissions();
  const canSave = hasPermission('commercial', 'proposals', 'create');

  const updateItem = useCallback((index: number, field: keyof PropostaItem | string, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === 'tipo') {
        item.tipo = value as TransactionType;
        item.unidade_medida = value === 'locacao' ? 'Mês' : (item.unidade_medida === 'Mês' ? 'Unidade' : item.unidade_medida);
        if (value !== 'locacao') item.meses_locacao = 12;
      } else if (field === 'valor_unitario') {
        item.valor_unitario = value;
      } else {
        (item as any)[field] = value;
      }

      updated[index] = item;
      return updated;
    });
  }, []);

  const addItem = useCallback(() => {
    setItems(prev => [...prev, emptyItem()]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const addParametro = useCallback((itemIndex: number) => {
    const nomeInput = document.getElementById(`param-nome-${itemIndex}`) as HTMLInputElement | null;
    const valorInput = document.getElementById(`param-valor-${itemIndex}`) as HTMLInputElement | null;

    if (!nomeInput?.value || !valorInput?.value) {
      toast.error('Preencha nome e valor do parâmetro.');
      return;
    }

    setItems(prev => {
      const updated = [...prev];
      updated[itemIndex] = {
        ...updated[itemIndex],
        parametros: [...updated[itemIndex].parametros, { nome: nomeInput!.value, valor: valorInput!.value }]
      };
      return updated;
    });

    nomeInput.value = '';
    valorInput.value = '';
  }, []);

  const removeParametro = useCallback((itemIndex: number, paramIndex: number) => {
    setItems(prev => {
      const updated = [...prev];
      updated[itemIndex] = {
        ...updated[itemIndex],
        parametros: updated[itemIndex].parametros.filter((_, i) => i !== paramIndex)
      };
      return updated;
    });
  }, []);

  const getParametrosTotal = (item: PropostaItem): number => {
    return item.parametros.reduce((sum, p) => sum + parseCurrency(p.valor), 0);
  };

  const calculateItemSubtotal = (item: PropostaItem): number => {
    const qtd = item.quantidade || 1;
    const unit = parseCurrency(item.valor_unitario);
    const paramsTotal = getParametrosTotal(item);
    const valorUnitarioTotal = unit + paramsTotal;
    const meses = item.tipo === 'locacao' ? (item.meses_locacao || 12) : 1;
    const desconto = item.desconto_percent || 0;
    const subtotalSemDesconto = qtd * valorUnitarioTotal * meses;
    return subtotalSemDesconto * (1 - (desconto / 100));
  };

  const calculateTotal = (): number => {
    const itemsTotal = items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
    return itemsTotal + parseCurrency(freteValor);
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [items[index].id]: true }));
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/api/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.url) {
        updateItem(index, 'imagem_url', res.data.url);
        toast.success('Imagem enviada com sucesso!');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erro ao fazer upload da imagem.');
    } finally {
      setUploading(prev => ({ ...prev, [items[index].id]: false }));
    }
  };

  const handleSave = async () => {
    setShowErrors(true);

    // Validate items
    const invalidItem = items.find(item => !item.descricao.trim());
    if (invalidItem) {
      toast.error('Todos os itens precisam ter descrição.');
      return;
    }

    if (!validityDate) {
      toast.error('Informe a data de validade da proposta.');
      return;
    }

    if (!selectedClient.id && !selectedClient.name) {
      toast.error('Selecione um cliente para a proposta.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        status: status === 'rascunho' ? 'Draft' : 'Sent',
        data_validade: validityDate ? validityDate.toISOString().split('T')[0] : null,
        motivo_status: motivoStatus || null,
        faturamento,
        treinamento,
        condicoes_pagamento: condicoesPagamento,
        prazo_entrega: prazoEntrega,
        garantia_equipamentos: garantiaEquipamentos,
        garantia_acessorios: garantiaAcessorios,
        instalacao,
        assistencia_tecnica: assistenciaTecnica,
        notes: observacoes,
        frete_tipo: incoterm.toUpperCase(),
        frete_valor: parseCurrency(freteValor),
        items: items.map(item => ({
          description: item.descricao,
          quantity: item.quantidade,
          unit_price: parseCurrency(item.valor_unitario),
          brand: item.fabricante || null,
          model: item.modelo || null,
          status: item.tipo === 'venda' ? 'VENDA' : item.tipo === 'locacao' ? 'LOCACAO' : 'SERVICO',
          meses_locacao: item.tipo === 'locacao' ? item.meses_locacao : null,
          desconto_percent: item.desconto_percent,
          unidade_medida: item.unidade_medida,
          parametros: item.parametros.length > 0 ? item.parametros.map(p => ({
            nome: p.nome,
            valor: parseCurrency(p.valor)
          })) : null,
          descricao_detalhada: item.descricao_detalhada || null,
          imagem_url: item.imagem_url || null,
        })),
      };

      console.log('Saving proposal payload:', JSON.stringify(payload, null, 2));
      const res = await api.post('/api/proposals', payload);
      console.log('Save response:', res.data);
      toast.success('Proposta criada com sucesso!');
      onClose();
    } catch (err: any) {
      console.error('Save error:', err);
      const msg = err?.response?.data?.message
        || err?.response?.data?.error
        || (err?.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : null)
        || err?.message
        || 'Erro ao salvar proposta.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">

      {/* Header Card */}
      <div className="card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            Criar Proposta
          </h2>
          <p className="text-xs text-text-muted mt-0.5">Formalização de oferta técnico-comercial</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={onClose} className="btn btn-outline text-xs">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary text-xs">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Salvando...' : 'Salvar Proposta'}
          </button>
        </div>
      </div>

      <div className="space-y-6">

        {/* Step 1: Basic Info */}
        <section className="card p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Dados da Proposta</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Data de Emissão</label>
              <DatePicker selected={new Date()} onChange={() => {}} disabled />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary flex items-center gap-1">
                Validade da Oferta <span className="text-red-500">*</span>
                {showErrors && !validityDate && (
                  <span className="text-[10px] text-red-500 flex items-center gap-0.5"><AlertCircle size={10} /> Obrigatório</span>
                )}
              </label>
              <DatePicker selected={validityDate} onChange={(date) => setValidityDate(date)} />
              {showErrors && !validityDate && (
                <p className="text-[10px] text-red-500">Informe a data de validade da proposta</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Status</label>
              <Select
                value={status}
                onChange={v => setStatus(v)}
                options={[
                  { value: 'rascunho', label: 'Rascunho' },
                  { value: 'enviada', label: 'Enviada' }
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Motivo do Status</label>
              <input type="text" value={motivoStatus} onChange={e => setMotivoStatus(e.target.value)} placeholder="Ex: Substituição Tecnológica" className="input" />
            </div>
          </div>
        </section>

        {/* Step 2: Client */}
        <section className="card p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <User size={20} />
            </div>
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1">
              Cliente <span className="text-red-500">*</span>
              {showErrors && !selectedClient.id && !selectedClient.name && (
                <span className="text-[10px] text-red-500 flex items-center gap-0.5"><AlertCircle size={10} /> Obrigatório</span>
              )}
            </h3>
            {selectedClient.name && (
              <span className="text-xs text-emerald-600 flex items-center gap-1 ml-2 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={12} /> {selectedClient.name}
              </span>
            )}
          </div>

          {selectedClient.name ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start justify-between">
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-text-primary">{selectedClient.name}</p>
                <p className="text-xs text-text-muted">{clientType === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física'}</p>
              </div>
              <button
                onClick={() => setSelectedClient({ id: null, name: '' })}
                className="text-red-500 hover:text-red-700 text-xs font-medium"
              >
                Alterar
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="clientType" value="pj" checked={clientType === 'pj'} onChange={() => { setClientType('pj'); setSelectedClient({ id: null, name: '' }); }} className="w-4 h-4 text-primary border-border focus:ring-primary" />
                  <span className={`text-sm font-medium ${clientType === 'pj' ? 'text-text-primary' : 'text-text-muted'}`}>Pessoa Jurídica</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="clientType" value="pf" checked={clientType === 'pf'} onChange={() => { setClientType('pf'); setSelectedClient({ id: null, name: '' }); }} className="w-4 h-4 text-primary border-border focus:ring-primary" />
                  <span className={`text-sm font-medium ${clientType === 'pf' ? 'text-text-primary' : 'text-text-muted'}`}>Pessoa Física</span>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                  <input type="text" placeholder="Buscar cliente..." className="input pl-9" />
                </div>
                <button
                  onClick={() => setSelectedClient({ id: Math.random(), name: clientType === 'pj' ? 'Cliente PJ Exemplo' : 'Cliente PF Exemplo' })}
                  className="btn btn-outline text-xs"
                >
                  <Plus size={14} />
                  Novo Cliente
                </button>
              </div>
              {showErrors && !selectedClient.id && !selectedClient.name && (
                <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> Selecione um cliente para continuar</p>
              )}
            </>
          )}
        </section>

        {/* Step 3: Items */}
        <section className="card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Zap size={20} />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">Itens da Proposta ({items.length})</h3>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-outline text-xs">
                <FileText size={14} /> Do Catálogo
              </button>
              <button onClick={addItem} className="btn btn-primary text-xs">
                <Plus size={14} /> Adicionar Item
              </button>
            </div>
          </div>

          {items.map((item, index) => {
            const isLocacao = item.tipo === 'locacao';
            const paramsTotal = getParametrosTotal(item);
            const unitBase = parseCurrency(item.valor_unitario);
            const unitTotal = unitBase + paramsTotal;
            const subtotal = calculateItemSubtotal(item);

            return (
              <div key={item.id} className="bg-bg-tertiary/50 border border-border rounded-xl p-6 space-y-5 relative">
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(index)}
                    className="absolute top-3 right-3 btn btn-outline text-red-500 hover:text-red-700 hover:border-red-200 p-1.5 z-10"
                    title="Remover Item"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-9 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-text-primary">Descrição*</label>
                        <input
                          type="text"
                          value={item.descricao}
                          onChange={e => updateItem(index, 'descricao', e.target.value)}
                          className="input"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-text-primary">Fabricante / Marca</label>
                        <input
                          type="text"
                          value={item.fabricante}
                          onChange={e => updateItem(index, 'fabricante', e.target.value)}
                          className="input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-text-primary">Modelo / Referência</label>
                        <input
                          type="text"
                          value={item.modelo}
                          onChange={e => updateItem(index, 'modelo', e.target.value)}
                          className="input"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-text-primary">Tipo de Transação</label>
                        <Select
                          value={item.tipo}
                          onChange={v => updateItem(index, 'tipo', v)}
                          options={[
                            { value: 'venda', label: 'Venda' },
                            { value: 'locacao', label: 'Locação' },
                            { value: 'servico', label: 'Serviço' }
                          ]}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-text-primary">Especificação Técnica</label>
                      <textarea
                        rows={3}
                        value={item.descricao_detalhada}
                        onChange={e => updateItem(index, 'descricao_detalhada', e.target.value)}
                        className="input resize-none"
                        placeholder="Descreva os parâmetros de performance e conformidade..."
                      />
                    </div>

                    {/* Parameters */}
                    <div className="pt-4 border-t border-border space-y-3">
                      <h4 className="text-sm font-semibold text-text-primary">Parâmetros Customizados</h4>

                      {item.parametros.length > 0 && (
                        <div className="space-y-1.5">
                          {item.parametros.map((param, pIndex) => (
                            <div key={pIndex} className="flex items-center justify-between bg-bg-secondary px-3 py-1.5 rounded-md text-sm">
                              <span className="font-medium text-text-primary">{param.nome}: <span className="text-text-secondary">{param.valor}</span></span>
                              <button
                                onClick={() => removeParametro(index, pIndex)}
                                className="text-red-500 hover:text-red-700 font-bold ml-4"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-end gap-3">
                        <div className="flex-1 space-y-1.5">
                          <label className="text-xs font-medium text-text-primary">Nome</label>
                          <input type="text" id={`param-nome-${index}`} placeholder="Ex: Voltagem" className="input" />
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <label className="text-xs font-medium text-text-primary">Valor (R$)</label>
                          <input type="text" id={`param-valor-${index}`} placeholder="Ex: 4.264,00" className="input" />
                        </div>
                        <button onClick={() => addParametro(index)} className="btn btn-outline text-xs whitespace-nowrap">
                          <Plus size={14} /> Adicionar
                        </button>
                      </div>

                      {paramsTotal > 0 && (
                        <div className="text-xs text-text-muted bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                          Total de parâmetros: <span className="font-bold text-emerald-600">{formatCurrency(paramsTotal)}</span> — somado ao valor unitário
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="lg:col-span-3 flex flex-col items-center">
                    <span className="text-xs text-text-muted font-medium mb-4">Imagem do Produto</span>
                    <label
                      className="w-full aspect-square bg-bg-tertiary border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors overflow-hidden relative group"
                    >
                      {item.imagem_url ? (
                        <img src={item.imagem_url} alt="Preview" className="w-full h-full object-cover" />
                      ) : uploading[item.id] ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 size={28} className="animate-spin text-primary" />
                          <span className="text-xs text-text-muted">Enviando...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-text-muted/50" />
                          <span className="text-xs text-text-muted mt-4">Upload Imagem</span>
                        </>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(index, e)}
                        ref={(el) => { fileInputRefs.current[item.id] = el; }}
                      />
                    </label>
                    {item.imagem_url && (
                      <button
                        onClick={() => updateItem(index, 'imagem_url', '')}
                        className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Remover imagem
                      </button>
                    )}
                    <div className="mt-3 w-full">
                      <label className="text-xs text-text-muted mb-1 block">Ou cole uma URL:</label>
                      <input
                        type="text"
                        value={item.imagem_url}
                        onChange={e => updateItem(index, 'imagem_url', e.target.value)}
                        placeholder="https://..."
                        className="input text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Quantidade / Unitário / Unidade / Meses Locação / Desconto / Subtotal */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t border-border">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-primary">Qtd*</label>
                    <input
                      type="number"
                      value={item.quantidade}
                      onChange={e => updateItem(index, 'quantidade', Number(e.target.value))}
                      min="1"
                      className="input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-primary">Unitário (R$)*</label>
                    <input
                      type="text"
                      value={item.valor_unitario}
                      onChange={e => updateItem(index, 'valor_unitario', e.target.value)}
                      placeholder="0,00"
                      className="input"
                    />
                    {paramsTotal > 0 && (
                      <p className="text-[10px] text-emerald-600">+ {formatCurrency(paramsTotal)} (parâmetros) = <span className="font-bold">{formatCurrency(unitTotal)}</span></p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-primary">Unidade</label>
                    <input
                      type="text"
                      value={item.unidade_medida}
                      onChange={e => updateItem(index, 'unidade_medida', e.target.value)}
                      className="input"
                    />
                  </div>
                  {isLocacao && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-text-primary">Meses Locação</label>
                      <input
                        type="number"
                        value={item.meses_locacao}
                        onChange={e => updateItem(index, 'meses_locacao', Number(e.target.value))}
                        min="1"
                        className="input"
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-primary">Desconto (%)</label>
                    <input
                      type="number"
                      value={item.desconto_percent}
                      onChange={e => updateItem(index, 'desconto_percent', Number(e.target.value))}
                      min="0"
                      max="100"
                      step="0.1"
                      className="input text-red-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-primary">Subtotal</label>
                    <div className="input flex items-center font-bold text-primary bg-bg-tertiary/50">
                      {formatCurrency(subtotal)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Step 4: Logistics & Terms */}
        <section className="card p-6 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Truck size={20} />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">Logística & SLA</h3>
              </div>
              <div className="bg-bg-tertiary/50 border border-border rounded-xl p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-primary">Incoterm*</label>
                  <Select
                    value={incoterm}
                    onChange={v => setIncoterm(v)}
                    options={[
                      { value: 'cif', label: 'CIF (Remetente)' },
                      { value: 'fob', label: 'FOB (Destinatário)' }
                    ]}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-primary">Custo de Frete (R$)</label>
                  <input
                    type="text"
                    value={freteValor}
                    onChange={e => setFreteValor(e.target.value)}
                    disabled={incoterm === 'cif'}
                    placeholder="R$ 0,00"
                    className="input"
                  />
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col justify-center items-end relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-xl" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider mb-3">Valor Total</span>
              <span className="text-4xl font-bold text-text-primary tracking-tight">{formatCurrency(calculateTotal())}</span>
              <div className="mt-4 flex items-center gap-2 text-xs text-text-muted font-medium">
                <ShieldCheck size={14} className="text-emerald-500" /> Proposta auditada
              </div>
            </div>
          </div>

          <div className="space-y-5 pt-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <FileText size={20} />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">Cláusulas & Condições</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Faturamento</label>
                <textarea rows={2} value={faturamento} onChange={e => setFaturamento(e.target.value)} className="input resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Treinamento</label>
                <textarea rows={2} value={treinamento} onChange={e => setTreinamento(e.target.value)} className="input resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Condições de Pagamento</label>
                <textarea rows={2} value={condicoesPagamento} onChange={e => setCondicoesPagamento(e.target.value)} className="input resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Prazo de Entrega</label>
                <textarea rows={2} value={prazoEntrega} onChange={e => setPrazoEntrega(e.target.value)} className="input resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Garantia (Equipamentos)</label>
                <textarea rows={2} value={garantiaEquipamentos} onChange={e => setGarantiaEquipamentos(e.target.value)} className="input resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Garantia (Acessórios)</label>
                <textarea rows={2} value={garantiaAcessorios} onChange={e => setGarantiaAcessorios(e.target.value)} className="input resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Instalação</label>
                <textarea rows={2} value={instalacao} onChange={e => setInstalacao(e.target.value)} className="input resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Assistência Técnica</label>
                <textarea rows={2} value={assistenciaTecnica} onChange={e => setAssistenciaTecnica(e.target.value)} className="input resize-none" />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Observações</label>
                <textarea rows={3} value={observacoes} onChange={e => setObservacoes(e.target.value)} className="input resize-none" />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="card p-6 flex items-center justify-end gap-4">
        <button onClick={onClose} className="btn btn-outline">
          Cancelar
        </button>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Salvando...' : 'Salvar Proposta'}
        </button>
      </div>
    </div>
  );
}
