import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle, List, Eye, Download, Trash2, Save, FileCheck, Calendar, Lock, ShieldCheck, FileWarning, Sparkles, ChevronRight, Layout, FileText, Loader2, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from './ui/Modal';

interface LicenseDocument {
  id: string;
  title: string;
  expirationDate: string;
  status: 'vencido' | 'vigente';
  daysDiff: number;
}

const mockDocuments: LicenseDocument[] = [
  { id: '1', title: 'Certidão Negativa de Falência - 1ª Instância', expirationDate: '11/12/2025', status: 'vencido', daysDiff: 137 },
  { id: '2', title: 'Certidão Negativa de Débitos Federais (CNDF)', expirationDate: '22/12/2025', status: 'vencido', daysDiff: 126 },
  { id: '3', title: 'CND Municipal - Sede Operacional', expirationDate: '23/12/2025', status: 'vencido', daysDiff: 125 },
  { id: '4', title: 'Certidão Negativa de Débitos Trabalhistas (CNDT)', expirationDate: '20/01/2026', status: 'vencido', daysDiff: 97 },
  { id: '5', title: 'Certidão Negativa Estadual (Geral)', expirationDate: '20/01/2026', status: 'vencido', daysDiff: 97 },
  { id: '6', title: 'Vigilância Sanitária Municipal - Alvará', expirationDate: '07/02/2026', status: 'vencido', daysDiff: 79 },
  { id: '7', title: 'Alvará de Localização e Funcionamento Digital', expirationDate: '20/12/2028', status: 'vigente', daysDiff: 968 },
];

