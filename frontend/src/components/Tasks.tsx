import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Calendar, CheckCircle2, Search, X, Trash2,
  Loader2, Edit2, AlertCircle, User, ShieldCheck, Zap, BarChart3, Target, Clock, Filter, ChevronRight
} from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import Modal from './ui/Modal';

interface Task {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
  assignee?: string;
  created_at: string;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, overdue: 0, due_today: 0 });

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    assignee: '',
  });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.append('status', filter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await api.get(`/api/tasks?${params}`);
      setTasks(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter, searchTerm]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/tasks/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [fetchTasks]);

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        priority: task.priority,
        assignee: task.assignee || '',
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        assignee: '',
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/api/tasks/${editingTask.id}`, formData);
        toast.success('Tarefa sincronizada com sucesso.');
      } else {
        await api.post('/api/tasks', formData);
        toast.success('Nova diretriz estratégica criada.');
      }
      setShowModal(false);
      fetchTasks();
      fetchStats();
    } catch (err: any) {
      toast.error('Falha na persistência da tarefa.');
    }
  };

  const handleToggleStatus = async (task: Task) => {
    try {
      await api.patch(`/api/tasks/${task.id}/toggle`);
      toast.success(task.status === 'pending' ? 'Missão concluída.' : 'Tarefa reativada.');
      fetchTasks();
      fetchStats();
    } catch (err) {
      toast.error('Erro ao alternar status.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar esta tarefa do pipeline estratégico?')) return;
    try {
      await api.delete(`/api/tasks/${id}`);
      toast.success('Registro removido.');
      fetchTasks();
      fetchStats();
    } catch (err) {
      toast.error('Erro ao excluir registro.');
    }
  };

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Task <span className="text-gradient-gold">Orchestration</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <ShieldCheck size={14} className="text-primary" />
            Gestão operacional e acompanhamento de metas críticas Platinum.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary py-4 px-10 shadow-platinum-glow flex items-center gap-3 uppercase text-[10px] tracking-widest"
        >
          <Plus className="w-5 h-5" />
          Nova Missão Platinum
        </button>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total de Pendências', val: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Concluídas / Mês', val: stats.completed, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Prazos Fatais', val: stats.overdue, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Target Hoje', val: stats.due_today, icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
        ].map((stat, i) => (
          <div key={i} className="platinum-card p-8 flex items-center justify-between group bg-surface-elevated/10 border-border-subtle/30 overflow-hidden relative">
            <div className="space-y-2 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted opacity-60">{stat.label}</p>
              <p className="text-2xl font-black text-text-primary tracking-tighter group-hover:text-primary transition-colors duration-500">{stat.val}</p>
            </div>
            <div className={`p-5 rounded-2xl ${stat.bg} border border-border-subtle ${stat.color} group-hover:scale-110 transition-transform duration-500 shadow-platinum-glow-sm relative z-10`}>
              <stat.icon size={28} />
            </div>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.bg} blur-[60px] opacity-10 group-hover:opacity-30 transition-opacity`} />
          </div>
        ))}
      </div>

      <div className="platinum-card p-8 flex flex-col lg:flex-row items-center justify-between gap-8 bg-surface-elevated/10 backdrop-blur-xl shrink-0">
        <div className="flex gap-4 p-2 bg-surface-elevated/20 border border-border-subtle rounded-[2.5rem] w-fit shadow-platinum-glow-sm">
          {[
            { v: '', l: 'Dossiê Geral' },
            { v: 'pending', l: 'Pendências' },
            { v: 'completed', l: 'Concluídas' }
          ].map(f => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={`px-8 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                filter === f.v ? 'bg-primary text-background shadow-platinum-glow' : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated/40'
              }`}
            >
              {f.l}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-[300px] relative group w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors w-5 h-5" />
          <input
            type="text"
            placeholder="Filtrar por diretriz ou descrição estratégica..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-background/50 border border-border-subtle rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum"
          />
        </div>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto scrollbar-platinum pr-2">
        {loading ? (
          <div className="py-32 text-center opacity-40 space-y-6">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" /> 
            <p className="text-[10px] font-black uppercase tracking-[0.5em]">Sincronizando Pipeline Global...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-32 text-center platinum-card border-dashed bg-surface-elevated/5">
            <Target size={56} className="mx-auto text-primary/20 mb-6" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Nenhuma diretriz localizada no radar estratégico</p>
          </div>
        ) : (
          tasks.map(task => (
            <div
              key={task.id}
              className={`platinum-card p-8 flex items-center gap-8 group hover:border-primary/30 transition-all duration-500 bg-surface-elevated/10 ${task.status === 'completed' ? 'opacity-40 grayscale' : ''}`}
            >
              <button
                onClick={() => handleToggleStatus(task)}
                className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 shadow-platinum-glow-sm ${
                  task.status === 'completed' 
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500' 
                    : 'bg-surface-elevated border-border-subtle text-transparent hover:border-primary/50 hover:text-primary/50'
                }`}
              >
                <CheckCircle2 size={24} />
              </button>

              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-center gap-5">
                  <h3 className={`font-black text-text-primary text-lg tracking-tight uppercase transition-all duration-500 ${task.status === 'completed' ? 'line-through text-text-muted' : 'group-hover:text-primary'}`}>
                    {task.title}
                  </h3>
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-platinum-glow-sm ${
                    task.priority === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                    task.priority === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                    'bg-blue-500/10 border-blue-500/20 text-blue-500'
                  }`}>
                    {task.priority === 'high' ? 'CRÍTICA' : task.priority === 'medium' ? 'MÉDIA' : 'BAIXA'}
                  </span>
                </div>
                {task.description && <p className="text-sm text-text-secondary line-clamp-1 font-medium italic opacity-70">"{task.description}"</p>}
                
                <div className="flex flex-wrap items-center gap-8 pt-2">
                  {task.due_date && (
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-text-muted">
                      <Calendar size={14} className="text-primary/60" />
                      {new Date(task.due_date).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                  {task.assignee && (
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-text-muted">
                      <User size={14} className="text-primary/60" />
                      {task.assignee}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-text-muted opacity-40">
                    <Clock size={14} />
                    {new Date(task.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                <button onClick={() => handleOpenModal(task)} className="p-4 bg-surface-elevated/40 border border-border-subtle rounded-2xl text-text-muted hover:text-primary hover:scale-110 transition-all shadow-platinum-glow-sm">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(task.id)} className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-red-500/60 hover:text-red-500 hover:scale-110 transition-all shadow-platinum-glow-sm">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingTask ? 'REFINAR DIRETRIZ PLATINUM' : 'NOVA MISSÃO ESTRATÉGICA'} size="md">
        <form onSubmit={handleSave} className="space-y-10 p-2">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Título da Missão *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-6 py-4 bg-background border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum"
              placeholder="Ex: Revisar documentação do Pregão 45/2024"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Resumo Executivo / Briefing</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-6 py-4 bg-background border border-border-medium rounded-2xl text-sm font-medium text-text-primary focus:border-primary/40 outline-none resize-none transition-all shadow-inner-platinum"
              rows={3}
              placeholder="Detalhes operacionais e objetivos estratégicos..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Prazo Fatal (Deadline)</label>
              <div className="relative">
                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full pl-16 pr-6 py-4 bg-background border border-border-medium rounded-2xl text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all appearance-none cursor-pointer shadow-inner-platinum"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Nível de Prioridade</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-6 py-4 bg-background border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all appearance-none cursor-pointer shadow-inner-platinum"
              >
                <option value="high" className="bg-surface font-bold text-text-primary">MÁXIMA (Crítica)</option>
                <option value="medium" className="bg-surface font-bold text-text-primary">MÉDIA (Padrão)</option>
                <option value="low" className="bg-surface font-bold text-text-primary">BAIXA (Suporte)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Agente Responsável / Assignee</label>
            <div className="relative">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
              <input
                type="text"
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                className="w-full pl-16 pr-6 py-4 bg-background border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum"
                placeholder="Nome do colaborador ou departamento..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-6 pt-10 border-t border-border-subtle/30">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-8 py-4 text-text-muted font-black hover:text-text-primary transition-all text-[10px] uppercase tracking-[0.3em]"
            >
              Descartar
            </button>
            <button
              type="submit"
              className="btn-primary py-4 px-12 shadow-platinum-glow flex items-center gap-3 uppercase text-[10px] tracking-widest"
            >
              <Zap size={20} />
              {editingTask ? 'Salvar Alterações' : 'Consolidar Missão'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}