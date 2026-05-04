import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Filter,
  TrendingUp,
  MapPin,
  Building2,
  Users,
  Calendar,
  DollarSign,
  ChevronDown,
  BarChart3,
  PieChart
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const monthlyData = [
  { month: 'Jan', value: 45000000 },
  { month: 'Fev', value: 52000000 },
  { month: 'Mar', value: 48000000 },
  { month: 'Abr', value: 61000000 },
  { month: 'Mai', value: 55000000 },
  { month: 'Jun', value: 72000000 },
  { month: 'Jul', value: 68000000 },
  { month: 'Ago', value: 75000000 },
  { month: 'Set', value: 82000000 },
  { month: 'Out', value: 79000000 },
  { month: 'Nov', value: 88000000 },
  { month: 'Dez', value: 95000000 }
];

const ufData = [
  { uf: 'SP', percentage: 28 },
  { uf: 'MG', percentage: 15 },
  { uf: 'RS', percentage: 12 },
  { uf: 'PR', percentage: 10 },
  { uf: 'RJ', percentage: 9 },
  { uf: 'DF', percentage: 8 },
  { uf: 'BA', percentage: 6 },
  { uf: 'SC', percentage: 5 },
  { uf: 'GO', percentage: 4 },
  { uf: 'PE', percentage: 3 }
];

const modalityData = [
  { modality: 'Pregão Eletrônico', percentage: 65 },
  { modality: 'Dispensa', percentage: 18 },
  { modality: 'Inexigibilidade', percentage: 8 },
  { modality: 'Concorrência', percentage: 5 },
  { modality: 'Tomada de Preços', percentage: 4 }
];

const topOrgs = [
  { name: 'Ministério da Educação', count: 1245, value: 450000000 },
  { name: 'Ministério da Saúde', count: 987, value: 380000000 },
  { name: 'Governo do Estado de SP', count: 856, value: 290000000 },
  { name: 'Prefeitura de São Paulo', count: 734, value: 210000000 },
  { name: 'Universidade Federal', count: 612, value: 180000000 }
];

const topSuppliers = [
  { name: 'Empresa Alpha Ltda', wins: 156, value: 45000000 },
  { name: 'Beta Serviços S/A', wins: 134, value: 38000000 },
  { name: 'Gamma Construções', wins: 98, value: 29000000 },
  { name: 'Delta Informática', wins: 87, value: 21000000 },
  { name: 'Epsilon Serviços', wins: 76, value: 18000000 }
];

const recentBiddings = [
  { id: '2024/001', location: 'São Paulo - SP', agency: 'Prefeitura Municipal', date: '04/05/2024', value: 2500000 },
  { id: '2024/002', location: 'Belo Horizonte - MG', agency: 'Governo do Estado', date: '03/05/2024', value: 5800000 },
  { id: '2024/003', location: 'Rio de Janeiro - RJ', agency: 'Ministério da Educação', date: '02/05/2024', value: 3200000 },
  { id: '2024/004', location: 'Brasília - DF', agency: 'Ministério da Saúde', date: '01/05/2024', value: 12000000 },
  { id: '2024/005', location: 'Curitiba - PR', agency: 'Universidade Federal', date: '30/04/2024', value: 1800000 }
];

