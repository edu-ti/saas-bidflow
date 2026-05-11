import { useState, useEffect, useCallback } from 'react';
import {
 Search, Plus, FileText, Edit, Trash2, Eye, Send, CheckCircle,
 XCircle, Clock, AlertTriangle, Download, Upload, Calendar, X,
 ChevronRight, Paperclip, User, Building, Truck, Users, DollarSign, ShieldCheck, Zap, BarChart3, Lock, Target, Loader2, FileCheck, ClipboardList, Briefcase
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
 draft: { label: 'Rascunho', style: 'bg-bg-tertiary/40 text-text-muted border-border' },
 under_review: { label: 'Em Revisão', style: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
 approved: { label: 'Aprovado', style: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
 sent_for_signature: { label: 'Em Assinatura', style: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
 active: { label: 'Ativo', style: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' },
 finished: { label: 'Finalizado', style: 'bg-bg-tertiary/60 text-text-primary border-border' },
 cancelled: { label: 'Cancelado', style: 'bg-red-500/10 text-red-500 border-red-500/20' },
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
 <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
 <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
 <div className="space-y-1">
 <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
 Lifecycle & <span className="text-primary">Contract Management</span>
 </h1>
 <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
 <ShieldCheck size={14} className="text-primary" />
 Governança jurídica, templates dinâmicos e orquestração de assinaturas.
 </p>
 </div>
 <div className="flex items-center gap-5">
 <button className="px-8 py-3.5 bg-bg-tertiary border border-border text-text-primary rounded-2xl text-xs font-semibold uppercase tracking-wider hover:bg-bg-tertiary/80 transition-all ">
 Templates
 </button>
 <button className="btn btn-primary py-3.5 px-10 ">
 <Plus className="w-5 h-5" />
 Novo Contrato
 </button>
 </div>
 </header>

 {/* Tabs Filter */}
 <div className="flex gap-3 p-2 bg-bg-tertiary/20 border border-border rounded-xl w-fit overflow-x-auto max-w-full ">
 {[
 { key: '', label: 'Dossiê Completo', icon: ClipboardList },
 { key: 'draft', label: 'Rascunhos', icon: FileText },
 { key: 'under_review', label: 'Em Auditoria', icon: Eye },
 { key: 'active', label: 'Vigentes', icon: ShieldCheck },
 ].map(tab => (
 <button
 key={tab.key}
 onClick={() => setStatusFilter(tab.key)}
 className={`flex items-center gap-3 px-8 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
 statusFilter === tab.key ? 'bg-primary text-background ' : 'text-text-muted hover:text-text-primary hover:bg-bg-tertiary/40'
 }`}
 >
 {tab.icon && <tab.icon size={14} />}
 {tab.label}
 </button>
 ))}
 </div>

 <div className="card overflow-hidden bg-bg-tertiary/10 backdrop-blur-md">
 <div className="p-8 bg-bg-tertiary/10 border-b border-border">
 <div className="relative max-w-xl">
 <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
 <input
 type="text"
 placeholder="Buscar por Nº, Cliente, Objeto ou ID Fiscal..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full pl-14 pr-6 py-4 bg-background/50 border border-border rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 "
 />
 </div>
 </div>

 <div className="overflow-x-auto ">
 <table className="w-full text-left text-sm">
 <thead>
 <tr className="bg-bg-tertiary/30 border-b border-border">
 <th className="px-10 py-6 font-semibold uppercase text-xs tracking-widest text-text-muted opacity-60">Nº / Registro</th>
 <th className="px-10 py-6 font-semibold uppercase text-xs tracking-widest text-text-muted opacity-60">Contraparte</th>
 <th className="px-10 py-6 font-semibold uppercase text-xs tracking-widest text-text-muted opacity-60">Valuation</th>
 <th className="px-10 py-6 font-semibold uppercase text-xs tracking-widest text-text-muted opacity-60">Status</th>
 <th className="px-10 py-6 font-semibold uppercase text-xs tracking-widest text-text-muted opacity-60 text-right">Ações</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/30">
 {loading ? (
 <tr>
 <td colSpan={5} className="px-10 py-24 text-center">
 <div className="flex flex-col items-center gap-6 opacity-40">
 <Loader2 className="w-12 h-12 animate-spin text-primary" />
 <p className="text-xs font-semibold uppercase ">Indexando Contratos...</p>
 </div>
 </td>
 </tr>
 ) : contracts.map(contract => (
 <tr key={contract.id} className="hover:bg-bg-tertiary/20 transition-all group border-b border-border/20 duration-300">
 <td className="px-10 py-8 font-mono text-sm font-semibold text-text-primary uppercase tracking-tight group-hover:text-primary transition-colors">
 {contract.contract_number}
 </td>
 <td className="px-10 py-8">
 <div className="font-semibold text-text-primary uppercase text-xs tracking-tight">
 {contract.contractable?.name || contract.contractable?.corporate_name || 'Contraparte Indefinida'}
 </div>
 <div className="text-xs text-text-muted font-semibold mt-2 uppercase tracking-wider opacity-60 flex items-center gap-2">
 <Briefcase size={10} className="text-primary/60" />
 {contract.template?.name || 'Venda Direta '}
 </div>
 </td>
 <td className="px-10 py-8">
 <div className="flex flex-col">
 <span className="text-text-primary font-semibold text-sm tracking-tight">{formatCurrency(contract.value)}</span>
 <span className="text-xs text-text-muted uppercase tracking-wider font-semibold italic mt-1 opacity-50">Expira em {new Date(contract.end_date).toLocaleDateString()}</span>
 </div>
 </td>
 <td className="px-10 py-8">
 <span className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-xl border backdrop-blur-md ${STATUS_CONFIG[contract.status]?.style}`}>
 {STATUS_CONFIG[contract.status]?.label || contract.status}
 </span>
 </td>
 <td className="px-10 py-8 text-right">
 <div className="flex justify-end gap-3">
 <button onClick={() => openDetail(contract)} className="p-3 bg-bg-tertiary/40 border border-border rounded-xl text-text-muted hover:text-primary hover:scale-110 transition-all"><Eye size={18} /></button>
 <button className="p-3 bg-bg-tertiary/40 border border-border rounded-xl text-text-muted hover:text-primary hover:scale-110 transition-all"><Edit size={18} /></button>
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
 <div className="space-y-10 p-2">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 bg-bg-tertiary/20 p-8 rounded-xl border border-border backdrop-blur-md">
 <div className="space-y-4">
 <span className="text-xs font-semibold text-primary uppercase ">Lifecycle Position</span>
 <div className="flex items-center gap-8 mt-6">
 {TIMELINE_STEPS.map((step, i) => {
 const steps = ['draft', 'under_review', 'approved', 'sent_for_signature', 'active'];
 const currentIdx = steps.indexOf(selectedContract.status);
 const isActive = i <= currentIdx;
 return (
 <div key={i} className="flex flex-col items-center gap-3 relative">
 <div className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 ${isActive ? 'border-primary bg-primary/10 text-primary ' : 'border-border text-text-muted opacity-40'}`}>
 <step.icon size={20} />
 </div>
 <span className={`text-xs font-semibold uppercase tracking-wider ${isActive ? 'text-text-primary' : 'text-text-muted'}`}>{step.label}</span>
 </div>
 );
 })}
 </div>
 </div>
 <div className="text-right flex flex-col items-end">
 <p className="text-xs font-semibold text-text-muted uppercase tracking-widest opacity-60">Valuation Consolidado</p>
 <p className="text-2xl font-semibold text-text-primary tracking-tight mt-2">{formatCurrency(selectedContract.value)}</p>
 </div>
 </div>

 <div className="flex gap-4 p-2 bg-bg-tertiary/20 border border-border rounded-xl w-fit ">
 {[
 { id: 'doc', label: 'Documento', icon: FileText },
 { id: 'approvals', label: 'Audit Trail', icon: BarChart3 },
 { id: 'finance', label: 'Financeiro', icon: DollarSign }
 ].map(t => (
 <button
 key={t.id}
 onClick={() => setDetailTab(t.id as any)}
 className={`flex items-center gap-3 px-8 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
 detailTab === t.id ? 'bg-bg-tertiary text-text-primary ' : 'text-text-muted hover:text-text-primary'
 }`}
 >
 <t.icon size={14} />
 {t.label}
 </button>
 ))}
 </div>

 {detailTab === 'doc' && (
 <div className="card p-14 bg-white shadow-2xl rounded-2xl text-slate-800 font-serif text-base leading-relaxed overflow-y-auto max-h-[500px] border-4 border-slate-100 ">
 <div className="uppercase font-semibold text-center mb-12 tracking-widest border-b-2 border-slate-100 pb-8 text-slate-900 text-lg">Instrumento Particular de Contrato</div>
 <div className="whitespace-pre-wrap">
 {selectedContract.generated_content || 'Aguardando consolidação de conteúdo estratégico para este instrumento...'}
 </div>
 </div>
 )}

 <div className="flex justify-end gap-6 pt-10 border-t border-border">
 <button onClick={() => setShowDetailModal(false)} className="px-10 py-4 text-text-muted font-semibold hover:text-text-primary transition-all text-xs uppercase tracking-widest">Fechar Dossiê</button>
 {selectedContract.status === 'draft' && (
 <button onClick={() => handleStatusChange(selectedContract.id, 'under_review')} className="btn btn-primary py-4 px-12 uppercase text-xs tracking-widest">
 <Send size={18} /> Enviar para Auditoria
 </button>
 )}
 {selectedContract.status === 'active' && (
 <button className="px-12 py-4 bg-emerald-500 text-white font-semibold rounded-2xl hover:bg-emerald-600 transition-all text-xs uppercase tracking-widest flex items-center gap-3">
 <Download size={18} /> Exportar Assinado
 </button>
 )}
 </div>
 </div>
 )}
 </Modal>
 </div>
 );
}
