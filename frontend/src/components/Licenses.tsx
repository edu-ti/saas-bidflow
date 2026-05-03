import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle, List, Eye, Download, Trash2, Save, FileCheck, Calendar, Lock, ShieldCheck, FileWarning, Sparkles, ChevronRight, Layout } from 'lucide-react';

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
                 className="w-full bg-background/50 border border-border-medium rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/30 shadow-inner-platinum" 
               />
            </div>
          </div>
          <div className="md:col-span-3 space-y-2 group">
            <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2 group-focus-within:text-primary transition-colors">Data de Vencimento</label>
            <div className="relative">
              <input 
                type="date" 
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
            <button className="btn-primary w-full py-4 px-6 shadow-platinum-glow flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest">
              <Save size={18} />
              Sincronizar
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
                          <span className="px-4 py-1.5 text-[9px] font-black rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-widest shadow-platinum-glow-sm">
                            VENCIDO_ALERT
                          </span>
                          <span className="text-[10px] text-red-500/60 font-black italic uppercase tracking-tighter">Há {doc.daysDiff} dias fora do SLA</span>
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
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                      <button className="p-3 bg-surface-elevated/40 hover:text-primary text-text-muted rounded-xl border border-border-subtle transition-all shadow-inner-platinum" title="Visualizar Camada Digital">
                        <Eye size={18} />
                      </button>
                      <button className="p-3 bg-surface-elevated/40 hover:text-blue-500 text-text-muted rounded-xl border border-border-subtle transition-all shadow-inner-platinum" title="Baixar Objeto">
                        <Download size={18} />
                      </button>
                      <button className="p-3 bg-red-500/5 hover:text-red-500 text-red-500/60 rounded-xl border border-red-500/10 transition-all shadow-inner-platinum" title="Remover Registro">
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
    </div>
  );
}
