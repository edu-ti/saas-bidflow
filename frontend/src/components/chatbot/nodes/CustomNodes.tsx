import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { MessageSquare, HelpCircle, UserPlus, Zap } from 'lucide-react';

const NodeWrapper = ({ children, selected, title, icon: Icon, color }: any) => (
  <div className={`min-w-[200px] bg-surface border-2 rounded-xl overflow-hidden transition-all duration-300 ${
    selected ? `border-primary shadow-platinum-glow-sm scale-[1.02]` : 'border-border-subtle hover:border-border-medium'
  }`}>
    <div className={`p-3 flex items-center gap-2 border-b border-border-subtle bg-surface-elevated/50 ${color}`}>
      <Icon size={16} className="text-primary" />
      <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">{title}</span>
    </div>
    <div className="p-4 text-[11px] text-text-secondary leading-relaxed font-medium">
      {children}
    </div>
  </div>
);

export const MessageNode = memo(({ data, selected }: NodeProps) => (
  <NodeWrapper title="Mensagem de Texto" icon={MessageSquare} selected={selected} color="border-l-4 border-l-primary">
    <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-primary !border-2 !border-background" />
    <p>{data.label || 'Digite sua mensagem...'}</p>
    <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-primary !border-2 !border-background" />
  </NodeWrapper>
));

export const QuestionNode = memo(({ data, selected }: NodeProps) => (
  <NodeWrapper title="Pergunta" icon={HelpCircle} selected={selected} color="border-l-4 border-l-secondary">
    <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-secondary !border-2 !border-background" />
    <div className="space-y-3">
      <p className="font-bold text-text-primary">{data.label || 'Qual sua dúvida?'}</p>
      <div className="space-y-1.5">
        {(data.options || ['Opção 1']).map((opt: string, i: number) => (
          <div key={i} className="px-2 py-1 bg-surface-elevated rounded border border-border-subtle relative group">
            {opt}
            <Handle 
              type="source" 
              position={Position.Right} 
              id={`option-${i}`}
              className="!w-3 !h-3 !bg-secondary !border-2 !border-background !-right-1.5" 
            />
          </div>
        ))}
      </div>
    </div>
  </NodeWrapper>
));

export const CaptureNode = memo(({ data, selected }: NodeProps) => (
  <NodeWrapper title="Captura de Dado" icon={UserPlus} selected={selected} color="border-l-4 border-l-emerald-500">
    <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-background" />
    <p className="mb-2">{data.label || 'Qual seu e-mail?'}</p>
    <div className="px-2 py-1 bg-background/50 border border-border-subtle rounded italic text-text-muted text-[10px]">
      Tipo: {data.type === 'email' ? 'E-mail' : 'Telefone'}
    </div>
    <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-background" />
  </NodeWrapper>
));

export const ActionNode = memo(({ data, selected }: NodeProps) => (
  <NodeWrapper title="Ação" icon={Zap} selected={selected} color="border-l-4 border-l-primary">
    <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-primary !border-2 !border-background" />
    <div className="flex items-center gap-2 text-primary font-black uppercase tracking-tighter">
      <span>{data.action === 'transfer' ? 'Transferir para Humano' : 'Encerrar Fluxo'}</span>
    </div>
    <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-primary !border-2 !border-background" />
  </NodeWrapper>
));
