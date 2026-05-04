import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Star,
  FileCheck,
  Clock,
  CheckCircle,
  Eye,
  Download,
  Sparkles,
  MessageSquare,
  FolderOpen,
  Send,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';

interface ManagedBidding {
  id: string;
  object: string;
  agency: string;
  uf: string;
  openingDate: string;
  modality: string;
  estimatedValue: number;
  phase: 'NOVA' | 'EM_DISPUTA' | 'ANALISE' | 'REABERTURA' | 'FINALIZADA';
  lastUpdate: string;
}

const mockManaged: ManagedBidding[] = [
  {
    id: '2024/001234',
    object: 'Contratação de serviços de limpeza e conservação predial para órgãos públicos federais',
    agency: 'Ministério da Educação',
    uf: 'DF',
    openingDate: '15/06/2024',
    modality: 'Pregão Eletrônico',
    estimatedValue: 2500000,
    phase: 'EM_DISPUTA',
    lastUpdate: '02/05/2024'
  },
  {
    id: '2024/001235',
    object: 'Fornecimento de equipamentos de informática para universidades federais',
    agency: 'Universidade Federal do Rio Grande do Sul',
    uf: 'RS',
    openingDate: '20/06/2024',
    modality: 'Concorrência',
    estimatedValue: 5800000,
    phase: 'NOVA',
    lastUpdate: '03/05/2024'
  },
  {
    id: '2024/001236',
    object: 'Contratação de empresa para execução de obras de reforma em hospitais',
    agency: 'Secretaria de Saúde do Estado de São Paulo',
    uf: 'SP',
    openingDate: '25/06/2024',
    modality: 'Tomada de Preços',
    estimatedValue: 12000000,
    phase: 'ANALISE',
    lastUpdate: '01/05/2024'
  },
  {
    id: '2024/001237',
    object: 'Aquisição de veículos para frota oficial do governo',
    agency: 'Ministério da Defesa',
    uf: 'DF',
    openingDate: '18/06/2024',
    modality: 'Pregão Eletrônico',
    estimatedValue: 8500000,
    phase: 'FINALIZADA',
    lastUpdate: '04/05/2024'
  },
  {
    id: '2024/001238',
    object: 'Serviços de vigilância e segurança patrimonial para órgãos públicos',
    agency: 'Polícia Federal',
    uf: 'DF',
    openingDate: '06/06/2024',
    modality: 'Pregão Eletrônico',
    estimatedValue: 3200000,
    phase: 'REABERTURA',
    lastUpdate: '04/05/2024'
  }
];

