import { useState } from 'react';
import { ArrowLeft, Check, ChevronRight, BookOpen, ListChecks, StickyNote, Plus, ExternalLink } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { LEARNING_STATUS_LABELS, getLearningModules, getLearningNotes, getLearningCategoriesForItem, getLearningSchedule, SCHEDULE_TYPE_LABELS, DAY_LABELS } from '../store';

const statusColors = {
  planned: 'bg-primary/10 text-primary', in_progress: 'bg-accent/10 text-accent', completed: 'bg-success/10 text-success',
  paused: 'bg-warm-light/30 text-text-muted', not_started: 'bg-warm-light/20 text-text-muted',
};

export default function LearningDetail({ data, learningId, update, remove, navigate }) {
  const item = data.learningItems.find((l) => l.id === learningId);
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');

  if (!item) return <p className="text-text-muted">Eğitim bulunamadı.</p>;

  const modules = getLearningModules(data, learningId);
  const notes = getLearningNotes(data, learningId);
  const project = data.projects.find((p) => p.id === item.relatedProjectId);
  const today = new Date().toISOString().slice(0, 10);

  const completedModules = modules.filter((m) => m.status === 'completed').length;
  const moduleProgress = modules.length ? Math.round((completedModules / modules.length) * 100) : item.progressPercent;

  const toggleModule = (mod) => {
    const newStatus = mod.status === 'completed' ? 'not_started' : 'completed';
    update('learningModules', { ...mod, status: newStatus, completedAt: newStatus === 'completed' ? today : null });
    const updatedModules = modules.map((m) => m.id === mod.id ? { ...m, status: newStatus } : m);
    const newCompleted = updatedModules.filter((m) => m.status === 'completed').length;
    const newProgress = modules.length ? Math.round((newCompleted / modules.length) * 100) : item.progressPercent;
    update('learningItems', { ...item, progressPercent: newProgress, updatedAt: today });
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    update('notes', { id: uuidv4(), brandId: null, projectId: null, phaseId: null, taskId: null, learningItemId: learningId, title: newNote.trim(), noteType: 'learning_note', content: '', summary: '', importanceLevel: 'medium', decisionFlag: false, nextAction: '', sourceType: 'manual', sourceLink: '', tags: [], createdAt: today, updatedAt: today });
    setNewNote('');
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-start gap-3">
        <button onClick={() => navigate('learning')} className="p-2 rounded-xl hover:bg-primary/10 mt-1"><ArrowLeft size={18} /></button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold">{item.title}</h1>
            <span className={`px-2 py-0.5 text-xs rounded-lg font-medium ${statusColors[item.status]}`}>{LEARNING_STATUS_LABELS[item.status]}</span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-text-muted flex-wrap">
            <span>{item.provider}</span>
            {getLearningCategoriesForItem(data, item).map((cat) => <span key={cat.id} className="px-1.5 py-0.5 rounded-md text-[10px]" style={{ backgroundColor: cat.color + '18', color: cat.color }}>{cat.name}</span>)}
            {item.level && <><span>·</span><span className="capitalize">{item.level}</span></>}
            {project && <><span>·</span><button onClick={() => navigate('project-detail', project.id)} className="text-primary hover:underline">{project.title}</button></>}
          </div>
        </div>
      </div>

      <div className="bg-accent/5 border border-accent/15 rounded-2xl p-4">
        <div className="flex items-center gap-2"><ChevronRight size={16} className="text-accent" /><span className="text-xs font-medium text-accent uppercase tracking-wide">Sonraki Adım</span></div>
        <p className="text-sm mt-1 font-medium">{item.nextStep || <span className="text-text-muted italic">Belirlenmemiş</span>}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-2.5 bg-primary/10 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${moduleProgress === 100 ? 'bg-success' : 'bg-gradient-to-r from-accent to-warm'}`} style={{ width: `${moduleProgress}%` }} />
        </div>
        <span className="text-sm font-medium">%{moduleProgress}</span>
        {modules.length > 0 && <span className="text-xs text-text-muted">{completedModules}/{modules.length} modül</span>}
      </div>

      <div className="flex gap-1 border-b border-border-light dark:border-border-dark overflow-x-auto">
        {[{ id: 'overview', label: 'Genel', icon: BookOpen }, { id: 'modules', label: 'Modüller', icon: ListChecks }, { id: 'notes', label: 'Notlar', icon: StickyNote }].map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text-dark dark:hover:text-white'}`}>
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-4">
            {item.summary && <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-4"><h3 className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">Özet</h3><p className="text-sm">{item.summary}</p></div>}
            {item.keyOutcomes && <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-4"><h3 className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">Öğrenilenler</h3><p className="text-sm">{item.keyOutcomes}</p></div>}
          </div>
          <div className="space-y-4">
            <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-4">
              <h3 className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">Detaylar</h3>
              <div className="space-y-2 text-sm">
                {item.startDate && <p><span className="text-text-muted">Başlangıç:</span> {item.startDate}</p>}
                {item.targetFinishDate && <p><span className="text-text-muted">Hedef:</span> {item.targetFinishDate}</p>}
                {item.totalDurationMinutes > 0 && <p><span className="text-text-muted">Süre:</span> {Math.round(item.totalDurationMinutes / 60)}s</p>}
                {item.priceAmount > 0 && <p><span className="text-text-muted">Fiyat:</span> {item.priceAmount} {item.currency}</p>}
                {item.sourceLink && <a href={item.sourceLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline"><ExternalLink size={13} /> Kaynak</a>}
              </div>
            </div>
            {(() => { const sched = getLearningSchedule(data, item.id); return sched ? (
              <div className="bg-accent/5 border border-accent/15 rounded-xl p-4">
                <h3 className="text-xs font-medium text-accent mb-2 uppercase tracking-wide">Program</h3>
                <p className="text-sm font-medium">{SCHEDULE_TYPE_LABELS[sched.scheduleType]}</p>
                {sched.scheduleType === 'weekly' && sched.weeklyDays?.length > 0 && (
                  <p className="text-xs text-text-muted mt-1">{sched.weeklyDays.map((d) => DAY_LABELS[d % 7]).join(', ')} {sched.weeklyTimeStart && `· ${sched.weeklyTimeStart}-${sched.weeklyTimeEnd}`}</p>
                )}
              </div>
            ) : null; })()}
          </div>
        </div>
      )}

      {activeTab === 'modules' && (
        <div className="space-y-2">
          {modules.map((mod) => (
            <div key={mod.id} className={`flex items-center gap-3 p-3 rounded-xl border border-border-light dark:border-border-dark ${mod.status === 'completed' ? 'bg-success/5' : 'bg-surface dark:bg-surface-dark-alt'}`}>
              <button onClick={() => toggleModule(mod)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${mod.status === 'completed' ? 'bg-success border-success text-white' : 'border-border-light dark:border-border-dark hover:border-accent'}`}>
                {mod.status === 'completed' && <Check size={12} />}
              </button>
              <span className="text-xs text-text-muted font-mono">#{mod.moduleOrder}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${mod.status === 'completed' ? 'line-through text-text-muted' : ''}`}>{mod.title}</p>
                {mod.durationMinutes > 0 && <p className="text-[10px] text-text-muted">{mod.durationMinutes}dk</p>}
              </div>
            </div>
          ))}
          {modules.length === 0 && <p className="text-sm text-text-muted text-center py-6">Modül tanımlanmamış</p>}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addNote()} placeholder="Eğitim notu ekle..." className="flex-1 px-4 py-2.5 bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
            <button onClick={addNote} className="px-4 py-2.5 bg-accent text-white rounded-xl text-sm"><Plus size={16} /></button>
          </div>
          {notes.map((note) => (
            <div key={note.id} className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-4">
              <p className="text-sm font-medium">{note.title}</p>
              {note.content && <p className="text-xs text-text-muted mt-1">{note.content}</p>}
              <p className="text-[10px] text-text-muted mt-2">{note.createdAt}</p>
            </div>
          ))}
          {notes.length === 0 && <p className="text-sm text-text-muted text-center py-6">Henüz not yok</p>}
        </div>
      )}
    </div>
  );
}
