import React, { useState } from 'react';
import { Search, Plus, Eye, Edit, Copy, Trash2, ChevronLeft, ChevronRight, Lock, DollarSign, FileText, User } from 'lucide-react';

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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Enviada': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Negociando': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Rascunho': return 'bg-white/5 text-text-muted border-white/10';
      case 'Aceita': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Rejeitada': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-white/5 text-text-muted border-white/10';
    }
  };

  return (
    <div className="platinum-card overflow-hidden animate-in fade-in duration-700">
      <div className="p-8 bg-white/[0.01] border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-white uppercase tracking-[0.2em]">Registro de Propostas</h2>
          <p className="text-[10px] text-text-muted font-black uppercase tracking-widest italic">Base de documentos comerciais formalizados</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Pesquisar por cliente ou número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-background/50 border border-white/5 rounded-xl text-sm focus:border-primary/30 outline-none transition-all text-white placeholder:text-text-muted"
            />
          </div>
          <button 
            onClick={onCreateClick}
            aria-label="Iniciar nova proposta de valor"
            className="flex items-center gap-3 px-6 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow uppercase text-xs tracking-widest whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Gerar Proposta
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 border-b border-white/5">
            <tr>
              <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Documentação</th>
              <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Cliente / Contato</th>
              <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">CNPJ / CPF</th>
              <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Valor Total</th>
              <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-center">Status</th>
              <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mockProposals.map((proposal) => (
              <tr key={proposal.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-6">
                  <div className="font-bold text-white group-hover:text-primary transition-colors uppercase tracking-tight">#{proposal.number}</div>
                  <div className="text-[10px] text-text-muted font-bold mt-1">{proposal.date}</div>
                </td>
                <td className="px-6 py-6 space-y-1">
                  <div className="font-bold text-xs text-white uppercase">{proposal.client}</div>
                  <div className="flex items-center gap-2 text-[10px] text-text-muted">
                    <User size={10} className="text-primary/60" />
                    {proposal.contact !== 'N/A' ? proposal.contact : 'Direto'}
                  </div>
                </td>
                <td className="px-6 py-6 font-mono text-[10px] text-text-secondary">{proposal.document}</td>
                <td className="px-6 py-6">
                  <div className="flex flex-col">
                    <span className="text-white font-black tracking-tight">{proposal.value}</span>
                    <span className="text-[8px] text-text-muted uppercase font-black tracking-widest">{proposal.funnelStage}</span>
                  </div>
                </td>
                <td className="px-6 py-6 text-center">
                  <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border ${getStatusStyle(proposal.status)}`}>
                    {proposal.status}
                  </span>
                </td>
                <td className="px-6 py-6 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-2 text-text-muted hover:text-primary transition-all" title="Visualizar"><Eye size={16} /></button>
                    <button className="p-2 text-text-muted hover:text-primary transition-all" title="Editar"><Edit size={16} /></button>
                    <button className="p-2 text-text-muted hover:text-primary transition-all" title="Duplicar"><Copy size={16} /></button>
                    <button className="p-2 text-text-muted hover:text-red-400 transition-all" title="Excluir"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-white/[0.01] border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
          Exibindo <span className="text-white">05</span> de <span className="text-white">107</span> documentos estratégicos
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-text-muted hover:text-primary border border-white/5 rounded-lg hover:bg-white/5 transition-all">
            <ChevronLeft size={16} />
          </button>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">
            Pág. 01 / 22
          </span>
          <button className="p-2 text-text-muted hover:text-primary border border-white/5 rounded-lg hover:bg-white/5 transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
