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
        setCompanyInfo(prev => ({ ...prev, logo: base64String }));
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

  if (user?.role_name !== 'Administrador' && !user?.is_admin) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6 opacity-40">
        <ShieldCheck size={56} className="text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Acesso negado. Governança Admin requerida.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-text-primary uppercase tracking-widest">Configurações da Empresa</h2>
          <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em] opacity-60 flex items-center gap-2">
            <Building size={12} className="text-primary" /> Gerencie os dados cadastrais do seu Tenant (ID: {user.company_id})
          </p>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-surface-elevated/40 border border-border-subtle/30 rounded-2xl shadow-inner-platinum backdrop-blur-md">
           {[
             { id: 'info', label: 'Dados Cadastrais', icon: Building },
             { id: 'billing', label: 'Assinatura & Faturamento', icon: CreditCard },
             { id: 'audit', label: 'RPA & Auditoria', icon: History }
           ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 activeTab === tab.id 
                 ? 'bg-primary text-white shadow-platinum-glow' 
                 : 'text-text-muted hover:text-text-primary'
               }`}
             >
               <tab.icon size={14} />
               <span className="hidden sm:inline">{tab.label}</span>
             </button>
           ))}
        </div>
      </div>

      <div className="space-y-12">
          {activeTab === 'info' && (
            <div className="platinum-card p-10 bg-surface-elevated/20 border-border-subtle/50 space-y-10 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between border-b border-border-subtle/30 pb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-platinum-glow-sm">
                      <Activity size={20} />
                  </div>
                  <h3 className="text-xs font-black text-text-primary uppercase tracking-widest">Identidade Corporativa</h3>
                </div>

                <div className="flex items-center gap-6">
                  <div 
                    className="relative group cursor-pointer" 
                    onClick={handleLogoUpload}
                    title="Upload Logo da Empresa"
                  >
                    <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {companyInfo.logo ? (
                      <img
                        src={companyInfo.logo}
                        alt="Company Logo"
                        className="w-16 h-16 rounded-2xl object-contain border border-border-subtle bg-background p-2 relative z-10 shadow-platinum-glow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-surface-elevated flex items-center justify-center border border-border-subtle relative z-10 text-text-muted hover:text-primary transition-colors">
                        <ImageIcon size={24} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-2xl z-20 backdrop-blur-[2px]">
                      <Plus size={20} className="text-primary" />
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
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-40">Logo do Tenant</p>
                    <p className="text-[10px] font-bold text-text-secondary mt-1">PNG/SVG Transparente</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Razão Social</label>
                  <input 
                    type="text" 
                    value={companyInfo.name} 
                    onChange={(e) => {
                      setCompanyInfo({...companyInfo, name: e.target.value});
                      setIsEditing(true);
                    }}
                    className="w-full px-6 py-4 bg-background border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">CNPJ Platinum</label>
                  <input 
                    type="text" 
                    value={companyInfo.cnpj} 
                    onChange={(e) => {
                      setCompanyInfo({...companyInfo, cnpj: e.target.value});
                      setIsEditing(true);
                    }}
                    className="w-full px-6 py-4 bg-background border border-border-medium rounded-2xl text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum font-mono" 
                  />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Subdomínio Estratégico (BidFlow)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={companyInfo.domain} 
                      onChange={(e) => {
                        setCompanyInfo({...companyInfo, domain: e.target.value});
                        setIsEditing(true);
                      }}
                      className="w-full px-6 py-4 bg-background border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum" 
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-primary font-black text-[10px] uppercase tracking-widest opacity-60">Verified Domain</div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleSave}
                  disabled={!isEditing || isSaving}
                  className="btn-primary py-4 px-10 shadow-platinum-glow text-[10px] uppercase tracking-widest flex items-center gap-3 disabled:opacity-30 disabled:shadow-none"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Confirmar Alterações Master
                </button>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
               <div className="platinum-card p-10 bg-surface-elevated/20 border-border-subtle/50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                     <CreditCard size={200} className="text-primary" />
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                     <div className="space-y-6 flex-1">
                        <div className="space-y-2">
                           <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Plano Atual</span>
                           <h3 className="text-4xl font-black text-text-primary tracking-tighter uppercase">{billing?.plan_name || 'Plano Platinum'}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6 max-w-lg">
                           <div className="p-5 bg-background/50 rounded-2xl border border-border-subtle shadow-inner-platinum">
                              <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Valor Mensal</span>
                              <p className="text-lg font-black text-text-primary mt-1">R$ {billing?.value ? number_format(billing.value, 2, ',', '.') : '499,90'}</p>
                           </div>
                           <div className="p-5 bg-background/50 rounded-2xl border border-border-subtle shadow-inner-platinum">
                              <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Próxima Cobrança</span>
                              <p className="text-lg font-black text-text-primary mt-1">{billing?.next_billing ? new Date(billing.next_billing).toLocaleDateString('pt-BR') : '--/--/----'}</p>
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-col items-center gap-6 p-8 bg-surface-elevated/40 rounded-3xl border border-border-subtle shadow-platinum-glow-sm">
                        <div className="text-center space-y-1">
                           <span className="text-[9px] font-black text-text-secondary uppercase tracking-[0.3em]">Status da Assinatura</span>
                           <div className={`mt-2 px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-platinum-glow-sm border ${
                             billing?.status === 'active' 
                             ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                             : 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse'
                           }`}>
                              {billing?.status === 'active' ? 'Ativo' : 'Atrasado'}
                           </div>
                        </div>
                        <button 
                          onClick={handleManageSubscription}
                          className="w-full px-10 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-platinum-glow-sm hover:scale-105 transition-all flex items-center justify-center gap-3"
                        >
                           <Zap size={16} />
                           Pagar Fatura Atual
                        </button>
                        <p className="text-[9px] text-text-muted font-black uppercase tracking-tight text-center opacity-40">Processado via Asaas Platinum Security</p>
                     </div>
                  </div>
               </div>

               <div className="platinum-card p-10 bg-surface-elevated/20 border-border-subtle/50 space-y-8">
                  <h3 className="text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-4">
                     <ShieldCheck size={18} className="text-primary" /> Governança e Compliance de Pagamentos
                  </h3>
                  <p className="text-sm text-text-secondary font-medium leading-relaxed max-w-3xl">
                     Sua assinatura garante acesso ao ecossistema completo de inteligência artificial, radar RPA e automação de propostas. Em caso de atraso superior a 5 dias, o acesso ao Tenant será suspenso automaticamente pela nossa camada de segurança.
                  </p>
               </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
              {/* Webhooks & RPA */}
              <div className="platinum-card p-10 bg-surface-elevated/20 border-border-subtle/50 space-y-10">
                <div className="flex items-center gap-4 border-b border-border-subtle/30 pb-6">
                   <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 shadow-platinum-glow-sm">
                      <Zap size={20} />
                   </div>
                   <h3 className="text-xs font-black text-text-primary uppercase tracking-widest">Integrações & Webhooks RPA</h3>
                </div>
                <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] leading-relaxed opacity-60">Configure chaves para o Robô Python de OCR e Radar de Licitações Platinum.</p>
                <div className="bg-background/80 p-8 rounded-[2rem] border border-border-subtle/50 relative overflow-hidden shadow-inner-platinum">
                  <code className="text-emerald-500 text-xs font-mono block relative z-10">POST /api/webhooks/radar-sync</code>
                  <p className="text-[9px] text-text-muted mt-4 font-mono relative z-10 italic uppercase tracking-widest opacity-40">Auth Token: generated_master_key_v4_bidflow_secure</p>
                  <div className="absolute right-0 bottom-0 p-8 opacity-5">
                     <Zap size={80} className="text-primary" />
                  </div>
                </div>
              </div>

              {/* System Health */}
              <div className="platinum-card p-10 bg-surface-elevated/20 border-border-subtle/50 space-y-10">
                <div className="flex justify-between items-center border-b border-border-subtle/30 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 shadow-platinum-glow-sm">
                       <Target size={20} />
                    </div>
                    <h3 className="text-xs font-black text-text-primary uppercase tracking-widest">Saúde do Robô IA BidFlow</h3>
                  </div>
                  <button 
                    onClick={fetchHealth} 
                    className="px-6 py-2.5 bg-surface-elevated/40 border border-border-subtle rounded-xl text-[9px] font-black text-text-primary uppercase tracking-[0.2em] hover:bg-surface-elevated transition-all shadow-platinum-glow-sm"
                  >
                    Refresh Status
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-background/50 p-8 rounded-[2rem] border border-border-subtle/50 flex flex-col justify-center gap-2 shadow-inner-platinum">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] opacity-60">Jobs em Fila</p>
                    <p className="text-4xl font-black text-text-primary tracking-tighter">{health.pending_jobs}</p>
                  </div>
                  
                  <div className={`p-8 rounded-[2rem] border flex flex-col justify-center gap-2 shadow-platinum-glow-sm transition-all duration-500 ${health.failed_jobs > 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                     <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${health.failed_jobs > 0 ? 'text-red-500' : 'text-emerald-500'}`}>Falhas de Processamento</p>
                     <p className={`text-4xl font-black tracking-tighter ${health.failed_jobs > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{health.failed_jobs}</p>
                  </div>
                </div>
              </div>

              {/* Audit Logs */}
              <div className="platinum-card p-10 bg-surface-elevated/20 border-border-subtle/50 space-y-10">
                <div className="flex items-center gap-4 border-b border-border-subtle/30 pb-6">
                   <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500 shadow-platinum-glow-sm">
                      <History size={20} />
                   </div>
                   <h3 className="text-xs font-black text-text-primary uppercase tracking-widest">Audit Trail & Tracking</h3>
                </div>
                <div className="overflow-x-auto scrollbar-platinum border border-border-subtle/30 rounded-[2rem]">
                   <table className="w-full text-left text-sm">
                     <thead>
                       <tr className="bg-surface-elevated/40 border-b border-border-subtle">
                         <th className="px-8 py-5 font-black uppercase text-[9px] tracking-[0.3em] text-text-muted opacity-60">Operador</th>
                         <th className="px-8 py-5 font-black uppercase text-[9px] tracking-[0.3em] text-text-muted opacity-60">Ação / Evento</th>
                         <th className="px-8 py-5 font-black uppercase text-[9px] tracking-[0.3em] text-text-muted opacity-60">IP Endpoint</th>
                         <th className="px-8 py-5 font-black uppercase text-[9px] tracking-[0.3em] text-text-muted opacity-60 text-right">Timestamp</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-border-subtle/30">
                       {auditLogs.length > 0 ? auditLogs.map((log) => (
                         <tr key={log.id} className="hover:bg-surface-elevated/20 transition-all group duration-300">
                           <td className="px-8 py-6 font-black text-text-primary uppercase text-[10px] tracking-tight">{log.user?.name || 'SISTEMA AUTÔNOMO'}</td>
                           <td className="px-8 py-6">
                              <div className="text-[10px] font-bold text-text-secondary uppercase">{log.action}</div>
                              <div className="text-[9px] text-primary font-mono mt-1 font-black">{log.new_value}</div>
                           </td>
                           <td className="px-8 py-6 font-mono text-[10px] text-text-muted opacity-60">{log.ip_address}</td>
                           <td className="px-8 py-6 text-right text-[10px] font-black text-text-muted uppercase tracking-widest">{new Date(log.created_at).toLocaleString('pt-BR')}</td>
                         </tr>
                       )) : (
                         <tr><td colSpan={4} className="px-8 py-24 text-center text-text-muted uppercase text-[9px] font-black tracking-[0.4em] opacity-30">Nenhum evento auditado nas últimas 24h</td></tr>
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
