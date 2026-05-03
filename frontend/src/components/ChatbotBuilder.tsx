import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Save, Play, Plus, MousePointer2, X, Send, Bot, MessageSquare, HelpCircle,
  GitFork, Check, Loader2, Download, Zap, ShieldCheck, Globe, Target, Terminal, Settings, Layout, ChevronRight, Activity, Database
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-500">
      <div className="platinum-card w-full max-w-md h-[650px] flex flex-col overflow-hidden shadow-platinum-glow border-border-subtle/30 bg-surface-elevated/10 backdrop-blur-2xl">
        <div className="bg-primary p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-inner-platinum">
               <Terminal size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-xs uppercase tracking-[0.3em]">Neural Preview</h3>
              <p className="text-[9px] font-black uppercase opacity-60 tracking-widest">Active Simulator</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-3 rounded-xl transition-all shadow-inner-platinum"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-background/50 scrollbar-platinum">
          {history.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}>
               <div className={`max-w-[85%] p-5 rounded-2xl text-sm shadow-platinum-glow-sm ${
                 msg.sender === "system" ? "bg-surface-elevated/40 border border-border-subtle/30 italic text-text-muted text-[10px] tracking-tight" :
                 msg.sender === "user" ? "bg-primary text-white font-black rounded-tr-none" : "bg-surface-elevated border border-border-subtle/30 text-text-primary rounded-tl-none font-medium"
               }`}>
                 {msg.text}
               </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-6 bg-surface-elevated/20 border-t border-border-subtle/30 flex gap-4">
          <input
            className="flex-1 bg-background/50 border border-border-medium rounded-2xl px-6 py-4 text-sm font-bold text-text-primary outline-none focus:border-primary/40 transition-all placeholder:text-text-muted/40 shadow-inner-platinum"
            placeholder="Interagir com o bot neural..."
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && processNode(currentNodeId!)}
          />
          <button className="bg-primary text-white p-4 rounded-2xl shadow-platinum-glow group">
             <Send size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ChatbotBuilder() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: "1", type: "start", text: "Início do Fluxo Estratégico", x: 100, y: 200 },
    { id: "2", type: "message", text: "Saudação Neural Platinum", x: 400, y: 200 },
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
      text: `Configurar ${type} neural...`,
      x: 200 + Math.random() * 100,
      y: 200 + Math.random() * 100,
    };
    setNodes(prev => [...prev, newNode]);
  };

  if (isLoading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6 animate-pulse">
      <div className="w-20 h-20 rounded-[2.5rem] bg-surface-elevated flex items-center justify-center border border-border-subtle shadow-inner-platinum">
         <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
      <p className="font-black uppercase tracking-[0.5em] text-[10px] text-text-muted">Indexando Lógica Neural...</p>
    </div>
  );

  return (
    <div className="p-8 h-screen w-full flex flex-col bg-background space-y-8 text-text-primary overflow-hidden animate-in fade-in duration-700">
      <TestModal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} nodes={nodes} connections={connections} />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Conversation <span className="text-gradient-gold">Engine</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <Bot size={14} className="text-primary" />
            Arquiteto de fluxos lógicos e automação neural para atendimento Platinum.
          </p>
        </div>
        <div className="flex gap-5">
          <button onClick={() => setIsTestModalOpen(true)} className="px-8 py-4 bg-surface-elevated/20 border border-border-subtle/30 rounded-2xl text-text-primary font-black text-[10px] uppercase tracking-[0.3em] hover:bg-surface-elevated/40 transition-all flex items-center gap-4 shadow-inner-platinum">
            <Play size={16} className="text-emerald-500 shadow-platinum-glow-sm" /> Neural Preview
          </button>
          <button onClick={handleSave} disabled={isSaving} className="btn-primary py-4 px-12 shadow-platinum-glow text-[11px] uppercase tracking-[0.4em] flex items-center gap-4 disabled:opacity-60">
            {isSaving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save size={20} className="shadow-platinum-glow-sm" />} Consolidar Arquitetura
          </button>
        </div>
      </header>

      <div className="flex-1 flex gap-10 overflow-hidden min-h-0">
        {/* Toolbox */}
        <div className="w-72 space-y-8 shrink-0 flex flex-col">
          <div className="space-y-4">
             <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-4 flex items-center gap-2">
                <Database size={12} className="text-primary" /> Neural_Components
             </p>
             <div className="grid grid-cols-1 gap-4">
               {[
                 { type: 'message', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Mensagem' },
                 { type: 'question', icon: HelpCircle, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Pergunta' },
                 { type: 'condition', icon: GitFork, color: 'text-pink-500', bg: 'bg-pink-500/10', label: 'Condicional' },
                 { type: 'action', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Ação Neural' },
               ].map((tool: any) => (
                 <button
                   key={tool.type}
                   onClick={() => addNode(tool.type)}
                   className="platinum-card p-5 flex items-center gap-5 hover:border-primary/40 hover:bg-surface-elevated/20 transition-all duration-500 group shadow-platinum-glow-sm bg-surface-elevated/10"
                 >
                   <div className={`p-3 rounded-xl ${tool.bg} ${tool.color} group-hover:scale-110 transition-transform shadow-inner-platinum`}>
                     <tool.icon size={20} />
                   </div>
                   <span className="text-[11px] font-black text-text-primary uppercase tracking-[0.2em]">{tool.label}</span>
                 </button>
               ))}
             </div>
          </div>
          
          <div className="platinum-card p-8 space-y-6 border-dashed border-primary/20 opacity-80 flex-1 bg-surface-elevated/5">
             <div className="flex items-center gap-3 text-[11px] font-black text-primary uppercase tracking-[0.3em]">
               <Settings size={14} className="animate-spin-slow" /> Logic Optimization
             </div>
             <p className="text-[10px] text-text-muted leading-relaxed uppercase tracking-widest font-bold opacity-60">
               A arquitetura neural do BidFlow permite fluxos assíncronos de alta performance e processamento de linguagem natural via RAG nativo.
             </p>
             <div className="pt-4 border-t border-border-subtle/20 flex flex-col gap-4">
                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-text-muted">
                   <span>Nodes Active</span>
                   <span className="text-primary">{nodes.length}</span>
                </div>
                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-text-muted">
                   <span>Encrypted Pipes</span>
                   <span className="text-emerald-500">{connections.length}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Builder Canvas */}
        <div 
          ref={canvasRef}
          className="flex-1 platinum-card relative bg-background overflow-hidden cursor-crosshair border-border-subtle/30 shadow-platinum-glow overflow-y-auto overflow-x-auto"
          style={{ backgroundImage: 'radial-gradient(var(--color-primary) 1px, transparent 1px)', backgroundSize: '40px 40px', backgroundOpacity: 0.05 }}
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
                  d={`M ${from.x + 224} ${from.y + 60} C ${from.x + 300} ${from.y + 60}, ${to.x - 80} ${to.y + 60}, ${to.x} ${to.y + 60}`}
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  className="opacity-30"
                />
              );
            })}
          </svg>

          {/* Draggable Nodes */}
          {nodes.map(node => (
            <div
              key={node.id}
              style={{ left: node.x, top: node.y }}
              className="absolute w-64 bg-surface-elevated/40 backdrop-blur-xl rounded-[1.5rem] border-2 border-border-subtle/30 shadow-platinum-glow-sm z-10 group hover:border-primary/50 transition-all duration-500 cursor-move"
              onMouseDown={() => {}}
            >
              <div className={`px-6 py-3 rounded-t-[1.3rem] border-b border-border-subtle/30 flex items-center justify-between ${
                node.type === 'start' ? 'bg-emerald-500/10' : 
                node.type === 'condition' ? 'bg-pink-500/10' :
                node.type === 'action' ? 'bg-purple-500/10' : 'bg-primary/10'
              }`}>
                <div className="flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full bg-current ${
                      node.type === 'start' ? 'text-emerald-500' : 
                      node.type === 'condition' ? 'text-pink-500' :
                      node.type === 'action' ? 'text-purple-500' : 'text-primary'
                   } animate-pulse shadow-platinum-glow-sm`} />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-primary opacity-80">{node.type}</span>
                </div>
                <button onClick={() => setNodes(nodes.filter(n => n.id !== node.id))} className="text-text-muted hover:text-red-500 transition-colors p-1"><X size={14} /></button>
              </div>
              <div className="p-6">
                <textarea 
                  value={node.text}
                  onChange={(e) => setNodes(nodes.map(n => n.id === node.id ? { ...n, text: e.target.value } : n))}
                  className="w-full bg-transparent border-0 text-[11px] text-text-primary resize-none outline-none font-black uppercase tracking-tight leading-relaxed placeholder:text-text-muted/20"
                  rows={2}
                />
              </div>
              {/* Ports */}
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-platinum-glow border-2 border-background"></div>
              {node.type !== 'start' && <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-surface-elevated rounded-full border-2 border-border-subtle"></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