function formatCurrency(value: number) {
  if (value >= 1000000000) return `R$ ${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(0)}M`;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}K`;
  return `R$ ${value}`;
}

export default function MarketAnalysis() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [period, setPeriod] = useState('12months');

  return (
    <div className="min-h-screen flex gap-8 animate-in fade-in duration-700">
      <aside className="w-80 flex-shrink-0 space-y-6">
        <div className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-3xl p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
            <button
              onClick={() => navigate('/bidding-hub')}
              className="w-10 h-10 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 hover:ring-2 hover:ring-primary/20 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-primary">
              Filtros
            </h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                Palavra-chave / Objeto
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Ex: serviços de limpeza..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-surface-elevated/50 border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                Período de Análise
              </label>
              <div className="relative">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-elevated/50 border border-border-subtle rounded-xl text-sm text-text-primary appearance-none focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="3months">Últimos 3 meses</option>
                  <option value="6months">Últimos 6 meses</option>
                  <option value="12months">Últimos 12 meses</option>
                  <option value="24months">Últimos 24 meses</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>

            <button className="w-full btn-primary py-4 flex items-center justify-center gap-3 mt-4">
              <Filter size={18} />
              Filtrar Dados
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 space-y-6">
        <header className="flex items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <TrendingUp size={24} className="text-primary" />
              <h1 className="text-2xl font-black tracking-tighter text-text-primary">
                Análise de <span className="text-gradient-gold">Mercado</span>
              </h1>
            </div>
            <p className="text-sm font-medium text-text-muted">
              Dashboard de compras públicas e tendências de mercado
            </p>
          </div>
        </header>

        <div className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 size={18} className="text-primary" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-primary">
              Total de Compras Públicas (Em R$)
            </h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--color-surface-elevated)', opacity: 0.2 }}
                  contentStyle={{ 
                    backgroundColor: 'var(--color-surface)', 
                    border: '1px solid var(--color-border-medium)', 
                    borderRadius: '16px', 
                    fontSize: '11px', 
                    fontWeight: 'bold', 
                    textTransform: 'uppercase' 
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Valor']}
                />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <MapPin size={18} className="text-primary" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-primary">
                Licitações por Região
              </h2>
            </div>
            <div className="space-y-3">
              {ufData.map((item, idx) => (
                <div key={item.uf} className="flex items-center gap-4">
                  <span className="text-xs font-bold text-text-muted w-6">{idx + 1}</span>
                  <span className="text-sm font-bold text-text-primary w-8">{item.uf}</span>
                  <div className="flex-1 h-2 bg-surface-elevated rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-text-muted w-10 text-right">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <PieChart size={18} className="text-primary" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-primary">
                Licitações por Modalidade
              </h2>
            </div>
            <div className="space-y-3">
              {modalityData.map((item, idx) => (
                <div key={item.modality} className="flex items-center gap-4">
                  <span className="text-xs font-bold text-text-muted w-6">{idx + 1}</span>
                  <span className="text-sm font-medium text-text-primary flex-1">{item.modality}</span>
                  <div className="flex-1 h-2 bg-surface-elevated rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-secondary to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-text-muted w-10 text-right">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Building2 size={18} className="text-primary" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-primary">
                Maiores Órgãos Públicos
              </h2>
            </div>
            <div className="space-y-4">
              {topOrgs.map((org, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-surface-elevated/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-primary/20 text-primary text-xs font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-text-primary">{org.name}</p>
                      <p className="text-[10px] text-text-muted">{org.count} licitações</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">{formatCurrency(org.value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users size={18} className="text-primary" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-primary">
                Principais Concorrentes
              </h2>
            </div>
            <div className="space-y-4">
              {topSuppliers.map((supplier, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-surface-elevated/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-secondary/20 text-secondary text-xs font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-text-primary">{supplier.name}</p>
                      <p className="text-[10px] text-text-muted">{supplier.wins} vitórias</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">{formatCurrency(supplier.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-3xl overflow-hidden">
          <div className="p-6 pb-4 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-primary" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-primary">
                Resultados Recentes
              </h2>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-wider text-text-muted">ID</th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Local</th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Órgão</th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Data</th>
                <th className="text-right px-6 py-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Valor</th>
              </tr>
            </thead>
            <tbody>
              {recentBiddings.map((bid) => (
                <tr key={bid.id} className="border-b border-border-subtle/50 hover:bg-surface-elevated/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-text-muted">{bid.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-text-primary">{bid.location}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-text-secondary">{bid.agency}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-muted">{bid.date}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-emerald-400">{formatCurrency(bid.value)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}