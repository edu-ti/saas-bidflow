import { useState, useEffect } from 'react';
import type { Event as BigCalendarEvent } from 'react-big-calendar';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { setDefaultOptions } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Pencil, Trash2, X, Loader2, Save, Calendar as CalendarIcon, Clock, Lock, MapPin, AlignLeft, ChevronRight } from 'lucide-react';
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
      toast.error('Erro ao sincronizar cronograma');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingId) {
        await api.put(`/api/events/${editingId}`, formData);
        toast.success('Prazos atualizados!');
      } else {
        await api.post('/api/events', formData);
        toast.success('Evento agendado!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      toast.error('Erro na sincronização');
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
    if (!confirm('Eliminar este compromisso estratégico?')) return;
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
      className: isOpp ? 'calendar-event-gold' : 'calendar-event-blue',
      style: {
        borderRadius: '12px',
        border: 'none',
        padding: '4px 10px',
        fontSize: '11px',
        fontWeight: '800',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        boxShadow: isOpp ? '0 4px 12px rgba(var(--color-primary-rgb), 0.2)' : '0 4px 12px rgba(var(--color-secondary-rgb), 0.2)',
        color: isOpp ? '#0a0a0b' : '#ffffff'
      }
    };
  };

  return (
    <div className="p-8 h-screen flex flex-col bg-background space-y-10 text-text-primary overflow-hidden animate-in fade-in duration-700">
      <style>{`
        .rbc-calendar { background: transparent; color: var(--text-primary) !important; font-family: inherit; }
        .rbc-header { padding: 20px !important; font-weight: 900 !important; text-transform: uppercase; font-size: 10px; letter-spacing: 0.2em; color: var(--text-muted); border-bottom: 1px solid var(--border-subtle) !important; }
        .rbc-month-view { border: 1px solid var(--border-subtle) !important; border-radius: 2.5rem; background: var(--surface-elevated-low); overflow: hidden; }
        .rbc-day-bg { border-left: 1px solid var(--border-subtle) !important; transition: background 0.2s; }
        .rbc-day-bg:hover { background: var(--surface-elevated); }
        .rbc-month-row { border-top: 1px solid var(--border-subtle) !important; }
        .rbc-today { background: var(--color-primary-faint) !important; }
        .rbc-off-range-bg { background: var(--surface-elevated-muted) !important; opacity: 0.5; }
        .rbc-toolbar button { color: var(--text-primary) !important; border: 1px solid var(--border-subtle) !important; background: var(--surface-elevated) !important; font-weight: 900; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em; padding: 10px 20px !important; border-radius: 12px !important; margin: 0 4px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); shadow: var(--platinum-glow-sm); }
        .rbc-toolbar button:hover { background: var(--color-primary-faint) !important; border-color: var(--color-primary-muted) !important; color: var(--color-primary) !important; transform: translateY(-1px); }
        .rbc-toolbar button.rbc-active { background: var(--color-primary) !important; color: #0a0a0b !important; border-color: var(--color-primary) !important; box-shadow: var(--platinum-glow); }
        .rbc-event { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); margin-bottom: 4px !important; }
        .rbc-event:hover { transform: scale(1.03) translateY(-1px); filter: brightness(1.1); z-index: 10; }
        .calendar-event-gold { background: var(--color-primary) !important; border: 1px solid rgba(0,0,0,0.1) !important; }
        .calendar-event-blue { background: var(--color-secondary) !important; border: 1px solid rgba(0,0,0,0.1) !important; }
        .rbc-show-more { color: var(--color-primary) !important; font-weight: 900; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px; }
        .rbc-date-cell { padding: 12px !important; font-weight: 800; font-size: 13px; color: var(--text-muted); }
        .rbc-now .rbc-date-cell { color: var(--color-primary) !important; }
      `}</style>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Cronograma <span className="text-gradient-gold">Estratégico</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <Lock size={14} className="text-primary" />
            Agenda unificada de CRM, prazos fatais e sessões públicas Platinum.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-8 bg-surface-elevated/40 px-8 py-3.5 rounded-2xl border border-border-subtle shadow-platinum-glow-sm">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_10px_rgba(var(--color-secondary-rgb),0.5)]"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Business / CRM</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.5)]"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Editais / Prazos</span>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            aria-label="Agendar novo compromisso"
            className="btn-primary py-3.5 px-10 shadow-platinum-glow"
          >
            <Plus className="w-4 h-4" />
            Novo Evento
          </button>
        </div>
      </header>

      <div className="platinum-card p-10 flex-1 min-h-[500px] flex flex-col overflow-hidden bg-surface-elevated/10 backdrop-blur-md">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-6 opacity-40">
            <Loader2 className="animate-spin text-primary w-12 h-12" />
            <p className="font-black uppercase tracking-[0.4em] text-[10px]">Sincronizando Agenda Global...</p>
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
            onSelectEvent={handleEdit}
          />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'REFINAR COMPROMISSO' : 'NOVA DATA ESTRATÉGICA'} size="md">
        <form onSubmit={handleSubmit} className="space-y-8 p-2">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Título do Compromisso *</label>
            <div className="relative">
              <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/60 w-5 h-5" />
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full pl-14 pr-5 py-4 bg-background border border-border-medium rounded-xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40"
                placeholder="Ex: Reunião de Alinhamento / Prazo Limite Edital X"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Início do Evento *</label>
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-5 py-4 bg-background border border-border-medium rounded-xl text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Conclusão Estimada</label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-5 py-4 bg-background border border-border-medium rounded-xl text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Classificação</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as 'event' | 'opportunity' })}
                className="w-full px-5 py-4 bg-background border border-border-medium rounded-xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="event" className="bg-surface">Evento / Reunião (CRM)</option>
                <option value="opportunity" className="bg-surface">Prazo / Edital (Strategic)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Localidade / Link</label>
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-14 pr-5 py-4 bg-background border border-border-medium rounded-xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40"
                  placeholder="Presencial ou Meet/Teams..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Briefing do Evento</label>
            <div className="relative">
              <AlignLeft className="absolute left-5 top-5 text-text-muted w-5 h-5" />
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full pl-14 pr-5 py-4 bg-background border border-border-medium rounded-xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all resize-none placeholder:text-text-muted/40"
                rows={4}
                placeholder="Detalhes adicionais e objetivos da agenda..."
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-8 border-t border-border-subtle">
            {isEditing && (
              <button
                type="button"
                onClick={() => handleDelete(editingId!)}
                className="px-8 py-4 bg-red-500/10 text-red-500 border border-red-500/20 font-black rounded-xl hover:bg-red-500/20 transition-all text-[10px] uppercase tracking-widest flex items-center gap-3"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            )}
            <div className="flex gap-6 ml-auto">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3 text-text-muted font-black hover:text-text-primary transition-all text-[10px] uppercase tracking-widest"
              >
                Descartar
              </button>
              <button
                type="submit"
                className="btn-primary py-4 px-12 uppercase text-[10px] tracking-widest shadow-platinum-glow"
              >
                {isEditing ? 'Atualizar Evento' : 'Confirmar Agenda'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
