import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, Paperclip, Send, MoreVertical, Smile, Check, CheckCheck, Phone, Video,
  MessageSquare, Loader2, X, User, ShieldCheck, Zap, BarChart3, Target, Clock, Filter,
  Bot, Globe, MessageCircle, Layout, ChevronRight, Activity, Database
} from "lucide-react";
import api from "../lib/axios";
import toast from "react-hot-toast";

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number | null;
  sender_type: string;
  content: string;
  direction: "inbound" | "outbound";
  message_type: string;
  created_at: string;
  read_at: string | null;
}

interface Conversation {
  id: number;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: "active" | "closed" | "pending";
  channel: "whatsapp" | "telegram" | "widget" | "email";
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
}

const Conversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, closed: 0, messages_today: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      const res = await api.get(`/api/conversations?${params}`);
      setConversations(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/api/conversations/stats");
      setStats(res.data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchStats();
  }, [fetchConversations, fetchStats]);

  useEffect(() => {
    if (!selectedConversationId) return;
    setIsLoadingMessages(true);
    api.get(`/api/conversations/${selectedConversationId}/messages`)
      .then((res) => {
        setMessages(res.data.data || res.data || []);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      })
      .catch(console.error)
      .finally(() => setIsLoadingMessages(false));

    api.post(`/api/conversations/${selectedConversationId}/read`).catch(console.error);
  }, [selectedConversationId]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversationId || isSending) return;
    setIsSending(true);
    try {
      const res = await api.post(`/api/conversations/${selectedConversationId}/messages`, { content: messageInput });
      setMessages((prev) => [...prev, res.data.data]);
      setMessageInput("");
      fetchStats();
    } catch (err) {
      toast.error("Erro na transmissão da mensagem.");
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (isLoading && conversations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 animate-pulse">
        <div className="w-16 h-16 rounded-[2rem] bg-surface-elevated flex items-center justify-center border border-border-subtle shadow-inner-platinum">
           <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
        <p className="font-black uppercase tracking-[0.5em] text-[10px] text-text-muted">Sincronizando Canais Omnichannel...</p>
      </div>
    );
  }

  return (
    <div className="p-8 h-[calc(100vh-4rem)] w-full flex flex-col bg-background space-y-8 text-text-primary overflow-hidden animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Strategic <span className="text-gradient-gold">Conversations</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <Globe size={14} className="text-primary" />
            Central Omnichannel de atendimento e engajamento em tempo real Platinum.
          </p>
        </div>
        <div className="flex items-center gap-5">
          {[
            { label: 'Ativos', val: stats.active, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Pendentes', val: stats.pending, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          ].map((s, i) => (
            <div key={i} className="bg-surface-elevated/20 border border-border-subtle/30 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-inner-platinum">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${s.color}`}>{s.label}</span>
              <div className="w-px h-4 bg-border-subtle/30" />
              <span className="text-sm font-black text-text-primary">{s.val}</span>
            </div>
          ))}
        </div>
      </header>

      <div className="flex-1 flex gap-8 overflow-hidden min-h-0">
        {/* Contacts Sidebar */}
        <div className="w-96 flex flex-col gap-8 shrink-0">
          <div className="platinum-card p-4 relative bg-surface-elevated/10 backdrop-blur-xl border-border-subtle/30 shadow-platinum-glow-sm">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Rastrear contato ou canal digital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold focus:border-primary/40 outline-none transition-all text-text-primary placeholder:text-text-muted/40 shadow-inner-platinum"
            />
          </div>

          <div className="platinum-card flex-1 overflow-y-auto scrollbar-platinum p-3 space-y-3 bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-platinum-glow-sm">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversationId(conv.id)}
                className={`w-full p-5 rounded-[1.5rem] flex items-center gap-5 transition-all duration-500 border-2 group ${
                  selectedConversationId === conv.id
                    ? "bg-primary/5 border-primary/30 shadow-platinum-glow-sm"
                    : "bg-transparent border-transparent hover:bg-surface-elevated/20"
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all duration-500 shadow-inner-platinum ${
                   selectedConversationId === conv.id ? 'bg-primary text-white shadow-platinum-glow' : 'bg-surface-elevated/40 text-text-muted border border-border-subtle group-hover:bg-surface-elevated'
                }`}>
                  {conv.contact_name?.charAt(0) || <User size={24} />}
                </div>
                <div className="flex-1 min-w-0 text-left space-y-1">
                  <div className="flex justify-between items-center">
                    <p className={`font-black text-sm truncate uppercase tracking-tight transition-colors ${selectedConversationId === conv.id ? 'text-primary' : 'text-text-primary'}`}>
                      {conv.contact_name || conv.contact_phone || "Account_RPA"}
                    </p>
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] opacity-60">
                      {new Date(conv.updated_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-text-muted uppercase tracking-[0.3em] font-black opacity-40 truncate">
                      {conv.channel} Protocol
                    </p>
                    {conv.status === 'pending' && <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-platinum-glow" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 platinum-card flex flex-col overflow-hidden bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-platinum-glow-sm">
          {selectedConversationId ? (
            <>
              {/* Chat Header */}
              <div className="p-8 border-b border-border-subtle/30 flex items-center justify-between bg-surface-elevated/20">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xl shadow-inner-platinum">
                    {conversations.find(c => c.id === selectedConversationId)?.contact_name?.charAt(0) || <User size={24} />}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-black text-text-primary tracking-tighter text-lg uppercase">
                      {conversations.find(c => c.id === selectedConversationId)?.contact_name || "Profile Session"}
                    </h3>
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-platinum-glow animate-pulse" />
                       <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em]">Conexão Ativa</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button className="p-4 bg-surface-elevated/40 text-text-muted hover:text-primary transition-all rounded-2xl border border-border-subtle shadow-inner-platinum"><Phone size={20} /></button>
                  <button className="p-4 bg-surface-elevated/40 text-text-muted hover:text-primary transition-all rounded-2xl border border-border-subtle shadow-inner-platinum"><Video size={20} /></button>
                  <button className="p-4 bg-surface-elevated/40 text-text-muted hover:text-text-primary transition-all rounded-2xl border border-border-subtle shadow-inner-platinum"><MoreVertical size={20} /></button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-platinum">
                {isLoadingMessages ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 gap-6">
                    <Loader2 className="animate-spin w-12 h-12 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted">Recuperando Ledger de Histórico...</span>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-4 duration-500`}>
                      <div className={`max-w-[70%] p-6 rounded-[2rem] relative transition-all group duration-500 ${
                        msg.direction === "outbound"
                          ? "bg-primary text-white font-medium rounded-tr-none shadow-platinum-glow"
                          : "bg-surface-elevated/40 border border-border-subtle/30 text-text-primary rounded-tl-none hover:bg-surface-elevated/60 shadow-platinum-glow-sm"
                      }`}>
                        <p className="text-sm leading-relaxed font-medium">{msg.content}</p>
                        <div className={`text-[10px] mt-4 font-black uppercase tracking-widest opacity-60 flex items-center gap-3 ${
                          msg.direction === "outbound" ? "text-white/80" : "text-text-muted"
                        }`}>
                          {formatTime(msg.created_at)}
                          {msg.direction === "outbound" ? <CheckCheck size={14} className="text-white/60" /> : <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-8 bg-surface-elevated/20 border-t border-border-subtle/30 flex gap-6 items-center">
                <button className="p-5 bg-surface-elevated/40 text-text-muted rounded-[1.5rem] hover:bg-surface-elevated hover:text-primary transition-all border border-border-subtle shadow-inner-platinum">
                  <Paperclip size={24} />
                </button>
                <div className="flex-1 relative group">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Digite sua resposta estratégica em tempo real..."
                    className="w-full px-8 py-5 bg-background/50 border border-border-medium rounded-[1.5rem] text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
                     <button className="p-2 text-text-muted hover:text-primary transition-all group-hover:scale-110"><Smile size={22} /></button>
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || isSending}
                  className="p-5 bg-primary text-white rounded-[1.5rem] hover:bg-primary-hover shadow-platinum-glow transition-all duration-500 disabled:opacity-50 group"
                >
                  {isSending ? <Loader2 size={28} className="animate-spin" /> : <Send size={28} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-8 opacity-40">
              <div className="w-32 h-32 rounded-[2.5rem] bg-surface-elevated/40 border border-border-subtle flex items-center justify-center shadow-inner-platinum">
                <MessageCircle size={60} className="text-primary shadow-platinum-glow-sm" />
              </div>
              <div className="text-center space-y-3">
                <p className="font-black text-text-primary uppercase tracking-[0.5em] text-sm">Omnichannel Strategic Hub</p>
                <p className="text-[11px] text-text-muted uppercase tracking-[0.3em] font-black opacity-60">Selecione uma transmissão no ledger para iniciar o engajamento neural</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Conversations;