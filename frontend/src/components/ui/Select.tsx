import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

interface Option {
 value: string;
 label: string;
 icon?: React.ReactNode;
}

interface SelectProps {
 value?: string;
 onChange: (value: string) => void;
 options: Option[];
 placeholder?: string;
 searchable?: boolean;
 disabled?: boolean;
 className?: string;
}

export function Select({
 value,
 onChange,
 options,
 placeholder = 'Selecione...',
 searchable = false,
 disabled = false,
 className = ''
}: SelectProps) {
 const [isOpen, setIsOpen] = useState(false);
 const [search, setSearch] = useState('');
 const ref = useRef<HTMLDivElement>(null);

 const selectedOption = options.find(opt => opt.value === value);
 const filteredOptions = searchable 
 ? options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase()))
 : options;

 useEffect(() => {
 const handleClickOutside = (e: MouseEvent) => {
 if (ref.current && !ref.current.contains(e.target as Node)) {
 setIsOpen(false);
 setSearch('');
 }
 };
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 return (
 <div ref={ref} className={`relative ${className}`}>
 <button
 type="button"
 onClick={() => !disabled && setIsOpen(!isOpen)}
 disabled={disabled}
 className={`
 w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl
 bg-bg-tertiary/50 border border-border
 text-left transition-all duration-150 text-xs font-semibold uppercase tracking-wider shadow-sm
 ${isOpen 
 ? 'border-primary/40 ring-2 ring-primary/10' 
 : 'hover:border-primary/40'
 }
 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
 `}
 >
 <span className={selectedOption ? 'text-text-primary' : 'text-text-muted'}>
 {selectedOption ? (
 <span className="flex items-center gap-2">
 {selectedOption.icon}
 {selectedOption.label}
 </span>
 ) : placeholder}
 </span>
 <ChevronDown 
 size={16} 
 className={`text-text-muted transition-transform ${isOpen ? 'rotate-180 text-primary' : ''}`}
 />
 </button>

 {isOpen && (
 <div className="absolute z-50 w-full mt-2 py-2 bg-bg-secondary border border-border rounded-xl max-h-60 overflow-hidden">
 {searchable && (
 <div className="p-2 border-b border-slate-100 dark:border-slate-700">
 <div className="relative">
 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Buscar..."
 className="w-full pl-9 pr-3 py-2 text-xs font-semibold uppercase tracking-widest bg-bg-primary border border-border rounded-lg focus:outline-none focus:border-primary/40 text-text-primary placeholder:text-text-muted/50"
 />
 </div>
 </div>
 )}
 <div className="overflow-y-auto max-h-48">
 {filteredOptions.length === 0 ? (
 <div className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-text-muted text-center">
 Nenhuma opção encontrada
 </div>
 ) : (
 filteredOptions.map((option) => (
 <button
 key={option.value}
 type="button"
 onClick={() => {
 onChange(option.value);
 setIsOpen(false);
 setSearch('');
 }}
 className={`
 w-full flex items-center justify-between gap-2 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider
 transition-colors
 ${value === option.value 
 ? 'bg-primary/10 text-primary' 
 : 'text-text-primary hover:bg-bg-tertiary hover:text-primary'
 }
 `}
 >
 <span className="flex items-center gap-2">
 {option.icon}
 {option.label}
 </span>
 {value === option.value && <Check size={14} />}
 </button>
 ))
 )}
 </div>
 </div>
 )}
 </div>
 );
}

// Checkbox Component
interface CheckboxProps {
 checked: boolean;
 onChange: (checked: boolean) => void;
 label?: string;
 disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, disabled = false }: CheckboxProps) {
 return (
 <label className={`flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
 <div className="relative">
 <input
 type="checkbox"
 checked={checked}
 onChange={(e) => onChange(e.target.checked)}
 disabled={disabled}
 className="sr-only"
 />
 <div 
 className={`
 w-5 h-5 rounded-md border-2 transition-all duration-150
 flex items-center justify-center
 ${checked 
 ? 'bg-blue-500 border-blue-500' 
 : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
 }
 ${disabled ? '' : 'cursor-pointer'}
 `}
 >
 {checked && (
 <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
 </svg>
 )}
 </div>
 </div>
 {label && (
 <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
 )}
 </label>
 );
}

// Switch Component
interface SwitchProps {
 checked: boolean;
 onChange: (checked: boolean) => void;
 label?: string;
 disabled?: boolean;
}

export function Switch({ checked, onChange, label, disabled = false }: SwitchProps) {
 return (
 <label className={`flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
 <div className="relative">
 <input
 type="checkbox"
 checked={checked}
 onChange={(e) => onChange(e.target.checked)}
 disabled={disabled}
 className="sr-only"
 />
 <div 
 className={`
 w-11 h-6 rounded-full transition-all duration-200
 ${checked ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}
 `}
 >
 <div 
 className={`
 absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm
 transition-transform duration-200
 ${checked ? 'translate-x-5' : 'translate-x-0.5'}
 `}
 />
 </div>
 </div>
 {label && (
 <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
 )}
 </label>
 );
}