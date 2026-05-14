import { useState, useEffect, useCallback } from 'react';
import {
 Plus, Send, CheckCircle2, Clock, Search, X, Trash2,
 Mail, Loader2, Target, Zap, Activity, Globe, Filter, 
 ChevronRight, Database, Users, MousePointer2, Settings,
 AlertCircle
} from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { Select } from './ui/Select';
import { ConfirmDialog } from './ui/Modal';
import { usePermissions } from '../hooks/usePermissions';

interface Campaign {
 id: number;
 name: string;
 subject: string;
 image_url?: string;
 body: string;
 target_audience: 'all_leads' | 'all_clients' | 'manual';
 status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
 recipient_count: number;
 sent_count: number;
 created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; style: string; icon: any }> = {
 draft: { label: 'Rascunho', style: 'bg-bg-secondary/40 text-text-muted border-border', icon: Clock },
 scheduled: { label: 'Agendada', style: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock },
 sending: { label: 'Enviando', style: 'bg-primary/10 text-primary border-primary/20', icon: Zap },
 sent: { label: 'Concluída', style: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle2 },
 failed: { label: 'Falhou', style: 'bg-red-500/10 text-red-500 border-red-500/20', icon: AlertCircle },
};

export default function Campaigns() {
 const [campaigns, setCampaigns] = useState<Campaign[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState('');
 const [filterStatus, setFilterStatus] = useState('');
 
 const [showModal, setShowModal] = useState(false);
 const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
 const [isProcessing, setIsProcessing] = useState(false);
 
  const [formData, setFormData] = useState({
  name: '',
  subject: '',
  image_url: '',
  body: '',
  target_audience: 'all_leads' as 'all_leads' | 'all_clients' | 'manual',
  recipient_emails: [] as string[],
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const { hasPermission } = usePermissions();
 const canCreate = hasPermission('modules', 'campaigns', 'create');
 const canEdit = hasPermission('modules', 'campaigns', 'update');
 const canDelete = hasPermission('modules', 'campaigns', 'delete');
 const canSend = hasPermission('modules', 'campaigns', 'send');

 const fetchCampaigns = useCallback(async () => {
 setLoading(true);
 try {
 const params = new URLSearchParams();
 if (searchTerm) params.append('search', searchTerm);
 if (filterStatus) params.append('status', filterStatus);

 const res = await api.get(`/api/email-campaigns?${params}`);
 setCampaigns(res.data.data || res.data || []);
 } catch (err) {
 console.error('Erro ao carregar campanhas');
 } finally {
 setLoading(false);
 }
 }, [searchTerm, filterStatus]);

 useEffect(() => {
 fetchCampaigns();
 }, [fetchCampaigns]);

 const handleOpenModal = (campaign?: Campaign) => {
 if (campaign) {
 setEditingCampaign(campaign);
 setFormData({
 name: campaign.name,
 subject: campaign.subject,
 image_url: campaign.image_url || '',
 body: campaign.body,
 target_audience: campaign.target_audience,
 recipient_emails: [],
 });
 } else {
 setEditingCampaign(null);
 setFormData({
 name: '',
 subject: '',
 image_url: '',
 body: '',
 target_audience: 'all_leads',
 recipient_emails: [],
 });
 }
 setShowModal(true);
 };

 const handleSave = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsProcessing(true);

 try {
 if (editingCampaign) {
 await api.put(`/api/email-campaigns/${editingCampaign.id}`, formData);
 toast.success('Campanha atualizada!');
 } else {
 await api.post('/api/email-campaigns', formData);
 toast.success('Nova campanha orquestrada!');
 }

 setShowModal(false);
 fetchCampaigns();
 } catch (err: any) {
 toast.error(err.response?.data?.message || 'Falha na persistência da campanha');
 } finally {
 setIsProcessing(false);
 }
 };

 const handleSend = async (id: number) => {
 try {
 await api.post(`/api/email-campaigns/${id}/send`);
 toast.success('Disparo de campanha iniciado em segundo plano!');
 fetchCampaigns();
 } catch (err) {
 toast.error('Erro ao iniciar disparo');
 }
 };

  const openDeleteConfirm = (id: number) => {
    setConfirmId(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    try {
      await api.delete(`/api/email-campaigns/${confirmId}`);
      toast.success('Campanha removida.');
      fetchCampaigns();
    } catch (err) {
      toast.error('Erro ao excluir');
    } finally {
      setConfirmId(null);
      setConfirmOpen(false);
    }
  };

 return (
 <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
 <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
 <div className="space-y-1">
 <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
 Marketing <span className="text-primary">Campaigns</span>
 </h1>
 <p className="text-text-secondary flex items-center gap-2 text-sm font-medium">
 <Mail size={14} className="text-primary" />
 Gestão de disparos em massa e automação de marketing.
 </p>
 </div>
 {canCreate && (
 <button
 onClick={() => handleOpenModal()}
 className="btn btn-primary py-4 px-10 flex items-center gap-3 uppercase text-xs tracking-widest"
 >
 <Plus size={16} /> Nova Campanha
 </button>
 )}
 </header>

 {/* Listagem */}
 <div className="card overflow-hidden bg-bg-secondary/10 backdrop-blur-md">
 <div className="p-8 bg-bg-secondary/20 border-b border-border flex flex-wrap items-center gap-8">
 <div className="relative flex-1 min-w-[300px] group">
 <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
 <input
 type="text"
 placeholder="Buscar por assunto ou nome..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full pl-14 pr-6 py-4 bg-background/50 border border-border rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 "
 />
 </div>
 <div className="flex items-center gap-4 bg-bg-secondary/30 p-2 rounded-2xl border border-border relative z-20">
 <Filter size={18} className="ml-2 text-primary" />
 <div className="w-48">
 <Select
 value={filterStatus}
 onChange={setFilterStatus}
 options={[
 { value: '', label: 'Todos os Status' },
...Object.keys(STATUS_CONFIG).map(key => ({ value: key, label: STATUS_CONFIG[key].label.toUpperCase() }))
 ]}
 className="bg-transparent border-none shadow-none"
 />
 </div>
 </div>
 </div>

 <div className="overflow-x-auto ">
 <table className="w-full text-left text-sm">
 <thead>
 <tr className="bg-bg-secondary/30 border-b border-border">
 <th className="px-10 py-6 font-semibold uppercase text-xs tracking-widest text-text-muted opacity-60">Campanha</th>
 <th className="px-10 py-6 font-semibold uppercase text-xs tracking-widest text-text-muted opacity-60">Público</th>
 <th className="px-10 py-6 font-semibold uppercase text-xs tracking-widest text-text-muted opacity-60">Status</th>
 <th className="px-10 py-6 font-semibold uppercase text-xs tracking-widest text-text-muted opacity-60 text-right">Progresso</th>
 <th className="px-10 py-6 font-semibold uppercase text-xs tracking-widest text-text-muted opacity-60 text-right">Ações</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/30">
 {loading ? (
 <tr><td colSpan={5} className="px-10 py-32 text-center text-xs font-semibold uppercase tracking-widest text-text-muted">Indexando Campanhas...</td></tr>
 ) : campaigns.length === 0 ? (
 <tr><td colSpan={5} className="px-10 py-32 text-center text-xs font-semibold uppercase tracking-widest text-text-muted opacity-40">Nenhuma campanha orquestrada</td></tr>
 ) : (
 campaigns.map(campaign => (
 <tr key={campaign.id} className="hover:bg-bg-secondary/20 transition-all border-b border-border/20 group">
 <td className="px-10 py-8">
 <div className="font-semibold text-text-primary group-hover:text-primary transition-colors uppercase tracking-tight text-sm">{campaign.name}</div>
 <div className="text-xs text-text-muted font-semibold mt-2 uppercase tracking-widest opacity-60">{campaign.subject}</div>
 </td>
 <td className="px-10 py-8">
 <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-primary">
 <Users size={14} className="text-primary" />
 {campaign.target_audience === 'all_leads' ? 'Todos os Leads' : campaign.target_audience === 'all_clients' ? 'Todos os Clientes' : 'Manual'}
 </div>
 </td>
 <td className="px-10 py-8">
 <span className={`flex items-center gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl border w-fit ${STATUS_CONFIG[campaign.status]?.style}`}>
 {campaign.status}
 </span>
 </td>
 <td className="px-10 py-8 text-right">
 <div className="space-y-1">
 <div className="text-text-primary font-semibold text-sm tracking-tight">{campaign.sent_count} / {campaign.recipient_count}</div>
 <div className="w-full bg-background/50 rounded-full h-1.5 overflow-hidden">
 <div 
 className="bg-primary h-full transition-all duration-1000" 
 style={{ width: `${(campaign.sent_count / (campaign.recipient_count || 1)) * 100}%` }}
 />
 </div>
 </div>
 </td>
 <td className="px-10 py-8 text-right">
 <div className="flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-all">
 {campaign.status === 'draft' && canSend && (
 <button onClick={() => handleSend(campaign.id)} className="p-3 bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 text-primary transition-all" title="Disparar Agora"><Send size={18} /></button>
 )}
 {canEdit && (
 <button onClick={() => handleOpenModal(campaign)} className="p-3 bg-bg-secondary/40 border border-border rounded-xl hover:bg-primary/10 text-text-muted transition-all"><Settings size={18} /></button>
 )}
              {canDelete && (
                <button onClick={() => openDeleteConfirm(campaign.id)} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl hover:bg-red-500/20 text-red-500/60 transition-all"><Trash2 size={18} /></button>
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

 {/* Modal Criador */}
 {showModal && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl p-6 animate-in fade-in duration-500">
 <div className="bg-bg-secondary border border-border rounded-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col">
 <div className="flex justify-between items-center px-10 py-8 border-b border-border bg-bg-secondary/40 backdrop-blur-md">
 <div className="space-y-1">
 <h2 className="text-lg font-semibold text-text-primary uppercase ">Orquestrador de Campanha</h2>
 <div className="flex items-center gap-3 text-xs text-text-muted font-semibold uppercase tracking-widest">Strategic Marketing Dispatch</div>
 </div>
 <button onClick={() => setShowModal(false)} className="p-3 bg-bg-secondary/60 rounded-2xl text-text-muted hover:text-primary transition-all"><X size={24} /></button>
 </div>

 <form onSubmit={handleSave} className="p-10 space-y-8 overflow-y-auto flex-1 ">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="space-y-3">
 <label className="text-xs font-semibold text-text-muted uppercase px-2">Identificação Interna</label>
 <input
 type="text"
 required
 value={formData.name}
 onChange={(e) => setFormData({...formData, name: e.target.value })}
 className="w-full bg-background/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-text-primary outline-none focus:border-primary/40 transition-all placeholder:text-text-muted/30 "
 placeholder="Ex: Campanha Reativação Q3"
 />
 </div>
 <div className="space-y-3">
 <label className="text-xs font-semibold text-text-muted uppercase px-2">Assunto do E-mail</label>
 <input
 type="text"
 required
 value={formData.subject}
 onChange={(e) => setFormData({...formData, subject: e.target.value })}
 className="w-full bg-background/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-text-primary outline-none focus:border-primary/40 transition-all placeholder:text-text-muted/30 "
 placeholder="Assunto que aparecerá para o cliente"
 />
 </div>
 </div>

 <div className="space-y-3">
 <label className="text-xs font-semibold text-text-muted uppercase px-2">URL do Banner da Campanha</label>
 <input
 type="text"
 value={formData.image_url}
 onChange={(e) => setFormData({...formData, image_url: e.target.value })}
 className="w-full bg-background/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold text-text-primary outline-none focus:border-primary/40 transition-all placeholder:text-text-muted/30 "
 placeholder="Link da imagem (Ex: https://img.bidflow.com/banner.jpg)"
 />
 {formData.image_url && (
 <div className="mt-4 p-4 bg-background/50 border border-border rounded-2xl flex justify-center">
 <img src={formData.image_url} alt="Preview" className="max-h-32 rounded-xl" />
 </div>
 )}
 </div>

 <div className="space-y-3">
 <label className="text-xs font-semibold text-text-muted uppercase px-2">Público Alvo</label>
 <div className="flex gap-4">
 {[
 { id: 'all_leads', label: 'Todos os Leads', icon: Target },
 { id: 'all_clients', label: 'Todos os Clientes', icon: Users },
 { id: 'manual', label: 'Lista Manual', icon: MousePointer2 },
 ].map((target) => (
 <button
 key={target.id}
 type="button"
 onClick={() => setFormData({...formData, target_audience: target.id as any })}
 className={`flex-1 p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
 formData.target_audience === target.id 
 ? 'border-primary bg-primary/5 ' 
 : 'border-border bg-background/50 hover:border-border opacity-60'
 }`}
 >
 <target.icon size={24} className={formData.target_audience === target.id ? 'text-primary' : 'text-text-muted'} />
 <span className="text-xs font-semibold uppercase tracking-widest">{target.label}</span>
 </button>
 ))}
 </div>
 </div>

 <div className="space-y-3">
 <label className="text-xs font-semibold text-text-muted uppercase px-2">Corpo do E-mail (HTML)</label>
 <div className="card border-border bg-background/30 rounded-xl overflow-hidden">
 {/* Basic Toolbar Mock */}
 <div className="p-4 border-b border-border flex gap-4 bg-bg-secondary/40">
 <button type="button" className="p-2 hover:bg-primary/10 rounded-lg text-text-muted font-semibold">B</button>
 <button type="button" className="p-2 hover:bg-primary/10 rounded-lg text-text-muted font-semibold italic">I</button>
 <button type="button" className="p-2 hover:bg-primary/10 rounded-lg text-text-muted font-semibold underline">U</button>
 <div className="w-px h-6 bg-border-subtle my-auto mx-2" />
 <button type="button" className="p-2 hover:bg-primary/10 rounded-lg text-text-muted text-xs font-semibold uppercase tracking-widest">Link</button>
 </div>
 <textarea
 required
 value={formData.body}
 onChange={(e) => setFormData({...formData, body: e.target.value })}
 className="w-full bg-transparent border-0 px-8 py-8 text-sm font-medium text-text-primary outline-none min-h-[300px] resize-none leading-relaxed placeholder:text-text-muted/10"
 placeholder="Olá [Nome], você tem uma nova oportunidade de licitação disponível..."
 />
 </div>
 </div>

 <div className="flex justify-end gap-6 pt-4">
 <button
 type="button"
 onClick={() => setShowModal(false)}
 className="px-8 py-5 text-xs font-semibold text-text-muted hover:text-text-primary uppercase tracking-widest transition-all"
 >
 Cancelar
 </button>
 <button
 type="submit"
 disabled={isProcessing}
 className="btn btn-primary py-5 px-12 uppercase text-sm tracking-widest disabled:opacity-50 flex items-center gap-3"
 >
 {isProcessing ? <Loader2 size={18} className="animate-spin" /> : editingCampaign ? 'Salvar Alterações' : 'Criar Campanha'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Campanha"
        message="Excluir esta estratégia de campanha?"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}