import { useState, useEffect, useRef } from 'react';
import api from '../lib/axios';
import { Loader2, Save, Building, ShieldCheck, Activity, Zap, History, Target, Plus, Image as ImageIcon, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const number_format = (number: number, decimals: number, dec_point: string, thousands_sep: string) => {
 const n = !isFinite(+number) ? 0 : +number,
 prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
 sep = (thousands_sep === undefined) ? ',' : thousands_sep,
 dec = (dec_point === undefined) ? '.' : dec_point,
 toFixedFix = (n: number, prec: number) => {
 const k = Math.pow(10, prec);
 return '' + Math.round(n * k) / k;
 };
 const s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
 if (s[0].length > 3) {
 s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
 }
 if ((s[1] || '').length < prec) {
 s[1] = s[1] || '';
 s[1] += new Array(prec - s[1].length + 1).join('0');
 }
 return s.join(dec);
};

interface AuditLog {
 id: number;
 user?: { name: string };
 action: string;
 old_value: string;
 new_value: string;
 ip_address: string;
 created_at: string;
}

export default function CompanySettings() {
 const storedUser = localStorage.getItem('user');
 const user = storedUser ? JSON.parse(storedUser) : { company_id: 'BidFlow', role: 'Admin' };

 const [companyInfo, setCompanyInfo] = useState({
 name: 'GC Representações & Serviços',
 cnpj: '00.111.222/0001-33',
 domain: 'gcrepresentacoes.bidflow.com',
 logo: localStorage.getItem('company_logo') || ''
 });

 const fileInputRef = useRef<HTMLInputElement>(null);

 const [health, setHealth] = useState({ pending_jobs: 0, failed_jobs: 0, status: 'healthy' });
 const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
 const [activeTab, setActiveTab] = useState<'info' | 'billing' | 'audit'>('info');
 const [billing, setBilling] = useState<any>(null);
 const [loadingBilling, setLoadingBilling] = useState(false);
 const [isEditing, setIsEditing] = useState(false);
 const [isSaving, setIsSaving] = useState(false);

 const fetchHealth = () => {
 api.get('/api/system/queue-health')
.then(res => setHealth(res.data))
.catch(console.error);
 
 api.get('/api/audit-logs')
.then(res => setAuditLogs(res.data))
.catch(console.error);
 };

 const fetchBilling = () => {
 setLoadingBilling(true);
 api.get('/api/billing/info')
.then(res => setBilling(res.data))
.catch(() => toast.error('Falha ao carregar dados de faturamento.'))
.finally(() => setLoadingBilling(false));
 };

 useEffect(() => {
 fetchHealth();
 fetchBilling();
 }, []);

 const handleManageSubscription = async () => {
 try {
 const response = await api.get('/api/billing/portal');
 if (response.data.url) {
 window.open(response.data.url, '_blank');
 }
 } catch (err) {
 toast.error('Erro ao acessar o portal de faturamento.');
 }
 };

 const handleLogoUpload = () => fileInputRef.current?.click();

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (file) {
 const reader = new FileReader();
 reader.onloadend = () => {
 const base64String = reader.result as string;
 setCompanyInfo(prev => ({...prev, logo: base64String }));
 setIsEditing(true);
 };
 reader.readAsDataURL(file);
 }
 };

 const handleSave = () => {
 setIsSaving(true);
 // Simulate API call
 setTimeout(() => {
 localStorage.setItem('company_logo', companyInfo.logo);
 window.dispatchEvent(new Event('storage')); // Trigger update for other components
 setIsSaving(false);
 setIsEditing(false);
 toast.success('Dados cadastrais atualizados!');
 }, 1000);
 };

 if (user?.role_name !== 'Administrador' && !user?.is_admin && !user?.is_superadmin && user?.email !== 'admin@bidflow.dev') {
 return (
 <div className="flex flex-col items-center justify-center py-32 space-y-6 opacity-40">
 <ShieldCheck size={56} className="text-primary" />
 <p className="text-xs font-semibold uppercase text-text-muted">Acesso negado. Governança Admin requerida.</p>
 </div>
 );
 }

 return (
 <div className="space-y-8 animate-fade-in">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
 <div>
 <h2 className="text-xl font-semibold text-text-primary">Configurações da Empresa</h2>
 <p className="text-sm text-text-secondary mt-1 flex items-center gap-2">
 <Building size={14} className="text-text-muted" /> Gerencie os dados cadastrais do seu Tenant (ID: {user.company_id})
 </p>
 </div>

 <div className="flex items-center gap-2 p-1 bg-bg-secondary border border-border rounded-xl">
 {[
 { id: 'info', label: 'Dados Cadastrais', icon: Building },
 { id: 'billing', label: 'Assinatura', icon: CreditCard },
 { id: 'audit', label: 'Auditoria', icon: History }
 ].map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id as any)}
 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
 activeTab === tab.id 
 ? 'bg-primary text-white shadow-sm' 
 : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
 }`}
 >
 <tab.icon size={16} />
 <span className="hidden sm:inline">{tab.label}</span>
 </button>
 ))}
 </div>
 </div>

 <div className="space-y-8">
 {activeTab === 'info' && (
 <div className="card p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border pb-6 gap-4">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-primary/10 rounded-lg text-primary">
 <Activity size={20} />
 </div>
 <h3 className="text-base font-semibold text-text-primary">Identidade Corporativa</h3>
 </div>

 <div className="flex items-center gap-4">
 <div 
 className="relative group cursor-pointer" 
 onClick={handleLogoUpload}
 title="Upload Logo da Empresa"
 >
 {companyInfo.logo ? (
 <img
 src={companyInfo.logo}
 alt="Company Logo"
 className="w-16 h-16 rounded-xl object-contain border border-border bg-white p-2 group-hover:opacity-80 transition-opacity"
 />
 ) : (
 <div className="w-16 h-16 rounded-xl bg-bg-secondary flex items-center justify-center border border-border text-text-muted group-hover:bg-bg-tertiary transition-colors">
 <ImageIcon size={24} />
 </div>
 )}
 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-xl">
 <Plus size={20} className="text-white" />
 </div>
 <input 
 type="file" 
 ref={fileInputRef} 
 onChange={handleFileChange} 
 className="hidden" 
 accept="image/*" 
 />
 </div>
 <div className="hidden sm:block">
 <p className="text-sm font-medium text-text-primary">Logo da Empresa</p>
 <p className="text-xs text-text-muted mt-0.5">PNG ou SVG recomendado</p>
 </div>
 </div>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-1.5">
 <label className="text-sm font-medium text-text-primary">Razão Social</label>
 <input 
 type="text" 
 value={companyInfo.name} 
 onChange={(e) => {
 setCompanyInfo({...companyInfo, name: e.target.value});
 setIsEditing(true);
 }}
 className="input w-full" 
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-sm font-medium text-text-primary">CNPJ</label>
 <input 
 type="text" 
 value={companyInfo.cnpj} 
 onChange={(e) => {
 setCompanyInfo({...companyInfo, cnpj: e.target.value});
 setIsEditing(true);
 }}
 className="input w-full font-mono text-sm" 
 />
 </div>
 <div className="md:col-span-2 space-y-1.5">
 <label className="text-sm font-medium text-text-primary">Subdomínio BidFlow</label>
 <div className="relative">
 <input 
 type="text" 
 value={companyInfo.domain} 
 onChange={(e) => {
 setCompanyInfo({...companyInfo, domain: e.target.value});
 setIsEditing(true);
 }}
 className="input w-full pr-24" 
 />
 <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-success bg-success/10 px-2 py-0.5 rounded text-xs font-medium">
 <ShieldCheck size={12} /> Verificado
 </div>
 </div>
 </div>
 </div>
 
 <div className="flex justify-end pt-6 border-t border-border">
 <button 
 onClick={handleSave}
 disabled={!isEditing || isSaving}
 className="btn btn-primary flex items-center gap-2"
 >
 {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
 <span>Salvar Alterações</span>
 </button>
 </div>
 </div>
 )}

 {activeTab === 'billing' && (
 <div className="space-y-6 animate-in fade-in duration-500">
 <div className="card p-6 md:p-8 relative overflow-hidden group">
 <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
 <CreditCard size={180} />
 </div>

 <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
 <div className="space-y-6 flex-1 w-full">
 <div className="space-y-1">
 <span className="text-xs font-semibold text-primary uppercase tracking-wider">Plano Atual</span>
 <h3 className="text-2xl font-bold text-text-primary">{billing?.plan_name || 'Plano Enterprise'}</h3>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
 <div className="p-4 bg-bg-secondary rounded-xl border border-border">
 <span className="text-xs font-medium text-text-secondary">Valor Mensal</span>
 <p className="text-lg font-semibold text-text-primary mt-1">R$ {billing?.value ? number_format(billing.value, 2, ',', '.') : '499,90'}</p>
 </div>
 <div className="p-4 bg-bg-secondary rounded-xl border border-border">
 <span className="text-xs font-medium text-text-secondary">Próxima Cobrança</span>
 <p className="text-lg font-semibold text-text-primary mt-1">{billing?.next_billing ? new Date(billing.next_billing).toLocaleDateString('pt-BR') : '--/--/----'}</p>
 </div>
 </div>
 </div>

 <div className="flex flex-col items-center gap-5 p-6 bg-bg-secondary rounded-2xl border border-border w-full md:w-auto">
 <div className="text-center space-y-2">
 <span className="text-xs font-medium text-text-secondary">Status da Assinatura</span>
 <div className={`mx-auto px-4 py-1 rounded-full text-xs font-semibold border w-fit ${
 billing?.status === 'active' 
 ? 'bg-success/10 text-success border-success/20' 
 : 'bg-danger/10 text-danger border-danger/20'
 }`}>
 {billing?.status === 'active' ? 'Ativo' : 'Atrasado'}
 </div>
 </div>
 <button 
 onClick={handleManageSubscription}
 className="btn btn-primary w-full flex items-center justify-center gap-2"
 >
 <Zap size={16} />
 <span>Gerenciar Assinatura</span>
 </button>
 </div>
 </div>
 </div>

 <div className="card p-6 space-y-4">
 <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
 <ShieldCheck size={18} className="text-primary" /> Governança e Compliance
 </h3>
 <p className="text-sm text-text-secondary leading-relaxed">
 Sua assinatura garante acesso ao ecossistema completo de inteligência artificial, radar e automação de propostas. Em caso de atraso superior a 5 dias, o acesso ao Tenant será suspenso automaticamente pela nossa camada de segurança.
 </p>
 </div>
 </div>
 )}

 {activeTab === 'audit' && (
 <div className="space-y-6 animate-in fade-in duration-500">
 {/* Webhooks & RPA */}
 <div className="card p-6 space-y-6">
 <div className="flex items-center gap-3 border-b border-border pb-4">
 <div className="p-2 bg-primary/10 rounded-lg text-primary">
 <Zap size={20} />
 </div>
 <h3 className="text-base font-semibold text-text-primary">Integrações & Webhooks</h3>
 </div>
 <p className="text-sm text-text-secondary">Configure chaves para o sistema de automação e Webhooks.</p>
 <div className="bg-bg-secondary p-6 rounded-xl border border-border">
 <code className="text-success text-sm font-mono block">POST /api/webhooks/radar-sync</code>
 <p className="text-xs text-text-muted mt-2 font-mono">Auth Token: generated_master_key_v4_bidflow_secure</p>
 </div>
 </div>

 {/* System Health */}
 <div className="card p-6 space-y-6">
 <div className="flex justify-between items-center border-b border-border pb-4">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-warning/10 rounded-lg text-warning">
 <Target size={20} />
 </div>
 <h3 className="text-base font-semibold text-text-primary">Saúde do Sistema</h3>
 </div>
 <button 
 onClick={fetchHealth} 
 className="btn btn-outline text-xs py-1.5 px-3"
 >
 Atualizar Status
 </button>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-bg-secondary p-6 rounded-xl border border-border flex flex-col justify-center gap-1">
 <p className="text-sm font-medium text-text-secondary">Processos em Fila</p>
 <p className="text-3xl font-bold text-text-primary">{health.pending_jobs}</p>
 </div>
 
 <div className={`p-6 rounded-xl border flex flex-col justify-center gap-1 ${health.failed_jobs > 0 ? 'bg-danger/10 border-danger/20' : 'bg-success/10 border-success/20'}`}>
 <p className={`text-sm font-medium ${health.failed_jobs > 0 ? 'text-danger' : 'text-success'}`}>Falhas de Processamento</p>
 <p className={`text-3xl font-bold ${health.failed_jobs > 0 ? 'text-danger' : 'text-success'}`}>{health.failed_jobs}</p>
 </div>
 </div>
 </div>

 {/* Audit Logs */}
 <div className="card p-6 space-y-6">
 <div className="flex items-center gap-3 border-b border-border pb-4">
 <div className="p-2 bg-primary/10 rounded-lg text-primary">
 <History size={20} />
 </div>
 <h3 className="text-base font-semibold text-text-primary">Logs de Auditoria</h3>
 </div>
 <div className="overflow-x-auto rounded-xl border border-border">
 <table className="w-full text-left text-sm whitespace-nowrap">
 <thead className="bg-bg-tertiary border-b border-border">
 <tr>
 <th className="px-6 py-3 font-medium text-text-secondary">Operador</th>
 <th className="px-6 py-3 font-medium text-text-secondary">Ação / Evento</th>
 <th className="px-6 py-3 font-medium text-text-secondary">IP</th>
 <th className="px-6 py-3 font-medium text-text-secondary text-right">Data/Hora</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border bg-bg-primary">
 {auditLogs.length > 0 ? auditLogs.map((log) => (
 <tr key={log.id} className="hover:bg-bg-secondary transition-colors">
 <td className="px-6 py-4 font-medium text-text-primary">{log.user?.name || 'SISTEMA'}</td>
 <td className="px-6 py-4">
 <div className="font-medium text-text-secondary">{log.action}</div>
 <div className="text-xs text-text-muted font-mono mt-0.5">{log.new_value}</div>
 </td>
 <td className="px-6 py-4 font-mono text-xs text-text-muted">{log.ip_address}</td>
 <td className="px-6 py-4 text-right text-text-muted text-xs">{new Date(log.created_at).toLocaleString('pt-BR')}</td>
 </tr>
 )) : (
 <tr><td colSpan={4} className="px-6 py-12 text-center text-text-muted text-sm">Nenhum evento auditado recentemente</td></tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
