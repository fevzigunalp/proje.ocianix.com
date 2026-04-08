import { useState } from 'react';
import { Plus, Search, Check, Trash2, Zap, ListTodo, LayoutGrid } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { TASK_STATUS_LABELS, PRIORITY_LABELS, ENERGY_LABELS, getTodayTasks, getOverdueTasks } from '../store';

const viewModes = [
  { id: 'today', label: 'Bugün', icon: Zap },
  { id: 'all', label: 'Tümü', icon: ListTodo },
  { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
];

const statusColors = {
  todo: 'bg-primary/10 text-text-muted', in_progress: 'bg-accent/10 text-accent', waiting: 'bg-warm/10 text-warm',
  review: 'bg-purple/10 text-purple', completed: 'bg-success/10 text-success', cancelled: 'bg-warm-light/20 text-text-muted line-through',
};

const priorityDots = { critical: 'bg-danger', high: 'bg-orange', medium: 'bg-primary', low: 'bg-warm-light' };

export default function TaskList({ data, update, remove, navigate, onQuickAdd }) {
  const [mode, setMode] = useState('today');
  const [search, setSearch] = useState('');
  const [newTask, setNewTask] = useState('');
  const today = new Date().toISOString().slice(0, 10);

  const allTasks = data.tasks.filter((t) => {
    if (search) return t.title.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const todayTasks = getTodayTasks(data);
  const overdueTasks = getOverdueTasks(data);

  const toggleTask = (task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    update('tasks', { ...task, status: newStatus, completedAt: newStatus === 'completed' ? today : null, updatedAt: today });
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    update('tasks', {
      id: uuidv4(), projectId: null, phaseId: null, learningItemId: null, parentTaskId: null,
      title: newTask.trim(), description: '', status: 'todo', priority: 'medium', energyLevel: 'medium',
      estimatedMinutes: null, actualMinutes: null, dueDate: mode === 'today' ? today : null,
      startDate: null, completedAt: null, isToday: mode === 'today', isNextStep: false, isRecurring: false,
      blockedReason: '', resultNote: '', tags: [], createdAt: today, updatedAt: today,
    });
    setNewTask('');
  };

  const getProject = (id) => data.projects.find((p) => p.id === id);

  const renderTask = (task) => {
    const project = getProject(task.projectId);
    return (
      <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border border-border-light dark:border-border-dark ${task.status === 'completed' ? 'bg-success/5' : 'bg-surface dark:bg-surface-dark-alt'} transition-all`}>
        <button onClick={() => toggleTask(task)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${task.status === 'completed' ? 'bg-success border-success text-white' : 'border-border-light dark:border-border-dark hover:border-primary'}`}>
          {task.status === 'completed' && <Check size={12} />}
        </button>
        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDots[task.priority]}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${task.status === 'completed' ? 'line-through text-text-muted' : ''}`}>{task.title}</p>
          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-text-muted flex-wrap">
            {project && <span className="text-primary">{project.title}</span>}
            {task.dueDate && <span className={task.dueDate < today && task.status !== 'completed' ? 'text-danger font-medium' : ''}>{task.dueDate}</span>}
            {task.energyLevel !== 'medium' && <span>{ENERGY_LABELS[task.energyLevel]}</span>}
            {task.estimatedMinutes && <span>{task.estimatedMinutes}dk</span>}
          </div>
        </div>
        <button onClick={() => remove('tasks', task.id)} className="p-1 text-text-muted hover:text-danger shrink-0"><Trash2 size={13} /></button>
      </div>
    );
  };

  const kanbanStatuses = ['todo', 'in_progress', 'waiting', 'review', 'completed'];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Görevler</h1>
        <button onClick={onQuickAdd} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium">
          <Plus size={16} /> Yeni Görev
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-1">
          {viewModes.map((v) => {
            const Icon = v.icon;
            return (
              <button key={v.id} onClick={() => setMode(v.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === v.id ? 'bg-primary text-white' : 'text-text-muted hover:text-text-dark dark:hover:text-white'}`}>
                <Icon size={13} /> {v.label}
              </button>
            );
          })}
        </div>
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Görev ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>

      <div className="flex gap-2">
        <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} placeholder={mode === 'today' ? "Bugüne görev ekle..." : "Yeni görev..."} className="flex-1 px-4 py-2.5 bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <button onClick={addTask} className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm"><Plus size={16} /></button>
      </div>

      {mode === 'today' && (
        <div className="space-y-4">
          {overdueTasks.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-danger mb-2 uppercase tracking-wide">Geciken ({overdueTasks.length})</h3>
              <div className="space-y-2">{overdueTasks.map(renderTask)}</div>
            </div>
          )}
          <div>
            <h3 className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">Bugün ({todayTasks.length})</h3>
            <div className="space-y-2">{todayTasks.map(renderTask)}</div>
            {todayTasks.length === 0 && <p className="text-sm text-text-muted text-center py-6">Bugün için görev yok</p>}
          </div>
        </div>
      )}

      {mode === 'all' && (
        <div className="space-y-2">
          {allTasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled').map(renderTask)}
          {allTasks.filter((t) => t.status === 'completed').length > 0 && (
            <details className="mt-4">
              <summary className="text-xs text-text-muted cursor-pointer hover:text-text-dark">Tamamlanan ({allTasks.filter((t) => t.status === 'completed').length})</summary>
              <div className="space-y-2 mt-2">{allTasks.filter((t) => t.status === 'completed').map(renderTask)}</div>
            </details>
          )}
        </div>
      )}

      {mode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanbanStatuses.map((status) => {
            const items = allTasks.filter((t) => t.status === status);
            return (
              <div key={status} className="min-w-[240px] flex-shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 text-xs rounded-lg font-medium ${statusColors[status]}`}>{TASK_STATUS_LABELS[status]}</span>
                  <span className="text-xs text-text-muted">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((task) => {
                    const project = getProject(task.projectId);
                    return (
                      <div key={task.id} className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${priorityDots[task.priority]}`} />
                          <p className="text-sm font-medium truncate">{task.title}</p>
                        </div>
                        {project && <p className="text-[10px] text-primary">{project.title}</p>}
                        {task.dueDate && <p className="text-[10px] text-text-muted mt-1">{task.dueDate}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
