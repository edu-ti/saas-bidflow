import { useState, useEffect } from 'react';
import api from '../lib/axios';

interface AccountsPayable {
  id: number;
  reference_title: string;
  amount: string;
  due_date: string;
  status: string;
}

interface AccountsReceivable {
  id: number;
  reference_title: string;
  amount: string;
  due_date: string;
  status: string;
}

export default function Finance() {
  const [payables, setPayables] = useState<AccountsPayable[]>([]);
  const [receivables, setReceivables] = useState<AccountsReceivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'receivable' | 'payable'>('receivable');

  useEffect(() => {
    Promise.all([
      api.get('/api/accounts-payable'),
      api.get('/api/accounts-receivable')
    ]).then(([resPayable, resReceivable]) => {
      setPayables(resPayable.data.data);
      setReceivables(resReceivable.data.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val: string) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(val));
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Paid': return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-medium">Pago</span>;
      case 'Overdue': return <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-medium">Atrasado</span>;
      case 'Cancelled': return <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-medium">Cancelado</span>;
      default: return <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-medium">Pendente</span>;
    }
  };

  const currentData = tab === 'receivable' ? receivables : payables;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financeiro Pro</h1>
          <p className="text-sm text-slate-500">Gestão global de Tesouraria (Contas Pagar/Receber)</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors">
          + Lançamento
        </button>
      </div>

      <div className="mb-6 border-b border-slate-200">
        <div className="flex space-x-8">
          <button 
            onClick={() => setTab('receivable')}
            className={`pb-4 text-sm font-medium transition-colors border-b-2 ${tab === 'receivable' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            Contas a Receber
          </button>
          <button 
            onClick={() => setTab('payable')}
            className={`pb-4 text-sm font-medium transition-colors border-b-2 ${tab === 'payable' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            Contas a Pagar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">A carregar registos financeiros...</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Título / Referência</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Vencimento</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Status</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Nenhum registo financeiro encontrado.
                  </td>
                </tr>
              ) : (
                currentData.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{item.reference_title}</td>
                    <td className="px-6 py-4">{item.due_date}</td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    <td className={`px-6 py-4 text-right font-bold ${tab === 'receivable' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(item.amount)}
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
