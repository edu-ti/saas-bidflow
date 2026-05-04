import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Send,
  Mic,
  Loader2,
  Bot,
  User,
  AlertCircle
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const initialMessage: Message = {
  id: 'welcome',
  role: 'assistant',
  content: 'Bem-vindo ao Consultor Jurídico IA, seu especialista em dúvidas jurídicas sobre licitações e contratos administrativos. Sou capaz de analisar editais, explicar cláusulas, orientar sobre recursos e auxiliar na compreensão de legislação aplicável. Como posso ajudá-lo hoje?',
  timestamp: new Date()
};

export default function LegalConsultant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Entendo sua pergunta sobre questões jurídicas em licitações. Com base na legislação vigente (Lei 14.133/2021 e regulamentações complementares), posso orientá-lo que...\n\n[Esta é uma resposta simulada para demonstração. Em produção, conectaria a uma API de IA para respostas reais.]',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background animate-in fade-in duration-700">
      <header className="flex items-center gap-4 p-6 border-b border-border-subtle bg-surface/50 backdrop-blur-xl">
        <button
          onClick={() => navigate('/bidding-hub')}
          className="w-10 h-10 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 hover:ring-2 hover:ring-primary/20 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shadow-platinum-glow">
            <Sparkles size={20} className="text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-text-primary">
              Consultor <span className="text-gradient-gold">Jurídico</span>
            </h1>
            <p className="text-xs text-text-muted">IA especializada em licitações</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`
                w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
                ${msg.role === 'assistant' 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-surface-elevated text-text-muted'
                }
              `}>
                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className={`
                flex-1 p-5 rounded-3xl max-w-[85%]
                ${msg.role === 'assistant'
                  ? 'bg-surface/50 border border-border-subtle'
                  : 'bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20'
                }
              `}>
                <p className="text-sm leading-relaxed text-text-primary whitespace-pre-wrap">
                  {msg.content}
                </p>
                <p className="text-[10px] text-text-muted mt-3 text-right">
                  {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                <Bot size={16} className="text-primary" />
              </div>
              <div className="bg-surface/50 border border-border-subtle rounded-3xl p-5">
                <div className="flex items-center gap-3 text-text-muted">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-sm">Pensando...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-6 border-t border-border-subtle bg-surface/30">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="flex items-center gap-3 p-4 bg-surface border border-border-subtle rounded-3xl focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <button className="w-10 h-10 rounded-xl bg-surface-elevated flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all">
                <Mic size={18} />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua dúvida jurídica..."
                className="flex-1 bg-transparent border-none text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 px-2">
            <AlertCircle size={12} className="text-text-muted" />
            <p className="text-[10px] text-text-muted">
              Esse chat pode cometer erros. Verifique as informações importantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}