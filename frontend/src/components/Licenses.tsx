import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle, List, Eye, Download, Trash2, Save } from 'lucide-react';

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto min-h-screen bg-slate-50/50">
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Gestão de Licenças e Certidões</h1>
        <div className="flex justify-between items-center">
          <h2 className="text-slate-600 text-sm font-medium">Controle de vencimentos e arquivos anexos</h2>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded text-sm font-medium transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Painel
          </button>
        </div>
      </div>

      {/* Novo Documento */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-green-100 p-1 rounded-full">
            <PlusCircle className="w-4 h-4 text-green-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">Novo Documento</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-xs text-slate-500 mb-1.5">Título / Descrição</label>
            <input 
              type="text" 
              placeholder="Ex: CND Federal - Receita" 
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 placeholder-slate-300" 
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs text-slate-500 mb-1.5">Data de Vencimento</label>
            <input 
              type="date" 
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-600" 
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs text-slate-500 mb-1.5">Arquivo (PDF/Img)</label>
            <div className="flex border border-slate-300 rounded overflow-hidden h-[38px]">
              <label className="bg-slate-50 text-slate-600 border-r border-slate-300 px-3 py-2 text-xs cursor-pointer hover:bg-slate-100 flex items-center justify-center">
                Escolher arquivo
                <input type="file" className="hidden" />
              </label>
              <div className="px-3 py-2 text-xs text-slate-400 flex-1 bg-white truncate flex items-center">
                Nenhum ar...vo escolhido
              </div>
            </div>
          </div>
          <div className="md:col-span-1 flex justify-end">
            <button className="flex items-center justify-center gap-1.5 w-full md:w-auto px-4 py-2 h-[38px] bg-[#16A34A] hover:bg-green-700 text-white rounded text-sm font-medium transition-colors shadow-sm">
              <Save className="w-4 h-4" />
              Salvar
            </button>
          </div>
        </div>
      </div>

      {/* Documentos Cadastrados */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <List className="w-5 h-5 text-teal-500" />
          <h3 className="text-base font-semibold text-slate-800">Documentos Cadastrados</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 w-2/5">DOCUMENTO</th>
                <th className="px-4 py-3">VENCIMENTO</th>
                <th className="px-4 py-3">SITUAÇÃO</th>
                <th className="px-4 py-3 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4 font-semibold text-slate-700">{doc.title}</td>
                  <td className="px-4 py-4 text-slate-600 font-medium">{doc.expirationDate}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col items-start gap-0.5">
                      {doc.status === 'vencido' ? (
                        <>
                          <span className="inline-flex px-3 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-700">
                            VENCIDO
                          </span>
                          <span className="text-[10px] text-red-500 font-medium">Há {doc.daysDiff} dias</span>
                        </>
                      ) : (
                        <>
                          <span className="inline-flex px-3 py-0.5 text-[10px] font-bold rounded-full bg-green-100 text-green-700">
                            Vigente
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">Faltam {doc.daysDiff} dias</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="p-1.5 bg-[#0EA5E9] hover:bg-sky-600 text-white rounded transition-colors shadow-sm" title="Ver">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 bg-slate-500 hover:bg-slate-600 text-white rounded transition-colors shadow-sm" title="Baixar">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 bg-[#EF4444] hover:bg-red-600 text-white rounded transition-colors shadow-sm" title="Excluir">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
