import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Save, Play, Plus, MousePointer2, X, Send, Bot, MessageSquare, HelpCircle,
  GitFork, Check, Loader2, Download, Zap, ShieldCheck, Globe, Target, Terminal, Settings
} from "lucide-react";
import api from "../lib/axios";
import toast from "react-hot-toast";

interface Node {
  id: string;
  type: "start" | "message" | "input" | "question" | "condition" | "action";
  text: string;
  x: number;
  y: number;
}

interface Connection {
  id: string;
  from: string;
  to: string;
}

const TestModal = ({ isOpen, onClose, nodes, connections }: any) => {
  const [history, setHistory] = useState<{ sender: "bot" | "user" | "system"; text: string }[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const startNode = nodes.find((n: any) => n.type === "start");
      setHistory([]);
      if (startNode) processNode(startNode.id);
    }
  }, [isOpen]);

  const processNode = (nodeId: string) => {
    const nodeConnections = connections.filter((c: any) => c.from === nodeId);
    if (nodeConnections.length === 0) return;
    const connection = nodeConnections[0];
    const nextNode = nodes.find((n: any) => n.id === connection.to);
    if (!nextNode) return;
    setCurrentNodeId(nextNode.id);
    setTimeout(() => {
      setHistory(prev => [...prev, { 
        sender: nextNode.type === "condition" || nextNode.type === "action" ? "system" : "bot", 
        text: nextNode.text 
      }]);
      if (nextNode.type !== "input" && nextNode.type !== "question") processNode(nextNode.id);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="platinum-card w-full max-w-md h-[600px] flex flex-col overflow-hidden shadow-2xl border-primary/20">
        <div className="bg-primary p-4 flex justify-between items-center text-background">
          <div className="flex items-center gap-3">
            <Terminal size={18} />
            <h3 className="font-black text-xs uppercase tracking-widest text-background">Neural Preview</h3>
          </div>
          <button onClick={onClose} className="hover:bg-background/10 p-1 rounded-lg transition-colors"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background scrollbar-platinum">
          {history.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
               <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                 msg.sender === "system" ? "bg-white/5 border border-white/5 italic text-text-muted text-[10px]" :
                 msg.sender === "user" ? "bg-primary text-background font-bold" : "bg-white/5 border border-white/5 text-white"
               }`}>
                 {msg.text}
               </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 bg-white/[0.02] border-t border-white/5 flex gap-2">
          <input
            className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-primary/40 transition-all"
            placeholder="Interagir com o bot..."
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && processNode(currentNodeId!)}
          />
          <button className="bg-primary text-background p-2 rounded-xl shadow-platinum-glow"><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
};

export default function ChatbotBuilder() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: "1", type: "start", text: "Início do Fluxo", x: 100, y: 200 },
    { id: "2", type: "message", text: "Saudação Estratégica", x: 400, y: 200 },
  ]);
  const [connections, setConnections] = useState<Connection[]>([{ id: "c1", from: "1", to: "2" }]);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get("/api/chatbot/flows").then(res => {
      const flow = res.data.data?.[0] || res.data?.[0];
      if (flow) { setNodes(flow.nodes); setConnections(flow.connections); }
    }).finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.post("/api/chatbot/flows", { nodes, connections });
      toast.success("Arquitetura de conversação consolidada.");
    } catch (error) { toast.error("Erro na persistência do fluxo."); }
    finally { setIsSaving(false); }
  };

  const addNode = (type: Node["type"]) => {
    const newNode: Node = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      text: `Configurar ${type}`,
      x: 200 + Math.random() * 100,
      y: 200 + Math.random() * 100,
    };
    setNodes(prev => [...prev, newNode]);
  };

  if (isLoading) return (
    <div className="h-full flex flex-col items-center justify-center gap-4 opacity-40">
      <Loader2 className="animate-spin text-primary w-10 h-10" />
      <p className="font-black uppercase tracking-[0.3em] text-[10px] text-white">Indexando Lógica...</p>
    </div>
  );

  return (
    <div className="p-8 h-screen w-full flex flex-col bg-background space-y-8 text-white overflow-hidden">
      <TestModal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} nodes={nodes} connections={connections} />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Conversation <span className="text-gradient-gold">Engine</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <Bot size={12} className="text-primary" />
            Arquiteto de fluxos lógicos e automação neural para atendimento.
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsTestModalOpen(true)} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
            <Play size={14} className="text-emerald-400" /> Neural Preview
          </button>
          <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 bg-primary text-background font-black rounded-xl shadow-platinum-glow text-[10px] uppercase tracking-widest hover:bg-primary-hover transition-all">
            {isSaving ? <Loader2 className="animate-spin" /> : <Save size={14} className="inline mr-2" />} Consolidar Fluxo
          </button>
        </div>
      </header>

      <div className="flex-1 flex gap-8 overflow-hidden">
        {/* Toolbox */}
        <div className="w-64 space-y-4 shrink-0">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-2">Components</p>
          <div className="grid grid-cols-1 gap-3">
            {[
              { type: 'message', icon: MessageSquare, color: 'text-blue-400', label: 'Mensagem' },
              { type: 'question', icon: HelpCircle, color: 'text-amber-400', label: 'Pergunta' },
              { type: 'condition', icon: GitFork, color: 'text-pink-400', label: 'Condicional' },
              { type: 'action', icon: Zap, color: 'text-purple-400', label: 'Ação Neural' },
            ].map((tool: any) => (
              <button
                key={tool.type}
                onClick={() => addNode(tool.type)}
                className="platinum-card p-4 flex items-center gap-4 hover:border-primary/30 hover:bg-white/[0.03] transition-all group"
              >
                <div className={`p-2 rounded-lg bg-white/5 ${tool.color} group-hover:scale-110 transition-transform`}>
                  <tool.icon size={16} />
                </div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{tool.label}</span>
              </button>
            ))}
          </div>
          <div className="platinum-card p-6 mt-8 space-y-4 border-dashed opacity-60">
             <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
               <Settings size={12} /> Optimization
             </div>
             <p className="text-[10px] text-text-muted leading-relaxed uppercase tracking-tighter">
               A arquitetura neural do BidFlow permite fluxos assíncronos e processamento de linguagem natural via RAG.
             </p>
          </div>
        </div>

        {/* Builder Canvas */}
        <div 
          ref={canvasRef}
          className="flex-1 platinum-card relative bg-[#0a0a0b] overflow-hidden cursor-crosshair border-primary/10"
          style={{ backgroundImage: 'radial-gradient(rgba(251, 191, 36, 0.05) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        >
          {/* SVG for Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {connections.map(conn => {
              const from = nodes.find(n => n.id === conn.from);
              const to = nodes.find(n => n.id === conn.to);
              if (!from || !to) return null;
              return (
                <path
                  key={conn.id}
                  d={`M ${from.x + 192} ${from.y + 40} C ${from.x + 250} ${from.y + 40}, ${to.x - 50} ${to.y + 40}, ${to.x} ${to.y + 40}`}
                  fill="none"
                  stroke="rgba(251, 191, 36, 0.2)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              );
            })}
          </svg>

          {/* Draggable Nodes */}
          {nodes.map(node => (
            <div
              key={node.id}
              style={{ left: node.x, top: node.y }}
              className="absolute w-52 bg-surface-elevated/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl z-10 group hover:border-primary/40 transition-all cursor-move"
              onMouseDown={() => {}}
            >
              <div className={`px-4 py-2 rounded-t-2xl border-b border-white/5 flex items-center justify-between ${
                node.type === 'start' ? 'bg-emerald-500/20' : 
                node.type === 'condition' ? 'bg-pink-500/20' :
                node.type === 'action' ? 'bg-purple-500/20' : 'bg-primary/20'
              }`}>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80">{node.type}</span>
                <X size={12} className="text-text-muted hover:text-red-400 cursor-pointer" onClick={() => setNodes(nodes.filter(n => n.id !== node.id))} />
              </div>
              <div className="p-4">
                <textarea 
                  value={node.text}
                  onChange={(e) => setNodes(nodes.map(n => n.id === node.id ? { ...n, text: e.target.value } : n))}
                  className="w-full bg-transparent border-0 text-xs text-white resize-none outline-none font-medium leading-relaxed"
                  rows={2}
                />
              </div>
              {/* Ports */}
              <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-platinum-glow border border-background"></div>
              {node.type !== 'start' && <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white/20 rounded-full border border-background"></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
