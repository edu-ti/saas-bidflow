import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
  const [color, setColor] = useState('#3b82f6');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stageToEdit) {
      setName(stageToEdit.name);
      setColor(stageToEdit.color || '#3b82f6');
    } else {
      setName('');
      setColor('#3b82f6');
    }
  }, [stageToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (stageToEdit && stageToEdit.id) {
        await api.put(`/api/funnel-stages/${stageToEdit.id}`, { name, color });
        toast.success('Etapa atualizada com sucesso!');
      } else {
        await api.post('/api/funnel-stages', { name, color });
        toast.success('Nova etapa criada!');
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar a etapa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {stageToEdit ? 'Editar Etapa' : 'Nova Etapa'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Etapa*</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Proposta Enviada"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cor</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded border-0 cursor-pointer"
              />
              <span className="text-sm text-slate-500">{color}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Etapa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
