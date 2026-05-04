import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ShieldCheck, Zap, MapPin, ExternalLink, Loader2, Target, DollarSign, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import toast from 'react-hot-toast';
import api from '../lib/axios';

interface BiddingAlert {
  id: number;
  raw_data: {
    agency: string;
    object: string;
    estimated_value?: number;
    opening_date?: string;
    notice_link?: string;
    uf?: string;
  };
}

export default function BiddingRadar() {
  const [alerts, setAlerts] = useState<BiddingAlert[]>([]);
  const [loading, setLoading] = useState(true);

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

  const PLATINUM_COLORS = ['#6366f1', '#14b8a6', '#8b5cf6', '#3b82f6', '#ec4899', '#f43f5e'];

  // Metrics Calculation
  const metrics = useMemo(() => {
    let totalValue = 0;
    const ufCount: Record<string, number> = {};
    const portalCount: Record<string, number> = {};

    alerts.forEach(alert => {
      totalValue += alert.raw_data.estimated_value || 0;
      
      const uf = alert.raw_data.uf || 'ND';
      ufCount[uf] = (ufCount[uf] || 0) + 1;

      const portal = alert.raw_data.agency || 'Desconhecido';
      portalCount[portal] = (portalCount[portal] || 0) + 1;
    });

    const topPortal = Object.keys(portalCount).reduce((a, b) => portalCount[a] > portalCount[b] ? a : b, 'N/A');

    const ufChartData = Object.entries(ufCount).map(([name, value]) => ({ name, value }));
    const portalChartData = Object.entries(portalCount).map(([name, value]) => ({ name, value })).slice(0, 6); // Top 6

    return { totalValue, topPortal, ufChartData, portalChartData };
  }, [alerts]);

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Radar <span className="text-gradient-gold">Dashboard</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <ShieldCheck size={14} className="text-primary" />
            Inteligência de Mercado e Mapeamento Estratégico de Oportunidades.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-surface-elevated/10 backdrop-blur-xl px-8 py-4 rounded-2xl border border-primary/20 shadow-platinum-glow-sm">
          <Zap size={18} className="text-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Live Scan Active</span>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="platinum-card p-10 flex flex-col gap-6 group hover:border-primary/40 transition-all relative overflow-hidden bg-surface-elevated/10 backdrop-blur-xl">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-border-subtle flex items-center justify-center shadow-platinum-glow-sm group-hover:scale-110 transition-transform duration-500">
            <Target className="w-7 h-7 text-primary" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted opacity-60">Oportunidades Mapeadas (Mês)</p>
            <p className="text-3xl font-black text-text-primary mt-2 tracking-tighter group-hover:text-primary transition-colors">{loading ? '...' : alerts.length}</p>
          </div>
        </div>

        <div className="platinum-card p-10 flex flex-col gap-6 group hover:border-emerald-500/40 transition-all relative overflow-hidden bg-surface-elevated/10 backdrop-blur-xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-border-subtle flex items-center justify-center shadow-platinum-glow-sm group-hover:scale-110 transition-transform duration-500">
            <DollarSign className="w-7 h-7 text-emerald-500" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted opacity-60">Volume Financeiro Mapeado (R$)</p>
            <p className="text-3xl font-black text-text-primary mt-2 tracking-tighter group-hover:text-emerald-500 transition-colors">{loading ? '...' : formatCurrency(metrics.totalValue)}</p>
          </div>
        </div>

        <div className="platinum-card p-10 flex flex-col gap-6 group hover:border-blue-500/40 transition-all relative overflow-hidden bg-surface-elevated/10 backdrop-blur-xl">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-border-subtle flex items-center justify-center shadow-platinum-glow-sm group-hover:scale-110 transition-transform duration-500">
            <BarChart3 className="w-7 h-7 text-blue-500" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted opacity-60">Top Portal</p>
            <p className="text-2xl font-black text-text-primary mt-2 tracking-tighter group-hover:text-blue-500 transition-colors truncate" title={metrics.topPortal}>{loading ? '...' : metrics.topPortal}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Bar Chart: Volume UF */}
        <div className="platinum-card p-10 space-y-10 bg-surface-elevated/10 backdrop-blur-xl">
          <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.4em] flex items-center gap-4 border-b border-border-subtle/30 pb-6">
             <MapPin size={16} className="text-primary" /> Volume de Licitações por Estado (UF)
          </h3>
          <div className="h-[300px] w-full">
            {loading ? (
               <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-primary opacity-50" size={32} /></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.ufChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" opacity={0.3} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 900 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 900 }} />
                  <Tooltip 
                    cursor={{ fill: 'var(--color-surface-elevated)', opacity: 0.2 }}
                    contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-medium)', borderRadius: '16px', fontSize: '11px', fontWeight: 'black', textTransform: 'uppercase', color: 'var(--color-text-primary)' }} 
                  />
                  <Bar dataKey="value" name="Licitações" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Donut Chart: Portais */}
        <div className="platinum-card p-10 space-y-10 bg-surface-elevated/10 backdrop-blur-xl">
          <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.4em] flex items-center gap-4 border-b border-border-subtle/30 pb-6">
             <PieChartIcon size={16} className="text-primary" /> Distribuição por Portal
          </h3>
          <div className="h-[300px] w-full">
            {loading ? (
               <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-primary opacity-50" size={32} /></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.portalChartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {metrics.portalChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PLATINUM_COLORS[index % PLATINUM_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-medium)', borderRadius: '16px', fontSize: '11px', fontWeight: 'black', textTransform: 'uppercase', color: 'var(--color-text-primary)' }} 
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', opacity: 0.7 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
