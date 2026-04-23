import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

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
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Solicitações de Pré-Proposta</h2>
      
      <div className="space-y-2">
        {mockPreProposals.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-lg p-4 transition-colors hover:bg-amber-100 dark:hover:bg-amber-900/30"
          >
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">{item.title}</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Solicitado por: <span className="font-medium">{item.requester}</span> | Nº Pré-proposta: {item.number}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors shadow-sm">
                <Trash2 className="w-4 h-4 mr-1.5" />
                Excluir
              </button>
              <button className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-md transition-colors shadow-sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Criar Proposta
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
