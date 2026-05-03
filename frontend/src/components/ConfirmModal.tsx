import { X, AlertCircle, CheckCircle2, AlertTriangle, Info, ShieldCheck, Zap } from "lucide-react";

export type ConfirmModalType = "info" | "warning" | "error" | "success";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: ConfirmModalType;
  onConfirm?: () => void;
  confirmText?: string;
  showCancel?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  onConfirm,
  confirmText = "OK",
  showCancel = true,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const typeConfig = {
    info: { 
      bg: "bg-primary/10", 
      text: "text-primary", 
      border: "border-primary/20", 
      icon: Info,
      btn: "bg-primary text-white hover:bg-primary-hover shadow-platinum-glow" 
    },
    warning: { 
      bg: "bg-amber-500/10", 
      text: "text-amber-500", 
      border: "border-amber-500/20", 
      icon: AlertTriangle,
      btn: "bg-amber-500 text-white hover:bg-amber-600 shadow-platinum-glow-sm"
    },
    error: { 
      bg: "bg-red-500/10", 
      text: "text-red-500", 
      border: "border-red-500/20", 
      icon: AlertCircle,
      btn: "bg-red-500 text-white hover:bg-red-600 shadow-platinum-glow-sm"
    },
    success: { 
      bg: "bg-emerald-500/10", 
      text: "text-emerald-500", 
      border: "border-emerald-500/20", 
      icon: CheckCircle2,
      btn: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-platinum-glow-sm"
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="platinum-card w-full max-w-md bg-surface-elevated/40 backdrop-blur-2xl border-border-subtle/30 shadow-platinum-glow overflow-hidden animate-in zoom-in-95 duration-500 rounded-[2.5rem]">
        <div className="p-8 border-b border-border-subtle/20 flex flex-col items-center text-center gap-6">
          <div className={`w-20 h-20 rounded-[2rem] ${config.bg} border ${config.border} flex items-center justify-center ${config.text} shadow-inner-platinum`}>
            <Icon size={40} className="shadow-platinum-glow-sm" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-black text-text-primary tracking-tighter uppercase">{title}</h3>
            <div className="flex items-center justify-center gap-2 text-[10px] text-text-muted font-black uppercase tracking-[0.3em] opacity-60 italic">
               <ShieldCheck size={12} className="text-primary" /> Platinum Strategic Validation
            </div>
          </div>
        </div>
        
        <div className="px-10 py-10">
          <p className="text-text-secondary text-sm font-bold text-center leading-relaxed opacity-80 uppercase tracking-tight">
            {message}
          </p>
        </div>

        <div className="p-10 bg-surface-elevated/20 border-t border-border-subtle/20 flex flex-col sm:flex-row gap-4">
          {showCancel && (
            <button
              onClick={onClose}
              className="flex-1 py-4.5 bg-surface-elevated/40 border border-border-subtle rounded-2xl text-[11px] font-black text-text-muted uppercase tracking-[0.4em] hover:text-text-primary hover:bg-surface-elevated transition-all shadow-inner-platinum"
            >
              DESCARTAR
            </button>
          )}
          {onConfirm && (
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-4.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 ${config.btn}`}
            >
              <Zap size={14} className="shadow-platinum-glow-sm" />
              {confirmText.toUpperCase()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}