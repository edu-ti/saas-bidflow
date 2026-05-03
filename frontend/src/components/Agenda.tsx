import { useState, useEffect } from 'react';
import type { Event as BigCalendarEvent } from 'react-big-calendar';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { setDefaultOptions } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Pencil, Trash2, X, Loader2, Save, Calendar as CalendarIcon, Clock, Lock, MapPin, AlignLeft } from 'lucide-react';
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
        borderRadius: '8px',
        border: 'none',
        padding: '2px 8px',
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        boxShadow: isOpp ? '0 0 10px rgba(251, 191, 36, 0.2)' : 'none'
      }
    };
  };

  return (
    <div className="p-8 h-screen flex flex-col bg-background space-y-8 text-white overflow-hidden">
      <style>{`
        .rbc-calendar { background: transparent; color: white !important; font-family: inherit; }
        .rbc-header { padding: 15px !important; font-weight: 900 !important; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em; color: var(--text-muted); border-bottom: 1px solid rgba(255,255,255,0.05) !important; }
        .rbc-month-view { border: 1px solid rgba(255,255,255,0.05) !important; border-radius: 1.5rem; background: rgba(255,255,255,0.01); }
        .rbc-day-bg { border-left: 1px solid rgba(255,255,255,0.05) !important; }
        .rbc-month-row { border-top: 1px solid rgba(255,255,255,0.05) !important; }
        .rbc-today { background: rgba(251, 191, 36, 0.05) !important; }
        .rbc-off-range-bg { background: rgba(0,0,0,0.2) !important; }
        .rbc-toolbar button { color: white !important; border: 1px solid rgba(255,255,255,0.1) !important; background: rgba(255,255,255,0.03) !important; font-weight: bold; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; padding: 8px 16px !important; border-radius: 8px !important; margin: 0 2px; transition: all 0.2s; }
        .rbc-toolbar button:hover { background: rgba(251, 191, 36, 0.1) !important; border-color: rgba(251, 191, 36, 0.3) !important; color: #fbbf24 !important; }
        .rbc-toolbar button.rbc-active { background: #fbbf24 !important; color: #0a0a0b !important; border-color: #fbbf24 !important; }
        .rbc-event { transition: transform 0.2s; }
        .rbc-event:hover { transform: scale(1.02); }
        .calendar-event-gold { background: #fbbf24 !important; color: #0a0a0b !important; }
        .calendar-event-blue { background: #3b82f6 !important; color: white !important; }
        .rbc-show-more { color: #fbbf24 !important; font-weight: bold; font-size: 10px; }
      `}</style>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Cronograma <span className="text-gradient-gold">Estratégico</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <Lock size={12} className="text-primary" />
            Agenda unificada de CRM, prazos fatais e sessões públicas.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 mr-4 bg-white/5 px-6 py-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Business</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Editais</span>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            aria-label="Agendar novo compromisso"
            className="flex items-center gap-3 px-6 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow uppercase text-xs tracking-widest"
          >
            <Plus className="w-4 h-4" />
            Novo Evento
          </button>
        </div>
      </header>

      <div className="platinum-card p-8 flex-1 min-h-[500px] flex flex-col overflow-hidden">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 opacity-40">
            <Loader2 className="animate-spin text-primary w-10 h-10" />
            <p className="font-black uppercase tracking-[0.2em] text-[10px]">Sincronizando Agenda...</p>
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
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Título do Compromisso *</label>
            <div className="relative">
              <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 w-4 h-4" />
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white"
                placeholder="Ex: Reunião de Alinhamento / Prazo Limite Edital X"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Início do Evento *</label>
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Conclusão Estimada</label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Classificação</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as 'event' | 'opportunity' })}
                className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white appearance-none"
              >
                <option value="event" className="bg-surface">Evento / Reunião (Business)</option>
                <option value="opportunity" className="bg-surface">Prazo / Edital (Strategic)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Localidade / Link</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white"
                  placeholder="Presencial ou Meet/Teams..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Briefing do Evento</label>
            <div className="relative">
              <AlignLeft className="absolute left-4 top-4 text-text-muted w-4 h-4" />
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-background border border-white/10 rounded-xl text-sm focus:border-primary/40 outline-none text-white resize-none"
                rows={3}
                placeholder="Detalhes adicionais e objetivos da agenda..."
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            {isEditing && (
              <button
                type="button"
                onClick={() => handleDelete(editingId!)}
                className="px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 font-bold rounded-xl hover:bg-red-500/20 transition-all text-[10px] uppercase tracking-widest"
              >
                <Trash2 className="w-4 h-4 inline mr-2" />
                Remover
              </button>
            )}
            <div className="flex gap-4 ml-auto">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3 text-text-muted font-bold hover:text-white transition-all text-xs uppercase tracking-widest"
              >
                Descartar
              </button>
              <button
                type="submit"
                className="px-10 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow text-xs uppercase tracking-widest"
              >
                {isEditing ? 'Salvar Alterações' : 'Confirmar Agenda'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}