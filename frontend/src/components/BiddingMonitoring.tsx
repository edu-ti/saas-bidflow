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
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Notificações de <span className="text-gradient-gold">Disputa</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <Inbox size={14} className="text-primary" />
            Caixa de entrada consolidada das mensagens dos pregoeiros em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-red-500/10 border border-red-500/20 px-8 py-4 rounded-2xl flex items-center gap-6 shadow-platinum-glow-sm backdrop-blur-xl">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-ping shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 opacity-80">Atenção Requerida</p>
                <p className="text-xs font-black text-text-primary uppercase tracking-tight mt-1">
                  {messages.filter(m => m.urgency === 'high' && !m.isRead).length} Alertas Críticos
                </p>
              </div>
           </div>
        </div>
      </header>

      {/* Control Panel */}
      <div className="platinum-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-elevated/10 backdrop-blur-xl">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-primary text-background shadow-platinum-glow' : 'text-text-muted hover:bg-surface-elevated hover:text-text-primary'}`}
          >
            Todas as Mensagens
          </button>
          <button 
            onClick={() => setFilter('unread')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'unread' ? 'bg-primary text-background shadow-platinum-glow' : 'text-text-muted hover:bg-surface-elevated hover:text-text-primary'}`}
          >
            Não Lidas
          </button>
          <button 
            onClick={() => setFilter('urgent')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filter === 'urgent' ? 'bg-red-500 text-background shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'text-text-muted hover:bg-red-500/10 hover:text-red-500'}`}
          >
            <ShieldAlert size={12} /> Urgentes
          </button>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Buscar por pregão ou mensagem..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-background/50 border border-border-medium rounded-xl text-xs font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum"
          />
        </div>
      </div>

      {/* Inbox Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-32 text-center opacity-40 space-y-6">
             <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" /> 
             <span className="text-[10px] font-black uppercase tracking-[0.5em]">Sincronizando Chats dos Portais...</span>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="py-32 text-center opacity-40 space-y-6">
             <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-500" />
             <div>
               <p className="text-sm font-black uppercase tracking-[0.2em] text-text-primary">Inbox Zerada</p>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-2">Nenhuma notificação atende aos filtros atuais.</p>
             </div>
          </div>
        ) : (
          filteredMessages.map(msg => (
            <div 
              key={msg.id} 
              className={`group flex flex-col md:flex-row gap-6 p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                !msg.isRead 
                  ? 'bg-surface-elevated/40 border-primary/30 shadow-platinum-glow-sm cursor-pointer hover:bg-surface-elevated/60' 
                  : 'bg-surface border-border-subtle opacity-70 hover:opacity-100 hover:border-primary/20'
              }`}
              onClick={() => markAsRead(msg.id)}
            >
              {/* Unread Indicator */}
              {!msg.isRead && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary shadow-platinum-glow" />
              )}

              {/* Status Icon */}
              <div className="hidden md:flex shrink-0 items-start justify-center pt-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-platinum-glow-sm ${
                  msg.urgency === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                  msg.urgency === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                  'bg-blue-500/10 border-blue-500/20 text-blue-500'
                }`}>
                  {msg.urgency === 'high' ? <AlertCircle size={20} /> :
                   msg.urgency === 'medium' ? <Clock size={20} /> :
                   <MessageSquare size={20} />}
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                   <div className="flex items-center gap-3">
                     <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg border shadow-inner-platinum ${
                        msg.urgency === 'high' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                        msg.urgency === 'medium' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                        'bg-surface-elevated/50 border-border-subtle text-text-muted'
                     }`}>
                        {msg.urgency === 'high' ? 'Ação Requerida' : msg.urgency === 'medium' ? 'Aviso Importante' : 'Informativo'}
                     </span>
                     <span className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-80 flex items-center gap-1.5">
                       <Clock size={12} /> {msg.timestamp}
                     </span>
                   </div>
                   
                   <div className="flex items-center gap-2 px-3 py-1 bg-surface-elevated/30 border border-border-subtle rounded-xl text-[10px] font-black uppercase tracking-widest">
                     <span className="opacity-60">Portal:</span>
                     <span className="text-primary">{msg.portal}</span>
                   </div>
                </div>

                <div>
                  <h3 className="text-base font-black text-text-primary uppercase tracking-tight flex items-center gap-3">
                    {msg.processNumber}
                    {msg.position && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-lg">
                        <Award size={12} /> {msg.position}
                      </span>
                    )}
                  </h3>
                  <p className={`mt-3 text-sm font-medium leading-relaxed max-w-4xl ${!msg.isRead ? 'text-text-primary' : 'text-text-secondary'}`}>
                    "{msg.messageSnippet}"
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex items-center md:items-end justify-start md:justify-center md:pl-6 md:border-l border-border-subtle/30">
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate('/auction-details?id=1'); }}
                  className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-4 bg-background border border-border-subtle rounded-xl text-[10px] font-black text-text-primary hover:text-primary hover:border-primary/40 hover:bg-surface transition-all uppercase tracking-widest shadow-inner-platinum group-hover:scale-105"
                >
                  <ExternalLink size={14} className="text-primary" /> Abrir Chat
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
