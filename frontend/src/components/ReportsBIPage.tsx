import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart3, FileBarChart2, Target } from 'lucide-react';
import ReportsDashboardBI from './reports/ReportsDashboardBI';
import ReportsDetailed from './reports/ReportsDetailed';
import GoalsAndCommissions from './reports/GoalsAndCommissions';

type TabType = 'dashboard' | 'detailed' | 'goals';

const tabs = [
  { id: 'dashboard' as TabType, label: 'Dashboard BI', icon: BarChart3 },
  { id: 'detailed' as TabType, label: 'Relatórios Detalhes', icon: FileBarChart2 },
  { id: 'goals' as TabType, label: 'Metas e Comissões', icon: Target },
];

const validTabs: TabType[] = ['dashboard', 'detailed', 'goals'];

export default function ReportsBIPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab') as TabType | null;
  const initialTab = urlTab && validTabs.includes(urlTab) ? urlTab : 'dashboard';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-bg-primary">
      <div className="bg-bg-secondary dark:bg-slate-800 border-b border-border shadow-sm">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-bold text-text-primary flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-primary" />
            Relatórios & BI
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Monitoramento estratégico e análise de resultados
          </p>
        </div>

        <div className="px-6 flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchParams({ tab: tab.id }); }}
                className={`
                  relative whitespace-nowrap py-4 px-4 text-sm font-semibold transition-all duration-200
                  flex items-center gap-2
                  ${isActive
                    ? 'text-primary'
                    : 'text-text-muted hover:text-text-primary'
                  }
                `}
              >
                <Icon size={16} />
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 p-6">
        {activeTab === 'dashboard' && <ReportsDashboardBI />}
        {activeTab === 'detailed' && <ReportsDetailed />}
        {activeTab === 'goals' && <GoalsAndCommissions />}
      </div>
    </div>
  );
}