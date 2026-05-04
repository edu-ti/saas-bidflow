import { useState, useEffect } from 'react';
import { Target, Users, Truck, Calendar, DollarSign, Award, MapPin, X, Loader2, Save, ShieldCheck } from 'lucide-react';
import Modal from './ui/Modal';
import api from '../lib/axios';
import toast from 'react-hot-toast';

interface GoalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GoalType = 'global' | 'user' | 'supplier';

export default function GoalSettingsModal({ isOpen, onClose }: GoalSettingsModalProps) {
  const [goalType, setGoalType] = useState<GoalType>('global');
  const [targetId, setTargetId] = useState<number | null>(null);
  const [uf, setUf] = useState<string>('');
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [targetRevenue, setTargetRevenue] = useState<number>(0);
  const [targetWins, setTargetWins] = useState<number>(0);

  const [users, setUsers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get('/api/reports/users').then(res => setUsers(res.data));
      api.get('/api/reports/available-suppliers').then(res => setSuppliers(res.data));
    }
  }, [isOpen]);

  const months = [
    { id: 1, name: 'Janeiro' }, { id: 2, name: 'Fevereiro' }, { id: 3, name: 'Março' },
    { id: 4, name: 'Abril' }, { id: 5, name: 'Maio' }, { id: 6, name: 'Junho' },
    { id: 7, name: 'Julho' }, { id: 8, name: 'Agosto' }, { id: 9, name: 'Setembro' },
    { id: 10, name: 'Outubro' }, { id: 11, name: 'Novembro' }, { id: 12, name: 'Dezembro' }
  ];

  const years = [2024, 2025, 2026];
  const ufs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.post('/api/goals', {
        goal_type: goalType,
        target_id: targetId,
        uf,
        month,
        year,
        target_revenue: targetRevenue,
        target_wins: targetWins
      });
      toast.success('Meta Platinum configurada com sucesso!');
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar meta');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="CONFIGURAÇÃO DE METAS ESTRATÉGICAS"
      size="lg"
    >
      <div className="space-y-10 p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Goal Type Selection */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-2 flex items-center gap-2">
               <Target size={12} className="text-primary" />
               Tipo de Alvo da Meta
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'global', label: 'Empresa', icon: Target },
                { id: 'user', label: 'Vendedor', icon: Users },
                { id: 'supplier', label: 'Fornecedor', icon: Truck }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => {
                    setGoalType(type.id as GoalType);
                    setTargetId(null);
                    setUf('');
                  }}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all duration-500 ${
                    goalType === type.id 
                      ? 'bg-primary/10 border-primary shadow-platinum-glow text-primary' 
                      : 'bg-surface-elevated/40 border-border-subtle text-text-muted hover:border-primary/30'
                  }`}
                >
                  <type.icon size={20} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target ID & UF (Conditional) */}
          <div className="space-y-4">
            {goalType === 'user' && (
              <div className="space-y-2 group animate-in slide-in-from-right-4">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-2">Selecionar Vendedor</label>
                <div className="relative">
                  <select 
                    value={targetId || ''} 
                    onChange={e => setTargetId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full bg-background/50 border border-border-medium rounded-2xl px-6 py-4 text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum appearance-none"
                  >
                    <option value="" className="bg-surface">Escolha o Colaborador</option>
                    {users.map(u => <option key={u.id} value={u.id} className="bg-surface">{u.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            {goalType === 'supplier' && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-2">Selecionar Fornecedor</label>
                  <select 
                    value={targetId || ''} 
                    onChange={e => setTargetId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full bg-background/50 border border-border-medium rounded-2xl px-6 py-4 text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum appearance-none"
                  >
                    <option value="" className="bg-surface">Escolha o Fornecedor</option>
                    {suppliers.map(s => <option key={s.id} value={s.id} className="bg-surface">{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                     <MapPin size={12} className="text-primary" />
                     Estado (UF) Específico
                  </label>
                  <select 
                    value={uf} 
                    onChange={e => setUf(e.target.value)}
                    className="w-full bg-background/50 border border-border-medium rounded-2xl px-6 py-4 text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum appearance-none"
                  >
                    <option value="" className="bg-surface">Opcional: Todos os Estados</option>
                    {ufs.map(u => <option key={u} value={u} className="bg-surface">{u}</option>)}
                  </select>
                </div>
              </div>
            )}

            {goalType === 'global' && (
              <div className="p-8 bg-primary/5 border border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center text-center gap-4">
                 <ShieldCheck className="text-primary opacity-40" size={32} />
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-relaxed">Meta Global: Aplicada a toda a estrutura da empresa sem filtros individuais.</p>
              </div>
            )}
          </div>
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-8 border-t border-border-subtle/30 pt-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-2 flex items-center gap-2">
               <Calendar size={12} className="text-primary" />
               Mês de Vigência
            </label>
            <select 
              value={month} 
              onChange={e => setMonth(Number(e.target.value))}
              className="w-full bg-background/50 border border-border-medium rounded-2xl px-6 py-4 text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum appearance-none"
            >
              {months.map(m => <option key={m.id} value={m.id} className="bg-surface">{m.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-2">Ano</label>
            <select 
              value={year} 
              onChange={e => setYear(Number(e.target.value))}
              className="w-full bg-background/50 border border-border-medium rounded-2xl px-6 py-4 text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum appearance-none"
            >
              {years.map(y => <option key={y} value={y} className="bg-surface">{y}</option>)}
            </select>
          </div>
        </div>

        {/* Financial & Win Goals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-4">
          <div className="space-y-2 group">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-2 flex items-center gap-2">
               <DollarSign size={12} className="text-emerald-500" />
               Meta de Faturamento (R$)
            </label>
            <input 
              type="number" 
              value={targetRevenue}
              onChange={e => setTargetRevenue(Number(e.target.value))}
              placeholder="Ex: 500000"
              className="w-full bg-background/50 border border-border-medium rounded-2xl px-6 py-4 text-sm font-black text-text-primary focus:border-emerald-500/40 outline-none transition-all shadow-inner-platinum group-hover:border-emerald-500/20"
            />
          </div>
          <div className="space-y-2 group">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-2 flex items-center gap-2">
               <Award size={12} className="text-primary" />
               Meta de Vitórias (Qtd)
            </label>
            <input 
              type="number" 
              value={targetWins}
              onChange={e => setTargetWins(Number(e.target.value))}
              placeholder="Ex: 20"
              className="w-full bg-background/50 border border-border-medium rounded-2xl px-6 py-4 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum group-hover:border-primary/20"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-10 border-t border-border-subtle/30">
          <button 
            onClick={onClose}
            className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary py-4 px-12 text-[10px] tracking-widest shadow-platinum-glow flex items-center gap-3"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Salvar Configurações
          </button>
        </div>
      </div>
    </Modal>
  );
}
