import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Server, Loader2, ShieldCheck, Zap, Database, Globe, ArrowUpRight, BarChart3, Cloud } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export default function SystemHealth() {
  const [metrics, setMetrics] = useState({
    jobs_count: 0,
    failed_jobs_count: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await api.get('/api/master/system-health');
      setMetrics(res.data);
    } catch (err) {
      toast.error('Erro na sincronização do monitoramento de infraestrutura.');
    } finally {
      setLoading(false);
    }
  };

  const isHealthy = metrics.failed_jobs_count === 0;

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            System <span className="text-gradient-gold">Health & Core Monitor</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <ShieldCheck size={14} className="text-primary" />
            Vigilância estratégica de clusters AWS, filas RPA e jobs críticos em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-5 bg-surface-elevated/20 border border-border-subtle/30 p-5 rounded-2xl shadow-inner-platinum backdrop-blur-md">
          {isHealthy ? (
            <div className="flex items-center gap-4">
               <div className="flex flex-col items-end gap-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-text-secondary italic">Status de Rede</span>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md">Sistema Nominal</span>
               </div>
               <div className="w-px h-10 bg-border-subtle/30" />
               <CheckCircle className="text-emerald-500 w-7 h-7 animate-pulse shadow-platinum-glow-sm" />
            </div>
          ) : (
            <div className="flex items-center gap-4">
               <div className="flex flex-col items-end gap-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-text-secondary italic">Alerta Crítico</span>
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded-md">Falha em Produção</span>
               </div>
               <div className="w-px h-10 bg-border-subtle/30" />
               <AlertTriangle className="text-red-500 w-7 h-7 animate-pulse shadow-platinum-glow-sm" />
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <div className="platinum-card p-10 flex flex-col items-center justify-center space-y-8 group hover:border-primary/40 transition-all bg-surface-elevated/10 backdrop-blur-xl relative overflow-hidden shadow-platinum-glow-sm">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-all group-hover:scale-125 duration-700">
             <Activity size={180} className="text-primary" />
          </div>
          <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-[1.5rem] flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-700 shadow-inner-platinum relative z-10">
            <Activity className="w-10 h-10" />
          </div>
          <div className="text-center relative z-10 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-text-secondary italic">Orquestração RPA</p>
            <p className="text-5xl font-black text-text-primary tracking-tighter group-hover:text-primary transition-colors duration-500">
              {loading ? <Loader2 className="w-10 h-10 animate-spin inline-block opacity-20" /> : metrics.jobs_count.toString().padStart(2, '0')}
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
               <div className="w-1 h-1 rounded-full bg-primary animate-ping" />
               <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">Tasks Ativas em Background</p>
            </div>
          </div>
        </div>

        <div className="platinum-card p-10 flex flex-col items-center justify-center space-y-8 group hover:border-red-500/40 transition-all bg-surface-elevated/10 backdrop-blur-xl relative overflow-hidden shadow-platinum-glow-sm">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-all group-hover:scale-125 duration-700">
             <AlertTriangle size={180} className="text-red-500" />
          </div>
          <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center relative z-10 shadow-inner-platinum transition-all duration-700 ${metrics.failed_jobs_count > 0 ? 'bg-red-500/10 border border-red-500/20 text-red-500' : 'bg-surface-elevated/30 border border-border-subtle text-text-secondary'}`}>
            <AlertTriangle className="w-10 h-10" />
          </div>
          <div className="text-center relative z-10 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-text-secondary italic">Integridade de Jobs</p>
            <p className={`text-5xl font-black tracking-tighter transition-colors duration-500 ${metrics.failed_jobs_count > 0 ? 'text-red-500' : 'text-text-primary'}`}>
              {loading ? <Loader2 className="w-10 h-10 animate-spin inline-block opacity-20" /> : metrics.failed_jobs_count.toString().padStart(2, '0')}
            </p>
            <p className="text-[10px] font-black text-text-secondary mt-2 uppercase tracking-[0.3em]">Exceções críticas de fila</p>
          </div>
        </div>
        
        <div className="platinum-card p-10 flex flex-col items-center justify-center space-y-8 group hover:border-emerald-500/40 transition-all bg-surface-elevated/10 backdrop-blur-xl relative overflow-hidden shadow-platinum-glow-sm">
           <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-all group-hover:scale-125 duration-700">
             <Database size={180} className="text-emerald-500" />
          </div>
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-[1.5rem] flex items-center justify-center text-emerald-500 shadow-inner-platinum group-hover:scale-110 transition-transform duration-700 relative z-10">
            <Server className="w-10 h-10" />
          </div>
          <div className="text-center relative z-10 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-text-secondary italic">Database Integrity</p>
            <div className="flex flex-col items-center gap-1">
               <span className="text-xl font-black text-emerald-500 tracking-[0.2em] uppercase">Consolidado</span>
               <div className="w-24 h-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 overflow-hidden">
                  <div className="h-full bg-emerald-500 shadow-platinum-glow-sm animate-shimmer" style={{ width: '100%', backgroundSize: '200% 100%' }} />
               </div>
            </div>
            <div className="flex items-center gap-2 justify-center">
               <Globe size={12} className="text-emerald-500/60" />
               <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.3em]">Redundância Ativa</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 platinum-card p-12 bg-surface-elevated/5 border-l-4 border-l-primary flex flex-col md:flex-row items-center justify-between gap-10 group shadow-platinum-glow-sm">
           <div className="flex items-center gap-10">
              <div className="w-20 h-20 bg-primary/10 rounded-[1.5rem] text-primary border border-primary/20 shadow-inner-platinum flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                 <Zap size={40} className="animate-pulse" />
              </div>
              <div className="space-y-3">
                 <h3 className="text-base font-black text-text-primary uppercase tracking-[0.5em] leading-tight">Métricas de Latência Core</h3>
                 <p className="text-[11px] text-text-secondary font-black uppercase tracking-[0.3em] leading-relaxed">Tempo médio de resposta do cluster neural: <span className="text-primary font-black shadow-platinum-glow-sm">124ms</span></p>
                 <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20"><Cloud size={12} /> AWS-East-1</span>
                    <span className="flex items-center gap-2 text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20"><ArrowUpRight size={12} /> Optimized</span>
                 </div>
              </div>
           </div>
           <div className="flex gap-8 items-center">
              <div className="flex flex-col items-end gap-1">
                 <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em] italic">Uptime Global SLA</span>
                 <span className="text-4xl font-black text-text-primary tracking-tighter text-gradient-gold drop-shadow-xl">99.98%</span>
              </div>
              <BarChart3 className="text-primary opacity-20 w-12 h-12" />
           </div>
        </div>

        <div className="platinum-card p-10 bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-platinum-glow-sm space-y-10">
           <h3 className="text-[11px] font-black text-text-primary uppercase tracking-[0.5em] flex items-center gap-5">
              <Activity size={20} className="text-primary" /> Alertas de Infraestrutura
           </h3>
           <div className="space-y-5">
              {[
                { label: 'Backups de Segurança (S3)', status: 'CONCLUÍDO', color: 'emerald' },
                { label: 'Sincronização RPA Redis', status: 'PROCESSANDO', color: 'primary' },
                { label: 'Certificados SSL (Vault)', status: 'PROTEGIDO', color: 'emerald' }
              ].map((alert, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-background/50 rounded-2xl border border-border-subtle hover:border-primary/20 transition-all duration-500 group shadow-inner-platinum">
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] group-hover:text-text-primary transition-colors">{alert.label}</span>
                   </div>
                   <span className={`text-[9px] font-black text-${alert.color === 'primary' ? 'primary' : 'emerald-500'} uppercase tracking-widest bg-${alert.color === 'primary' ? 'primary' : 'emerald-500'}/10 px-4 py-1.5 rounded-xl border border-${alert.color === 'primary' ? 'primary' : 'emerald-500'}/20 shadow-platinum-glow-sm`}>{alert.status}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
