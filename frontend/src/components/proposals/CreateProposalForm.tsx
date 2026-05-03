import React, { useState } from 'react';
import { X, Search, Plus, Image as ImageIcon, Trash2, ShieldCheck, FileText, DollarSign, Clock, Truck, ShieldAlert, Zap, User } from 'lucide-react';

export default function CreateProposalForm({ onClose }: { onClose: () => void }) {
  const [clientType, setClientType] = useState<'pj' | 'pf'>('pj');

  return (
    <div className="platinum-card overflow-hidden mb-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 border-b border-white/5 bg-white/[0.02] gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-white uppercase tracking-[0.2em]">Engenharia de Proposta</h2>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest italic">Formalização de oferta técnico-comercial</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={onClose} 
            className="flex-1 md:flex-none px-6 py-2.5 text-[10px] font-black text-text-muted hover:text-white transition-all uppercase tracking-widest"
          >
            Descartar
          </button>
          <button 
            onClick={onClose} 
            className="flex-1 md:flex-none px-8 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow uppercase text-[10px] tracking-widest"
          >
            Gerar Proposta Final
          </button>
        </div>
      </div>

      <div className="p-8 space-y-12">
        
        {/* Step 1: Basic Info */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <ShieldCheck size={18} />
            </div>
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Parâmetros de Auditoria</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Data de Emissão</label>
              <input type="date" className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-text-muted cursor-not-allowed opacity-60" defaultValue={new Date().toISOString().split('T')[0]} readOnly />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Validade da Oferta</label>
              <input type="date" className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Status do Fluxo</label>
              <select className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none appearance-none">
                <option value="rascunho">Rascunho Estratégico</option>
                <option value="enviada">Documento Enviado</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Motivação do Cliente</label>
              <input type="text" placeholder="Ex: Substituição Tecnológica" className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none transition-all" />
            </div>
          </div>
        </section>

        {/* Step 2: Client Selection */}
        <section className="space-y-6 border-t border-white/5 pt-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <User size={18} />
            </div>
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Identificação do Prospecto</h3>
          </div>
          
          <div className="flex items-center gap-8 mb-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${clientType === 'pj' ? 'border-primary bg-primary/10' : 'border-white/10 group-hover:border-white/30'}`}>
                {clientType === 'pj' && <div className="w-2 h-2 rounded-full bg-primary shadow-platinum-glow" />}
              </div>
              <input type="radio" name="clientType" value="pj" checked={clientType === 'pj'} onChange={() => setClientType('pj')} className="hidden" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">Pessoa Jurídica</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${clientType === 'pf' ? 'border-primary bg-primary/10' : 'border-white/10 group-hover:border-white/30'}`}>
                {clientType === 'pf' && <div className="w-2 h-2 rounded-full bg-primary shadow-platinum-glow" />}
              </div>
              <input type="radio" name="clientType" value="pf" checked={clientType === 'pf'} onChange={() => setClientType('pf')} className="hidden" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">Pessoa Física</span>
            </label>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
              <input type="text" placeholder="Interrogar base de clientes..." className="w-full pl-11 pr-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none transition-all placeholder:text-text-muted" />
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              <Plus size={14} className="text-primary" />
              Novo Cadastro
            </button>
          </div>
        </section>

        {/* Step 3: Items */}
        <section className="space-y-6 border-t border-white/5 pt-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Zap size={18} />
              </div>
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Escopo de Soluções</h3>
            </div>
            <div className="flex items-center gap-3">
               <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                <FileText size={12} className="text-primary" /> Do Catálogo
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all">
                <Plus size={12} /> Adicionar Manualmente
              </button>
            </div>
          </div>
          
          <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] relative group/item">
            <button className="absolute top-6 right-6 p-2 text-text-muted hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-all">
              <Trash2 size={18} />
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column (Specs) */}
              <div className="lg:col-span-9 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Descrição Comercial*</label>
                    <input type="text" className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Fabricante / Marca</label>
                    <input type="text" className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none transition-all" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Modelo / Referência</label>
                    <input type="text" className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Tipo de Transação</label>
                    <select className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none appearance-none">
                      <option value="venda">Venda Direta</option>
                      <option value="locacao">Locação de Ativos</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Especificação Técnica Avançada</label>
                  <textarea rows={3} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none transition-all resize-none" placeholder="Detalhes de performance e conformidade..."></textarea>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-4">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2"><Plus size={12} className="text-primary" /> Parâmetros Adicionais</h4>
                  
                  <div className="flex items-end gap-4">
                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">Identificador</label>
                      <input type="text" placeholder="Ex: Voltagem" className="w-full px-4 py-2 bg-background border border-white/10 rounded-xl text-xs text-white outline-none" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">Valor do Atributo</label>
                      <input type="text" placeholder="Ex: 220V" className="w-full px-4 py-2 bg-background border border-white/10 rounded-xl text-xs text-white outline-none" />
                    </div>
                    <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all">Vincular</button>
                  </div>
                </div>
              </div>

              {/* Right Column (Visual) */}
              <div className="lg:col-span-3 flex flex-col items-center">
                <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Referência Visual</span>
                <div className="w-full aspect-square bg-background border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center group/img cursor-pointer hover:border-primary/30 transition-all shadow-inner">
                  <ImageIcon className="w-10 h-10 text-text-muted group-hover/img:text-primary transition-all group-hover/img:scale-110" />
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-4">Upload Asset</span>
                </div>
                <button className="mt-4 text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Configurar Imagem</button>
              </div>
            </div>

            {/* Price Line */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 mt-10 pt-10 border-t border-white/5">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Qtd*</label>
                <input type="number" defaultValue="1" className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white font-black" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Unitário*</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold text-xs">R$</span>
                  <input type="text" placeholder="0,00" className="w-full pl-10 pr-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white font-black" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Unidade</label>
                <input type="text" defaultValue="Unidade" className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Desconto (%)</label>
                <input type="number" defaultValue="0" className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white font-black text-emerald-400" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Soma Parcial</label>
                <div className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-sm font-black text-primary flex items-center">
                  R$ 0,00
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 4: Logistics & Terms */}
        <section className="space-y-8 border-t border-white/5 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Truck size={18} />
                </div>
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Engenharia Logística</h3>
              </div>
              <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="flex-1 space-y-1">
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Incoterm de Frete*</label>
                  <select className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-xs text-white appearance-none">
                    <option value="cif">CIF (Pago pelo Remetente)</option>
                    <option value="fob">FOB (Pago pelo Destinatário)</option>
                  </select>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Custo Logístico (R$)</label>
                  <input type="text" placeholder="R$ 0,00" className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-xs text-white font-black" />
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-8 flex flex-col justify-center items-end text-right">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Valuation Total da Oferta</span>
              <span className="text-4xl font-black text-white tracking-tighter">R$ 0,00</span>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-text-muted font-bold uppercase tracking-widest">
                <ShieldCheck size={14} className="text-emerald-400" /> Fiscalmente auditado
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Clock size={18} />
              </div>
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Cláusulas e Condições Comerciais</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { label: 'Fluxo de Faturamento', val: 'Realizado diretamente pela fábrica.' },
                { label: 'Plano de Treinamento', val: 'Capacitação técnica por especialistas do BidFlow.' },
                { label: 'Condições de Liquidação', val: 'À vista via transferência estratégica.' },
                { label: 'Janela de Entrega', val: 'Até 30 dias após a homologação do pedido.' },
                { label: 'Garantia de Ativos', val: '12 meses contra defeitos de orquestração.' },
                { label: 'Suporte Pós-Venda', val: 'Assistência dedicada 24/7 via canal Platinum.' },
              ].map((term, i) => (
                <div key={i} className="space-y-1">
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">{term.label}</label>
                  <input type="text" defaultValue={term.val} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-xs text-white focus:border-primary/40 outline-none" />
                </div>
              ))}
              <div className="md:col-span-2 space-y-1">
                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Cláusulas de Instalação e Montagem</label>
                <textarea rows={2} defaultValue="Realizada pela equipe de engenharia do BidFlow, garantindo conformidade e segurança sistêmica." className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-xs text-white focus:border-primary/40 outline-none resize-none"></textarea>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Observações Estratégicas</label>
                <textarea rows={3} defaultValue="Nenhuma" className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-xs text-white focus:border-primary/40 outline-none resize-none"></textarea>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="p-8 border-t border-white/5 bg-white/[0.02] flex items-center justify-end gap-6">
        <button onClick={onClose} className="px-6 py-3 text-[10px] font-black text-text-muted hover:text-white transition-all uppercase tracking-widest">
          Cancelar Operação
        </button>
        <button className="px-10 py-4 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow uppercase text-[10px] tracking-widest">
          Consolidar Proposta
        </button>
      </div>
    </div>
  );
}
