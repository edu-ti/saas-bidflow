import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Send, CheckCircle2, Clock, Search, X, Trash2,
  MessageCircle, Mail, Loader2, Target, Zap, BarChart3, ShieldCheck, Globe, Lock, Filter, ChevronRight, Activity, SendHorizontal
} from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

interface Campaign {
  id: number;
  name: string;
  channel: 'whatsapp' | 'email' | 'sms';
  status: 'draft' | 'active' | 'scheduled' | 'paused' | 'completed';
  sent: number;
  open_rate: string;
  created_at: string;
}

const CHANNEL_OPTIONS = [
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { value: 'email', label: 'E-mail', icon: Mail, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { value: 'sms', label: 'SMS', icon: SendHorizontal, color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

const STATUS_CONFIG: Record<string, { label: string; style: string; icon: any }> = {
  draft: { label: 'Rascunho', style: 'bg-surface-elevated/40 text-text-muted border-border-subtle', icon: Clock },
  active: { label: 'Em Disparo', style: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: Zap },
  scheduled: { label: 'Agendada', style: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock },
  paused: { label: 'Interrompida', style: 'bg-red-500/10 text-red-500 border-red-500/20', icon: X },
  completed: { label: 'Concluída', style: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: CheckCircle2 },
};

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [stats, setStats] = useState({ total_sent: 0, active: 0, scheduled: 0 });

  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    channel: 'whatsapp' as const,
    status: 'draft' as const,
    message: '',
  });

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus) params.append('status', filterStatus);

      const res = await api.get(`/api/campaigns?${params}`);
      setCampaigns(res.data.data || res.data || []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterStatus]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/campaigns/stats');
      setStats(res.data);
    } catch (err) {
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchStats();
  }, [fetchCampaigns]);

  const handleOpenModal = (campaign?: Campaign) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setFormData({
        name: campaign.name,
        channel: campaign.channel,
        status: campaign.status,
        message: '',
      });
    } else {
      setEditingCampaign(null);
      setFormData({
        name: '',
        channel: 'whatsapp',
        status: 'draft',
        message: '',
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCampaign) {
        await api.put(`/api/campaigns/${editingCampaign.id}`, formData);
        toast.success('Diretriz de campanha atualizada!');
      } else {
        await api.post('/api/campaigns', formData);
        toast.success('Nova campanha orquestrada!');
      }

      setShowModal(false);
      fetchCampaigns();
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Falha na persistência da campanha');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir esta estratégia de campanha?')) return;

    try {
      await api.delete(`/api/campaigns/${id}`);
      toast.success('Campanha removida do grid.');
      fetchCampaigns();
      fetchStats();
    } catch (err) {
      toast.error('Erro na remoção operacional');
    }
  };

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700 overflow-x-hidden">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Strategic <span className="text-gradient-gold">Omnichannel</span> Dispatches
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <Globe size={14} className="text-primary" />
            Orquestração de campanhas massivas com inteligência de conversão Platinum.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary py-4 px-10 shadow-platinum-glow flex items-center gap-3 uppercase text-[10px] tracking-widest"
        >
          <Plus size={16} /> Nova Campanha Estratégica
        </button>
      </header>

      {/* Stats Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'DISPAROS CONCLUÍDOS', val: stats.total_sent || 0, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'ESTRATÉGIAS ATIVAS', val: stats.active || 0, icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'FILA DE AGENDAMENTO', val: stats.scheduled || 0, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        ].map((s, i) => (
          <div key={i} className="platinum-card p-8 flex items-center justify-between group bg-surface-elevated/10 backdrop-blur-xl border-border-subtle/30">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] opacity-60">{s.label}</p>
              <p className="text-3xl font-black text-text-primary tracking-tighter group-hover:text-primary transition-colors duration-500">{s.val}</p>
            </div>
            <div className={`p-5 rounded-2xl ${s.bg} border border-border-subtle ${s.color} group-hover:scale-110 transition-transform duration-500 shadow-platinum-glow-sm`}>
              <s.icon size={28} />
            </div>
          </div>
        ))}
      </div>

      <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md">
        <div className="p-8 bg-surface-elevated/20 border-b border-border-subtle flex flex-wrap items-center gap-8">
          <div className="relative flex-1 min-w-[300px] group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Buscar por identificação, canal ou status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum"
            />
          </div>
          <div className="flex items-center gap-4 bg-surface-elevated/30 p-2 rounded-2xl border border-border-subtle shadow-platinum-glow-sm">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
               <Filter size={18} />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-[11px] font-black uppercase tracking-[0.2em] px-4 py-2 outline-none cursor-pointer text-text-primary hover:text-primary transition-colors"
            >
              <option value="" className="bg-surface font-bold">TODOS OS STATUS</option>
              {Object.keys(STATUS_CONFIG).map(key => (
                <option key={key} value={key} className="bg-surface font-bold">{STATUS_CONFIG[key].label.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-platinum">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-surface-elevated/30 border-b border-border-subtle">
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Campanha / Identificação</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Canal de Transmissão</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Status de Execução</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60 text-right">Performance Core</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/30">
              {loading ? (
                <tr><td colSpan={5} className="px-10 py-32 text-center">
                  <div className="flex flex-col items-center gap-6 justify-center">
                    <Loader2 className="animate-spin w-12 h-12 text-primary opacity-40" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Indexando Campanhas...</p>
                  </div>
                </td></tr>
              ) : campaigns.length === 0 ? (
                <tr><td colSpan={5} className="px-10 py-32 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-40">
                     <Target size={48} className="text-text-muted" />
                     <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Nenhuma estratégia localizada no grid</p>
                  </div>
                </td></tr>
              ) : (
                campaigns.map(campaign => {
                  const channel = CHANNEL_OPTIONS.find(c => c.value === campaign.channel);
                  const Icon = channel?.icon || Globe;
                  return (
                    <tr key={campaign.id} className="hover:bg-surface-elevated/20 transition-all group border-b border-border-subtle/20 duration-300">
                      <td className="px-10 py-8">
                        <div className="font-black text-text-primary group-hover:text-primary transition-colors uppercase tracking-tight text-sm">{campaign.name}</div>
                        <div className="text-[10px] text-text-muted font-black mt-2 uppercase tracking-widest opacity-60 flex items-center gap-2">
                           <Clock size={12} className="text-primary/60" /> {new Date(campaign.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className={`flex items-center gap-3.5 ${channel?.color} p-3 rounded-2xl ${channel?.bg} border border-border-subtle/30 w-fit shadow-platinum-glow-sm`}>
                          <Icon size={18} />
                          <span className="font-black text-[11px] uppercase tracking-[0.2em]">{channel?.label}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className={`flex items-center gap-3 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border w-fit shadow-platinum-glow-sm ${STATUS_CONFIG[campaign.status]?.style}`}>
                          <div className="w-2 h-2 rounded-full bg-current animate-pulse shadow-platinum-glow" />
                          {STATUS_CONFIG[campaign.status]?.label}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="space-y-2">
                          <div className="text-text-primary font-black text-lg tracking-tighter">{campaign.sent} <span className="text-[9px] uppercase tracking-widest text-text-muted opacity-60">Hits</span></div>
                          <div className="text-[10px] text-primary font-black uppercase tracking-[0.2em] flex items-center justify-end gap-2">
                            <Activity size={12} className="animate-pulse" /> {campaign.open_rate || '0.0%'} Conversion
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                          <button onClick={() => handleOpenModal(campaign)} className="p-3 bg-surface-elevated/40 border border-border-subtle rounded-xl hover:bg-primary/20 hover:text-primary text-text-muted transition-all hover:scale-110 shadow-platinum-glow-sm" title="Ajustar Estratégia"><Target size={18} /></button>
                          <button onClick={() => handleDelete(campaign.id)} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl hover:bg-red-500/20 text-red-500/60 transition-all hover:scale-110 shadow-platinum-glow-sm" title="Arquivar"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl p-6 animate-in fade-in duration-500">
          <div className="bg-surface-elevated border border-border-subtle rounded-[3rem] shadow-platinum-glow w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center px-10 py-8 border-b border-border-subtle bg-surface-elevated/40 backdrop-blur-md">
              <div className="space-y-2">
                <h2 className="text-lg font-black text-text-primary uppercase tracking-[0.4em]">
                  {editingCampaign ? 'Refinar Transmissão' : 'Nova Orquestração Core'}
                </h2>
                <div className="flex items-center gap-3 text-[10px] text-text-muted font-black uppercase tracking-[0.3em]">
                  <Lock size={12} className="text-primary animate-pulse" /> Strategic Multi-Channel Dispatch Platinum
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 bg-surface-elevated/60 rounded-2xl text-text-muted hover:text-primary hover:rotate-90 transition-all duration-500"><X size={24} /></button>
            </div>

            <form onSubmit={handleSave} className="p-10 space-y-10">
              <div className="space-y-4 group">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Nome da Estratégia de Campanha</label>
                <div className="relative">
                   <Target className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/60 w-6 h-6" />
                   <input
                     type="text"
                     required
                     value={formData.name}
                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                     className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-bold text-text-primary outline-none focus:border-primary/40 transition-all placeholder:text-text-muted/30 shadow-inner-platinum"
                     placeholder="Ex: Follow-up Leads Q3 High Performance"
                   />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4 group">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Canal de Transmissão</label>
                  <div className="relative">
                    <SendHorizontal className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6" />
                    <select
                      value={formData.channel}
                      onChange={(e) => setFormData({ ...formData, channel: e.target.value as any })}
                      className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-10 py-5 text-xs font-black uppercase tracking-[0.2em] text-text-primary outline-none focus:border-primary/40 transition-all appearance-none cursor-pointer shadow-inner-platinum"
                    >
                      {CHANNEL_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-surface font-bold text-text-primary">{opt.label.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-4 group">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Lifecycle Status</label>
                  <div className="relative">
                    <Activity className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6" />
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-10 py-5 text-xs font-black uppercase tracking-[0.2em] text-text-primary outline-none focus:border-primary/40 transition-all appearance-none cursor-pointer shadow-inner-platinum"
                    >
                      {Object.keys(STATUS_CONFIG).map(key => (
                        <option key={key} value={key} className="bg-surface font-bold text-text-primary">{STATUS_CONFIG[key].label.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 group">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Copywriting / Conteúdo Estratégico Platinum</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-background/50 border border-border-medium rounded-[2rem] px-8 py-6 text-sm font-medium text-text-primary outline-none focus:border-primary/40 transition-all min-h-[160px] resize-none shadow-inner-platinum"
                  placeholder="Defina o conteúdo de alto impacto da transmissão..."
                />
              </div>

              <div className="flex justify-end gap-6 pt-8 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-8 py-5 text-[10px] font-black text-text-muted hover:text-text-primary uppercase tracking-[0.3em] transition-all"
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary py-5 px-12 shadow-platinum-glow uppercase text-[11px] tracking-[0.3em] disabled:opacity-50 flex items-center gap-3"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : editingCampaign ? <><ShieldCheck size={18} /> Consolidar Ajustes</> : <><Zap size={18} /> Iniciar Operação Platinum</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}