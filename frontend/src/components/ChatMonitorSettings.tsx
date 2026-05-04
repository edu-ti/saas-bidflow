import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  X,
  Bell,
  Volume2,
  Smartphone,
  Mail,
  Filter,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';

interface Keyword {
  id: string;
  text: string;
}

export default function ChatMonitorSettings() {
  const navigate = useNavigate();
  const [keywords, setKeywords] = useState<Keyword[]>([
    { id: '1', text: '06.025.185/0001-75' },
    { id: '2', text: 'recurso' },
    { id: '3', text: 'inabilita' },
    { id: '4', text: 'documentos' },
    { id: '5', text: 'anexo' },
  ]);
  const [newKeyword, setNewKeyword] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotification, setEmailNotification] = useState(true);
  const [soundNotification, setSoundNotification] = useState(false);
  const [pushNotification, setPushNotification] = useState(true);
  const [filterMode, setFilterMode] = useState<'all' | 'keywords'>('keywords');

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    setKeywords(prev => [...prev, { id: Date.now().toString(), text: newKeyword.trim() }]);
    setNewKeyword('');
  };

  const removeKeyword = (id: string) => {
    setKeywords(prev => prev.filter(k => k.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addKeyword();
    }
  };

  return (
    <div className="min-h-screen p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex items-center gap-4">
        <button
          onClick={() => navigate('/chat-monitor')}
          className="w-10 h-10 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 hover:ring-2 hover:ring-primary/20 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tighter text-text-primary">
            Configurações de <span className="text-gradient-gold">Monitoramento</span>
          </h1>
          <p className="text-sm font-medium text-text-muted">
            Configure palavras-chave e notificações do monitor de chat
          </p>
        </div>
      </header>

      <div className="max-w-3xl space-y-8">
        <div className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-3xl p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <AlertTriangle size={18} className="text-primary" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-primary">
              Palavras-chave
            </h2>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite uma palavra-chave..."
              className="flex-1 px-4 py-3 bg-surface-elevated/50 border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button
              onClick={addKeyword}
              className="px-6 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              Adicionar
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <div
                key={kw.id}
                className="flex items-center gap-2 px-4 py-2 bg-surface-elevated border border-border-subtle rounded-full group hover:border-primary/30 transition-all"
              >
                <span className="text-sm font-medium text-text-primary">{kw.text}</span>
                <button
                  onClick={() => removeKeyword(kw.id)}
                  className="w-5 h-5 rounded-full bg-surface flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          <p className="text-xs text-text-muted">
            As palavras-chave encontradas nas mensagens serão destacadas automaticamente.
          </p>
        </div>

        <div className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-3xl p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Bell size={18} className="text-emerald-500" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-primary">
              Notificações
            </h2>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-elevated/50 rounded-2xl">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-text-muted" />
              <span className="text-sm font-medium text-text-primary">Notificação de Mensagens</span>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`
                w-12 h-6 rounded-full transition-all relative
                ${notificationsEnabled ? 'bg-primary' : 'bg-surface-elevated'}
              `}
            >
              <div className={`
                absolute top-1 w-4 h-4 rounded-full bg-white transition-all
                ${notificationsEnabled ? 'left-7' : 'left-1'}
              `} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <label className={`
              flex flex-col items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all
              ${emailNotification && notificationsEnabled 
                ? 'bg-primary/10 border-primary/30' 
                : 'bg-surface-elevated/50 border-border-subtle hover:border-primary/20'
              }
            `}>
              <Mail size={20} className={emailNotification && notificationsEnabled ? 'text-primary' : 'text-text-muted'} />
              <span className={`text-xs font-medium ${emailNotification && notificationsEnabled ? 'text-primary' : 'text-text-muted'}`}>Email</span>
              <input
                type="checkbox"
                checked={emailNotification}
                onChange={(e) => setEmailNotification(e.target.checked)}
                disabled={!notificationsEnabled}
                className="sr-only"
              />
            </label>

            <label className={`
              flex flex-col items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all
              ${soundNotification && notificationsEnabled 
                ? 'bg-primary/10 border-primary/30' 
                : 'bg-surface-elevated/50 border-border-subtle hover:border-primary/20'
              }
            `}>
              <Volume2 size={20} className={soundNotification && notificationsEnabled ? 'text-primary' : 'text-text-muted'} />
              <span className={`text-xs font-medium ${soundNotification && notificationsEnabled ? 'text-primary' : 'text-text-muted'}`}>Aviso Sonoro</span>
              <input
                type="checkbox"
                checked={soundNotification}
                onChange={(e) => setSoundNotification(e.target.checked)}
                disabled={!notificationsEnabled}
                className="sr-only"
              />
            </label>

            <label className={`
              flex flex-col items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all
              ${pushNotification && notificationsEnabled 
                ? 'bg-primary/10 border-primary/30' 
                : 'bg-surface-elevated/50 border-border-subtle hover:border-primary/20'
              }
            `}>
              <Smartphone size={20} className={pushNotification && notificationsEnabled ? 'text-primary' : 'text-text-muted'} />
              <span className={`text-xs font-medium ${pushNotification && notificationsEnabled ? 'text-primary' : 'text-text-muted'}`}>Push</span>
              <input
                type="checkbox"
                checked={pushNotification}
                onChange={(e) => setPushNotification(e.target.checked)}
                disabled={!notificationsEnabled}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        <div className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-3xl p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Filter size={18} className="text-amber-500" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-primary">
              Filtro de Mensagens
            </h2>
          </div>

          <div className="space-y-3">
            <label className={`
              flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all
              ${filterMode === 'all' 
                ? 'bg-primary/10 border-primary/30' 
                : 'bg-surface-elevated/50 border-border-subtle hover:border-primary/20'
              }
            `}>
              <input
                type="radio"
                name="filter"
                checked={filterMode === 'all'}
                onChange={() => setFilterMode('all')}
                className="w-4 h-4 text-primary"
              />
              <MessageSquare size={18} className={filterMode === 'all' ? 'text-primary' : 'text-text-muted'} />
              <div>
                <span className="text-sm font-medium text-text-primary">Receber todas as mensagens do chat</span>
                <p className="text-xs text-text-muted">Exibe todas as mensagens sem filtrar por palavras-chave</p>
              </div>
            </label>

            <label className={`
              flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all
              ${filterMode === 'keywords' 
                ? 'bg-primary/10 border-primary/30' 
                : 'bg-surface-elevated/50 border-border-subtle hover:border-primary/20'
              }
            `}>
              <input
                type="radio"
                name="filter"
                checked={filterMode === 'keywords'}
                onChange={() => setFilterMode('keywords')}
                className="w-4 h-4 text-primary"
              />
              <AlertTriangle size={18} className={filterMode === 'keywords' ? 'text-primary' : 'text-text-muted'} />
              <div>
                <span className="text-sm font-medium text-text-primary">Somente mensagens com palavra-chave</span>
                <p className="text-xs text-text-muted">Mostra apenas mensagens que contenham palavras-chave configuradas</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}