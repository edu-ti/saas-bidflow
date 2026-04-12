import { useState, useEffect } from 'react';
import api from '../lib/axios';

interface BiddingFilter {
  id: number;
  name: string;
  keywords: string[];
  portals: string[];
  is_active: boolean;
}

export default function BiddingRadar() {
  const [filters, setFilters] = useState<BiddingFilter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/bidding-filters')
      .then(res => setFilters(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Radar de Licitações</h1>
          <p className="text-sm text-slate-500">Configuração de filtros para o robô de inteligência</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors">
          + Novo Radar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">A carregar filtros de radar...</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Nome / Título</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Palavras-Chave</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Portais Ativos</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filters.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Nenhum radar configurado. O robô Python não buscará novas licitações.
                  </td>
                </tr>
              ) : (
                filters.map(filter => (
                  <tr key={filter.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{filter.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {filter.keywords?.map(kw => (
                          <span key={kw} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {filter.portals?.join(', ') || 'Todos'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${filter.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {filter.is_active ? 'Ativo' : 'Pausado'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
