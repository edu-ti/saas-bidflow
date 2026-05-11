import { useEffect, useState } from 'react';
import {
 LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
 BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import {
 LayoutDashboard, Target, TrendingUp, TrendingDown, DollarSign,
 Award, Calendar, Users, Loader2, FileText,
 MapPin, Truck, Settings, Download, FileSpreadsheet
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import GoalSettingsModal from '../GoalSettingsModal';
import { Select } from '../ui/Select';

type TabType = 'overview' | 'bidding' | 'sales' | 'suppliers' | 'team';

export default function ReportsDetailed() {
 const [activeTab, setActiveTab] = useState<TabType>('overview');
 const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
 const [year, setYear] = useState<number>(new Date().getFullYear());
 const [userId, setUserId] = useState<number | null>(null);
 const [supplierId, setSupplierId] = useState<number | null>(null);
 const [uf, setUf] = useState<string>('');
 
 const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

 const [data, setData] = useState<any>(null);
 const [users, setUsers] = useState<any[]>([]);
 const [suppliers, setSuppliers] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);

 const months = [
 { id: 1, name: 'Janeiro' }, { id: 2, name: 'Fevereiro' }, { id: 3, name: 'Março' },
 { id: 4, name: 'Abril' }, { id: 5, name: 'Maio' }, { id: 6, name: 'Junho' },
 { id: 7, name: 'Julho' }, { id: 8, name: 'Agosto' }, { id: 9, name: 'Setembro' },
 { id: 10, name: 'Outubro' }, { id: 11, name: 'Novembro' }, { id: 12, name: 'Dezembro' }
 ];

 const years = [2024, 2025, 2026];
 const ufs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

 useEffect(() => {
 api.get('/api/reports/users').then(res => setUsers(res.data)).catch(() => {});
 api.get('/api/reports/available-suppliers').then(res => setSuppliers(res.data)).catch(() => {});
 }, []);

 const fetchData = async () => {
 setLoading(true);
 try {
 const params = { month, year, user_id: userId, supplier_id: supplierId, uf };
 let endpoint = '';
 
 switch(activeTab) {
 case 'overview': endpoint = '/api/reports/overview'; break;
 case 'bidding': endpoint = '/api/reports/bidding'; break;
 case 'sales': endpoint = '/api/reports/sales'; break;
 case 'suppliers': endpoint = '/api/reports/suppliers'; break;
 case 'team': endpoint = '/api/reports/team-performance'; break;
 }

 const res = await api.get(endpoint, { params });
 setData(res.data);
 } catch (error) {
 toast.error('Erro ao carregar dados');
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => { fetchData(); }, [activeTab, month, year, userId, supplierId, uf]);

 const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

 const handleExport = async (type: 'pdf' | 'excel') => {
 const loadingToast = toast.loading(`Exportando para ${type.toUpperCase()}...`);
 try {
 const params = new URLSearchParams({ type, tab: activeTab, month: month.toString(), year: year.toString() });
 if (userId) params.append('user_id', userId.toString());
 if (supplierId) params.append('supplier_id', supplierId.toString());
 if (uf) params.append('uf', uf);

 const response = await api.get(`/api/reports/export?${params.toString()}`, { responseType: 'blob' });
 const url = window.URL.createObjectURL(new Blob([response.data]));
 const link = document.createElement('a');
 link.href = url;
 link.setAttribute('download', `relatorio_${activeTab}_${month}_${year}.${type === 'pdf' ? 'pdf' : 'csv'}`);
 document.body.appendChild(link);
 link.click();
 link.parentNode?.removeChild(link);
 toast.success('Exportado com sucesso!', { id: loadingToast });
 } catch {
 toast.error('Erro ao exportar', { id: loadingToast });
 }
 };

 return (
 <div className="space-y-8 animate-fade-in">
 {/* Filter Bar */}
 <div className="card p-5 flex flex-wrap items-center gap-6">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-primary/10 rounded-lg text-primary"><Calendar size={16} /></div>
 <div className="flex gap-3">
 <div className="flex flex-col gap-1">
 <span className="text-xs font-medium text-text-muted uppercase">Mês</span>
 <div className="min-w-[130px]">
 <Select value={month.toString()} onChange={v => setMonth(Number(v))} options={months.map(m => ({ value: m.id.toString(), label: m.name }))} />
 </div>
 </div>
 <div className="flex flex-col gap-1">
 <span className="text-xs font-medium text-text-muted uppercase">Ano</span>
 <div className="min-w-[100px]">
 <Select value={year.toString()} onChange={v => setYear(Number(v))} options={years.map(y => ({ value: y.toString(), label: y.toString() }))} />
 </div>
 </div>
 </div>
 </div>

 <div className="w-px h-8 bg-border" />

 <div className="flex items-center gap-3">
 <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Users size={16} /></div>
 <div className="flex flex-col gap-1">
 <span className="text-xs font-medium text-text-muted uppercase">Vendedor</span>
 <div className="min-w-[180px]">
 <Select value={userId?.toString() || ''} onChange={v => setUserId(v ? Number(v) : null)} options={[{ value: '', label: 'Todos' },...users.map(u => ({ value: u.id.toString(), label: u.name }))]} />
 </div>
 </div>
 </div>

 <div className="w-px h-8 bg-border" />

 <div className="flex items-center gap-3">
 <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Truck size={16} /></div>
 <div className="flex flex-col gap-1">
 <span className="text-xs font-medium text-text-muted uppercase">Fornecedor</span>
 <div className="min-w-[180px]">
 <Select value={supplierId?.toString() || ''} onChange={v => setSupplierId(v ? Number(v) : null)} options={[{ value: '', label: 'Todos' },...suppliers.map(s => ({ value: s.id.toString(), label: s.name }))]} />
 </div>
 </div>
 </div>

 <div className="w-px h-8 bg-border" />

 <div className="flex items-center gap-3">
 <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><MapPin size={16} /></div>
 <div className="flex flex-col gap-1">
 <span className="text-xs font-medium text-text-muted uppercase">Estado (UF)</span>
 <div className="min-w-[140px]">
 <Select value={uf} onChange={v => setUf(v)} options={[{ value: '', label: 'Todos' },...ufs.map(u => ({ value: u, label: u }))]} />
 </div>
 </div>
 </div>

 <div className="ml-auto flex gap-2">
 <button onClick={() => setIsGoalModalOpen(true)} className="btn btn-outline text-xs"><Settings size={14} /> Metas</button>
 <button onClick={() => handleExport('excel')} className="btn btn-outline text-xs"><FileSpreadsheet size={14} /> Excel</button>
 <button onClick={() => handleExport('pdf')} className="btn btn-outline text-xs"><FileText size={14} /> PDF</button>
 </div>
 </div>

 {/* Sub-tabs */}
 <div className="flex gap-2 p-1 bg-bg-tertiary/50 border border-border rounded-xl w-fit">
 {[
 { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
 { id: 'bidding', label: 'Licitações', icon: Target },
 { id: 'sales', label: 'Vendas', icon: DollarSign },
 { id: 'suppliers', label: 'Fornecedores', icon: Truck },
 { id: 'team', label: 'Equipe', icon: Users }
 ].map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id as TabType)}
 className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
 activeTab === tab.id ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
 }`}
 >
 <tab.icon size={14} />
 {tab.label}
 </button>
 ))}
 </div>

 {loading ? (
 <div className="flex flex-col items-center justify-center py-24 gap-4">
 <Loader2 className="w-10 h-10 animate-spin text-primary opacity-30" />
 <span className="text-sm text-text-muted">Processando dados...</span>
 </div>
 ) : (
 <div className="space-y-8 animate-fade-in">
 
 {/* Overview */}
 {activeTab === 'overview' && (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 {[
 { label: 'Faturamento Realizado', val: formatCurrency(data?.revenue), icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10', progress: data?.revenue_progress },
 { label: 'Contratos / Vitórias', val: data?.won_opportunities || 0, icon: Award, color: 'text-primary', bg: 'bg-primary/10', progress: data?.wins_progress },
 { label: 'Win Rate Global', val: `${(data?.win_rate || 0).toFixed(1)}%`, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10', progress: (data?.win_rate || 0) / 0.7 },
 { label: 'Oportunidades Ativas', val: data?.total_opportunities || 0, icon: Target, color: 'text-amber-500', bg: 'bg-amber-500/10', progress: data?.total_opportunities },
 ].map((kpi, i) => (
 <div key={i} className="card p-5 flex flex-col gap-4 group hover:border-primary/30 transition-all">
 <div className="flex justify-between items-start">
 <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
 <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
 </div>
 <div className="flex items-center gap-1 text-xs font-semibold">
 <TrendingUp size={12} className={kpi.progress >= 100 ? 'text-emerald-500' : 'text-amber-500'} />
 <span className={kpi.progress >= 100 ? 'text-emerald-500' : 'text-amber-500'}>{kpi.progress}%</span>
 </div>
 </div>
 <div>
 <p className="text-xs font-medium text-text-secondary">{kpi.label}</p>
 <p className="text-2xl font-bold text-text-primary mt-1">{kpi.val}</p>
 </div>
 <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
 <div className={`h-full transition-all duration-1000 ${kpi.progress >= 100 ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${Math.min(kpi.progress, 100)}%` }} />
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Bidding */}
 {activeTab === 'bidding' && (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <div className="lg:col-span-2 card p-6">
 <h3 className="text-sm font-semibold text-text-primary mb-6">Distribuição de Risco Licitatório</h3>
 <div className="h-72">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie data={[
 { name: 'Ganhas', value: data?.won || 0 },
 { name: 'Perdidas', value: data?.lost || 0 },
 { name: 'Em Aberto', value: (data?.total || 0) - (data?.won || 0) - (data?.lost || 0) }
 ]} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
 <Cell fill="var(--color-primary)" />
 <Cell fill="#ef4444" />
 <Cell fill="var(--color-border)" />
 </Pie>
 <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }} />
 <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
 </PieChart>
 </ResponsiveContainer>
 </div>
 </div>

 <div className="card p-6">
 <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
 <TrendingDown size={16} className="text-danger" /> Motivos de Perda
 </h3>
 <div className="space-y-3">
 {(data?.loss_analysis || []).length > 0 ? (data?.loss_analysis || []).map((item: any, i: number) => (
 <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border group hover:border-danger/30 transition-all">
 <span className="text-xs font-medium text-text-muted">{item.loss_reason || 'Outros'}</span>
 <div className="flex items-center gap-2">
 <span className="text-sm font-bold text-text-primary">{item.count}</span>
 <div className="w-12 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
 <div className="h-full bg-danger" style={{ width: `${Math.min((item.count/data?.total)*100, 100)}%` }} />
 </div>
 </div>
 </div>
 )) : (
 <div className="py-12 text-center text-sm text-text-muted">Nenhuma perda registrada</div>
 )}
 </div>
 </div>
 </div>
 )}

 {/* Suppliers */}
 {activeTab === 'suppliers' && (
 <div className="card overflow-hidden">
 <div className="p-5 border-b border-border flex items-center gap-3">
 <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Truck size={16} /></div>
 <h3 className="text-sm font-semibold text-text-primary">Ranking de Performance por Fornecedor</h3>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm">
 <thead>
 <tr className="border-b border-border bg-bg-tertiary/30">
 <th className="px-5 py-3 text-xs font-medium text-text-muted">Fornecedor</th>
 <th className="px-5 py-3 text-xs font-medium text-text-muted text-center">Total</th>
 <th className="px-5 py-3 text-xs font-medium text-text-muted text-center">Vitórias</th>
 <th className="px-5 py-3 text-xs font-medium text-text-muted text-right">Faturamento</th>
 <th className="px-5 py-3 text-xs font-medium text-text-muted text-center">Eficiência</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {data && Array.isArray(data) && data.map((item: any, i: number) => (
 <tr key={i} className="hover:bg-bg-tertiary/20 transition-colors">
 <td className="px-5 py-3 font-medium text-text-primary">{item.supplier_name}</td>
 <td className="px-5 py-3 text-center text-text-secondary">{item.total_opps}</td>
 <td className="px-5 py-3 text-center text-success font-semibold">{item.wins}</td>
 <td className="px-5 py-3 text-right font-medium text-text-primary">{formatCurrency(item.revenue)}</td>
 <td className="px-5 py-3">
 <div className="flex items-center justify-center gap-2">
 <div className="w-16 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
 <div className="h-full bg-primary" style={{ width: `${Math.min((item.wins/item.total_opps)*100, 100)}%` }} />
 </div>
 <span className="text-xs font-semibold text-primary">{((item.wins/item.total_opps)*100).toFixed(1)}%</span>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* Team */}
 {activeTab === 'team' && (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {data && Array.isArray(data) && data.map((user: any, i: number) => (
 <div key={i} className="card p-5 space-y-4 group hover:border-primary/30 transition-all">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-full bg-bg-tertiary border border-border overflow-hidden">
 <img src={`https://ui-avatars.com/api/?name=${user.user_name}&background=random`} alt={user.user_name} className="w-full h-full rounded-full" />
 </div>
 <div>
 <h4 className="text-sm font-semibold text-text-primary">{user.user_name}</h4>
 <span className="text-xs text-text-muted">Consultor</span>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div className="p-3 bg-bg-tertiary/30 rounded-lg">
 <p className="text-xs text-text-muted mb-0.5">Vitórias</p>
 <p className="text-lg font-bold text-success">{user.won_count}</p>
 </div>
 <div className="p-3 bg-bg-tertiary/30 rounded-lg">
 <p className="text-xs text-text-muted mb-0.5">Win Rate</p>
 <p className="text-lg font-bold text-primary">{user.win_rate}%</p>
 </div>
 </div>
 <div>
 <div className="flex justify-between text-xs mb-1.5">
 <span className="text-text-muted">Volume Total</span>
 <span className="font-semibold text-text-primary">{formatCurrency(user.won_value)}</span>
 </div>
 <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
 <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${Math.min(user.win_rate, 100)}%` }} />
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 <GoalSettingsModal 
 isOpen={isGoalModalOpen} 
 onClose={() => { setIsGoalModalOpen(false); fetchData(); }} 
 />
 </div>
 );
}
