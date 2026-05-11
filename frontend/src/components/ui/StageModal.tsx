import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { Modal } from './Modal';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (stageToEdit && stageToEdit.id) {
        await api.put(`/api/funnel-stages/${stageToEdit.id}`, { name, color });
        toast.success('Etapa atualizada!');
      } else {
        await api.post('/api/funnel-stages', { name, color });
        toast.success('Nova etapa configurada!');
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar etapa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={stageToEdit ? 'Editar Etapa' : 'Nova Etapa'}
      description="Configuração de etapa do funil de vendas"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-primary">Nome da Etapa</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="Ex: Qualificação Técnica"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-primary">Cor</label>
          <div className="flex items-center gap-4 p-4 bg-bg-tertiary/50 border border-border rounded-xl">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-12 rounded-lg border-0 cursor-pointer shrink-0"
            />
            <div>
              <span className="text-sm font-mono font-medium text-text-primary">{color}</span>
              <p className="text-xs text-text-muted">Cor hexadecimal da etapa</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button type="button" onClick={onClose} className="btn btn-outline">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
