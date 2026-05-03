import { useState, useEffect } from 'react';
import { Plus, UserPlus, Search, Filter, Lock, Loader2, Mail, Phone, Flame, ChevronRight, Target, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import Modal from '../ui/Modal';

interface Lead {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  source: string | null;
  temperature: string;
}

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Novo',
    source: '',
    temperature: 'Frio',
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await api.get('/api/leads');
      setLeads(res.data.data || []);
    } catch (error) {
      toast.error('Falha na sincronização de leads');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/leads', formData);
      toast.success('Lead registrado no ecossistema!');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', status: 'Novo', source: '', temperature: 'Frio' });
      fetchLeads();
    } catch (error) {
      toast.error('Erro ao registrar lead');
    }
  };

  const getTemperatureBadge = (temp: string) => {
    const styles: Record<string, string> = {
      'Quente': 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
      'Morno': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'Frio': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    };
    return styles[temp] || 'bg-surface-elevated/40 text-text-muted border-border-subtle';
  };

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Gestão de <span className="text-gradient-gold">Leads</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <Lock size={14} className="text-primary" />
            Central de inteligência comercial e prospecção ativa.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          aria-label="Registrar novo lead"
          className="btn-primary py-3 px-8 shadow-platinum-glow"
        >
          <UserPlus className="w-4 h-4" />
          Novo Lead Platinum
        </button>
      </header>

      <div className="platinum-card p-6 bg-surface-elevated/10 backdrop-blur-xl shrink-0">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[300px] relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors w-4 h-4" />
            <input
              type="text"
              placeholder="Pesquisar leads por nome ou email..."
              className="w-full pl-14 pr-6 py-4 bg-background/50 border border-border-subtle rounded-2xl text-sm font-bold focus:border-primary/30 outline-none transition-all text-text-primary placeholder:text-text-muted/50 shadow-inner"
            />
          </div>
          <button className="px-8 py-4 bg-surface-elevated/40 border border-border-subtle text-text-muted rounded-2xl hover:bg-surface-elevated hover:text-text-primary transition-all flex items-center gap-3">
            <Filter size={18} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Filtros Avançados</span>
          </button>
        </div>
      </div>

      <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md flex-1">
        {loading ? (
          <div className="p-20 space-y-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-16 bg-surface-elevated/40 rounded-2xl w-1/4 border border-border-subtle/30" />
                <div className="h-16 bg-surface-elevated/40 rounded-2xl w-2/4 border border-border-subtle/30" />
                <div className="h-16 bg-surface-elevated/40 rounded-2xl w-1/4 border border-border-subtle/30" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-platinum">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-elevated/30 border-b border-border-subtle">
                <tr>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Perfil do Prospect</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Canais de Contato</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted text-center opacity-60">Pipeline Stage</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted text-center opacity-60">Engajamento</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted text-right opacity-60">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/30">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center gap-6 opacity-20">
                        <Target size={56} className="text-primary" />
                        <p className="font-black text-text-primary uppercase tracking-[0.4em] text-[10px]">Nenhum lead localizado no radar</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-surface-elevated/20 transition-all group border-b border-border-subtle/20 duration-300">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-border-subtle flex items-center justify-center font-black text-primary shadow-platinum-glow-sm group-hover:scale-110 transition-transform">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-black text-text-primary group-hover:text-primary transition-colors uppercase tracking-tight text-xs">{lead.name}</div>
                            <div className="text-[9px] text-text-muted font-bold mt-1 uppercase tracking-widest">{lead.source || 'Lead Manual'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="space-y-2">
                          {lead.email && (
                            <div className="flex items-center gap-3 text-text-secondary">
                              <Mail size={14} className="text-primary/60" />
                              <span className="text-[11px] font-bold">{lead.email}</span>
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-3 text-text-secondary">
                              <Phone size={14} className="text-primary/60" />
                              <span className="text-[11px] font-black font-mono">{lead.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <span className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-secondary/10 text-secondary border border-secondary/20 shadow-platinum-glow-sm">
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex justify-center">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border w-fit ${getTemperatureBadge(lead.temperature)}`}>
                            <Flame size={14} />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{lead.temperature}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                         <div className="flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                          <button className="p-3 bg-surface-elevated/40 border border-border-subtle rounded-xl text-text-muted hover:text-primary hover:scale-110 transition-all shadow-platinum-glow-sm">
                            <Search size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="REGISTRAR OPORTUNIDADE PLATINUM"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-8 p-2">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Nome do Prospect *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-5 py-4 bg-background border border-border-medium rounded-xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum"
              placeholder="Nome completo ou Razão Social"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Email Institucional</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-5 py-4 bg-background border border-border-medium rounded-xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum"
                placeholder="exemplo@empresa.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Telefone Direto</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-5 py-4 bg-background border border-border-medium rounded-xl text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all font-mono shadow-inner-platinum"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Pipeline Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-5 py-4 bg-background border border-border-medium rounded-xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all appearance-none cursor-pointer shadow-inner-platinum"
              >
                <option value="Novo" className="bg-surface font-bold text-text-primary">Novo Deal</option>
                <option value="Em progresso" className="bg-surface font-bold text-text-primary">Qualificando</option>
                <option value="Qualificado" className="bg-surface font-bold text-text-primary">Validado</option>
                <option value="Perdido" className="bg-surface font-bold text-text-primary">Perdido</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Origem do Deal</label>
              <input
                type="text"
                value={formData.source}
                onChange={e => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-5 py-4 bg-background border border-border-medium rounded-xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum"
                placeholder="Inbound, LinkedIn..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Lead Intent</label>
              <select
                value={formData.temperature}
                onChange={e => setFormData({ ...formData, temperature: e.target.value })}
                className="w-full px-5 py-4 bg-background border border-border-medium rounded-xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all appearance-none cursor-pointer shadow-inner-platinum"
              >
                <option value="Frio" className="bg-surface font-bold text-text-primary">Low Priority (Frio)</option>
                <option value="Morno" className="bg-surface font-bold text-text-primary">Medium Priority (Morno)</option>
                <option value="Quente" className="bg-surface font-bold text-text-primary">High Priority (Quente)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-6 pt-10 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-8 py-3 text-text-muted font-black hover:text-text-primary transition-all text-[10px] uppercase tracking-widest"
            >
              Descartar
            </button>
            <button
              type="submit"
              className="btn-primary py-4 px-12 uppercase text-[10px] tracking-widest shadow-platinum-glow flex items-center gap-3"
            >
              <Zap size={18} /> Registrar Lead Platinum
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
