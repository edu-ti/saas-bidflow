import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Upload, Save, X, Search, Loader2, Lock, User, Building2, Mail, Phone, MapPin, Hash, ShieldCheck } from 'lucide-react';
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
        setClientsPF(res.data.data || []);
      } else {
        const res = await api.get('/api/company-clients');
        setClientsPJ(res.data.data || []);
      }
    } catch (error) {
      toast.error('Erro ao carregar dados estratégicos');
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
      toast.error('CNPJ inválido');
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
        address: data.endereco || prev.address,
      }));
      toast.success('Dados validados via RPA');
    } catch (error) {
      toast.error('Erro na consulta RPA');
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
    setEditingId(null);
    setIsEditing(false);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-8 text-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Base de <span className="text-gradient-gold">Clientes</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <Lock size={12} className="text-primary" />
            Gestão de portfólio e conformidade jurídica (PF/PJ).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-3 px-6 py-3 bg-surface-elevated/50 text-white font-bold rounded-xl border border-white/10 hover:bg-surface-elevated transition-all text-xs uppercase tracking-widest cursor-pointer">
            <Upload className="w-4 h-4 text-primary" />
            Bulk Import
            <input type="file" accept=".csv,.xlsx" onChange={handleImport} className="hidden" />
          </label>
          <button
            onClick={openModal}
            aria-label="Adicionar novo cliente"
            className="flex items-center gap-3 px-6 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow uppercase text-xs tracking-widest"
          >
            <Plus className="w-4 h-4" />
            Novo Registro
          </button>
        </div>
      </header>

      <div className="platinum-card overflow-hidden">
        <div className="flex border-b border-white/5 bg-white/[0.02]">
          <button
            onClick={() => setActiveTab('pf')}
            className={`flex items-center gap-2 px-8 py-5 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
              activeTab === 'pf' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-text-muted hover:text-white'
            }`}
          >
            <User size={14} /> Pessoas Físicas
          </button>
          <button
            onClick={() => setActiveTab('pj')}
            className={`flex items-center gap-2 px-8 py-5 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
              activeTab === 'pj' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-text-muted hover:text-white'
            }`}
          >
            <Building2 size={14} /> Entidades Jurídicas
          </button>
        </div>

        <div className="p-4 bg-white/[0.01] border-b border-white/5">
          <div className="flex gap-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
            <input
              type="text"
              placeholder={`Pesquisar na base ${activeTab === 'pf' ? 'PF' : 'PJ'}...`}
              className="w-full pl-11 pr-4 py-3 bg-background/50 border border-white/5 rounded-xl text-sm focus:border-primary/30 outline-none transition-all text-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Identificação</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">{activeTab === 'pf' ? 'Documentação' : 'CNPJ / Reg.'}</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Contato</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Localidade</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activeTab === 'pf' ? (
                  clientsPF.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-20 text-center text-text-muted uppercase text-xs font-bold">Nenhum registro PF localizado</td></tr>
                  ) : clientsPF.map(client => (
                    <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-6 font-bold text-white group-hover:text-primary transition-colors">{client.name}</td>
                      <td className="px-6 py-6 font-mono text-[10px] text-text-secondary">
                        <div>CPF: {client.cpf || '-'}</div>
                        <div className="opacity-50">RG: {client.rg || '-'}</div>
                      </td>
                      <td className="px-6 py-6 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-text-secondary"><Mail size={12} className="text-primary/60" /> {client.email || '-'}</div>
                        <div className="flex items-center gap-2 text-xs text-text-secondary"><Phone size={12} className="text-primary/60" /> {client.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-6 text-xs text-text-muted max-w-xs truncate italic">{client.address || '-'}</td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEditPF(client)} className="p-2 text-text-muted hover:text-primary transition-all"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(client.id)} className="p-2 text-text-muted hover:text-red-400 transition-all"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  clientsPJ.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-20 text-center text-text-muted uppercase text-xs font-bold">Nenhum registro PJ localizado</td></tr>
                  ) : clientsPJ.map(client => (
                    <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-6">
                        <div className="font-bold text-white group-hover:text-primary transition-colors">{client.corporate_name}</div>
                        <div className="text-[10px] text-text-muted uppercase tracking-widest">{client.fantasy_name || '-'}</div>
                      </td>
                      <td className="px-6 py-6 font-mono text-[10px] text-text-secondary">
                        <div className="text-primary font-bold">{client.cnpj || '-'}</div>
                        <div className="opacity-50">IM/IE: {client.municipal_registration || '-'}</div>
                      </td>
                      <td className="px-6 py-6 space-y-1">
                        <div className="font-bold text-xs text-white">{client.contact_name || '-'}</div>
                        <div className="flex items-center gap-2 text-[10px] text-text-muted uppercase"><Mail size={10} /> {client.contact_email || '-'}</div>
                      </td>
                      <td className="px-6 py-6 text-xs text-text-muted max-w-xs truncate italic">{client.address || '-'}</td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEditPJ(client)} className="p-2 text-text-muted hover:text-primary transition-all"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(client.id)} className="p-2 text-text-muted hover:text-red-400 transition-all"><Trash2 size={14} /></button>
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
        title={isEditing ? `REFINAR REGISTRO ${activeTab.toUpperCase()}` : `NOVA ENTIDADE ${activeTab.toUpperCase()}`}
        size="lg"
      >
        {activeTab === 'pf' ? (
          <form onSubmit={handleSubmitPF} className="space-y-6 p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Nome Completo *</label>
                <input type="text" value={formDataPF.name} onChange={e => setFormDataPF({ ...formDataPF, name: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Cargo / Qualificação</label>
                <input type="text" value={formDataPF.position} onChange={e => setFormDataPF({ ...formDataPF, position: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">CPF</label>
                <input type="text" value={formDataPF.cpf} onChange={e => setFormDataPF({ ...formDataPF, cpf: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">RG</label>
                <input type="text" value={formDataPF.rg} onChange={e => setFormDataPF({ ...formDataPF, rg: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white font-mono" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Email Principal</label>
                <input type="email" value={formDataPF.email} onChange={e => setFormDataPF({ ...formDataPF, email: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Telefone / WhatsApp</label>
                <input type="text" value={formDataPF.phone} onChange={e => setFormDataPF({ ...formDataPF, phone: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white font-mono" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Endereço Estratégico</label>
              <div className="flex gap-2">
                <input type="text" value={formDataPF.address} onChange={e => setFormDataPF({ ...formDataPF, address: e.target.value })} className="flex-1 px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white" />
                <button type="button" onClick={() => searchCEP(false)} disabled={searchingCEP} className="px-5 bg-surface-elevated text-primary rounded-xl hover:bg-primary/10 transition-all border border-primary/20">
                  {searchingCEP ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search size={16} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 text-text-muted font-bold hover:text-white transition-all text-xs uppercase tracking-widest">Descartar</button>
              <button type="submit" className="px-10 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow text-xs uppercase tracking-widest">{isEditing ? 'Atualizar Perfil' : 'Salvar Registro'}</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitPJ} className="space-y-6 p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">CNPJ / RPA Validator</label>
                <div className="flex gap-2">
                  <input type="text" value={formDataPJ.cnpj} onChange={e => setFormDataPJ({ ...formDataPJ, cnpj: e.target.value })} className="flex-1 px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white font-mono" placeholder="00.000.000/0001-00" />
                  <button type="button" onClick={searchCNPJ} disabled={searchingCNPJ} className="px-5 bg-primary text-background rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow">
                    {searchingCNPJ ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Inscrição Municipal</label>
                <input type="text" value={formDataPJ.municipal_registration} onChange={e => setFormDataPJ({ ...formDataPJ, municipal_registration: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white font-mono" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Razão Social *</label>
                <input type="text" value={formDataPJ.corporate_name} onChange={e => setFormDataPJ({ ...formDataPJ, corporate_name: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Nome Fantasia</label>
                <input type="text" value={formDataPJ.fantasy_name} onChange={e => setFormDataPJ({ ...formDataPJ, fantasy_name: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Endereço Matriz</label>
              <div className="flex gap-2">
                <input type="text" value={formDataPJ.address} onChange={e => setFormDataPJ({ ...formDataPJ, address: e.target.value })} className="flex-1 px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white" />
                <button type="button" onClick={() => searchCEP(true)} disabled={searchingCEP} className="px-5 bg-surface-elevated text-primary rounded-xl hover:bg-primary/10 transition-all border border-primary/20">
                  {searchingCEP ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search size={16} />}
                </button>
              </div>
            </div>
            <div className="border-t border-white/5 pt-6 space-y-6">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2"><User size={12} /> Key Account / Contato Principal</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Nome Completo</label>
                  <input type="text" value={formDataPJ.contact_name} onChange={e => setFormDataPJ({ ...formDataPJ, contact_name: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Cargo / Departamento</label>
                  <input type="text" value={formDataPJ.contact_position} onChange={e => setFormDataPJ({ ...formDataPJ, contact_position: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Email de Contato</label>
                  <input type="email" value={formDataPJ.contact_email} onChange={e => setFormDataPJ({ ...formDataPJ, contact_email: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Telefone Direto</label>
                  <input type="text" value={formDataPJ.contact_phone} onChange={e => setFormDataPJ({ ...formDataPJ, contact_phone: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white font-mono" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 text-text-muted font-bold hover:text-white transition-all text-xs uppercase tracking-widest">Descartar</button>
              <button type="submit" className="px-10 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow text-xs uppercase tracking-widest">{isEditing ? 'Atualizar Empresa' : 'Salvar Empresa'}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}