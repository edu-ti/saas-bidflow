import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  AlertTriangle,
  UserX,
  Ban,
  ShieldAlert,
  Building2,
  MapPin,
  Phone,
  Mail,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  FileText,
  ChevronDown
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend
} from 'recharts';

const COMPETITOR_DATA = {
  name: '43.971.162 EDUARDO CABRAL DE SOUZA',
  cnpj: '43.971.162/0001-22',
  address: 'Rua das Flores, 123 - Centro - São Paulo/SP',
  phone: '(11) 99999-9999',
  email: 'contato@eduardocabral.com.br',
  socios: [
    'Eduardo Cabral de Souza (100%)',
    'Maria Silva Souza (0%)'
  ],
  segmentos: [
    'Serviços de Limpeza',
    'Manutenção Predial',
    'Serviços de Vigilância',
    'Locação de Equipamentos'
  ]
};

const DISQUALIFICATION_REASONS = [
  { name: 'Documentação Incompleta', value: 35 },
  { name: 'Proposta Abaixo do Lance', value: 25 },
  { name: 'Ausência de Qualificação', value: 20 },
  { name: 'Irregularidade Fiscal', value: 12 },
  { name: '其他 Motivos', value: 8 }
];

const COLORS = ['#6366f1', '#14b8a6', '#8b5cf6', '#f59e0b', '#64748b'];

const participationData = {
  total: 156,
  won: 89,
  lost: 67,
  totalValue: 45000000
};

const contractsByState = [
  { state: 'SP', count: 45, value: 18000000 },
  { state: 'MG', count: 23, value: 9500000 },
  { state: 'RS', count: 18, value: 7200000 },
  { state: 'PR', count: 12, value: 5800000 },
  { state: 'RJ', count: 8, value: 4500000 }
];

const wonItems = [
  { item: 'Serviço de Limpeza - Escola Municipal', org: 'Prefeitura de São Paulo', value: 2500000, date: '15/03/2024' },
  { item: 'Manutenção Predial - Hospital', org: 'Governo do Estado de SP', value: 1800000, date: '10/02/2024' },
  { item: 'Vigilância - Universidade Federal', org: 'UFSP', value: 1200000, date: '05/01/2024' }
];

const sanctions = [
  { id: '1', organ: 'Tribunal de Contas da União', sanction: 'Multa por irregularities', startDate: '15/01/2023', endDate: '15/01/2025', status: 'Ativa' },
  { id: '2', organ: 'Prefeitura Municipal', sanction: 'Suspensão temporária', startDate: '20/06/2022', endDate: '20/12/2022', status: 'Encerrada' },
  { id: '3', organ: 'Governo do Estado', sanction: 'Declaração de inidoneidade', startDate: '10/10/2021', endDate: '10/10/2023', status: 'Encerrada' }
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}

