import { LayoutDashboard, FolderKanban, ListTodo, BookOpen, StickyNote, Paperclip, BarChart3, Search, Moon, Sun, X, Zap, Cloud } from 'lucide-react';
import { getTodayTasks, getOverdueTasks, getActiveProjects, getActiveLearning, getLiveProjects } from '../store';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'Projeler', icon: FolderKanban },
  { id: 'tasks', label: 'Görevler', icon: ListTodo },
  { id: 'learning', label: 'Eğitimler', icon: BookOpen },
  { id: 'notes', label: 'Notlar', icon: StickyNote },
  { id: 'assets', label: 'Kaynaklar', icon: Paperclip },
  { id: 'reviews', label: 'İlerleme', icon: BarChart3 },
  { id: 'search', label: 'Arama', icon: Search },
  { id: 'sync', label: 'Sheet Senkron', icon: Cloud },
];

export default function Sidebar({ view, navigate, dark, setDark, open, onClose, data }) {
  const todayCount = getTodayTasks(data).length;
  const overdueCount = getOverdueTasks(data).length;
  const activeCount = getActiveProjects(data).length;

  const getBadge = (id) => {
    if (id === 'tasks') return todayCount + overdueCount || null;
    if (id === 'projects') return activeCount || null;
    if (id === 'learning') return getActiveLearning(data).length || null;
    return null;
  };

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-40 w-64 bg-surface dark:bg-surface-dark-alt
      border-r border-border-light dark:border-border-dark flex flex-col
      transform transition-transform duration-200 ease-in-out
      ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('dashboard')}>
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-teal rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">Ocianix</h1>
            <p className="text-[10px] text-text-muted tracking-wide uppercase">Operasyon Merkezi</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-primary/10">
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = view === item.id;
          const badge = getBadge(item.id);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary dark:text-primary-light'
                  : 'text-text-muted hover:bg-primary/5 hover:text-text-dark dark:hover:text-white'
              }`}
            >
              <Icon size={17} />
              <span className="flex-1 text-left">{item.label}</span>
              {badge != null && (
                <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-semibold ${
                  isActive ? 'bg-primary/20 text-primary' : item.id === 'tasks' && overdueCount > 0 ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-text-muted'
                }`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border-light dark:border-border-dark">
        <button
          onClick={() => setDark(!dark)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-muted hover:bg-primary/5 transition-all"
        >
          {dark ? <Sun size={17} /> : <Moon size={17} />}
          <span>{dark ? 'Açık Tema' : 'Koyu Tema'}</span>
        </button>
      </div>
    </aside>
  );
}
