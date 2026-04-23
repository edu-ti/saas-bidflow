import { useState, useEffect } from 'react';
import type { Event as BigCalendarEvent } from 'react-big-calendar';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { setDefaultOptions } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Pencil, Trash2, X, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import Modal from './ui/Modal';

import 'react-big-calendar/lib/css/react-big-calendar.css';

setDefaultOptions({ locale: ptBR });
const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface APIEvent {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  type: 'event' | 'opportunity';
  description?: string;
  location?: string;
}

export default function Agenda() {
  const [events, setEvents] = useState<BigCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    start_date: '',
    end_date: '',
    description: '',
    location: '',
    type: 'event' as 'event' | 'opportunity',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/api/events');
      const data: APIEvent[] = res.data.data;
      const formattedEvents = data.map(ev => ({
        id: ev.id,
        title: ev.title,
        start: new Date(ev.start_date),
        end: ev.end_date ? new Date(ev.end_date) : new Date(ev.start_date),
        resource: ev.type,
      }));
      setEvents(formattedEvents);
    } catch (error) {
      toast.error('Erro ao carregar eventos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingId) {
        await api.put(`/api/events/${editingId}`, formData);
        toast.success('Evento atualizado!');
      } else {
        await api.post('/api/events', formData);
        toast.success('Evento criado!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      toast.error(isEditing ? 'Erro ao atualizar' : 'Erro ao criar');
      console.error(error);
    }
  };

  const handleEdit = (event: BigCalendarEvent) => {
    const apiEvent = events.find(e => e.id === event.id);
    if (apiEvent) {
      setFormData({
        title: String(event.title),
        start_date: format(event.start as Date, 'yyyy-MM-dd\'T\'HH:mm'),
        end_date: event.end ? format(event.end as Date, 'yyyy-MM-dd\'T\'HH:mm') : '',
        description: '',
        location: '',
        type: (event.resource as 'event' | 'opportunity') || 'event',
      });
      setEditingId(Number(event.id));
      setIsEditing(true);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar este evento?')) return;
    try {
      await api.delete(`/api/events/${id}`);
      toast.success('Evento eliminado!');
      fetchEvents();
    } catch (error) {
      toast.error('Erro ao eliminar');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', start_date: '', end_date: '', description: '', location: '', type: 'event' });
    setEditingId(null);
    setIsEditing(false);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const eventStyleGetter = (event: BigCalendarEvent) => {
    const backgroundColor = event.resource === 'opportunity' ? '#f97316' : '#3b82f6';
    return { style: { backgroundColor, borderRadius: '5px', opacity: 0.9, color: 'white', border: '0px', display: 'block' } };
  };

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agenda Integrada</h1>
          <p className="text-sm text-slate-500">Eventos de CRM e Prazos de Licitações</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Novo Evento
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-slate-600">Reuniões/Eventos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-xs text-slate-600">Prazos e Editais</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex-1 min-h-[600px] flex flex-col overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-500">A carregar agenda...</div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            culture="pt-BR"
            eventPropGetter={eventStyleGetter}
            messages={{
              next: "Próximo", previous: "Anterior", today: "Hoje",
              month: "Mês", week: "Semana", day: "Dia"
            }}
            className="flex-1 text-slate-700 bg-white"
            onSelectEvent={handleEdit}
          />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Editar Evento' : 'Novo Evento'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Título *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Título do evento"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Data Início *</label>
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Data Fim</label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo</label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value as 'event' | 'opportunity' })}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="event">Reunião/Evento</option>
              <option value="opportunity">Prazo/Edital</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Local</label>
            <input
              type="text"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Local do evento"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Descrição do evento"
            />
          </div>

          <div className="flex justify-between pt-4">
            {isEditing && (
              <button
                type="button"
                onClick={() => handleDelete(editingId!)}
                className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4 inline mr-2" />
                Eliminar
              </button>
            )}
            <div className="flex gap-3 ml-auto">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm"
              >
                <X className="w-4 h-4 inline mr-2" />
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm"
              >
                <Save className="w-4 h-4 inline mr-2" />
                {isEditing ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}