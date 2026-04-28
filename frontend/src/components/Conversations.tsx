import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Paperclip,
  Send,
  MoreVertical,
  Smile,
  Check,
  CheckCheck,
  Phone,
  Video,
  MessageSquare,
  Loader2,
  X,
  User,
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

// Confirm Modal Component
const ConfirmModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  onConfirm,
  confirmText,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "info" | "warning" | "error" | "success";
  onConfirm?: () => void;
  confirmText?: string;
  showCancel?: boolean;
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    info: "bg-blue-600",
    warning: "bg-yellow-500",
    error: "bg-red-600",
    success: "bg-green-600",
  };

  const icons = {
    info: "ℹ️",
    warning: "⚠️",
    error: "❌",
    success: "✅",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-xl shadow-2xl overflow-hidden">
        <div className={`${typeStyles[type]} p-4 text-white flex items-center gap-2`}>
          <span>{icons[type]}</span>
          <h3 className="font-bold">{title}</h3>
        </div>
        <div className="p-4">
          <p className="text-gray-600 dark:text-gray-300 text-sm">{message}</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition"
          >
            Fechar
          </button>
          {onConfirm && (
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-white text-sm rounded-lg transition ${
                type === "error" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {confirmText || "OK"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

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
      setConversations(res.data.data || res.data);
    } catch (err) {
      console.error("Erro ao carregar conversas:", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/api/conversations/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchStats();
  }, [fetchConversations, fetchStats]);

  useEffect(() => {
    if (!selectedConversationId) return;
    setIsLoadingMessages(true);
    api
      .get(`/api/conversations/${selectedConversationId}/messages`)
      .then((res) => {
        setMessages(res.data.data || res.data);
        setTimeout(
          () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          100
        );
      })
      .catch((err) => console.error("Erro ao carregar mensagens:", err))
      .finally(() => setIsLoadingMessages(false));

    api.post(`/api/conversations/${selectedConversationId}/read`).catch(console.error);
  }, [selectedConversationId]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversationId || isSending) return;

    setIsSending(true);
    try {
      const res = await api.post(
        `/api/conversations/${selectedConversationId}/messages`,
        { content: messageInput }
      );
      setMessages((prev) => [...prev, res.data.data]);
      setMessageInput("");
      fetchStats();
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      toast.error("Não foi possível enviar a mensagem");
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Hoje";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Ontem";
    return date.toLocaleDateString("pt-BR");
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg">
      {/* Left Panel - Conversation List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-bold text-gray-800 dark:text-white mb-3">Conversas</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm text-gray-700 dark:text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 flex gap-3 text-xs">
          <span className="flex items-center gap-1 text-green-600">
            <MessageSquare size={12} /> {stats.active}
          </span>
          <span className="flex items-center gap-1 text-yellow-600">{stats.pending}</span>
          <span className="flex items-center gap-1 text-gray-500">{stats.closed}</span>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">
              Nenhuma conversa encontrada
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversationId(conv.id)}
                className={`w-full p-3 text-left border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                  selectedConversationId === conv.id
                    ? "bg-indigo-50 dark:bg-indigo-900/20 border-l-2 border-l-indigo-500"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <User size={18} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-sm text-gray-800 dark:text-white truncate">
                        {conv.contact_name || conv.contact_phone || "Sem nome"}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {formatDate(conv.updated_at)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {conv.contact_email || conv.channel}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <User size={18} className="text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">
                    {conversations.find((c) => c.id === selectedConversationId)?.contact_name ||
                      "Sem nome"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {conversations.find((c) => c.id === selectedConversationId)?.contact_email ||
                      conversations.find((c) => c.id === selectedConversationId)?.contact_phone}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-500">
                  <Phone size={18} />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-500">
                  <Video size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
              {isLoadingMessages ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="animate-spin text-indigo-600" size={24} />
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.direction === "outbound" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-xl text-sm ${
                        msg.direction === "outbound"
                          ? "bg-indigo-600 text-white rounded-tr-none"
                          : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-tl-none shadow-sm"
                      }`}
                    >
                      {msg.content}
                      <div
                        className={`text-xs mt-1 ${
                          msg.direction === "outbound"
                            ? "text-indigo-200"
                            : "text-gray-400"
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-500">
                <Paperclip size={20} />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-500">
                <Smile size={20} />
              </button>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Digite uma mensagem..."
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-full text-sm text-gray-700 dark:text-white placeholder-gray-400"
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || isSending}
                className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {isSending ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
              <p>Selecione uma conversa para começar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversations;