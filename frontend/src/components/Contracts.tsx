import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, FileText, Edit, Trash2, Eye, Send, CheckCircle,
  XCircle, Clock, AlertTriangle, Download, Upload, Calendar, X,
  ChevronRight, Paperclip, User, Building, Truck, Users
} from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

type Contract = {
  id: number;
  contract_number: string;
  status: string;
  value: number;
  start_date: string;
  end_date: string;
  payment_terms?: string;
  renewal_type: string;
  generated_content?: string;
  contract_template_id?: number;
  template?: { id: number; name: string; type: string };
  contractable_id: number;
  contractable_type: string;
  contractable?: { name?: string; corporate_name?: string; cnpj?: string; cpf?: string };
  approvals?: ContractApproval[];
  addendums?: ContractAddendum[];
  attachments?: Attachment[];
  approved_by_user_id?: number;
  approved_at?: string;
  signed_at?: string;
  created_at: string;
};

type ContractApproval = {
  id: number;
  role: string;
  status: string;
  comments?: string;
  user?: { name: string };
  created_at: string;
};

type ContractAddendum = {
  id: number;
  title: string;
  type: string;
  old_value?: number;
  new_value?: number;
  old_end_date?: string;
  new_end_date?: string;
  effective_date: string;
};

type Attachment = {
  id: number;
  file_name: string;
  file_path: string;
  type?: string;
};

type ContractTemplate = {
  id: number;
  name: string;
  type: string;
  content: string;
  active: boolean;
};

type IndividualClient = { id: number; name: string; cpf: string };
type CompanyClient = { id: number; corporate_name: string; cnpj: string };
type Supplier = { id: number; name: string; document_number: string };
type Organization = { id: number; name: string; document_number: string };

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Rascunho', color: 'text-slate-600', bg: 'bg-slate-100' },
  under_review: { label: 'Em Revisão', color: 'text-amber-600', bg: 'bg-amber-100' },
  approved: { label: 'Aprovado', color: 'text-blue-600', bg: 'bg-blue-100' },
  sent_for_signature: { label: 'Enviado p/ Assinatura', color: 'text-indigo-600', bg: 'bg-indigo-100' },
  active: { label: 'Ativo', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  finished: { label: 'Finalizado', color: 'text-slate-500', bg: 'bg-slate-100' },
  cancelled: { label: 'Cancelado', color: 'text-red-600', bg: 'bg-red-100' },
};

const TYPE_LABELS: Record<string, string> = {
  servico: 'Serviço',
  aluguel: 'Aluguel',
  compra: 'Compra',
  parceria: 'Parceria',
  fornecimento: 'Fornecimento',
  outros: 'Outros',
};

const TIMELINE_STEPS = [
  { key: 'draft', label: 'Elaboração', icon: FileText },
  { key: 'under_review', label: 'Revisão', icon: Eye },
  { key: 'approved', label: 'Aprovação', icon: CheckCircle },
  { key: 'sent_for_signature', label: 'Assinatura', icon: Send },
  { key: 'active', label: 'Execução', icon: CheckCircle },
];

