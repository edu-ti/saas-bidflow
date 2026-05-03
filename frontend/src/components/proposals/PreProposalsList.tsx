import React from 'react';
import { Plus, Trash2, User, FileText, Lock, ShieldAlert, Sparkles, ChevronRight } from 'lucide-react';

interface PreProposal {
  id: string;
  title: string;
  requester: string;
  number: string;
}

const mockPreProposals: PreProposal[] = [
  { id: '1', title: 'UG 70 (HOSPITAL SANTA TEREZINHA)', requester: 'Paulo Quintino', number: 'null' },
  { id: '2', title: 'Sedline Getúlio Vargas (HOSPITAL GETÚLIO VARGAS)', requester: 'Paulo Quintino', number: '0618/2026' },
  { id: '3', title: 'Monitorização (UNIMED DE NATAL)', requester: 'Belônia', number: '003/2026' },
  { id: '4', title: 'Monitorização (CASA DE SAUDE SAO LUCAS S/A)', requester: 'Iolanda', number: '001/2026' },
  { id: '5', title: 'HIPEC (CASA DE SAUDE SAO LUCAS S/A)', requester: 'Antônio', number: '005/2026' },
  { id: '6', title: 'Fechamento do Externa (HOSPITAL DO CORACAO DE NATAL)', requester: 'Belônia', number: '004/2026' },
  { id: '7', title: 'Mapa Real Cardiologia (Real Cardiologia)', requester: 'Paulo Quintino', number: '0617/2026' },
  { id: '8', title: 'MÁQUINA ESSENZ (IMIP HOSPITALAR - DOM HELDER)', requester: 'Rubens Arantes Júnior', number: '0609/2026' },
];

export default function PreProposalsList() {
  if (mockPreProposals.length === 0) return null;

  return (
    <div className="platinum-card p-10 mb-10 animate-in fade-in duration-500 bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-platinum-glow-sm">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h2 className="text-sm font-black text-text-primary uppercase tracking-[0.4em]">Requisições de Pré-Proposta</h2>
            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1 opacity-60 italic">Demandas internas pendentes de formalização estratégica</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/10 text-[9px] font-black text-primary uppercase tracking-widest">
           <Sparkles size={12} className="animate-pulse" /> IA Sugestion Ativa
        </div>
      </div>
      
      <div className="space-y-4">
        {mockPreProposals.map((item) => (
          <div 
            key={item.id} 
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-surface-elevated/20 border border-border-subtle/30 rounded-3xl p-6 transition-all duration-500 hover:bg-surface-elevated/40 hover:border-primary/30 group shadow-inner-platinum"
          >
            <div className="space-y-3 mb-6 sm:mb-0">
              <h3 className="font-black text-sm text-text-primary group-hover:text-primary transition-colors tracking-tight uppercase">{item.title}</h3>
              <div className="flex flex-wrap items-center gap-6 text-[10px] text-text-muted font-black uppercase tracking-widest opacity-60">
                <span className="flex items-center gap-2.5"><User size={14} className="text-primary/60" /> {item.requester}</span>
                <span className="flex items-center gap-2.5"><FileText size={14} className="text-primary/60" /> REF: {item.number !== 'null' ? item.number : 'PENDENTE_SINC'}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button 
                className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-3.5 text-[10px] font-black text-red-500 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-2xl transition-all uppercase tracking-widest"
              >
                <Trash2 size={14} />
                Descartar
              </button>
              <button 
                className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-10 py-3.5 text-[10px] font-black text-background bg-primary hover:bg-primary-hover rounded-2xl transition-all shadow-platinum-glow uppercase tracking-widest group-hover:scale-105"
              >
                <Plus size={16} />
                Formalizar
                <ChevronRight size={14} className="ml-1 opacity-40" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