export default function Licenses() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<LicenseDocument[]>(mockDocuments);
  const [newDoc, setNewDoc] = useState({ title: '', expirationDate: '' });
  const [isSaving, setIsSaving] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [criticalDocs, setCriticalDocs] = useState<LicenseDocument[]>([]);

  useEffect(() => {
    const critical = documents.filter(doc => doc.status === 'vencido' || doc.daysDiff <= 5);
    if (critical.length > 0) {
      setCriticalDocs(critical);
      setShowPopup(true);
    }
  }, []);

  const handleSave = () => {
    if (!newDoc.title || !newDoc.expirationDate) {
      toast.error('Preencha o título e a data de vencimento.');
      return;
    }

    setIsSaving(true);
    toast.loading('Sincronizando com o Repositório Neural...', { duration: 1500 });

    setTimeout(() => {
      const expirationDate = new Date(newDoc.expirationDate);
      const today = new Date();
      const diffTime = expirationDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const addedDoc: LicenseDocument = {
        id: (documents.length + 1).toString(),
        title: newDoc.title,
        expirationDate: new Date(newDoc.expirationDate).toLocaleDateString('pt-BR'),
        status: diffDays < 0 ? 'vencido' : 'vigente',
        daysDiff: Math.abs(diffDays)
      };

      setDocuments([addedDoc, ...documents]);
      setNewDoc({ title: '', expirationDate: '' });
      setIsSaving(false);
      toast.success('Certidão arquivada com sucesso!');
    }, 1500);
  };

  const handleView = (doc: LicenseDocument) => {
    toast.success(`Visualizando: ${doc.title}`, { icon: '👁️' });
  };

  const handleDownload = (doc: LicenseDocument) => {
    toast.success(`Download iniciado: ${doc.title}`, { icon: '📥' });
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
    toast.success('Documento removido do repositório.');
  };

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Gestão de <span className="text-gradient-gold">Licenças & Certidões</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <ShieldCheck size={14} className="text-primary" />
            Controle estratégico de conformidade e validade documental para licitações.
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 px-8 py-3.5 bg-surface-elevated/40 text-text-primary font-black rounded-2xl border border-border-subtle hover:bg-surface-elevated transition-all text-[10px] uppercase tracking-widest shadow-platinum-glow-sm"
        >
          <ArrowLeft size={16} className="text-primary" />
          Retornar ao Painel Core
        </button>
      </header>

      {/* Novo Documento - Platinum Form */}
      <section className="platinum-card p-10 space-y-8 relative overflow-hidden bg-surface-elevated/10 backdrop-blur-xl border-border-subtle/30">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
          <Sparkles size={180} className="text-primary" />
        </div>
        
        <div className="flex items-center gap-4 border-b border-border-subtle/20 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-platinum-glow-sm">
            <PlusCircle size={24} />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-primary">Upload de Inteligência Documental</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end relative z-10">
          <div className="md:col-span-4 space-y-2 group">
            <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2 group-focus-within:text-primary transition-colors">Título / Designação Comercial</label>
            <div className="relative">
               <FileText className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5 opacity-40" />
               <input 
                 type="text" 
                 placeholder="Ex: CND Federal - Receita" 
                 value={newDoc.title}
                 onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                 className="w-full bg-background/50 border border-border-medium rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/30 shadow-inner-platinum" 
               />
            </div>
          </div>
          <div className="md:col-span-3 space-y-2 group">
            <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2 group-focus-within:text-primary transition-colors">Data de Vencimento</label>
            <div className="relative">
              <input 
                type="date" 
                value={newDoc.expirationDate}
                onChange={(e) => setNewDoc({ ...newDoc, expirationDate: e.target.value })}
                className="w-full bg-background/50 border border-border-medium rounded-2xl px-6 py-4 text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum" 
              />
            </div>
          </div>
          <div className="md:col-span-3 space-y-2">
            <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2">Repositório de Arquivo</label>
            <label className="flex items-center justify-center w-full h-[52px] bg-surface-elevated/20 border-2 border-dashed border-border-medium rounded-2xl cursor-pointer hover:bg-surface-elevated/40 hover:border-primary/40 transition-all text-[10px] text-text-muted font-black uppercase tracking-widest group shadow-inner-platinum">
              <Download size={14} className="mr-3 group-hover:text-primary transition-colors" />
              Upload PDF / Objeto Digital
              <input type="file" className="hidden" />
            </label>
          </div>
          <div className="md:col-span-2">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary w-full py-4 px-6 shadow-platinum-glow flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Salvar Certidão Platinum
            </button>
          </div>
        </div>
      </section>

      {/* Documentos Cadastrados - Platinum List */}
      <section className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30">
        <div className="p-8 border-b border-border-subtle/30 flex items-center justify-between bg-surface-elevated/10">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
               <List size={20} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-primary">Repositório Neural de Conformidade</h3>
          </div>
          <span className="bg-surface-elevated/40 px-6 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border border-border-subtle shadow-inner-platinum">
            {documents.length} Objetos Digitais Ativos
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-platinum">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-surface-elevated/40 border-b border-border-subtle">
                <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60">Documento Estratégico</th>
                <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60 text-center">Vencimento</th>
                <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60 text-center">Status de Risco Core</th>
                <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/20">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-surface-elevated/20 transition-all group border-b border-border-subtle/10 duration-300">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className={`p-3 rounded-2xl shadow-platinum-glow-sm ${doc.status === 'vencido' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                        {doc.status === 'vencido' ? <FileWarning size={20} className="animate-pulse" /> : <FileCheck size={20} />}
                      </div>
                      <div className="space-y-1">
                        <span className="font-black text-text-primary group-hover:text-primary transition-colors text-sm uppercase tracking-tight leading-none">{doc.title}</span>
                        <p className="text-[9px] text-text-muted font-black uppercase tracking-widest opacity-40">REF_CODE: DOCUMENT_{doc.id.padStart(3, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center font-black text-[11px] text-text-secondary tracking-widest opacity-80">{doc.expirationDate}</td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col items-center gap-2">
                      {doc.status === 'vencido' ? (
                        <>
                          <span className="px-4 py-1.5 text-[9px] font-black rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-widest shadow-platinum-glow-sm animate-pulse">
                            VENCIDO_CRITICAL
                          </span>
                          <span className="text-[10px] text-red-500/60 font-black italic uppercase tracking-tighter">Há {doc.daysDiff} dias fora do SLA</span>
                        </>
                      ) : doc.daysDiff <= 5 ? (
                        <>
                          <span className="px-4 py-1.5 text-[9px] font-black rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase tracking-widest shadow-platinum-glow-sm animate-bounce">
                            VENCIMENTO_PRÓXIMO
                          </span>
                          <span className="text-[10px] text-amber-600 font-black italic uppercase tracking-tighter">Restam apenas {doc.daysDiff} dias</span>
                        </>
                      ) : (
                        <>
                          <span className="px-4 py-1.5 text-[9px] font-black rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest shadow-platinum-glow-sm">
                            OPERACIONAL
                          </span>
                          <span className="text-[10px] text-emerald-500/60 font-black italic uppercase tracking-tighter">Vigente por {doc.daysDiff} dias</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3 transition-all duration-300 transform">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleView(doc); }}
                        className="p-3 bg-surface-elevated/40 hover:text-primary text-text-muted rounded-xl border border-border-subtle transition-all shadow-inner-platinum hover:scale-110 active:scale-95" 
                        title="Visualizar Camada Digital"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                        className="p-3 bg-surface-elevated/40 hover:text-blue-500 text-text-muted rounded-xl border border-border-subtle transition-all shadow-inner-platinum hover:scale-110 active:scale-95" 
                        title="Baixar Objeto"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                        className="p-3 bg-red-500/5 hover:text-red-500 text-red-500/60 rounded-xl border border-red-500/10 transition-all shadow-inner-platinum hover:scale-110 active:scale-95" 
                        title="Remover Registro"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Alerta de Conformidade Platinum - Popup Modal */}
      <Modal 
        isOpen={showPopup} 
        onClose={() => setShowPopup(false)} 
        title="CENTRAL DE ALERTAS: RISCO DOCUMENTAL"
        size="md"
      >
        <div className="space-y-8 p-2">
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-6 shadow-platinum-glow-sm">
            <div className="w-16 h-16 rounded-2xl bg-red-500 flex items-center justify-center text-white shadow-lg animate-pulse">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h4 className="text-sm font-black text-red-500 uppercase tracking-tighter">Ação Corretiva Imediata Necessária</h4>
              <p className="text-[11px] text-text-muted font-medium mt-1">Identificamos certidões vencidas ou em zona crítica de expiração (5 dias) que podem impactar a participação em novos certames.</p>
            </div>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-platinum">
            {criticalDocs.map(doc => (
              <div key={doc.id} className="p-5 bg-surface-elevated/40 border border-border-subtle rounded-2xl flex items-center justify-between group hover:border-primary/40 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${doc.status === 'vencido' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
                    <FileWarning size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-text-primary uppercase tracking-tight">{doc.title}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${doc.status === 'vencido' ? 'text-red-500' : 'text-amber-500'}`}>
                      {doc.status === 'vencido' ? `Vencido há ${doc.daysDiff} dias` : `Vence em ${doc.daysDiff} dias`}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPopup(false)}
                  className="p-2 bg-surface-elevated/60 text-text-muted hover:text-primary rounded-lg transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-border-subtle">
            <button 
              onClick={() => setShowPopup(false)}
              className="px-10 py-4 bg-primary text-background text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-platinum-glow hover:scale-105 transition-transform"
            >
              Compreendido
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
