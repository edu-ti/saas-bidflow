import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, FileText, Edit, Trash2, Eye, Send, CheckCircle,
  XCircle, Clock, AlertTriangle, Download, Upload, Calendar, X,
  ChevronRight, Paperclip, User, Building, Truck, Users, DollarSign, ShieldCheck, Zap, BarChart3, Lock, Target, Loader2
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';

type Contract = {
  id: number;
  contract_number: string;
  status: string;
  value: number;
  start_date: string;
  end_date: string;
  template?: { id: number; name: string; type: string };
  contractable?: { name?: string; corporate_name?: string };
  generated_content?: string;
  approvals?: any[];
  receivables?: any[];
};

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
  draft: { label: 'Rascunho', style: 'bg-white/5 text-text-muted border-white/10' },
  under_review: { label: 'Em Revisão', style: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  approved: { label: 'Aprovado', style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  sent_for_signature: { label: 'Em Assinatura', style: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  active: { label: 'Ativo', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  finished: { label: 'Finalizado', style: 'bg-white/10 text-white border-white/20' },
  cancelled: { label: 'Cancelado', style: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const TIMELINE_STEPS = [
  { key: 'draft', label: 'Elaboração', icon: FileText },
  { key: 'under_review', label: 'Revisão', icon: Eye },
  { key: 'approved', label: 'Aprovação', icon: CheckCircle },
  { key: 'sent_for_signature', label: 'Assinatura', icon: Send },
  { key: 'active', label: 'Execução', icon: ShieldCheck },
];

export default function ContractsDashboard() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [detailTab, setDetailTab] = useState<'doc' | 'approvals' | 'finance'>('doc');

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/contracts?search=${search}&status=${statusFilter}`);
      setContracts(res.data.data || res.data || []);
    } catch (err) { toast.error('Erro ao sincronizar contratos'); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const openDetail = async (contract: Contract) => {
    try {
      const res = await api.get(`/api/contracts/${contract.id}`);
      setSelectedContract(res.data);
      setShowDetailModal(true);
    } catch (err) { toast.error('Erro ao carregar dossiê'); }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.patch(`/api/contracts/${id}/status`, { status });
      toast.success('Ciclo de vida atualizado.');
      fetchContracts();
      setShowDetailModal(false);
    } catch (err) { toast.error('Falha na transição de status'); }
  };

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-8 text-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Lifecycle & <span className="text-gradient-gold">Contract Management</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <ShieldCheck size={12} className="text-primary" />
            Governança jurídica, templates dinâmicos e orquestração de assinaturas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            Templates
          </button>
          <button className="px-6 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow uppercase text-[10px] tracking-widest">
            Novo Contrato
          </button>
        </div>
      </header>

      {/* Tabs Filter */}
      <div className="flex gap-2 p-1 bg-white/[0.02] border border-white/5 rounded-2xl w-fit overflow-x-auto max-w-full">
        {[
          { key: '', label: 'Dossiê Completo' },
          { key: 'draft', label: 'Rascunhos' },
          { key: 'under_review', label: 'Em Auditoria' },
          { key: 'active', label: 'Vigentes' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              statusFilter === tab.key ? 'bg-primary text-background shadow-platinum-glow' : 'text-text-muted hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="platinum-card overflow-hidden">
        <div className="p-4 bg-white/[0.01] border-b border-white/5">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar por Nº, Cliente ou Objeto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-background border border-white/5 rounded-xl text-sm text-white focus:border-primary/30 outline-none transition-all placeholder:text-text-muted"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/5">
              <tr>
                <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Nº / Registro</th>
                <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Contraparte</th>
                <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Valuation</th>
                <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Status</th>
                <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-text-muted"><Loader2 className="animate-spin inline mr-2" /> Indexando Contratos...</td></tr>
              ) : contracts.map(contract => (
                <tr key={contract.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-6 font-mono text-xs font-bold text-white uppercase tracking-tighter">
                    {contract.contract_number}
                  </td>
                  <td className="px-6 py-6">
                    <div className="font-bold text-white uppercase text-xs">
                      {contract.contractable?.name || contract.contractable?.corporate_name || '-'}
                    </div>
                    <div className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-widest">
                      {contract.template?.name || 'Venda Direta'}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-white font-black">{formatCurrency(contract.value)}</span>
                      <span className="text-[8px] text-text-muted uppercase tracking-widest font-black italic">Exp. {new Date(contract.end_date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border ${STATUS_CONFIG[contract.status]?.style}`}>
                      {STATUS_CONFIG[contract.status]?.label || contract.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openDetail(contract)} className="p-2 text-text-muted hover:text-primary transition-all"><Eye size={16} /></button>
                      <button className="p-2 text-text-muted hover:text-primary transition-all"><Edit size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="DOSSIÊ ESTRATÉGICO DE CONTRATO" size="xl">
        {selectedContract && (
          <div className="space-y-8 p-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
              <div className="space-y-2">
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Lifecycle Position</span>
                <div className="flex items-center gap-6 mt-4">
                  {TIMELINE_STEPS.map((step, i) => {
                    const steps = ['draft', 'under_review', 'approved', 'sent_for_signature', 'active'];
                    const currentIdx = steps.indexOf(selectedContract.status);
                    const isActive = i <= currentIdx;
                    return (
                      <div key={i} className="flex flex-col items-center gap-2 relative">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? 'border-primary bg-primary/10 text-primary shadow-platinum-glow' : 'border-white/10 text-text-muted'}`}>
                          <step.icon size={14} />
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-text-muted'}`}>{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Valuation do Contrato</p>
                <p className="text-3xl font-black text-white">{formatCurrency(selectedContract.value)}</p>
              </div>
            </div>

            <div className="flex gap-4 p-1 bg-white/[0.02] border border-white/5 rounded-2xl w-fit">
              {['doc', 'approvals', 'finance'].map(t => (
                <button
                  key={t}
                  onClick={() => setDetailTab(t as any)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    detailTab === t ? 'bg-white/10 text-white' : 'text-text-muted hover:text-white'
                  }`}
                >
                  {t === 'doc' ? 'Documento' : t === 'approvals' ? 'Audit Trail' : 'Financeiro'}
                </button>
              ))}
            </div>

            {detailTab === 'doc' && (
              <div className="platinum-card p-10 bg-white shadow-2xl rounded-[2rem] text-background font-serif text-sm leading-relaxed overflow-y-auto max-h-[400px]">
                <div className="uppercase font-black text-center mb-8 tracking-[0.2em] border-b-2 border-background/10 pb-4">Instrumento Particular de Contrato</div>
                {selectedContract.generated_content || 'Aguardando consolidação de conteúdo...'}
              </div>
            )}

            <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
              <button onClick={() => setShowDetailModal(false)} className="px-8 py-3 text-text-muted font-bold hover:text-white transition-all text-xs uppercase tracking-widest">Fechar</button>
              {selectedContract.status === 'draft' && (
                <button onClick={() => handleStatusChange(selectedContract.id, 'under_review')} className="px-10 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow text-xs uppercase tracking-widest flex items-center gap-2">
                  <Send size={14} /> Enviar para Auditoria
                </button>
              )}
              {selectedContract.status === 'active' && (
                <button className="px-10 py-3 bg-emerald-500 text-background font-black rounded-xl hover:bg-emerald-600 transition-all shadow-platinum-glow text-xs uppercase tracking-widest flex items-center gap-2">
                  <Download size={14} /> Exportar Assinado
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
