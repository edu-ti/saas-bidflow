import React, { useState, useEffect } from 'react';
import { X, Sparkles, Save, Palette, Type, Loader2 } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

type Stage = {
  id?: number;
  name: string;
  color: string;
  order?: number;
};

type StageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  stageToEdit?: Stage | null;
};

export default function StageModal({ isOpen, onClose, onSaved, stageToEdit }: StageModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stageToEdit) {
      setName(stageToEdit.name);
      setColor(stageToEdit.color || '#6366f1');
    } else {
      setName('');
      setColor('#6366f1');
    }
  }, [stageToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (stageToEdit && stageToEdit.id) {
        await api.put(`/api/funnel-stages/${stageToEdit.id}`, { name, color });
        toast.success('Etapa estratégica atualizada!');
      } else {
        await api.post('/api/funnel-stages', { name, color });
        toast.success('Nova fase configurada no pipeline!');
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Falha ao sincronizar etapa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-xl p-4 animate-in fade-in duration-500">
      <div className="bg-surface border border-border-subtle rounded-[2.5rem] shadow-platinum w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="flex justify-between items-center p-10 border-b border-border-subtle bg-surface-elevated/20">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-text-primary uppercase tracking-tighter flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Sparkles size={20} className="text-primary shadow-platinum-glow-sm" />
              </div>
              {stageToEdit ? 'Refinar Fase' : 'Nova Etapa Neural'}
            </h2>
            <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em] opacity-60">Arquitetura de Fluxo Estratégico</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-primary transition-all p-3 bg-surface-elevated/40 rounded-2xl border border-border-subtle shadow-inner-platinum">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
              <Type size={14} /> Nome da Etapa Platinum
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background/50 border border-border-medium rounded-2xl px-6 py-4 text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/30 shadow-inner-platinum"
              placeholder="Ex: Qualificação Técnica"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
              <Palette size={14} /> Identificador Visual Neural
            </div>
            <div className="flex items-center gap-6 bg-surface-elevated/30 border border-border-subtle p-6 rounded-3xl shadow-inner-platinum">
              <div className="relative group shrink-0">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-14 h-14 rounded-2xl border-0 cursor-pointer bg-transparent"
                />
                <div className="absolute inset-0 rounded-2xl ring-4 ring-background/10 pointer-events-none group-hover:ring-primary/20 transition-all shadow-platinum-glow-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-black text-text-primary font-mono uppercase tracking-[0.2em]">{color}</span>
                <span className="text-[9px] text-text-muted font-black uppercase tracking-widest opacity-60">Cor Hexadecimal da Fase</span>
              </div>
            </div>
          </div>

          <div className="flex gap-5 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 bg-surface-elevated/50 border border-border-subtle rounded-2xl text-text-primary font-black text-[10px] uppercase tracking-[0.3em] hover:bg-surface-elevated transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-8 py-4 btn-primary flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
              <span className="font-black text-[10px] uppercase tracking-[0.3em]">{loading ? 'Sincronizando...' : 'Consolidar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
