import { useState, useEffect } from 'react';
import type { Event as BigCalendarEvent } from 'react-big-calendar';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { setDefaultOptions } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Trash2, Loader2, Save, Calendar as CalendarIcon, MapPin, AlignLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import Modal from './ui/Modal';
import { DatePicker } from './ui/DatePicker';
import { Select } from './ui/Select';
import { usePermissions } from '../hooks/usePermissions';

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
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('commercial', 'agenda', 'create');
  const canEdit = hasPermission('commercial', 'agenda', 'edit');
  const canDelete = hasPermission('commercial', 'agenda', 'delete');

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
      const data: APIEvent[] = res.data.data || [];
      const formattedEvents = data.map(ev => ({
        id: ev.id,
        title: ev.title,
        start: new Date(ev.start_date),
        end: ev.end_date ? new Date(ev.end_date) : new Date(ev.start_date),
        resource: ev.type,
      }));
      setEvents(formattedEvents);
    } catch (error) {
      toast.error('Erro ao carregar agenda');
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
        toast.success('Evento agendado!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      toast.error('Erro ao salvar evento');
    }
  };

  const handleEdit = (event: BigCalendarEvent) => {
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
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remover este evento?')) return;
    try {
      await api.delete(`/api/events/${id}`);
      toast.success('Evento removido.');
      fetchEvents();
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', start_date: '', end_date: '', description: '', location: '', type: 'event' });
    setEditingId(null);
    setIsEditing(false);
  };

  const eventStyleGetter = (event: BigCalendarEvent) => {
    const isOpp = event.resource === 'opportunity';
    return {
      style: {
        borderRadius: '4px',
        border: 'none',
        padding: '1px 5px',
        fontSize: '10px',
        fontWeight: '600',
        lineHeight: '1.3',
        backgroundColor: isOpp ? 'var(--primary)' : 'color-mix(in srgb, var(--primary) 15%, var(--bg-tertiary))',
        color: isOpp ? '#ffffff' : 'var(--text-primary)',
        boxShadow: 'none',
      }
    };
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] space-y-4 animate-fade-in overflow-hidden">
      <style>{`
        .rbc-calendar { background: transparent; color: var(--text-primary); font-family: inherit; }
        .rbc-header { padding: 16px !important; font-weight: 600; font-size: 12px; color: var(--text-muted); border-bottom: 1px solid var(--border) !important; }
        .rbc-month-view { border: 1px solid var(--border) !important; border-radius: 12px; background: var(--bg-secondary); overflow: hidden; }
        .rbc-day-bg { border-left: 1px solid var(--border) !important; transition: background 0.2s; }
        .rbc-day-bg:hover { background: var(--bg-tertiary); }
        .rbc-month-row { border-top: 1px solid var(--border) !important; }
        .rbc-today { background: color-mix(in srgb, var(--primary) 5%, transparent) !important; }
        .rbc-off-range-bg { background: var(--bg-tertiary) !important; opacity: 0.5; }
        .rbc-toolbar button { color: var(--text-primary) !important; border: 1px solid var(--border) !important; background: var(--bg-secondary) !important; font-weight: 600; font-size: 12px; padding: 8px 16px !important; border-radius: 8px !important; margin: 0 4px; transition: all 0.2s; }
        .rbc-toolbar button:hover { background: var(--bg-tertiary) !important; border-color: var(--primary) !important; color: var(--primary) !important; }
        .rbc-toolbar button.rbc-active { background: var(--primary) !important; color: #ffffff !important; border-color: var(--primary) !important; }
        .rbc-event { transition: filter 0.15s ease; margin-bottom: 2px !important; cursor: pointer; }
        .rbc-event:hover { filter: brightness(1.2); }
        .rbc-show-more { color: var(--primary) !important; font-weight: 600; font-size: 11px; padding: 4px; }
        .rbc-date-cell { padding: 10px !important; font-weight: 500; font-size: 13px; color: var(--text-secondary); }
        .rbc-now .rbc-date-cell { color: var(--primary) !important; font-weight: 600; }
      `}</style>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Agenda
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Compromissos, reuniões e prazos estratégicos.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-4 px-4 py-2 rounded-lg border border-border bg-bg-secondary">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
              <span className="text-xs text-text-muted font-medium">Editais / Prazos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--color-secondary)' }}></div>
              <span className="text-xs text-text-muted font-medium">CRM / Reuniões</span>
            </div>
          </div>
          {canCreate && (
            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="btn btn-primary text-xs"
            >
              <Plus size={14} />
              Novo Evento
            </button>
          )}
        </div>
      </header>

      <div className="card p-4 flex-1 min-h-[500px] flex flex-col overflow-hidden">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
            <p className="text-sm text-text-muted">Carregando agenda...</p>
          </div>
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
              month: "Mês", week: "Semana", day: "Dia",
              allDay: "Dia Inteiro", date: "Data", time: "Hora", event: "Evento"
            }}
            className="flex-1"
            onSelectEvent={canEdit ? handleEdit : undefined}
          />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Editar Evento' : 'Novo Evento'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-5 p-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Título *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="Ex: Reunião de Alinhamento / Prazo Limite Edital X"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Início *</label>
              <DatePicker
                selected={formData.start_date ? new Date(formData.start_date) : null}
                onChange={date => setFormData({ ...formData, start_date: date ? format(date, "yyyy-MM-dd'T'HH:mm") : '' })}
                showTimeSelect
                placeholderText="dd/mm/aaaa --:--"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Término</label>
              <DatePicker
                selected={formData.end_date ? new Date(formData.end_date) : null}
                onChange={date => setFormData({ ...formData, end_date: date ? format(date, "yyyy-MM-dd'T'HH:mm") : '' })}
                showTimeSelect
                placeholderText="dd/mm/aaaa --:--"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Tipo</label>
              <Select
                value={formData.type}
                onChange={v => setFormData({ ...formData, type: v as 'event' | 'opportunity' })}
                options={[
                  { value: 'event', label: 'Evento / Reunião (CRM)' },
                  { value: 'opportunity', label: 'Prazo / Edital (Estratégico)' }
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Local</label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="input"
                placeholder="Presencial ou Meet/Teams..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Descrição</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="input resize-none"
              rows={4}
              placeholder="Detalhes adicionais e objetivos..."
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-border">
            {isEditing && canDelete && (
              <button
                type="button"
                onClick={() => handleDelete(editingId!)}
                className="btn btn-ghost text-red-500 hover:bg-red-500/10"
              >
                <Trash2 size={14} />
                Excluir
              </button>
            )}
            <div className={`flex gap-3 ${isEditing && canDelete ? 'ml-auto' : 'ml-auto'}`}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn btn-outline"
              >
                Cancelar
              </button>
              {(canCreate || (isEditing && canEdit)) && (
                <button type="submit" className="btn btn-primary">
                  <Save size={14} />
                  {isEditing ? 'Atualizar' : 'Salvar'}
                </button>
              )}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
