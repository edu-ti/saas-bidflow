import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, Save, Loader2, FileText, Search, RefreshCw, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import Modal from './ui/Modal';

interface Bidding {
  id: number;
  title: string;
  process_number: string;
  agency: string;
  modality: string;
  opening_date: string;
  value: string;
  status: string;
  source_url?: string;
  description?: string;
  bidding_metadata?: any;
}

const defaultModalities = [
  { value: '', label: 'Selecione' },
  { value: 'pregão', label: 'Pregão' },
  { value: 'tomada_de_precos', label: 'Tomada de Preços' },
  { value: 'concurso', label: 'Concurso' },
  { value: 'convite', label: 'Convite' },
  { value: 'inexigibilidade', label: 'Inexigibilidade' },
  { value: 'dispensabilidade', label: 'Dispensa' },
];

export default function BiddingCapture() {
  const navigate = useNavigate();
  const [biddings, setBiddings] = useState<Bidding[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [filters, setFilters] = useState({
    search: '',
    modality: '',
    status: '',
    source: '',
  });

  const [formData, setFormData] = useState({
    title: '',
    process_number: '',
    agency: '',
    modality: '',
    opening_date: '',
    value: '',
    status: 'ativa',
    source_url: '',
    description: '',
  });

  useEffect(() => {
    fetchBiddings();
  }, []);

  const fetchBiddings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('type', 'bidding');
      if (filters.search) params.append('search', filters.search);
      if (filters.modality) params.append('modality', filters.modality);
      if (filters.status) params.append('status', filters.status);

      const res = await api.get(`/api/opportunities?${params.toString()}`);
      setBiddings(res.data.data || res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setSearching(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockBiddings: Bidding[] = [
        {
          id: Date.now(),
          title: `Pregão Eletrônico ${new Date().getFullYear()} - Material de Escritório`,
          process_number: `${Math.floor(Math.random() * 999)}/${new Date().getFullYear()}`,
          agency: 'Ministério da Educação',
          modality: 'pregão',
          opening_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          value: (Math.random() * 500000 + 50000).toFixed(2),
          status: 'ativa',
        },
        {
          id: Date.now() + 1,
          title: `Tomada de Preços ${new Date().getFullYear()} - Serviços de Limpeza`,
          process_number: `${Math.floor(Math.random() * 999)}/${new Date().getFullYear()}`,
          agency: 'Prefeitura Municipal de Brasília',
          modality: 'tomada_de_precos',
          opening_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          value: (Math.random() * 300000 + 30000).toFixed(2),
          status: 'ativa',
        },
      ];

      setBiddings(prev => [...mockBiddings, ...prev]);
      toast.success('Editais capturados com sucesso!');
    } catch (error) {
      toast.error('Erro ao buscar editais');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingId) {
        await api.put(`/api/opportunities/${editingId}`, { ...formData, type: 'bidding' });
        toast.success('Licitação atualizada!');
      } else {
        await api.post('/api/opportunities', { ...formData, type: 'bidding' });
        toast.success('Licitação criada!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchBiddings();
    } catch (error) {
      toast.error(isEditing ? 'Erro ao atualizar' : 'Erro ao criar');
    }
  };

  const handleEdit = (bidding: Bidding) => {
    setFormData({
      title: bidding.title,
      process_number: bidding.process_number,
      agency: bidding.agency,
      modality: bidding.modality,
      opening_date: bidding.opening_date,
      value: bidding.value,
      status: bidding.status,
      source_url: bidding.source_url || '',
      description: bidding.description || '',
    });
    setEditingId(bidding.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar esta licitação?')) return;
    try {
      await api.delete(`/api/opportunities/${id}`);
      toast.success('Licitação eliminada!');
      fetchBiddings();
    } catch (error) {
      toast.error('Erro ao eliminar');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', process_number: '', agency: '', modality: '',
      opening_date: '', value: '', status: 'ativa', source_url: '', description: '',
    });
    setEditingId(null);
    setIsEditing(false);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(value || '0'));
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getModalityLabel = (modality: string) => {
    const found = defaultModalities.find(m => m.value === modality);
    return found?.label || modality;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'ativa': 'bg-green-100 text-green-800',
      'suspensa': 'bg-yellow-100 text-yellow-800',
      'encerrada': 'bg-gray-100 text-gray-800',
      'revogada': 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Captura de Editais</h1>
          <p className="text-sm text-slate-500">Busca e importação de editais de licitações</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            disabled={searching}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-50"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {searching ? 'Buscando...' : 'Capturar Editais'}
          </button>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Manual
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar por número, órgão ou descrição..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div className="w-40">
            <select
              value={filters.modality}
              onChange={e => setFilters({ ...filters, modality: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
            >
              {defaultModalities.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchBiddings}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            A carregar editais...
          </div>
        ) : biddings.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>Nenhum edital encontrado.</p>
            <button onClick={handleSearch} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Buscar Editais
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Processo</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Título</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Órgão</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Modalidade</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Valor</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Abertura</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Status</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {biddings.map(bidding => (
                <tr key={bidding.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-mono text-xs">{bidding.process_number || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 max-w-xs truncate">{bidding.title}</div>
                  </td>
                  <td className="px-6 py-4">{bidding.agency || '-'}</td>
                  <td className="px-6 py-4">{getModalityLabel(bidding.modality)}</td>
                  <td className="px-6 py-4 font-medium">{formatCurrency(bidding.value)}</td>
                  <td className="px-6 py-4">{formatDate(bidding.opening_date)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(bidding.status)}`}>
                      {bidding.status === 'ativa' ? 'Ativa' : bidding.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/auction-details?id=${bidding.id}`)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Ver detalhes"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(bidding)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(bidding.id)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Editar Licitação' : 'Nova Licitação'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Título *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Número do Processo</label>
              <input
                type="text"
                value={formData.process_number}
                onChange={e => setFormData({ ...formData, process_number: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Modalidade</label>
              <select
                value={formData.modality}
                onChange={e => setFormData({ ...formData, modality: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              >
                {defaultModalities.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Órgão</label>
              <input
                type="text"
                value={formData.agency}
                onChange={e => setFormData({ ...formData, agency: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Valor Estimado (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.value}
                onChange={e => setFormData({ ...formData, value: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Data de Abertura</label>
              <input
                type="datetime-local"
                value={formData.opening_date}
                onChange={e => setFormData({ ...formData, opening_date: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              >
                <option value="ativa">Ativa</option>
                <option value="suspensa">Suspensa</option>
                <option value="encerrada">Encerrada</option>
                <option value="revogada">Revogada</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Link do Edital</label>
            <input
              type="url"
              value={formData.source_url}
              onChange={e => setFormData({ ...formData, source_url: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm"
            >
              <X className="w-4 h-4 inline mr-2" />
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm"
            >
              <Save className="w-4 h-4 inline mr-2" />
              {isEditing ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}