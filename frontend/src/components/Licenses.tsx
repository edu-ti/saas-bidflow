import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle, List, Eye, Download, Trash2, Save, FileCheck, ShieldCheck, FileWarning, Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from './ui/Modal';
import { DatePicker } from './ui/DatePicker';
import { format } from 'date-fns';

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
      toast.success('Documento salvo com sucesso!');
    }, 500);
  };

  const handleView = (doc: LicenseDocument) => {
    toast.success(`Visualizando: ${doc.title}`);
  };

  const handleDownload = (doc: LicenseDocument) => {
    toast.success(`Download iniciado: ${doc.title}`);
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
    toast.success('Documento removido.');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Licenças & Certidões
          </h1>
          <p className="text-text-secondary text-sm mt-1 flex items-center gap-2">
            <ShieldCheck size={14} className="text-primary" />
            Controle de conformidade e validade documental para licitações.
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/')}
          className="btn btn-outline text-xs"
        >
          <ArrowLeft size={14} />
          Voltar ao Dashboard
        </button>
      </header>

      <section className="card p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <PlusCircle size={20} />
          </div>
          <h3 className="text-sm font-semibold text-text-primary">Novo Documento</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Título do Documento</label>
            <input 
              type="text" 
              placeholder="Ex: CND Federal - Receita" 
              value={newDoc.title}
              onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
              className="input" 
            />
          </div>
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Data de Vencimento</label>
            <DatePicker
              selected={newDoc.expirationDate ? new Date(`${newDoc.expirationDate}T12:00:00`) : null}
              onChange={date => setNewDoc({ ...newDoc, expirationDate: date ? format(date, "yyyy-MM-dd") : '' })}
            />
          </div>
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Arquivo</label>
            <label className="flex items-center justify-center w-full h-[42px] bg-bg-tertiary border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/40 transition-all text-xs text-text-muted font-medium gap-2">
              <Download size={14} />
              Upload PDF
              <input type="file" className="hidden" />
            </label>
          </div>
          <div className="md:col-span-2">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary w-full"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar Documento
            </button>
          </div>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
               <List size={18} />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Documentos Cadastrados</h3>
          </div>
          <span className="badge badge-default">
            {documents.length} documentos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Documento</th>
                <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider text-center">Vencimento</th>
                <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-bg-tertiary/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${doc.status === 'vencido' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {doc.status === 'vencido' ? <FileWarning size={16} /> : <FileCheck size={16} />}
                      </div>
                      <span className="font-medium text-text-primary text-sm">{doc.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-text-secondary">{doc.expirationDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-1">
                      {doc.status === 'vencido' ? (
                        <>
                          <span className="badge badge-danger">Vencido</span>
                          <span className="text-xs text-red-500/80">Há {doc.daysDiff} dias</span>
                        </>
                      ) : doc.daysDiff <= 5 ? (
                        <>
                          <span className="badge badge-warning">Próximo</span>
                          <span className="text-xs text-amber-500/80">Restam {doc.daysDiff} dias</span>
                        </>
                      ) : (
                        <>
                          <span className="badge badge-success">Vigente</span>
                          <span className="text-xs text-emerald-500/80">{doc.daysDiff} dias restantes</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleView(doc); }} className="btn btn-ghost p-2" title="Visualizar">
                        <Eye size={16} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDownload(doc); }} className="btn btn-ghost p-2" title="Baixar">
                        <Download size={16} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }} className="btn btn-ghost p-2 text-red-500 hover:bg-red-500/10" title="Remover">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal 
        isOpen={showPopup} 
        onClose={() => setShowPopup(false)} 
        title="Alertas de Risco Documental"
        description="Certidões vencidas ou próximas do vencimento que podem impactar participações em licitações."
        size="lg"
      >
        <div className="space-y-4 p-2">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center text-white shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-red-500">Ação Corretiva Necessária</h4>
              <p className="text-xs text-text-muted mt-0.5">Certidões vencidas ou próximas do vencimento podem impactar participações em licitações.</p>
            </div>
          </div>

          <div className="space-y-2">
            {criticalDocs.map(doc => (
              <div key={doc.id} className="p-4 bg-bg-tertiary/50 border border-border rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${doc.status === 'vencido' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
                    <FileWarning size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{doc.title}</p>
                    <p className={`text-xs font-medium mt-0.5 ${doc.status === 'vencido' ? 'text-red-500' : 'text-amber-500'}`}>
                      {doc.status === 'vencido' ? `Vencido há ${doc.daysDiff} dias` : `Vence em ${doc.daysDiff} dias`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button 
              onClick={() => setShowPopup(false)}
              className="btn btn-outline"
            >
              Fechar
            </button>
            <button 
              onClick={() => setShowPopup(false)}
              className="btn btn-primary"
            >
              Compreendido
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
