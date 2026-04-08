import { useState } from 'react';
import { Search, FolderKanban, ListTodo, BookOpen, StickyNote, Paperclip, Brain, Scale } from 'lucide-react';
import { PROJECT_STATUS_LABELS, TASK_STATUS_LABELS, LEARNING_STATUS_LABELS, NOTE_TYPE_LABELS } from '../store';

export default function SearchView({ data, navigate }) {
  const [query, setQuery] = useState('');
  const q = query.toLowerCase().trim();

  if (!q) return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Arama</h1>
      <div className="relative max-w-lg">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input type="text" placeholder="Proje, görev, eğitim, not, kaynak ara..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" autoFocus />
      </div>
      <p className="text-text-muted text-sm text-center py-12">Aramaya başlamak için yazın...</p>
    </div>
  );

  const match = (text) => text && text.toLowerCase().includes(q);

  const projects = data.projects.filter((p) => match(p.title) || match(p.shortDescription) || match(p.highlight) || p.tags?.some((t) => match(t)) || p.techStack?.some((t) => match(t)));
  const tasks = data.tasks.filter((t) => match(t.title) || match(t.description));
  const learning = data.learningItems.filter((l) => match(l.title) || match(l.provider) || l.tags?.some((t) => match(t)));
  const notes = data.notes.filter((n) => match(n.title) || match(n.content));
  const assets = data.assets.filter((a) => match(a.title) || match(a.description));
  const prompts = data.prompts.filter((p) => match(p.title) || match(p.promptText));
  const decisions = data.decisions.filter((d) => match(d.title) || match(d.decisionText));

  const totalResults = projects.length + tasks.length + learning.length + notes.length + assets.length + prompts.length + decisions.length;

  const Section = ({ icon: Icon, title, count, children }) => count > 0 ? (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs text-text-muted">({count})</span>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  ) : null;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Arama</h1>
      <div className="relative max-w-lg">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input type="text" placeholder="Proje, görev, eğitim, not, kaynak ara..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" autoFocus />
      </div>
      <p className="text-xs text-text-muted">{totalResults} sonuç bulundu</p>

      <div className="space-y-6">
        <Section icon={FolderKanban} title="Projeler" count={projects.length}>
          {projects.map((p) => (
            <button key={p.id} onClick={() => navigate('project-detail', p.id)} className="w-full text-left p-2 rounded-lg hover:bg-primary/5 transition-colors">
              <p className="text-sm font-medium">{p.title}</p>
              <p className="text-[10px] text-text-muted">{PROJECT_STATUS_LABELS[p.status]} · {p.shortDescription}</p>
            </button>
          ))}
        </Section>
        <Section icon={ListTodo} title="Görevler" count={tasks.length}>
          {tasks.map((t) => (
            <div key={t.id} className="p-2 rounded-lg hover:bg-primary/5">
              <p className="text-sm">{t.title}</p>
              <p className="text-[10px] text-text-muted">{TASK_STATUS_LABELS[t.status]}</p>
            </div>
          ))}
        </Section>
        <Section icon={BookOpen} title="Eğitimler" count={learning.length}>
          {learning.map((l) => (
            <button key={l.id} onClick={() => navigate('learning-detail', l.id)} className="w-full text-left p-2 rounded-lg hover:bg-primary/5 transition-colors">
              <p className="text-sm font-medium">{l.title}</p>
              <p className="text-[10px] text-text-muted">{l.provider} · {LEARNING_STATUS_LABELS[l.status]}</p>
            </button>
          ))}
        </Section>
        <Section icon={StickyNote} title="Notlar" count={notes.length}>
          {notes.map((n) => (
            <div key={n.id} className="p-2 rounded-lg hover:bg-primary/5">
              <p className="text-sm font-medium">{n.title}</p>
              {n.content && <p className="text-[10px] text-text-muted line-clamp-1">{n.content}</p>}
            </div>
          ))}
        </Section>
        <Section icon={Brain} title="Promptlar" count={prompts.length}>
          {prompts.map((p) => (
            <div key={p.id} className="p-2 rounded-lg hover:bg-primary/5">
              <p className="text-sm font-medium">{p.title}</p>
            </div>
          ))}
        </Section>
        <Section icon={Scale} title="Kararlar" count={decisions.length}>
          {decisions.map((d) => (
            <div key={d.id} className="p-2 rounded-lg hover:bg-primary/5">
              <p className="text-sm font-medium">{d.title}</p>
              <p className="text-[10px] text-text-muted">{d.decisionText}</p>
            </div>
          ))}
        </Section>
        <Section icon={Paperclip} title="Kaynaklar" count={assets.length}>
          {assets.map((a) => (
            <div key={a.id} className="p-2 rounded-lg hover:bg-primary/5">
              <p className="text-sm font-medium">{a.title}</p>
              <p className="text-[10px] text-text-muted">{a.assetType}</p>
            </div>
          ))}
        </Section>
      </div>

      {totalResults === 0 && <p className="text-text-muted text-center py-8">Sonuç bulunamadı</p>}
    </div>
  );
}
