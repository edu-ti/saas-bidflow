import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Download, Calendar, TrendingUp, TrendingDown, Award, XCircle, Clock, DollarSign, Target, Users, Briefcase, ShoppingCart } from 'lucide-react';
import api from '../lib/axios';
import { useTheme } from '../context/ThemeContext';

type BiddingStats = {
  total: number;
  won: number;
  lost: number;
  pending: number;
  total_value: number;
  won_value: number;
};

type SalesStats = {
  total_leads: number;
  total_opportunities: number;
  won_opportunities: number;
  lost_opportunities: number;
  total_pipeline_value: number;
  won_value: number;
  conversion_rate: number;
};

type MonthlyData = {
  month: string;
  wins: number;
  losses: number;
  value: number;
};

type CategoryData = {
  name: string;
  value: number;
};

type StageData = {
  stage: string;
  value: number;
  count: number;
};

export default function Reports() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'bidding' | 'sales'>('bidding');
  const [biddingStats, setBiddingStats] = useState<BiddingStats | null>(null);
  const [salesStats, setSalesStats] = useState<SalesStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [stageData, setStageData] = useState<StageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('year');

  const isDark = theme === 'dark';

  useEffect(() => {
    fetchReportData();
  }, [dateRange, activeTab]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'bidding') {
        const [statsRes, monthlyRes, categoryRes, stageRes] = await Promise.all([
          api.get(`/api/reports/bidding-stats?range=${dateRange}`),
          api.get(`/api/reports/bidding-monthly?range=${dateRange}`),
          api.get(`/api/reports/bidding-categories?range=${dateRange}`),
          api.get(`/api/reports/bidding-stages?range=${dateRange}`)
        ]);
        
        setBiddingStats(statsRes.data);
        setMonthlyData(monthlyRes.data);
        setCategoryData(categoryRes.data);
        setStageData(stageRes.data);
      } else {
        const [statsRes, monthlyRes, categoryRes, stageRes] = await Promise.all([
          api.get(`/api/reports/sales-stats?range=${dateRange}`),
          api.get(`/api/reports/sales-monthly?range=${dateRange}`),
          api.get(`/api/reports/sales-categories?range=${dateRange}`),
          api.get(`/api/reports/sales-stages?range=${dateRange}`)
        ]);
        
        setSalesStats(statsRes.data);
        setMonthlyData(monthlyRes.data);
        setCategoryData(categoryRes.data);
        setStageData(stageRes.data);
      }
    } catch (error) {
      console.error("Error fetching reports", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const winRate = activeTab === 'bidding' 
    ? (biddingStats ? ((biddingStats.won / (biddingStats.won + biddingStats.lost)) * 100).toFixed(1) : '0')
    : (salesStats ? salesStats.conversion_rate.toFixed(1) : '0');

  const renderBiddingStatsCards = () => (
    <>
      <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total de Licitações</span>
          <div className="p-2 bg-blue-100 rounded-lg">
            <Award className="w-4 h-4 text-blue-600" />
          </div>
        </div>
        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{biddingStats?.total || 0}</p>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>no período selecionado</p>
      </div>

      <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Taxa de Acerto</span>
          <div className="p-2 bg-emerald-100 rounded-lg">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{winRate}%</p>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{biddingStats?.won || 0} ganha(s) / {biddingStats?.lost || 0} perdida(s)</p>
      </div>

      <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Valor Total</span>
          <div className="p-2 bg-purple-100 rounded-lg">
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
        </div>
        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatCurrency(biddingStats?.total_value || 0)}</p>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>em propostas submetidas</p>
      </div>

      <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Valor Ganho</span>
          <div className="p-2 bg-amber-100 rounded-lg">
            <TrendingDown className="w-4 h-4 text-amber-600" />
          </div>
        </div>
        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatCurrency(biddingStats?.won_value || 0)}</p>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>contratos fechados</p>
      </div>
    </>
  );

  const renderSalesStatsCards = () => (
    <>
      <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total de Leads</span>
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
        </div>
        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{salesStats?.total_leads || 0}</p>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>leads cadastrados</p>
      </div>

      <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Taxa de Conversão</span>
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{winRate}%</p>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>leads convertidos</p>
      </div>

      <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Valor do Pipeline</span>
          <div className="p-2 bg-purple-100 rounded-lg">
            <Briefcase className="w-4 h-4 text-purple-600" />
          </div>
        </div>
        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatCurrency(salesStats?.total_pipeline_value || 0)}</p>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>em oportunidades</p>
      </div>

      <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Valor Fechado</span>
          <div className="p-2 bg-amber-100 rounded-lg">
            <ShoppingCart className="w-4 h-4 text-amber-600" />
          </div>
        </div>
        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatCurrency(salesStats?.won_value || 0)}</p>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>vendas concluídas</p>
      </div>
    </>
  );

  const renderStatusSummary = () => {
    if (activeTab === 'bidding') {
      return (
        <>
          <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
              <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{biddingStats?.won || 0}</p>
              <p className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Ganhas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{biddingStats?.lost || 0}</p>
              <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>Perdidas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-full">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{biddingStats?.pending || 0}</p>
              <p className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>Em Andamento</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatCurrency(biddingStats?.won_value || 0)}</p>
              <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Receita Gerada</p>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
            <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{salesStats?.won_opportunities || 0}</p>
            <p className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Fechadas</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{salesStats?.lost_opportunities || 0}</p>
            <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>Perdidas</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-full">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{salesStats?.total_opportunities || 0}</p>
            <p className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>Em Aberto</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
            <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatCurrency(salesStats?.won_value || 0)}</p>
            <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Receita Gerada</p>
          </div>
        </div>
      </>
    );
  };

  const chartTitle = activeTab === 'bidding' ? 'Performance Mensal' : 'Vendas por Mês';
  const valueChartTitle = activeTab === 'bidding' ? 'Valor por Mês' : 'Faturamento Mensal';
  const categoryTitle = activeTab === 'bidding' ? 'Licitações por Categoria' : 'Vendas por Categoria';
  const stageTitle = activeTab === 'bidding' ? 'Valor por Etapa do Funil' : 'Por Etapa do Funil';
  const statusTitle = activeTab === 'bidding' ? 'Resumo de Status' : 'Resumo de Vendas';
  const subtitle = activeTab === 'bidding' ? 'Análise completa de performance de licitações' : 'Análise completa de performance de vendas';

  if (loading) {
    return (
      <div className={`p-8 flex items-center justify-center min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="animate-pulse text-slate-500">A carregar relatórios...</div>
      </div>
    );
  }

  return (
    <div className={`p-8 min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Relatórios & BI</h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <Calendar className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`bg-transparent text-sm font-medium outline-none ${isDark ? 'text-white' : 'text-slate-700'}`}
            >
              <option value="month">Este Mês</option>
              <option value="quarter">Este Trimestre</option>
              <option value="year">Este Ano</option>
              <option value="all">Todo o Período</option>
            </select>
          </div>
          
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      <div className={`mb-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('bidding')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'bidding' 
                ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Target className="w-4 h-4" />
            Licitações
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'sales' 
                ? 'border-purple-500 text-purple-600 dark:text-purple-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Vendas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {activeTab === 'bidding' ? renderBiddingStatsCards() : renderSalesStatsCards()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-700'}`}>{chartTitle}</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLosses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#e2e8f0"} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1e293b' : '#fff', 
                    border: isDark ? '1px solid #475569' : '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    color: isDark ? '#fff' : '#1e293b'
                  }} 
                />
                <Legend />
                <Bar dataKey="wins" name={activeTab === 'bidding' ? 'Ganhas' : 'Fechadas'} fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="losses" name={activeTab === 'bidding' ? 'Perdidas' : 'Perdidas'} fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-700'}`}>{valueChartTitle}</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#e2e8f0"} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} tickFormatter={(value) => `R$${value / 1000}k`} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1e293b' : '#fff', 
                    border: isDark ? '1px solid #475569' : '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    color: isDark ? '#fff' : '#1e293b'
                  }} 
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-700'}`}>{categoryTitle}</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1e293b' : '#fff', 
                    border: isDark ? '1px solid #475569' : '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    color: isDark ? '#fff' : '#1e293b'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`lg:col-span-2 p-6 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-700'}`}>{stageTitle}</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? "#334155" : "#e2e8f0"} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} tickFormatter={(value) => `R$${value / 1000}k`} />
                <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1e293b' : '#fff', 
                    border: isDark ? '1px solid #475569' : '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    color: isDark ? '#fff' : '#1e293b'
                  }} 
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-700'}`}>{statusTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {renderStatusSummary()}
        </div>
      </div>
    </div>
  );
}