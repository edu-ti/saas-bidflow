import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle, List, Eye, Download, Trash2, Save, FileCheck, Calendar, Lock, ShieldCheck, FileWarning, Sparkles } from 'lucide-react';

interface LicenseDocument {
  id: string;
  title: string;
  expirationDate: string;
  status: 'vencido' | 'vigente';
  daysDiff: number;
}

const mockDocuments: LicenseDocument[] = [
  { id: '1', title: 'Certidao-falencia- 1grau-FR', expirationDate: '11/12/2025', status: 'vencido', daysDiff: 137 },
  { id: '2', title: 'CNDF', expirationDate: '22/12/2025', status: 'vencido', daysDiff: 126 },
  { id: '3', title: 'CND-MUNICIPAL FR', expirationDate: '23/12/2025', status: 'vencido', daysDiff: 125 },
  { id: '4', title: 'CNDT_FR', expirationDate: '20/01/2026', status: 'vencido', daysDiff: 97 },
  { id: '5', title: 'CND ESTADUAL FR', expirationDate: '20/01/2026', status: 'vencido', daysDiff: 97 },
  { id: '6', title: 'Vig Sanitária Municipal FR', expirationDate: '07/02/2026', status: 'vencido', daysDiff: 79 },
  { id: '7', title: 'ALVARÁ DE LOCALIZAÇÃO E FUNCIONAMENTO', expirationDate: '20/12/2028', status: 'vigente', daysDiff: 968 },
];

export default function Licenses() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<LicenseDocument[]>(mockDocuments);

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-8 text-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Gestão de <span className="text-gradient-gold">Licenças & Certidões</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <ShieldCheck size={12} className="text-primary" />
            Controle estratégico de conformidade e validade documental.
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 px-6 py-3 bg-white/[0.02] text-white font-bold rounded-xl border border-white/10 hover:bg-white/5 transition-all text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} className="text-primary" />
          Voltar ao Painel
        </button>
      </header>

      {/* Novo Documento - Platinum Form */}
      <section className="platinum-card p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Sparkles size={120} className="text-primary" />
        </div>
        
        <div className="flex items-center gap-3 border-b border-white/5 pb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <PlusCircle size={20} />
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em]">Upload de Inteligência Documental</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end relative z-10">
          <div className="md:col-span-4 space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Título / Descrição</label>
            <input 
              type="text" 
              placeholder="Ex: CND Federal - Receita" 
              className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary/40 outline-none transition-all" 
            />
          </div>
          <div className="md:col-span-3 space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Data de Vencimento</label>
            <div className="relative">
              <input 
                type="date" 
                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary/40 outline-none transition-all appearance-none" 
              />
              <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none" />
            </div>
          </div>
          <div className="md:col-span-3 space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Arquivo Digital</label>
            <label className="flex items-center justify-center w-full h-[46px] bg-white/[0.02] border border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/[0.04] hover:border-primary/40 transition-all text-xs text-text-muted font-bold group">
              <Download size={14} className="mr-2 group-hover:text-primary transition-colors" />
              Upload PDF/IMG
              <input type="file" className="hidden" />
            </label>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button className="flex items-center justify-center gap-3 w-full px-6 py-3.5 bg-primary text-background font-black rounded-xl shadow-platinum-glow hover:bg-primary-hover transition-all text-xs uppercase tracking-widest">
              <Save size={16} />
              Sincronizar
            </button>
          </div>
        </div>
      </section>

      {/* Documentos Cadastrados - Platinum List */}
      <section className="platinum-card overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <List className="text-primary w-5 h-5" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em]">Repositório de Conformidade</h3>
          </div>
          <span className="bg-white/5 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
            {documents.length} Arquivos Ativos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Documento Estratégico</th>
                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Vencimento</th>
                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Status de Risco</th>
                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${doc.status === 'vencido' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {doc.status === 'vencido' ? <FileWarning size={18} /> : <FileCheck size={18} />}
                      </div>
                      <span className="font-bold text-white group-hover:text-primary transition-colors text-sm">{doc.title}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center font-mono text-sm text-text-secondary">{doc.expirationDate}</td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col items-center gap-1.5">
                      {doc.status === 'vencido' ? (
                        <>
                          <span className="px-3 py-1 text-[9px] font-black rounded-md bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-widest shadow-[0_0_15px_-5px_rgba(239,68,68,0.4)]">
                            VENCIDO
                          </span>
                          <span className="text-[10px] text-red-500/60 font-bold italic">Há {doc.daysDiff} dias</span>
                        </>
                      ) : (
                        <>
                          <span className="px-3 py-1 text-[9px] font-black rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                            Regularizado
                          </span>
                          <span className="text-[10px] text-text-muted font-bold italic">Faltam {doc.daysDiff} dias</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button className="p-2.5 bg-white/5 hover:bg-primary hover:text-background text-text-muted rounded-xl border border-white/5 transition-all" title="Visualizar">
                        <Eye size={16} />
                      </button>
                      <button className="p-2.5 bg-white/5 hover:bg-blue-500 hover:text-white text-text-muted rounded-xl border border-white/5 transition-all" title="Baixar Arquivo">
                        <Download size={16} />
                      </button>
                      <button className="p-2.5 bg-white/5 hover:bg-red-500 hover:text-white text-text-muted rounded-xl border border-white/5 transition-all" title="Remover">
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
    </div>
  );
}