export default function CompetitorAnalysis() {
  const navigate = useNavigate();
  const [searchCNPJ, setSearchCNPJ] = useState('43.971.162/0001-22');
  const [showAdmin, setShowAdmin] = useState(true);
  const [showParticipation, setShowParticipation] = useState(true);
  const [showSanctions, setShowSanctions] = useState(true);
  const [showStrategic, setShowStrategic] = useState(true);

  const winRate = Math.round((participationData.won / participationData.total) * 100);
  const lossRate = 100 - winRate;

  return (
    <div className="min-h-screen space-y-6 animate-in fade-in duration-700 p-8">
      <header className="flex items-center gap-4">
        <button
          onClick={() => navigate('/bidding-hub')}
          className="w-10 h-10 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 hover:ring-2 hover:ring-primary/20 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tighter text-text-primary">
            Análise de <span className="text-gradient-gold">Concorrentes</span>
          </h1>
          <p className="text-sm font-medium text-text-muted">
            Dossiê corporativo completo e análise de vulnerabilidades
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-3xl p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchCNPJ}
                onChange={(e) => setSearchCNPJ(e.target.value)}
                placeholder="Buscar novo CNPJ..."
                className="w-full pl-12 pr-4 py-4 bg-surface-elevated/50 border border-border-subtle rounded-2xl text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <button className="px-8 py-4 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-primary/90 transition-all shadow-platinum-glow">
              Buscar
            </button>
          </div>
        </div>

        <div className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-text-primary">{COMPETITOR_DATA.name}</h2>
              <p className="text-sm text-text-muted mt-1">CNPJ: {COMPETITOR_DATA.cnpj}</p>
            </div>
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <span className="text-sm font-bold text-emerald-400">Empresa Ativa</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-3xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle size={20} className="text-yellow-500" />
              <span className="text-xs font-black uppercase tracking-wider text-yellow-500">Desclassificações</span>
            </div>
            <p className="text-3xl font-black text-yellow-400">23</p>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-3xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <UserX size={20} className="text-yellow-500" />
              <span className="text-xs font-black uppercase tracking-wider text-yellow-500">Inabilitações</span>
            </div>
            <p className="text-3xl font-black text-yellow-400">12</p>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-3xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <Ban size={20} className="text-yellow-500" />
              <span className="text-xs font-black uppercase tracking-wider text-yellow-500">Sanções</span>
            </div>
            <p className="text-3xl font-black text-yellow-400">3</p>
          </div>
        </div>

        <div className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-3xl overflow-hidden">
          <button
            onClick={() => setShowAdmin(!showAdmin)}
            className="w-full p-6 flex items-center justify-between hover:bg-surface-elevated/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Building2 size={20} className="text-primary" />
              <h3 className="text-sm font-black uppercase tracking-wider text-text-primary">Análise Administrativa</h3>
            </div>
            <ChevronDown className={`w-5 h-5 text-text-muted transition-transform ${showAdmin ? 'rotate-180' : ''}`} />
          </button>
          {showAdmin && (
            <div className="px-6 pb-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface-elevated/30 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={14} className="text-text-muted" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Endereço</span>
                  </div>
                  <p className="text-sm text-text-primary">{COMPETITOR_DATA.address}</p>
                </div>
                <div className="p-4 bg-surface-elevated/30 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone size={14} className="text-text-muted" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Telefone</span>
                  </div>
                  <p className="text-sm text-text-primary">{COMPETITOR_DATA.phone}</p>
                </div>
              </div>
              <div className="p-4 bg-surface-elevated/30 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Mail size={14} className="text-text-muted" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">E-mail</span>
                </div>
                <p className="text-sm text-text-primary">{COMPETITOR_DATA.email}</p>
              </div>
              <div className="p-4 bg-surface-elevated/30 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Users size={14} className="text-text-muted" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Sócios</span>
                </div>
                <div className="space-y-2">
                  {COMPETITOR_DATA.socios.map((socio, idx) => (
                    <p key={idx} className="text-sm text-text-primary">{socio}</p>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-surface-elevated/30 rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-wider text-text-muted mb-3 block">Segmentos / CNAEs</span>
                <div className="flex flex-wrap gap-2">
                  {COMPETITOR_DATA.segmentos.map((seg, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
                      {seg}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-3xl overflow-hidden">
          <button
            onClick={() => setShowParticipation(!showParticipation)}
            className="w-full p-6 flex items-center justify-between hover:bg-surface-elevated/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <TrendingUp size={20} className="text-primary" />
              <h3 className="text-sm font-black uppercase tracking-wider text-text-primary">Participações</h3>
            </div>
            <ChevronDown className={`w-5 h-5 text-text-muted transition-transform ${showParticipation ? 'rotate-180' : ''}`} />
          </button>
          {showParticipation && (
            <div className="px-6 pb-6 space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-surface-elevated/30 rounded-2xl text-center">
                  <p className="text-[10px] font-black uppercase tracking-wider text-text-muted mb-2">Disputas Participadas</p>
                  <p className="text-2xl font-black text-text-primary">{participationData.total}</p>
                </div>
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-500 mb-2">Vencidas</p>
                  <p className="text-2xl font-black text-emerald-400">{participationData.won}</p>
                </div>
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-center">
                  <p className="text-[10px] font-black uppercase tracking-wider text-red-500 mb-2">Não Vencidas</p>
                  <p className="text-2xl font-black text-red-400">{participationData.lost}</p>
                </div>
                <div className="p-4 bg-surface-elevated/30 rounded-2xl text-center">
                  <p className="text-[10px] font-black uppercase tracking-wider text-text-muted mb-2">Valor Total Vencido</p>
                  <p className="text-2xl font-black text-emerald-400">{formatCurrency(participationData.totalValue)}</p>
                </div>
              </div>

              <div className="p-4 bg-surface-elevated/30 rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-wider text-text-muted mb-4 block">Vitórias vs Derrotas</span>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-4 bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${winRate}%` }} />
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-bold text-emerald-400">{winRate}%</span>
                    <span className="font-bold text-red-400">{lossRate}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-surface-elevated/30 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin size={14} className="text-text-muted" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Contratos por Estado</span>
                  </div>
                  <div className="space-y-3">
                    {contractsByState.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm font-bold text-text-primary">{item.state}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-text-muted">{item.count} contratos</span>
                          <span className="text-sm font-bold text-emerald-400">{formatCurrency(item.value)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-surface-elevated/30 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText size={14} className="text-text-muted" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Itens Vencidos</span>
                  </div>
                  <div className="space-y-3">
                    {wonItems.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <p className="text-sm font-bold text-text-primary">{item.item}</p>
                        <div className="flex items-center justify-between text-xs text-text-muted">
                          <span>{item.org}</span>
                          <span className="text-emerald-400 font-bold">{formatCurrency(item.value)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-3xl overflow-hidden">
          <button
            onClick={() => setShowSanctions(!showSanctions)}
            className="w-full p-6 flex items-center justify-between hover:bg-surface-elevated/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ShieldAlert size={20} className="text-primary" />
              <h3 className="text-sm font-black uppercase tracking-wider text-text-primary">Sanções / Penalizações</h3>
            </div>
            <ChevronDown className={`w-5 h-5 text-text-muted transition-transform ${showSanctions ? 'rotate-180' : ''}`} />
          </button>
          {showSanctions && (
            <div className="px-6 pb-6 space-y-4">
              <input
                type="text"
                placeholder="Buscar sanções..."
                className="w-full px-4 py-3 bg-surface-elevated/50 border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50"
              />
              <div className="bg-surface-elevated rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-subtle/50">
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-text-muted">Órgão Sancionador</th>
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-text-muted">Sanção</th>
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-text-muted">Início</th>
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-text-muted">Fim</th>
                      <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-text-muted">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sanctions.map((s) => (
                      <tr key={s.id} className="border-b border-border-subtle/30 hover:bg-surface/30 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-text-primary">{s.organ}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-text-secondary">{s.sanction}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-text-muted">{s.startDate}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-text-muted">{s.endDate}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-full ${
                            s.status === 'Ativa' 
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                              : 'bg-surface-elevated text-text-muted border border-border-subtle'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-3xl overflow-hidden">
          <button
            onClick={() => setShowStrategic(!showStrategic)}
            className="w-full p-6 flex items-center justify-between hover:bg-surface-elevated/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <TrendingUp size={20} className="text-primary" />
              <h3 className="text-sm font-black uppercase tracking-wider text-text-primary">Aspectos Estratégicos</h3>
            </div>
            <ChevronDown className={`w-5 h-5 text-text-muted transition-transform ${showStrategic ? 'rotate-180' : ''}`} />
          </button>
          {showStrategic && (
            <div className="px-6 pb-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Principais Motivos para Desclassificação / Inabilitação</span>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={DISQUALIFICATION_REASONS}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {DISQUALIFICATION_REASONS.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--color-surface)', 
                        border: '1px solid var(--color-border-medium)', 
                        borderRadius: '16px', 
                        fontSize: '11px', 
                        fontWeight: 'bold' 
                      }}
                      formatter={(value: number) => [`${value}%`, 'Percentual']}
                    />
                    <Legend 
                      iconType="circle" 
                      wrapperStyle={{ fontSize: '11px', fontWeight: '600' }}
                      formatter={(value) => <span className="text-text-secondary">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}