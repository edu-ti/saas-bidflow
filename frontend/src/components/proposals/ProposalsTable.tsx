import React, { useState } from 'react';
import { Search, Plus, Eye, Edit, Copy, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProposalData {
  id: string;
  number: string;
  date: string;
  client: string;
  contact: string;
  document: string; // CNPJ/CPF
  value: string;
  status: 'Enviada' | 'Negociando' | 'Rascunho' | 'Aceita' | 'Rejeitada';
  funnelStage: string;
}

const mockProposals: ProposalData[] = [
  { id: '1', number: '084/2026', date: '20/04/2026', client: 'IOA', contact: 'Clebson Bonifácio', document: '06.001.422/0001-51', value: 'R$ 23.970,00', status: 'Enviada', funnelStage: 'Proposta' },
  { id: '2', number: '083/2026', date: '19/04/2026', client: 'IOA', contact: 'Clebson Bonifácio', document: '06.001.422/0001-52', value: 'R$ 44.200,00', status: 'Enviada', funnelStage: 'Proposta' },
  { id: '3', number: '082/2026', date: '19/04/2026', client: 'HOSPITAL SANTA TEREZINHA', contact: 'N/A', document: '09.357.561/0001-34', value: 'R$ 150.000,00', status: 'Enviada', funnelStage: 'Proposta' },
  { id: '4', number: '081/2026', date: '19/04/2026', client: 'NOVA IMAGEM', contact: 'N/A', document: '05.080.920/0001-00', value: 'R$ 8.604,00', status: 'Negociando', funnelStage: 'Negociação' },
  { id: '5', number: '080/2026', date: '19/04/2026', client: 'DR. JOÃO MORAIS', contact: 'N/A', document: '00000000001', value: 'R$ 63.822,00', status: 'Enviada', funnelStage: 'Proposta' },
];

export default function ProposalsTable({ onCreateClick }: { onCreateClick: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Enviada': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Negociando': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'Rascunho': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
      case 'Aceita': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Rejeitada': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
      
      {/* Header & Controls */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Propostas</h2>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
            />
          </div>
          <button 
            onClick={onCreateClick}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Nova
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 font-semibold">Nº</th>
              <th className="px-6 py-4 font-semibold">Data</th>
              <th className="px-6 py-4 font-semibold">Cliente</th>
              <th className="px-6 py-4 font-semibold">Contato do Cliente</th>
              <th className="px-6 py-4 font-semibold">CNPJ/CPF</th>
              <th className="px-6 py-4 font-semibold">Valor</th>
              <th className="px-6 py-4 font-semibold text-center">Status</th>
              <th className="px-6 py-4 font-semibold">Etapa do Funil</th>
              <th className="px-6 py-4 font-semibold text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {mockProposals.map((proposal) => (
              <tr key={proposal.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{proposal.number}</td>
                <td className="px-6 py-4">{proposal.date}</td>
                <td className="px-6 py-4">{proposal.client}</td>
                <td className="px-6 py-4">{proposal.contact}</td>
                <td className="px-6 py-4">{proposal.document}</td>
                <td className="px-6 py-4 font-medium">{proposal.value}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(proposal.status)}`}>
                    {proposal.status}
                  </span>
                </td>
                <td className="px-6 py-4">{proposal.funnelStage}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center space-x-3">
                    <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors" title="Visualizar">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors" title="Editar">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors" title="Duplicar">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors" title="Excluir">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination (Mocked) */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Mostrando <span className="font-medium text-slate-900 dark:text-white">5</span> de <span className="font-medium text-slate-900 dark:text-white">107</span> propostas
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1.5 rounded-md border border-slate-300 dark:border-slate-600 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-2">
            Página 1 de 22
          </span>
          <button className="p-1.5 rounded-md border border-slate-300 dark:border-slate-600 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
