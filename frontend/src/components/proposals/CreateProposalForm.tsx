import React, { useState } from 'react';
import { X, Search, Plus, Image as ImageIcon, Trash2, ShieldCheck, FileText, DollarSign, Clock, Truck, ShieldAlert, Zap, User, Sparkles, Calendar, Save, Target } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { DatePicker } from '../ui/DatePicker';
import { Select } from '../ui/Select';

export default function CreateProposalForm({ onClose }: { onClose: () => void }) {
  const [clientType, setClientType] = useState<'pj' | 'pf'>('pj');
  const [validityDate, setValidityDate] = useState<Date | null>(null);
  const [status, setStatus] = useState('rascunho');
  const [transactionType, setTransactionType] = useState('venda');
  const [incoterm, setIncoterm] = useState('cif');
  const { hasPermission } = usePermissions();
  const canSave = hasPermission('commercial', 'proposals', 'create');

  return (
    <div className="space-y-6 animate-fade-in">
      
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
          {canSave && (
            <button onClick={onClose} className="btn btn-primary text-xs">
              <Save size={14} />
              Salvar Proposta
            </button>
          )}
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
              <label className="text-sm font-medium text-text-primary">Validade da Oferta</label>
              <DatePicker selected={validityDate} onChange={(date) => setValidityDate(date)} />
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
              <label className="text-sm font-medium text-text-primary">Motivação do Cliente</label>
              <input type="text" placeholder="Ex: Substituição Tecnológica" className="input" />
            </div>
          </div>
        </section>

        {/* Step 2: Client */}
        <section className="card p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <User size={20} />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Cliente</h3>
          </div>
          
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="clientType" value="pj" checked={clientType === 'pj'} onChange={() => setClientType('pj')} className="w-4 h-4 text-primary border-border focus:ring-primary" />
              <span className={`text-sm font-medium ${clientType === 'pj' ? 'text-text-primary' : 'text-text-muted'}`}>Pessoa Jurídica</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="clientType" value="pf" checked={clientType === 'pf'} onChange={() => setClientType('pf')} className="w-4 h-4 text-primary border-border focus:ring-primary" />
              <span className={`text-sm font-medium ${clientType === 'pf' ? 'text-text-primary' : 'text-text-muted'}`}>Pessoa Física</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
              <input type="text" placeholder="Buscar cliente..." className="input pl-9" />
            </div>
            <button className="btn btn-outline text-xs">
              <Plus size={14} />
              Novo Cliente
            </button>
          </div>
        </section>

        {/* Step 3: Items */}
        <section className="card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Zap size={20} />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">Itens da Proposta</h3>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-outline text-xs">
                <FileText size={14} /> Do Catálogo
              </button>
              <button className="btn btn-primary text-xs">
                <Plus size={14} /> Adicionar Item
              </button>
            </div>
          </div>
          
          <div className="bg-bg-tertiary/50 border border-border rounded-xl p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-9 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-primary">Descrição*</label>
                    <input type="text" className="input" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-primary">Fabricante / Marca</label>
                    <input type="text" className="input" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-primary">Modelo / Referência</label>
                    <input type="text" className="input" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-primary">Tipo de Transação</label>
                    <Select
                      value={transactionType}
                      onChange={v => setTransactionType(v)}
                      options={[
                        { value: 'venda', label: 'Venda' },
                        { value: 'locacao', label: 'Locação' }
                      ]}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-primary">Especificação Técnica</label>
                  <textarea rows={3} className="input resize-none" placeholder="Descreva os parâmetros de performance e conformidade..."></textarea>
                </div>

                <div className="pt-4 border-t border-border space-y-4">
                  <h4 className="text-sm font-semibold text-text-primary">Parâmetros Customizados</h4>
                  
                  <div className="flex items-end gap-4">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-sm font-medium text-text-primary">Identificador</label>
                      <input type="text" placeholder="Ex: Voltagem" className="input" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="text-sm font-medium text-text-primary">Valor</label>
                      <input type="text" placeholder="Ex: 220V" className="input" />
                    </div>
                    <button className="btn btn-outline text-xs">Adicionar</button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 flex flex-col items-center">
                <span className="text-xs text-text-muted font-medium mb-4">Imagem do Produto</span>
                <div className="w-full aspect-square bg-bg-tertiary border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors">
                  <ImageIcon className="w-10 h-10 text-text-muted/50" />
                  <span className="text-xs text-text-muted mt-4">Upload Imagem</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 pt-4 border-t border-border">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Qtd*</label>
                <input type="number" defaultValue="1" className="input" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Unitário*</label>
                <input type="text" placeholder="0,00" className="input" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Unidade</label>
                <input type="text" defaultValue="Unidade" className="input" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Margem (%)</label>
                <input type="number" defaultValue="0" className="input text-emerald-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Subtotal</label>
                <div className="input flex items-center font-medium text-primary bg-bg-tertiary/50">
                  R$ 0,00
                </div>
              </div>
            </div>
          </div>
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
                  <input type="text" placeholder="R$ 0,00" className="input" />
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col justify-center items-end relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-xl" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider mb-3">Valor Total</span>
              <span className="text-4xl font-bold text-text-primary tracking-tight">R$ 0,00</span>
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
              {[
                { label: 'Fluxo de Faturamento', val: 'Realizado diretamente pela unidade fabril.' },
                { label: 'Plano de Capacitação', val: 'Treinamento técnico por engenheiros especialistas.' },
                { label: 'Liquidação de Crédito', val: 'À vista via transferência eletrônica.' },
                { label: 'Prazo de Implantação', val: 'Até 30 dias úteis após validação.' },
                { label: 'Garantia', val: '12 meses contra defeitos de fabricação.' },
                { label: 'SLA de Suporte', val: 'Assistência 24/7 via canal prioritário.' },
              ].map((term, i) => (
                <div key={i} className="space-y-1.5">
                  <label className="text-sm font-medium text-text-primary">{term.label}</label>
                  <input type="text" defaultValue={term.val} className="input" />
                </div>
              ))}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Cláusulas de Instalação & Homologação</label>
                <textarea rows={2} defaultValue="Realizada exclusivamente pela equipe de engenharia do BidFlow, garantindo integridade e conformidade sistêmica." className="input resize-none"></textarea>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Notas Técnicas Adicionais</label>
                <textarea rows={3} defaultValue="Sem observações de exceção registradas para este fluxo." className="input resize-none"></textarea>
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
        {canSave && (
          <button className="btn btn-primary">
            <Save size={16} />
            Salvar Proposta
          </button>
        )}
      </div>
    </div>
  );
}
