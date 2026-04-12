import { useState, useEffect } from 'react';
import api from '../lib/axios';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/tenant/users')
      .then(res => setUsers(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestão de Equipa</h1>
          <p className="text-sm text-slate-500">Adicione e remova parceiros na sua empresa</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors">
          + Convidar Membro
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">A carregar membros da equipa...</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Nome do Parceiro</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Email</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Papel (Role)</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Status</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Apenas você está nesta empresa.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mr-3">
                        {u.name.charAt(0)}
                      </div>
                      {u.name}
                    </td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      {u.role === 'Admin' ? (
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-semibold uppercase">Admin</span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold uppercase">{u.role}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${u.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">Editar</button>
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
