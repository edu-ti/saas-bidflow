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
        group relative w-full p-5 rounded-xl text-left transition-all duration-300
        border flex flex-col gap-3
        ${variant === 'highlight'
          ? 'bg-primary/5 border-primary/20 hover:border-primary hover:bg-primary/10 hover:shadow-sm'
          : 'bg-bg-secondary border-border hover:border-border-hover hover:bg-bg-tertiary hover:shadow-sm'
        }
      `}
    >
      <div className={`
        w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300
        ${variant === 'highlight'
          ? 'bg-primary/10 text-primary group-hover:scale-105'
          : 'bg-bg-tertiary border border-border text-text-secondary group-hover:text-primary group-hover:scale-105 group-hover:border-primary/20'
        }
      `}>
        {icon}
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-text-primary text-sm tracking-tight">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-success/10 text-success rounded-full border border-success/20">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-text-secondary">{description}</p>
        )}
      </div>
      <ChevronRight className="absolute top-5 right-5 w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
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
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <div className="w-6 h-6 rounded flex items-center justify-center text-primary">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-text-primary">
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {children}
      </div>
    </div>
  );
}

export default function BiddingHub() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-md bg-bg-secondary border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
              Hub de Licitações
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Central de comandos e ferramentas para gestão de oportunidades.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full border border-success/20">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-medium text-success">
            Sistema Online
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <HubSection
          title="Oportunidades"
          icon={<Target size={18} />}
        >
          <HubCard
            icon={<FileText size={18} />}
            title="Boletins de Licitações"
            description="Acesso aos editais diários"
            onClick={() => navigate('/bidding-bulletin')}
          />
          <HubCard
            icon={<Search size={18} />}
            title="Encontrar Licitações"
            description="Busca avançada de editais"
            onClick={() => navigate('/bidding-search')}
          />
          <HubCard
            icon={<Target size={18} />}
            title="Licitações Estratégicas"
            description="Oportunidades priorizadas"
            onClick={() => {}}
          />
        </HubSection>

        <HubSection
          title="Inteligência Artificial"
          icon={<Brain size={18} />}
        >
          <HubCard
            icon={<Sparkles size={18} />}
            title="Consultor Jurídico"
            description="Análise legal de editais"
            badge="Novo"
            variant="highlight"
            onClick={() => navigate('/legal-consultant')}
          />
          <HubCard
            icon={<Brain size={18} />}
            title="Resumo de Edital"
            description="IA extrai pontos do edital"
            onClick={() => {}}
          />
        </HubSection>

        <HubSection
          title="Gestão"
          icon={<FolderCog size={18} />}
        >
          <HubCard
            icon={<FileCheck size={18} />}
            title="Gerenciar Licitações"
            description="Controle completo do fluxo"
            onClick={() => navigate('/bidding-manage')}
          />
          <HubCard
            icon={<FolderOpen size={18} />}
            title="Documentos"
            description="Arquivo de habilitação"
            onClick={() => navigate('/documents')}
          />
        </HubSection>

        <div className="space-y-6">
          <HubSection
            title="Automação"
            icon={<MessageSquare size={18} />}
          >
            <HubCard
              icon={<MessageSquare size={18} />}
              title="Monitorar Chat"
              description="Acompanhar conversas IA"
              onClick={() => navigate('/chat-monitor')}
            />
          </HubSection>

          <HubSection
            title="Análise Estratégica"
            icon={<TrendingUp size={18} />}
          >
            <HubCard
              icon={<TrendingUp size={18} />}
              title="Análise de Mercado"
              description="Painel de compras"
              onClick={() => navigate('/market-analysis')}
            />
            <HubCard
              icon={<Users size={18} />}
              title="Concorrentes"
              description="Dossiê corporativo"
              onClick={() => navigate('/competitor-analysis')}
            />
          </HubSection>
        </div>
      </div>
    </div>
  );
}