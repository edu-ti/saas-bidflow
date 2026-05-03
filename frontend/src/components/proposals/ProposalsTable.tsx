import React, { useState } from 'react';
import { Search, Plus, Eye, Edit, Copy, Trash2, ChevronLeft, ChevronRight, Lock, DollarSign, FileText, User, Layout, Briefcase, Target, ShieldCheck } from 'lucide-react';

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
      case 'Enviada': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Negociando': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Rascunho': return 'bg-surface-elevated/40 text-text-muted border-border-subtle';
      case 'Aceita': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Rejeitada': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-surface-elevated/40 text-text-muted border-border-subtle';
    }
  };

  return (
    <div className="platinum-card overflow-hidden animate-in fade-in duration-700 bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30">
      <div className="p-8 border-b border-border-subtle/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-text-primary uppercase tracking-[0.2em] flex items-center gap-3">
             <div className="w-1.5 h-6 bg-primary rounded-full shadow-platinum-glow" />
             Registro de Propostas
          </h2>
          <p className="text-[10px] text-text-muted font-black uppercase tracking-widest italic opacity-60">Base de documentos comerciais formalizados</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Interrogar por cliente ou nº..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum"
            />
          </div>
          <button 
            onClick={onCreateClick}
            className="btn-primary py-4 px-10 shadow-platinum-glow flex items-center gap-3 uppercase text-[10px] tracking-widest whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Gerar Proposta Neural
          </button>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-platinum">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-elevated/40 border-b border-border-subtle">
            <tr>
              <th className="px-8 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Documentação</th>
              <th className="px-8 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Cliente / Contato</th>
              <th className="px-8 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Identificador Digital</th>
              <th className="px-8 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Valuation Core</th>
              <th className="px-8 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60 text-center">Status Operacional</th>
              <th className="px-8 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/20">
            {mockProposals.map((proposal) => (
              <tr key={proposal.id} className="hover:bg-surface-elevated/20 transition-all group border-b border-border-subtle/10 duration-300">
                <td className="px-8 py-8">
                  <div className="font-black text-text-primary group-hover:text-primary transition-colors uppercase tracking-tight text-sm">#{proposal.number}</div>
                  <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1 opacity-40">{proposal.date}</div>
                </td>
                <td className="px-8 py-8 space-y-2">
                  <div className="font-black text-xs text-text-primary uppercase tracking-tight group-hover:text-primary transition-colors">{proposal.client}</div>
                  <div className="flex items-center gap-2 text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-60">
                    <User size={12} className="text-primary/60" />
                    {proposal.contact !== 'N/A' ? proposal.contact : 'ACESSO DIRETO'}
                  </div>
                </td>
                <td className="px-8 py-8 font-black text-[11px] text-text-secondary tracking-widest opacity-80">{proposal.document}</td>
                <td className="px-8 py-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-text-primary font-black tracking-tighter text-sm group-hover:text-primary transition-colors">{proposal.value}</span>
                    <span className="text-[9px] text-text-muted uppercase font-black tracking-[0.2em] italic opacity-40">{proposal.funnelStage}</span>
                  </div>
                </td>
                <td className="px-8 py-8 text-center">
                  <span className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border w-fit mx-auto shadow-platinum-glow-sm ${getStatusStyle(proposal.status)}`}>
                    <div className="w-2 h-2 rounded-full bg-current animate-pulse shadow-platinum-glow" />
                    {proposal.status}
                  </span>
                </td>
                <td className="px-8 py-8 text-right">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                    <button className="p-3 bg-surface-elevated/40 border border-border-subtle rounded-xl text-text-muted hover:text-primary transition-all shadow-inner-platinum" title="Visualizar"><Eye size={18} /></button>
                    <button className="p-3 bg-surface-elevated/40 border border-border-subtle rounded-xl text-text-muted hover:text-primary transition-all shadow-inner-platinum" title="Editar"><Edit size={18} /></button>
                    <button className="p-3 bg-surface-elevated/40 border border-border-subtle rounded-xl text-text-muted hover:text-primary transition-all shadow-inner-platinum" title="Duplicar"><Copy size={18} /></button>
                    <button className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500/60 hover:text-red-500 transition-all shadow-inner-platinum" title="Excluir"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-8 border-t border-border-subtle/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">
          Exibindo <span className="text-text-primary font-black">05</span> de <span className="text-text-primary font-black">107</span> documentos estratégicos
        </div>
        <div className="flex items-center gap-6">
          <button className="p-3 text-text-muted hover:text-primary border border-border-subtle rounded-xl hover:bg-surface-elevated/50 transition-all shadow-inner-platinum">
            <ChevronLeft size={18} />
          </button>
          <span className="text-[11px] font-black text-text-primary uppercase tracking-[0.3em] opacity-80">
            Pág. 01 <span className="opacity-30 mx-2">/</span> 22
          </span>
          <button className="p-3 text-text-muted hover:text-primary border border-border-subtle rounded-xl hover:bg-surface-elevated/50 transition-all shadow-inner-platinum">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
