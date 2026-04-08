import { useState } from 'react';
import { FolderKanban, ListTodo, AlertTriangle, BookOpen, CheckCircle2, TrendingUp, ArrowRight, Clock, Star, Calendar } from 'lucide-react';
import { getTodayTasks, getOverdueTasks, getActiveProjects, getStaleProjects, getActiveLearning, getProjectProgress, getTodayLearning, getWeekLearningPlan, getFeaturedProjects, loadFocusMode, saveFocusMode, FOCUS_MODES, FOCUS_MODE_LABELS, FOCUS_MODE_ICONS, DAY_LABELS, PROJECT_STATUS_LABELS } from '../store';

export default function Dashboard({ data, navigate, update }) {
  const [focusMode, setFocusModeState] = useState(() => loadFocusMode());
  const today = new Date().toISOString().slice(0, 10);
  const todayTasks = getTodayTasks(data);
  const overdueTasks = getOverdueTasks(data);
  const activeProjects = getActiveProjects(data);
  const staleProjects = getStaleProjects(data);
  const activeLearning = getActiveLearning(data);
  const todayLearning = getTodayLearning(data);
  const weekPlan = getWeekLearningPlan(data);
  const featuredProjects = getFeaturedProjects(data);
  const mode = focusMode.mode;

  const setMode = (m) => {
    const fm = { mode: m, selectedAt: today };
    setFocusModeState(fm);
    saveFocusMode(fm);
  };

  const completedThisWeek = data.tasks.filter((t) => {
    if (t.status !== 'completed' || !t.completedAt) return false;
    return new Date(t.completedAt) >= new Date(Date.now() - 7 * 86400000);
  }).length;

  const toggleTask = (task) => {
    update('tasks', { ...task, status: task.status === 'completed' ? 'todo' : 'completed', completedAt: task.status === 'completed' ? null : today, updatedAt: today });
  };

  const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Günaydın' : h < 18 ? 'İyi Günler' : 'İyi Akşamlar'; };

  // Deep work mode
  const deepProject = mode === 'deep_work' ? data.projects.filter((p) => p.status === 'active').sort((a, b) => { const pr = { critical: 0, high: 1, medium: 2, low: 3 }; return (pr[a.priority] || 3) - (pr[b.priority] || 3); })[0] : null;
  const deepTasks = deepProject ? data.tasks.filter((t) => t.projectId === deepProject.id && t.status !== 'completed' && t.status !== 'cancelled').slice(0, 3) : [];

  if (mode === 'deep_work') {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{greeting()}</h1>
          <p className="text-text-muted mt-1">Derin Çalışma Modu</p>
        </div>
        <div className="flex gap-1.5 justify-center flex-wrap">
          {FOCUS_MODES.map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${mode === m ? 'bg-primary text-white shadow-md' : 'bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark text-text-muted'}`}>
              {FOCUS_MODE_ICONS[m]} {FOCUS_MODE_LABELS[m]}
            </button>
          ))}
        </div>
        {deepProject ? (
          <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-8 text-center">
            <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Odak Projesi</p>
            <h2 className="text-2xl font-bold mb-2">{deepProject.title}</h2>
            {deepProject.highlight && <p className="text-sm text-primary mb-4">{deepProject.highlight}</p>}
            <div className="w-full h-3 bg-primary/10 rounded-full overflow-hidden my-4 max-w-md mx-auto">
              <div className="h-full bg-gradient-to-r from-primary to-teal rounded-full" style={{ width: `${getProjectProgress(data, deepProject.id)}%` }} />
            </div>
            <p className="text-sm font-medium">%{getProjectProgress(data, deepProject.id)} tamamlandı</p>
            {deepProject.nextStep && (
              <div className="mt-6 bg-primary/5 border border-primary/15 rounded-xl p-4">
                <p className="text-xs text-primary uppercase tracking-wide mb-1">Sonraki Adım</p>
                <p className="text-lg font-semibold">{deepProject.nextStep}</p>
              </div>
            )}
            {deepTasks.length > 0 && (
              <div className="mt-6 space-y-2 text-left max-w-md mx-auto">
                {deepTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl border border-border-light dark:border-border-dark">
                    <button onClick={() => toggleTask(task)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${task.status === 'completed' ? 'bg-success border-success text-white' : 'border-border-light dark:border-border-dark hover:border-primary'}`}>
                      {task.status === 'completed' && <CheckCircle2 size={12} />}
                    </button>
                    <span className="text-sm flex-1">{task.title}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => navigate('project-detail', deepProject.id)} className="mt-6 text-primary text-sm hover:underline">Projeye Git →</button>
          </div>
        ) : (
          <p className="text-center text-text-muted py-12">Aktif proje yok.</p>
        )}
      </div>
    );
  }

  const showProjects = mode !== 'learning';
  const showLearning = mode !== 'project' && mode !== 'admin';
  const showAdmin = mode === 'admin' || mode === 'mixed';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{greeting()} 👋</h1>
        <p className="text-text-muted mt-1">{new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {FOCUS_MODES.map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${mode === m ? 'bg-primary text-white shadow-md scale-105' : 'bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark text-text-muted hover:border-primary/30'}`}>
            {FOCUS_MODE_ICONS[m]} {FOCUS_MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          showProjects && { label: 'Aktif Proje', value: activeProjects.length, icon: FolderKanban, color: 'text-primary', bg: 'bg-primary/10', click: () => navigate('projects') },
          { label: 'Bugün Görev', value: todayTasks.length, icon: ListTodo, color: 'text-accent', bg: 'bg-accent/10', click: () => navigate('tasks') },
          { label: 'Geciken', value: overdueTasks.length, icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10', click: () => navigate('tasks') },
          showLearning && { label: 'Bugün Eğitim', value: todayLearning.length, icon: BookOpen, color: 'text-warm', bg: 'bg-warm/10', click: () => navigate('learning') },
          { label: 'Bu Hafta', value: completedThisWeek, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', click: () => navigate('tasks') },
          showAdmin && { label: 'Tıkanan', value: staleProjects.length, icon: Clock, color: 'text-text-muted', bg: 'bg-primary/5', click: () => navigate('projects') },
        ].filter(Boolean).map((kpi) => {
          const Icon = kpi.icon;
          return (
            <button key={kpi.label} onClick={kpi.click} className={`${kpi.bg} rounded-2xl p-4 text-left hover:scale-[1.02] transition-transform`}>
              <Icon size={18} className={kpi.color} />
              <p className="text-2xl font-bold mt-2">{kpi.value}</p>
              <p className="text-xs text-text-muted mt-0.5">{kpi.label}</p>
            </button>
          );
        })}
      </div>

      {/* Featured Projects (from Proje 1) */}
      {showProjects && featuredProjects.length > 0 && (
        <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star size={18} className="text-warm" />
            <h2 className="font-semibold">Öne Çıkan Projeler</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {featuredProjects.map((p) => {
              const progress = getProjectProgress(data, p.id);
              return (
                <button key={p.id} onClick={() => navigate('project-detail', p.id)} className="text-left p-4 rounded-xl border-2 border-primary/20 bg-primary/5 hover:border-primary/40 transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <Star size={12} className="text-warm fill-warm" />
                    <h3 className="font-semibold text-sm">{p.title}</h3>
                  </div>
                  {p.highlight && <p className="text-xs text-primary mb-2">{p.highlight}</p>}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-[10px] text-text-muted">%{progress}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline + Next Steps */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-primary" />
            <h2 className="font-semibold">Bugünün Programı</h2>
          </div>

          {todayLearning.length === 0 && todayTasks.length === 0 && overdueTasks.length === 0 && (
            <p className="text-sm text-text-muted text-center py-6">Bugün için program yok</p>
          )}

          {overdueTasks.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-medium text-danger uppercase tracking-wide mb-1">Geciken</p>
              {overdueTasks.slice(0, 3).map((t) => (
                <div key={t.id} className="flex items-center gap-2 py-1.5 text-sm text-danger/80">
                  <span className="w-12 text-[10px] text-danger font-mono">{t.dueDate?.slice(5)}</span>
                  <span className="truncate">{t.title}</span>
                </div>
              ))}
            </div>
          )}

          {showLearning && todayLearning.map((entry, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-border-light/50 dark:border-border-dark/50 last:border-0">
              <div className="w-12 text-right">
                {entry.timeStart && <p className="text-[11px] font-mono text-warm font-medium">{entry.timeStart}</p>}
                {entry.timeEnd && <p className="text-[10px] font-mono text-text-muted">{entry.timeEnd}</p>}
              </div>
              <div className="w-1 h-8 bg-warm rounded-full" />
              <div className="flex-1 min-w-0">
                <button onClick={() => navigate('learning-detail', entry.learningItem.id)} className="text-sm font-medium hover:text-warm transition-colors truncate block">{entry.learningItem.title}</button>
                <p className="text-[10px] text-text-muted">{entry.learningItem.provider}</p>
              </div>
              <BookOpen size={14} className="text-warm shrink-0" />
            </div>
          ))}

          {showProjects && todayTasks.slice(0, 5).map((task) => {
            const project = data.projects.find((p) => p.id === task.projectId);
            return (
              <div key={task.id} className="flex items-center gap-3 py-2 border-b border-border-light/50 dark:border-border-dark/50 last:border-0">
                <div className="w-12" />
                <div className="w-1 h-8 bg-accent rounded-full" />
                <button onClick={() => toggleTask(task)} className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${task.status === 'completed' ? 'bg-success border-success text-white' : 'border-border-light dark:border-border-dark hover:border-primary'}`}>
                  {task.status === 'completed' && <CheckCircle2 size={10} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${task.status === 'completed' ? 'line-through text-text-muted' : ''}`}>{task.title}</p>
                  {project && <p className="text-[10px] text-text-muted">{project.title}</p>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-primary" />
            <h2 className="font-semibold">Sonraki Adımlar</h2>
          </div>
          <div className="space-y-3">
            {showProjects && activeProjects.slice(0, 4).map((p) => (
              <button key={p.id} onClick={() => navigate('project-detail', p.id)} className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors text-left">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.title}</p>
                  {p.nextStep ? <p className="text-xs text-primary mt-0.5">{p.nextStep}</p> : <p className="text-xs text-text-muted mt-0.5 italic">Sonraki adım belirlenmemiş</p>}
                </div>
                <span className="text-[10px] text-text-muted">%{getProjectProgress(data, p.id)}</span>
              </button>
            ))}
            {showLearning && activeLearning.slice(0, 3).map((l) => (
              <button key={l.id} onClick={() => navigate('learning-detail', l.id)} className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors text-left">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-warm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{l.title}</p>
                  {l.nextStep ? <p className="text-xs text-warm mt-0.5">{l.nextStep}</p> : <p className="text-xs text-text-muted mt-0.5 italic">Sonraki adım belirlenmemiş</p>}
                </div>
                <span className="text-[10px] text-text-muted">%{l.progressPercent}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Week Calendar */}
      <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-accent" />
          <h2 className="font-semibold">Bu Hafta</h2>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekPlan.map((day) => {
            const isToday = day.date === today;
            const dayDate = new Date(day.date);
            return (
              <div key={day.date} className={`text-center p-2 rounded-xl transition-all ${isToday ? 'bg-primary/10 border-2 border-primary/30' : 'border border-border-light dark:border-border-dark'}`}>
                <p className={`text-[10px] font-medium uppercase ${isToday ? 'text-primary' : 'text-text-muted'}`}>{DAY_LABELS[dayDate.getDay()]}</p>
                <p className={`text-lg font-bold ${isToday ? 'text-primary' : ''}`}>{dayDate.getDate()}</p>
                <div className="flex justify-center gap-1 mt-1">
                  {day.sessions.length > 0 && <div className="w-2 h-2 rounded-full bg-warm" />}
                  {day.tasks.length > 0 && <div className="w-2 h-2 rounded-full bg-accent" />}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-[10px] text-text-muted">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warm inline-block" /> Eğitim</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent inline-block" /> Görev</span>
        </div>
      </div>

      {/* Active Learning + Recent Notes */}
      <div className="grid lg:grid-cols-2 gap-6">
        {showLearning && (
          <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-warm" />
                <h2 className="font-semibold">Devam Eden Eğitimler</h2>
              </div>
              <button onClick={() => navigate('learning')} className="text-primary text-xs flex items-center gap-1 hover:underline">Tümü <ArrowRight size={12} /></button>
            </div>
            <div className="space-y-3">
              {activeLearning.slice(0, 4).map((l) => (
                <button key={l.id} onClick={() => navigate('learning-detail', l.id)} className="w-full flex items-center gap-3 text-left p-2 rounded-xl hover:bg-primary/5 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{l.title}</p>
                    <p className="text-[11px] text-text-muted">{l.provider}</p>
                  </div>
                  <div className="w-16 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                    <div className="h-full bg-warm rounded-full" style={{ width: `${l.progressPercent}%` }} />
                  </div>
                  <span className="text-[11px] text-text-muted w-7 text-right">%{l.progressPercent}</span>
                </button>
              ))}
              {activeLearning.length === 0 && <p className="text-sm text-text-muted text-center py-4">Aktif eğitim yok</p>}
            </div>
          </div>
        )}

        <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star size={18} className="text-accent" />
            <h2 className="font-semibold">Son Notlar & Kararlar</h2>
          </div>
          <div className="space-y-2">
            {[...data.notes, ...data.decisions].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 5).map((item) => (
              <div key={item.id} className="p-2 rounded-xl hover:bg-primary/5 transition-colors">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-[11px] text-text-muted">{item.noteType ? 'Not' : 'Karar'} · {item.createdAt}</p>
              </div>
            ))}
            {data.notes.length === 0 && data.decisions.length === 0 && <p className="text-sm text-text-muted text-center py-4">Henüz not yok</p>}
          </div>
        </div>
      </div>

      {/* Stale Projects */}
      {showAdmin && staleProjects.length > 0 && (
        <div className="bg-warm/5 border border-warm/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-warm" />
            <h2 className="font-semibold text-sm">Dikkat: Güncellenmeyen Projeler</h2>
          </div>
          <div className="space-y-2">
            {staleProjects.map((p) => (
              <button key={p.id} onClick={() => navigate('project-detail', p.id)} className="w-full flex items-center justify-between text-left p-2 hover:bg-warm/10 rounded-xl transition-colors">
                <span className="text-sm">{p.title}</span>
                <span className="text-xs text-text-muted">Son: {p.updatedAt}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
