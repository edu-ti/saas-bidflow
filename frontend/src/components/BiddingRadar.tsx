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

  const COLORS = ['var(--color-primary)', 'var(--color-info)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-danger)', 'var(--color-accent)'];

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
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Radar Dashboard
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Inteligência de Mercado e Mapeamento Estratégico de Oportunidades.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
          <Zap size={14} className="text-primary animate-pulse" />
          <span className="text-xs font-medium text-primary">Live Scan Ativo</span>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Target size={20} />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-medium text-text-secondary">Oportunidades Mapeadas (Mês)</h2>
            <div className="text-3xl font-semibold text-text-primary mt-1 tracking-tight">
              {loading ? '...' : alerts.length}
            </div>
          </div>
        </div>

        <div className="card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <DollarSign size={20} />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-medium text-text-secondary">Volume Financeiro Mapeado</h2>
            <div className="text-3xl font-semibold text-text-primary mt-1 tracking-tight">
              {loading ? '...' : formatCurrency(metrics.totalValue)}
            </div>
          </div>
        </div>

        <div className="card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center text-info">
              <BarChart3 size={20} />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-medium text-text-secondary">Top Portal</h2>
            <div className="text-2xl font-semibold text-text-primary mt-1 tracking-tight truncate" title={metrics.topPortal}>
              {loading ? '...' : metrics.topPortal}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Bar Chart: Volume UF */}
        <div className="card p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-text-primary mb-6">
            Volume de Licitações por Estado (UF)
          </h3>
          <div className="h-72 w-full mt-auto">
            {loading ? (
               <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-text-muted" size={24} /></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.ufChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                  <Tooltip 
                    cursor={{ fill: 'var(--color-bg-tertiary)', opacity: 0.5 }}
                    contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-primary)', boxShadow: 'var(--shadow-md)' }} 
                  />
                  <Bar dataKey="value" name="Licitações" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Donut Chart: Portais */}
        <div className="card p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-text-primary mb-6">
            Distribuição por Portal
          </h3>
          <div className="h-72 w-full mt-auto">
            {loading ? (
               <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-text-muted" size={24} /></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.portalChartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {metrics.portalChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-primary)', boxShadow: 'var(--shadow-md)' }} 
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'var(--color-text-secondary)' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
