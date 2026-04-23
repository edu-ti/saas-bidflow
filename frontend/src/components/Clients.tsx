import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Upload, Save, X, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import Modal from './ui/Modal';

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
  const [activeTab, setActiveTab] = useState<'pf' | 'pj'>('pf');
  const [clientsPF, setClientsPF] = useState<ClientPF[]>([]);
  const [clientsPJ, setClientsPJ] = useState<ClientPJ[]>([]);
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

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pf') {
        const res = await api.get('/api/individual-clients');
        setClientsPF(res.data.data);
      } else {
        const res = await api.get('/api/company-clients');
        setClientsPJ(res.data.data);
      }
    } catch (error) {
      toast.error('Erro ao carregar dados');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPF = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingId) {
        await api.put(`/api/individual-clients/${editingId}`, formDataPF);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await api.post('/api/individual-clients', formDataPF);
        toast.success('Cliente criado com sucesso!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(isEditing ? 'Erro ao atualizar cliente' : 'Erro ao criar cliente');
      console.error(error);
    }
  };

  const handleSubmitPJ = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingId) {
        await api.put(`/api/company-clients/${editingId}`, formDataPJ);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await api.post('/api/company-clients', formDataPJ);
        toast.success('Cliente criado com sucesso!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(isEditing ? 'Erro ao atualizar cliente' : 'Erro ao criar cliente');
      console.error(error);
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

  const handleDelete = async (id: number) => {
    const endpoint = activeTab === 'pf' ? 'individual-clients' : 'company-clients';
    if (!confirm(`Tem certeza que deseja eliminar este cliente?`)) return;

    try {
      await api.delete(`/${endpoint}/${id}`);
      toast.success('Cliente eliminado com sucesso!');
      fetchData();
    } catch (error) {
      toast.error('Erro ao eliminar cliente');
      console.error(error);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataImport = new FormData();
    formDataImport.append('file', file);
    const endpoint = activeTab === 'pf' ? 'individual-clients/import' : 'company-clients/import';

    try {
      toast.loading('A importar...', { duration: 1000 });
      await api.post(`/${endpoint}`, formDataImport, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Importado com sucesso!');
      fetchData();
    } catch (error) {
      toast.error('Erro ao importar');
      console.error(error);
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

      setFormDataPJ(prev => ({
        ...prev,
        corporate_name: data.razao_social || prev.corporate_name,
        fantasy_name: data.nome_fantasia || prev.fantasy_name,
        cnpj: data.cnpj || prev.cnpj,
        address: data.endereco || prev.address,
      }));
      toast.success('Dados retrievedos com sucesso!');
    } catch (error) {
      toast.error('Erro ao buscar CNPJ. Verifique o CNPJ e tente novamente.');
      console.error(error);
    } finally {
      setSearchingCNPJ(false);
    }
  };

  const searchCEP = async (isPJ: boolean) => {
    const cep = isPJ 
      ? formDataPJ.address?.replace(/\D/g, '').slice(0, 8)
      : formDataPF.address?.replace(/\D/g, '').slice(0, 8);
    
    if (!cep || cep.length !== 8) {
      toast.error('CEP inválido. Digite 8 dígitos.');
      return;
    }

    setSearchingCEP(true);
    try {
      const res = await api.get(`/api/cep/${cep}`);
      const data = res.data;

      if (isPJ) {
        setFormDataPJ(prev => ({
          ...prev,
          address: `${data.logradouro || ''}, ${data.bairro || ''}, ${data.cidade || ''}-${data.estado}, CEP ${data.cep || cep}`,
        }));
      } else {
        setFormDataPF(prev => ({
          ...prev,
          address: `${data.logradouro || ''}, ${data.bairro || ''}, ${data.cidade || ''}-${data.estado}, CEP ${data.cep || cep}`,
        }));
      }
      toast.success('Endereço encontrado!');
    } catch (error) {
      toast.error('Erro ao buscar CEP.');
      console.error(error);
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
    setEditingId(null);
    setIsEditing(false);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500">Gestão de clientes PF e PJ</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors text-sm cursor-pointer">
            <Upload className="w-4 h-4" />
            Importar
            <input type="file" accept=".csv,.xlsx" onChange={handleImport} className="hidden" />
          </label>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Novo Cliente
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('pf')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'pf'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Clientes PF
            </button>
            <button
              onClick={() => setActiveTab('pj')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'pj'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Clientes PJ
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">A carregar...</div>
        ) : activeTab === 'pf' ? (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Nome</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">CPF / RG</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Email</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Cargo/Setor</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Telefone</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Endereço</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {clientsPF.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Nenhum registo encontrado.
                  </td>
                </tr>
              ) : (
                clientsPF.map(client => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{client.name}</td>
                    <td className="px-6 py-4">
                      {client.cpf && <div>{client.cpf}</div>}
                      {client.rg && <div className="text-xs text-slate-500">RG: {client.rg}</div>}
                    </td>
                    <td className="px-6 py-4">{client.email || '-'}</td>
                    <td className="px-6 py-4">{client.position || '-'}</td>
                    <td className="px-6 py-4">{client.phone || '-'}</td>
                    <td className="px-6 py-4 max-w-xs truncate">{client.address || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditPF(client)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Razão Social</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Nome Fantasia</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">CNPJ</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Contato</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Email</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Telefone</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Endereço</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {clientsPJ.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    Nenhum registo encontrado.
                  </td>
                </tr>
              ) : (
                clientsPJ.map(client => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{client.corporate_name}</td>
                    <td className="px-6 py-4">{client.fantasy_name || '-'}</td>
                    <td className="px-6 py-4 font-mono text-xs">{client.cnpj || '-'}</td>
                    <td className="px-6 py-4">
                      <div>{client.contact_name || '-'}</div>
                      {client.contact_position && <div className="text-xs text-slate-500">{client.contact_position}</div>}
                    </td>
                    <td className="px-6 py-4">{client.contact_email || '-'}</td>
                    <td className="px-6 py-4">{client.contact_phone || '-'}</td>
                    <td className="px-6 py-4 max-w-xs truncate">{client.address || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditPJ(client)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? `Editar Cliente ${activeTab.toUpperCase()}` : `Novo Cliente ${activeTab.toUpperCase()}`}
        size="lg"
      >
        {activeTab === 'pf' ? (
          <form onSubmit={handleSubmitPF} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome *</label>
                <input
                  type="text"
                  value={formDataPF.name}
                  onChange={e => setFormDataPF({ ...formDataPF, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Cargo / Setor</label>
                <input
                  type="text"
                  value={formDataPF.position}
                  onChange={e => setFormDataPF({ ...formDataPF, position: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Cargo ou setor"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">CPF</label>
                <input
                  type="text"
                  value={formDataPF.cpf}
                  onChange={e => setFormDataPF({ ...formDataPF, cpf: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">RG</label>
                <input
                  type="text"
                  value={formDataPF.rg}
                  onChange={e => setFormDataPF({ ...formDataPF, rg: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Número do RG"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={formDataPF.email}
                  onChange={e => setFormDataPF({ ...formDataPF, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefone</label>
                <input
                  type="text"
                  value={formDataPF.phone}
                  onChange={e => setFormDataPF({ ...formDataPF, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Endereço</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formDataPF.address}
                  onChange={e => setFormDataPF({ ...formDataPF, address: e.target.value })}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Endereço completo"
                />
                <button
                  type="button"
                  onClick={() => searchCEP(false)}
                  disabled={searchingCEP}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {searchingCEP ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">
                <X className="w-4 h-4 inline mr-2" />Cancelar
              </button>
              <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm">
                <Save className="w-4 h-4 inline mr-2" />{isEditing ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitPJ} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">CNPJ</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formDataPJ.cnpj}
                    onChange={e => setFormDataPJ({ ...formDataPJ, cnpj: e.target.value })}
                    className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="00.000.000/0001-00"
                  />
                  <button
                    type="button"
                    onClick={searchCNPJ}
                    disabled={searchingCNPJ}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {searchingCNPJ ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Inscrição Municipal</label>
                <input
                  type="text"
                  value={formDataPJ.municipal_registration}
                  onChange={e => setFormDataPJ({ ...formDataPJ, municipal_registration: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Inscrição municipal"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Razão Social *</label>
                <input
                  type="text"
                  value={formDataPJ.corporate_name}
                  onChange={e => setFormDataPJ({ ...formDataPJ, corporate_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Razão social completa"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome Fantasia</label>
                <input
                  type="text"
                  value={formDataPJ.fantasy_name}
                  onChange={e => setFormDataPJ({ ...formDataPJ, fantasy_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome fantasia"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Inscrição Estadual</label>
              <input
                type="text"
                value={formDataPJ.state_registration}
                onChange={e => setFormDataPJ({ ...formDataPJ, state_registration: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Inscrição estadual"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Endereço</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formDataPJ.address}
                  onChange={e => setFormDataPJ({ ...formDataPJ, address: e.target.value })}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Endereço completo"
                />
                <button
                  type="button"
                  onClick={() => searchCEP(true)}
                  disabled={searchingCEP}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {searchingCEP ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <p className="text-sm font-medium text-slate-700 mb-3">Dados do Contato</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome do Contato</label>
                  <input
                    type="text"
                    value={formDataPJ.contact_name}
                    onChange={e => setFormDataPJ({ ...formDataPJ, contact_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome do contato"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Cargo / Setor</label>
                  <input
                    type="text"
                    value={formDataPJ.contact_position}
                    onChange={e => setFormDataPJ({ ...formDataPJ, contact_position: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Cargo ou setor"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={formDataPJ.contact_email}
                    onChange={e => setFormDataPJ({ ...formDataPJ, contact_email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefone</label>
                  <input
                    type="text"
                    value={formDataPJ.contact_phone}
                    onChange={e => setFormDataPJ({ ...formDataPJ, contact_phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">
                <X className="w-4 h-4 inline mr-2" />Cancelar
              </button>
              <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm">
                <Save className="w-4 h-4 inline mr-2" />{isEditing ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}