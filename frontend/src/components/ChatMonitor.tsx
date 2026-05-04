import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Filter,
  Check,
  RefreshCw,
  Maximize2,
  MoreHorizontal,
  Star,
  Archive,
  FileText,
  MessageSquare,
  ExternalLink,
  Settings,
  AlertCircle,
  Clock,
  Building2,
  Calendar,
  ChevronDown,
  Sparkles
} from 'lucide-react';

interface MonitoredBid {
  id: string;
  code: string;
  agency: string;
  portal: 'ComprasNet' | 'PNCP' | 'BNDES' | 'ComprasSP';
  date: string;
  time: string;
  unread: boolean;
  important: boolean;
  archived: boolean;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  hasKeyword: boolean;
  keyword?: string;
}

const mockBiddingList: MonitoredBid[] = [
  { id: '1', code: 'PE/3/2026', agency: 'Ministério da Educação', portal: 'ComprasNet', date: '04/05', time: '14:32', unread: true, important: false, archived: false },
  { id: '2', code: 'CC/12/2025', agency: 'Universidade Federal de São Paulo', portal: 'ComprasNet', date: '04/05', time: '11:15', unread: true, important: true, archived: false },
  { id: '3', code: 'PE/8/2026', agency: 'Prefeitura Municipal de Campinas', portal: 'PNCP', date: '03/05', time: '09:48', unread: false, important: false, archived: false },
  { id: '4', code: 'TP/5/2025', agency: 'Governo do Estado de SP', portal: 'ComprasNet', date: '02/05', time: '16:22', unread: false, important: false, archived: true },
  { id: '5', code: 'PE/15/2026', agency: 'Ministério da Saúde', portal: 'ComprasNet', date: '01/05', time: '08:05', unread: false, important: false, archived: false },
];

const mockMessages: Message[] = [
  { id: '1', sender: 'SESSAO - PROCESSO', content: 'Aberta a sessão pública do pregão eletrônico. Empresas participantes podem enviou propostas.', time: '14:30', hasKeyword: false },
  { id: '2', sender: 'PREGOEIRO', content: 'Solicito que os licitantes enviem a documentação de habilitação através do sistema. Atenção: documentação incompleta resultará em inabilitação.', time: '14:35', hasKeyword: true, keyword: 'documentação' },
  { id: '3', sender: 'LICITANTE 1', content: 'Pregoeiro, segue documentação anexa para habilitação. Segue documentação de regularidade fiscal e qualificação técnica.', time: '14:42', hasKeyword: true, keyword: 'documentação' },
  { id: '4', sender: 'PREGOEIRO', content: 'Licitante 1, documentação recebida. Aguardem análise.', time: '14:45', hasKeyword: false },
  { id: '5', sender: 'SESSAO - LOTE 1', content: 'Lote 1 aberto para lances. Menor lance: R$ 250.000,00', time: '14:50', hasKeyword: false },
  { id: '6', sender: 'PREGOEIRO', content: 'Atenção: foi identificada a necessidade de apresentação de documentos complementares conforme item 8.3 do edital. Prazo: 24 horas.', time: '15:05', hasKeyword: true, keyword: 'documentos' },
  { id: '7', sender: 'LICITANTE 2', content: 'Solicito esclarecimento sobre o anexo II - termos de referência.', time: '15:12', hasKeyword: false },
  { id: '8', sender: 'PREGOEIRO', content: 'Esclarecimento enviado via chat. Verifiquem o arquivo anexo no sistema.', time: '15:18', hasKeyword: true, keyword: 'anexo' },
];

const portalColors: Record<string, string> = {
  ComprasNet: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  PNCP: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  BNDES: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  ComprasSP: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
};

