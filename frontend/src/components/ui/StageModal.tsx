import React, { useState, useEffect } from 'react';
import { X, Sparkles, Save, Palette, Type } from 'lucide-react';
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
  const [color, setColor] = useState('#fbbf24');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stageToEdit) {
      setName(stageToEdit.name);
      setColor(stageToEdit.color || '#fbbf24');
    } else {
      setName('');
      setColor('#fbbf24');
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-background border border-white/10 rounded-2xl shadow-platinum-glow w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-8 border-b border-white/5 bg-white/[0.02]">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              {stageToEdit ? 'Refinar Fase' : 'Nova Etapa'}
            </h2>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em]">Configuração de fluxo estratégico</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-white transition-colors bg-white/5 p-2 rounded-xl border border-white/5">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
              <Type size={12} /> Nome da Etapa
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-text-muted/30"
              placeholder="Ex: Qualificação Técnica"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
              <Palette size={12} /> Identificador Visual
            </div>
            <div className="flex items-center gap-4 bg-white/[0.02] border border-white/10 p-4 rounded-xl">
              <div className="relative group">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border-0 cursor-pointer bg-transparent"
                />
                <div className="absolute inset-0 rounded-lg ring-2 ring-white/10 pointer-events-none" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white font-mono uppercase tracking-widest">{color}</span>
                <span className="text-[9px] text-text-muted font-bold uppercase">Cor da Fase no Funil</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3.5 bg-primary text-background font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-primary-hover transition-all shadow-platinum-glow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? 'Salvando...' : 'Sincronizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
