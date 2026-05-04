import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Clock,
  Star,
  MapPin,
  Calendar,
  Building2,
  DollarSign,
  Eye,
  Download,
  Sparkles,
  FileCheck,
  MessageSquare,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';

interface BiddingResult {
  id: string;
  object: string;
  agency: string;
  uf: string;
  openingDate: string;
  modality: string;
  estimatedValue: number;
  portal: string;
  status: 'NOVA' | 'RETIFICAÇÃO' | 'ABERTA' | 'ENCERRADA';
  lastUpdate: string;
  daysToClose: number;
  isUrgent: boolean;
}

const mockResults: BiddingResult[] = [
  {
    id: '2024/001234',
    object: 'Contratação de serviços de limpeza e conservação predial para órgãos públicos federais',
    agency: 'Ministério da Educação',
    uf: 'DF',
    openingDate: '05/06/2024',
    modality: 'Pregão Eletrônico',
    estimatedValue: 2500000,
    portal: 'Comprasnet',
    status: 'ABERTA',
    lastUpdate: '02/05/2024',
    daysToClose: 1,
    isUrgent: true
  },
  {
    id: '2024/001235',
    object: 'Fornecimento de equipamentos de informática para universidades federais',
    agency: 'Universidade Federal do Rio Grande do Sul',
    uf: 'RS',
    openingDate: '20/06/2024',
    modality: 'Concorrência',
    estimatedValue: 5800000,
    portal: 'Comprasnet',
    status: 'NOVA',
    lastUpdate: '03/05/2024',
    daysToClose: 15,
    isUrgent: false
  },
  {
    id: '2024/001236',
    object: 'Contratação de empresa para execução de obras de reforma em hospitais',
    agency: 'Secretaria de Saúde do Estado de São Paulo',
    uf: 'SP',
    openingDate: '08/06/2024',
    modality: 'Tomada de Preços',
    estimatedValue: 12000000,
    portal: 'Comprasnet',
    status: 'ABERTA',
    lastUpdate: '01/05/2024',
    daysToClose: 3,
    isUrgent: true
  },
  {
    id: '2024/001237',
    object: 'Aquisição de veículos para frota oficial do governo',
    agency: 'Ministério da Defesa',
    uf: 'DF',
    openingDate: '18/06/2024',
    modality: 'Pregão Eletrônico',
    estimatedValue: 8500000,
    portal: 'Comprasnet',
    status: 'NOVA',
    lastUpdate: '04/05/2024',
    daysToClose: 20,
    isUrgent: false
  },
  {
    id: '2024/001238',
    object: 'Serviços de vigilância e segurança patrimonial para órgãos públicos',
    agency: 'Polícia Federal',
    uf: 'DF',
    openingDate: '06/06/2024',
    modality: 'Pregão Eletrônico',
    estimatedValue: 3200000,
    portal: 'Comprasnet',
    status: 'RETIFICAÇÃO',
    lastUpdate: '04/05/2024',
    daysToClose: 2,
    isUrgent: true
  }
];

const statusColors: Record<string, string> = {
  NOVA: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  RETIFICAÇÃO: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  ABERTA: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ENCERRADA: 'bg-text-muted/20 text-text-muted border-text-muted/30'
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(value);
}

function getDaysText(days: number) {
  if (days === 1) return '1 dia para encerrar';
  if (days <= 3) return `${days} dias para encerrar`;
  return `${days} dias restantes`;
}