export default function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [individualClients, setIndividualClients] = useState<IndividualClient[]>([]);
  const [companyClients, setCompanyClients] = useState<CompanyClient[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const [formData, setFormData] = useState({
    contract_template_id: '',
    contractable_type: '',
    contractable_id: '',
    value: '',
    start_date: '',
    end_date: '',
    payment_terms: '',
    renewal_type: 'manual',
  });

  const [templateFormData, setTemplateFormData] = useState({
    name: '',
    type: 'servico',
    content: '',
    active: true,
  });

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);

      const res = await api.get(`/api/contracts?${params}`);
      setContracts(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar contratos');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/api/contract-templates?active=true');
      setTemplates(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEntities = async () => {
    try {
      const [icRes, ccRes, supRes, orgRes] = await Promise.all([
        api.get('/api/individual-clients'),
        api.get('/api/company-clients'),
        api.get('/api/suppliers'),
        api.get('/api/organizations'),
      ]);
      setIndividualClients(icRes.data.data || icRes.data);
      setCompanyClients(ccRes.data.data || ccRes.data);
      setSuppliers(supRes.data.data || supRes.data);
      setOrganizations(orgRes.data.data || orgRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContracts();
    fetchTemplates();
  }, [fetchContracts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/contracts', formData);
      toast.success('Contrato criado com sucesso!');
      setShowModal(false);
      resetForm();
      fetchContracts();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao criar contrato');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/contract-templates', templateFormData);
      toast.success('Template criado com sucesso!');
      setShowTemplateModal(false);
      setTemplateFormData({ name: '', type: 'servico', content: '', active: true });
      fetchTemplates();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao criar template');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (contractId: number, newStatus: string) => {
    try {
      await api.patch(`/api/contracts/${contractId}/status`, { status: newStatus });
      toast.success('Status atualizado!');
      fetchContracts();
      if (selectedContract?.id === contractId) {
        const res = await api.get(`/api/contracts/${contractId}`);
        setSelectedContract(res.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao atualizar status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este contrato?')) return;
    try {
      await api.delete(`/api/contracts/${id}`);
      toast.success('Contrato excluído!');
      fetchContracts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao excluir');
    }
  };

  const openDetail = async (contract: Contract) => {
    try {
      const res = await api.get(`/api/contracts/${contract.id}`);
      setSelectedContract(res.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar detalhes');
    }
  };

  const resetForm = () => {
    setFormData({
      contract_template_id: '',
      contractable_type: '',
      contractable_id: '',
      value: '',
      start_date: '',
      end_date: '',
      payment_terms: '',
      renewal_type: 'manual',
    });
  };

  const getClientName = (contract: Contract) => {
    if (!contract.contractable) return 'N/A';
    return contract.contractable.name || contract.contractable.corporate_name || 'N/A';
  };

  const getClientIcon = (contract: Contract) => {
    const type = contract.contractable_type?.toLowerCase() || '';
    if (type.includes('individual')) return <Users className="w-4 h-4" />;
    if (type.includes('company')) return <Building className="w-4 h-4" />;
    if (type.includes('supplier')) return <Truck className="w-4 h-4" />;
    return <Building className="w-4 h-4" />;
  };

  const getCurrentStepIndex = (status: string) => {
    return TIMELINE_STEPS.findIndex(s => s.key === status);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Gestão de Contratos
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Gerencie templates, aprovações e ciclo de vida dos contratos
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { fetchEntities(); setShowTemplateModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <FileText className="w-4 h-4" />
              Templates
            </button>
            <button
              onClick={() => { fetchEntities(); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Novo Contrato
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar contratos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            >
              <option value="">Todos os Status</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            >
              <option value="">Todos os Tipos</option>
              {Object.entries(TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Nº Contrato</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Template</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Valor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Vencimento</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Carregando...</td></tr>
                ) : contracts.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Nenhum contrato encontrado</td></tr>
                ) : (
                  contracts.map((contract) => (
                    <tr key={contract.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-medium text-slate-800 dark:text-slate-100">
                          {contract.contract_number}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getClientIcon(contract)}
                          <span className="text-slate-700 dark:text-slate-200">{getClientName(contract)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {contract.template?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200 font-medium">
                        R$ {Number(contract.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {contract.end_date ? new Date(contract.end_date).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[contract.status]?.bg || 'bg-slate-100'} ${STATUS_CONFIG[contract.status]?.color || 'text-slate-600'}`}>
                          {STATUS_CONFIG[contract.status]?.label || contract.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openDetail(contract)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                          {contract.status === 'draft' && (
                            <>
                              <button onClick={() => handleStatusChange(contract.id, 'under_review')} className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded">
                                <Send className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(contract.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Novo Contrato</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Template *</label>
                <select
                  required
                  value={formData.contract_template_id}
                  onChange={(e) => setFormData({ ...formData, contract_template_id: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                >
                  <option value="">Selecione...</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({TYPE_LABELS[t.type] || t.type})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Cliente *</label>
                  <select
                    required
                    value={formData.contractable_type}
                    onChange={(e) => setFormData({ ...formData, contractable_type: e.target.value, contractable_id: '' })}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="">Selecione...</option>
                    <option value="individual_client">Pessoa Física</option>
                    <option value="company_client">Pessoa Jurídica</option>
                    <option value="supplier">Fornecedor</option>
                    <option value="organization">Organização</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cliente *</label>
                  <select
                    required
                    value={formData.contractable_id}
                    onChange={(e) => setFormData({ ...formData, contractable_id: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="">Selecione...</option>
                    {formData.contractable_type === 'individual_client' && individualClients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} - {c.cpf}</option>
                    ))}
                    {formData.contractable_type === 'company_client' && companyClients.map((c) => (
                      <option key={c.id} value={c.id}>{c.corporate_name} - {c.cnpj}</option>
                    ))}
                    {formData.contractable_type === 'supplier' && suppliers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    {formData.contractable_type === 'organization' && organizations.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valor *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Renovação</label>
                  <select
                    value={formData.renewal_type}
                    onChange={(e) => setFormData({ ...formData, renewal_type: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="manual">Manual</option>
                    <option value="automatic">Automática</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data Início *</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data Término *</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Condições de Pagamento</label>
                <textarea
                  rows={3}
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  placeholder="Ex: 12x de R$ 1.000,00&#10;ou 10/10/2024: R$ 5.000,00&#10;20/11/2024: R$ 5.000,00"
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Salvando...' : 'Criar Contrato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  Contrato {selectedContract.contract_number}
                </h2>
                <p className="text-sm text-slate-500">{getClientName(selectedContract)}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[selectedContract.status]?.bg} ${STATUS_CONFIG[selectedContract.status]?.color}`}>
                  {STATUS_CONFIG[selectedContract.status]?.label || selectedContract.status}
                </span>
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  R$ {Number(selectedContract.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between">
                  {TIMELINE_STEPS.map((step, index) => {
                    const currentIndex = getCurrentStepIndex(selectedContract.status);
                    const isActive = index <= currentIndex;
                    const isCurrent = step.key === selectedContract.status;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex flex-col items-center flex-1 relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'} ${isCurrent ? 'ring-4 ring-blue-600/20' : ''}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-xs mt-2 text-center ${isActive ? 'text-slate-800 dark:text-slate-100 font-medium' : 'text-slate-400'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 -z-0 transform -translate-y-1/2" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Dados do Contrato</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Template:</span><span className="text-slate-700 dark:text-slate-200">{selectedContract.template?.name || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Início:</span><span className="text-slate-700 dark:text-slate-200">{selectedContract.start_date ? new Date(selectedContract.start_date).toLocaleDateString('pt-BR') : '—'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Término:</span><span className="text-slate-700 dark:text-slate-200">{selectedContract.end_date ? new Date(selectedContract.end_date).toLocaleDateString('pt-BR') : '—'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Renovação:</span><span className="text-slate-700 dark:text-slate-200">{selectedContract.renewal_type === 'automatic' ? 'Automática' : 'Manual'}</span></div>
                    {selectedContract.approved_at && (
                      <div className="flex justify-between"><span className="text-slate-500">Aprovado em:</span><span className="text-slate-700 dark:text-slate-200">{new Date(selectedContract.approved_at).toLocaleDateString('pt-BR')}</span></div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Aprovações</h3>
                  {selectedContract.approvals && selectedContract.approvals.length > 0 ? (
                    <div className="space-y-2">
                      {selectedContract.approvals.map((approval) => (
                        <div key={approval.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-700 dark:text-slate-200">{approval.role}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs ${approval.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : approval.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {approval.status === 'approved' ? 'Aprovado' : approval.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">Nenhuma aprovação requerida</p>
                  )}
                </div>
              </div>

              {selectedContract.addendums && selectedContract.addendums.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Aditivos</h3>
                  <div className="space-y-2">
                    {selectedContract.addendums.map((add) => (
                      <div key={add.id} className="flex items-center justify-between text-sm border-b border-slate-200 dark:border-slate-600 pb-2">
                        <span className="text-slate-700 dark:text-slate-200">{add.title}</span>
                        <span className="text-slate-500">
                          {add.old_value && add.new_value && (
                            <>R$ {Number(add.old_value).toLocaleString('pt-BR')} → R$ {Number(add.new_value).toLocaleString('pt-BR')}</>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedContract.generated_content && (
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Conteúdo do Contrato</h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                    {selectedContract.generated_content}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                {selectedContract.status === 'draft' && (
                  <button onClick={() => handleStatusChange(selectedContract.id, 'under_review')} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                    <Send className="w-4 h-4" /> Enviar para Revisão
                  </button>
                )}
                {selectedContract.status === 'under_review' && (
                  <button onClick={() => handleStatusChange(selectedContract.id, 'approved')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                    <CheckCircle className="w-4 h-4" /> Aprovar
                  </button>
                )}
                {selectedContract.status === 'approved' && (
                  <button onClick={() => handleStatusChange(selectedContract.id, 'sent_for_signature')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Send className="w-4 h-4" /> Enviar para Assinatura
                  </button>
                )}
                {selectedContract.status === 'sent_for_signature' && (
                  <button onClick={() => handleStatusChange(selectedContract.id, 'active')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                    <CheckCircle className="w-4 h-4" /> Ativar Contrato
                  </button>
                )}
                {selectedContract.status === 'active' && (
                  <button onClick={() => handleStatusChange(selectedContract.id, 'finished')} className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
                    <FileText className="w-4 h-4" /> Finalizar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Novo Template</h2>
              <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleTemplateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome *</label>
                  <input
                    type="text"
                    required
                    value={templateFormData.name}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, name: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo *</label>
                  <select
                    required
                    value={templateFormData.type}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, type: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    {Object.entries(TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Conteúdo (HTML/Template) *</label>
                <textarea
                  rows={10}
                  required
                  value={templateFormData.content}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, content: e.target.value })}
                  placeholder="Use placeholders como {{client_name}}, {{client_document}}, {{contract_date}}, etc."
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-mono text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={templateFormData.active}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, active: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <label htmlFor="active" className="text-sm text-slate-700 dark:text-slate-300">Template ativo</label>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Placeholders disponíveis:</h4>
                <div className="text-xs text-blue-700 dark:text-blue-300 grid grid-cols-2 gap-1">
                  <span>{`{{client_name}}`} - Nome do cliente</span>
                  <span>{`{{client_document}}`} - CPF/CNPJ</span>
                  <span>{`{{client_email}}`} - E-mail</span>
                  <span>{`{{client_phone}}`} - Telefone</span>
                  <span>{`{{client_address}}`} - Endereço</span>
                  <span>{`{{contract_date}}`} - Data atual</span>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowTemplateModal(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Salvando...' : 'Criar Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
