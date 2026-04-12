import { useState, useEffect } from 'react';
import api from '../lib/axios';

interface Contact {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
}

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/contacts')
      .then(res => setContacts(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contactos</h1>
          <p className="text-sm text-slate-500">Gestão global de contactos</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">A carregar contactos...</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Nome</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Cargo</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Email</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Telefone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Nenhum registo encontrado.
                  </td>
                </tr>
              ) : (
                contacts.map(contact => (
                  <tr key={contact.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{contact.name}</td>
                    <td className="px-6 py-4">{contact.position || '-'}</td>
                    <td className="px-6 py-4">{contact.email || '-'}</td>
                    <td className="px-6 py-4">{contact.phone || '-'}</td>
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
