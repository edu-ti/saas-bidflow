import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, AlertCircle, Clock, CheckCircle2, ChevronRight, 
  Search, ExternalLink, ShieldAlert, Award, Inbox, Loader2
} from 'lucide-react';

interface DisputeMessage {
  id: string;
  processNumber: string;
  portal: string;
  position: string;
  messageSnippet: string;
  urgency: 'high' | 'medium' | 'info';
  timestamp: string;
  isRead: boolean;
}

export default function BiddingMonitoring() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<DisputeMessage[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Simulated fetching for live monitoring
    setTimeout(() => {
      setMessages([
        {
          id: 'msg-1',
          processNumber: 'Pregão Eletrônico 45/2024',
          portal: 'Comprasnet',
          position: '2º Lugar',
          messageSnippet: 'O Pregoeiro convoca o licitante classificado em 2º lugar para enviar a proposta atualizada e os anexos de habilitação no prazo de 2 horas.',
          urgency: 'high',
          timestamp: '14:30',
          isRead: false
        },
        {
          id: 'msg-2',
          processNumber: 'Tomada de Preços 12/2024',
          portal: 'Licitações-e (BB)',
          position: '1º Lugar',
          messageSnippet: 'Intenção de Recurso registrada pela empresa concorrente. O prazo para contrarrazões será aberto em breve.',
          urgency: 'medium',
          timestamp: '13:15',
          isRead: true
        },
        {
          id: 'msg-3',
          processNumber: 'Dispensa Eletrônica 08/2024',
          portal: 'Portal de Compras Públicas',
          position: '3º Lugar',
          messageSnippet: 'Fase de lances encerrada. Sistema em processo de adjudicação automática.',
          urgency: 'info',
          timestamp: '11:45',
          isRead: true
        },
        {
          id: 'msg-4',
          processNumber: 'Pregão Eletrônico 99/2024',
          portal: 'Comprasnet',
          position: 'Desclassificado',
          messageSnippet: 'Prezado Licitante, sua proposta foi recusada devido à ausência de certificação técnica solicitada no Edital (Item 4.2).',
          urgency: 'high',
          timestamp: 'Ontem',
          isRead: false
        }
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  const markAsRead = (id: string) => {
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, isRead: true } : m));
  };

  const filteredMessages = messages.filter(m => {
    if (filter === 'unread' && m.isRead) return false;
    if (filter === 'urgent' && m.urgency !== 'high') return false;
    if (search && !m.processNumber.toLowerCase().includes(search.toLowerCase()) && !m.messageSnippet.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Notificações de Disputa
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Caixa de entrada consolidada das mensagens dos pregoeiros em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-danger/10 border border-danger/20 px-4 py-2 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-danger animate-ping" />
          <div>
            <p className="text-xs font-semibold text-danger">
              {messages.filter(m => m.urgency === 'high' && !m.isRead).length} Alertas Críticos
            </p>
          </div>
        </div>
      </header>

      {/* Control Panel */}
      <div className="card p-3 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${filter === 'all' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'}`}
          >
            Todas as Mensagens
          </button>
          <button 
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${filter === 'unread' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'}`}
          >
            Não Lidas
          </button>
          <button 
            onClick={() => setFilter('urgent')}
            className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${filter === 'urgent' ? 'bg-danger text-white' : 'text-text-secondary hover:bg-danger/10 hover:text-danger'}`}
          >
            <ShieldAlert size={14} /> Urgentes
          </button>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Buscar por pregão ou mensagem..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input w-full pl-9"
          />
        </div>
      </div>

      {/* Inbox Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-24 text-center opacity-40 space-y-4 flex flex-col items-center justify-center">
             <Loader2 className="w-8 h-8 animate-spin text-primary" /> 
             <span className="text-sm font-medium">Sincronizando Chats dos Portais...</span>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="py-24 text-center opacity-60 space-y-4 flex flex-col items-center justify-center">
             <CheckCircle2 className="w-12 h-12 text-success" />
             <div>
               <p className="text-base font-semibold text-text-primary">Inbox Zerada</p>
               <p className="text-sm mt-1 text-text-secondary">Nenhuma notificação atende aos filtros atuais.</p>
             </div>
          </div>
        ) : (
          filteredMessages.map(msg => (
            <div 
              key={msg.id} 
              className={`group flex flex-col md:flex-row gap-4 p-4 md:p-5 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                !msg.isRead 
                  ? 'bg-bg-secondary border-primary/20 shadow-sm cursor-pointer hover:border-primary/40' 
                  : 'bg-bg-tertiary border-border opacity-80 hover:opacity-100'
              }`}
              onClick={() => markAsRead(msg.id)}
            >
              {/* Unread Indicator */}
              {!msg.isRead && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
              )}

              {/* Status Icon */}
              <div className="hidden md:flex shrink-0 items-start justify-center pt-1 pl-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                  msg.urgency === 'high' ? 'bg-danger/10 border-danger/20 text-danger' :
                  msg.urgency === 'medium' ? 'bg-warning/10 border-warning/20 text-warning' :
                  'bg-info/10 border-info/20 text-info'
                }`}>
                  {msg.urgency === 'high' ? <AlertCircle size={18} /> :
                   msg.urgency === 'medium' ? <Clock size={18} /> :
                   <MessageSquare size={18} />}
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                   <div className="flex items-center gap-2">
                     <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        msg.urgency === 'high' ? 'bg-danger/10 border-danger/20 text-danger' :
                        msg.urgency === 'medium' ? 'bg-warning/10 border-warning/20 text-warning' :
                        'bg-bg-tertiary border-border text-text-secondary'
                     }`}>
                        {msg.urgency === 'high' ? 'Ação Requerida' : msg.urgency === 'medium' ? 'Aviso Importante' : 'Informativo'}
                     </span>
                     <span className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                       <Clock size={12} /> {msg.timestamp}
                     </span>
                   </div>
                   
                   <div className="flex items-center gap-1.5 px-2 py-0.5 bg-bg-tertiary border border-border rounded text-[10px] font-semibold uppercase">
                     <span className="text-text-muted">Portal:</span>
                     <span className="text-primary">{msg.portal}</span>
                   </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                    {msg.processNumber}
                    {msg.position && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">
                        <Award size={12} /> {msg.position}
                      </span>
                    )}
                  </h3>
                  <p className={`mt-1.5 text-sm leading-relaxed max-w-4xl ${!msg.isRead ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                    "{msg.messageSnippet}"
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex items-center md:items-start justify-end md:pl-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate('/auction-details?id=1'); }}
                  className="btn btn-outline py-1.5 px-3 flex items-center gap-2 text-xs"
                >
                  <ExternalLink size={14} /> Abrir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
