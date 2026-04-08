import { useState } from 'react';
import { ArrowLeft, ExternalLink, Plus, Trash2, Check, X, Link2, ListChecks, StickyNote, FileText, Brain, Milestone, ChevronRight, AlertTriangle, Layers, Star, Globe, GitBranch, FolderOpen, User, Phone } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { PROJECT_STATUS_LABELS, PRIORITY_LABELS, PROJECT_TYPE_LABELS, PROJECT_CATEGORY_LABELS, STAGE_STATUS_LABELS, getProjectTasks, getProjectPhases, getProjectNotes, getProjectPrompts, getProjectDecisions, getProjectReviews, getProjectAssets, getProjectStages, getProjectProgress, initProjectStages, TASK_STATUS_LABELS } from '../store';

const tabs = [
  { id: 'overview', label: 'Genel', icon: FileText },
  { id: 'stages', label: 'Aşamalar', icon: Layers },
  { id: 'tasks', label: 'Görevler', icon: ListChecks },
  { id: 'phases', label: 'Fazlar', icon: Milestone },
  { id: 'notes', label: 'Notlar', icon: StickyNote },
  { id: 'prompts', label: 'Promptlar', icon: Brain },
  { id: 'assets', label: 'Kaynaklar', icon: Link2 },
];

const statusColors = {
  idea: 'bg-warm/10 text-warm', planning: 'bg-primary/10 text-primary', active: 'bg-accent/10 text-accent',
  on_hold: 'bg-warm-light/30 text-text-muted', blocked: 'bg-danger/10 text-danger', completed: 'bg-success/10 text-success',
};

const stageStatusColors = {
  not_started: 'border-border-light dark:border-border-dark bg-surface dark:bg-surface-dark',
  in_progress: 'border-accent bg-accent/5',
  completed: 'border-success bg-success/5',
  skipped: 'border-warm-light/50 bg-warm-light/10',
};

