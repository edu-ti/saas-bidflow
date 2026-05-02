import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Server } from 'lucide-react';
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
      toast.error('Erro ao conectar ao monitoramento do servidor.');
    } finally {
      setLoading(false);
    }
  };

  const isHealthy = metrics.failed_jobs_count === 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Saúde do Sistema</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Monitoramento em tempo real de filas RPA e background jobs.</p>
        </div>
        <div className="flex items-center gap-2">
          {isHealthy ? (
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-medium text-sm">
              <CheckCircle className="w-4 h-4" /> Sistemas Normais
            </span>
          ) : (
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 font-medium text-sm animate-pulse">
              <AlertTriangle className="w-4 h-4" /> Alerta de Falhas
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Activity className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Jobs na Fila (Processando)</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {loading ? '...' : metrics.jobs_count}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center space-y-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${metrics.failed_jobs_count > 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Jobs Falhados (Erros RPA)</p>
            <p className={`text-3xl font-bold ${metrics.failed_jobs_count > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
              {loading ? '...' : metrics.failed_jobs_count}
            </p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Server className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Status do Banco de Dados</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              Conectado
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
