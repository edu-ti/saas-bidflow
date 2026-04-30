import { useState } from 'react';
import { BarChart3, FileText, Landmark, Settings } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import FinancialDashboard from './FinancialDashboard';
import InvoiceManager from '../InvoiceManager';
import BankConciliation from '../BankConciliation';
import TaxSettings from '../TaxSettings';

type Tab = 'dashboard' | 'invoices' | 'conciliation' | 'settings';

const TABS: { key: Tab; label: string; icon: typeof BarChart3 }[] = [
  { key: 'dashboard',     label: 'Fluxo de Caixa',     icon: BarChart3 },
  { key: 'invoices',      label: 'Notas Fiscais',      icon: FileText },
  { key: 'conciliation',  label: 'Conciliação Bancária', icon: Landmark },
  { key: 'settings',      label: 'Configurações Fiscais', icon: Settings },
];

export default function FinanceDashboard() {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const base = dark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900';
  const sub = dark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`min-h-screen p-6 lg:p-8 ${base}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
          Motor Financeiro
        </h1>
        <p className={`text-sm mt-1 ${sub}`}>
          Fluxo de caixa, notas fiscais, conciliação bancária e configurações tributárias
        </p>
      </div>

      {/* Tab Navigation */}
      <div className={`flex gap-1 p-1 rounded-xl mb-8 ${dark ? 'bg-slate-800' : 'bg-slate-200/60'}`}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === key
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                : dark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white/60'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && <FinancialDashboard />}
      {activeTab === 'invoices' && <InvoiceManager />}
      {activeTab === 'conciliation' && <BankConciliation />}
      {activeTab === 'settings' && <TaxSettings />}
    </div>
  );
}
