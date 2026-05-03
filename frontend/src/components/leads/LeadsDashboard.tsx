import { useState, useEffect } from 'react';
import { Plus, UserPlus, Search, Filter, Lock, Loader2, Mail, Phone, Flame } from 'lucide-react';
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
      console.error(error);
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
      console.error(error);
    }
  };

  const getTemperatureBadge = (temp: string) => {
    const styles: Record<string, string> = {
      'Quente': 'bg-red-500/10 text-red-400 border-red-500/20',
      'Morno': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'Frio': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };
    return styles[temp] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-8 text-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Gestão de <span className="text-gradient-gold">Leads</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <Lock size={12} className="text-primary" />
            Central de inteligência comercial e prospecção ativa.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          aria-label="Registrar novo lead"
          className="flex items-center gap-3 px-6 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow uppercase text-xs tracking-widest"
        >
          <UserPlus className="w-4 h-4" />
          Novo Lead
        </button>
      </header>

      <div className="platinum-card p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[280px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Pesquisar leads por nome ou email..."
              className="w-full pl-11 pr-4 py-3 bg-background/50 border border-white/5 rounded-xl text-sm focus:border-primary/30 outline-none transition-all text-white placeholder:text-text-muted"
            />
          </div>
          <button className="px-6 py-3 bg-surface-elevated text-primary rounded-xl hover:bg-primary/10 transition-all border border-primary/20 flex items-center gap-2">
            <Filter size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Filtros</span>
          </button>
        </div>
      </div>

      <div className="platinum-card overflow-hidden">
        {loading ? (
          <div className="p-12 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-14 bg-white/5 rounded-lg w-1/4" />
                <div className="h-14 bg-white/5 rounded-lg w-2/4" />
                <div className="h-14 bg-white/5 rounded-lg w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Perfil</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Contato Principal</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Status Atual</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Engajamento</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <UserPlus size={40} className="text-primary" />
                        <p className="font-bold text-text-secondary uppercase tracking-widest text-xs">Nenhum lead em monitoramento</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-surface-elevated border border-white/10 flex items-center justify-center font-black text-primary">
                            {lead.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-primary transition-colors">{lead.name}</div>
                            <div className="text-[10px] text-text-muted uppercase tracking-widest">{lead.source || 'Lead Manual'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-1">
                          {lead.email && (
                            <div className="flex items-center gap-2 text-text-secondary">
                              <Mail size={12} className="text-primary/60" />
                              <span className="text-xs">{lead.email}</span>
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-2 text-text-secondary">
                              <Phone size={12} className="text-primary/60" />
                              <span className="text-xs font-mono">{lead.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-secondary/10 text-secondary border border-secondary/20">
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border w-fit ${getTemperatureBadge(lead.temperature)}`}>
                          <Flame size={12} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{lead.temperature}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <button className="p-2 text-text-muted hover:text-primary transition-all">
                          <Search size={16} />
                        </button>
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
        title="REGISTRAR OPORTUNIDADE"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Nome do Prospect *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none transition-all text-white"
              placeholder="Nome completo ou Razão Social"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Canal de Comunicação (Email)</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white"
                placeholder="exemplo@empresa.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Contato Direto</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white font-mono"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Pipeline Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white appearance-none"
              >
                <option value="Novo" className="bg-surface">Novo</option>
                <option value="Em progresso" className="bg-surface">Qualificando</option>
                <option value="Qualificado" className="bg-surface">Validado</option>
                <option value="Perdido" className="bg-surface">Perdido</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Origem do Deal</label>
              <input
                type="text"
                value={formData.source}
                onChange={e => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white"
                placeholder="Inbound, Evento..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Qualificação</label>
              <select
                value={formData.temperature}
                onChange={e => setFormData({ ...formData, temperature: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white appearance-none"
              >
                <option value="Frio" className="bg-surface">Frio</option>
                <option value="Morno" className="bg-surface">Morno</option>
                <option value="Quente" className="bg-surface">Quente (High Intent)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-8 py-3 text-text-muted font-bold hover:text-white transition-all text-xs uppercase tracking-widest"
            >
              Descartar
            </button>
            <button
              type="submit"
              className="px-10 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow text-xs uppercase tracking-widest"
            >
              Registrar Lead
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
