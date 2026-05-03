import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  ReactFlow,
  addEdge, 
  Background, 
  Controls, 
  Panel,
  MarkerType,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from '@xyflow/react';
import type { Connection, Edge, Node, NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Save, Play, Trash2, MessageSquare, HelpCircle, UserPlus, 
  Zap, Loader2, Bot, ChevronRight, Settings, Database, X,
  ArrowRight, Plus
} from 'lucide-react';
import { MessageNode, QuestionNode, CaptureNode, ActionNode } from './chatbot/nodes/CustomNodes';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const nodeTypes = {
  message: MessageNode,
  question: QuestionNode,
  capture: CaptureNode,
  action: ActionNode,
};

const initialNodes: Node[] = [
  {
    id: 'node-1',
    type: 'message',
    position: { x: 250, y: 50 },
    data: { label: 'Olá! Bem-vindo ao atendimento BidFlow.' },
  },
];

const initialEdges: Edge[] = [];

function ChatbotBuilderInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Load data
  useEffect(() => {
    const loadFlow = async () => {
      try {
        const res = await api.get('/api/chatbot/flows/active');
        if (res.data && res.data.nodes) {
          setNodes(res.data.nodes);
          setEdges(res.data.connections || []);
        }
      } catch (err) {
        console.log('Sem fluxo ativo encontrado.');
      }
    };
    loadFlow();
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ 
      ...params, 
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-primary)' },
      style: { stroke: 'var(--color-primary)', strokeWidth: 2 }
    }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type,
        position,
        data: { label: `Novo bloco de ${type}`, options: type === 'question' ? ['Sim', 'Não'] : undefined },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const updateNodeData = (newData: any) => {
    if (!selectedNode) return;
    
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: { ...node.data, ...newData },
          };
        }
        return node;
      })
    );
    setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, ...newData } });
  };

  const deleteNode = () => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
    setSelectedNode(null);
    toast.success('Bloco removido.');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.post('/api/chatbot/flows', {
        name: 'Fluxo Neural Principal',
        nodes: nodes,
        connections: edges,
        is_active: true
      });
      toast.success('Arquitetura salva com sucesso.');
    } catch (error) {
      toast.error('Erro ao salvar fluxo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden animate-in fade-in duration-700">
      {/* Header */}
      <header className="p-6 border-b border-border-subtle flex justify-between items-center bg-surface/30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-platinum-glow-sm">
            <Bot className="text-primary" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase">
              Chatbot <span className="text-gradient-gold">Architect</span>
            </h1>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">IA Conversacional Neural</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="px-6 py-2.5 bg-surface-elevated/40 border border-border-subtle rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-surface-elevated transition-all flex items-center gap-3">
            <Play size={14} className="text-emerald-500" /> Simular Fluxo
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="btn-primary px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-platinum-glow"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
            Salvar Fluxo
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Componentes Arrastáveis */}
        <aside className="w-72 border-r border-border-subtle bg-surface/20 p-6 flex flex-col gap-8">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] flex items-center gap-2">
              <Database size={12} className="text-primary" /> Neural_Nodes
            </p>
            <div className="space-y-3">
              {[
                { type: 'message', label: 'Mensagem de Texto', icon: MessageSquare, color: 'text-primary' },
                { type: 'question', label: 'Pergunta (Escolha)', icon: HelpCircle, color: 'text-secondary' },
                { type: 'capture', label: 'Captura de Dado', icon: UserPlus, color: 'text-emerald-500' },
                { type: 'action', label: 'Ação (Transferir)', icon: Zap, color: 'text-primary' },
              ].map((item) => (
                <div
                  key={item.type}
                  className="platinum-card p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing hover:border-primary/40 transition-all group bg-surface-elevated/5"
                  onDragStart={(event) => {
                    event.dataTransfer.setData('application/reactflow', item.type);
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                  draggable
                >
                  <div className={`p-2 rounded-lg bg-background border border-border-subtle group-hover:scale-110 transition-transform ${item.color}`}>
                    <item.icon size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto platinum-card p-5 bg-primary/5 border-primary/20 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Settings size={14} className="animate-spin-slow" />
              <span className="text-[9px] font-black uppercase tracking-widest">Guia Rápido</span>
            </div>
            <p className="text-[9px] text-text-secondary leading-relaxed font-bold opacity-70">
              Arraste os blocos para o canvas e conecte-os pelas alças para criar o fluxo de conversação.
            </p>
          </div>
        </aside>

        {/* Canvas Central */}
        <main className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[20, 20]}
          >
            <Background color="var(--color-primary)" gap={20} size={1} className="opacity-10" />
            <Controls className="!bg-surface !border-border-subtle !shadow-platinum-glow fill-text-primary" />
            <Panel position="top-right" className="bg-surface/80 backdrop-blur-md p-3 rounded-xl border border-border-subtle shadow-platinum-glow-sm">
               <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                 <span>Nodes: {nodes.length}</span>
                 <div className="w-1 h-1 rounded-full bg-border-medium" />
                 <span>Edges: {edges.length}</span>
               </div>
            </Panel>
          </ReactFlow>
        </main>

        {/* Painel de Configuração (Right Sidebar) */}
        {selectedNode && (
          <aside className="w-80 border-l border-border-subtle bg-surface/30 backdrop-blur-xl p-8 animate-in slide-in-from-right-4 duration-500 overflow-y-auto">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-text-primary">Propriedades</h3>
              <button onClick={() => setSelectedNode(null)} className="text-text-muted hover:text-text-primary"><X size={18} /></button>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Conteúdo do Bloco</label>
                <textarea
                  className="w-full bg-background/50 border border-border-medium rounded-xl p-4 text-sm font-bold text-text-primary outline-none focus:border-primary/40 transition-all h-32"
                  value={selectedNode.data.label}
                  onChange={(e) => updateNodeData({ label: e.target.value })}
                />
              </div>

              {selectedNode.type === 'question' && (
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Opções de Resposta</label>
                  <div className="space-y-2">
                    {(selectedNode.data.options || []).map((opt: string, i: number) => (
                      <div key={i} className="flex gap-2">
                        <input
                          className="flex-1 bg-background/50 border border-border-medium rounded-xl px-4 py-2 text-xs font-bold"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...selectedNode.data.options];
                            newOpts[i] = e.target.value;
                            updateNodeData({ options: newOpts });
                          }}
                        />
                        <button 
                          onClick={() => {
                            const newOpts = selectedNode.data.options.filter((_: any, idx: number) => idx !== i);
                            updateNodeData({ options: newOpts });
                          }}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => updateNodeData({ options: [...(selectedNode.data.options || []), 'Nova Opção'] })}
                      className="w-full py-2 bg-primary/10 border border-primary/20 rounded-xl text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={14} /> Adicionar Opção
                    </button>
                  </div>
                </div>
              )}

              {selectedNode.type === 'capture' && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Tipo de Dado</label>
                  <select
                    className="w-full bg-background/50 border border-border-medium rounded-xl px-4 py-3 text-xs font-bold text-text-primary outline-none"
                    value={selectedNode.data.type || 'email'}
                    onChange={(e) => updateNodeData({ type: e.target.value })}
                  >
                    <option value="email">E-mail</option>
                    <option value="phone">Telefone</option>
                    <option value="name">Nome</option>
                  </select>
                </div>
              )}

              <div className="pt-8 border-t border-border-subtle/30">
                <button 
                  onClick={deleteNode}
                  className="w-full py-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center justify-center gap-3"
                >
                  <Trash2 size={16} /> Excluir Bloco
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default function ChatbotBuilder() {
  return (
    <ReactFlowProvider>
      <ChatbotBuilderInner />
    </ReactFlowProvider>
  );
}
