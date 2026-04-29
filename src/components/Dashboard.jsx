import { useState } from 'react';
import { FolderKanban, ListTodo, AlertTriangle, BookOpen, CheckCircle2, TrendingUp, ArrowRight, Clock, Star, Calendar, Globe, Building2, Tag, Layers, Rocket, ExternalLink, ShieldCheck } from 'lucide-react';
import {
  getTodayTasks, getOverdueTasks, getActiveProjects, getStaleProjects, getActiveLearning, getProjectProgress,
  getTodayLearning, getWeekLearningPlan, getFeaturedProjects, getLiveProjects, getIdeaProjects, getPausedProjects,
  getPublishingQueue, getDomainExpiryAlerts, groupByOwner, groupByType, groupByStatus, groupByBusinessArea,
  loadFocusMode, saveFocusMode, FOCUS_MODES, FOCUS_MODE_LABELS, FOCUS_MODE_ICONS, DAY_LABELS,
  PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS, STATUS_COLORS, OWNER_COLORS, PROJECT_STATUSES, PROJECT_TYPES,
} from '../store';

export default function Dashboard({ data, navigate, update }) {
  const [focusMode, setFocusModeState] = useState(() => loadFocusMode());
  const today = new Date().toISOString().slice(0, 10);
  const todayTasks = getTodayTasks(data);
  const overdueTasks = getOverdueTasks(data);
  const activeProjects = getActiveProjects(data);
  const liveProjects = getLiveProjects(data);
  const ideaProjects = getIdeaProjects(data);
  const pausedProjects = getPausedProjects(data);
  const publishQueue = getPublishingQueue(data);
  const staleProjects = getStaleProjects(data);
  const todayLearning = getTodayLearning(data);
  const weekPlan = getWeekLearningPlan(data);
  const featuredProjects = getFeaturedProjects(data);
  const domainAlerts = getDomainExpiryAlerts(data.projects, 365);
  const projects = data.projects;
  const totalProjects = projects.length;

  const byOwner = groupByOwner(projects);
  const byType = groupByType(projects);
  const byStatus = groupByStatus(projects);
  const byArea = groupByBusinessArea(projects);

  const completedThisWeek = data.tasks.filter((t) => {
    if (t.status !== 'completed' || !t.completedAt) return false;
    return new Date(t.completedAt) >= new Date(Date.now() - 7 * 86400000);
  }).length;

  const toggleTask = (task) => {
    update('tasks', { ...task, status: task.status === 'completed' ? 'todo' : 'completed', completedAt: task.status === 'completed' ? null : today, updatedAt: today });
  };

  const setMode = (m) => {
    const fm = { mode: m, selectedAt: today };
    setFocusModeState(fm);
    saveFocusMode(fm);
  };

  const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Günaydın' : h < 18 ? 'İyi Günler' : 'İyi Akşamlar'; };
  const mode = focusMode.mode;

  // Proje durum sıralaması (Excel'deki L kolonu kategori sırası)
  const statusOrder = ['live', 'optimization', 'in_progress', 'draft', 'paused', 'idea'];
  const sortedStatuses = statusOrder.filter((s) => byStatus[s]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{greeting()} 👋</h1>
        <p className="text-text-muted mt-1">{new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · <span className="text-primary">{totalProjects} proje izleniyor</span></p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {FOCUS_MODES.map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${mode === m ? 'bg-primary text-white shadow-md scale-105' : 'bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark text-text-muted hover:border-primary/30'}`}>
            {FOCUS_MODE_ICONS[m]} {FOCUS_MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* KPI Cards — Excel L kolonu (Proje İlerleme Durumu) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <button onClick={() => navigate('projects')} className="bg-success/10 rounded-2xl p-4 text-left hover:scale-[1.02] transition-transform">
          <Rocket size={18} className="text-success" />
          <p className="text-2xl font-bold mt-2">{liveProjects.length}</p>
          <p className="text-xs text-text-muted mt-0.5">Yayında / Optimizasyon</p>
        </button>
        <button onClick={() => navigate('projects')} className="bg-accent/10 rounded-2xl p-4 text-left hover:scale-[1.02] transition-transform">
          <FolderKanban size={18} className="text-accent" />
          <p className="text-2xl font-bold mt-2">{activeProjects.length}</p>
          <p className="text-xs text-text-muted mt-0.5">Aktif Geliştirme</p>
        </button>
        <button onClick={() => navigate('projects')} className="bg-warm/10 rounded-2xl p-4 text-left hover:scale-[1.02] transition-transform">
          <Star size={18} className="text-warm" />
          <p className="text-2xl font-bold mt-2">{ideaProjects.length}</p>
          <p className="text-xs text-text-muted mt-0.5">Fikir Aşaması</p>
        </button>
        <button onClick={() => navigate('projects')} className="bg-orange/10 rounded-2xl p-4 text-left hover:scale-[1.02] transition-transform">
          <Clock size={18} className="text-orange" />
          <p className="text-2xl font-bold mt-2">{pausedProjects.length}</p>
          <p className="text-xs text-text-muted mt-0.5">Ara Verildi</p>
        </button>
        <button onClick={() => navigate('projects')} className="bg-primary/10 rounded-2xl p-4 text-left hover:scale-[1.02] transition-transform">
          <ShieldCheck size={18} className="text-primary" />
          <p className="text-2xl font-bold mt-2">{publishQueue.length}</p>
          <p className="text-xs text-text-muted mt-0.5">Ocianix'te Yayınlanacak</p>
        </button>
        <button onClick={() => navigate('tasks')} className="bg-danger/10 rounded-2xl p-4 text-left hover:scale-[1.02] transition-transform">
          <AlertTriangle size={18} className="text-danger" />
          <p className="text-2xl font-bold mt-2">{overdueTasks.length}</p>
          <p className="text-xs text-text-muted mt-0.5">Geciken Görev</p>
        </button>
      </div>

      {/* Excel-aligned breakdowns */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Proje Sahibi (B) */}
        <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={18} className="text-primary" />
            <h2 className="font-semibold">Proje Sahibi'ne Göre</h2>
            <span className="text-[10px] text-text-muted ml-auto">B kolonu</span>
          </div>
          <div className="space-y-2">
            {Object.entries(byOwner).sort((a, b) => b[1].length - a[1].length).map(([owner, items]) => {
              const pct = Math.round((items.length / totalProjects) * 100);
              return (
                <div key={owner} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{owner}</span>
                    <span className="text-text-muted">{items.length} <span className="opacity-60">· %{pct}</span></span>
                  </div>
                  <div className="h-2 bg-primary/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-teal rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Proje Türü (C) */}
        <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={18} className="text-accent" />
            <h2 className="font-semibold">Proje Türü'ne Göre</h2>
            <span className="text-[10px] text-text-muted ml-auto">C kolonu</span>
          </div>
          <div className="space-y-2">
            {PROJECT_TYPES.filter((t) => byType[t]).map((type) => {
              const items = byType[type] || [];
              const pct = Math.round((items.length / totalProjects) * 100);
              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{PROJECT_TYPE_LABELS[type]}</span>
                    <span className="text-text-muted">{items.length} <span className="opacity-60">· %{pct}</span></span>
                  </div>
                  <div className="h-2 bg-accent/5 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* İlerleme Durumu (L) */}
        <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-warm" />
            <h2 className="font-semibold">İlerleme Durumu</h2>
            <span className="text-[10px] text-text-muted ml-auto">L kolonu</span>
          </div>
          <div className="space-y-2">
            {sortedStatuses.map((status) => {
              const items = byStatus[status] || [];
              const pct = Math.round((items.length / totalProjects) * 100);
              return (
                <button key={status} onClick={() => navigate('projects')} className="w-full text-left">
                  <div className="flex items-center justify-between gap-2 text-xs mb-1">
                    <span className={`px-2 py-0.5 rounded-md font-medium border ${STATUS_COLORS[status]}`}>{PROJECT_STATUS_LABELS[status]}</span>
                    <span className="text-text-muted">{items.length} <span className="opacity-60">· %{pct}</span></span>
                  </div>
                  <div className="h-1.5 bg-warm/5 rounded-full overflow-hidden">
                    <div className="h-full bg-warm rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Aktif Projeler — Yapım + Optimizasyon */}
      {activeProjects.length > 0 && (
        <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Rocket size={18} className="text-accent" />
            <h2 className="font-semibold">Aktif Geliştirme</h2>
            <span className="text-xs text-text-muted">{activeProjects.length} proje</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeProjects.slice(0, 9).map((p) => {
              const progress = getProjectProgress(data, p.id);
              return (
                <button key={p.id} onClick={() => navigate('project-detail', p.id)} className="text-left p-4 rounded-xl border border-border-light dark:border-border-dark hover:border-primary/40 transition-all bg-surface-alt/50 dark:bg-surface-dark/30">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{p.name}</h3>
                    {p.publishOnOcianix === 'Evet' && <span title="Ocianix'te yayınlanacak" className="px-1.5 py-0.5 text-[9px] rounded bg-primary/10 text-primary border border-primary/20 shrink-0">YAYIN</span>}
                  </div>
                  {p.subBusiness && <p className="text-[11px] text-text-muted mb-2">{p.subBusiness}</p>}
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    {p.ownerCompany && <span className={`px-1.5 py-0.5 text-[9px] rounded border ${OWNER_COLORS[p.ownerCompany] || 'bg-text-muted/10 text-text-muted border-text-muted/20'}`}>{p.ownerCompany}</span>}
                    <span className={`px-1.5 py-0.5 text-[9px] rounded-md border ${STATUS_COLORS[p.status]}`}>{PROJECT_STATUS_LABELS[p.status]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-teal rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-[10px] text-text-muted">%{progress}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* İş Alanları (E kolonu) + Domain uyarıları */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Tag size={18} className="text-primary" />
            <h2 className="font-semibold">İş Alanları</h2>
            <span className="text-[10px] text-text-muted ml-auto">E kolonu</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(byArea).sort((a, b) => b[1].length - a[1].length).slice(0, 24).map(([area, items]) => (
              <button key={area} onClick={() => navigate('projects')} className="px-2.5 py-1 bg-primary/5 hover:bg-primary/10 border border-primary/15 rounded-lg text-xs flex items-center gap-1.5">
                <span>{area}</span>
                <span className="text-[10px] text-text-muted">{items.length}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={18} className="text-warm" />
            <h2 className="font-semibold">Domain Bitiş Tarihleri</h2>
            <span className="text-[10px] text-text-muted ml-auto">K kolonu</span>
          </div>
          {domainAlerts.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">Excel'de domain bitiş tarihi tanımlı kayıt yok.</p>
          ) : (
            <div className="space-y-2">
              {domainAlerts.map(({ project, expiryDate, daysLeft }) => {
                const urgent = daysLeft <= 30;
                return (
                  <button key={project.id} onClick={() => navigate('project-detail', project.id)} className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-colors text-left ${urgent ? 'bg-danger/5 border-danger/20 hover:bg-danger/10' : 'border-border-light dark:border-border-dark hover:bg-primary/5'}`}>
                    <Globe size={14} className={urgent ? 'text-danger' : 'text-text-muted'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{project.name}</p>
                      <p className="text-[10px] text-text-muted">{expiryDate}</p>
                    </div>
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${urgent ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'}`}>
                      {daysLeft >= 0 ? `${daysLeft} gün` : `${-daysLeft} gün geç`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bugün + Sonraki Adımlar */}
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

          {todayLearning.map((entry, i) => (
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

          {todayTasks.slice(0, 5).map((task) => {
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
                  {project && <p className="text-[10px] text-text-muted">{project.name}</p>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={18} className="text-primary" />
            <h2 className="font-semibold">Ocianix'te Yayınlanacak</h2>
            <span className="text-xs text-text-muted ml-auto">{publishQueue.length} proje</span>
          </div>
          {publishQueue.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">Yayın kuyruğunda proje yok</p>
          ) : (
            <div className="space-y-2">
              {publishQueue.map((p) => (
                <button key={p.id} onClick={() => navigate('project-detail', p.id)} className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-border-light dark:border-border-dark hover:bg-primary/5 transition-colors text-left">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-[10px] text-text-muted">{PROJECT_STATUS_LABELS[p.status]} · {p.businessArea}</p>
                  </div>
                  {p.websiteUrl && <ExternalLink size={12} className="text-text-muted" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stale */}
      {staleProjects.length > 0 && (
        <div className="bg-warm/5 border border-warm/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-warm" />
            <h2 className="font-semibold text-sm">Dikkat: 30+ Gündür Güncellenmeyen Aktif Projeler</h2>
          </div>
          <div className="space-y-2">
            {staleProjects.map((p) => (
              <button key={p.id} onClick={() => navigate('project-detail', p.id)} className="w-full flex items-center justify-between text-left p-2 hover:bg-warm/10 rounded-xl transition-colors">
                <span className="text-sm">{p.name}</span>
                <span className="text-xs text-text-muted">Son: {p.lastActivity || '—'}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
