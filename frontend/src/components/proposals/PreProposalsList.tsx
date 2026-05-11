import React, { useState } from 'react';
import { Plus, Trash2, User, FileText, ShieldAlert } from 'lucide-react';

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
    <div className="card p-6 mb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center text-primary">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Requisições de Pré-Proposta</h2>
            <p className="text-xs text-text-muted mt-0.5">Demandas internas pendentes de formalização</p>
          </div>
        </div>
        <span className="badge badge-primary text-xs">
          {mockPreProposals.length} pendentes
        </span>
      </div>
      
      <div className="space-y-3">
        {mockPreProposals.map((item) => (
          <div 
            key={item.id} 
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-bg-tertiary/50 border border-border rounded-xl p-5 transition-colors hover:border-primary/30"
          >
            <div className="space-y-1.5 mb-4 sm:mb-0">
              <h3 className="font-medium text-sm text-text-primary">{item.title}</h3>
              <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1.5"><User size={12} className="text-primary/60" /> {item.requester}</span>
                <span className="flex items-center gap-1.5"><FileText size={12} className="text-primary/60" /> REF: {item.number !== 'null' ? item.number : 'PENDENTE'}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button className="btn btn-ghost text-red-500 hover:bg-red-500/10 text-xs">
                <Trash2 size={14} />
                Descartar
              </button>
              <button className="btn btn-primary text-xs">
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
