import { useState, useEffect, useCallback, useRef } from 'react';
import {
 Plus, Search, Send, CheckCircle2, X, Trash2, Loader2,
 Mail, Users, Calendar, FileText, Eye, Edit2, Lock, ShieldCheck, Zap, BarChart3, ChevronRight, Target, Globe, Activity, Database
} from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { Select } from './ui/Select';
import { ConfirmDialog } from './ui/Modal';
import { usePermissions } from '../hooks/usePermissions';

interface EmailCampaign {
 id: number;
 name: string;
 subject: string;
 body: string;
 status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
 recipient_count: number;
 sent_count: number;
 open_count: number;
 click_count: number;
 scheduled_at: string;
 sent_at: string;
 created_at: string;
}

interface Lead {
 id: number;
 name: string;
 email: string;
}

const STATUS_STYLES: Record<string, string> = {
 draft: 'bg-bg-secondary/40 text-text-muted border-border/30',
 scheduled: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
 sending: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
 sent: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
 failed: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const STATUS_LABELS: Record<string, string> = {
 draft: 'Rascunho',
 scheduled: 'Agendada',
 sending: 'Transmitindo',
 sent: 'Concluída',
 failed: 'Falha Crítica',
};

export default function EmailMarketing() {
 const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState('');
 const [filterStatus, setFilterStatus] = useState('');

 const [showComposeModal, setShowComposeModal] = useState(false);
 const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
 const [formData, setFormData] = useState({
 name: '',
 subject: '',
 body: '',
 recipient_lead_ids: [] as number[],
 });

  const [searchLeadTerm, setSearchLeadTerm] = useState('');
  const [leadResults, setLeadResults] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'send' | 'delete' | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const { hasPermission } = usePermissions();
 const canCreate = hasPermission('modules', 'email-marketing', 'create');
 const canEdit = hasPermission('modules', 'email-marketing', 'update');
 const canDelete = hasPermission('modules', 'email-marketing', 'delete');
 const canSend = hasPermission('modules', 'email-marketing', 'send');

 const fetchCampaigns = useCallback(async () => {
 setLoading(true);
 try {
 const params = new URLSearchParams();
 if (searchTerm) params.append('search', searchTerm);
 if (filterStatus) params.append('status', filterStatus);

 const res = await api.get(`/api/email-campaigns?${params}`);
 setCampaigns(res.data.data || res.data || []);
 } catch (err) {
 toast.error('Erro na sincronização de campanhas');
 } finally {
 setLoading(false);
 }
 }, [searchTerm, filterStatus]);

 useEffect(() => {
 fetchCampaigns();
 }, [fetchCampaigns]);

 const searchLeads = async (term: string) => {
 if (term.length < 2) {
 setLeadResults([]);
 return;
 }
 setLoadingLeads(true);
 try {
 const res = await api.get(`/api/email-campaigns/leads/search?search=${encodeURIComponent(term)}`);
 setLeadResults(res.data || []);
 } catch (err) {
 console.error(err);
 } finally {
 setLoadingLeads(false);
 }
 };

 useEffect(() => {
 const timer = setTimeout(() => {
 searchLeads(searchLeadTerm);
 }, 300);
 return () => clearTimeout(timer);
 }, [searchLeadTerm]);

 const handleOpenCompose = (campaign?: EmailCampaign) => {
 if (campaign) {
 setEditingCampaign(campaign);
 setFormData({
 name: campaign.name,
 subject: campaign.subject,
 body: campaign.body || '',
 recipient_lead_ids: [],
 });
 } else {
 setEditingCampaign(null);
 setFormData({ name: '', subject: '', body: '', recipient_lead_ids: [] });
 setSelectedLeads([]);
 }
 setShowComposeModal(true);
 };

 const handleSaveCampaign = async () => {
 if (!formData.name || !formData.subject) {
 toast.error('Identificação e assunto são obrigatórios');
 return;
 }
 setLoading(true);
 try {
 const payload = {...formData, recipient_lead_ids: selectedLeads.map(l => l.id) };
 if (editingCampaign) await api.put(`/api/email-campaigns/${editingCampaign.id}`, payload);
 else await api.post('/api/email-campaigns', payload);
 toast.success('Campanha consolidada.');
 setShowComposeModal(false);
 fetchCampaigns();
 } catch (err: any) {
 toast.error('Falha na orquestração da campanha');
 } finally {
 setLoading(false);
 }
 };

  const openSendConfirm = (id: number) => {
    setConfirmId(id);
    setConfirmAction('send');
    setConfirmOpen(true);
  };

  const openDeleteConfirm = (id: number) => {
    setConfirmId(id);
    setConfirmAction('delete');
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmId || !confirmAction) return;
    setLoading(true);
    try {
      if (confirmAction === 'send') {
        await api.post(`/api/email-campaigns/${confirmId}/send`);
        toast.success('Transmissão iniciada.');
      } else {
        await api.delete(`/api/email-campaigns/${confirmId}`);
        toast.success('Campanha removida.');
      }
      fetchCampaigns();
    } catch (err: any) {
      toast.error(confirmAction === 'send' ? 'Erro no gateway de envio' : 'Erro na exclusão');
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setConfirmId(null);
      setConfirmAction(null);
    }
  };

 const toggleLeadSelection = (lead: Lead) => {
 const exists = selectedLeads.find(l => l.id === lead.id);
 if (exists) setSelectedLeads(selectedLeads.filter(l => l.id !== lead.id));
 else setSelectedLeads([...selectedLeads, lead]);
 };

 return (
 <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
 <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shrink-0">
 <div className="space-y-1">
 <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
 Strategic <span className="text-primary">Marketing</span>
 </h1>
 <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
 <Mail size={14} className="text-primary" />
 Engajamento neural e régua de relacionamento automatizada.
 </p>
 </div>
 {canCreate && (
 <button
 onClick={() => handleOpenCompose()}
 className="btn btn-primary py-4 px-10 flex items-center gap-3 uppercase text-xs tracking-widest"
 >
 <Plus className="w-5 h-5" />
 Configurar Nova Campanha
 </button>
 )}
 </header>

 <div className="card overflow-hidden bg-bg-secondary/10 backdrop-blur-md border-border/30 ">
 <div className="p-8 bg-bg-secondary/20 border-b border-border/30 flex flex-wrap gap-6 items-center">
 <div className="relative flex-1 min-w-[320px] group">
 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
 <input
 type="text"
 placeholder="Buscar campanha por identificação ou assunto digital..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full pl-16 pr-6 py-4 bg-background/50 border border-border rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 "
 />
 </div>
 <div className="relative group min-w-[240px] z-20">
 <Target size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none z-10" />
 <Select
 value={filterStatus}
 onChange={setFilterStatus}
 options={[
 { value: '', label: 'Estado: Todos' },
 { value: 'draft', label: 'Rascunhos' },
 { value: 'scheduled', label: 'Agendadas' },
 { value: 'sent', label: 'Concluídas' }
 ]}
 className="pl-14"
 />
 </div>
 </div>

 <div className="overflow-x-auto ">
 <table className="w-full text-left text-sm">
 <thead className="bg-bg-secondary/40 border-b border-border">
 <tr>
 <th className="px-10 py-6 font-semibold uppercase text-xs text-text-muted opacity-60">Identificação Neural</th>
 <th className="px-10 py-6 font-semibold uppercase text-xs text-text-muted opacity-60">Engajamento de Base</th>
 <th className="px-10 py-6 font-semibold uppercase text-xs text-text-muted text-center opacity-60">Cronologia</th>
 <th className="px-10 py-6 font-semibold uppercase text-xs text-text-muted opacity-60">Status</th>
 <th className="px-10 py-6 font-semibold uppercase text-xs text-text-muted text-right opacity-60">Controles</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/20">
 {loading ? (
 <tr><td colSpan={5} className="px-10 py-40 text-center text-text-muted uppercase text-xs font-semibold tracking-widest animate-pulse"><Loader2 className="animate-spin inline mr-6 w-12 h-12 text-primary" /> Sincronizando Estratégias...</td></tr>
 ) : campaigns.length === 0 ? (
 <tr><td colSpan={5} className="px-10 py-40 text-center text-text-muted uppercase text-xs font-semibold tracking-widest opacity-40">Nenhuma campanha orquestrada no grid</td></tr>
 ) : (
 campaigns.map(campaign => (
 <tr key={campaign.id} className="hover:bg-bg-secondary/20 transition-all group border-b border-border/10 duration-500">
 <td className="px-10 py-10 space-y-3">
 <div className="font-semibold text-text-primary group-hover:text-primary transition-colors uppercase tracking-tight text-sm">{campaign.name}</div>
 <div className="text-xs text-text-muted font-semibold uppercase tracking-widest opacity-60 flex items-center gap-2">
 <Globe size={12} className="text-primary/40" /> {campaign.subject}
 </div>
 </td>
 <td className="px-10 py-10">
 <div className="flex items-center gap-6">
 <div className="flex flex-col gap-1">
 <span className="text-text-primary font-semibold text-base tracking-tight">{campaign.recipient_count}</span>
 <span className="text-xs text-text-muted uppercase tracking-widest font-semibold opacity-60">Lead Reach</span>
 </div>
 <div className="w-px h-10 bg-border-subtle/30" />
 <div className="flex flex-col gap-1">
 <span className="text-emerald-500 font-semibold text-base tracking-tight">{campaign.open_count}</span>
 <span className="text-xs text-text-muted uppercase tracking-widest font-semibold opacity-60">Open Rate</span>
 </div>
 </div>
 </td>
 <td className="px-10 py-10 text-center">
 <div className="flex flex-col items-center gap-2 text-text-muted group-hover:text-primary transition-colors">
 <BarChart3 size={18} className="opacity-40" />
 <span className="text-xs font-semibold uppercase tracking-widest">{campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString('pt-BR') : 'PENDENTE'}</span>
 </div>
 </td>
 <td className="px-10 py-10">
 <span className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl border backdrop-blur-md flex items-center gap-2 w-fit ${STATUS_STYLES[campaign.status]}`}>
 <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
 {STATUS_LABELS[campaign.status] || campaign.status}
 </span>
 </td>
 <td className="px-10 py-10 text-right">
 <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
 {canEdit && (
 <button onClick={() => handleOpenCompose(campaign)} className="p-3 bg-bg-secondary/40 border border-border rounded-xl text-text-muted hover:text-primary transition-all " title="Refinar"><Edit2 size={18} /></button>
 )}
              {(campaign.status === 'draft' || campaign.status === 'scheduled') && canSend && (
                <button onClick={() => openSendConfirm(campaign.id)} className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary hover:bg-primary hover:text-white transition-all " title="Disparar"><Send size={18} /></button>
              )}
              {canDelete && (
                <button onClick={() => openDeleteConfirm(campaign.id)} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500/60 hover:text-red-500 transition-all " title="Arquivar"><Trash2 size={18} /></button>
              )}
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>

 {showComposeModal && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-500">
 <div className="bg-bg-secondary border border-border/30 rounded-xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-500">
 <div className="flex justify-between items-center px-10 py-8 border-b border-border/30 bg-bg-secondary/20">
 <div className="space-y-1">
 <h2 className="text-sm font-semibold text-text-primary uppercase ">
 {editingCampaign ? 'REFINAR ESTRATÉGIA DE CAMPANHA' : 'ORQUESTRAR NOVA TRANSMISSÃO NEURAL'}
 </h2>
 <div className="flex items-center gap-3 text-xs text-text-muted font-semibold uppercase tracking-widest opacity-60">
 <Lock size={14} className="text-primary" /> Multi-Channel Strategic Engine Active
 </div>
 </div>
 <button onClick={() => setShowComposeModal(false)} className="p-4 bg-bg-secondary/40 border border-border rounded-2xl text-text-muted hover:text-text-primary transition-all "><X size={24} /></button>
 </div>

 <div className="flex-1 overflow-y-auto p-10 ">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
 <div className="lg:col-span-1 space-y-10">
 <div className="space-y-6">
 <div className="space-y-4 group">
 <label className="text-xs font-semibold text-text-muted uppercase px-2 group-focus-within:text-primary transition-colors">Identificação Interna</label>
 <div className="relative">
 <Activity className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6 opacity-40" />
 <input
 type="text"
 value={formData.name}
 onChange={(e) => setFormData({...formData, name: e.target.value })}
 className="w-full bg-background/50 border border-border rounded-2xl pl-16 pr-6 py-5 text-sm font-semibold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/30 "
 placeholder="Ex: Lançamento Linha Hospitalar"
 />
 </div>
 </div>
 <div className="space-y-4 group">
 <label className="text-xs font-semibold text-text-muted uppercase px-2 group-focus-within:text-primary transition-colors">Assunto do E-mail</label>
 <div className="relative">
 <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/60 w-6 h-6" />
 <input
 type="text"
 value={formData.subject}
 onChange={(e) => setFormData({...formData, subject: e.target.value })}
 className="w-full bg-background/50 border border-border rounded-2xl pl-16 pr-6 py-5 text-sm font-semibold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/30 "
 placeholder="Subject Line Estratégico "
 />
 </div>
 </div>
 </div>

 <div className="pt-10 border-t border-border/30 space-y-6">
 <label className="text-xs font-semibold text-text-primary uppercase flex items-center gap-3">
 <Users size={18} className="text-primary" /> Segmentação de Leads Core
 </label>
 <div className="relative group">
 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
 <input
 type="text"
 placeholder="Buscar por nome ou domínio digital..."
 value={searchLeadTerm}
 onChange={(e) => setSearchLeadTerm(e.target.value)}
 className="w-full bg-background/50 border border-border rounded-2xl pl-16 pr-6 py-4 text-xs font-bold text-text-primary outline-none focus:border-primary/40 transition-all "
 />
 </div>
 
 {loadingLeads ? (
 <p className="text-xs text-primary font-semibold uppercase tracking-widest animate-pulse">Consultando base estratégica...</p>
 ) : leadResults.length > 0 && searchLeadTerm.length >= 2 ? (
 <div className="max-h-56 overflow-y-auto border border-border/30 rounded-2xl bg-background/50 divide-y divide-border/10 ">
 {leadResults.map(lead => {
 const isSelected = selectedLeads.some(l => l.id === lead.id);
 return (
 <div
 key={lead.id}
 onClick={() => toggleLeadSelection(lead)}
 className={`p-4 cursor-pointer text-xs hover:bg-primary/5 transition-all flex items-center gap-4 ${isSelected ? 'text-primary' : 'text-text-muted'}`}
 >
 <div className={`w-5 h-5 border-2 rounded-lg flex items-center justify-center transition-all duration-500 ${isSelected ? 'border-primary bg-primary ' : 'border-border'}`}>
 {isSelected && <CheckCircle2 size={12} className="text-white" />}
 </div>
 <div className="truncate space-y-1">
 <span className="font-semibold text-text-primary uppercase tracking-tight">{lead.name}</span> <br/>
 <span className="opacity-60 text-xs font-semibold lowercase">{lead.email}</span>
 </div>
 </div>
 );
 })}
 </div>
 ) : null}

 {selectedLeads.length > 0 && (
 <div className="space-y-4">
 <p className="text-xs font-semibold text-text-muted uppercase tracking-widest opacity-60">Alvos Selecionados ({selectedLeads.length})</p>
 <div className="flex flex-wrap gap-3">
 {selectedLeads.map(lead => (
 <span key={lead.id} className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-3 ">
 {lead.email}
 <button onClick={() => toggleLeadSelection(lead)} className="hover:text-red-500 transition-colors">&times;</button>
 </span>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>

 <div className="lg:col-span-2 space-y-6">
 <div className="flex items-center justify-between px-2">
 <label className="text-xs font-semibold text-text-muted uppercase ">Corpo da Transmissão (HTML Neural Engine)</label>
 <div className="flex items-center gap-3 text-xs text-primary font-semibold uppercase tracking-widest italic animate-pulse">
 <Zap size={14} /> Responsive Framework Active
 </div>
 </div>
 <div className="relative group">
 <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
 <textarea
 value={formData.body}
 onChange={(e) => setFormData({...formData, body: e.target.value })}
 className="w-full bg-background/50 border border-border rounded-xl px-8 py-8 text-xs font-bold text-text-primary outline-none focus:border-primary/40 transition-all font-mono custom-scrollbar min-h-[500px] relative z-10"
 placeholder="<html>\n <body style='font-family: sans-serif;'>\n <h1>Sua Mensagem Estratégica </h1>\n </body>\n</html>"
 />
 </div>
 </div>
 </div>
 </div>

 <div className="flex justify-end items-center gap-8 p-10 border-t border-border/30 bg-bg-secondary/20">
 <button
 onClick={() => setShowComposeModal(false)}
 className="text-sm font-semibold text-text-muted hover:text-text-primary uppercase transition-all"
 >
 DESCARTAR TRANSMISSÃO
 </button>
 <button
 onClick={handleSaveCampaign}
 disabled={loading}
 className="btn btn-primary py-5 px-16 uppercase text-[12px] flex items-center gap-5 disabled:opacity-60"
 >
 {loading ? <Loader2 size={24} className="animate-spin" /> : editingCampaign ? <ShieldCheck size={24} /> : <Zap size={24} />}
 {editingCampaign ? 'CONSOLIDAR ALTERAÇÕES' : 'CONFIRMAR CAMPANHA'}
 </button>
 </div>
 </div>
 </div>
 )}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        title={confirmAction === 'send' ? 'Disparar Campanha' : 'Excluir Campanha'}
        message={confirmAction === 'send' ? 'Autorizar disparo imediato para toda a base selecionada?' : 'Remover campanha do histórico estratégico?'}
        confirmText={confirmAction === 'send' ? 'Disparar' : 'Excluir'}
        cancelText="Cancelar"
        variant={confirmAction === 'send' ? 'warning' : 'danger'}
      />
    </div>
  );
}