import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  Building2,
  ExternalLink,
  DollarSign,
  Eye,
  Download,
  Sparkles,
  FileCheck,
  MessageSquare,
  StickyNote,
  ChevronDown,
  Filter,
  ArrowLeft
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
  international: boolean;
}

const mockResults: BiddingResult[] = [
  {
    id: '2024/001234',
    object: 'Contratação de serviços de limpeza e conservação predial para órgãos públicos federais',
    agency: 'Ministério da Educação',
    uf: 'DF',
    openingDate: '15/06/2024',
    modality: 'Pregão Eletrônico',
    estimatedValue: 2500000,
    portal: 'Comprasnet',
    status: 'NOVA',
    lastUpdate: '02/05/2024',
    international: false
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
    status: 'RETIFICAÇÃO',
    lastUpdate: '03/05/2024',
    international: true
  },
  {
    id: '2024/001236',
    object: 'Contratação de empresa para execução de obras de reforma em hospitais',
    agency: 'Secretaria de Saúde do Estado de São Paulo',
    uf: 'SP',
    openingDate: '25/06/2024',
    modality: 'Tomada de Preços',
    estimatedValue: 12000000,
    portal: 'Comprasnet',
    status: 'ABERTA',
    lastUpdate: '01/05/2024',
    international: false
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
    international: true
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

export default function BiddingSearch() {
  const navigate = useNavigate();
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const handleSearch = () => {
    setSearchPerformed(true);
  };

  const handleNoteChange = (id: string, value: string) => {
    setNotes(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="flex gap-8 min-h-[calc(100vh-8rem)] animate-in fade-in duration-700">
      <aside className="w-80 flex-shrink-0 space-y-6">
        <div className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-3xl p-6 sticky top-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Filter size={18} className="text-primary" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-primary">
              Filtros Avançados
            </h2>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                Pesquisa por Objeto
              </label>
              <input
                type="text"
                placeholder="Digite o objeto da licitação..."
                className="w-full px-4 py-3 bg-surface-elevated/50 border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                Estado / UF
              </label>
              <div className="relative">
                <select className="w-full px-4 py-3 bg-surface-elevated/50 border border-border-subtle rounded-xl text-sm text-text-primary appearance-none focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                  <option value="">Todos os estados</option>
                  <option value="SP">São Paulo</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="PR">Paraná</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="BA">Bahia</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                Modalidade
              </label>
              <div className="relative">
                <select className="w-full px-4 py-3 bg-surface-elevated/50 border border-border-subtle rounded-xl text-sm text-text-primary appearance-none focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                  <option value="">Todas as modalidades</option>
                  <option value="pregao">Pregão Eletrônico</option>
                  <option value="concorrencia">Concorrência</option>
                  <option value="tomada_precos">Tomada de Preços</option>
                  <option value="convite">Convite</option>
                  <option value="inexigibilidade">Inexigibilidade</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                Data de Inclusão
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className="px-4 py-3 bg-surface-elevated/50 border border-border-subtle rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <input
                  type="date"
                  className="px-4 py-3 bg-surface-elevated/50 border border-border-subtle rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                Código do Órgão
              </label>
              <input
                type="text"
                placeholder="Ex: 15000000"
                className="w-full px-4 py-3 bg-surface-elevated/50 border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                Situação
              </label>
              <div className="relative">
                <select className="w-full px-4 py-3 bg-surface-elevated/50 border border-border-subtle rounded-xl text-sm text-text-primary appearance-none focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                  <option value="">Todas as situações</option>
                  <option value="nova">Nova</option>
                  <option value="retificacao">Retificação</option>
                  <option value="aberta">Aberta</option>
                  <option value="encerrada">Encerrada</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="international"
                className="w-5 h-5 rounded border-border-subtle bg-surface-elevated/50 text-primary focus:ring-primary/20 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="international" className="text-sm font-medium text-text-secondary cursor-pointer">
                Concorrência Nacional/Internacional
              </label>
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="w-full btn-primary py-4 flex items-center justify-center gap-3"
          >
            <Search size={18} />
            Pesquisar
          </button>
        </div>
      </aside>

      <main className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 hover:ring-2 hover:ring-primary/20 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-lg font-black text-text-primary tracking-tight">
              {searchPerformed ? 'Resultados Encontrados' : 'Buscar Licitações'}
            </h2>
            {searchPerformed && (
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full">
                {mockResults.length} resultados
              </span>
            )}
          </div>
        </div>

        {!searchPerformed ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-surface-elevated flex items-center justify-center">
              <Search size={36} className="text-text-muted" />
            </div>
            <p className="text-text-muted font-medium max-w-md">
              Utilize os filtros ao lado para encontrar as melhores oportunidades de licenciamento.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {mockResults.map((result) => (
              <div
                key={result.id}
                className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-3xl p-6 space-y-5 hover:border-primary/30 hover:ring-2 hover:ring-primary/20 transition-all duration-300 group"
              >
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
                      {result.international && (
                        <span className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-accent/20 text-accent border border-accent/30 rounded-full">
                          INTERNACIONAL
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center">
                      <Calendar size={14} className="text-text-muted" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Abertura</p>
                      <p className="text-sm font-bold text-text-primary">{result.openingDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center">
                      <Building2 size={14} className="text-text-muted" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Órgão</p>
                      <p className="text-sm font-bold text-text-primary truncate max-w-[200px]">{result.agency}</p>
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
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <DollarSign size={14} className="text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Valor Estimado</p>
                      <p className="text-sm font-bold text-emerald-400">{formatCurrency(result.estimatedValue)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-border-subtle">
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
                    <FileCheck size={16} />
                    Gerenciar
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-primary/10 border border-border-subtle hover:border-primary/30 rounded-xl text-sm font-medium text-text-secondary hover:text-primary transition-all">
                    <MessageSquare size={16} />
                    Monitorar Chat
                  </button>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-border-subtle">
                  <div className="flex items-center gap-2 flex-1">
                    <StickyNote size={14} className="text-text-muted" />
                    <input
                      type="text"
                      placeholder="Digite uma anotação..."
                      value={notes[result.id] || ''}
                      onChange={(e) => handleNoteChange(result.id, e.target.value)}
                      className="flex-1 bg-transparent border-none text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none"
                    />
                  </div>
                  <span className="text-xs text-text-muted">
                    Última atualização: {result.lastUpdate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}