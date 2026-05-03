import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Search, Send, CheckCircle2, X, Trash2, Loader2,
  Mail, Users, Calendar, FileText, Eye, Edit2, Lock, ShieldCheck, Zap, BarChart3, ChevronRight, Target
} from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

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
  draft: 'bg-white/5 text-text-muted border-white/10',
  scheduled: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  sending: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  sent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
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
      const payload = { ...formData, recipient_lead_ids: selectedLeads.map(l => l.id) };
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

  const handleSendCampaign = async (id: number) => {
    if (!confirm('Autorizar disparo imediato para toda a base selecionada?')) return;
    setLoading(true);
    try {
      await api.post(`/api/email-campaigns/${id}/send`);
      toast.success('Transmissão iniciada.');
      fetchCampaigns();
    } catch (err: any) {
      toast.error('Erro no gateway de envio');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remover campanha do histórico estratégico?')) return;
    try {
      await api.delete(`/api/email-campaigns/${id}`);
      toast.success('Campanha removida.');
      fetchCampaigns();
    } catch (err) {
      toast.error('Erro na exclusão');
    }
  };

  const toggleLeadSelection = (lead: Lead) => {
    const exists = selectedLeads.find(l => l.id === lead.id);
    if (exists) setSelectedLeads(selectedLeads.filter(l => l.id !== lead.id));
    else setSelectedLeads([...selectedLeads, lead]);
  };

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-8 text-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Strategic <span className="text-gradient-gold">Communication</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <Mail size={12} className="text-primary" />
            Engajamento inteligente e régua de relacionamento automatizada.
          </p>
        </div>
        <button
          onClick={() => handleOpenCompose()}
          className="flex items-center gap-3 px-6 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow uppercase text-xs tracking-widest"
        >
          <Plus className="w-4 h-4" />
          Nova Campanha
        </button>
      </header>

      <div className="platinum-card overflow-hidden">
        <div className="p-6 bg-white/[0.01] border-b border-white/5 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar por identificação ou assunto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-background/50 border border-white/5 rounded-xl text-sm text-white focus:border-primary/30 outline-none transition-all placeholder:text-text-muted"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-6 py-3 bg-background/50 border border-white/5 rounded-xl text-xs font-black uppercase tracking-widest text-white focus:border-primary/30 outline-none appearance-none cursor-pointer"
          >
            <option value="" className="bg-surface">Status: Todos</option>
            <option value="draft" className="bg-surface">Rascunho</option>
            <option value="scheduled" className="bg-surface">Agendada</option>
            <option value="sent" className="bg-surface">Concluída</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/5">
              <tr>
                <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Identificação</th>
                <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Engajamento</th>
                <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-center">Métricas</th>
                <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Status</th>
                <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-text-muted"><Loader2 className="animate-spin inline w-8 h-8 opacity-20" /></td></tr>
              ) : campaigns.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-text-muted uppercase text-[10px] font-black tracking-widest">Nenhuma campanha orquestrada</td></tr>
              ) : (
                campaigns.map(campaign => (
                  <tr key={campaign.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-6 space-y-1">
                      <div className="font-bold text-white group-hover:text-primary transition-colors uppercase tracking-tight">{campaign.name}</div>
                      <div className="text-[10px] text-text-muted truncate max-w-xs">{campaign.subject}</div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-white font-black">{campaign.recipient_count}</span>
                          <span className="text-[8px] text-text-muted uppercase tracking-widest font-black">Lead Reach</span>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div className="flex flex-col">
                          <span className="text-emerald-400 font-black">{campaign.open_count}</span>
                          <span className="text-[8px] text-text-muted uppercase tracking-widest font-black">Open Rate</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex items-center justify-center gap-2 text-text-muted">
                        <BarChart3 size={16} className="opacity-40" />
                        <span className="text-[10px] font-bold text-white">{campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString('pt-BR') : '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border ${STATUS_STYLES[campaign.status]}`}>
                        {STATUS_LABELS[campaign.status] || campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleOpenCompose(campaign)} className="p-2 text-text-muted hover:text-primary transition-all"><Edit2 size={16} /></button>
                        {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                          <button onClick={() => handleSendCampaign(campaign.id)} className="p-2 text-text-muted hover:text-emerald-400 transition-all"><Send size={16} /></button>
                        )}
                        <button onClick={() => handleDelete(campaign.id)} className="p-2 text-text-muted hover:text-red-400 transition-all"><Trash2 size={16} /></button>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-surface border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col scale-100 animate-in zoom-in-95">
            <div className="flex justify-between items-center px-8 py-6 border-b border-white/5 bg-white/[0.02]">
              <div className="space-y-1">
                <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">
                  {editingCampaign ? 'Refinar Campanha' : 'Orquestrar Nova Campanha'}
                </h2>
                <div className="flex items-center gap-2 text-[10px] text-text-muted font-bold uppercase tracking-widest">
                  <Lock size={10} className="text-primary" /> Multi-Channel Strategic Output
                </div>
              </div>
              <button onClick={() => setShowComposeModal(false)} className="p-2 text-text-muted hover:text-white transition-all"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-8">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Identificação Interna</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/40 transition-all"
                        placeholder="Ex: Lançamento Linha Hospitalar"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Assunto do E-mail</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/40 transition-all"
                        placeholder="Subject Line Estratégico"
                      />
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/5 space-y-4">
                    <label className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                      <Users size={14} className="text-primary" /> Segmentação de Leads
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted" />
                      <input
                        type="text"
                        placeholder="Buscar por nome ou domínio..."
                        value={searchLeadTerm}
                        onChange={(e) => setSearchLeadTerm(e.target.value)}
                        className="w-full bg-background border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none focus:border-primary/40 transition-all"
                      />
                    </div>
                    
                    {loadingLeads ? (
                      <p className="text-[10px] text-text-muted animate-pulse">Consultando base...</p>
                    ) : leadResults.length > 0 && searchLeadTerm.length >= 2 ? (
                      <div className="max-h-40 overflow-y-auto border border-white/5 rounded-xl bg-background/50 divide-y divide-white/5">
                        {leadResults.map(lead => {
                          const isSelected = selectedLeads.some(l => l.id === lead.id);
                          return (
                            <div
                              key={lead.id}
                              onClick={() => toggleLeadSelection(lead)}
                              className={`p-3 cursor-pointer text-[10px] hover:bg-white/5 transition-all flex items-center gap-3 ${isSelected ? 'text-primary' : 'text-text-muted'}`}
                            >
                              <div className={`w-3 h-3 border rounded flex items-center justify-center transition-all ${isSelected ? 'border-primary bg-primary' : 'border-white/20'}`}>
                                {isSelected && <CheckCircle2 size={10} className="text-background" />}
                              </div>
                              <div className="truncate">
                                <span className="font-bold text-white">{lead.name}</span> <br/>
                                <span className="opacity-60">{lead.email}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}

                    {selectedLeads.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-text-muted uppercase">Selecionados ({selectedLeads.length})</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedLeads.map(lead => (
                            <span key={lead.id} className="bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-2">
                              {lead.email}
                              <button onClick={() => toggleLeadSelection(lead)} className="hover:text-white transition-colors">&times;</button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Corpo do E-mail (HTML Core)</label>
                    <div className="flex items-center gap-2 text-[10px] text-primary font-black uppercase tracking-widest italic">
                      <Zap size={12} /> Responsive Design Active
                    </div>
                  </div>
                  <textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-[2rem] px-6 py-6 text-xs text-white outline-none focus:border-primary/40 transition-all font-mono custom-scrollbar"
                    rows={18}
                    placeholder="<html>\n  <body style='font-family: sans-serif;'>\n    <h1>Sua Mensagem Estratégica</h1>\n  </body>\n</html>"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center gap-6 p-8 border-t border-white/5 bg-white/[0.02]">
              <button
                onClick={() => setShowComposeModal(false)}
                className="text-[10px] font-black text-text-muted hover:text-white uppercase tracking-widest transition-all"
              >
                Descartar Mudanças
              </button>
              <button
                onClick={handleSaveCampaign}
                disabled={loading}
                className="px-10 py-4 bg-primary text-background font-black rounded-2xl hover:bg-primary-hover transition-all shadow-platinum-glow uppercase text-[10px] tracking-widest disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : editingCampaign ? 'Consolidar Alterações' : 'Confirmar Campanha'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}