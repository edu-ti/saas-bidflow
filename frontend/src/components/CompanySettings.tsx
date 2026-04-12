import { useState, useEffect } from 'react';
import api from '../lib/axios';

export default function CompanySettings() {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : { company_id: 'BidFlow' };

  const [companyInfo] = useState({
    name: 'Master Corp Lda',
    cnpj: '00.111.222/0001-33',
    domain: 'mastercorp.bidflow.com',
  });

  const [health, setHealth] = useState({ pending_jobs: 0, failed_jobs: 0, status: 'healthy' });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

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

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Configurações da Empresa</h1>
        <p className="text-sm text-slate-500">Gerencie os dados cadastrais do seu Tenant (ID: {user.company_id})</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Dados Cadastrais</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Razão Social</label>
              <input type="text" readOnly value={companyInfo.name} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-600 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ</label>
              <input type="text" readOnly value={companyInfo.cnpj} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-600 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Subdomínio (BidFlow)</label>
              <input type="text" readOnly value={companyInfo.domain} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-600 outline-none" />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors cursor-not-allowed opacity-50">
              Salvar Alterações
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Integrações de API (Webhooks)</h2>
          <p className="text-sm text-slate-500 mb-4">Configure chaves para o Robô Python de OCR e Radar de Licitações.</p>
          <div className="mt-4 p-4 bg-slate-900 rounded-md">
            <code className="text-emerald-400 text-xs">POST /api/webhooks/radar-sync</code>
            <p className="text-xs text-slate-400 mt-2">Token de Autenticação gerado apenas por Administradores.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Saúde do Sistema (Robô de IA)</h2>
            <button 
              onClick={fetchHealth} 
              className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md text-slate-600 font-medium transition-colors">
              Atualizar Status
            </button>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1 bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Fila de Processamento</p>
                <p className="text-2xl font-bold text-slate-800">{health.pending_jobs}</p>
              </div>
            </div>
            
            <div className={`flex-1 p-4 rounded-lg border flex items-center justify-between ${health.failed_jobs > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
               <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Jobs Falhados</p>
                  <p className={`text-2xl font-bold ${health.failed_jobs > 0 ? 'text-red-600' : 'text-green-600'}`}>{health.failed_jobs}</p>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Auditoria do Kanban (Tracking de Movimentos)</h2>
          <div className="overflow-x-auto border rounded-xl">
             <table className="w-full text-left text-sm text-slate-600">
               <thead className="bg-slate-50 border-b">
                 <tr>
                   <th className="px-4 py-3 font-medium">Usuário</th>
                   <th className="px-4 py-3 font-medium">Ação</th>
                   <th className="px-4 py-3 font-medium">Origem</th>
                   <th className="px-4 py-3 font-medium">Destino</th>
                   <th className="px-4 py-3 font-medium">IP</th>
                   <th className="px-4 py-3 font-medium">Data</th>
                 </tr>
               </thead>
               <tbody className="divide-y">
                 {auditLogs.length > 0 ? auditLogs.map((log: any) => (
                   <tr key={log.id}>
                     <td className="px-4 py-3">{log.user?.name || 'Sistema'}</td>
                     <td className="px-4 py-3">{log.action}</td>
                     <td className="px-4 py-3">{log.old_value}</td>
                     <td className="px-4 py-3 font-semibold text-slate-800">{log.new_value}</td>
                     <td className="px-4 py-3 font-mono text-xs">{log.ip_address}</td>
                     <td className="px-4 py-3 text-xs">{new Date(log.created_at).toLocaleString()}</td>
                   </tr>
                 )) : (
                   <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Nenhum evento registrado.</td></tr>
                 )}
               </tbody>
             </table>
          </div>
        </div>
      </div>
    </div>
  );
}