export default function ChatMonitor() {
  const navigate = useNavigate();
  const [selectedBid, setSelectedBid] = useState<MonitoredBid>(mockBiddingList[0]);
  const [filter, setFilter] = useState<'me' | 'all'>('me');
  const [tab, setTab] = useState<'all' | 'unread' | 'important' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLote, setSelectedLote] = useState('1');

  const filteredBids = mockBiddingList.filter(bid => {
    const matchesSearch = bid.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
      bid.agency.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = tab === 'all' || 
      (tab === 'unread' && bid.unread) ||
      (tab === 'important' && bid.important) ||
      (tab === 'archived' && bid.archived);
    return matchesSearch && matchesTab && !bid.archived;
  });

  return (
    <div className="min-h-screen flex animate-in fade-in duration-700">
      <aside className="w-96 border-r border-border-subtle bg-surface/50 flex flex-col">
        <div className="p-4 border-b border-border-subtle">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/bidding-hub')}
              className="w-10 h-10 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 hover:ring-2 hover:ring-primary/20 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-black tracking-tighter text-text-primary">
              Monitorar <span className="text-gradient-gold">Chat</span>
            </h1>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFilter('me')}
              className={`flex-1 py-2 px-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${filter === 'me' ? 'bg-primary text-white' : 'bg-surface-elevated text-text-muted hover:text-text-primary'}`}
            >
              Por mim
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-2 px-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${filter === 'all' ? 'bg-primary text-white' : 'bg-surface-elevated text-text-muted hover:text-text-primary'}`}
            >
              Por todos
            </button>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar edital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-elevated/50 border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        <div className="flex border-b border-border-subtle">
          {(['all', 'unread', 'important', 'archived'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 ${
                tab === t 
                  ? 'text-primary border-primary' 
                  : 'text-text-muted border-transparent hover:text-text-primary'
              }`}
            >
              {t === 'all' ? 'Todos' : t === 'unread' ? 'Não lidos' : t === 'important' ? 'Importantes' : 'Arquivados'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto">
          {filteredBids.map((bid) => (
            <button
              key={bid.id}
              onClick={() => setSelectedBid(bid)}
              className={`w-full p-4 border-b border-border-subtle text-left transition-all hover:bg-surface-elevated/50 ${
                selectedBid.id === bid.id ? 'bg-surface-elevated border-l-2 border-l-primary' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">{bid.code}</span>
                  {bid.unread && <div className="w-2 h-2 rounded-full bg-primary" />}
                  {bid.important && <Star size={12} className="text-amber-500 fill-amber-500" />}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-text-muted">
                  <Clock size={10} />
                  {bid.time}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted truncate max-w-[200px]">{bid.agency}</span>
                <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border rounded-full ${portalColors[bid.portal]}`}>
                  {bid.portal}
                </span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-background">
        <div className="p-4 border-b border-border-subtle bg-surface/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-text-primary">{selectedBid.code}</span>
                <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border rounded-full ${portalColors[selectedBid.portal]}`}>
                  {selectedBid.portal}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1"><Building2 size={12} /> {selectedBid.agency}</span>
                <span className="flex items-center gap-1"><Calendar size={12} /> {selectedBid.date}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 flex items-center justify-center text-primary hover:from-primary/20 hover:to-accent/20 transition-all">
              <Sparkles size={16} />
            </button>
            <button className="w-9 h-9 rounded-lg bg-surface-elevated flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all">
              <Check size={16} />
            </button>
            <button className="w-9 h-9 rounded-lg bg-surface-elevated flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all">
              <RefreshCw size={16} />
            </button>
            <button className="w-9 h-9 rounded-lg bg-surface-elevated flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all">
              <Maximize2 size={16} />
            </button>
            <div className="relative group">
              <button className="w-9 h-9 rounded-lg bg-surface-elevated flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all">
                <MoreHorizontal size={16} />
              </button>
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border-subtle rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-2 space-y-1">
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-primary hover:bg-surface-elevated rounded-xl transition-all">
                    <Star size={14} /> Marcar como importante
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-primary hover:bg-surface-elevated rounded-xl transition-all">
                    <Archive size={14} /> Arquivar licitação
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-primary hover:bg-surface-elevated rounded-xl transition-all">
                    <FileText size={14} /> Informações da Licitação
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-primary hover:bg-surface-elevated rounded-xl transition-all">
                    <MessageSquare size={14} /> Anotações
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-primary hover:bg-surface-elevated rounded-xl transition-all">
                    <ExternalLink size={14} /> Acessar local da disputa
                  </button>
                  <div className="border-t border-border-subtle pt-2 mt-2">
                    <button 
                      onClick={() => navigate('/chat-monitor-settings')}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-primary hover:bg-surface-elevated rounded-xl transition-all"
                    >
                      <Settings size={14} /> Configurações de Monitoramento
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-border-subtle bg-surface/20">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Filtrar por lote:</span>
            <div className="relative">
              <select
                value={selectedLote}
                onChange={(e) => setSelectedLote(e.target.value)}
                className="px-4 py-2 bg-surface-elevated/50 border border-border-subtle rounded-xl text-sm text-text-primary appearance-none focus:outline-none focus:border-primary/50 cursor-pointer"
              >
                <option value="1">Lote 1</option>
                <option value="2">Lote 2</option>
                <option value="3">Lote 3</option>
                <option value="all">Todos os lotes</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {mockMessages.map((msg) => (
            <div
              key={msg.id}
              className="p-4 bg-surface/30 border border-border-subtle rounded-2xl hover:border-primary/20 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-text-muted">{msg.sender}</span>
                  {msg.hasKeyword && (
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-primary/20 text-primary border border-primary/30 rounded-full flex items-center gap-1">
                      <AlertCircle size={10} />
                      Palavra-chave: {msg.keyword}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-text-muted">{msg.time}</span>
              </div>
              <p className="text-sm text-text-primary leading-relaxed">
                {msg.hasKeyword ? (
                  <>
                    {msg.content.split(new RegExp(`(${msg.keyword})`, 'gi')).map((part, i) => 
                      part.toLowerCase() === msg.keyword?.toLowerCase() ? (
                        <span key={i} className="px-1.5 py-0.5 bg-primary/20 text-primary rounded border border-primary/30 font-medium shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                          {part}
                        </span>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )}
                  </>
                ) : msg.content}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}