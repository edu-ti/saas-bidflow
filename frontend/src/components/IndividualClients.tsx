import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Upload, Save, X, User, ShieldCheck, Mail, Phone, Fingerprint, Activity, Globe, Database, Target, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';

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
  const [searchTerm, setSearchTerm] = useState('');
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
    setLoading(true);
    try {
      const res = await api.get('/api/individual-clients');
      setClients(res.data.data || res.data || []);
    } catch (error) {
      toast.error('Erro na sincronização de clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing && editingId) {
        await api.put(`/api/individual-clients/${editingId}`, formData);
        toast.success('Perfil atualizado com sucesso!');
      } else {
        await api.post('/api/individual-clients', formData);
        toast.success('Novo cliente PF consolidado!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchClients();
    } catch (error) {
      toast.error('Falha na orquestração de dados');
    } finally {
      setLoading(false);
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
    if (!confirm('Autorizar exclusão definitiva deste registro estratégico?')) return;

    try {
      await api.delete(`/api/individual-clients/${id}`);
      toast.success('Registro removido do CRM.');
      fetchClients();
    } catch (error) {
      toast.error('Erro na deleção');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataImport = new FormData();
    formDataImport.append('file', file);

    try {
      toast.loading('Importando base de clientes...', { duration: 1000 });
      await api.post('/api/individual-clients/import', formDataImport, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Base PF importada com sucesso!');
      fetchClients();
    } catch (error) {
      toast.error('Erro na importação massiva');
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

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpf?.includes(searchTerm)
  );

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            B2C <span className="text-gradient-gold">Client Registry</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <User size={14} className="text-primary" />
            Gestão estratégica de pessoas físicas e inteligência CRM Platinum.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-3 px-6 py-4 bg-surface-elevated/20 border border-border-subtle/30 text-text-primary font-black rounded-2xl transition-all text-[10px] uppercase tracking-widest cursor-pointer hover:bg-surface-elevated/40 shadow-inner-platinum group">
            <Upload className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            Importação Massiva
            <input type="file" accept=".csv,.xlsx" onChange={handleImport} className="hidden" />
          </label>
          <button
            onClick={openModal}
            className="btn-primary py-4 px-10 shadow-platinum-glow flex items-center gap-3 uppercase text-[10px] tracking-widest"
          >
            <Plus className="w-5 h-5" />
            Novo Registro PF
          </button>
        </div>
      </header>

      <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-platinum-glow-sm">
        <div className="p-8 bg-surface-elevated/20 border-b border-border-subtle/30 flex flex-wrap gap-8 items-center">
          <div className="relative flex-1 min-w-[320px] group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Buscar cliente por nome, CPF ou identificação digital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-4.5 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum"
            />
          </div>
          <div className="flex items-center gap-6 px-6 py-3 bg-primary/5 border border-primary/20 rounded-2xl">
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-black uppercase tracking-widest text-text-muted opacity-60">Total de Registros</span>
                <span className="text-sm font-black text-primary tracking-tighter">{clients.length}</span>
             </div>
             <div className="w-px h-8 bg-primary/20" />
             <Target className="text-primary w-5 h-5 opacity-60" />
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-platinum">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-elevated/40 border-b border-border-subtle">
              <tr>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">Perfil Estratégico</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">Identificação (CPF/RG)</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">Transmissão (Email)</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">Contato Direto</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/20">
              {loading ? (
                <tr><td colSpan={5} className="px-10 py-40 text-center text-text-muted uppercase text-[10px] font-black tracking-widest animate-pulse"><Loader2 className="animate-spin inline mr-6 w-12 h-12 text-primary" /> Indexando Base CRM...</td></tr>
              ) : filteredClients.length === 0 ? (
                <tr><td colSpan={5} className="px-10 py-40 text-center text-text-muted uppercase text-[10px] font-black tracking-widest opacity-40">Nenhum registro localizado no grid estratégico</td></tr>
              ) : (
                filteredClients.map(client => (
                  <tr key={client.id} className="hover:bg-surface-elevated/20 transition-all group border-b border-border-subtle/10 duration-500">
                    <td className="px-10 py-10">
                      <div className="flex items-center gap-5">
                         <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xl shadow-inner-platinum group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            {client.name.charAt(0)}
                         </div>
                         <div>
                            <div className="font-black text-text-primary group-hover:text-primary transition-colors uppercase tracking-tight text-sm">{client.name}</div>
                            <div className="text-[9px] text-text-muted font-black uppercase tracking-widest mt-1 opacity-60">Client_ID: #{client.id.toString().padStart(4, '0')}</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-10 py-10">
                      <div className="space-y-2">
                        {client.cpf && <div className="text-[11px] font-black text-text-primary flex items-center gap-2 font-mono"><Fingerprint size={12} className="text-primary" /> {client.cpf}</div>}
                        {client.rg && <div className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-60">RG: {client.rg}</div>}
                      </div>
                    </td>
                    <td className="px-10 py-10">
                       <div className="flex items-center gap-3 text-text-primary font-bold text-xs lowercase group-hover:text-primary transition-colors">
                          <Mail size={14} className="opacity-40" /> {client.email || 'transmissão_n/a'}
                       </div>
                    </td>
                    <td className="px-10 py-10">
                       <div className="flex items-center gap-3 text-text-primary font-bold text-xs group-hover:text-primary transition-colors">
                          <Phone size={14} className="opacity-40" /> {client.phone || 'conexão_n/a'}
                       </div>
                    </td>
                    <td className="px-10 py-10 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                        <button onClick={() => handleEdit(client)} className="p-3 bg-surface-elevated/40 border border-border-subtle rounded-xl text-text-muted hover:text-primary transition-all shadow-inner-platinum" title="Refinar"><Pencil size={18} /></button>
                        <button onClick={() => handleDelete(client.id)} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500/60 hover:text-red-500 transition-all shadow-inner-platinum" title="Excluir"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-500">
          <div className="bg-surface-elevated border border-border-subtle/30 rounded-[2.5rem] shadow-platinum-glow w-full max-w-2xl overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center px-10 py-8 border-b border-border-subtle/30 bg-surface-elevated/20">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-text-primary uppercase tracking-tighter flex items-center gap-4">
                  {isEditing ? 'REFINAR' : 'NOVO'} <span className="text-gradient-gold">CLIENTE PF</span>
                </h2>
                <div className="flex items-center gap-3 text-[10px] text-text-muted font-black uppercase tracking-[0.3em] opacity-60">
                   <ShieldCheck size={14} className="text-primary" /> Consolidação de Perfil Estratégico CRM
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 bg-surface-elevated/40 border border-border-subtle rounded-2xl text-text-muted hover:text-text-primary transition-all shadow-inner-platinum">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-4 group">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Nome Completo do Ativo *</label>
                <div className="relative">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6 opacity-40" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum"
                    placeholder="Nome completo para registro"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 group">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Identificação CPF</label>
                  <div className="relative">
                    <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/60 w-6 h-6" />
                    <input
                      type="text"
                      value={formData.cpf}
                      onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                      className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all font-mono shadow-inner-platinum"
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>

                <div className="space-y-4 group">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Identificação RG</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6 opacity-40" />
                    <input
                      type="text"
                      value={formData.rg}
                      onChange={e => setFormData({ ...formData, rg: e.target.value })}
                      className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all font-mono shadow-inner-platinum"
                      placeholder="Número do documento"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 group">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Email de Transmissão</label>
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6 opacity-40" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all lowercase shadow-inner-platinum"
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>

                <div className="space-y-4 group">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Canal de Contato Direto</label>
                  <div className="relative">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/60 w-6 h-6" />
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-6 pt-10 border-t border-border-subtle/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-10 py-5 text-[11px] font-black text-text-muted hover:text-text-primary uppercase tracking-[0.4em] transition-all"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="btn-primary py-5 px-16 shadow-platinum-glow flex items-center gap-5 uppercase text-[12px] tracking-[0.5em]"
                >
                   <Save size={24} className="shadow-platinum-glow-sm" />
                   {isEditing ? 'CONSOLIDAR' : 'CRIAR PERFIL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}