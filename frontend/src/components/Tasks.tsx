import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Calendar, CheckCircle2, Search, X, Trash2,
  Loader2, Edit2, AlertCircle, User, ShieldCheck, Zap, BarChart3, Target, Clock, Filter
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
    <div className="p-8 w-full min-h-screen bg-background space-y-8 text-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Task <span className="text-gradient-gold">Orchestration</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <ShieldCheck size={12} className="text-primary" />
            Gestão operacional e acompanhamento de metas críticas.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-3 px-8 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow uppercase text-[10px] tracking-[0.2em]"
        >
          <Plus className="w-4 h-4" />
          Nova Tarefa
        </button>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total de Pendências', val: stats.pending, icon: Clock, color: 'text-amber-400' },
          { label: 'Concluídas / Mês', val: stats.completed, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Prazos Fatais', val: stats.overdue, icon: AlertCircle, color: 'text-red-400' },
          { label: 'Target Hoje', val: stats.due_today, icon: Target, color: 'text-primary' },
        ].map((stat, i) => (
          <div key={i} className="platinum-card p-6 flex items-center gap-5 group hover:border-primary/20 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{stat.label}</p>
              <p className="text-xl font-black text-white mt-0.5">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="platinum-card p-4 flex flex-wrap items-center justify-between gap-6">
        <div className="flex gap-2 p-1 bg-white/[0.02] border border-white/5 rounded-2xl">
          {[
            { v: '', l: 'Todos' },
            { v: 'pending', l: 'Pendentes' },
            { v: 'completed', l: 'Concluídas' }
          ].map(f => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f.v ? 'bg-primary text-background shadow-platinum-glow' : 'text-text-muted hover:text-white'
              }`}
            >
              {f.l}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Filtrar por diretriz ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-background border border-white/5 rounded-xl text-sm focus:border-primary/30 outline-none transition-all text-white placeholder:text-text-muted"
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center opacity-40">
            <Loader2 className="animate-spin inline mr-3" /> 
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sincronizando Tarefas...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-20 text-center platinum-card border-dashed">
            <Target size={40} className="mx-auto text-primary/40 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Nenhuma tarefa no radar</p>
          </div>
        ) : (
          tasks.map(task => (
            <div
              key={task.id}
              className={`platinum-card p-6 flex items-center gap-6 group hover:border-primary/20 transition-all ${task.status === 'completed' ? 'opacity-50' : ''}`}
            >
              <button
                onClick={() => handleToggleStatus(task)}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                  task.status === 'completed' 
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                    : 'border-white/10 text-transparent hover:border-primary/50 hover:text-primary/50'
                }`}
              >
                <CheckCircle2 size={20} />
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 mb-1">
                  <h3 className={`font-bold text-white text-base tracking-tight ${task.status === 'completed' ? 'line-through text-text-muted' : ''}`}>
                    {task.title}
                  </h3>
                  <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded border ${
                    task.priority === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                    task.priority === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                    'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  }`}>
                    {task.priority === 'high' ? 'Alta Prioridade' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                </div>
                {task.description && <p className="text-sm text-text-muted line-clamp-1">{task.description}</p>}
                
                <div className="flex items-center gap-6 mt-3">
                  {task.due_date && (
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                      <Calendar size={12} className="text-primary/60" />
                      {new Date(task.due_date).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                  {task.assignee && (
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                      <User size={12} className="text-primary/60" />
                      {task.assignee}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(task)} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 text-text-muted hover:text-white transition-all">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(task.id)} className="p-3 bg-red-500/5 rounded-xl hover:bg-red-500/10 text-red-400/60 hover:text-red-400 transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingTask ? 'REFINAR DIRETRIZ' : 'NOVA TAREFA ESTRATÉGICA'} size="md">
        <form onSubmit={handleSave} className="space-y-6 p-2">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Título da Tarefa *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none"
              placeholder="Ex: Revisar documentação do Pregão 45/2024"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Descrição / Briefing</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none resize-none"
              rows={3}
              placeholder="Detalhes operacionais..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Prazo Fatal</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Prioridade</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none appearance-none"
              >
                <option value="high" className="bg-surface">ALTA (Crítica)</option>
                <option value="medium" className="bg-surface">Média (Padrão)</option>
                <option value="low" className="bg-surface">Baixa (Suporte)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Responsável / Assignee</label>
            <input
              type="text"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none"
              placeholder="Nome do colaborador..."
            />
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-8 py-3 text-text-muted font-bold hover:text-white transition-all text-xs uppercase tracking-widest"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-10 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow text-[10px] uppercase tracking-widest"
            >
              {editingTask ? 'Salvar Alterações' : 'Consolidar Tarefa'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}