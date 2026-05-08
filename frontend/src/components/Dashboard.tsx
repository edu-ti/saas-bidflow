import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, DollarSign, Target, Award, PieChart, Zap, ShieldCheck, Activity, Globe, ArrowUpRight, X, Loader2, Save } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import Modal from './ui/Modal';

type PipelineStat = {
  name: string;
  value: number;
  count: number;
  color: string;
};

type WinRate = {
  won: number;
  lost: number;
  rate: number;
};

type TopOrg = {
  name: string;
  total_value: number;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [pipeline, setPipeline] = useState<PipelineStat[]>([]);
  const [winRate, setWinRate] = useState<WinRate | null>(null);
  const [topOrgs, setTopOrgs] = useState<TopOrg[]>([]);
  const [loading, setLoading] = useState(true);

  // Goal modal state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);
  const [goalForm, setGoalForm] = useState({
    goal_type: 'global',
    target_id: '',
    uf: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    target_revenue: '',
    target_wins: '',
  });

  useEffect(() => {
    api.get('/api/dashboard/stats')
      .then(res => {
        setPipeline(res.data.pipeline || []);
        setWinRate(res.data.win_rate || { won: 0, lost: 0, rate: 0 });
        setTopOrgs(res.data.top_organizations || []);
      })
      .catch(err => console.error("Could not fetch stats", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGoal(true);
    try {
      await api.post('/api/goals', {
        ...goalForm,
        target_id: goalForm.target_id ? parseInt(goalForm.target_id) : null,
        target_revenue: parseFloat(goalForm.target_revenue) || 0,
        target_wins: parseInt(goalForm.target_wins as string) || 0,
      });
      toast.success('Meta estratégica definida com sucesso!');
      setIsGoalModalOpen(false);
      setGoalForm({
        goal_type: 'global', target_id: '', uf: '',
        month: new Date().getMonth() + 1, year: new Date().getFullYear(),
        target_revenue: '', target_wins: '',
      });
    } catch {
      toast.error('Erro ao salvar a meta.');
    } finally {
      setSavingGoal(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
      <div className="w-8 h-8 rounded-full border-2 border-border border-t-primary animate-spin" />
      <div className="text-sm text-text-muted font-medium">Carregando métricas...</div>
    </div>
  );

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

  const months = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' }, { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Visão Geral
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Métricas consolidadas de desempenho e oportunidades.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <button
             onClick={() => navigate('/reports-dashboard')}
             className="btn btn-outline text-xs"
           >
             <Activity size={14} /> Relatório Analítico
           </button>
           <button
             onClick={() => setIsGoalModalOpen(true)}
             className="btn btn-primary text-xs"
           >
             <Target size={14} /> Nova Meta
           </button>
        </div>
      </header>
      
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <Award size={20} />
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-md">
              <ArrowUpRight size={12} /> +12.4%
            </div>
          </div>
          <div>
            <h2 className="text-sm font-medium text-text-secondary">Taxa de Conversão</h2>
            <div className="text-3xl font-semibold text-text-primary mt-1 tracking-tight">{winRate?.rate}%</div>
          </div>
          <div className="flex items-center gap-4 text-xs mt-2 border-t border-border pt-4">
            <div>
              <span className="text-text-muted">Ganhos</span>
              <p className="font-semibold text-success text-sm">{winRate?.won}</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <span className="text-text-muted">Perdas</span>
              <p className="font-semibold text-danger text-sm">{winRate?.lost}</p>
            </div>
          </div>
        </div>

        <div className="card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <DollarSign size={20} />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-medium text-text-secondary">Volume no Funil</h2>
            <div className="text-3xl font-semibold text-text-primary mt-1 tracking-tight">
              {formatCurrency(pipeline.reduce((acc, curr) => acc + curr.value, 0))}
            </div>
          </div>
          <div className="mt-2 border-t border-border pt-4">
            <p className="text-xs text-text-muted">
              Total bruto das oportunidades ativas em estágio de qualificação.
            </p>
          </div>
        </div>

        <div className="card p-6 flex flex-col gap-4">
           <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center text-info">
              <PieChart size={20} />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-medium text-text-secondary">Oportunidades Ativas</h2>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-semibold text-text-primary tracking-tight">
                {pipeline.reduce((acc, curr) => acc + curr.count, 0)}
              </span>
              <span className="text-sm text-text-muted font-medium">unid.</span>
            </div>
          </div>
          <div className="mt-2 border-t border-border pt-4 flex flex-col justify-center">
             <div className="flex items-center gap-1 w-full">
               {pipeline.map((p, i) => (
                 <div key={i} className="h-1.5 rounded-full transition-all bg-primary" style={{ width: `${(p.count / pipeline.reduce((a,c) => a+c.count, 0)) * 100}%`, opacity: 1 - (i * 0.15) }} title={`${p.name}: ${p.count}`} />
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="card p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-text-primary mb-6">
            Evolução do Funil (Valuation)
          </h3>
          <div className="h-72 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pipeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                  tickFormatter={(val) => `R$ ${(val/1000)}k`}
                />
                <Tooltip 
                  cursor={{ stroke: 'var(--color-border-hover)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ 
                    backgroundColor: 'var(--color-bg-secondary)', 
                    border: '1px solid var(--color-border)', 
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-md)',
                    fontSize: '12px',
                    color: 'var(--color-text-primary)'
                  }} 
                  itemStyle={{ color: 'var(--color-primary)', fontWeight: 600 }}
                  formatter={(value: number) => [formatCurrency(value), 'Valuation']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--color-primary)" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-text-primary mb-6">
            Top Órgãos Licitantes
          </h3>
          <div className="h-72 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topOrgs} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" opacity={0.5} />
                <XAxis 
                  type="number" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                  tickFormatter={(val) => `R$ ${(val/1000)}k`}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={140} 
                  tick={{fontSize: 11, fill: 'var(--color-text-primary)'}} 
                />
                <Tooltip 
                  cursor={{ fill: 'var(--color-bg-tertiary)', opacity: 0.5 }}
                  contentStyle={{ 
                    backgroundColor: 'var(--color-bg-secondary)', 
                    border: '1px solid var(--color-border)', 
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-md)',
                    fontSize: '12px',
                    color: 'var(--color-text-primary)'
                  }}
                  itemStyle={{ color: 'var(--color-primary)', fontWeight: 600 }}
                  formatter={(value: number) => [formatCurrency(value), 'Oportunidade Total']}
                />
                <Bar 
                  dataKey="total_value" 
                  radius={[0, 4, 4, 0]} 
                  barSize={24}
                >
                  {topOrgs.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="var(--color-primary)" fillOpacity={1 - index * 0.15} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Goal Modal */}
      <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Definir Nova Meta Estratégica" size="md">
        <form onSubmit={handleSaveGoal} className="space-y-6 p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Tipo de Meta</label>
              <select
                value={goalForm.goal_type}
                onChange={e => setGoalForm({ ...goalForm, goal_type: e.target.value })}
                className="input"
              >
                <option value="global">Global (Empresa)</option>
                <option value="user">Por Usuário</option>
                <option value="supplier">Por Fornecedor</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">UF (opcional)</label>
              <input
                type="text"
                value={goalForm.uf}
                onChange={e => setGoalForm({ ...goalForm, uf: e.target.value.toUpperCase().slice(0, 2) })}
                className="input"
                placeholder="Ex: SP"
                maxLength={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Mês</label>
              <select
                value={goalForm.month}
                onChange={e => setGoalForm({ ...goalForm, month: parseInt(e.target.value) })}
                className="input"
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Ano</label>
              <input
                type="number"
                value={goalForm.year}
                onChange={e => setGoalForm({ ...goalForm, year: parseInt(e.target.value) })}
                className="input"
                min={2024}
                max={2030}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Receita Alvo (R$)</label>
              <input
                type="number"
                step="0.01"
                value={goalForm.target_revenue}
                onChange={e => setGoalForm({ ...goalForm, target_revenue: e.target.value })}
                className="input"
                placeholder="100000.00"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Vitórias Alvo</label>
              <input
                type="number"
                value={goalForm.target_wins}
                onChange={e => setGoalForm({ ...goalForm, target_wins: e.target.value })}
                className="input"
                placeholder="10"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setIsGoalModalOpen(false)} className="btn btn-outline">
              Cancelar
            </button>
            <button type="submit" disabled={savingGoal} className="btn btn-primary flex items-center gap-2">
              {savingGoal ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar Meta
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
