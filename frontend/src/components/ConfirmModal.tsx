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
      btn: "btn-primary" 
    },
    warning: { 
      bg: "bg-warning/10", 
      text: "text-warning", 
      border: "border-warning/20", 
      icon: AlertTriangle,
      btn: "bg-warning text-white hover:bg-warning/90 shadow-sm px-4 py-2 rounded-lg text-sm font-medium"
    },
    error: { 
      bg: "bg-danger/10", 
      text: "text-danger", 
      border: "border-danger/20", 
      icon: AlertCircle,
      btn: "bg-danger text-white hover:bg-danger/90 shadow-sm px-4 py-2 rounded-lg text-sm font-medium"
    },
    success: { 
      bg: "bg-success/10", 
      text: "text-success", 
      border: "border-success/20", 
      icon: CheckCircle2,
      btn: "bg-success text-white hover:bg-success/90 shadow-sm px-4 py-2 rounded-lg text-sm font-medium"
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-bg-primary border border-border shadow-xl w-full max-w-md overflow-hidden rounded-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-border flex flex-col items-center text-center gap-4">
          <div className={`w-16 h-16 rounded-2xl ${config.bg} border ${config.border} flex items-center justify-center ${config.text}`}>
            <Icon size={32} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-text-secondary">
               <ShieldCheck size={14} className="text-text-muted" /> Confirmação
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-text-secondary text-sm text-center leading-relaxed">
            {message}
          </p>
        </div>

        <div className="p-6 bg-bg-secondary border-t border-border flex flex-col sm:flex-row gap-3">
          {showCancel && (
            <button
              onClick={onClose}
              className="btn btn-outline flex-1 justify-center"
            >
              Cancelar
            </button>
          )}
          {onConfirm && (
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 flex items-center justify-center gap-2 ${config.btn === 'btn-primary' ? 'btn btn-primary' : config.btn}`}
            >
              <Zap size={16} />
              <span>{confirmText}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}