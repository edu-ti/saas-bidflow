import { useState, useEffect } from 'react';
import { Search, Filter, Target, ExternalLink, Loader2, CheckCircle, Lock, ShieldCheck, Zap, MapPin, DollarSign, Clock } from 'lucide-react';
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
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Radar <span className="text-gradient-gold">RPA Strategy</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <ShieldCheck size={14} className="text-primary" />
            Monitoramento autônomo de portais oficiais e varredura de editais Platinum.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-surface-elevated/10 backdrop-blur-xl px-8 py-4 rounded-2xl border border-primary/20 shadow-platinum-glow-sm">
          <Zap size={18} className="text-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Live Scan Active</span>
        </div>
      </header>

      <div className="platinum-card p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 bg-surface-elevated/10 backdrop-blur-xl shrink-0">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Objeto ou palavra-chave..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-background/50 border border-border-subtle rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum"
          />
        </div>
        <div className="relative group">
          <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Órgão Licitante..." 
            value={agencyFilter}
            onChange={e => setAgencyFilter(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-background/50 border border-border-subtle rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum"
          />
        </div>
        <div className="relative group">
           <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
           <select 
            value={ufFilter}
            onChange={e => setUfFilter(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-background/50 border border-border-subtle rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none appearance-none cursor-pointer shadow-inner-platinum"
          >
            <option value="" className="bg-surface font-bold text-text-primary">Todas as Regiões</option>
            {['SP', 'RJ', 'MG', 'DF', 'PR', 'SC', 'RS'].map(uf => (
              <option key={uf} value={uf} className="bg-surface font-bold text-text-primary">{uf}</option>
            ))}
          </select>
        </div>
        <div className="relative group">
          <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
          <input 
            type="number" 
            placeholder="Valor Mínimo (R$)" 
            value={minValue}
            onChange={e => setMinValue(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-background/50 border border-border-subtle rounded-2xl text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum font-mono"
          />
        </div>
      </div>

      <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md flex-1">
        {loading ? (
          <div className="p-40 flex flex-col items-center justify-center gap-6">
            <Loader2 className="w-16 h-16 animate-spin text-primary opacity-40" />
            <p className="font-black uppercase tracking-[0.5em] text-[10px] text-text-muted animate-pulse">Interrogando Portais RPA Strategy...</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-platinum">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-elevated/30 border-b border-border-subtle">
                <tr>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Origem / Região</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Objeto Estratégico</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Valuation Estimado</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Sessão Pública</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted text-right opacity-60">Estratégia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/30">
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center gap-6 opacity-20">
                        <Target size={56} className="text-primary" />
                        <p className="font-black text-text-primary uppercase tracking-[0.4em] text-[10px]">Nenhuma oportunidade detectada no radar</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map(alert => (
                    <tr key={alert.id} className="hover:bg-surface-elevated/20 transition-all group border-b border-border-subtle/20 duration-300">
                      <td className="px-10 py-8">
                        <div className="font-black text-text-primary group-hover:text-primary transition-colors uppercase tracking-tight text-xs">{alert.raw_data.agency}</div>
                        <div className="flex items-center gap-2 text-[9px] text-text-muted font-black mt-2 uppercase tracking-widest opacity-60">
                          <MapPin size={12} className="text-primary/60" />
                          {alert.raw_data.uf || 'Abrangência Federal'}
                        </div>
                      </td>
                      <td className="px-10 py-8 max-w-md">
                        <div className="line-clamp-2 text-text-secondary font-bold text-xs leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity">"{alert.raw_data.object}"</div>
                        {alert.raw_data.notice_link && (
                          <a 
                            href={alert.raw_data.notice_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-surface-elevated/40 rounded-xl border border-border-subtle text-primary hover:bg-primary/10 hover:scale-105 transition-all text-[9px] font-black uppercase tracking-widest shadow-platinum-glow-sm"
                          >
                            <ExternalLink size={12} /> Consultar Edital Completo
                          </a>
                        )}
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-col gap-1">
                          <span className="text-text-primary font-black tracking-tighter text-sm group-hover:text-primary transition-colors">
                            {alert.raw_data.estimated_value 
                              ? alert.raw_data.estimated_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                              : '---'}
                          </span>
                          <span className="text-[8px] text-text-muted uppercase font-black tracking-[0.3em] opacity-40">Benchmark Financeiro</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-3 text-text-secondary">
                          <Clock size={14} className="text-primary/60" />
                          <span className="font-black text-[10px] uppercase tracking-widest">
                            {alert.raw_data.opening_date 
                              ? new Date(alert.raw_data.opening_date).toLocaleDateString('pt-BR') 
                              : 'Imediato / Aberto'}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <button 
                          onClick={() => handleQualify(alert.id)}
                          disabled={qualifyingId === alert.id}
                          className="inline-flex items-center gap-3 px-8 py-4 bg-secondary text-background font-black rounded-2xl hover:bg-secondary-hover disabled:opacity-30 transition-all shadow-platinum-glow text-[10px] uppercase tracking-widest group-hover:scale-110"
                        >
                          {qualifyingId === alert.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <>
                              <Target size={16} />
                              Qualificar Missão
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
