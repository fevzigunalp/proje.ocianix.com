import { useState } from 'react';
import { X, FolderKanban, ListTodo, BookOpen, StickyNote, Brain } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { PROJECT_TYPES, PROJECT_TYPE_LABELS, PRIORITIES, PRIORITY_LABELS, NOTE_TYPES, NOTE_TYPE_LABELS, PROJECT_CATEGORIES, PROJECT_CATEGORY_LABELS, initProjectStages, SCHEDULE_TYPES, SCHEDULE_TYPE_LABELS, DAY_LABELS } from '../store';

const types = [
  { id: 'task', label: 'Görev', icon: ListTodo, color: 'text-accent' },
  { id: 'project', label: 'Proje', icon: FolderKanban, color: 'text-primary' },
  { id: 'learning', label: 'Eğitim', icon: BookOpen, color: 'text-warm' },
  { id: 'note', label: 'Not', icon: StickyNote, color: 'text-warm' },
  { id: 'prompt', label: 'Prompt', icon: Brain, color: 'text-purple' },
];

export default function QuickAdd({ type, setType, data, update, onClose }) {
  const today = new Date().toISOString().slice(0, 10);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskProject, setTaskProject] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDue, setTaskDue] = useState('');
  const [taskToday, setTaskToday] = useState(true);

  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projType, setProjType] = useState('website');
  const [projPriority, setProjPriority] = useState('medium');
  const [projCategory, setProjCategory] = useState('diger');
  const [projHighlight, setProjHighlight] = useState('');

  const [learnTitle, setLearnTitle] = useState('');
  const [learnProvider, setLearnProvider] = useState('');
  const [learnCategoryIds, setLearnCategoryIds] = useState([]);
  const [learnScheduleType, setLearnScheduleType] = useState('');
  const [learnWeeklyDays, setLearnWeeklyDays] = useState([]);
  const [learnTimeStart, setLearnTimeStart] = useState('');
  const [learnTimeEnd, setLearnTimeEnd] = useState('');
  const [learnScheduleDate, setLearnScheduleDate] = useState('');
  const [learnHoursPerWeek, setLearnHoursPerWeek] = useState(5);

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('quick_note');
  const [noteProject, setNoteProject] = useState('');

  const [promptTitle, setPromptTitle] = useState('');
  const [promptText, setPromptText] = useState('');
  const [promptProject, setPromptProject] = useState('');

  const submit = () => {
    if (type === 'task') {
      if (!taskTitle.trim()) return;
      update('tasks', { id: uuidv4(), projectId: taskProject || null, phaseId: null, learningItemId: null, parentTaskId: null, title: taskTitle.trim(), description: '', status: 'todo', priority: taskPriority, energyLevel: 'medium', estimatedMinutes: null, actualMinutes: null, dueDate: taskDue || null, startDate: null, completedAt: null, isToday: taskToday, isNextStep: false, isRecurring: false, blockedReason: '', resultNote: '', tags: [], createdAt: today, updatedAt: today });
    } else if (type === 'project') {
      if (!projTitle.trim()) return;
      const projId = uuidv4();
      update('projects', {
        id: projId, brandId: null, title: projTitle.trim(), slug: '', shortDescription: projDesc, fullDescription: projDesc, projectType: projType, priority: projPriority, status: 'idea', category: projCategory, stageSummary: '', objective: '', successCriteria: '', currentBlockers: '', risks: '', nextStep: '', startDate: today, targetDate: '', completedAt: null, tags: [], links: [],
        highlight: projHighlight, featured: false, portfolio: false, siteUrl: '', repoUrl: '', folderPath: '', techStack: [], toolsServices: [], pages: 0, components: 0, languages: [], client: '', clientContact: '', progress: 0,
        createdAt: today, updatedAt: today,
      });
      const stages = initProjectStages(projId, projType);
      stages.forEach((s) => update('projectStages', s));
    } else if (type === 'learning') {
      if (!learnTitle.trim()) return;
      const learnId = uuidv4();
      update('learningItems', { id: learnId, brandId: null, relatedProjectId: null, title: learnTitle.trim(), provider: learnProvider, instructorName: '', sourceLink: '', categoryIds: learnCategoryIds, level: 'beginner', status: 'planned', formatType: 'course', priceAmount: 0, currency: 'TRY', purchasedAt: null, startDate: '', targetFinishDate: '', completedAt: null, totalDurationMinutes: 0, progressPercent: 0, certificateAvailable: false, certificateUrl: '', summary: '', keyOutcomes: '', nextStep: '', reviewNote: '', tags: [], createdAt: today, updatedAt: today });
      if (learnScheduleType) {
        update('learningSchedules', { id: uuidv4(), learningItemId: learnId, scheduleType: learnScheduleType, date: learnScheduleType === 'one_time' ? learnScheduleDate : null, timeStart: learnTimeStart || null, timeEnd: learnTimeEnd || null, weeklyDays: learnScheduleType === 'weekly' ? learnWeeklyDays : [], weeklyTimeStart: learnTimeStart || null, weeklyTimeEnd: learnTimeEnd || null, monthlyDays: [], monthlyTimeStart: null, monthlyTimeEnd: null, customDates: [], customTimeStart: null, customTimeEnd: null, hoursPerWeek: learnScheduleType === 'flexible_hours' ? learnHoursPerWeek : 0, preferredDays: learnScheduleType === 'flexible_hours' ? learnWeeklyDays : [], isActive: true, startDate: today, endDate: null, reminderMinutes: 0, createdAt: today, updatedAt: today });
      }
    } else if (type === 'note') {
      if (!noteTitle.trim()) return;
      update('notes', { id: uuidv4(), brandId: null, projectId: noteProject || null, phaseId: null, taskId: null, learningItemId: null, title: noteTitle.trim(), noteType, content: noteContent, summary: '', importanceLevel: 'medium', decisionFlag: false, nextAction: '', sourceType: 'manual', sourceLink: '', tags: [], createdAt: today, updatedAt: today });
    } else if (type === 'prompt') {
      if (!promptTitle.trim()) return;
      update('prompts', { id: uuidv4(), projectId: promptProject || null, taskId: null, title: promptTitle.trim(), promptText, promptType: 'other', modelName: 'Claude', resultSummary: '', status: 'draft', createdAt: today, updatedAt: today });
    }
    onClose();
  };

  const inputClass = "w-full px-3 py-2.5 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";
  const selectClass = "px-3 py-2.5 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-sm focus:outline-none";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-surface dark:bg-surface-dark-alt rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark">
          <h2 className="font-semibold">Hızlı Ekle</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-primary/10"><X size={18} /></button>
        </div>

        <div className="flex gap-1 p-3 border-b border-border-light dark:border-border-dark overflow-x-auto">
          {types.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setType(t.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${type === t.id ? 'bg-primary text-white' : 'text-text-muted hover:bg-primary/5'}`}>
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 space-y-3">
          {type === 'task' && <>
            <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Görev adı *" className={inputClass} autoFocus onKeyDown={(e) => e.key === 'Enter' && submit()} />
            <select value={taskProject} onChange={(e) => setTaskProject(e.target.value)} className={`w-full ${selectClass}`}>
              <option value="">Proje seçin (opsiyonel)</option>
              {data.projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <div className="flex gap-3">
              <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)} className={`flex-1 ${selectClass}`}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
              </select>
              <input type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} className={`flex-1 ${selectClass}`} />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={taskToday} onChange={(e) => setTaskToday(e.target.checked)} className="accent-primary rounded" />
              Bugün yapılacak
            </label>
          </>}

          {type === 'project' && <>
            <input type="text" value={projTitle} onChange={(e) => setProjTitle(e.target.value)} placeholder="Proje adı *" className={inputClass} autoFocus />
            <input type="text" value={projDesc} onChange={(e) => setProjDesc(e.target.value)} placeholder="Kısa açıklama" className={inputClass} />
            <input type="text" value={projHighlight} onChange={(e) => setProjHighlight(e.target.value)} placeholder="Öne çıkan özellik" className={inputClass} />
            <div className="flex gap-3">
              <select value={projType} onChange={(e) => setProjType(e.target.value)} className={`flex-1 ${selectClass}`}>
                {PROJECT_TYPES.map((t) => <option key={t} value={t}>{PROJECT_TYPE_LABELS[t]}</option>)}
              </select>
              <select value={projCategory} onChange={(e) => setProjCategory(e.target.value)} className={`flex-1 ${selectClass}`}>
                {PROJECT_CATEGORIES.map((c) => <option key={c} value={c}>{PROJECT_CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <select value={projPriority} onChange={(e) => setProjPriority(e.target.value)} className={`w-full ${selectClass}`}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
            </select>
          </>}

          {type === 'learning' && <>
            <input type="text" value={learnTitle} onChange={(e) => setLearnTitle(e.target.value)} placeholder="Eğitim adı *" className={inputClass} autoFocus />
            <input type="text" value={learnProvider} onChange={(e) => setLearnProvider(e.target.value)} placeholder="Platform (YouTube, Udemy...)" className={inputClass} />
            <div>
              <p className="text-xs text-text-muted mb-1.5">Kategoriler</p>
              <div className="flex flex-wrap gap-1.5">
                {(data.learningCategories || []).map((cat) => {
                  const selected = learnCategoryIds.includes(cat.id);
                  return (
                    <button key={cat.id} type="button" onClick={() => setLearnCategoryIds(selected ? learnCategoryIds.filter((id) => id !== cat.id) : [...learnCategoryIds, cat.id])} className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${selected ? 'text-white' : 'border border-border-light dark:border-border-dark text-text-muted'}`} style={selected ? { backgroundColor: cat.color } : {}}>
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2 p-3 bg-surface-alt dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark">
              <p className="text-xs font-medium">Program (opsiyonel)</p>
              <select value={learnScheduleType} onChange={(e) => setLearnScheduleType(e.target.value)} className={`w-full ${selectClass}`}>
                <option value="">Program yok</option>
                {SCHEDULE_TYPES.map((t) => <option key={t} value={t}>{SCHEDULE_TYPE_LABELS[t]}</option>)}
              </select>
              {learnScheduleType === 'one_time' && <input type="date" value={learnScheduleDate} onChange={(e) => setLearnScheduleDate(e.target.value)} className={`w-full ${selectClass}`} />}
              {(learnScheduleType === 'weekly' || learnScheduleType === 'flexible_hours') && (
                <div className="flex gap-1 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                    const sel = learnWeeklyDays.includes(d);
                    return <button key={d} type="button" onClick={() => setLearnWeeklyDays(sel ? learnWeeklyDays.filter((x) => x !== d) : [...learnWeeklyDays, d])} className={`w-9 h-8 rounded-lg text-[10px] font-medium ${sel ? 'bg-accent text-white' : 'border border-border-light dark:border-border-dark text-text-muted'}`}>{DAY_LABELS[d]}</button>;
                  })}
                </div>
              )}
              {learnScheduleType === 'flexible_hours' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">Hafta/saat:</span>
                  <input type="number" min={1} max={40} value={learnHoursPerWeek} onChange={(e) => setLearnHoursPerWeek(Number(e.target.value))} className={`w-20 ${selectClass}`} />
                </div>
              )}
              {learnScheduleType && learnScheduleType !== 'flexible_hours' && (
                <div className="flex gap-2">
                  <input type="time" value={learnTimeStart} onChange={(e) => setLearnTimeStart(e.target.value)} className={`flex-1 ${selectClass}`} />
                  <input type="time" value={learnTimeEnd} onChange={(e) => setLearnTimeEnd(e.target.value)} className={`flex-1 ${selectClass}`} />
                </div>
              )}
            </div>
          </>}

          {type === 'note' && <>
            <input type="text" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="Not başlığı *" className={inputClass} autoFocus />
            <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder="İçerik..." rows={3} className={`${inputClass} resize-none`} />
            <div className="flex gap-3">
              <select value={noteType} onChange={(e) => setNoteType(e.target.value)} className={`flex-1 ${selectClass}`}>
                {NOTE_TYPES.map((t) => <option key={t} value={t}>{NOTE_TYPE_LABELS[t]}</option>)}
              </select>
              <select value={noteProject} onChange={(e) => setNoteProject(e.target.value)} className={`flex-1 ${selectClass}`}>
                <option value="">Proje seçin</option>
                {data.projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
          </>}

          {type === 'prompt' && <>
            <input type="text" value={promptTitle} onChange={(e) => setPromptTitle(e.target.value)} placeholder="Prompt başlığı *" className={inputClass} autoFocus />
            <textarea value={promptText} onChange={(e) => setPromptText(e.target.value)} placeholder="Prompt metni..." rows={4} className={`${inputClass} resize-none font-mono text-xs`} />
            <select value={promptProject} onChange={(e) => setPromptProject(e.target.value)} className={`w-full ${selectClass}`}>
              <option value="">Proje seçin (opsiyonel)</option>
              {data.projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </>}

          <button onClick={submit} className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium transition-colors">
            Ekle
          </button>
        </div>
      </div>
    </div>
  );
}
