import { useState } from 'react';
import {
  ArrowLeft, ExternalLink, Plus, Trash2, Check, X, Link2, ListChecks, StickyNote, FileText, Brain, ChevronRight,
  AlertTriangle, Globe, GitBranch, FolderOpen, Building2, Briefcase, Tag, Layers, ShieldCheck, ShieldX, Calendar,
  Code, Languages, FileCode, Hash, Rocket, MessageSquareText,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {
  PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS, STATUS_COLORS, OWNER_COLORS,
  getProjectTasks, getProjectNotes, getProjectPrompts, getProjectAssets, getProjectStages,
  getProjectProgress, TASK_STATUS_LABELS, setProjectOverride,
} from '../store';

const tabs = [
  { id: 'overview', label: 'Genel', icon: FileText },
  { id: 'tasks', label: 'Görevler', icon: ListChecks },
  { id: 'notes', label: 'Notlar', icon: StickyNote },
  { id: 'prompts', label: 'Promptlar', icon: Brain },
  { id: 'assets', label: 'Kaynaklar', icon: Link2 },
];

export default function ProjectDetail({ data, projectId, update, remove, navigate, updateData, onEdit, onDelete }) {
  const project = data.projects.find((p) => p.id === projectId);
  const [activeTab, setActiveTab] = useState('overview');
  const [newTask, setNewTask] = useState('');
  const [newNote, setNewNote] = useState('');
  const [editingNextStep, setEditingNextStep] = useState(false);
  const [nextStepText, setNextStepText] = useState('');

  if (!project) return (
    <div className="space-y-3">
      <button onClick={() => navigate('projects')} className="p-2 rounded-xl hover:bg-primary/10 -ml-2 inline-flex items-center gap-1.5 text-sm"><ArrowLeft size={16} /> Projelere Dön</button>
      <p className="text-text-muted">Proje bulunamadı.</p>
    </div>
  );

  const tasks = getProjectTasks(data, projectId);
  const notes = getProjectNotes(data, projectId);
  const prompts = getProjectPrompts(data, projectId);
  const assets = getProjectAssets(data, projectId);
  const stages = getProjectStages(data, projectId);
  const progress = getProjectProgress(data, projectId);
  const today = new Date().toISOString().slice(0, 10);

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  const saveOverride = (patch) => updateData((d) => setProjectOverride(d, projectId, patch));

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
  const saveNextStep = () => { saveOverride({ nextStep: nextStepText }); setEditingNextStep(false); };

  const Field = ({ icon: Icon, label, value, mono, placeholder, link }) => (
    <div className="flex items-start gap-3 py-2 border-b border-border-light/50 dark:border-border-dark/50 last:border-0">
      {Icon && <Icon size={14} className="text-text-muted mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-text-muted">{label}</p>
        {value ? (
          link ? (
            <a href={link} target="_blank" rel="noreferrer" className={`text-sm text-primary hover:underline break-all ${mono ? 'font-mono text-xs' : ''}`}>{value}</a>
          ) : (
            <p className={`text-sm break-words ${mono ? 'font-mono text-xs bg-surface-alt dark:bg-surface-dark px-2 py-1 rounded mt-1 inline-block' : ''}`}>{value}</p>
          )
        ) : (
          <p className="text-xs text-text-muted/60 italic">{placeholder || '—'}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate('projects')} className="p-2 rounded-xl hover:bg-primary/10 mt-1"><ArrowLeft size={18} /></button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-text-muted/60">#{project.rowIndex}</span>
            <h1 className="text-xl md:text-2xl font-bold">{project.name}</h1>
            <span className={`px-2 py-0.5 text-xs rounded-lg font-medium border ${STATUS_COLORS[project.status]}`}>{project.progressStatusRaw || PROJECT_STATUS_LABELS[project.status]}</span>
            {project.publishOnOcianix === 'Evet' && (
              <span className="px-2 py-0.5 text-[10px] rounded-lg font-medium bg-success/10 text-success border border-success/20 flex items-center gap-1">
                <ShieldCheck size={11} /> Ocianix'te Yayınlanacak
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {project.ownerCompany && <span className={`px-2 py-0.5 text-[11px] rounded-md border ${OWNER_COLORS[project.ownerCompany] || 'bg-text-muted/10 text-text-muted border-text-muted/20'}`}>{project.ownerCompany}</span>}
            {project.projectTypeRaw && <span className="px-2 py-0.5 text-[11px] rounded-md bg-primary/10 text-primary">{project.projectTypeRaw}</span>}
            {project.businessArea && <span className="px-2 py-0.5 text-[11px] rounded-md bg-accent/10 text-accent">{project.businessArea}</span>}
            {project.subBusiness && project.subBusiness !== project.businessArea && (
              <span className="px-2 py-0.5 text-[11px] rounded-md bg-warm/10 text-warm">{project.subBusiness}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(project)}
              className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-dark transition-colors"
            >
              Düzenle
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(project)}
              className="px-3 py-1.5 bg-danger/10 text-danger border border-danger/20 rounded-lg text-xs font-medium hover:bg-danger/20 transition-colors"
            >
              Sil
            </button>
          )}
        </div>
      </div>

      {/* Description (H) */}
      {project.description && (
        <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5">
          <p className="text-sm leading-relaxed">{project.description}</p>
        </div>
      )}

      {/* General Note (M) */}
      {project.generalNote && (
        <div className="bg-warm/5 border border-warm/20 rounded-2xl p-4 flex items-start gap-3">
          <MessageSquareText size={16} className="text-warm mt-0.5" />
          <div>
            <p className="text-[10px] uppercase tracking-wide text-warm font-medium mb-0.5">Genel Açıklama (M)</p>
            <p className="text-sm">{project.generalNote}</p>
          </div>
        </div>
      )}

      {/* Next Step (override field) */}
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
      </div>

      {/* === EXCEL FIELDS — 4 SECTION GRID === */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Kimlik (A, B, D) */}
        <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={16} className="text-primary" />
            <h3 className="text-sm font-semibold">Kimlik</h3>
            <span className="text-[10px] text-text-muted ml-auto">A · B · D</span>
          </div>
          <Field icon={Briefcase} label="Projeyi Yapan İşletme (A)" value={project.makerCompany} />
          <Field icon={Building2} label="Proje Sahibi İşletme (B)" value={project.ownerCompany} />
          <Field
            icon={project.publishOnOcianix === 'Evet' ? ShieldCheck : project.publishOnOcianix === 'Hayır' ? ShieldX : null}
            label="Ocianix'te Yayınlanacak mı? (D)"
            value={project.publishOnOcianix}
            placeholder="Belirtilmemiş"
          />
        </div>

        {/* Sınıflandırma (C, E, F) */}
        <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={16} className="text-accent" />
            <h3 className="text-sm font-semibold">Sınıflandırma</h3>
            <span className="text-[10px] text-text-muted ml-auto">C · E · F</span>
          </div>
          <Field icon={Layers} label="Proje Türü (C)" value={project.projectTypeRaw} />
          <Field icon={Tag} label="İş Alanı (E)" value={project.businessArea} />
          <Field icon={Hash} label="İş Alt Kolu (F)" value={project.subBusiness} />
        </div>

        {/* Bağlantılar & Konum (I, J, K) */}
        <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={16} className="text-warm" />
            <h3 className="text-sm font-semibold">Bağlantılar & Konum</h3>
            <span className="text-[10px] text-text-muted ml-auto">I · J · K</span>
          </div>
          {project.websiteUrl ? (
            <Field icon={Globe} label="Web Sitesi (J)" value={project.websiteUrl} link={project.websiteUrl} />
          ) : (
            <Field icon={Globe} label="Web Sitesi (J)" value={project.websiteUrlPlaceholder} placeholder="Belirtilmemiş" />
          )}
          <Field icon={FolderOpen} label="Proje Dosya Yolu (I)" value={project.folderPath} mono />
          <Field icon={Calendar} label="Domain Bitiş Tarihi (K)" value={project.domainExpiry} />
        </div>

        {/* Durum & İlerleme (L) + Repo (auto) */}
        <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Rocket size={16} className="text-success" />
            <h3 className="text-sm font-semibold">Durum & İlerleme</h3>
            <span className="text-[10px] text-text-muted ml-auto">L</span>
          </div>
          <Field icon={Rocket} label="Proje İlerleme Durumu (L)" value={project.progressStatusRaw} />
          <div className="flex items-start gap-3 py-2 border-b border-border-light/50 dark:border-border-dark/50">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-text-muted">Tahmini İlerleme</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-teal rounded-full" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs font-medium">%{progress}</span>
              </div>
            </div>
          </div>
          {project.repo && <Field icon={GitBranch} label="GitHub Deposu (auto)" value={project.repo} link={project.repo} />}
          {project.lastActivity && <Field icon={Calendar} label="Son Aktivite (auto)" value={project.lastActivity} />}
        </div>
      </div>

      {/* Teknik Detaylar (scan-merged) */}
      {(project.stack?.length > 0 || project.languages?.length > 0 || project.pages > 0) && (
        <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Code size={16} className="text-primary" />
            <h3 className="text-sm font-semibold">Teknik Detaylar</h3>
            <span className="text-[10px] text-text-muted ml-auto">otomatik tarama</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div className="text-center bg-surface-alt/50 dark:bg-surface-dark/50 rounded-xl p-3">
              <p className="text-lg font-bold">{project.pages || 0}</p>
              <p className="text-[10px] text-text-muted">Sayfa</p>
            </div>
            <div className="text-center bg-surface-alt/50 dark:bg-surface-dark/50 rounded-xl p-3">
              <p className="text-lg font-bold">{project.components || 0}</p>
              <p className="text-[10px] text-text-muted">Component</p>
            </div>
            <div className="text-center bg-surface-alt/50 dark:bg-surface-dark/50 rounded-xl p-3">
              <p className="text-lg font-bold">{project.srcFiles || 0}</p>
              <p className="text-[10px] text-text-muted">Src Dosya</p>
            </div>
            <div className="text-center bg-surface-alt/50 dark:bg-surface-dark/50 rounded-xl p-3">
              <p className="text-lg font-bold">{project.totalFiles || 0}</p>
              <p className="text-[10px] text-text-muted">Toplam Dosya</p>
            </div>
          </div>
          {project.stack?.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center gap-1.5 mb-1.5"><FileCode size={12} className="text-text-muted" /><span className="text-[10px] uppercase tracking-wide text-text-muted">Stack</span></div>
              <div className="flex flex-wrap gap-1.5">
                {project.stack.map((s) => <span key={s} className="px-2 py-1 bg-primary/10 text-primary text-[11px] rounded-lg">{s}</span>)}
              </div>
            </div>
          )}
          {project.languages?.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5"><Languages size={12} className="text-text-muted" /><span className="text-[10px] uppercase tracking-wide text-text-muted">Diller</span></div>
              <div className="flex flex-wrap gap-1.5">
                {project.languages.map((l) => <span key={l} className="px-2 py-1 bg-accent/10 text-accent text-[11px] rounded-lg">{l}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border-light dark:border-border-dark overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-dark dark:hover:text-white'}`}>
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-4">
            <h3 className="text-xs font-medium text-text-muted mb-3 uppercase tracking-wide">Hızlı Bakış</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-primary/5 rounded-lg p-2"><p className="text-xl font-bold">{tasks.length}</p><p className="text-[9px] text-text-muted">Görev</p></div>
              <div className="bg-accent/5 rounded-lg p-2"><p className="text-xl font-bold">{notes.length}</p><p className="text-[9px] text-text-muted">Not</p></div>
              <div className="bg-warm/5 rounded-lg p-2"><p className="text-xl font-bold">{prompts.length}</p><p className="text-[9px] text-text-muted">Prompt</p></div>
            </div>
          </div>
          {(project.currentBlockers || project.risks) && (
            <div className="bg-danger/5 border border-danger/15 rounded-2xl p-4">
              {project.currentBlockers && <><h3 className="text-xs font-medium text-danger mb-1 uppercase flex items-center gap-1"><AlertTriangle size={12} /> Engeller</h3><p className="text-sm mb-2">{project.currentBlockers}</p></>}
              {project.risks && <><h3 className="text-xs font-medium text-warm mb-1 uppercase">Riskler</h3><p className="text-sm">{project.risks}</p></>}
            </div>
          )}
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
