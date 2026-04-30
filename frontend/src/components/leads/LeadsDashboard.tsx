import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
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
      setLeads(res.data.data);
    } catch (error) {
      toast.error('Erro ao carregar leads');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/api/leads', formData);
      toast.success('Lead criado com sucesso!');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', status: 'Novo', source: '', temperature: 'Frio' });
      fetchLeads();
    } catch (error) {
      toast.error('Erro ao criar lead');
      console.error(error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-sm text-slate-500">Gestão de leads comerciais</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Lead
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">A carregar leads...</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Nome</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Email / Contacto</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Status</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Temperatura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Nenhum registo encontrado.
                  </td>
                </tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{lead.name}</td>
                    <td className="px-6 py-4">
                      {lead.email && <div>{lead.email}</div>}
                      {lead.phone && <div className="text-xs text-slate-400">{lead.phone}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${lead.temperature === 'Quente' ? 'bg-red-50 text-red-700 border-red-200' : lead.temperature === 'Morno' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {lead.temperature}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Formulário */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Lead"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nome *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nome completo"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Telefone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Novo">Novo</option>
                <option value="Em progresso">Em progresso</option>
                <option value="Qualificado">Qualificado</option>
                <option value="Perdido">Perdido</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Fonte
              </label>
              <input
                type="text"
                value={formData.source}
                onChange={e => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Website, Indicação..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Temperatura
              </label>
              <select
                value={formData.temperature}
                onChange={e => setFormData({ ...formData, temperature: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Frio">Frio</option>
                <option value="Morno">Morno</option>
                <option value="Quente">Quente</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Criar Lead
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
