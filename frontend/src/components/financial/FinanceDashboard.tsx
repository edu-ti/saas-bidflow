import { useState } from 'react';
import { BarChart3, FileText, Landmark, Settings, Wallet, ShieldCheck } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="p-8 h-screen w-full flex flex-col bg-background space-y-8 overflow-hidden">
      {/* Platinum Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Motor <span className="text-gradient-gold">Financeiro</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <ShieldCheck size={12} className="text-primary" />
            Gestão de tesouraria, fluxo de caixa e conformidade fiscal Platinum.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white/[0.02] border border-white/5 px-6 py-3 rounded-xl flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Status da Operação</span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-tighter">Sincronizado</span>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <Wallet className="text-primary w-5 h-5" />
          </div>
        </div>
      </header>

      {/* Premium Tab Navigation */}
      <div className="flex gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === key
                ? 'bg-primary text-background shadow-platinum-glow'
                : 'text-text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content Area - Platinum Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-platinum pr-2">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === 'dashboard' && <FinancialDashboard />}
          {activeTab === 'invoices' && <InvoiceManager />}
          {activeTab === 'conciliation' && <BankConciliation />}
          {activeTab === 'settings' && <TaxSettings />}
        </div>
      </div>
    </div>
  );
}
