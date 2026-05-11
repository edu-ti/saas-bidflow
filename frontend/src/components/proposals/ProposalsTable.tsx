import React, { useState } from 'react';
import { Search, Plus, Eye, Edit, Copy, Trash2, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';

interface ProposalData {
  id: string;
  number: string;
  date: string;
  client: string;
  contact: string;
  document: string;
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
  const { hasPermission } = usePermissions();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Enviada': return 'badge-primary';
      case 'Negociando': return 'badge-warning';
      case 'Rascunho': return 'badge-default';
      case 'Aceita': return 'badge-success';
      case 'Rejeitada': return 'badge-danger';
      default: return 'badge-default';
    }
  };

  return (
    <div className="card overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-border flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Registro de Propostas</h2>
          <p className="text-xs text-text-muted mt-0.5">Base de documentos comerciais formalizados</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por cliente ou nº..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9"
            />
          </div>
          {hasPermission('commercial', 'proposals', 'create') && (
            <button 
              onClick={onCreateClick}
              className="btn btn-primary text-xs"
            >
              <Plus size={14} />
              Criar Proposta
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Documento</th>
              <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Cliente / Contato</th>
              <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">CNPJ/CPF</th>
              <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Valor</th>
              <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider text-center">Status</th>
              <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockProposals.map((proposal) => (
              <tr key={proposal.id} className="hover:bg-bg-tertiary/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-medium text-sm text-text-primary">#{proposal.number}</div>
                  <div className="text-xs text-text-muted mt-0.5">{proposal.date}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-sm text-text-primary">{proposal.client}</div>
                  <div className="flex items-center gap-1 text-xs text-text-muted mt-0.5">
                    <User size={12} />
                    {proposal.contact !== 'N/A' ? proposal.contact : 'ACESSO DIRETO'}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">{proposal.document}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-sm text-text-primary">{proposal.value}</div>
                  <div className="text-xs text-text-muted mt-0.5">{proposal.funnelStage}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`badge text-xs ${getStatusStyle(proposal.status)}`}>
                    {proposal.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="btn btn-ghost p-2" title="Visualizar"><Eye size={16} /></button>
                    {hasPermission('commercial', 'proposals', 'edit') && (
                      <button className="btn btn-ghost p-2" title="Editar"><Edit size={16} /></button>
                    )}
                    <button className="btn btn-ghost p-2" title="Duplicar"><Copy size={16} /></button>
                    {hasPermission('commercial', 'proposals', 'delete') && (
                      <button className="btn btn-ghost p-2 text-red-500 hover:bg-red-500/10" title="Excluir"><Trash2 size={16} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-xs text-text-muted">
          Exibindo <span className="font-medium text-text-primary">05</span> de <span className="font-medium text-text-primary">107</span> documentos
        </span>
        <div className="flex items-center gap-3">
          <button className="btn btn-ghost p-2">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-text-primary">
            Pág. 01 / 22
          </span>
          <button className="btn btn-ghost p-2">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
