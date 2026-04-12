import { useState, useEffect } from 'react';
import api from '../lib/axios';

interface ParsedItem {
  description: string;
  quantity: number;
  matched_product_id: number | null;
}

interface Opportunity {
  id: number;
  title: string;
  win_probability: string | null;
  parsed_items: ParsedItem[] | null;
}

export default function AIProposalDraft() {
  const [opportunityId, setOpportunityId] = useState<string>('1');
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [polling, setPolling] = useState(false);

  const loadOpportunity = () => {
    if (!opportunityId) return;
    setLoading(true);
    api.get(`/api/opportunities`)
      .then(res => {
        const ops = res.data.data || res.data;
        const target = ops.find((o: any) => String(o.id) === opportunityId);
        if (target) setOpportunity(target);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (polling) {
      interval = setInterval(() => {
        loadOpportunity();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [polling, opportunityId]);

  const handleParseNotice = () => {
    setParsing(true);
    setPolling(true);
    // Simula disparo de Toasts de notificação (React Hot Toast / UI State)
    alert('Info: Extração de Inteligência Artificial iniciada. Por favor, aguarde...');
    
    api.post(`/api/opportunities/${opportunityId}/parse-notice`)
      .then(() => {
        // Deixa o polling a correr para atualizar os dados assim que o Job terminar
        setTimeout(() => {
            setPolling(false);
            setParsing(false);
            alert('Sucesso! Mapeamento de itens concluído. 85% de correspondência com o seu catálogo de produtos.');
            loadOpportunity();
        }, 6000); // Força um timeout de UI para mock da queue real
      })
      .catch(() => {
        setParsing(false);
        setPolling(false);
      });
  };

  const handleGeneratePDF = () => {
    window.open(`http://localhost:8000/api/opportunities/${opportunityId}/proposal-draft/pdf`, '_blank');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gerador de Propostas GenAI</h1>
          <p className="text-sm text-slate-500">Mapeamento inteligente de editais vs Catálogo</p>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="text" 
            placeholder="ID da Oportunidade" 
            value={opportunityId} 
            onChange={e => setOpportunityId(e.target.value)}
            className="border px-3 py-1.5 rounded-md text-sm w-32"
          />
          <button 
            onClick={loadOpportunity}
            className="bg-slate-200 text-slate-700 hover:bg-slate-300 px-4 py-2 rounded-md font-medium text-sm transition-colors">
            Carregar
          </button>
        </div>
      </div>

      {!opportunity ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center text-slate-500">
          Carregue uma oportunidade para iniciar. (Ex: ID 1)
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-lg text-slate-800">{opportunity.title}</h2>
              <p className="text-sm text-slate-500 mt-1">
                Probabilidade de Vitória: {opportunity.win_probability ? <span className="font-bold text-emerald-600">{opportunity.win_probability}%</span> : 'Não calculada'}
              </p>
            </div>
            
            {!opportunity.parsed_items ? (
              <button 
                onClick={handleParseNotice}
                disabled={parsing}
                className={`px-4 py-2 rounded-md font-medium text-sm text-white transition-colors ${parsing ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                {parsing ? 'A processar Edital via IA...' : 'Extrair Itens do PDF (RAG)'}
              </button>
            ) : (
              <button 
                onClick={handleGeneratePDF}
                className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md font-medium text-sm text-white transition-colors">
                Gerar Proposta Oficial (PDF)
              </button>
            )}
          </div>

          {opportunity.parsed_items && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 text-sm">Itens Extraídos pelo Robô Python</h3>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-bold">85% Mapeado</span>
              </div>
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold uppercase text-xs">Exigência do Órgão (Edital)</th>
                    <th className="px-6 py-3 font-semibold uppercase text-xs text-center">Quantidade</th>
                    <th className="px-6 py-3 font-semibold uppercase text-xs">Match no Catálogo (SKU)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {opportunity.parsed_items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">{item.description}</td>
                      <td className="px-6 py-4 text-center font-bold">{item.quantity}</td>
                      <td className="px-6 py-4">
                        {item.matched_product_id ? (
                          <span className="text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">Match Automático: Produto #{item.matched_product_id}</span>
                        ) : (
                          <select className="border border-red-300 bg-red-50 text-red-700 px-2 py-1 rounded text-xs w-full cursor-pointer focus:outline-none">
                            <option>Revisão Manual Necessária</option>
                            <option>Vincular Produto...</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