export default function BiddingBulletin() {
  const navigate = useNavigate();
  const [favorited, setFavorited] = useState<Set<string>>(new Set());

  const today = new Date();
  const editionNumber = Math.floor(Math.random() * 900) + 100;

  const handleFavorite = (id: string) => {
    setFavorited(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen space-y-6 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/bidding-hub')}
            className="w-10 h-10 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 hover:ring-2 hover:ring-primary/20 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-primary" />
              <h1 className="text-2xl font-black tracking-tighter text-text-primary">
                Boletim de <span className="text-gradient-gold">Licitações</span>
              </h1>
            </div>
            <p className="text-sm font-medium text-text-muted">
              {today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })} - Edição: {editionNumber}
            </p>
          </div>
        </div>
        <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.02] transition-transform shadow-platinum-glow">
          <Sparkles size={16} />
          Resumo do Boletim
        </button>
      </header>

      <div className="flex items-center gap-4 p-4 bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-2xl">
        <div className="flex-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-text-muted mb-2 block">Situação</label>
          <div className="relative">
            <select className="w-full px-4 py-2.5 bg-surface-elevated/50 border border-border-subtle rounded-xl text-sm text-text-primary appearance-none focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 cursor-pointer">
              <option value="">Todas as situações</option>
              <option value="nova">Nova</option>
              <option value="retificacao">Retificação</option>
              <option value="aberta">Aberta</option>
              <option value="encerrada">Encerrada</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-text-muted mb-2 block">Estados</label>
          <div className="relative">
            <select className="w-full px-4 py-2.5 bg-surface-elevated/50 border border-border-subtle rounded-xl text-sm text-text-primary appearance-none focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 cursor-pointer">
              <option value="">Todos os estados</option>
              <option value="SP">São Paulo</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="MG">Minas Gerais</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="PR">Paraná</option>
              <option value="DF">Distrito Federal</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-text-muted mb-2 block">Status</label>
          <div className="relative">
            <select className="w-full px-4 py-2.5 bg-surface-elevated/50 border border-border-subtle rounded-xl text-sm text-text-primary appearance-none focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 cursor-pointer">
              <option value="">Todos os status</option>
              <option value="urgente">Urgente</option>
              <option value="normal">Normal</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {mockResults.map((result) => (
          <div
            key={result.id}
            className={`
              relative bg-surface/50 backdrop-blur-xl border rounded-3xl p-6 space-y-5 transition-all duration-300 group
              ${result.isUrgent ? 'border-red-500/50 hover:border-red-500 hover:ring-2 hover:ring-red-500/20' : 'border-border-subtle hover:border-primary/30 hover:ring-2 hover:ring-primary/20'}
            `}
          >
            {result.isUrgent && (
              <div className="absolute -top-3 -right-3 flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-[9px] font-black uppercase tracking-wider rounded-full shadow-lg">
                <AlertTriangle size={12} />
                Urgente
              </div>
            )}

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-base font-bold text-text-primary leading-snug">
                    {result.object}
                  </h3>
                  <span className="text-xs font-mono text-text-muted bg-surface-elevated px-2 py-1 rounded">
                    {result.id}
                  </span>
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider border rounded-full ${statusColors[result.status]}`}>
                    {result.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-text-muted" />
                <span className="text-text-muted">Abertura:</span>
                <span className="font-bold text-text-primary">{result.openingDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className={result.daysToClose <= 3 ? 'text-orange-500' : 'text-text-muted'} />
                <span className={result.daysToClose <= 3 ? 'font-bold text-orange-500' : 'text-text-muted'}>
                  {getDaysText(result.daysToClose)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center">
                  <Building2 size={14} className="text-text-muted" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Órgão</p>
                  <p className="text-sm font-bold text-text-primary truncate max-w-[180px]">{result.agency}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center">
                  <MapPin size={14} className="text-text-muted" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">UF</p>
                  <p className="text-sm font-bold text-text-primary">{result.uf}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center">
                  <FileText size={14} className="text-text-muted" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Modalidade</p>
                  <p className="text-sm font-bold text-text-primary truncate">{result.modality}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign size={14} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Valor</p>
                  <p className="text-sm font-bold text-emerald-400">{formatCurrency(result.estimatedValue)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-border-subtle">
              <button
                onClick={() => handleFavorite(result.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-all
                  ${favorited.has(result.id)
                    ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                    : 'bg-surface-elevated hover:bg-primary/10 border-border-subtle hover:border-primary/30 text-text-secondary hover:text-primary'
                  }
                `}
              >
                <Star size={16} className={favorited.has(result.id) ? 'fill-current' : ''} />
                {favorited.has(result.id) ? 'Favoritado' : 'Favoritar'}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-primary/10 border border-border-subtle hover:border-primary/30 rounded-xl text-sm font-medium text-text-secondary hover:text-primary transition-all">
                <Eye size={16} />
                Ver Itens
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-primary/10 border border-border-subtle hover:border-primary/30 rounded-xl text-sm font-medium text-text-secondary hover:text-primary transition-all">
                <Download size={16} />
                Baixar Edital
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 border border-primary/30 rounded-xl text-sm font-medium text-primary transition-all">
                <Sparkles size={16} />
                Resumo IA
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-primary/10 border border-border-subtle hover:border-primary/30 rounded-xl text-sm font-medium text-text-secondary hover:text-primary transition-all">
                <MessageSquare size={16} />
                Monitorar Chat
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}