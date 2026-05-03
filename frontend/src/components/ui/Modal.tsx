import { type ReactNode, useEffect } from 'react';
import { X, Lock } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]',
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop with extreme blur and dark overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Platinum Modal Content */}
      <div 
        className={`relative w-full ${sizeClasses[size]} bg-surface border border-white/10 rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
      >
        {/* Subtle top gradient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02] flex-shrink-0">
          <div className="space-y-1">
            <h2 id="modal-title" className="text-sm font-black text-white uppercase tracking-[0.3em]">
              {title}
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-text-muted font-bold uppercase tracking-widest">
              <Lock size={10} className="text-primary" />
              Secure Strategic Panel
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-3 hover:bg-white/5 text-text-muted hover:text-white rounded-2xl transition-all border border-transparent hover:border-white/10 group"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          <div className="animate-in slide-in-from-bottom-2 duration-300">
            {children}
          </div>
        </div>

        {/* Footer Glow (Subtle) */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
