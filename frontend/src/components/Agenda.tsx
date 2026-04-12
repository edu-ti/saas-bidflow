import { useState, useEffect } from 'react';
import type { Event as BigCalendarEvent } from 'react-big-calendar';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { setDefaultOptions } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../lib/axios';

import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configure date-fns localizer for ptBR
setDefaultOptions({ locale: ptBR });
const locales = {
  'pt-BR': ptBR,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface APIEvent {
  id: number | string;
  title: string;
  start_date: string;
  end_date: string;
  type: 'event' | 'opportunity';
}

export default function Agenda() {
  const [events, setEvents] = useState<BigCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/events')
      .then(res => {
        const data: APIEvent[] = res.data.data;
        const formattedEvents = data.map(ev => ({
          id: ev.id,
          title: ev.title,
          start: new Date(ev.start_date),
          end: ev.end_date ? new Date(ev.end_date) : new Date(ev.start_date),
          resource: ev.type,
        }));
        setEvents(formattedEvents);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const eventStyleGetter = (event: BigCalendarEvent) => {
    let backgroundColor = '#3b82f6'; // default blue for manual events
    
    if (event.resource === 'opportunity') {
      backgroundColor = '#f97316'; // orange for opportunities
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agenda Integrada</h1>
          <p className="text-sm text-slate-500">Eventos de CRM e Prazos de Licitações</p>
        </div>
        <div className="flex gap-4">
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
              next: "Próximo",
              previous: "Anterior",
              today: "Hoje",
              month: "Mês",
              week: "Semana",
              day: "Dia"
            }}
            className="flex-1 text-slate-700 bg-white"
          />
        )}
      </div>
    </div>
  );
}
