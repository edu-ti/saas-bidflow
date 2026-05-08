import React from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale/pt-BR';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';

registerLocale('pt-BR', ptBR);

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showTimeSelect?: boolean;
  dateFormat?: string;
}

export function DatePicker({
  selected,
  onChange,
  placeholderText = "Selecione uma data",
  className = "",
  disabled = false,
  minDate,
  maxDate,
  showTimeSelect = false,
  dateFormat = showTimeSelect ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy"
}: DatePickerProps) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Calendar size={16} className="text-text-muted" />
      </div>
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        locale="pt-BR"
        placeholderText={placeholderText}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        showTimeSelect={showTimeSelect}
        timeFormat="HH:mm"
        timeIntervals={15}
        timeCaption="Hora"
        dateFormat={dateFormat}
        className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-surface-elevated/50 border border-border-subtle text-text-primary text-[10px] font-black uppercase tracking-widest placeholder:text-text-muted/50 focus:outline-none focus:border-primary/40 hover:border-primary/40 transition-all shadow-sm ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
        wrapperClassName="w-full"
        portalId="root"
      />
    </div>
  );
}
