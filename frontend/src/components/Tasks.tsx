import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Calendar, CheckCircle2, Search, X, Trash2,
  Loader2, Edit2, AlertCircle, User
} from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

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

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'Alta', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  { value: 'medium', label: 'Média', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { value: 'low', label: 'Baixa', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
];

const STATUS_FILTERS = [
  { value: '', label: 'Todas' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'completed', label: 'Concluídas' },
];

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
    priority: 'medium',
    assignee: '',
  });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.append('status', filter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await api.get(`/api/tasks?${params}`);
      setTasks(res.data.data || res.data);
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
        due_date: task.due_date || '',
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
    setLoading(true);

    try {
      if (editingTask) {
        await api.put(`/api/tasks/${editingTask.id}`, formData);
        toast.success('Tarefa atualizada!');
      } else {
        await api.post('/api/tasks', formData);
        toast.success('Tarefa criada!');
      }

      setShowModal(false);
      fetchTasks();
      fetchStats();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    try {
      await api.patch(`/api/tasks/${task.id}/toggle`);
      toast.success(task.status === 'pending' ? 'Tarefa concluída!' : 'Tarefa reopened!');
      fetchTasks();
      fetchStats();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao alterar status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir tarefa?')) return;

    try {
      await api.delete(`/api/tasks/${id}`);
      toast.success('Tarefa excluída!');
      fetchTasks();
      fetchStats();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao excluir');
    }
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_OPTIONS.find(p => p.value === priority)?.color || 'bg-gray-100 text-gray-700';
  };

  const getPriorityLabel = (priority: string) => {
    return PRIORITY_OPTIONS.find(p => p.value === priority)?.label || priority;
  };

  const filteredTasks = tasks.filter(t => {
    const matchesFilter = !filter || t.status === filter;
    const matchesSearch = !searchTerm || 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Tarefas</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Organize suas atividades</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> Nova Tarefa
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-2">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                  filter === f.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-500">
                <Loader2 className="animate-spin inline w-6 h-6" />
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                <p>Nenhuma tarefa encontrada</p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <div
                  key={task.id}
                  className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition flex items-start gap-3 ${
                    task.status === 'completed' ? 'opacity-60' : ''
                  }`}
                >
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className={`mt-1 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition ${
                      task.status === 'completed'
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-slate-400 dark:border-slate-500 text-transparent hover:border-indigo-500'
                    }`}
                  >
                    <CheckCircle2 size={14} className={task.status === 'completed' ? 'opacity-100' : 'opacity-0'} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium text-slate-800 dark:text-slate-100 ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                        {task.title}
                      </h3>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.due_date).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                      {task.assignee && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {task.assignee}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => handleOpenModal(task)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(task.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  placeholder="Título da tarefa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  rows={3}
                  placeholder="Detalhes da tarefa..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prazo</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prioridade</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    {PRIORITY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Responsável</label>
                <input
                  type="text"
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  placeholder="Nome do responsável"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : editingTask ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}