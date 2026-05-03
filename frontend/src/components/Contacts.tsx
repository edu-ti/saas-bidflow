import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Upload, Save, X, User, Briefcase, Mail, Phone, ShieldCheck, Search, Loader2, Target, Globe, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';

interface Contact {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
}

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/contacts');
      setContacts(res.data.data || res.data || []);
    } catch (error) {
      toast.error('Erro na sincronização de contatos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing && editingId) {
        await api.put(`/api/contacts/${editingId}`, formData);
        toast.success('Contato atualizado com sucesso!');
      } else {
        await api.post('/api/contacts', formData);
        toast.success('Novo contato estratégico criado!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchContacts();
    } catch (error) {
      toast.error('Falha na orquestração do registro');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contact: Contact) => {
    setFormData({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      position: contact.position || '',
    });
    setEditingId(contact.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Autorizar remoção definitiva deste contato do CRM?')) return;

    try {
      await api.delete(`/api/contacts/${id}`);
      toast.success('Registro removido com sucesso.');
      fetchContacts();
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
      toast.loading('Importando base estratégica...', { duration: 1000 });
      await api.post('/api/contacts/import', formDataImport, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Contatos importados com sucesso!');
      fetchContacts();
    } catch (error) {
      toast.error('Erro na importação massiva');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', position: '' });
    setEditingId(null);
    setIsEditing(false);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Global <span className="text-gradient-gold">Contact Directory</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <Globe size={14} className="text-primary" />
            Central de inteligência e governança de contatos Platinum.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-3 px-6 py-4 bg-surface-elevated/20 border border-border-subtle/30 text-text-primary font-black rounded-2xl transition-all text-[10px] uppercase tracking-widest cursor-pointer hover:bg-surface-elevated/40 shadow-inner-platinum group">
            <Upload className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            Sincronizar CSV/XLSX
            <input type="file" accept=".csv,.xlsx" onChange={handleImport} className="hidden" />
          </label>
          <button
            onClick={openModal}
            className="btn-primary py-4 px-10 shadow-platinum-glow flex items-center gap-3 uppercase text-[10px] tracking-widest"
          >
            <Plus className="w-5 h-5" />
            Novo Contato Global
          </button>
        </div>
      </header>

      <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-platinum-glow-sm">
        <div className="p-8 bg-surface-elevated/20 border-b border-border-subtle/30 flex flex-wrap gap-8 items-center">
          <div className="relative flex-1 min-w-[320px] group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Rastrear contato por nome, cargo ou domínio institucional..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-4.5 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum"
            />
          </div>
          <div className="flex items-center gap-6 px-6 py-3 bg-primary/5 border border-primary/20 rounded-2xl">
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-black uppercase tracking-widest text-text-muted opacity-60">Matriz de Contatos</span>
                <span className="text-sm font-black text-primary tracking-tighter">{contacts.length}</span>
             </div>
             <div className="w-px h-8 bg-primary/20" />
             <Activity className="text-primary w-5 h-5 opacity-60" />
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-platinum">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-elevated/40 border-b border-border-subtle">
              <tr>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">Identificação Neural</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">Cargo Operacional</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">Transmissão (Email)</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">Conexão (Phone)</th>
                <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60 text-right">Controles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/20">
              {loading ? (
                <tr><td colSpan={5} className="px-10 py-40 text-center text-text-muted uppercase text-[10px] font-black tracking-widest animate-pulse"><Loader2 className="animate-spin inline mr-6 w-12 h-12 text-primary" /> Sincronizando Diretório...</td></tr>
              ) : filteredContacts.length === 0 ? (
                <tr><td colSpan={5} className="px-10 py-40 text-center text-text-muted uppercase text-[10px] font-black tracking-widest opacity-40">Nenhum registro localizado no diretório Platinum</td></tr>
              ) : (
                filteredContacts.map(contact => (
                  <tr key={contact.id} className="hover:bg-surface-elevated/20 transition-all group border-b border-border-subtle/10 duration-500">
                    <td className="px-10 py-10">
                      <div className="flex items-center gap-5">
                         <div className="w-14 h-14 rounded-2xl bg-surface-elevated/40 border border-border-subtle/30 flex items-center justify-center text-text-muted font-black text-xl shadow-inner-platinum group-hover:bg-primary group-hover:text-white group-hover:border-primary/20 transition-all duration-500">
                            {contact.name.charAt(0)}
                         </div>
                         <div>
                            <div className="font-black text-text-primary group-hover:text-primary transition-colors uppercase tracking-tight text-sm">{contact.name}</div>
                            <div className="text-[9px] text-text-muted font-black uppercase tracking-widest mt-1 opacity-60 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" /> Profile_Verified</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-10 py-10">
                       <div className="flex items-center gap-3 text-text-primary font-black uppercase tracking-widest text-[10px] opacity-80">
                          <Briefcase size={14} className="text-primary/60" /> {contact.position || 'NÃO DEFINIDO'}
                       </div>
                    </td>
                    <td className="px-10 py-10">
                       <div className="flex items-center gap-3 text-text-primary font-bold text-xs lowercase group-hover:text-primary transition-colors">
                          <Mail size={14} className="opacity-40" /> {contact.email || 'transmissão_off'}
                       </div>
                    </td>
                    <td className="px-10 py-10">
                       <div className="flex items-center gap-3 text-text-primary font-bold text-xs group-hover:text-primary transition-colors">
                          <Phone size={14} className="opacity-40" /> {contact.phone || 'conexão_off'}
                       </div>
                    </td>
                    <td className="px-10 py-10 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                        <button onClick={() => handleEdit(contact)} className="p-3 bg-surface-elevated/40 border border-border-subtle rounded-xl text-text-muted hover:text-primary transition-all shadow-inner-platinum" title="Refinar"><Pencil size={18} /></button>
                        <button onClick={() => handleDelete(contact.id)} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500/60 hover:text-red-500 transition-all shadow-inner-platinum" title="Excluir"><Trash2 size={18} /></button>
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
                  {isEditing ? 'REFINAR' : 'NOVO'} <span className="text-gradient-gold">CONTATO GLOBAL</span>
                </h2>
                <div className="flex items-center gap-3 text-[10px] text-text-muted font-black uppercase tracking-[0.3em] opacity-60">
                   <ShieldCheck size={14} className="text-primary" /> Consolidação de Registro Institucional Platinum
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 bg-surface-elevated/40 border border-border-subtle rounded-2xl text-text-muted hover:text-text-primary transition-all shadow-inner-platinum">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-4 group">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Nome Completo Institucional *</label>
                <div className="relative">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6 opacity-40" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum"
                    placeholder="Identificação do contato"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 group">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Cargo ou Função Estratégica</label>
                  <div className="relative">
                    <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/60 w-6 h-6" />
                    <input
                      type="text"
                      value={formData.position}
                      onChange={e => setFormData({ ...formData, position: e.target.value })}
                      className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all uppercase tracking-widest shadow-inner-platinum"
                      placeholder="Ex: Diretor de Operações"
                    />
                  </div>
                </div>

                <div className="space-y-4 group">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Conexão Telefônica</label>
                  <div className="relative">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6 opacity-40" />
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

              <div className="space-y-4 group">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Email de Transmissão Corporativa</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/60 w-6 h-6" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all lowercase shadow-inner-platinum"
                    placeholder="email@corporativo.com"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-6 pt-10 border-t border-border-subtle/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-10 py-5 text-[11px] font-black text-text-muted hover:text-text-primary uppercase tracking-[0.4em] transition-all"
                >
                  DESCARTE
                </button>
                <button
                  type="submit"
                  className="btn-primary py-5 px-16 shadow-platinum-glow flex items-center gap-5 uppercase text-[12px] tracking-[0.5em]"
                >
                   <Save size={24} className="shadow-platinum-glow-sm" />
                   {isEditing ? 'CONSOLIDAR' : 'CRIAR REGISTRO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}