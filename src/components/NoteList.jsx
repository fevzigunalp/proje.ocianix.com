import { useState } from 'react';
import { Plus, Search, Edit3, Trash2, ChevronRight } from 'lucide-react';
import { NOTE_TYPE_LABELS } from '../store';

const typeColors = {
  quick_note: 'bg-warm-light/20 text-text-muted', project_note: 'bg-primary/10 text-primary', learning_note: 'bg-accent/10 text-accent',
  idea: 'bg-warm/10 text-warm', decision: 'bg-danger/10 text-danger', meeting_note: 'bg-success/10 text-success',
  prompt_summary: 'bg-purple/10 text-purple', issue_solution: 'bg-accent/10 text-accent', research_note: 'bg-warm/10 text-warm',
};

export default function NoteList({ data, update, remove, navigate, onQuickAdd }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const today = new Date().toISOString().slice(0, 10);

  const filtered = data.notes.filter((n) => {
    if (typeFilter !== 'all' && n.noteType !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return n.title.toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q);
    }
    return true;
  }).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  const usedTypes = [...new Set(data.notes.map((n) => n.noteType).filter(Boolean))];

  const saveEdit = (note) => {
    update('notes', { ...note, content: editContent, updatedAt: today });
    setEditId(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Notlar</h1>
          <p className="text-sm text-text-muted">{filtered.length} not</p>
        </div>
        <button onClick={onQuickAdd} className="flex items-center gap-2 px-4 py-2 bg-warm hover:bg-warm/90 text-white rounded-xl text-sm font-medium">
          <Plus size={16} /> Yeni Not
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Not ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-warm/30" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setTypeFilter('all')} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${typeFilter === 'all' ? 'bg-warm text-white' : 'bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark text-text-muted'}`}>Tümü</button>
          {usedTypes.map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${typeFilter === t ? 'bg-warm text-white' : 'bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark text-text-muted'}`}>
              {NOTE_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((note) => {
          const project = data.projects.find((p) => p.id === note.projectId);
          const isExpanded = expandedId === note.id;
          return (
            <div key={note.id} className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : note.id)}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-1.5 py-0.5 text-[10px] rounded-md font-medium ${typeColors[note.noteType]}`}>{NOTE_TYPE_LABELS[note.noteType]}</span>
                    <h3 className="font-medium text-sm">{note.title}</h3>
                  </div>
                  {!isExpanded && note.content && <p className="text-xs text-text-muted mt-1 line-clamp-2">{note.content}</p>}
                </div>
                <div className="flex gap-1 ml-2 shrink-0">
                  <button onClick={() => { setEditId(note.id); setEditContent(note.content || ''); }} className="p-1 text-text-muted hover:text-primary"><Edit3 size={13} /></button>
                  <button onClick={() => remove('notes', note.id)} className="p-1 text-text-muted hover:text-danger"><Trash2 size={13} /></button>
                </div>
              </div>
              {isExpanded && (
                <div className="mt-3 space-y-2">
                  {editId === note.id ? (
                    <div>
                      <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={4} className="w-full px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-warm/30 resize-none" />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => saveEdit(note)} className="px-3 py-1.5 bg-warm text-white rounded-lg text-xs">Kaydet</button>
                        <button onClick={() => setEditId(null)} className="px-3 py-1.5 border border-border-light dark:border-border-dark rounded-lg text-xs text-text-muted">İptal</button>
                      </div>
                    </div>
                  ) : note.content && <p className="text-sm text-text-muted whitespace-pre-wrap">{note.content}</p>}
                  {note.nextAction && <p className="text-xs text-primary flex items-center gap-1"><ChevronRight size={12} /> {note.nextAction}</p>}
                </div>
              )}
              <div className="flex items-center gap-2 mt-2 text-[10px] text-text-muted flex-wrap">
                {project && <span className="text-primary">{project.title}</span>}
                <span>{note.createdAt}</span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-muted">Not bulunamadı</p>
          <button onClick={onQuickAdd} className="mt-2 text-warm text-sm hover:underline">Yeni not ekle</button>
        </div>
      )}
    </div>
  );
}
