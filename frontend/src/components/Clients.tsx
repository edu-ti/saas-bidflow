import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Upload, Save, X, Search, Loader2, Lock, User, Building2, Mail, Phone, MapPin, Hash, ShieldCheck, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import Modal from './ui/Modal';
import { usePermissions } from '../hooks/usePermissions';

interface ClientPF {
  id: number;
  name: string;
  cpf: string | null;
  rg: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  position: string | null;
}

interface ClientPJ {
  id: number;
  corporate_name: string;
  fantasy_name: string | null;
  cnpj: string | null;
  municipal_registration: string | null;
  state_registration: string | null;
  address: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_position: string | null;
  contact_phone: string | null;
}

export default function Clients() {
  const [activeTab, setActiveTab] = useState<'pf' | 'pj' | 'fornecedor'>('pf');
  const [clientsPF, setClientsPF] = useState<ClientPF[]>([]);
  const [clientsPJ, setClientsPJ] = useState<ClientPJ[]>([]);
  const [suppliers, setSuppliers] = useState<ClientPJ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchingCNPJ, setSearchingCNPJ] = useState(false);
  const [searchingCEP, setSearchingCEP] = useState(false);

  const [formDataPF, setFormDataPF] = useState({
    name: '',
    cpf: '',
    rg: '',
    email: '',
    phone: '',
    address: '',
    position: '',
  });

  const [formDataPJ, setFormDataPJ] = useState({
    corporate_name: '',
    fantasy_name: '',
    cnpj: '',
    municipal_registration: '',
    state_registration: '',
    address: '',
    contact_name: '',
    contact_email: '',
    contact_position: '',
    contact_phone: '',
  });

  const [formDataFornecedor, setFormDataFornecedor] = useState({
    corporate_name: '',
    fantasy_name: '',
    cnpj: '',
    municipal_registration: '',
    state_registration: '',
    address: '',
    contact_name: '',
    contact_email: '',
    contact_position: '',
    contact_phone: '',
  });

  const [searchingSupplierCNPJ, setSearchingSupplierCNPJ] = useState(false);

  const { hasPermission } = usePermissions();
  const pageKey = activeTab === 'pf' ? 'contacts-pf' : activeTab === 'pj' ? 'contacts-pj' : 'contacts-suppliers';
  const canCreate = hasPermission('commercial', pageKey, 'create');
  const canEdit = hasPermission('commercial', pageKey, 'edit');
  const canDelete = hasPermission('commercial', pageKey, 'delete');

  const searchSupplierCNPJ = async () => {
    const cnpj = formDataFornecedor.cnpj.replace(/\D/g, '');
    if (!cnpj || cnpj.length !== 14) {
      toast.error('CNPJ inválido');
      return;
    }

    setSearchingSupplierCNPJ(true);
    try {
      const res = await api.get(`/api/cnpj/${cnpj}`);
      const data = res.data;
      if (data.error) {
        toast.error(data.error);
        return;
      }
      setFormDataFornecedor(prev => ({
        ...prev,
        corporate_name: data.razao_social || prev.corporate_name,
        fantasy_name: data.nome_fantasia || prev.fantasy_name,
        address: data.endereco || prev.address,
      }));
      toast.success('Dados preenchidos automaticamente');
    } catch (error) {
      toast.error('Erro ao buscar CNPJ');
    } finally {
      setSearchingSupplierCNPJ(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pf') {
        const res = await api.get('/api/individual-clients');
        setClientsPF(res.data.data || []);
      } else if (activeTab === 'pj') {
        const res = await api.get('/api/company-clients');
        setClientsPJ(res.data.data || []);
      } else if (activeTab === 'fornecedor') {
        const res = await api.get('/api/suppliers');
        setSuppliers(res.data.data || []);
      }
    } catch (error) {
      toast.error('Erro ao carregar dados estratégicos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPF = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingId) {
        await api.put(`/api/individual-clients/${editingId}`, formDataPF);
        toast.success('Perfil atualizado!');
      } else {
        await api.post('/api/individual-clients', formDataPF);
        toast.success('Perfil registrado!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Erro na operação');
    }
  };

  const handleSubmitPJ = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingId) {
        await api.put(`/api/company-clients/${editingId}`, formDataPJ);
        toast.success('Empresa atualizada!');
      } else {
        await api.post('/api/company-clients', formDataPJ);
        toast.success('Empresa registrada!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Erro na operação');
    }
  };

  const handleSubmitFornecedor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingId) {
        await api.put(`/api/suppliers/${editingId}`, formDataFornecedor);
        toast.success('Fornecedor atualizado!');
      } else {
        await api.post('/api/suppliers', formDataFornecedor);
        toast.success('Fornecedor registrado!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Erro na operação');
    }
  };

  const handleEditPF = (client: ClientPF) => {
    setFormDataPF({
      name: client.name || '',
      cpf: client.cpf || '',
      rg: client.rg || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      position: client.position || '',
    });
    setEditingId(client.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleEditPJ = (client: ClientPJ) => {
    setFormDataPJ({
      corporate_name: client.corporate_name || '',
      fantasy_name: client.fantasy_name || '',
      cnpj: client.cnpj || '',
      municipal_registration: client.municipal_registration || '',
      state_registration: client.state_registration || '',
      address: client.address || '',
      contact_name: client.contact_name || '',
      contact_email: client.contact_email || '',
      contact_position: client.contact_position || '',
      contact_phone: client.contact_phone || '',
    });
    setEditingId(client.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleEditFornecedor = (client: ClientPJ) => {
    setFormDataFornecedor({
      corporate_name: client.corporate_name || '',
      fantasy_name: client.fantasy_name || '',
      cnpj: client.cnpj || '',
      municipal_registration: client.municipal_registration || '',
      state_registration: client.state_registration || '',
      address: client.address || '',
      contact_name: client.contact_name || '',
      contact_email: client.contact_email || '',
      contact_position: client.contact_position || '',
      contact_phone: client.contact_phone || '',
    });
    setEditingId(client.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const endpoint = activeTab === 'pf' ? 'individual-clients' : activeTab === 'pj' ? 'company-clients' : 'suppliers';
    if (!confirm(`Confirmar exclusão definitiva deste registro?`)) return;

    try {
      await api.delete(`/${endpoint}/${id}`);
      toast.success('Registro removido.');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataImport = new FormData();
    formDataImport.append('file', file);
    const endpoint = activeTab === 'pf' ? 'individual-clients/import' : 'company-clients/import';

    try {
      toast.loading('Processando base de dados...', { duration: 1500 });
      await api.post(`/${endpoint}`, formDataImport, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Importação concluída!');
      fetchData();
    } catch (error) {
      toast.error('Falha na importação');
    }
  };

  const searchCNPJ = async () => {
    const cnpj = formDataPJ.cnpj.replace(/\D/g, '');
    if (!cnpj || cnpj.length !== 14) {
      toast.error('CNPJ inválido. Digite 14 dígitos.');
      return;
    }

    setSearchingCNPJ(true);
    try {
      const res = await api.get(`/api/cnpj/${cnpj}`);
      const data = res.data;
      
      if (data.error) {
        toast.error(data.error);
        return;
      }
      
      setFormDataPJ(prev => ({
        ...prev,
        corporate_name: data.razao_social || prev.corporate_name,
        fantasy_name: data.nome_fantasia || prev.fantasy_name,
        address: data.endereco || prev.address,
      }));
      toast.success('Dados preenchidos automaticamente');
    } catch (error: any) {
      console.error('Erro ao buscar CNPJ:', error);
      toast.error(error.response?.data?.error || 'Erro ao buscar CNPJ. Tente novamente.');
    } finally {
      setSearchingCNPJ(false);
    }
  };

  const searchCEP = async (isPJ: boolean) => {
    const cep = isPJ 
      ? formDataPJ.address?.replace(/\D/g, '').slice(0, 8)
      : formDataPF.address?.replace(/\D/g, '').slice(0, 8);
    
    if (!cep || cep.length !== 8) {
      toast.error('CEP inválido');
      return;
    }

    setSearchingCEP(true);
    try {
      const res = await api.get(`/api/cep/${cep}`);
      const data = res.data;
      const fullAddress = `${data.logradouro || ''}, ${data.bairro || ''}, ${data.cidade || ''}-${data.estado}, CEP ${data.cep || cep}`;
      
      if (isPJ) setFormDataPJ(prev => ({ ...prev, address: fullAddress }));
      else setFormDataPF(prev => ({ ...prev, address: fullAddress }));
      
      toast.success('Endereço localizado');
    } catch (error) {
      toast.error('Erro na consulta de CEP');
    } finally {
      setSearchingCEP(false);
    }
  };

  const resetForm = () => {
    setFormDataPF({ name: '', cpf: '', rg: '', email: '', phone: '', address: '', position: '' });
    setFormDataPJ({
      corporate_name: '', fantasy_name: '', cnpj: '', municipal_registration: '',
      state_registration: '', address: '', contact_name: '', contact_email: '',
      contact_position: '', contact_phone: '',
    });
    setFormDataFornecedor({
      corporate_name: '', fantasy_name: '', cnpj: '', municipal_registration: '',
      state_registration: '', address: '', contact_name: '', contact_email: '',
      contact_position: '', contact_phone: '',
    });
    setEditingId(null);
    setIsEditing(false);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Base de Clientes
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Gestão de portfólio e conformidade jurídica (PF/PJ).
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canCreate && (
            <label className="btn btn-outline flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Importar</span>
              <input type="file" accept=".csv,.xlsx" onChange={handleImport} className="hidden" />
            </label>
          )}
          {canCreate && (
            <button
              onClick={openModal}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Registro</span>
            </button>
          )}
        </div>
      </header>

      <div className="card overflow-hidden">
        <div className="flex border-b border-border bg-bg-tertiary">
          <button
            onClick={() => setActiveTab('pf')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'pf' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
            }`}
          >
            <User size={16} /> Pessoas Físicas
          </button>
          <button
            onClick={() => setActiveTab('pj')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'pj' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
            }`}
          >
            <Building2 size={16} /> Entidades Jurídicas
          </button>
          <button
            onClick={() => setActiveTab('fornecedor')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'fornecedor' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
            }`}
          >
            <Building2 size={16} /> Fornecedores
          </button>
        </div>

        <div className="p-4 border-b border-border bg-bg-secondary">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
            <input
              type="text"
              placeholder={`Pesquisar na base ${activeTab === 'pf' ? 'PF' : activeTab === 'pj' ? 'PJ' : 'Fornecedores'}...`}
              className="input w-full pl-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-bg-tertiary rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-bg-tertiary border-b border-border text-text-secondary">
                <tr>
                  <th className="px-6 py-3 font-medium">Identificação</th>
                  <th className="px-6 py-3 font-medium">{activeTab === 'pf' ? 'Documentação' : 'CNPJ / Reg.'}</th>
                  <th className="px-6 py-3 font-medium">Contato Principal</th>
                  <th className="px-6 py-3 font-medium">Localidade Matriz</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeTab === 'pf' ? (
                  clientsPF.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-20 text-center text-text-muted font-medium">Nenhum registro PF localizado</td></tr>
                  ) :                   clientsPF.map(client => (
                    <tr key={client.id} className="hover:bg-bg-tertiary transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-text-primary group-hover:text-primary transition-colors">{client.name}</div>
                        <div className="text-xs text-text-muted mt-0.5">{client.position || 'Cliente PF'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-text-secondary flex items-center gap-1.5"><Hash size={14} className="text-text-muted" /> {client.cpf || '-'}</div>
                        <div className="text-xs text-text-muted mt-1">RG: {client.rg || '-'}</div>
                      </td>
                      <td className="px-6 py-4 space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-text-primary"><Mail size={14} className="text-text-muted" /> {client.email || '-'}</div>
                        <div className="flex items-center gap-2 text-sm text-text-secondary"><Phone size={14} className="text-text-muted" /> {client.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2 max-w-xs">
                          <MapPin size={14} className="text-text-muted mt-0.5 shrink-0" />
                          <span className="text-sm text-text-secondary truncate">{client.address || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canEdit && <button onClick={() => handleEditPF(client)} className="p-2 text-text-muted hover:text-primary transition-colors rounded-lg"><Pencil size={16} /></button>}
                          {canDelete && <button onClick={() => handleDelete(client.id)} className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 transition-colors rounded-lg"><Trash2 size={16} /></button>}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : activeTab === 'pj' ? (
                  clientsPJ.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-20 text-center text-text-muted font-medium">Nenhum registro PJ localizado</td></tr>
                  ) :                   clientsPJ.map(client => (
                    <tr key={client.id} className="hover:bg-bg-tertiary transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-text-primary group-hover:text-primary transition-colors">{client.name}</div>
                        <div className="text-xs text-text-muted mt-0.5">{client.position || 'Cliente PF'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-text-secondary flex items-center gap-1.5"><Hash size={14} className="text-text-muted" /> {client.cpf || '-'}</div>
                        <div className="text-xs text-text-muted mt-1">RG: {client.rg || '-'}</div>
                      </td>
                      <td className="px-6 py-4 space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-text-primary"><Mail size={14} className="text-text-muted" /> {client.email || '-'}</div>
                        <div className="flex items-center gap-2 text-sm text-text-secondary"><Phone size={14} className="text-text-muted" /> {client.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2 max-w-xs">
                          <MapPin size={14} className="text-text-muted mt-0.5 shrink-0" />
                          <span className="text-sm text-text-secondary truncate">{client.address || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canEdit && <button onClick={() => handleEditPF(client)} className="p-2 text-text-muted hover:text-primary transition-colors rounded-lg"><Pencil size={16} /></button>}
                          {canDelete && <button onClick={() => handleDelete(client.id)} className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 transition-colors rounded-lg"><Trash2 size={16} /></button>}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : activeTab === 'pj' ? (
                  clientsPJ.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-20 text-center text-text-muted font-medium">Nenhum registro PJ localizado</td></tr>
                  ) :                   clientsPJ.map(client => (
                    <tr key={client.id} className="hover:bg-bg-tertiary transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-text-primary group-hover:text-primary transition-colors">{client.corporate_name}</div>
                        <div className="text-xs text-text-muted mt-0.5">{client.fantasy_name || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-text-secondary font-medium flex items-center gap-1.5"><ShieldCheck size={14} className="text-primary" /> {client.cnpj || '-'}</div>
                        <div className="text-xs text-text-muted mt-1">IM/IE: {client.municipal_registration || '-'}</div>
                      </td>
                      <td className="px-6 py-4 space-y-1.5">
                        <div className="font-medium text-sm text-text-primary flex items-center gap-2"><User size={14} className="text-text-muted" /> {client.contact_name || '-'}</div>
                        <div className="flex items-center gap-2 text-xs text-text-secondary"><Mail size={14} className="text-text-muted" /> {client.contact_email || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2 max-w-xs">
                          <MapPin size={14} className="text-text-muted mt-0.5 shrink-0" />
                          <span className="text-sm text-text-secondary truncate">{client.address || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canEdit && <button onClick={() => handleEditPJ(client)} className="p-2 text-text-muted hover:text-primary transition-colors rounded-lg"><Pencil size={16} /></button>}
                          {canDelete && <button onClick={() => handleDelete(client.id)} className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 transition-colors rounded-lg"><Trash2 size={16} /></button>}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  suppliers.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-20 text-center text-text-muted font-medium">Nenhum fornecedor localizado</td></tr>
                  ) :                   suppliers.map(client => (
                    <tr key={client.id} className="hover:bg-bg-tertiary transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-text-primary group-hover:text-primary transition-colors">{client.corporate_name}</div>
                        <div className="text-xs text-text-muted mt-0.5">{client.fantasy_name || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-text-secondary font-medium flex items-center gap-1.5"><ShieldCheck size={14} className="text-primary" /> {client.cnpj || '-'}</div>
                        <div className="text-xs text-text-muted mt-1">IM: {client.municipal_registration || '-'} | IE: {client.state_registration || '-'}</div>
                      </td>
                      <td className="px-6 py-4 space-y-1.5">
                        <div className="font-medium text-sm text-text-primary flex items-center gap-2"><User size={14} className="text-text-muted" /> {client.contact_name || '-'}</div>
                        <div className="flex items-center gap-2 text-xs text-text-secondary"><Mail size={14} className="text-text-muted" /> {client.contact_email || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2 max-w-xs">
                          <MapPin size={14} className="text-text-muted mt-0.5 shrink-0" />
                          <span className="text-sm text-text-secondary truncate">{client.address || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canEdit && <button onClick={() => handleEditFornecedor(client)} className="p-2 text-text-muted hover:text-primary transition-colors rounded-lg"><Pencil size={16} /></button>}
                          {canDelete && <button onClick={() => handleDelete(client.id)} className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 transition-colors rounded-lg"><Trash2 size={16} /></button>}
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
        title={isEditing ? `Refinar Registro ${activeTab.toUpperCase()}` : `Nova Entidade ${activeTab.toUpperCase()}`}
        size="lg"
      >
        {activeTab === 'pf' ? (
          <form onSubmit={handleSubmitPF} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Nome Completo <span className="text-danger">*</span></label>
                <input type="text" value={formDataPF.name} onChange={e => setFormDataPF({ ...formDataPF, name: e.target.value })} className="input w-full" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Cargo / Qualificação</label>
                <input type="text" value={formDataPF.position} onChange={e => setFormDataPF({ ...formDataPF, position: e.target.value })} className="input w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">CPF</label>
                <input type="text" value={formDataPF.cpf} onChange={e => setFormDataPF({ ...formDataPF, cpf: e.target.value })} className="input w-full font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">RG</label>
                <input type="text" value={formDataPF.rg} onChange={e => setFormDataPF({ ...formDataPF, rg: e.target.value })} className="input w-full font-mono" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Email Principal</label>
                <input type="email" value={formDataPF.email} onChange={e => setFormDataPF({ ...formDataPF, email: e.target.value })} className="input w-full" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Telefone / WhatsApp</label>
                <input type="text" value={formDataPF.phone} onChange={e => setFormDataPF({ ...formDataPF, phone: e.target.value })} className="input w-full font-mono" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Endereço Estratégico</label>
              <div className="flex gap-2">
                <input type="text" value={formDataPF.address} onChange={e => setFormDataPF({ ...formDataPF, address: e.target.value })} className="input flex-1" />
                <button type="button" onClick={() => searchCEP(false)} disabled={searchingCEP} className="btn btn-outline px-3 flex items-center justify-center">
                  {searchingCEP ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search size={18} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancelar</button>
              <button type="submit" className="btn btn-primary">{isEditing ? 'Atualizar Perfil' : 'Salvar Registro'}</button>
            </div>
          </form>
        ) : activeTab === 'pj' ? (
          <form onSubmit={handleSubmitPJ} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">CNPJ / RPA Validator</label>
                <div className="flex gap-2">
                  <input type="text" value={formDataPJ.cnpj} onChange={e => setFormDataPJ({ ...formDataPJ, cnpj: e.target.value })} className="input flex-1 font-mono" placeholder="00.000.000/0001-00" />
                  <button type="button" onClick={searchCNPJ} disabled={searchingCNPJ} className="btn btn-primary px-3 flex items-center justify-center">
                    {searchingCNPJ ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Inscrição Municipal</label>
                <input type="text" value={formDataPJ.municipal_registration} onChange={e => setFormDataPJ({ ...formDataPJ, municipal_registration: e.target.value })} className="input w-full font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Inscrição Estadual</label>
                <input type="text" value={formDataPJ.state_registration} onChange={e => setFormDataPJ({ ...formDataPJ, state_registration: e.target.value })} className="input w-full font-mono" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Razão Social <span className="text-danger">*</span></label>
                <input type="text" value={formDataPJ.corporate_name} onChange={e => setFormDataPJ({ ...formDataPJ, corporate_name: e.target.value })} className="input w-full" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Nome Fantasia</label>
                <input type="text" value={formDataPJ.fantasy_name} onChange={e => setFormDataPJ({ ...formDataPJ, fantasy_name: e.target.value })} className="input w-full" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Endereço Matriz</label>
              <div className="flex gap-2">
                <input type="text" value={formDataPJ.address} onChange={e => setFormDataPJ({ ...formDataPJ, address: e.target.value })} className="input flex-1" />
                <button type="button" onClick={() => searchCEP(true)} disabled={searchingCEP} className="btn btn-outline px-3 flex items-center justify-center">
                  {searchingCEP ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search size={18} />}
                </button>
              </div>
            </div>
            
            <div className="bg-bg-tertiary p-5 rounded-xl border border-border space-y-4">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2"><User size={16} className="text-primary" /> Key Account / Contato Principal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-primary">Nome Completo</label>
                  <input type="text" value={formDataPJ.contact_name} onChange={e => setFormDataPJ({ ...formDataPJ, contact_name: e.target.value })} className="input w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-primary">Cargo / Departamento</label>
                  <input type="text" value={formDataPJ.contact_position} onChange={e => setFormDataPJ({ ...formDataPJ, contact_position: e.target.value })} className="input w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-primary">Email de Contato</label>
                  <input type="email" value={formDataPJ.contact_email} onChange={e => setFormDataPJ({ ...formDataPJ, contact_email: e.target.value })} className="input w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-primary">Telefone Direto</label>
                  <input type="text" value={formDataPJ.contact_phone} onChange={e => setFormDataPJ({ ...formDataPJ, contact_phone: e.target.value })} className="input w-full font-mono" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancelar</button>
              <button type="submit" className="btn btn-primary">{isEditing ? 'Atualizar Empresa' : 'Salvar Empresa'}</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitFornecedor} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">CNPJ</label>
                <div className="flex gap-2">
                  <input type="text" value={formDataFornecedor.cnpj} onChange={e => setFormDataFornecedor({ ...formDataFornecedor, cnpj: e.target.value })} className="input flex-1 font-mono" placeholder="00.000.000/0001-00" />
                  <button type="button" onClick={searchSupplierCNPJ} disabled={searchingSupplierCNPJ} className="btn btn-primary px-3 flex items-center justify-center">
                    {searchingSupplierCNPJ ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Inscrição Municipal</label>
                <input type="text" value={formDataFornecedor.municipal_registration} onChange={e => setFormDataFornecedor({ ...formDataFornecedor, municipal_registration: e.target.value })} className="input w-full font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Inscrição Estadual</label>
                <input type="text" value={formDataFornecedor.state_registration} onChange={e => setFormDataFornecedor({ ...formDataFornecedor, state_registration: e.target.value })} className="input w-full font-mono" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Razão Social <span className="text-danger">*</span></label>
                <input type="text" value={formDataFornecedor.corporate_name} onChange={e => setFormDataFornecedor({ ...formDataFornecedor, corporate_name: e.target.value })} className="input w-full" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Nome Fantasia</label>
                <input type="text" value={formDataFornecedor.fantasy_name} onChange={e => setFormDataFornecedor({ ...formDataFornecedor, fantasy_name: e.target.value })} className="input w-full" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Endereço</label>
              <input type="text" value={formDataFornecedor.address} onChange={e => setFormDataFornecedor({ ...formDataFornecedor, address: e.target.value })} className="input w-full" />
            </div>
            
            <div className="bg-bg-tertiary p-5 rounded-xl border border-border space-y-4">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2"><User size={16} className="text-primary" /> Contato Principal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-primary">Nome Completo</label>
                  <input type="text" value={formDataFornecedor.contact_name} onChange={e => setFormDataFornecedor({ ...formDataFornecedor, contact_name: e.target.value })} className="input w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-primary">Cargo / Departamento</label>
                  <input type="text" value={formDataFornecedor.contact_position} onChange={e => setFormDataFornecedor({ ...formDataFornecedor, contact_position: e.target.value })} className="input w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-primary">Email de Contato</label>
                  <input type="email" value={formDataFornecedor.contact_email} onChange={e => setFormDataFornecedor({ ...formDataFornecedor, contact_email: e.target.value })} className="input w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-primary">Telefone Direto</label>
                  <input type="text" value={formDataFornecedor.contact_phone} onChange={e => setFormDataFornecedor({ ...formDataFornecedor, contact_phone: e.target.value })} className="input w-full font-mono" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancelar</button>
              <button type="submit" className="btn btn-primary">{isEditing ? 'Atualizar Fornecedor' : 'Salvar Fornecedor'}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}