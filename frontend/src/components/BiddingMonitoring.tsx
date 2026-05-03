import { useState, useEffect } from 'react';
import { 
  Radar, ShieldCheck, Zap, BarChart3, Target, Globe, Server, Lock, 
  Activity, Clock, AlertTriangle, ChevronRight, Search, Filter, Loader2, Award
} from 'lucide-react';
import api from '../lib/axios';

export default function BiddingMonitoring() {
  const [loading, setLoading] = useState(true);
  const [monitoringData, setMonitoringData] = useState<any[]>([]);

  useEffect(() => {
    // Simulated fetching for live monitoring
    setTimeout(() => {
      setMonitoringData([
        { id: 1, title: 'Pregão Eletrônico 45/2024', org: 'Prefeitura de SP', status: 'live', time: '14:30', progress: 65, color: 'text-emerald-500' },
        { id: 2, title: 'Tomada de Preços 12/2024', org: 'Exército Brasileiro', status: 'waiting', time: 'Amanhã', progress: 0, color: 'text-amber-500' },
        { id: 3, title: 'Dispensa de Licitação 08/2024', org: 'Câmara Municipal', status: 'dead-heat', time: 'Concluindo', progress: 95, color: 'text-primary' },
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Live <span className="text-gradient-gold">Bidding Monitoring</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <Activity size={14} className="text-emerald-500 animate-pulse" />
            Acompanhamento em tempo real de sessões públicas, lances e prazos críticos Platinum.
          </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-emerald-500/10 border border-emerald-500/20 px-8 py-4 rounded-2xl flex items-center gap-6 shadow-platinum-glow-sm backdrop-blur-xl">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 opacity-80">Neural RPA Active</p>
                <p className="text-xs font-black text-text-primary uppercase tracking-tight mt-1">03 Sessões Monitoradas</p>
              </div>
           </div>
        </div>
      </header>

      {/* Strategic Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Live Feed */}
        <div className="lg:col-span-2 space-y-8">
          <div className="platinum-card p-10 space-y-10 bg-surface-elevated/10 backdrop-blur-xl">
            <div className="flex justify-between items-center border-b border-border-subtle/30 pb-6">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.4em] flex items-center gap-4">
                <Radar size={20} className="text-primary" /> Sessões em Andamento Master
              </h3>
              <div className="flex items-center gap-3">
                 <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-platinum-glow-sm" />
                 <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.4em] italic opacity-60">Neural Scan: Operational</span>
              </div>
            </div>

            {loading ? (
              <div className="py-40 text-center opacity-40 space-y-6">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" /> 
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">Orquestrando Sessões Live...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {monitoringData.map(item => (
                  <div key={item.id} className="platinum-card p-8 bg-surface-elevated/20 border border-border-subtle/30 hover:border-primary/40 transition-all group relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <span className={`text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-platinum-glow-sm ${
                            item.status === 'live' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 
                            item.status === 'waiting' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 
                            'bg-primary/10 border-primary/20 text-primary'
                          }`}>
                            {item.status === 'live' ? 'Live Session' : item.status === 'waiting' ? 'Scheduled' : 'Dead Heat Analysis'}
                          </span>
                          <h4 className="text-sm font-black text-text-primary uppercase tracking-tight group-hover:text-primary transition-all duration-500">{item.title}</h4>
                        </div>
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest flex items-center gap-3 opacity-60">
                           <Globe size={14} className="text-primary/60" /> {item.org}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-4 min-w-[250px]">
                        <div className="w-full h-1.5 bg-background border border-border-subtle/30 rounded-full overflow-hidden shadow-inner-platinum">
                          <div className={`h-full transition-all duration-2000 ease-out shadow-platinum-glow ${item.status === 'live' ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${item.progress}%` }} />
                        </div>
                        <div className="flex justify-between w-full">
                           <span className="text-[9px] font-black uppercase text-text-muted tracking-[0.3em] opacity-60 flex items-center gap-2">
                             <Clock size={12} /> {item.time}
                           </span>
                           <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">{item.progress}% Concluído</span>
                        </div>
                      </div>
                      <button className="self-center p-4 bg-surface-elevated/40 border border-border-subtle rounded-2xl text-text-muted hover:text-primary hover:scale-110 transition-all shadow-platinum-glow-sm">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 blur-[40px] rounded-full group-hover:bg-primary/10 transition-all" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-10">
           <div className="platinum-card p-10 space-y-8 bg-surface-elevated/10 backdrop-blur-xl">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.4em] flex items-center gap-4 border-b border-border-subtle/30 pb-6">
                <Clock size={20} className="text-primary" /> Prazos Fatais RPA
              </h3>
              <div className="space-y-6">
                {[
                  { label: 'Habilitação 12/2024', time: '02h 15m', urgency: 'high' },
                  { label: 'Recurso Pregão 05', time: '14h 30m', urgency: 'medium' },
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-background/50 border border-border-subtle/50 rounded-2xl shadow-inner-platinum group hover:border-primary/30 transition-all">
                    <span className="text-[10px] font-black text-text-primary uppercase tracking-widest group-hover:text-primary transition-colors">{p.label}</span>
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl border shadow-platinum-glow-sm ${
                      p.urgency === 'high' ? 'text-red-500 bg-red-500/10 border-red-500/20 animate-pulse' : 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                    }`}>
                      {p.time}
                    </span>
                  </div>
                ))}
              </div>
           </div>

           <div className="platinum-card p-10 space-y-8 border-dashed border-primary/20 bg-surface-elevated/5 relative overflow-hidden group">
              <div className="flex items-center gap-5 relative z-10">
                 <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-platinum-glow-sm group-hover:scale-110 transition-transform duration-500">
                    <Award size={28} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Neural Performance</p>
                    <p className="text-sm font-black text-text-primary uppercase tracking-tight mt-1">Win Rate Real-time</p>
                 </div>
              </div>
              <div className="space-y-4 relative z-10">
                 <div className="flex justify-between text-[10px] font-black uppercase text-text-muted tracking-[0.4em] opacity-60">
                    <span>Current Tier Master</span>
                    <span className="text-text-primary">72%</span>
                 </div>
                 <div className="w-full h-2 bg-background border border-border-subtle/30 rounded-full overflow-hidden shadow-inner-platinum">
                    <div className="h-full bg-gradient-gold shadow-platinum-glow animate-shimmer" style={{ width: '72%', backgroundSize: '200% 100%' }} />
                 </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/5 blur-[80px] rounded-full group-hover:bg-primary/10 transition-all duration-700" />
           </div>
        </div>

      </div>
    </div>
  );
}
