import React, { useState } from 'react';
import { X, Search, Plus, Image as ImageIcon, Trash2, ShieldCheck, FileText, DollarSign, Clock, Truck, ShieldAlert, Zap, User, Sparkles, ChevronRight, Layout, Calendar, Save, Target } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';

export default function CreateProposalForm({ onClose }: { onClose: () => void }) {
  const [clientType, setClientType] = useState<'pj' | 'pf'>('pj');
  const { hasPermission } = usePermissions();
  const canSave = hasPermission('commercial', 'proposals', 'create');

  return (
    <div className="platinum-card overflow-hidden mb-8 animate-in fade-in zoom-in-95 duration-500 bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 border-b border-border-subtle/30 bg-surface-elevated/20 gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-text-primary uppercase tracking-[0.2em] flex items-center gap-3">
             <div className="w-1.5 h-6 bg-primary rounded-full shadow-platinum-glow" />
             Engenharia de Proposta
          </h2>
          <p className="text-[10px] text-text-muted font-black uppercase tracking-widest italic opacity-60">Formalização de oferta técnico-comercial estratégica</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={onClose} 
            className="flex-1 md:flex-none px-6 py-2.5 text-[10px] font-black text-text-muted hover:text-text-primary transition-all uppercase tracking-widest"
          >
            Descartar
          </button>
          {canSave && (
            <button 
              onClick={onClose} 
              className="btn-primary flex-1 md:flex-none px-10 py-3.5 shadow-platinum-glow uppercase text-[10px] tracking-widest flex items-center justify-center gap-3"
            >
              <Sparkles size={14} className="animate-pulse" />
              Gerar Proposta Final
            </button>
          )}
        </div>
      </div>

      <div className="p-8 space-y-12">
        
        {/* Step 1: Basic Info */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 border-b border-border-subtle/20 pb-4">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-platinum-glow-sm">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-[10px] font-black text-text-primary uppercase tracking-[0.4em]">Parâmetros de Auditoria Core</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-2 group">
              <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2">Data de Emissão</label>
              <div className="relative">
                 <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 opacity-40" />
                 <input type="date" className="w-full pl-11 pr-4 py-3.5 bg-background border border-border-medium rounded-2xl text-sm font-bold text-text-muted cursor-not-allowed opacity-40 shadow-inner-platinum" defaultValue={new Date().toISOString().split('T')[0]} readOnly />
              </div>
            </div>
            <div className="space-y-2 group">
              <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2 group-focus-within:text-primary transition-colors">Validade da Oferta</label>
              <div className="relative">
                 <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 w-4 h-4" />
                 <input type="date" className="w-full pl-11 pr-4 py-3.5 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum" />
              </div>
            </div>
            <div className="space-y-2 group">
              <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2 group-focus-within:text-primary transition-colors">Status do Fluxo</label>
              <div className="relative">
                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                <select className="w-full pl-11 pr-10 py-3.5 bg-background/50 border border-border-medium rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-primary focus:border-primary/40 outline-none appearance-none cursor-pointer shadow-inner-platinum">
                  <option value="rascunho" className="bg-surface">Rascunho Estratégico</option>
                  <option value="enviada" className="bg-surface">Documento Enviado</option>
                </select>
              </div>
            </div>
            <div className="space-y-2 group">
              <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2 group-focus-within:text-primary transition-colors">Motivação do Cliente</label>
              <div className="relative">
                 <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                 <input type="text" placeholder="Ex: Substituição Tecnológica" className="w-full pl-11 pr-4 py-3.5 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/30 shadow-inner-platinum" />
              </div>
            </div>
          </div>
        </section>

        {/* Step 2: Client Selection */}
        <section className="space-y-8 border-t border-border-subtle/20 pt-12">
          <div className="flex items-center gap-4 border-b border-border-subtle/20 pb-4">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-platinum-glow-sm">
              <User size={20} />
            </div>
            <h3 className="text-[10px] font-black text-text-primary uppercase tracking-[0.4em]">Identificação do Prospecto Neural</h3>
          </div>
          
          <div className="flex items-center gap-10 mb-6">
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${clientType === 'pj' ? 'border-primary bg-primary/10 shadow-platinum-glow-sm' : 'border-border-medium group-hover:border-primary/40'}`}>
                {clientType === 'pj' && <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-platinum-glow" />}
              </div>
              <input type="radio" name="clientType" value="pj" checked={clientType === 'pj'} onChange={() => setClientType('pj')} className="hidden" />
              <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${clientType === 'pj' ? 'text-text-primary' : 'text-text-muted group-hover:text-text-primary'}`}>Pessoa Jurídica</span>
            </label>
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${clientType === 'pf' ? 'border-primary bg-primary/10 shadow-platinum-glow-sm' : 'border-border-medium group-hover:border-primary/40'}`}>
                {clientType === 'pf' && <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-platinum-glow" />}
              </div>
              <input type="radio" name="clientType" value="pf" checked={clientType === 'pf'} onChange={() => setClientType('pf')} className="hidden" />
              <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${clientType === 'pf' ? 'text-text-primary' : 'text-text-muted group-hover:text-text-primary'}`}>Pessoa Física</span>
            </label>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5 group-focus-within:text-primary transition-colors" />
              <input type="text" placeholder="Interrogar base de clientes Platinum..." className="w-full pl-14 pr-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum" />
            </div>
            <button className="flex items-center gap-3 px-8 py-4 bg-surface-elevated/40 border border-border-subtle text-text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-surface-elevated transition-all shadow-platinum-glow-sm">
              <Plus size={16} className="text-primary" />
              Novo Registro
            </button>
          </div>
        </section>

        {/* Step 3: Items */}
        <section className="space-y-8 border-t border-border-subtle/20 pt-12">
          <div className="flex items-center justify-between border-b border-border-subtle/20 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-platinum-glow-sm">
                <Zap size={20} />
              </div>
              <h3 className="text-[10px] font-black text-text-primary uppercase tracking-[0.4em]">Escopo de Soluções Core</h3>
            </div>
            <div className="flex items-center gap-4">
               <button className="flex items-center gap-3 px-6 py-2.5 bg-surface-elevated/40 border border-border-subtle text-text-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-surface-elevated transition-all shadow-inner-platinum">
                <FileText size={14} className="text-primary" /> Do Catálogo
              </button>
              <button className="flex items-center gap-3 px-6 py-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all">
                <Plus size={14} /> Adicionar Manualmente
              </button>
            </div>
          </div>
          
          <div className="bg-surface-elevated/10 border border-border-subtle/30 p-10 rounded-[2.5rem] relative group/item transition-all hover:border-primary/20">
            <button className="absolute top-8 right-8 p-3 text-text-muted hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all bg-background/50 rounded-xl border border-border-subtle shadow-platinum-glow-sm">
              <Trash2 size={18} />
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left Column (Specs) */}
              <div className="lg:col-span-9 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2 group">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2 group-focus-within:text-primary transition-colors">Descrição Comercial*</label>
                    <input type="text" className="w-full px-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum" />
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2 group-focus-within:text-primary transition-colors">Fabricante / Marca</label>
                    <input type="text" className="w-full px-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2 group">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2 group-focus-within:text-primary transition-colors">Modelo / Referência</label>
                    <input type="text" className="w-full px-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum" />
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2 group-focus-within:text-primary transition-colors">Tipo de Transação</label>
                    <div className="relative">
                      <select className="w-full px-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-primary focus:border-primary/40 outline-none appearance-none cursor-pointer shadow-inner-platinum">
                        <option value="venda" className="bg-surface">Venda Direta Neural</option>
                        <option value="locacao" className="bg-surface">Locação de Ativos RPA</option>
                      </select>
                      <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-text-muted opacity-40" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2 group-focus-within:text-primary transition-colors">Especificação Técnica Avançada</label>
                  <textarea rows={3} className="w-full px-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-sm font-medium text-text-primary focus:border-primary/40 outline-none transition-all resize-none shadow-inner-platinum" placeholder="Descreva os parâmetros de performance e conformidade..."></textarea>
                </div>

                <div className="pt-6 border-t border-border-subtle/20 space-y-6">
                  <h4 className="text-[10px] font-black text-text-primary uppercase tracking-[0.4em] flex items-center gap-3">
                    <Plus size={14} className="text-primary shadow-platinum-glow-sm" /> 
                    Parâmetros Customizados
                  </h4>
                  
                  <div className="flex items-end gap-6">
                    <div className="flex-1 space-y-2">
                      <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2">Identificador</label>
                      <input type="text" placeholder="Ex: Voltagem" className="w-full px-5 py-3 bg-background border border-border-medium rounded-xl text-xs font-bold text-text-primary outline-none focus:border-primary/40 transition-all shadow-inner-platinum" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2">Valor do Atributo</label>
                      <input type="text" placeholder="Ex: 220V" className="w-full px-5 py-3 bg-background border border-border-medium rounded-xl text-xs font-bold text-text-primary outline-none focus:border-primary/40 transition-all shadow-inner-platinum" />
                    </div>
                    <button className="px-8 py-3 bg-surface-elevated/40 border border-border-subtle rounded-xl text-[10px] font-black uppercase tracking-widest text-text-primary hover:text-primary transition-all shadow-platinum-glow-sm">Vincular</button>
                  </div>
                </div>
              </div>

              {/* Right Column (Visual) */}
              <div className="lg:col-span-3 flex flex-col items-center">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] mb-6">Referência Visual Asset</span>
                <div className="w-full aspect-square bg-background/50 border-2 border-dashed border-border-medium rounded-[2.5rem] flex flex-col items-center justify-center group/img cursor-pointer hover:border-primary/40 transition-all duration-500 shadow-inner-platinum">
                  <ImageIcon className="w-12 h-12 text-text-muted/40 group-hover/img:text-primary transition-all duration-500 group-hover/img:scale-110" />
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-6 opacity-40">Upload Digital Object</span>
                </div>
                <button className="mt-6 text-[10px] font-black text-primary uppercase tracking-[0.3em] hover:opacity-80 transition-opacity border-b border-primary/20 pb-1">Configurar Camada Visual</button>
              </div>
            </div>

            {/* Price Line */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-8 mt-12 pt-12 border-t border-border-subtle/20">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2">Qtd*</label>
                <input type="number" defaultValue="1" className="w-full px-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-sm font-black text-text-primary outline-none shadow-inner-platinum" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2">Unitário*</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black text-xs">R$</span>
                  <input type="text" placeholder="0,00" className="w-full pl-14 pr-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-sm font-black text-text-primary outline-none shadow-inner-platinum" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2">Unidade</label>
                <input type="text" defaultValue="Unidade" className="w-full px-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary outline-none shadow-inner-platinum" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2">Margem de Negociação (%)</label>
                <input type="number" defaultValue="0" className="w-full px-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-sm font-black text-emerald-500 outline-none shadow-inner-platinum" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2">Soma Parcial Neural</label>
                <div className="w-full px-6 py-4 bg-surface-elevated/40 border border-border-subtle rounded-2xl text-sm font-black text-primary flex items-center shadow-platinum-glow-sm">
                  R$ 0,00
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 4: Logistics & Terms */}
        <section className="space-y-10 border-t border-border-subtle/20 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-platinum-glow-sm">
                  <Truck size={20} />
                </div>
                <h3 className="text-[10px] font-black text-text-primary uppercase tracking-[0.4em]">Engenharia Logística & SLA</h3>
              </div>
              <div className="flex items-center gap-8 bg-surface-elevated/10 p-8 rounded-[2.5rem] border border-border-subtle/30 shadow-inner-platinum">
                <div className="flex-1 space-y-2">
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2">Incoterm de Operação*</label>
                  <div className="relative">
                    <select className="w-full px-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-primary outline-none appearance-none cursor-pointer">
                      <option value="cif" className="bg-surface">CIF (Custódia do Remetente)</option>
                      <option value="fob" className="bg-surface">FOB (Custódia do Destinatário)</option>
                    </select>
                    <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-text-muted opacity-40" />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2">Custo de Deslocamento (R$)</label>
                  <input type="text" placeholder="R$ 0,00" className="w-full px-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-[11px] font-black text-text-primary outline-none" />
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-10 flex flex-col justify-center items-end text-right relative overflow-hidden group shadow-platinum-glow-sm">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-primary shadow-platinum-glow" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mb-4">Valuation Total Consolidado</span>
              <span className="text-5xl font-black text-text-primary tracking-tighter group-hover:text-primary transition-colors duration-700">R$ 0,00</span>
              <div className="mt-6 flex items-center gap-3 text-[10px] text-text-muted font-black uppercase tracking-[0.3em] opacity-60">
                <ShieldCheck size={16} className="text-emerald-500 animate-pulse" /> Operação Auditada via Smart Contract
              </div>
            </div>
          </div>

          <div className="space-y-8 pt-8 border-t border-border-subtle/20">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-platinum-glow-sm">
                <FileText size={20} />
              </div>
              <h3 className="text-[10px] font-black text-text-primary uppercase tracking-[0.4em]">Cláusulas & Condições Estratégicas</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {[
                { label: 'Fluxo de Faturamento', val: 'Realizado diretamente pela unidade fabril neural.' },
                { label: 'Plano de Capacitação', val: 'Treinamento técnico avançado por engenheiros especialistas.' },
                { label: 'Liquidação de Crédito', val: 'À vista via transferência eletrônica instantânea.' },
                { label: 'Janela de Deployment', val: 'Até 30 dias úteis após validação do workflow.' },
                { label: 'Garantia de Ativos', val: '12 meses contra anomalias de fabricação.' },
                { label: 'SLA de Suporte', val: 'Assistência dedicada 24/7 via canal prioritário Platinum.' },
              ].map((term, i) => (
                <div key={i} className="space-y-2 group">
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2 group-focus-within:text-primary transition-colors">{term.label}</label>
                  <input type="text" defaultValue={term.val} className="w-full px-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-[11px] font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum" />
                </div>
              ))}
              <div className="md:col-span-2 space-y-2 group">
                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2 group-focus-within:text-primary transition-colors">Cláusulas de Instalação & Homologação</label>
                <textarea rows={2} defaultValue="Realizada exclusivamente pela equipe de engenharia do BidFlow, garantindo integridade e conformidade sistêmica." className="w-full px-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-[11px] font-medium text-text-primary focus:border-primary/40 outline-none resize-none shadow-inner-platinum"></textarea>
              </div>
              <div className="md:col-span-2 space-y-2 group">
                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2 group-focus-within:text-primary transition-colors">Notas Técnicas Adicionais</label>
                <textarea rows={3} defaultValue="Sem observações de exceção registradas para este fluxo." className="w-full px-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-[11px] font-medium text-text-primary focus:border-primary/40 outline-none resize-none shadow-inner-platinum"></textarea>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="p-8 border-t border-border-subtle/30 bg-surface-elevated/20 flex items-center justify-end gap-8">
        <button onClick={onClose} className="px-10 py-4 text-[10px] font-black text-text-muted hover:text-text-primary transition-all uppercase tracking-[0.4em]">
          Abortar Processo
        </button>
        {canSave && (
          <button className="btn-primary px-14 py-5 shadow-platinum-glow uppercase text-[11px] tracking-[0.4em] flex items-center gap-4">
             <Save size={20} /> Consolidar Engenharia
          </button>
        )}
      </div>
    </div>
  );
}
