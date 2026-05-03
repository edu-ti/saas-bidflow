import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Send, CheckCircle2, Clock, Search, X, Trash2,
  MessageCircle, Mail, Loader2, Target, Zap, BarChart3, ShieldCheck, Globe, Lock, Filter
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
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-400' },
  { value: 'email', label: 'E-mail', icon: Mail, color: 'text-blue-400' },
  { value: 'sms', label: 'SMS', icon: Send, color: 'text-purple-400' },
];

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
  draft: { label: 'Rascunho', style: 'bg-white/5 text-text-muted border-white/10' },
  active: { label: 'Em Disparo', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  scheduled: { label: 'Agendada', style: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  paused: { label: 'Interrompida', style: 'bg-red-500/10 text-red-400 border-red-500/20' },
  completed: { label: 'Concluída', style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterStatus]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/campaigns/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
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
      console.error(err);
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
      console.error(err);
      toast.error('Erro na remoção operacional');
    }
  };

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-8 text-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Strategic <span className="text-gradient-gold">Omnichannel</span> Dispatches
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <Globe size={12} className="text-primary" />
            Orquestração de campanhas massivas com inteligência de conversão Platinum.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-3 px-8 py-4 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow uppercase text-[10px] tracking-widest"
        >
          <Plus size={16} /> Nova Campanha
        </button>
      </header>

      {/* Stats Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'DISPAROS CONCLUÍDOS', val: stats.total_sent, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'ESTRATÉGIAS ATIVAS', val: stats.active, icon: Zap, color: 'text-primary' },
          { label: 'FILA DE AGENDAMENTO', val: stats.scheduled, icon: Clock, color: 'text-blue-400' },
        ].map((s, i) => (
          <div key={i} className="platinum-card p-6 flex items-center justify-between group overflow-hidden">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">{s.label}</p>
              <p className="text-3xl font-black text-white tracking-tighter">{s.val}</p>
            </div>
            <div className={`p-4 rounded-2xl bg-white/[0.02] border border-white/5 ${s.color} group-hover:scale-110 transition-transform`}>
              <s.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="platinum-card overflow-hidden">
        <div className="p-6 bg-white/[0.01] border-b border-white/5 flex flex-wrap items-center gap-6">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar por identificação, canal ou status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none transition-all placeholder:text-text-muted"
            />
          </div>
          <div className="flex items-center gap-3 bg-white/[0.02] p-1.5 rounded-xl border border-white/5">
            <Filter size={14} className="ml-2 text-text-muted" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest px-4 py-2 outline-none cursor-pointer"
            >
              <option value="" className="bg-surface">TODOS OS STATUS</option>
              {Object.keys(STATUS_CONFIG).map(key => (
                <option key={key} value={key} className="bg-surface">{STATUS_CONFIG[key].label.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/5">
              <tr>
                <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Campanha / Identificação</th>
                <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Canal</th>
                <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Status</th>
                <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-right">Performance</th>
                <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-right">Controles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center"><Loader2 className="animate-spin inline-block w-8 h-8 opacity-20" /></td></tr>
              ) : campaigns.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Nenhuma estratégia localizada</td></tr>
              ) : (
                campaigns.map(campaign => {
                  const channel = CHANNEL_OPTIONS.find(c => c.value === campaign.channel);
                  const Icon = channel?.icon || Globe;
                  return (
                    <tr key={campaign.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-6 py-6">
                        <div className="font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight text-sm">{campaign.name}</div>
                        <div className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-widest italic">Criada em: {new Date(campaign.created_at).toLocaleDateString('pt-BR')}</div>
                      </td>
                      <td className="px-6 py-6">
                        <div className={`flex items-center gap-2.5 ${channel?.color}`}>
                          <Icon size={14} />
                          <span className="font-black text-[10px] uppercase tracking-widest">{channel?.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border ${STATUS_CONFIG[campaign.status]?.style}`}>
                          {STATUS_CONFIG[campaign.status]?.label}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="space-y-1">
                          <div className="text-white font-black">{campaign.sent} Disparos</div>
                          <div className="text-[9px] text-primary font-black uppercase tracking-widest flex items-center justify-end gap-1">
                            <BarChart3 size={10} /> {campaign.open_rate || '0.0%'} Conversion
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleOpenModal(campaign)} className="p-2 text-text-muted hover:text-white transition-colors" title="Editar"><Target size={16} /></button>
                          <button onClick={() => handleDelete(campaign.id)} className="p-2 text-text-muted hover:text-red-400 transition-colors" title="Excluir"><Trash2 size={16} /></button>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-surface border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="flex justify-between items-center px-8 py-6 border-b border-white/5 bg-white/[0.02]">
              <div className="space-y-1">
                <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">
                  {editingCampaign ? 'Configuração de Transmissão' : 'Nova Orquestração'}
                </h2>
                <div className="flex items-center gap-2 text-[10px] text-text-muted font-bold uppercase tracking-widest">
                  <Lock size={10} className="text-primary" /> Strategic Multi-Channel Dispatch
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-text-muted hover:text-white transition-all"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Nome da Campanha</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-4 text-sm text-white outline-none focus:border-primary/40 transition-all placeholder:text-text-muted"
                  placeholder="Ex: Follow-up Leads Q2"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Canal de Disparo</label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value as any })}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-4 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-primary/40 transition-all appearance-none cursor-pointer"
                  >
                    {CHANNEL_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-surface">{opt.label.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Fase de Lifecycle</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-4 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-primary/40 transition-all appearance-none cursor-pointer"
                  >
                    {Object.keys(STATUS_CONFIG).map(key => (
                      <option key={key} value={key} className="bg-surface">{STATUS_CONFIG[key].label.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Mensagem Base / Copywriting</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-4 text-xs text-white outline-none focus:border-primary/40 transition-all min-h-[120px] resize-none"
                  placeholder="Defina o conteúdo estratégico da transmissão..."
                />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-[10px] font-black text-text-muted hover:text-white uppercase tracking-widest transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-4 bg-primary text-background font-black rounded-2xl hover:bg-primary-hover transition-all shadow-platinum-glow uppercase text-[10px] tracking-widest disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : editingCampaign ? 'Confirmar Ajustes' : 'Iniciar Estratégia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}