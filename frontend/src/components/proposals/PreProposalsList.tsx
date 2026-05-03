import React from 'react';
import { Plus, Trash2, User, FileText, Lock, ShieldAlert } from 'lucide-react';

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
    <div className="platinum-card p-8 mb-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <ShieldAlert size={20} />
        </div>
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Requisições de Pré-Proposta</h2>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5 italic">Demandas internas pendentes de formalização</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {mockPreProposals.map((item) => (
          <div 
            key={item.id} 
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/[0.02] border border-white/5 rounded-2xl p-5 transition-all hover:bg-white/[0.04] hover:border-white/10 group"
          >
            <div className="space-y-2 mb-4 sm:mb-0">
              <h3 className="font-bold text-sm text-white group-hover:text-primary transition-colors">{item.title}</h3>
              <div className="flex flex-wrap items-center gap-4 text-[10px] text-text-muted font-black uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><User size={12} className="text-primary/60" /> {item.requester}</span>
                <span className="flex items-center gap-1.5"><FileText size={12} className="text-primary/60" /> REF: {item.number !== 'null' ? item.number : 'PENDENTE'}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                aria-label="Descartar solicitação"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-[10px] font-black text-red-400 bg-red-400/5 hover:bg-red-400/10 border border-red-400/20 rounded-xl transition-all uppercase tracking-widest"
              >
                <Trash2 size={12} />
                Descartar
              </button>
              <button 
                aria-label="Formalizar proposta"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 text-[10px] font-black text-background bg-primary hover:bg-primary-hover rounded-xl transition-all shadow-platinum-glow uppercase tracking-widest"
              >
                <Plus size={14} />
                Formalizar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
