import { useState, useEffect } from 'react';
import api from '../lib/axios';

interface EmailCampaign {
  id: number;
  subject: string;
  status: string;
  sent_at: string | null;
}

export default function EmailMarketing() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/email-campaigns')
      .then(res => setCampaigns(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">E-mail Marketing</h1>
          <p className="text-sm text-slate-500">Gestão e Disparo de Campanhas para Base de Leads</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors">
          Escrever Campanha
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">A carregar campanhas...</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Assunto</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Status</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Data de Disparo</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma campanha de e-mail registada.
                  </td>
                </tr>
              ) : (
                campaigns.map(campaign => (
                  <tr key={campaign.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{campaign.subject}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${campaign.status === 'Sent' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{campaign.sent_at || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      {campaign.status !== 'Sent' && (
                        <button className="text-blue-600 hover:text-blue-800 text-xs font-medium mr-3">
                          Editar / Enviar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
