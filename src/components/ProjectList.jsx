import { Plus, Search, ChevronRight, Star, ExternalLink, LayoutGrid, List, Columns3, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useState } from 'react';
import { PROJECT_STATUS_LABELS, PRIORITY_LABELS, PROJECT_TYPE_LABELS, PROJECT_CATEGORIES, PROJECT_CATEGORY_LABELS, getProjectProgress, getProjectStages } from '../store';

const statusColors = {
  idea: 'bg-warm/10 text-warm border-warm/20',
  planning: 'bg-primary/10 text-primary border-primary/20',
  active: 'bg-accent/10 text-accent border-accent/20',
  on_hold: 'bg-warm-light/30 text-text-muted border-warm-light/40',
  blocked: 'bg-danger/10 text-danger border-danger/20',
  completed: 'bg-success/10 text-success border-success/20',
  archived: 'bg-primary/5 text-text-muted border-border-light',
};

const priorityDots = { critical: 'bg-danger', high: 'bg-orange', medium: 'bg-primary', low: 'bg-warm-light' };

function progressColor(p) {
  if (p >= 75) return 'bg-success';
  if (p >= 40) return 'bg-warm';
  if (p > 0) return 'bg-orange';
  return 'bg-warm-light';
}

export default function ProjectList({ data, update, remove, navigate, onQuickAdd }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('card'); // card | kanban | table
  const [sortKey, setSortKey] = useState('updatedAt'); // title | category | status | progress | techStack | updatedAt
  const [sortDir, setSortDir] = useState('desc'); // asc | desc

  const filtered = data.projects.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.tags?.some((t) => t.toLowerCase().includes(q)) || (p.shortDescription || '').toLowerCase().includes(q) || (p.techStack || []).some((s) => s.toLowerCase().includes(q));
    }
    return true;
  });

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'title' ? 'asc' : 'desc');
    }
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ArrowUpDown size={11} className="text-text-muted/40" />;
    return sortDir === 'asc' ? <ArrowUp size={11} className="text-primary" /> : <ArrowDown size={11} className="text-primary" />;
  };

  const statusOrder = { idea: 0, planning: 1, active: 2, on_hold: 3, blocked: 4, completed: 5, archived: 6 };

  const sorted = [...filtered].sort((a, b) => {
    let av, bv;
    switch (sortKey) {
      case 'title': av = a.title.toLowerCase(); bv = b.title.toLowerCase(); break;
      case 'category': av = (PROJECT_CATEGORY_LABELS[a.category] || a.category || '').toLowerCase(); bv = (PROJECT_CATEGORY_LABELS[b.category] || b.category || '').toLowerCase(); break;
      case 'status': av = statusOrder[a.status] ?? 9; bv = statusOrder[b.status] ?? 9; break;
      case 'progress': av = getProjectProgress(data, a.id); bv = getProjectProgress(data, b.id); break;
      case 'techStack': av = (a.techStack || []).length; bv = (b.techStack || []).length; break;
      case 'updatedAt': av = a.updatedAt || ''; bv = b.updatedAt || ''; break;
      default: av = a.updatedAt || ''; bv = b.updatedAt || '';
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const kanbanStatuses = ['idea', 'planning', 'active', 'on_hold', 'blocked', 'completed'];
  const usedCategories = [...new Set(data.projects.map((p) => p.category).filter(Boolean))];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Projeler</h1>
          <p className="text-sm text-text-muted">{filtered.length} proje</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-0.5">
            {[{ id: 'card', icon: LayoutGrid }, { id: 'kanban', icon: Columns3 }, { id: 'table', icon: List }].map((v) => {
              const Icon = v.icon;
              return <button key={v.id} onClick={() => setViewMode(v.id)} className={`p-1.5 rounded-lg ${viewMode === v.id ? 'bg-primary text-white' : 'text-text-muted'}`}><Icon size={15} /></button>;
            })}
          </div>
          <button onClick={onQuickAdd} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium transition-colors">
            <Plus size={16} /> Yeni Proje
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Proje, teknoloji, etiket ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'active', 'planning', 'idea', 'blocked', 'completed'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-primary text-white' : 'bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark text-text-muted'}`}>
              {s === 'all' ? 'Tümü' : PROJECT_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter (from Proje 1) */}
      {usedCategories.length > 1 && (
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setCategoryFilter('all')} className={`px-2 py-1 rounded-md text-[11px] font-medium ${categoryFilter === 'all' ? 'bg-accent text-white' : 'bg-accent/10 text-accent'}`}>Tüm Kategoriler</button>
          {usedCategories.map((cat) => (
            <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-2 py-1 rounded-md text-[11px] font-medium ${categoryFilter === cat ? 'bg-accent text-white' : 'bg-accent/10 text-accent'}`}>
              {PROJECT_CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      )}

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((p) => {
            const progress = getProjectProgress(data, p.id);
            const stages = getProjectStages(data, p.id);
            const completedStages = stages.filter((s) => s.status === 'completed').length;
            return (
              <div key={p.id} onClick={() => navigate('project-detail', p.id)} className={`bg-surface dark:bg-surface-dark-alt border rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group ${p.portfolio ? 'border-primary/30 bg-primary/[0.02]' : 'border-border-light dark:border-border-dark'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${priorityDots[p.priority]}`} />
                    <h3 className="font-semibold text-sm">{p.title}</h3>
                    {p.featured && <Star size={12} className="text-warm fill-warm" />}
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] rounded-md font-medium border ${statusColors[p.status]}`}>
                    {PROJECT_STATUS_LABELS[p.status]}
                  </span>
                </div>
                <p className="text-xs text-text-muted line-clamp-2 mb-2">{p.shortDescription}</p>

                {p.highlight && (
                  <p className="text-xs text-primary mb-2 line-clamp-1">{p.highlight}</p>
                )}

                {p.nextStep && (
                  <p className="text-xs text-accent mb-2 flex items-center gap-1">
                    <ChevronRight size={12} /> {p.nextStep}
                  </p>
                )}

                <div className="flex flex-wrap gap-1 mb-3">
                  {(p.techStack || p.tags || []).slice(0, 4).map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 bg-primary/8 text-primary text-[10px] rounded-md">{tag}</span>
                  ))}
                  {(p.techStack || p.tags || []).length > 4 && <span className="text-[10px] text-text-muted">+{(p.techStack || p.tags || []).length - 4}</span>}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${progressColor(progress)}`} style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-[10px] text-text-muted">%{progress}{stages.length > 0 ? ` · ${completedStages}/${stages.length}` : ''}</span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] text-text-muted/60">{p.updatedAt}</p>
                  {p.siteUrl && (
                    <a href={p.siteUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                      <ExternalLink size={10} /> Ziyaret
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanbanStatuses.map((status) => {
            const items = sorted.filter((p) => p.status === status);
            return (
              <div key={status} className="min-w-[260px] flex-shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 text-xs rounded-lg font-medium ${statusColors[status]}`}>{PROJECT_STATUS_LABELS[status]}</span>
                  <span className="text-xs text-text-muted">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((p) => {
                    const progress = getProjectProgress(data, p.id);
                    return (
                      <button key={p.id} onClick={() => navigate('project-detail', p.id)} className="w-full text-left bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-3 hover:shadow-md transition-all">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${priorityDots[p.priority]}`} />
                          <h4 className="text-sm font-medium truncate">{p.title}</h4>
                          {p.featured && <Star size={10} className="text-warm fill-warm shrink-0" />}
                        </div>
                        {p.highlight && <p className="text-[10px] text-primary mt-0.5 line-clamp-1">{p.highlight}</p>}
                        {p.nextStep && <p className="text-[11px] text-accent mt-1">{p.nextStep}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1 bg-primary/10 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${progressColor(progress)}`} style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-[9px] text-text-muted">%{progress}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark text-left text-xs text-text-muted">
                {[
                  { key: 'title', label: 'Proje' },
                  { key: 'category', label: 'Kategori' },
                  { key: 'status', label: 'Durum' },
                  { key: 'progress', label: 'İlerleme' },
                  { key: 'techStack', label: 'Teknolojiler' },
                  { key: 'updatedAt', label: 'Son Güncelleme' },
                ].map((col) => (
                  <th key={col.key} className="py-2 px-3">
                    <button onClick={() => toggleSort(col.key)} className="flex items-center gap-1 hover:text-text-dark dark:hover:text-white transition-colors">
                      {col.label} <SortIcon col={col.key} />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => {
                const progress = getProjectProgress(data, p.id);
                return (
                  <tr key={p.id} onClick={() => navigate('project-detail', p.id)} className="border-b border-border-light/50 dark:border-border-dark/50 hover:bg-primary/5 cursor-pointer">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        {p.featured && <Star size={10} className="text-warm fill-warm" />}
                        <span className="font-medium">{p.title}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-text-muted">{PROJECT_CATEGORY_LABELS[p.category] || p.category}</td>
                    <td className="py-2.5 px-3"><span className={`px-2 py-0.5 text-[10px] rounded-md font-medium ${statusColors[p.status]}`}>{PROJECT_STATUS_LABELS[p.status]}</span></td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${progressColor(progress)}`} style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs text-text-muted">%{progress}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex gap-1 flex-wrap">
                        {(p.techStack || []).slice(0, 3).map((t) => <span key={t} className="px-1 py-0.5 bg-primary/8 text-primary text-[9px] rounded">{t}</span>)}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-text-muted">{p.updatedAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-muted">Proje bulunamadı</p>
          <button onClick={onQuickAdd} className="mt-2 text-primary text-sm hover:underline">Yeni proje ekle</button>
        </div>
      )}
    </div>
  );
}
