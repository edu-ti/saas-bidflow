import { useState, useEffect } from 'react';
import { Plus, UserPlus, Search, Filter, Lock, Loader2, Mail, Phone, Flame, ChevronRight, Target, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import Modal from '../ui/Modal';
import { Select } from '../ui/Select';

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
      'Quente': 'bg-danger/10 text-danger border-danger/20',
      'Morno': 'bg-warning/10 text-warning border-warning/20',
      'Frio': 'bg-primary/10 text-primary border-primary/20',
    };
    return styles[temp] || 'bg-bg-tertiary text-text-muted border-border';
  };

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Gestão de Leads
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Central de inteligência comercial e prospecção ativa.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Novo Lead</span>
        </button>
      </header>

      <div className="card p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Pesquisar leads por nome ou email..."
              className="input w-full pl-9"
            />
          </div>
          <button className="btn btn-outline flex items-center gap-2">
            <Filter size={16} />
            <span>Filtros Avançados</span>
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-10 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-16 bg-bg-tertiary rounded-lg w-1/4" />
                <div className="h-16 bg-bg-tertiary rounded-lg w-2/4" />
                <div className="h-16 bg-bg-tertiary rounded-lg w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-bg-tertiary border-b border-border text-text-secondary">
                <tr>
                  <th className="px-6 py-3 font-medium">Perfil do Prospect</th>
                  <th className="px-6 py-3 font-medium">Canais de Contato</th>
                  <th className="px-6 py-3 font-medium text-center">Pipeline Stage</th>
                  <th className="px-6 py-3 font-medium text-center">Engajamento</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-text-muted">
                        <Target size={48} className="text-border" />
                        <p className="font-medium">Nenhum lead localizado no radar</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-bg-tertiary transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-bg-secondary border border-border flex items-center justify-center font-semibold text-primary">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-text-primary group-hover:text-primary transition-colors">{lead.name}</div>
                            <div className="text-xs text-text-muted mt-0.5">{lead.source || 'Lead Manual'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          {lead.email && (
                            <div className="flex items-center gap-2 text-text-secondary text-sm">
                              <Mail size={14} className="text-text-muted" />
                              <span>{lead.email}</span>
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-2 text-text-secondary text-sm">
                              <Phone size={14} className="text-text-muted" />
                              <span className="font-mono">{lead.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20">
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border w-fit ${getTemperatureBadge(lead.temperature)}`}>
                            <Flame size={14} />
                            <span className="text-xs font-medium">{lead.temperature}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-text-muted hover:text-primary hover:bg-bg-secondary rounded-lg transition-colors" title="Ver detalhes">
                            <Search size={16} />
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
        title="Registrar Nova Oportunidade"
        size="md"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Nome do Prospect <span className="text-danger">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="input w-full"
              placeholder="Nome completo ou Razão Social"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Email Institucional</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="input w-full"
                placeholder="exemplo@empresa.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Telefone Direto</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="input w-full font-mono"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Pipeline Status</label>
              <Select
                value={formData.status}
                onChange={v => setFormData({ ...formData, status: v })}
                options={[
                  { value: 'Novo', label: 'Novo Deal' },
                  { value: 'Em progresso', label: 'Qualificando' },
                  { value: 'Qualificado', label: 'Validado' },
                  { value: 'Perdido', label: 'Perdido' }
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Origem do Deal</label>
              <input
                type="text"
                value={formData.source}
                onChange={e => setFormData({ ...formData, source: e.target.value })}
                className="input w-full"
                placeholder="Inbound, LinkedIn..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Lead Intent</label>
              <Select
                value={formData.temperature}
                onChange={v => setFormData({ ...formData, temperature: v })}
                options={[
                  { value: 'Frio', label: 'Baixa (Frio)' },
                  { value: 'Morno', label: 'Média (Morno)' },
                  { value: 'Quente', label: 'Alta (Quente)' }
                ]}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-outline"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Salvar Lead
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
