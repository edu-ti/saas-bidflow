import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Target,
  Brain,
  Sparkles,
  FileCheck,
  FolderOpen,
  FolderCog,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  ArrowLeft,
  TrendingUp,
  Users
} from 'lucide-react';

interface HubCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onClick: () => void;
  badge?: string;
  variant?: 'default' | 'highlight';
}

function HubCard({ icon, title, description, onClick, badge, variant = 'default' }: HubCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full p-6 rounded-3xl text-left transition-all duration-500
        border flex flex-col gap-4
        ${variant === 'highlight'
          ? 'bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 hover:border-primary hover:ring-2 hover:ring-primary/20'
          : 'bg-surface/50 border-border-subtle hover:border-primary/40 hover:ring-2 hover:ring-primary/20'
        }
      `}
    >
      <div className={`
        w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
        ${variant === 'highlight'
          ? 'bg-primary/20 text-primary group-hover:scale-110'
          : 'bg-surface-elevated text-text-muted group-hover:text-primary group-hover:scale-110'
        }
      `}>
        {icon}
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-text-primary text-sm tracking-tight">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-text-muted font-medium">{description}</p>
        )}
      </div>
      <ChevronRight className="absolute top-6 right-6 w-5 h-5 text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
    </button>
  );
}

interface HubSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function HubSection({ title, icon, children }: HubSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-2">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-text-primary">
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {children}
      </div>
    </div>
  );
}

export default function BiddingHub() {
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen p-8 space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 hover:ring-2 hover:ring-primary/20 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-primary to-secondary rounded-full shadow-platinum-glow" />
              <h1 className="text-3xl font-black tracking-tighter text-text-primary">
                Hub de <span className="text-gradient-gold">Licitações</span>
              </h1>
            </div>
            <p className="text-sm font-medium text-text-muted flex items-center gap-2">
              <ArrowRight size={14} className="text-primary" />
              Central de comandos e ferramentas para gestão de oportunidades
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-surface/50 backdrop-blur-xl rounded-2xl border border-border-subtle">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
            Sistema Online
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <HubSection
          title="Oportunidades de Negócio"
          icon={<Target size={16} />}
        >
          <HubCard
            icon={<FileText size={22} />}
            title="Boletins de Licitações"
            description="Acesso aos editais diários"
            onClick={() => navigate('/bidding-bulletin')}
          />
          <HubCard
            icon={<Search size={22} />}
            title="Encontrar Licitações"
            description="Busca avançada de editais"
            onClick={() => navigate('/bidding-search')}
          />
          <HubCard
            icon={<Target size={22} />}
            title="Licitações Estratégicas"
            description="Oportunidades priorizadas"
            onClick={() => {}}
          />
        </HubSection>

        <HubSection
          title="Inteligência Artificial"
          icon={<Brain size={16} />}
        >
          <HubCard
            icon={<Sparkles size={22} />}
            title="Consultor Jurídico"
            description="Análise legal de editais"
            badge="Novidade"
            variant="highlight"
            onClick={() => navigate('/legal-consultant')}
          />
          <HubCard
            icon={<Brain size={22} />}
            title="Resumo de Edital"
            description="IA extrai pontos do edital"
            onClick={() => {}}
          />
        </HubSection>

        <HubSection
          title="Ferramentas de Gestão"
          icon={<FolderCog size={16} />}
        >
          <HubCard
            icon={<FileCheck size={22} />}
            title="Gerenciar Licitações"
            description="Controle completo"
            onClick={() => navigate('/bidding-manage')}
          />
          <HubCard
            icon={<FolderOpen size={22} />}
            title="Gerenciar Documentos"
            description="Arquivo de documentos"
            onClick={() => navigate('/documents')}
          />
        </HubSection>

        <HubSection
          title="Ferramentas de Automação"
          icon={<MessageSquare size={16} />}
        >
          <HubCard
            icon={<MessageSquare size={22} />}
            title="Monitorar Chat"
            description="Acompanhar conversas IA"
            onClick={() => navigate('/chat-monitor')}
          />
        </HubSection>

        <HubSection
          title="Análise Estratégica"
          icon={<TrendingUp size={16} />}
        >
          <HubCard
            icon={<TrendingUp size={22} />}
            title="Análise de Mercado"
            description="Dashboard de compras públicas"
            onClick={() => navigate('/market-analysis')}
          />
          <HubCard
            icon={<Users size={22} />}
            title="Análise de Concorrentes"
            description="Dossiê corporativo completo"
            onClick={() => navigate('/competitor-analysis')}
          />
        </HubSection>
      </div>
    </div>
  );
}