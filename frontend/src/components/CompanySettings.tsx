import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const user = storedUser ? JSON.parse(storedUser) : { company_id: 'BidFlow' };

  const [companyInfo, setCompanyInfo] = useState({
    name: 'Master Corp Lda',
    cnpj: '00.111.222/0001-33',
    domain: 'mastercorp.bidflow.com',
  });

  const [health, setHealth] = useState({ pending_jobs: 0, failed_jobs: 0, status: 'healthy' });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
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

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      toast.success('Dados cadastrais atualizados!');
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Configurações da Empresa</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie os dados cadastrais do seu Tenant (ID: {user.company_id})</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Dados Cadastrais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Razão Social</label>
              <input 
                type="text" 
                value={companyInfo.name} 
                onChange={(e) => {
                  setCompanyInfo({...companyInfo, name: e.target.value});
                  setIsEditing(true);
                }}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 dark:text-white transition-colors" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CNPJ</label>
              <input 
                type="text" 
                value={companyInfo.cnpj} 
                onChange={(e) => {
                  setCompanyInfo({...companyInfo, cnpj: e.target.value});
                  setIsEditing(true);
                }}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 dark:text-white transition-colors" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subdomínio (BidFlow)</label>
              <input 
                type="text" 
                value={companyInfo.domain} 
                onChange={(e) => {
                  setCompanyInfo({...companyInfo, domain: e.target.value});
                  setIsEditing(true);
                }}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 dark:text-white transition-colors" 
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={!isEditing || isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar Alterações
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Integrações de API (Webhooks)</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Configure chaves para o Robô Python de OCR e Radar de Licitações.</p>
          <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-800">
            <code className="text-emerald-400 text-sm font-mono block">POST /api/webhooks/radar-sync</code>
            <p className="text-xs text-gray-400 mt-2 font-mono">Token de Autenticação gerado apenas por Administradores.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Saúde do Sistema (Robô de IA)</h2>
            <button 
              onClick={fetchHealth} 
              className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 font-medium transition-colors border border-gray-200 dark:border-gray-600"
            >
              Atualizar Status
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-between transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Fila de Processamento</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{health.pending_jobs}</p>
              </div>
            </div>
            
            <div className={`p-5 rounded-lg border flex items-center justify-between transition-colors ${health.failed_jobs > 0 ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/30' : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/30'}`}>
               <div>
                  <p className={`text-sm font-medium mb-1 ${health.failed_jobs > 0 ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>Jobs Falhados</p>
                  <p className={`text-3xl font-bold ${health.failed_jobs > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-500'}`}>{health.failed_jobs}</p>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Auditoria do Kanban (Tracking de Movimentos)</h2>
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
             <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
               <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                 <tr>
                   <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Usuário</th>
                   <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Ação</th>
                   <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Origem</th>
                   <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Destino</th>
                   <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">IP</th>
                   <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Data</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                 {auditLogs.length > 0 ? auditLogs.map((log) => (
                   <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                     <td className="px-4 py-3">{log.user?.name || 'Sistema'}</td>
                     <td className="px-4 py-3">{log.action}</td>
                     <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{log.old_value}</td>
                     <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{log.new_value}</td>
                     <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{log.ip_address}</td>
                     <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{new Date(log.created_at).toLocaleString()}</td>
                   </tr>
                 )) : (
                   <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">Nenhum evento registrado.</td></tr>
                 )}
               </tbody>
             </table>
          </div>
        </div>
      </div>
    </div>
  );
}

