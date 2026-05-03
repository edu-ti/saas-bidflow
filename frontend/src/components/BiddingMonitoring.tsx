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
        { id: 1, title: 'Pregão Eletrônico 45/2024', org: 'Prefeitura de SP', status: 'live', time: '14:30', progress: 65, color: 'text-emerald-400' },
        { id: 2, title: 'Tomada de Preços 12/2024', org: 'Exército Brasileiro', status: 'waiting', time: 'Amanhã', progress: 0, color: 'text-amber-400' },
        { id: 3, title: 'Dispensa de Licitação 08/2024', org: 'Câmara Municipal', status: 'dead-heat', time: 'Concluindo', progress: 95, color: 'text-primary' },
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-8 text-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Live <span className="text-gradient-gold">Bidding Monitoring</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <Activity size={12} className="text-emerald-400 animate-pulse" />
            Acompanhamento em tempo real de sessões públicas, lances e prazos críticos.
          </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping shadow-platinum-glow" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">RPA Active</p>
                <p className="text-xs font-bold text-white">03 Sessões Monitoradas</p>
              </div>
           </div>
        </div>
      </header>

      {/* Strategic Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Live Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="platinum-card p-8 space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                <Radar size={16} className="text-primary" /> Sessões em Andamento
              </h3>
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest italic">Neural Scan: On</span>
            </div>

            {loading ? (
              <div className="py-20 text-center opacity-40">
                <Loader2 className="animate-spin inline mr-3" /> 
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sincronizando Sessões...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {monitoringData.map(item => (
                  <div key={item.id} className="platinum-card p-6 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-primary/20 transition-all group">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded border border-current ${item.color} bg-current/5`}>
                            {item.status === 'live' ? 'Live Session' : item.status === 'waiting' ? 'Scheduled' : 'Dead Heat'}
                          </span>
                          <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{item.title}</h4>
                        </div>
                        <p className="text-xs text-text-muted flex items-center gap-2">
                           <Globe size={12} /> {item.org}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-3 min-w-[200px]">
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${item.status === 'live' ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${item.progress}%` }} />
                        </div>
                        <div className="flex justify-between w-full">
                           <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">{item.time}</span>
                           <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.progress}%</span>
                        </div>
                      </div>
                      <button className="self-center p-3 bg-white/5 rounded-xl text-text-muted hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
           <div className="platinum-card p-8 space-y-6">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                <Clock size={16} className="text-primary" /> Prazos Fatais
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Habilitação 12/2024', time: '02h 15m', urgency: 'high' },
                  { label: 'Recurso Pregão 05', time: '14h 30m', urgency: 'medium' },
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                    <span className="text-[10px] font-bold text-white uppercase tracking-tight">{p.label}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${p.urgency === 'high' ? 'text-red-400 bg-red-400/10 animate-pulse' : 'text-amber-400 bg-amber-400/10'}`}>
                      {p.time}
                    </span>
                  </div>
                ))}
              </div>
           </div>

           <div className="platinum-card p-8 space-y-6 border-dashed opacity-80">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Award size={24} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Performance</p>
                    <p className="text-xs font-bold text-white">Win Rate Real-time</p>
                 </div>
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-black uppercase text-text-muted tracking-widest">
                    <span>Current Tier</span>
                    <span>72%</span>
                 </div>
                 <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-amber-600 shadow-platinum-glow" style={{ width: '72%' }} />
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