export default function ProjectDetail({ data, projectId, update, remove, navigate }) {
  const project = data.projects.find((p) => p.id === projectId);
  const [activeTab, setActiveTab] = useState('overview');
  const [newTask, setNewTask] = useState('');
  const [newNote, setNewNote] = useState('');
  const [editingNextStep, setEditingNextStep] = useState(false);
  const [nextStepText, setNextStepText] = useState('');
  const [newStageName, setNewStageName] = useState('');

  if (!project) return <p className="text-text-muted">Proje bulunamadı.</p>;

  const tasks = getProjectTasks(data, projectId);
  const phases = getProjectPhases(data, projectId);
  const notes = getProjectNotes(data, projectId);
  const prompts = getProjectPrompts(data, projectId);
  const decisions = getProjectDecisions(data, projectId);
  const assets = getProjectAssets(data, projectId);
  let stages = getProjectStages(data, projectId);
  const progress = getProjectProgress(data, projectId);
  const today = new Date().toISOString().slice(0, 10);

  const ensureStages = () => {
    if (stages.length === 0) {
      const newStages = initProjectStages(projectId, project.projectType);
      newStages.forEach((s) => update('projectStages', s));
      stages = newStages;
    }
  };

  const updateProject = (changes) => update('projects', { ...project, ...changes, updatedAt: today });

  const cycleStageStatus = (stage) => {
    const order = ['not_started', 'in_progress', 'completed', 'skipped'];
    const idx = order.indexOf(stage.status);
    const next = order[(idx + 1) % order.length];
    update('projectStages', { ...stage, status: next, completedAt: next === 'completed' ? today : null });
  };

  const addStage = () => {
    if (!newStageName.trim()) return;
    const maxOrder = stages.length ? Math.max(...stages.map((s) => s.order)) : 0;
    update('projectStages', { id: uuidv4(), projectId, templateId: null, title: newStageName.trim(), description: '', order: maxOrder + 1, status: 'not_started', completedAt: null, createdAt: today });
    setNewStageName('');
  };

  const toggleTask = (task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    update('tasks', { ...task, status: newStatus, completedAt: newStatus === 'completed' ? today : null, updatedAt: today });
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    update('tasks', { id: uuidv4(), projectId, phaseId: null, learningItemId: null, parentTaskId: null, title: newTask.trim(), description: '', status: 'todo', priority: 'medium', energyLevel: 'medium', estimatedMinutes: null, actualMinutes: null, dueDate: null, startDate: null, completedAt: null, isToday: false, isNextStep: false, isRecurring: false, blockedReason: '', resultNote: '', tags: [], createdAt: today, updatedAt: today });
    setNewTask('');
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    update('notes', { id: uuidv4(), brandId: null, projectId, phaseId: null, taskId: null, learningItemId: null, title: newNote.trim(), noteType: 'project_note', content: '', summary: '', importanceLevel: 'medium', decisionFlag: false, nextAction: '', sourceType: 'manual', sourceLink: '', tags: [], createdAt: today, updatedAt: today });
    setNewNote('');
  };

  const saveNextStep = () => { updateProject({ nextStep: nextStepText }); setEditingNextStep(false); };

  const completedStages = stages.filter((s) => s.status === 'completed').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate('projects')} className="p-2 rounded-xl hover:bg-primary/10 mt-1"><ArrowLeft size={18} /></button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold">{project.title}</h1>
            {project.featured && <Star size={14} className="text-warm fill-warm" />}
            <span className={`px-2 py-0.5 text-xs rounded-lg font-medium ${statusColors[project.status]}`}>{PROJECT_STATUS_LABELS[project.status]}</span>
            {project.portfolio && <span className="px-2 py-0.5 text-[10px] rounded-lg font-medium bg-primary/10 text-primary border border-primary/20">Portfolyo</span>}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-text-muted flex-wrap">
            <span>{PRIORITY_LABELS[project.priority]}</span>
            <span>·</span>
            <span>{PROJECT_TYPE_LABELS[project.projectType]}</span>
            {project.category && <><span>·</span><span>{PROJECT_CATEGORY_LABELS[project.category] || project.category}</span></>}
            {project.languages?.length > 0 && <><span>·</span><span>{project.languages.join(', ')}</span></>}
          </div>
        </div>
      </div>

      {/* Highlight (from Proje 1) */}
      {project.highlight && (
        <div className="bg-warm/5 border border-warm/20 rounded-xl px-4 py-3">
          <p className="text-sm text-warm font-medium">{project.highlight}</p>
        </div>
      )}

      {/* Next Step */}
      <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><ChevronRight size={16} className="text-primary" /><span className="text-xs font-medium text-primary uppercase tracking-wide">Sonraki Adım</span></div>
          <button onClick={() => { setEditingNextStep(true); setNextStepText(project.nextStep || ''); }} className="text-xs text-primary hover:underline">Düzenle</button>
        </div>
        {editingNextStep ? (
          <div className="flex gap-2 mt-2">
            <input type="text" value={nextStepText} onChange={(e) => setNextStepText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveNextStep()} className="flex-1 px-3 py-2 bg-surface dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" autoFocus />
            <button onClick={saveNextStep} className="p-2 text-success"><Check size={16} /></button>
            <button onClick={() => setEditingNextStep(false)} className="p-2 text-text-muted"><X size={16} /></button>
          </div>
        ) : (
          <p className="text-sm mt-1 font-medium">{project.nextStep || <span className="text-text-muted italic">Belirlenmemiş</span>}</p>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2.5 bg-primary/10 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${progress === 100 ? 'bg-success' : 'bg-gradient-to-r from-primary to-teal'}`} style={{ width: `${progress}%` }} />
        </div>
        <span className="text-sm font-medium">%{progress}</span>
        {stages.length > 0 && <span className="text-xs text-text-muted">{completedStages}/{stages.length} aşama</span>}
      </div>

      {/* Stats row (from Proje 1) */}
      {(project.pages > 0 || project.components > 0) && (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-3 text-center">
            <p className="text-lg font-bold">{project.pages || 0}</p>
            <p className="text-[10px] text-text-muted">Sayfa</p>
          </div>
          <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-3 text-center">
            <p className="text-lg font-bold">{project.components || 0}</p>
            <p className="text-[10px] text-text-muted">Component</p>
          </div>
          <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-3 text-center">
            <p className="text-lg font-bold">{completedTasks}/{tasks.length}</p>
            <p className="text-[10px] text-text-muted">Görev</p>
          </div>
          <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-3 text-center">
            <p className="text-lg font-bold">{project.languages?.length || 0}</p>
            <p className="text-[10px] text-text-muted">Dil</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border-light dark:border-border-dark overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); if (tab.id === 'stages') ensureStages(); }} className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-dark dark:hover:text-white'}`}>
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* STAGES TAB */}
      {activeTab === 'stages' && (
        <div className="space-y-3">
          <p className="text-xs text-text-muted">Tıklayarak durumu değiştirin: Başlanmadı → Devam Ediyor → Tamamlandı → Atlandı</p>
          {stages.map((stage) => (
            <div key={stage.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${stageStatusColors[stage.status]}`} onClick={() => cycleStageStatus(stage)}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${stage.status === 'completed' ? 'bg-success text-white' : stage.status === 'in_progress' ? 'bg-accent text-white' : stage.status === 'skipped' ? 'bg-warm-light/50 text-text-muted' : 'bg-primary/10 text-text-muted'}`}>
                {stage.status === 'completed' ? <Check size={16} /> : stage.order}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${stage.status === 'completed' || stage.status === 'skipped' ? 'line-through text-text-muted' : ''}`}>{stage.title}</p>
                <p className="text-[10px] text-text-muted">{STAGE_STATUS_LABELS[stage.status]}{stage.completedAt ? ` · ${stage.completedAt}` : ''}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); remove('projectStages', stage.id); }} className="p-1 text-text-muted hover:text-danger shrink-0"><Trash2 size={13} /></button>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input type="text" value={newStageName} onChange={(e) => setNewStageName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addStage()} placeholder="Yeni aşama ekle..." className="flex-1 px-4 py-2.5 bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button onClick={addStage} className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium"><Plus size={16} /></button>
          </div>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-4">
            {project.fullDescription && <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-4"><h3 className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">Açıklama</h3><p className="text-sm leading-relaxed">{project.fullDescription}</p></div>}
            {project.objective && <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-4"><h3 className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">Hedef</h3><p className="text-sm">{project.objective}</p></div>}
            {/* Tech Stack (from Proje 1) */}
            {(project.techStack?.length > 0 || project.toolsServices?.length > 0) && (
              <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-4">
                <h3 className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">Teknoloji & Araçlar</h3>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(project.techStack || []).map((t) => <span key={t} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg">{t}</span>)}
                </div>
                {project.toolsServices?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {project.toolsServices.map((t) => <span key={t} className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-lg">{t}</span>)}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="space-y-4">
            {(project.currentBlockers || project.risks) && (
              <div className="bg-danger/5 border border-danger/15 rounded-xl p-4">
                {project.currentBlockers && <><h3 className="text-xs font-medium text-danger mb-1 uppercase flex items-center gap-1"><AlertTriangle size={12} /> Engeller</h3><p className="text-sm mb-2">{project.currentBlockers}</p></>}
                {project.risks && <><h3 className="text-xs font-medium text-warm mb-1 uppercase">Riskler</h3><p className="text-sm">{project.risks}</p></>}
              </div>
            )}
            {/* Links & Metadata (from Proje 1) */}
            <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-4">
              <h3 className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">Proje Bilgileri</h3>
              <div className="space-y-2 text-sm">
                {project.siteUrl && <a href={project.siteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline"><Globe size={13} /> {project.siteUrl}</a>}
                {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline"><GitBranch size={13} /> GitHub</a>}
                {project.folderPath && <p className="flex items-center gap-2 text-text-muted"><FolderOpen size={13} /> <code className="text-xs bg-surface-alt dark:bg-surface-dark px-2 py-0.5 rounded">{project.folderPath}</code></p>}
                {project.client && <p className="flex items-center gap-2 text-text-muted"><User size={13} /> {project.client}</p>}
                {project.clientContact && <p className="flex items-center gap-2 text-text-muted"><Phone size={13} /> {project.clientContact}</p>}
                <p className="text-xs text-text-muted">Oluşturulma: {project.createdAt}</p>
                <p className="text-xs text-text-muted">Son güncelleme: {project.updatedAt}</p>
              </div>
            </div>
            {/* Tags */}
            <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-4">
              <h3 className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">Etiketler</h3>
              <div className="flex flex-wrap gap-1.5">{(project.tags || []).map((tag) => <span key={tag} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg">{tag}</span>)}</div>
            </div>
            {decisions.length > 0 && (
              <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-4">
                <h3 className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">Kararlar</h3>
                {decisions.map((d) => <div key={d.id} className="py-2 border-b border-border-light dark:border-border-dark last:border-0"><p className="text-sm font-medium">{d.title}</p><p className="text-xs text-text-muted">{d.decisionText}</p></div>)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} placeholder="Yeni görev ekle..." className="flex-1 px-4 py-2.5 bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button onClick={addTask} className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium"><Plus size={16} /></button>
          </div>
          {tasks.map((task) => (
            <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border border-border-light dark:border-border-dark ${task.status === 'completed' ? 'bg-success/5' : 'bg-surface dark:bg-surface-dark-alt'}`}>
              <button onClick={() => toggleTask(task)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${task.status === 'completed' ? 'bg-success border-success text-white' : 'border-border-light dark:border-border-dark hover:border-primary'}`}>{task.status === 'completed' && <Check size={12} />}</button>
              <div className="flex-1 min-w-0"><p className={`text-sm ${task.status === 'completed' ? 'line-through text-text-muted' : ''}`}>{task.title}</p></div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${task.status === 'completed' ? 'bg-success/10 text-success' : 'bg-primary/10 text-text-muted'}`}>{TASK_STATUS_LABELS[task.status]}</span>
              <button onClick={() => remove('tasks', task.id)} className="p-1 text-text-muted hover:text-danger"><Trash2 size={13} /></button>
            </div>
          ))}
          {tasks.length === 0 && <p className="text-sm text-text-muted text-center py-6">Henüz görev yok</p>}
        </div>
      )}

      {/* PHASES TAB */}
      {activeTab === 'phases' && (
        <div className="space-y-3">
          {phases.map((phase) => (
            <div key={phase.id} className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-4">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-xs text-text-muted font-mono">#{phase.phaseOrder}</span><h3 className="font-medium text-sm">{phase.title}</h3></div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${phase.status === 'completed' ? 'bg-success/10 text-success' : phase.status === 'active' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-text-muted'}`}>{phase.status === 'completed' ? 'Tamamlandı' : phase.status === 'active' ? 'Aktif' : 'Planlandı'}</span></div>
              {phase.nextStep && <p className="text-xs text-primary mt-1">{phase.nextStep}</p>}
            </div>
          ))}
          {phases.length === 0 && <p className="text-sm text-text-muted text-center py-6">Faz yok</p>}
        </div>
      )}

      {/* NOTES TAB */}
      {activeTab === 'notes' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addNote()} placeholder="Hızlı not ekle..." className="flex-1 px-4 py-2.5 bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button onClick={addNote} className="px-4 py-2.5 bg-warm text-white rounded-xl text-sm font-medium"><Plus size={16} /></button>
          </div>
          {notes.map((note) => (
            <div key={note.id} className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-4">
              <p className="text-sm font-medium">{note.title}</p>
              {note.content && <p className="text-xs text-text-muted mt-1 line-clamp-3">{note.content}</p>}
              {note.nextAction && <p className="text-xs text-primary mt-1">{note.nextAction}</p>}
              <p className="text-[10px] text-text-muted mt-2">{note.createdAt}</p>
            </div>
          ))}
          {notes.length === 0 && <p className="text-sm text-text-muted text-center py-6">Henüz not yok</p>}
        </div>
      )}

      {/* PROMPTS TAB */}
      {activeTab === 'prompts' && (
        <div className="space-y-3">
          {prompts.map((p) => (
            <div key={p.id} className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-4">
              <p className="text-sm font-medium">{p.title}</p>
              <p className="text-xs text-text-muted mt-1 font-mono bg-surface-alt dark:bg-surface-dark p-2 rounded-lg line-clamp-3">{p.promptText}</p>
              {p.resultSummary && <p className="text-xs text-success mt-2">Sonuç: {p.resultSummary}</p>}
            </div>
          ))}
          {prompts.length === 0 && <p className="text-sm text-text-muted text-center py-6">Prompt yok</p>}
        </div>
      )}

      {/* ASSETS TAB */}
      {activeTab === 'assets' && (
        <div className="space-y-3">
          {assets.map((a) => (
            <div key={a.id} className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-4 flex items-center gap-3">
              <div className="flex-1"><p className="text-sm font-medium">{a.title}</p><p className="text-xs text-text-muted">{a.assetType}</p></div>
              {a.externalUrl && <a href={a.externalUrl} target="_blank" rel="noreferrer" className="p-2 text-primary hover:bg-primary/10 rounded-lg"><ExternalLink size={14} /></a>}
            </div>
          ))}
          {assets.length === 0 && <p className="text-sm text-text-muted text-center py-6">Kaynak yok</p>}
        </div>
      )}
    </div>
  );
}
