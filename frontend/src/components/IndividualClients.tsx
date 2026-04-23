import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Upload, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import Modal from './ui/Modal';

interface IndividualClient {
  id: number;
  name: string;
  cpf: string | null;
  rg: string | null;
  email: string | null;
  phone: string | null;
}

export default function IndividualClients() {
  const [clients, setClients] = useState<IndividualClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    rg: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/api/individual-clients');
      setClients(res.data.data);
    } catch (error) {
      toast.error('Erro ao carregar clientes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && editingId) {
        await api.put(`/api/individual-clients/${editingId}`, formData);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await api.post('/api/individual-clients', formData);
        toast.success('Cliente criado com sucesso!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchClients();
    } catch (error) {
      toast.error(isEditing ? 'Erro ao atualizar cliente' : 'Erro ao criar cliente');
      console.error(error);
    }
  };

  const handleEdit = (client: IndividualClient) => {
    setFormData({
      name: client.name || '',
      cpf: client.cpf || '',
      rg: client.rg || '',
      email: client.email || '',
      phone: client.phone || '',
    });
    setEditingId(client.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja eliminar este cliente?')) return;

    try {
      await api.delete(`/api/individual-clients/${id}`);
      toast.success('Cliente eliminado com sucesso!');
      fetchClients();
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

    try {
      toast.loading('A importar clientes...', { duration: 1000 });
      await api.post('/api/individual-clients/import', formDataImport, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Clientes importados com sucesso!');
      fetchClients();
    } catch (error) {
      toast.error('Erro ao importar clientes');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', cpf: '', rg: '', email: '', phone: '' });
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
          <h1 className="text-2xl font-bold text-slate-900">Clientes PF</h1>
          <p className="text-sm text-slate-500">Gestão de pessoas físicas</p>
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
        {loading ? (
          <div className="p-8 text-center text-slate-500">A carregar clientes...</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Nome</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">CPF / RG</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Email</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Telefone</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Nenhum registo encontrado.
                  </td>
                </tr>
              ) : (
                clients.map(client => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{client.name}</td>
                    <td className="px-6 py-4">
                      {client.cpf && <div>{client.cpf}</div>}
                      {client.rg && <div className="text-xs text-slate-500">RG: {client.rg}</div>}
                    </td>
                    <td className="px-6 py-4">{client.email || '-'}</td>
                    <td className="px-6 py-4">{client.phone || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(client)}
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
        title={isEditing ? 'Editar Cliente' : 'Novo Cliente'}
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
                CPF
              </label>
              <input
                type="text"
                value={formData.cpf}
                onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="000.000.000-00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                RG
              </label>
              <input
                type="text"
                value={formData.rg}
                onChange={e => setFormData({ ...formData, rg: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Número do RG"
              />
            </div>
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
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors text-sm"
            >
              <X className="w-4 h-4 inline mr-2" />
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
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