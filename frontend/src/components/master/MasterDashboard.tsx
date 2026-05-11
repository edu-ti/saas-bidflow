import React from 'react';
import { 
 Building2, Users, DollarSign, Activity, Zap, Globe, ShieldCheck, 
 Sparkles, TrendingUp, BarChart3, ArrowUpRight, Upload, Camera, 
 AlertTriangle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

export default function MasterDashboard() {
 const [logo, setLogo] = React.useState<string>(localStorage.getItem('company_logo') || '');
 const [stats, setStats] = React.useState<any>(null);
 const [loading, setLoading] = React.useState(true);

 React.useEffect(() => {
 const fetchStats = async () => {
 try {
 const response = await api.get('/api/master/stats');
 setStats(response.data);
 } catch (err) {
 toast.error('Erro ao carregar métricas globais.');
 } finally {
 setLoading(false);
 }
 };
 fetchStats();
 }, []);

 const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (file) {
 const reader = new FileReader();
 reader.onloadend = () => {
 const base64 = reader.result as string;
 setLogo(base64);
 localStorage.setItem('company_logo', base64);
 window.dispatchEvent(new Event('storage'));
 toast.success('Logotipo do sistema atualizado com sucesso!');
 };
 reader.readAsDataURL(file);
 }
 };

 const cards = [
 { title: 'Total de Empresas', value: stats?.total_companies?.value || '0', sub: 'empresas na base', icon: Building2, color: 'primary', trend: stats?.total_companies?.trend || '0%' },
 { title: 'Total de Usuários', value: stats?.total_users?.value || '0', sub: 'em toda a plataforma', icon: Users, color: 'accent', trend: stats?.total_users?.trend || '0%' },
 { title: 'MRR Atual', value: stats?.mrr?.value || 'R$ 0,00', sub: 'Receita recorrente', icon: DollarSign, color: 'emerald', trend: stats?.mrr?.trend || '0%' },
 { title: 'Novos Leads (30d)', value: stats?.new_companies_30d?.value || '0', sub: 'últimos 30 dias', icon: TrendingUp, color: 'amber', trend: stats?.new_companies_30d?.trend || '0%' }
 ];

 return (
 <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
 <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shrink-0">
 <div className="space-y-1">
 <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
 Dashboard <span className="text-primary">Master</span>
 </h1>
 <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
 <Globe size={14} className="text-primary" />
 Visão geral da infraestrutura e métricas globais de governança.
 </p>
 </div>
 <div className="flex items-center gap-5 bg-bg-tertiary/20 border border-border/30 p-5 rounded-2xl backdrop-blur-md">
 <div className="flex flex-col items-end gap-1">
 <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary italic">Status Global</span>
 <span className="text-xs font-semibold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md">{stats?.infrastructure?.status || 'Sistema Nominal'}</span>
 </div>
 <div className="w-px h-10 bg-border-subtle/30" />
 <Zap className="text-primary w-6 h-6 animate-pulse " />
 </div>
 </header>

 {/* Alerta de Inadimplência se houver */}
 {stats?.overdue_count > 0 && (
 <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-6 animate-pulse">
 <div className="p-3 bg-red-500/20 rounded-xl">
 <AlertTriangle className="text-red-500" size={24} />
 </div>
 <div>
 <h4 className="text-sm font-semibold text-red-500 uppercase tracking-widest">Alerta de Inadimplência</h4>
 <p className="text-xs text-text-secondary font-medium">Existem **{stats.overdue_count} empresas** com status suspenso ou atrasado. Verifique a lista de tenants.</p>
 </div>
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
 {cards.map((card, idx) => (
 <div key={idx} className="card p-8 space-y-6 bg-bg-tertiary/10 backdrop-blur-md border-border/30 group hover:scale-[1.02] transition-all duration-500">
 <div className="flex items-center justify-between">
 <div className={`p-3 bg-${card.color === 'primary' ? 'primary' : card.color === 'emerald' ? 'emerald-500' : card.color === 'amber' ? 'amber-500' : 'accent'}/10 rounded-2xl border border-${card.color === 'primary' ? 'primary' : card.color === 'emerald' ? 'emerald-500' : card.color === 'amber' ? 'amber-500' : 'accent'}/20 group-hover:scale-110 transition-transform`}>
 <card.icon className={`w-6 h-6 text-${card.color === 'primary' ? 'primary' : card.color === 'emerald' ? 'emerald-500' : card.color === 'amber' ? 'amber-500' : 'accent'}`} />
 </div>
 <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-xs font-semibold text-emerald-500 ">
 <ArrowUpRight size={10} /> {card.trend}
 </div>
 </div>
 <div className="space-y-1">
 <h3 className="text-xs font-semibold text-text-secondary uppercase ">{card.title}</h3>
 <p className="text-3xl font-semibold text-text-primary tracking-tight group-hover:text-primary transition-colors">{card.value}</p>
 </div>
 <div className="pt-4 border-t border-border/20">
 <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest flex items-center gap-2">
 <Activity size={12} className="text-primary" /> {card.sub}
 </p>
 </div>
 </div>
 ))}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-2 card p-10 bg-bg-tertiary/10 backdrop-blur-md border-border/30 flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden group">
 <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:scale-110 group-hover:rotate-6 transition-transform duration-1000">
 <BarChart3 size={240} className="text-primary" />
 </div>
 
 <div className="flex flex-col items-center gap-8 relative z-10">
 <div className="w-20 h-20 rounded-xl bg-bg-tertiary flex items-center justify-center border border-border animate-pulse">
 <Sparkles size={40} className="text-primary " />
 </div>
 <div className="text-center space-y-3">
 <h3 className="text-sm font-semibold text-text-primary uppercase ">Motor de Análise Preditiva</h3>
 <p className="text-sm text-text-secondary font-semibold uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
 Os gráficos globais de uso, retenção e churn neural serão renderizados neste painel em tempo real.
 </p>
 </div>
 <button className="px-10 py-4 bg-primary/10 border border-primary/20 rounded-2xl text-xs font-semibold text-primary uppercase hover:bg-primary hover:text-white transition-all ">
 Forçar Sincronização de Métricas
 </button>
 </div>
 </div>

 <div className="space-y-8">
 <div className="card p-8 bg-bg-tertiary/10 border border-border/30 flex flex-col items-center gap-6 group relative overflow-hidden">
 <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
 <ShieldCheck size={120} className="text-primary" />
 </div>
 <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:rotate-12 transition-transform duration-500 relative z-10">
 <ShieldCheck size={32} className="text-primary" />
 </div>
 <div className="text-center space-y-2 relative z-10">
 <h4 className="text-text-secondary font-semibold uppercase text-xs">Saúde da Infraestrutura</h4>
 <p className="text-2xl font-semibold text-text-primary tracking-tight group-hover:text-primary transition-colors">99.98%</p>
 </div>
 <div className="w-full bg-bg-tertiary rounded-full h-1.5 overflow-hidden border border-border/30 relative z-10">
 <div className="h-full bg-primary w-[99.98%]" />
 </div>
 <p className="text-xs text-text-secondary font-semibold uppercase tracking-widest text-center leading-relaxed relative z-10 opacity-60">Cluster AWS-Global-East-1 operando em alta performance sem anomalias detectadas.</p>
 </div>

 <div className="card p-8 bg-bg-tertiary/20 border border-border/30 space-y-6">
 <h3 className="text-xs font-semibold text-text-primary uppercase flex items-center gap-3">
 <Activity size={16} className="text-primary" /> Alertas de Monitoramento
 </h3>
 <div className="space-y-4">
 {[
 { label: 'Backup de Segurança', status: 'Concluído', color: 'emerald' },
 { label: 'Sincronização RPA', status: 'Processando', color: 'primary' },
 { label: 'Certificados SSL', status: 'Seguro', color: 'emerald' }
 ].map((alert, i) => (
 <div key={i} className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border hover:border-primary/20 transition-all group ">
 <span className="text-xs font-semibold text-text-secondary uppercase tracking-widest group-hover:text-text-primary transition-colors">{alert.label}</span>
 <span className={`text-xs font-semibold text-${alert.color === 'primary' ? 'primary' : 'emerald-500'} uppercase tracking-widest bg-${alert.color === 'primary' ? 'primary' : 'emerald-500'}/10 px-3 py-1 rounded-lg border border-${alert.color === 'primary' ? 'primary' : 'emerald-500'}/20`}>{alert.status}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>

 <div className="card p-10 bg-bg-tertiary/20 border border-border overflow-hidden relative group">
 <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
 <Camera size={180} className="text-primary" />
 </div>
 
 <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
 <div className="flex flex-col items-center gap-6">
 <div className="w-48 h-48 rounded-xl bg-background border-2 border-dashed border-border flex items-center justify-center overflow-hidden relative group/logo ">
 {logo ? (
 <img src={logo} alt="System Logo" className="w-full h-full object-contain p-4 group-hover/logo:scale-110 transition-transform duration-500" />
 ) : (
 <Camera size={48} className="text-text-muted opacity-20" />
 )}
 <label className="absolute inset-0 bg-primary/80 opacity-0 group-hover/logo:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-300">
 <Upload className="text-white mb-2" size={24} />
 <span className="text-xs font-semibold text-white uppercase tracking-widest">Alterar Logo</span>
 <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
 </label>
 </div>
 <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest italic">Preview da Identidade Global</p>
 </div>

 <div className="flex-1 space-y-8">
 <div className="space-y-3">
 <h3 className="text-xl font-semibold text-text-primary uppercase tracking-tight">Identidade Visual do Ecossistema</h3>
 <p className="text-sm text-text-secondary font-medium leading-relaxed max-w-2xl">
 Este logotipo será aplicado globalmente em todos os pontos de entrada do sistema, incluindo a **Landing Page**, a **Tela de Login Master** e em todos os **Tenants** que não possuírem uma marca própria configurada.
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
 <div className="p-6 bg-background/40 border border-border rounded-2xl space-y-2 group/item hover:border-primary/40 transition-colors">
 <span className="text-xs font-semibold text-primary uppercase tracking-widest">Dimensões Recomendadas</span>
 <p className="text-xs font-bold text-text-secondary">512x512px (Proporção 1:1)</p>
 </div>
 <div className="p-6 bg-background/40 border border-border rounded-2xl space-y-2 group/item hover:border-primary/40 transition-colors">
 <span className="text-xs font-semibold text-primary uppercase tracking-widest">Formato de Arquivo</span>
 <p className="text-xs font-bold text-text-secondary">PNG ou SVG (Transparente)</p>
 </div>
 </div>

 <div className="flex items-center gap-4 pt-4">
 <button className="px-8 py-3 bg-primary text-white rounded-xl text-xs font-semibold uppercase tracking-widest hover:scale-105 transition-all">
 Salvar Preferências Globais
 </button>
 {logo && (
 <button 
 onClick={() => {
 localStorage.removeItem('company_logo');
 setLogo('');
 window.dispatchEvent(new Event('storage'));
 toast.success('Logotipo restaurado para o padrão.');
 }}
 className="px-8 py-3 bg-bg-tertiary text-text-secondary border border-border rounded-xl text-xs font-semibold uppercase tracking-widest hover:text-red-500 hover:border-red-500/30 transition-all"
 >
 Remover Logo
 </button>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
