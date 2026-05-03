import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Send, CheckCircle2, Clock, Search, X, Trash2,
  Mail, Loader2, Target, Zap, Activity, Globe, Filter, 
  ChevronRight, Database, Users, MousePointer2, Settings,
  AlertCircle
} from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

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
  draft: { label: 'Rascunho', style: 'bg-surface-elevated/40 text-text-muted border-border-subtle', icon: Clock },
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

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir esta estratégia de campanha?')) return;

    try {
      await api.delete(`/api/email-campaigns/${id}`);
      toast.success('Campanha removida.');
      fetchCampaigns();
    } catch (err) {
      toast.error('Erro ao excluir');
    }
  };

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Marketing <span className="text-gradient-gold">Campaigns</span>
          </h1>
          <p className="text-text-secondary flex items-center gap-2 text-sm font-medium">
            <Mail size={14} className="text-primary" />
            Gestão de disparos em massa e automação de marketing Platinum.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary py-4 px-10 shadow-platinum-glow flex items-center gap-3 uppercase text-[10px] tracking-widest"
        >
          <Plus size={16} /> Nova Campanha
        </button>
      </header>

      {/* Listagem */}
      <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md">
        <div className="p-8 bg-surface-elevated/20 border-b border-border-subtle flex flex-wrap items-center gap-8">
          <div className="relative flex-1 min-w-[300px] group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Buscar por assunto ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum"
            />
          </div>
          <div className="flex items-center gap-4 bg-surface-elevated/30 p-2 rounded-2xl border border-border-subtle shadow-platinum-glow-sm">
            <Filter size={18} className="ml-2 text-primary" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-[11px] font-black uppercase tracking-[0.2em] px-4 py-2 outline-none cursor-pointer text-text-primary"
            >
              <option value="" className="bg-surface">Todos os Status</option>
              {Object.keys(STATUS_CONFIG).map(key => (
                <option key={key} value={key} className="bg-surface">{STATUS_CONFIG[key].label.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-platinum">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-surface-elevated/30 border-b border-border-subtle">
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Campanha</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Público</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Status</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60 text-right">Progresso</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/30">
              {loading ? (
                <tr><td colSpan={5} className="px-10 py-32 text-center text-[10px] font-black uppercase tracking-widest text-text-muted">Indexando Campanhas...</td></tr>
              ) : campaigns.length === 0 ? (
                <tr><td colSpan={5} className="px-10 py-32 text-center text-[10px] font-black uppercase tracking-widest text-text-muted opacity-40">Nenhuma campanha orquestrada</td></tr>
              ) : (
                campaigns.map(campaign => (
                  <tr key={campaign.id} className="hover:bg-surface-elevated/20 transition-all border-b border-border-subtle/20 group">
                    <td className="px-10 py-8">
                      <div className="font-black text-text-primary group-hover:text-primary transition-colors uppercase tracking-tight text-sm">{campaign.name}</div>
                      <div className="text-[10px] text-text-muted font-black mt-2 uppercase tracking-widest opacity-60">{campaign.subject}</div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-primary">
                        <Users size={14} className="text-primary" />
                        {campaign.target_audience === 'all_leads' ? 'Todos os Leads' : campaign.target_audience === 'all_clients' ? 'Todos os Clientes' : 'Manual'}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`flex items-center gap-3 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border w-fit ${STATUS_CONFIG[campaign.status]?.style}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="space-y-1">
                        <div className="text-text-primary font-black text-sm tracking-tighter">{campaign.sent_count} / {campaign.recipient_count}</div>
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
                        {campaign.status === 'draft' && (
                          <button onClick={() => handleSend(campaign.id)} className="p-3 bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 text-primary transition-all" title="Disparar Agora"><Send size={18} /></button>
                        )}
                        <button onClick={() => handleOpenModal(campaign)} className="p-3 bg-surface-elevated/40 border border-border-subtle rounded-xl hover:bg-primary/10 text-text-muted transition-all"><Settings size={18} /></button>
                        <button onClick={() => handleDelete(campaign.id)} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl hover:bg-red-500/20 text-red-500/60 transition-all"><Trash2 size={18} /></button>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl p-6 animate-in fade-in duration-500">
          <div className="bg-surface-elevated border border-border-subtle rounded-[3rem] shadow-platinum-glow w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-10 py-8 border-b border-border-subtle bg-surface-elevated/40 backdrop-blur-md">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-text-primary uppercase tracking-[0.4em]">Orquestrador de Campanha</h2>
                <div className="flex items-center gap-3 text-[10px] text-text-muted font-black uppercase tracking-[0.3em]">Strategic Marketing Dispatch</div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 bg-surface-elevated/60 rounded-2xl text-text-muted hover:text-primary transition-all"><X size={24} /></button>
            </div>

            <form onSubmit={handleSave} className="p-10 space-y-8 overflow-y-auto flex-1 scrollbar-platinum">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2">Identificação Interna</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-background/50 border border-border-medium rounded-2xl px-6 py-4 text-sm font-bold text-text-primary outline-none focus:border-primary/40 transition-all placeholder:text-text-muted/30 shadow-inner-platinum"
                    placeholder="Ex: Campanha Reativação Q3"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2">Assunto do E-mail</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-background/50 border border-border-medium rounded-2xl px-6 py-4 text-sm font-bold text-text-primary outline-none focus:border-primary/40 transition-all placeholder:text-text-muted/30 shadow-inner-platinum"
                    placeholder="Assunto que aparecerá para o cliente"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2">URL do Banner da Campanha</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full bg-background/50 border border-border-medium rounded-2xl px-6 py-4 text-sm font-bold text-text-primary outline-none focus:border-primary/40 transition-all placeholder:text-text-muted/30 shadow-inner-platinum"
                  placeholder="Link da imagem (Ex: https://img.bidflow.com/banner.jpg)"
                />
                {formData.image_url && (
                  <div className="mt-4 p-4 bg-background/50 border border-border-subtle rounded-2xl flex justify-center">
                    <img src={formData.image_url} alt="Preview" className="max-h-32 rounded-xl" />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2">Público Alvo</label>
                <div className="flex gap-4">
                  {[
                    { id: 'all_leads', label: 'Todos os Leads', icon: Target },
                    { id: 'all_clients', label: 'Todos os Clientes', icon: Users },
                    { id: 'manual', label: 'Lista Manual', icon: MousePointer2 },
                  ].map((target) => (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, target_audience: target.id as any })}
                      className={`flex-1 p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                        formData.target_audience === target.id 
                        ? 'border-primary bg-primary/5 shadow-platinum-glow-sm' 
                        : 'border-border-subtle bg-background/50 hover:border-border-medium opacity-60'
                      }`}
                    >
                      <target.icon size={24} className={formData.target_audience === target.id ? 'text-primary' : 'text-text-muted'} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{target.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2">Corpo do E-mail (HTML)</label>
                <div className="platinum-card border-border-subtle bg-background/30 rounded-[2rem] overflow-hidden">
                  {/* Basic Toolbar Mock */}
                  <div className="p-4 border-b border-border-subtle flex gap-4 bg-surface-elevated/40">
                    <button type="button" className="p-2 hover:bg-primary/10 rounded-lg text-text-muted font-black">B</button>
                    <button type="button" className="p-2 hover:bg-primary/10 rounded-lg text-text-muted font-black italic">I</button>
                    <button type="button" className="p-2 hover:bg-primary/10 rounded-lg text-text-muted font-black underline">U</button>
                    <div className="w-px h-6 bg-border-subtle my-auto mx-2" />
                    <button type="button" className="p-2 hover:bg-primary/10 rounded-lg text-text-muted text-[10px] font-black uppercase tracking-widest">Link</button>
                  </div>
                  <textarea
                    required
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    className="w-full bg-transparent border-0 px-8 py-8 text-sm font-medium text-text-primary outline-none min-h-[300px] resize-none leading-relaxed placeholder:text-text-muted/10"
                    placeholder="Olá [Nome], você tem uma nova oportunidade de licitação disponível..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-6 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-8 py-5 text-[10px] font-black text-text-muted hover:text-text-primary uppercase tracking-[0.3em] transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn-primary py-5 px-12 shadow-platinum-glow uppercase text-[11px] tracking-[0.3em] disabled:opacity-50 flex items-center gap-3"
                >
                  {isProcessing ? <Loader2 size={18} className="animate-spin" /> : editingCampaign ? 'Salvar Alterações' : 'Criar Campanha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}