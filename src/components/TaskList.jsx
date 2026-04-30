import { useState } from 'react';
import { Plus, Search, Check, Pencil, Trash2, Zap, ListTodo, LayoutGrid, Cloud, CloudOff } from 'lucide-react';
import { TASK_STATUS_LABELS, ENERGY_LABELS, getTodayTasks, getOverdueTasks } from '../store';
import { isLiveMode } from '../sheetSync';
import RelatedProjectBadge from './RelatedProjectBadge';

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

export default function TaskList({ data, navigate, onEdit, onDelete, onPush, onNew }) {
  const [mode, setMode] = useState('today');
  const [search, setSearch] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const live = isLiveMode();

  const allTasks = (data.tasks || []).filter((t) => {
    if (search) return (t.title || '').toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const todayTasks = getTodayTasks(data);
  const overdueTasks = getOverdueTasks(data);

  const toggleTask = async (task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    await onPush({
      ...task,
      status: newStatus,
      completedAt: newStatus === 'completed' ? today : null,
    });
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    await onPush({
      title: newTaskTitle.trim(),
      description: '',
      status: 'todo',
      priority: 'medium',
      energyLevel: 'medium',
      isToday: mode === 'today',
      isNextStep: false,
      dueDate: mode === 'today' ? today : null,
      tags: [],
    });
    setNewTaskTitle('');
  };

  const getProject = (id) => (data.projects || []).find((p) => p.id === id);

  const renderTask = (task) => {
    const projectId = task.relatedProjectId || task.projectId;
    return (
      <div key={task.id} className={`group flex items-center gap-3 p-3 rounded-xl border border-border-light dark:border-border-dark ${task.status === 'completed' ? 'bg-success/5' : 'bg-surface dark:bg-surface-dark-alt'} transition-all`}>
        <button onClick={() => toggleTask(task)} title={task.status === 'completed' ? 'Geri al' : 'Tamamla'} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${task.status === 'completed' ? 'bg-success border-success text-white' : 'border-border-light dark:border-border-dark hover:border-primary'}`}>
          {task.status === 'completed' && <Check size={12} />}
        </button>
        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDots[task.priority] || priorityDots.medium}`} />
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit && onEdit(task)}>
          <p className={`text-sm ${task.status === 'completed' ? 'line-through text-text-muted' : ''}`}>{task.title}</p>
          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-text-muted flex-wrap">
            {projectId && <RelatedProjectBadge projectId={projectId} projects={data.projects} navigate={navigate} size="xs" />}
            {task.dueDate && <span className={task.dueDate < today && task.status !== 'completed' ? 'text-danger font-medium' : ''}>{task.dueDate}</span>}
            {task.energyLevel && task.energyLevel !== 'medium' && <span>{ENERGY_LABELS[task.energyLevel]}</span>}
            {task.estimatedMinutes && <span>{task.estimatedMinutes}dk</span>}
            {task.blockedReason && <span className="text-warm">⚠ {task.blockedReason}</span>}
            {task.tags && task.tags.length > 0 && <span className="text-text-muted/60">{task.tags.map(t => t.startsWith('#') ? t : '#' + t).join(' ')}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button onClick={(e) => { e.stopPropagation(); onEdit(task); }} title="Düzenle" className="p-1 text-text-muted hover:text-primary">
              <Pencil size={13} />
            </button>
          )}
          {onDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(task); }} title="Sil" className="p-1 text-text-muted hover:text-danger">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    );
  };

  const kanbanStatuses = ['todo', 'in_progress', 'waiting', 'review', 'completed'];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Görevler
            {live ? (
              <span className="text-[10px] inline-flex items-center gap-1 px-2 py-0.5 bg-success/10 text-success rounded-md font-medium">
                <Cloud size={11} /> Sheet canlı
              </span>
            ) : (
              <span className="text-[10px] inline-flex items-center gap-1 px-2 py-0.5 bg-warm/10 text-warm rounded-md font-medium">
                <CloudOff size={11} /> Yerel
              </span>
            )}
          </h1>
          <p className="text-sm text-text-muted">
            {allTasks.length} görev · Son sync: {data?._taskSyncedAt ? new Date(data._taskSyncedAt).toLocaleTimeString('tr-TR') : '—'}
          </p>
        </div>
        <button onClick={onNew} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium">
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
        <input type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} placeholder={mode === 'today' ? "Bugüne görev ekle..." : "Yeni görev..."} className="flex-1 px-4 py-2.5 bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <button onClick={addTask} className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm" title="Hızlı ekle"><Plus size={16} /></button>
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
          {allTasks.length === 0 && <p className="text-sm text-text-muted text-center py-6">Görev yok — yukarıdan ekle</p>}
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
                    const projectId = task.relatedProjectId || task.projectId;
                    return (
                      <button key={task.id} onClick={() => onEdit && onEdit(task)} className="w-full text-left bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-3 hover:shadow-md transition-all">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${priorityDots[task.priority] || priorityDots.medium}`} />
                          <p className="text-sm font-medium truncate">{task.title}</p>
                        </div>
                        {projectId && (
                          <div className="mt-1">
                            <RelatedProjectBadge projectId={projectId} projects={data.projects} navigate={navigate} size="xs" />
                          </div>
                        )}
                        {task.dueDate && <p className="text-[10px] text-text-muted mt-1">{task.dueDate}</p>}
                      </button>
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