const phaseLabels: Record<string, { label: string; color: string; bg: string }> = {
  NOVA: { label: 'NOVA', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  EM_DISPUTA: { label: 'EM DISPUTA', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  ANALISE: { label: 'ANÁLISE', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  REABERTURA: { label: 'REABERTURA', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  FINALIZADA: { label: 'FINALIZADA', color: 'text-text-muted', bg: 'bg-text-muted/20' }
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(value);
}

function PhaseIndicator({ phase }: { phase: string }) {
  const phases = ['NOVA', 'EM_DISPUTA', 'ANALISE', 'REABERTURA', 'FINALIZADA'];
  const currentIndex = phases.indexOf(phase);

  return (
    <div className="flex items-center gap-2">
      {phases.map((p, idx) => (
        <div key={p} className="flex items-center gap-2">
          <div className={`
            w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black uppercase
            ${idx <= currentIndex ? phaseLabels[phase].bg : 'bg-surface-elevated'}
            ${idx <= currentIndex ? phaseLabels[phase].color : 'text-text-muted/30'}
          `}>
            {idx < currentIndex ? '✓' : idx === currentIndex ? idx + 1 : idx + 1}
          </div>
          {idx < phases.length - 1 && (
            <div className={`w-8 h-0.5 ${idx < currentIndex ? 'bg-primary' : 'bg-border-subtle'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ManageBiddings() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [sentNotes, setSentNotes] = useState<Record<string, string[]>>({});

  const handleSendNote = (id: string) => {
    if (!notes[id]?.trim()) return;
    setSentNotes(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), notes[id]]
    }));
    setNotes(prev => ({ ...prev, [id]: '' }));
  };

  const stats = {
    favorited: mockManaged.filter(b => b.phase !== 'FINALIZADA').length,
    managed: mockManaged.length,
    ongoing: mockManaged.filter(b => b.phase === 'EM_DISPUTA' || b.phase === 'ANALISE').length,
    finished: mockManaged.filter(b => b.phase === 'FINALIZADA').length
  };

  return (
    <div className="min-h-screen space-y-6 animate-in fade-in duration-700">
      <header className="flex items-center gap-4">
        <button
          onClick={() => navigate('/bidding-hub')}
          className="w-10 h-10 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 hover:ring-2 hover:ring-primary/20 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tighter text-text-primary">
            Gerenciar <span className="text-gradient-gold">Licitações</span>
          </h1>
          <p className="text-sm font-medium text-text-muted">
            Suas licitações favoritadas e em acompanhamento
          </p>
        </div>
      </header>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-2xl p-5 flex items-center gap-4 hover:border-primary/30 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Calendar size={28} className="text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Calendário</p>
            <p className="text-xl font-black text-text-primary">12</p>
          </div>
        </div>

        <div className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-2xl p-5 flex items-center gap-4 hover:border-primary/30 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <Star size={28} className="text-red-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Favoritadas</p>
            <p className="text-xl font-black text-text-primary">{stats.favorited}</p>
          </div>
        </div>

        <div className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-2xl p-5 flex items-center gap-4 hover:border-primary/30 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <FileCheck size={28} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Gerenciadas</p>
            <p className="text-xl font-black text-text-primary">{stats.managed}</p>
          </div>
        </div>

        <div className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-2xl p-5 flex items-center gap-4 hover:border-primary/30 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <Clock size={28} className="text-amber-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Andamentos</p>
            <p className="text-xl font-black text-text-primary">{stats.ongoing}</p>
          </div>
        </div>

        <div className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-2xl p-5 flex items-center gap-4 hover:border-primary/30 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-surface-elevated flex items-center justify-center">
            <CheckCircle size={28} className="text-text-muted" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Finalizadas</p>
            <p className="text-xl font-black text-text-primary">{stats.finished}</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {mockManaged.map((bidding) => (
          <div
            key={bidding.id}
            className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-3xl p-6 space-y-5 hover:border-primary/30 hover:ring-2 hover:ring-primary/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-border-subtle">
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-text-muted bg-surface-elevated px-2 py-1 rounded">
                  {bidding.id}
                </span>
                <PhaseIndicator phase={bidding.phase} />
              </div>
              <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider border rounded-full ${phaseLabels[bidding.phase].bg} ${phaseLabels[bidding.phase].color} border-current`}>
                {phaseLabels[bidding.phase].label}
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-text-primary leading-snug">
                {bidding.object}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Abertura</p>
                  <p className="font-bold text-text-primary">{bidding.openingDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Órgão</p>
                  <p className="font-bold text-text-primary truncate">{bidding.agency}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">UF</p>
                  <p className="font-bold text-text-primary">{bidding.uf}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Modalidade</p>
                  <p className="font-bold text-text-primary truncate">{bidding.modality}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Valor Estimado</p>
                  <p className="font-bold text-emerald-400">{formatCurrency(bidding.estimatedValue)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-border-subtle">
              <button className="flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-primary/10 border border-border-subtle hover:border-primary/30 rounded-xl text-sm font-medium text-text-secondary hover:text-primary transition-all">
                <Eye size={16} />
                Ver itens
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-primary/10 border border-border-subtle hover:border-primary/30 rounded-xl text-sm font-medium text-text-secondary hover:text-primary transition-all">
                <Download size={16} />
                Baixar Edital
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 border border-primary/30 rounded-xl text-sm font-medium text-primary transition-all">
                <Sparkles size={16} />
                Resumo IA
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-red-500/10 border border-border-subtle hover:border-red-500/30 rounded-xl text-sm font-medium text-text-secondary hover:text-red-400 transition-all">
                <MessageSquare size={16} />
                Desativar Chat
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-primary/10 border border-border-subtle hover:border-primary/30 rounded-xl text-sm font-medium text-text-secondary hover:text-primary transition-all">
                <FolderOpen size={16} />
                Ver arquivos
              </button>
              <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface-elevated border border-border-subtle hover:border-primary/30 text-text-muted hover:text-primary transition-all">
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div className="pt-4 border-t border-border-subtle">
              {sentNotes[bidding.id]?.length > 0 && (
                <div className="mb-4 space-y-2">
                  {sentNotes[bidding.id].map((note, idx) => (
                    <div key={idx} className="p-3 bg-surface-elevated/50 rounded-xl text-sm text-text-secondary">
                      {note}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Digite uma mensagem..."
                  value={notes[bidding.id] || ''}
                  onChange={(e) => setNotes(prev => ({ ...prev, [bidding.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendNote(bidding.id)}
                  className="flex-1 px-4 py-3 bg-surface-elevated/50 border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  onClick={() => handleSendNote(bidding.id)}
                  className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}