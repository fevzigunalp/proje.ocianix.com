import { useState } from 'react';
import { Plus, Search, ChevronRight } from 'lucide-react';
import { LEARNING_STATUS_LABELS, getLearningCategoriesForItem } from '../store';

const statusColors = {
  planned: 'bg-primary/10 text-primary', purchased: 'bg-warm/10 text-warm', not_started: 'bg-warm-light/20 text-text-muted',
  in_progress: 'bg-accent/10 text-accent', paused: 'bg-warm-light/30 text-text-muted', completed: 'bg-success/10 text-success', revisit: 'bg-primary/10 text-primary',
};

export default function LearningList({ data, update, remove, navigate, onQuickAdd }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = data.learningItems.filter((l) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && !(l.categoryIds || []).includes(categoryFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      return l.title.toLowerCase().includes(q) || l.provider?.toLowerCase().includes(q) || l.tags?.some((t) => t.toLowerCase().includes(q));
    }
    return true;
  });

  const allCats = data.learningCategories || [];
  const usedCatIds = [...new Set(data.learningItems.flatMap((l) => l.categoryIds || []))];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Eğitimler</h1>
          <p className="text-sm text-text-muted">{filtered.length} eğitim</p>
        </div>
        <button onClick={onQuickAdd} className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-medium">
          <Plus size={16} /> Yeni Eğitim
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Eğitim ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'in_progress', 'planned', 'completed', 'paused'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-accent text-white' : 'bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark text-text-muted'}`}>
              {s === 'all' ? 'Tümü' : LEARNING_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {usedCatIds.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setCategoryFilter('all')} className={`px-2 py-1 rounded-md text-[11px] font-medium ${categoryFilter === 'all' ? 'bg-warm text-white' : 'bg-warm/10 text-warm'}`}>Tümü</button>
          {usedCatIds.map((catId) => {
            const cat = allCats.find((c) => c.id === catId);
            if (!cat) return null;
            return (
              <button key={catId} onClick={() => setCategoryFilter(catId)} className={`px-2 py-1 rounded-md text-[11px] font-medium ${categoryFilter === catId ? 'bg-warm text-white' : 'bg-warm/10 text-warm'}`}>
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((l) => {
          const project = data.projects.find((p) => p.id === l.relatedProjectId);
          return (
            <button key={l.id} onClick={() => navigate('learning-detail', l.id)} className="text-left bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm flex-1">{l.title}</h3>
                <span className={`px-2 py-0.5 text-[10px] rounded-md font-medium ml-2 shrink-0 ${statusColors[l.status]}`}>
                  {LEARNING_STATUS_LABELS[l.status]}
                </span>
              </div>
              <p className="text-xs text-text-muted">{l.provider}</p>
              {l.nextStep && <p className="text-xs text-accent mt-2 flex items-center gap-1"><ChevronRight size={12} /> {l.nextStep}</p>}
              <div className="flex flex-wrap gap-1 mt-3">
                {getLearningCategoriesForItem(data, l).map((cat) => <span key={cat.id} className="px-1.5 py-0.5 text-[10px] rounded-md" style={{ backgroundColor: cat.color + '18', color: cat.color }}>{cat.name}</span>)}
                {(l.tags || []).slice(0, 2).map((tag) => <span key={tag} className="px-1.5 py-0.5 bg-accent/10 text-accent text-[10px] rounded-md">{tag}</span>)}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex-1 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${l.progressPercent === 100 ? 'bg-success' : 'bg-gradient-to-r from-accent to-warm'}`} style={{ width: `${l.progressPercent}%` }} />
                </div>
                <span className="text-[10px] text-text-muted font-medium">%{l.progressPercent}</span>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-muted">Eğitim bulunamadı</p>
          <button onClick={onQuickAdd} className="mt-2 text-accent text-sm hover:underline">Yeni eğitim ekle</button>
        </div>
      )}
    </div>
  );
}
