import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Search, Send, CheckCircle2, X, Trash2, Loader2,
  Mail, Users, Calendar, FileText, Eye, Edit2
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

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  scheduled: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  sending: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  sent: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  scheduled: 'Agendada',
  sending: 'Enviando',
  sent: 'Enviada',
  failed: 'Falhou',
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
  const editorRef = useRef<any>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus) params.append('status', filterStatus);

      const res = await api.get(`/api/email-campaigns?${params}`);
      setCampaigns(res.data.data || res.data);
    } catch (err) {
      console.error(err);
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
      setLeadResults(res.data);
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
      setFormData({
        name: '',
        subject: '',
        body: '',
        recipient_lead_ids: [],
      });
      setSelectedLeads([]);
    }
    setShowComposeModal(true);
  };

  const handleSaveCampaign = async () => {
    if (!formData.name || !formData.subject) {
      toast.error('Nome e assunto são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        recipient_lead_ids: selectedLeads.map(l => l.id),
      };

      if (editingCampaign) {
        await api.put(`/api/email-campaigns/${editingCampaign.id}`, payload);
        toast.success('Campanha atualizada!');
      } else {
        await api.post('/api/email-campaigns', payload);
        toast.success('Campanha criada!');
      }

      setShowComposeModal(false);
      fetchCampaigns();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async (id: number) => {
    if (!confirm('Enviar campanha para todos os destinatários?')) return;

    setLoading(true);
    try {
      await api.post(`/api/email-campaigns/${id}/send`);
      toast.success('Campanha enviada!');
      fetchCampaigns();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao enviar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir campanha?')) return;

    try {
      await api.delete(`/api/email-campaigns/${id}`);
      toast.success('Campanha excluída!');
      fetchCampaigns();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao excluir');
    }
  };

  const toggleLeadSelection = (lead: Lead) => {
    const exists = selectedLeads.find(l => l.id === lead.id);
    if (exists) {
      setSelectedLeads(selectedLeads.filter(l => l.id !== lead.id));
    } else {
      setSelectedLeads([...selectedLeads, lead]);
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = !searchTerm || 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">E-mail Marketing</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Crie e gerencie campanhas de e-mail</p>
          </div>
          <button
            onClick={() => handleOpenCompose()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> Nova Campanha
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar campanhas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            >
              <option value="">Todos os Status</option>
              <option value="draft">Rascunho</option>
              <option value="scheduled">Agendada</option>
              <option value="sent">Enviada</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Assunto</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Destinatários</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Enviada em</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500"><Loader2 className="animate-spin inline" /></td></tr>
                ) : filteredCampaigns.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Nenhuma campanha encontrada</td></tr>
                ) : (
                  filteredCampaigns.map(campaign => (
                    <tr key={campaign.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{campaign.name}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{campaign.subject}</td>
                      <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300">{campaign.recipient_count}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[campaign.status]}`}>
                          {STATUS_LABELS[campaign.status] || campaign.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-sm">
                        {campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleOpenCompose(campaign)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                            <button onClick={() => handleSendCampaign(campaign.id)} className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded">
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => handleDelete(campaign.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showComposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editingCampaign ? 'Editar Campanha' : 'Nova Campanha'}
              </h2>
              <button onClick={() => setShowComposeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome da Campanha *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                      placeholder="Ex: Promoção de Janeiro"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assunto do E-mail *</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                      placeholder="Ex: Oferta especial para você!"
                    />
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Destinatários</label>
                    <input
                      type="text"
                      placeholder="Buscar leads..."
                      value={searchLeadTerm}
                      onChange={(e) => setSearchLeadTerm(e.target.value)}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm mb-2"
                    />
                    
                    {loadingLeads ? (
                      <p className="text-xs text-slate-500">Buscando...</p>
                    ) : leadResults.length > 0 && searchLeadTerm.length >= 2 ? (
                      <div className="max-h-32 overflow-y-auto border rounded bg-slate-50 dark:bg-slate-700">
                        {leadResults.map(lead => {
                          const isSelected = selectedLeads.some(l => l.id === lead.id);
                          return (
                            <div
                              key={lead.id}
                              onClick={() => toggleLeadSelection(lead)}
                              className={`p-2 cursor-pointer text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 ${isSelected ? 'bg-indigo-100 dark:bg-indigo-900/50' : ''}`}
                            >
                              <input type="checkbox" checked={isSelected} readOnly className="mr-2" />
                              {lead.name} - {lead.email}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}

                    {selectedLeads.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-slate-500 mb-1">Selecionados ({selectedLeads.length}):</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedLeads.map(lead => (
                            <span key={lead.id} className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                              {lead.email}
                              <button onClick={() => toggleLeadSelection(lead)} className="text-indigo-500 hover:text-indigo-700">&times;</button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Corpo do E-mail (HTML)</label>
                  <textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-mono text-sm"
                    rows={15}
                    placeholder="<html>...corpo do e-mail...</html>"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowComposeModal(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCampaign}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : editingCampaign ? 'Salvar Alterações' : 'Criar Campanha'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}