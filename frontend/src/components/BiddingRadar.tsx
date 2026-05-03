import { useState, useEffect } from 'react';
import { Search, Filter, Target, ExternalLink, Loader2, CheckCircle, Lock, ShieldCheck, Zap, MapPin, DollarSign } from 'lucide-react';
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
      const radarAlerts = (res.data.data || []).filter((a: any) => a.type === 'RPA_RADAR');
      setAlerts(radarAlerts);
    } catch (error) {
      toast.error('Erro na sincronização do radar');
    } finally {
      setLoading(false);
    }
  };

  const handleQualify = async (id: number) => {
    setQualifyingId(id);
    try {
      await api.post(`/api/alerts/${id}/qualify`);
      toast.success('Licitação enviada para Análise de IA!');
      fetchAlerts();
    } catch (error) {
      toast.error('Erro ao processar qualificação');
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
    <div className="p-8 w-full min-h-screen bg-background space-y-8 text-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Radar <span className="text-gradient-gold">RPA Strategy</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <ShieldCheck size={12} className="text-primary" />
            Monitoramento autônomo de portais oficiais e varredura de editais.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-xl border border-white/5">
          <Zap size={14} className="text-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Scan Active</span>
        </div>
      </header>

      <div className="platinum-card p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Objeto ou palavra-chave..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-background/50 border border-white/5 rounded-xl text-sm text-white focus:border-primary/30 outline-none transition-all placeholder:text-text-muted"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Órgão Licitante..." 
            value={agencyFilter}
            onChange={e => setAgencyFilter(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-background/50 border border-white/5 rounded-xl text-sm text-white focus:border-primary/30 outline-none transition-all placeholder:text-text-muted"
          />
        </div>
        <select 
          value={ufFilter}
          onChange={e => setUfFilter(e.target.value)}
          className="w-full px-4 py-3 bg-background/50 border border-white/5 rounded-xl text-sm text-white focus:border-primary/30 outline-none appearance-none"
        >
          <option value="" className="bg-surface">Todas as Regiões</option>
          {['SP', 'RJ', 'MG', 'DF', 'PR', 'SC', 'RS'].map(uf => (
            <option key={uf} value={uf} className="bg-surface">{uf}</option>
          ))}
        </select>
        <div className="relative">
          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="number" 
            placeholder="Valor Mínimo (R$)" 
            value={minValue}
            onChange={e => setMinValue(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-background/50 border border-white/5 rounded-xl text-sm text-white focus:border-primary/30 outline-none transition-all placeholder:text-text-muted"
          />
        </div>
      </div>

      <div className="platinum-card overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary opacity-40" />
            <p className="font-black uppercase tracking-[0.3em] text-[10px] text-text-muted">Interrogando Portais RPA...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Origem / Região</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Objeto Estratégico</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Valuation Estimado</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Sessão Pública</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-right">Estratégia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <Target size={40} className="text-primary" />
                        <p className="font-bold text-text-secondary uppercase tracking-widest text-xs">Nenhuma oportunidade detectada no radar</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map(alert => (
                    <tr key={alert.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-6">
                        <div className="font-bold text-white group-hover:text-primary transition-colors">{alert.raw_data.agency}</div>
                        <div className="flex items-center gap-2 text-[10px] text-text-muted uppercase tracking-widest mt-1">
                          <MapPin size={10} className="text-primary/60" />
                          {alert.raw_data.uf || 'Federal'}
                        </div>
                      </td>
                      <td className="px-6 py-6 max-w-md">
                        <div className="line-clamp-2 text-text-secondary font-medium leading-relaxed italic">{alert.raw_data.object}</div>
                        {alert.raw_data.notice_link && (
                          <a 
                            href={alert.raw_data.notice_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-2 px-2 py-1 bg-white/5 rounded border border-white/5 text-primary hover:bg-primary/10 transition-all text-[10px] font-black uppercase tracking-widest"
                          >
                            <ExternalLink size={10} /> Consultar Edital
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-white font-black tracking-tight text-base">
                            {alert.raw_data.estimated_value 
                              ? alert.raw_data.estimated_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                              : '---'}
                          </span>
                          <span className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Valor de Referência</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Clock size={12} className="text-primary/60" />
                          <span className="font-bold text-xs uppercase">
                            {alert.raw_data.opening_date 
                              ? new Date(alert.raw_data.opening_date).toLocaleDateString('pt-BR') 
                              : 'Imediato'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <button 
                          onClick={() => handleQualify(alert.id)}
                          disabled={qualifyingId === alert.id}
                          aria-label="Qualificar oportunidade para o pipeline"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-background font-black rounded-xl hover:bg-secondary-hover disabled:opacity-50 transition-all shadow-platinum-glow text-[10px] uppercase tracking-widest"
                        >
                          {qualifyingId === alert.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <>
                              <Target size={14} />
                              Qualificar
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
