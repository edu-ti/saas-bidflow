import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, Paperclip, Send, MoreVertical, Smile, Check, CheckCheck, Phone, Video,
  MessageSquare, Loader2, X, User, ShieldCheck, Zap, BarChart3, Target, Clock, Filter,
  Bot, Globe, MessageCircle
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
      <div className="h-full flex flex-col items-center justify-center gap-4 opacity-40">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
        <p className="font-black uppercase tracking-[0.3em] text-[10px] text-white">Sincronizando Canais...</p>
      </div>
    );
  }

  return (
    <div className="p-8 h-[calc(100vh-4rem)] w-full flex flex-col bg-background space-y-8 text-white overflow-hidden">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Strategic <span className="text-gradient-gold">Conversations</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <Globe size={12} className="text-primary" />
            Central Omnichannel de atendimento e engajamento em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {[
            { label: 'Ativos', val: stats.active, color: 'text-emerald-400' },
            { label: 'Pendentes', val: stats.pending, color: 'text-amber-400' },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
              <span className={`text-[10px] font-black uppercase tracking-widest ${s.color}`}>{s.label}</span>
              <span className="text-sm font-black">{s.val}</span>
            </div>
          ))}
        </div>
      </header>

      <div className="flex-1 flex gap-8 overflow-hidden">
        {/* Contacts Sidebar */}
        <div className="w-96 flex flex-col gap-6">
          <div className="platinum-card p-4 relative">
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Rastrear contato ou canal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-background border border-white/5 rounded-xl text-sm focus:border-primary/30 outline-none transition-all text-white placeholder:text-text-muted"
            />
          </div>

          <div className="platinum-card flex-1 overflow-y-auto scrollbar-platinum p-2 space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversationId(conv.id)}
                className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all border group ${
                  selectedConversationId === conv.id
                    ? "bg-primary/10 border-primary/20 shadow-platinum-glow"
                    : "bg-transparent border-transparent hover:bg-white/[0.02]"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg transition-all ${
                   selectedConversationId === conv.id ? 'bg-primary text-background shadow-platinum-glow' : 'bg-white/5 text-text-muted group-hover:bg-white/10'
                }`}>
                  {conv.contact_name?.charAt(0) || <User size={20} />}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className={`font-bold text-sm truncate ${selectedConversationId === conv.id ? 'text-primary' : 'text-white'}`}>
                      {conv.contact_name || conv.contact_phone || "Unknown Account"}
                    </p>
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-tighter">
                      {new Date(conv.updated_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-text-muted uppercase tracking-widest font-medium truncate">
                      {conv.channel} Protocol
                    </p>
                    {conv.status === 'pending' && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-platinum-glow" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 platinum-card flex flex-col overflow-hidden bg-white/[0.01]">
          {selectedConversationId ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black">
                    {conversations.find(c => c.id === selectedConversationId)?.contact_name?.charAt(0) || <User size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white tracking-tight">
                      {conversations.find(c => c.id === selectedConversationId)?.contact_name || "Account Profile"}
                    </h3>
                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">Active Session</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-3 text-text-muted hover:text-primary transition-all"><Phone size={18} /></button>
                  <button className="p-3 text-text-muted hover:text-primary transition-all"><Video size={18} /></button>
                  <button className="p-3 text-text-muted hover:text-white transition-all"><MoreVertical size={18} /></button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-platinum">
                {isLoadingMessages ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20">
                    <Loader2 className="animate-spin mb-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Recuperando Histórico...</span>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] p-4 rounded-2xl relative transition-all group ${
                        msg.direction === "outbound"
                          ? "bg-primary text-background font-medium rounded-tr-none shadow-platinum-glow"
                          : "bg-white/[0.03] border border-white/5 text-white rounded-tl-none hover:bg-white/[0.05]"
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <div className={`text-[9px] mt-2 font-black uppercase tracking-tighter opacity-50 ${
                          msg.direction === "outbound" ? "text-background" : "text-text-muted"
                        }`}>
                          {formatTime(msg.created_at)}
                          {msg.direction === "outbound" && <span className="ml-2">● Encriptado</span>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-4">
                <button className="p-4 bg-white/5 text-text-muted rounded-xl hover:bg-white/10 hover:text-primary transition-all">
                  <Paperclip size={20} />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Digite sua mensagem estratégica..."
                    className="w-full h-full px-6 py-4 bg-background border border-white/5 rounded-xl text-sm text-white focus:border-primary/40 outline-none transition-all placeholder:text-text-muted"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                     <button className="p-2 text-text-muted hover:text-primary transition-all"><Smile size={18} /></button>
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || isSending}
                  className="p-4 bg-primary text-background rounded-xl hover:bg-primary-hover shadow-platinum-glow transition-all disabled:opacity-50"
                >
                  {isSending ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 opacity-40">
              <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center">
                <MessageCircle size={40} className="text-primary" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-black text-white uppercase tracking-[0.3em] text-xs">Omnichannel Hub</p>
                <p className="text-[10px] text-text-muted uppercase tracking-widest">Selecione uma transmissão para iniciar o engajamento</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Conversations;