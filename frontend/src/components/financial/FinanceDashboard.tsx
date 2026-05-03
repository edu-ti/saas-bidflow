import { useState } from 'react';
import { BarChart3, FileText, Landmark, Settings, Wallet, ShieldCheck, ChevronRight, Activity } from 'lucide-react';
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
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700 overflow-x-hidden">
      {/* Platinum Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Motor <span className="text-gradient-gold">Financeiro</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <ShieldCheck size={14} className="text-primary" />
            Gestão de tesouraria, fluxo de caixa e conformidade fiscal Platinum.
          </p>
        </div>
        <div className="flex items-center gap-5">
          <div className="bg-surface-elevated/20 border border-border-subtle px-6 py-3 rounded-2xl flex items-center gap-4 shadow-platinum-glow-sm backdrop-blur-md">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60 italic">Status Operacional</span>
              <span className="text-[11px] font-black text-emerald-500 uppercase tracking-tighter flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                Sincronizado
              </span>
            </div>
            <div className="w-px h-8 bg-border-subtle" />
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-platinum-glow-sm">
              <Wallet size={20} />
            </div>
          </div>
        </div>
      </header>

      {/* Premium Tab Navigation */}
      <div className="flex items-center gap-3 bg-surface-elevated/20 border border-border-subtle p-2 rounded-[2.5rem] w-fit shadow-platinum-glow-sm backdrop-blur-md">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-3 px-8 py-3.5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
              activeTab === key
                ? 'bg-primary text-background shadow-platinum-glow'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated/50'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content Area - Platinum Scrollable */}
      <div className="flex-1 min-h-[600px]">
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
