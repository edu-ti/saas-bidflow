import { useState, useEffect } from 'react';
import { Search, Filter, Target, ExternalLink, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';

interface BiddingAlert {
  id: number;
  content: string;
  raw_data: {
    agency: string;
    object: string;
    estimated_value?: number;
    opening_date?: string;
    notice_link?: string;
    uf?: string;
  };
  is_read: boolean;
  alert_date: string;
}

export default function BiddingRadar() {
  const [alerts, setAlerts] = useState<BiddingAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [qualifyingId, setQualifyingId] = useState<number | null>(null);

  // Filtros
  const [search, setSearch] = useState('');
  const [agencyFilter, setAgencyFilter] = useState('');
  const [ufFilter, setUfFilter] = useState('');
  const [minValue, setMinValue] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/api/alerts');
      // Filtramos apenas alertas do tipo RPA_RADAR que ainda não foram vinculados a uma oportunidade
      setAlerts(res.data.data.filter((a: any) => a.type === 'RPA_RADAR'));
    } catch (error) {
      toast.error('Erro ao carregar o radar');
    } finally {
      setLoading(false);
    }
  };

  const handleQualify = async (id: number) => {
    setQualifyingId(id);
    try {
      await api.post(`/api/alerts/${id}/qualify`);
      toast.success('Licitação qualificada! IA analisando edital.');
      fetchAlerts();
    } catch (error) {
      toast.error('Erro ao qualificar licitação');
    } finally {
      setQualifyingId(null);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const data = alert.raw_data;
    const matchesSearch = data.object.toLowerCase().includes(search.toLowerCase());
    const matchesAgency = agencyFilter ? data.agency.toLowerCase().includes(agencyFilter.toLowerCase()) : true;
    const matchesUF = ufFilter ? data.uf === ufFilter : true;
    const matchesValue = minValue ? (data.estimated_value ?? 0) >= parseFloat(minValue) : true;
    return matchesSearch && matchesAgency && matchesUF && matchesValue;
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Radar de Licitações (RPA)</h1>
          <p className="text-sm text-slate-500">Oportunidades capturadas automaticamente pelo robô</p>
        </div>
      </div>

      {/* Filtros Rápidos */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Palavra-chave..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <input 
          type="text" 
          placeholder="Órgão..." 
          value={agencyFilter}
          onChange={e => setAgencyFilter(e.target.value)}
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select 
          value={ufFilter}
          onChange={e => setUfFilter(e.target.value)}
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os Estados</option>
          <option value="SP">São Paulo</option>
          <option value="RJ">Rio de Janeiro</option>
          <option value="MG">Minas Gerais</option>
          <option value="DF">Distrito Federal</option>
          {/* Adicionar outros conforme necessário */}
        </select>
        <input 
          type="number" 
          placeholder="Valor Mínimo..." 
          value={minValue}
          onChange={e => setMinValue(e.target.value)}
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
            <p>Sincronizando com o robô RPA...</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Órgão / UF</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Objeto</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Valor Estimado</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Abertura</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Nenhuma licitação encontrada no radar com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map(alert => (
                  <tr key={alert.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{alert.raw_data.agency}</div>
                      <div className="text-xs text-slate-500">{alert.raw_data.uf || 'Brasil'}</div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <div className="line-clamp-2">{alert.raw_data.object}</div>
                      {alert.raw_data.notice_link && (
                        <a 
                          href={alert.raw_data.notice_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs flex items-center gap-1 mt-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Ver Edital
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {alert.raw_data.estimated_value 
                        ? alert.raw_data.estimated_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        : 'Sob consulta'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {alert.raw_data.opening_date 
                        ? new Date(alert.raw_data.opening_date).toLocaleDateString('pt-BR') 
                        : 'Não informada'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleQualify(alert.id)}
                        disabled={qualifyingId === alert.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-semibold text-sm transition-all shadow-sm"
                      >
                        {qualifyingId === alert.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Target className="w-4 h-4" />
                        )}
                        Qualificar
                      </button>
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
