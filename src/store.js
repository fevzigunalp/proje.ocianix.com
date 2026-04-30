import { v4 as uuidv4 } from 'uuid';
import { fetchProjectsFromSheet, upsertProjectToSheet, deleteProjectFromSheet, fetchTabRecords, upsertRecord, deleteRecord, isLiveMode, getPollSeconds } from './sheetSync';

const STORAGE_KEY = 'ocianix-ops-v2';
const FOCUS_KEY = 'ocianix-ops-focus';

// ============ EXCEL-ALIGNED ENUMS ============
// L kolonu (Proje İlerleme Durumu) — Excel'deki sıralama
export const PROJECT_STATUSES = ['idea', 'draft', 'in_progress', 'paused', 'optimization', 'live'];
export const PROJECT_STATUS_LABELS = {
  idea: 'Fikir Aşamasında',
  draft: 'Taslakta Başlanacak',
  in_progress: 'Yapım Aşamasında',
  paused: 'Ara Verildi',
  optimization: 'Optimizasyonları Kaldı',
  live: 'Bitti - Yayında',
};
export const PROJECT_STATUS_ORDER = { idea: 0, draft: 1, in_progress: 2, paused: 3, optimization: 4, live: 5 };

// C kolonu (Proje Türü)
export const PROJECT_TYPES = ['website', 'saas', 'app', 'automation', 'other'];
export const PROJECT_TYPE_LABELS = {
  website: 'Web Sitesi',
  saas: 'SaaS',
  app: 'Uygulama',
  automation: 'Otomasyon',
  other: 'Diğer',
};

// D kolonu (Yayınlanacak mı)
export const PUBLISH_OPTIONS = ['Evet', 'Hayır'];

// ============ TASK / OTHER ENUMS (kept for ops layer) ============
export const PRIORITIES = ['critical', 'high', 'medium', 'low'];
export const TASK_STATUSES = ['todo', 'in_progress', 'waiting', 'review', 'completed', 'cancelled'];
export const ENERGY_LEVELS = ['deep', 'medium', 'light'];
export const LEARNING_STATUSES = ['planned', 'purchased', 'not_started', 'in_progress', 'paused', 'completed', 'revisit'];
export const LEARNING_FORMATS = ['course', 'youtube_series', 'workshop', 'bootcamp', 'article_series', 'mentorship', 'book', 'documentation', 'other'];
export const LEARNING_LEVELS = ['beginner', 'intermediate', 'advanced'];
export const NOTE_TYPES = ['quick_note', 'project_note', 'learning_note', 'idea', 'decision', 'meeting_note', 'prompt_summary', 'issue_solution', 'research_note'];
export const ASSET_TYPES = ['pdf', 'doc', 'image', 'video', 'link', 'github', 'drive', 'prompt', 'checklist', 'spreadsheet', 'other'];
export const REVIEW_TYPES = ['daily', 'weekly', 'monthly', 'milestone', 'learning_review'];
export const SCHEDULE_TYPES = ['one_time', 'weekly', 'monthly', 'custom_days', 'flexible_hours'];
export const FOCUS_MODES = ['project', 'learning', 'mixed', 'admin', 'deep_work'];

// ============ LABEL MAPS ============
export const PRIORITY_LABELS = { critical: 'Kritik', high: 'Yüksek', medium: 'Orta', low: 'Düşük' };
export const TASK_STATUS_LABELS = { todo: 'Yapılacak', in_progress: 'Devam Ediyor', waiting: 'Beklemede', review: 'İnceleme', completed: 'Tamamlandı', cancelled: 'İptal' };
export const LEARNING_STATUS_LABELS = { planned: 'Planlandı', purchased: 'Satın Alındı', not_started: 'Başlanmadı', in_progress: 'Devam Ediyor', paused: 'Donduruldu', completed: 'Tamamlandı', revisit: 'Tekrar Edilecek' };
export const NOTE_TYPE_LABELS = { quick_note: 'Hızlı Not', project_note: 'Proje Notu', learning_note: 'Eğitim Notu', idea: 'Fikir', decision: 'Karar', meeting_note: 'Toplantı', prompt_summary: 'Prompt Özeti', issue_solution: 'Problem/Çözüm', research_note: 'Araştırma' };
export const REVIEW_TYPE_LABELS = { daily: 'Günlük', weekly: 'Haftalık', monthly: 'Aylık', milestone: 'Milestone', learning_review: 'Eğitim' };
export const ENERGY_LABELS = { deep: 'Derin', medium: 'Orta', light: 'Hafif' };
export const SCHEDULE_TYPE_LABELS = { one_time: 'Tek Seferlik', weekly: 'Haftalık', monthly: 'Aylık', custom_days: 'Özel Günler', flexible_hours: 'Esnek Saat' };
export const FOCUS_MODE_LABELS = { project: 'Proje Odak', learning: 'Eğitim Odak', mixed: 'Karışık', admin: 'Admin', deep_work: 'Derin Çalışma' };
export const FOCUS_MODE_ICONS = { project: '🎯', learning: '📚', mixed: '🔄', admin: '📋', deep_work: '🧠' };
export const DAY_LABELS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

// ============ STATUS COLORS (badge classes) ============
export const STATUS_COLORS = {
  idea: 'bg-warm-light/30 text-text-muted border-warm-light/40',
  draft: 'bg-warm/10 text-warm border-warm/20',
  in_progress: 'bg-accent/10 text-accent border-accent/20',
  paused: 'bg-orange/10 text-orange border-orange/20',
  optimization: 'bg-primary/10 text-primary border-primary/20',
  live: 'bg-success/10 text-success border-success/20',
};

export const TYPE_COLORS = {
  website: 'bg-primary/10 text-primary',
  saas: 'bg-accent/10 text-accent',
  app: 'bg-warm/10 text-warm',
  automation: 'bg-purple/10 text-purple',
  other: 'bg-text-muted/10 text-text-muted',
};

export const OWNER_COLORS = {
  Ocianix: 'bg-primary/10 text-primary border-primary/20',
  Synovrix: 'bg-purple/10 text-purple border-purple/20',
  'The Véloria': 'bg-warm/10 text-warm border-warm/20',
  'Fevzi Günalp': 'bg-accent/10 text-accent border-accent/20',
};

// ============ DEFAULT LEARNING CATEGORIES ============
export function createDefaultLearningCategories() {
  const cats = [
    { name: 'Frontend', slug: 'frontend', color: '#5a8a6a' },
    { name: 'Backend', slug: 'backend', color: '#3d6b4d' },
    { name: 'DevOps', slug: 'devops', color: '#6a9e8a' },
    { name: 'AI/ML', slug: 'ai-ml', color: '#c27a7a' },
    { name: 'Claude', slug: 'claude', color: '#8a7ac2' },
    { name: 'Mobil', slug: 'mobile', color: '#c49a5c' },
    { name: 'Veritabanı', slug: 'database', color: '#5aaa8a' },
    { name: 'Tasarım', slug: 'design', color: '#c4a24e' },
    { name: 'SEO', slug: 'seo', color: '#74a684' },
    { name: 'İşletme', slug: 'business', color: '#c27a7a' },
    { name: 'Otomasyon', slug: 'automation', color: '#c49a5c' },
    { name: 'Kişisel Gelişim', slug: 'personal', color: '#8a7ac2' },
  ];
  return cats.map((c) => ({ id: uuidv4(), ...c, icon: '', isDefault: true, createdAt: '2026-01-01' }));
}

// ============ HELPERS ============
const now = () => new Date().toISOString().slice(0, 10);

// Apply project overrides (user-edited fields like nextStep, blockers) on top of canonical Excel data
export function applyProjectOverride(project, overrides) {
  const override = overrides?.[project.id] || {};
  return { ...project, ...override };
}

// Decorate a project with backwards-compat fields used elsewhere
export function decorateProject(p) {
  return {
    ...p,
    title: p.name,
    shortDescription: p.description || '',
    fullDescription: p.description || '',
    siteUrl: p.websiteUrl || '',
    repoUrl: p.repo || '',
    techStack: p.stack || [],
    updatedAt: p.lastActivity || p.createdAt || '',
    priority: p.priority || (p.status === 'live' ? 'high' : p.status === 'in_progress' ? 'high' : 'medium'),
    category: p.businessArea || '',
    projectType: p.projectType || 'other',
    featured: p.featured || false,
  };
}

// ============ LOAD / SAVE ============
function createDefaultStructure() {
  return {
    projects: [],
    projectOverrides: {},
    projectStages: [],
    phases: [],
    tasks: [],
    learningCategories: createDefaultLearningCategories(),
    learningItems: [],
    learningModules: [],
    learningSchedules: [],
    notes: [],
    assets: [],
    reviews: [],
    prompts: [],
    decisions: [],
    tags: [],
    alertDismissals: {},
  };
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      const defaults = createDefaultStructure();
      for (const key of Object.keys(defaults)) {
        if (data[key] == null) data[key] = defaults[key];
      }
      return data;
    }
  } catch {}
  const data = createDefaultStructure();
  saveData(data);
  return data;
}

// Async: fetch projects (from Sheet API in live mode, fallback to /projects.json).
// Caller supplies a setData updater. Returns the source descriptor or null.
export async function fetchProjectsAndApply(setData) {
  try {
    const { source, projects: arr } = await fetchProjectsFromSheet();
    if (!Array.isArray(arr)) return null;
    setData((d) => {
      const overrides = d.projectOverrides || {};
      const projects = arr.map((p) => applyProjectOverride(decorateProject(p), overrides));
      return { ...d, projects, _projectSource: source, _projectSyncedAt: new Date().toISOString() };
    });
    return { source, count: arr.length };
  } catch (err) {
    console.warn('[sync] fetch failed:', err);
    return null;
  }
}

// Polling helper — re-fetch every N seconds when live mode is on.
// Returns a cleanup function.
export function startProjectPolling(setData) {
  let cancelled = false;
  let timer = null;
  const tick = async () => {
    if (cancelled) return;
    if (isLiveMode()) await fetchProjectsAndApply(setData);
    timer = setTimeout(tick, Math.max(5, getPollSeconds()) * 1000);
  };
  // first run after delay; initial load is handled separately on mount
  timer = setTimeout(tick, Math.max(5, getPollSeconds()) * 1000);
  return () => { cancelled = true; if (timer) clearTimeout(timer); };
}

// Persist a project edit/create to the Sheet, then re-fetch to refresh local state.
export async function pushProject(setData, project) {
  if (isLiveMode()) {
    await upsertProjectToSheet(project);
    await fetchProjectsAndApply(setData);
  } else {
    // No live sheet — just update local state
    setData((d) => {
      const list = d.projects || [];
      const exists = list.some((p) => p.id === project.id);
      const next = exists ? list.map((p) => (p.id === project.id ? { ...p, ...project } : p)) : [...list, decorateProject(project)];
      return { ...d, projects: next };
    });
  }
}

// ============================================================================
// GÖREVLER — Sheet ↔ site
// ============================================================================
// Sheet'te Türkçe enum'lar (mimari kararı). Kod tabanı (TaskList vs) eski İngilizce
// enum'ları kullanıyor → boundary'de translate ediyoruz.

const TASK_STATUS_TR_TO_EN = {
  'yapılacak': 'todo', 'devam-ediyor': 'in_progress', 'beklemede': 'waiting',
  'incelemede': 'review', 'tamamlandı': 'completed', 'iptal': 'cancelled',
};
const TASK_STATUS_EN_TO_TR = Object.fromEntries(
  Object.entries(TASK_STATUS_TR_TO_EN).map(([k, v]) => [v, k])
);
const TASK_PRIO_TR_TO_EN = { 'kritik': 'critical', 'yüksek': 'high', 'orta': 'medium', 'düşük': 'low' };
const TASK_PRIO_EN_TO_TR = Object.fromEntries(
  Object.entries(TASK_PRIO_TR_TO_EN).map(([k, v]) => [v, k])
);
const TASK_ENERGY_TR_TO_EN = { 'derin': 'deep', 'orta': 'medium', 'hafif': 'light' };
const TASK_ENERGY_EN_TO_TR = Object.fromEntries(
  Object.entries(TASK_ENERGY_TR_TO_EN).map(([k, v]) => [v, k])
);

// Sheet'ten gelen task'ı kod tabanı için decorate et: TR→EN enum + alias projectId
export function decorateTask(t) {
  return {
    ...t,
    status: TASK_STATUS_TR_TO_EN[t.status] || t.status || 'todo',
    priority: TASK_PRIO_TR_TO_EN[t.priority] || t.priority || 'medium',
    energyLevel: TASK_ENERGY_TR_TO_EN[t.energyLevel] || t.energyLevel || 'medium',
    // backward-compat aliases — eski TaskList projectId/learningItemId kullanıyor
    projectId: t.relatedProjectId || t.projectId || null,
    learningItemId: t.relatedLearningId || t.learningItemId || null,
    parentTaskId: t.dependsOnTaskId || t.parentTaskId || null,
    tags: Array.isArray(t.tags) ? t.tags : (typeof t.tags === 'string' && t.tags ? t.tags.split(',').map(s => s.trim()).filter(Boolean) : []),
  };
}

// Site → Sheet: EN enum + canonical alan adları
export function serializeTaskForSheet(t) {
  return {
    id: t.id,
    title: t.title || '',
    description: t.description || '',
    status: TASK_STATUS_EN_TO_TR[t.status] || t.status || 'yapılacak',
    priority: TASK_PRIO_EN_TO_TR[t.priority] || t.priority || 'orta',
    energyLevel: TASK_ENERGY_EN_TO_TR[t.energyLevel] || t.energyLevel || 'orta',
    isToday: !!t.isToday,
    isNextStep: !!t.isNextStep,
    estimatedMinutes: t.estimatedMinutes ?? null,
    actualMinutes: t.actualMinutes ?? null,
    startDate: t.startDate || '',
    dueDate: t.dueDate || '',
    completedAt: t.completedAt || '',
    blockedReason: t.blockedReason || '',
    dependsOnTaskId: t.dependsOnTaskId || t.parentTaskId || '',
    resultNote: t.resultNote || '',
    tags: Array.isArray(t.tags) ? t.tags : [],
    relatedProjectId: t.relatedProjectId || t.projectId || '',
    relatedLearningId: t.relatedLearningId || t.learningItemId || '',
    createdAt: t.createdAt || '',
    deleted: !!t.deleted,
  };
}

export async function fetchTasksAndApply(setData) {
  try {
    const { source, records } = await fetchTabRecords('tasks');
    if (!Array.isArray(records)) return null;
    setData((d) => ({
      ...d,
      tasks: records.map(decorateTask),
      _taskSource: source,
      _taskSyncedAt: new Date().toISOString(),
    }));
    return { source, count: records.length };
  } catch (err) {
    console.warn('[sync] tasks fetch failed:', err);
    return null;
  }
}

export function startTaskPolling(setData) {
  let cancelled = false;
  let timer = null;
  const TASK_POLL_SEC = 15;
  const tick = async () => {
    if (cancelled) return;
    if (isLiveMode()) await fetchTasksAndApply(setData);
    timer = setTimeout(tick, TASK_POLL_SEC * 1000);
  };
  timer = setTimeout(tick, TASK_POLL_SEC * 1000);
  return () => { cancelled = true; if (timer) clearTimeout(timer); };
}

export async function pushTask(setData, task) {
  if (isLiveMode()) {
    await upsertRecord('tasks', serializeTaskForSheet(task));
    await fetchTasksAndApply(setData);
  } else {
    setData((d) => {
      const list = d.tasks || [];
      const exists = list.some((t) => t.id === task.id);
      const next = exists ? list.map((t) => (t.id === task.id ? { ...t, ...task } : t)) : [...list, task];
      return { ...d, tasks: next };
    });
  }
}

export async function deleteTask(setData, id) {
  if (isLiveMode()) {
    await deleteRecord('tasks', id);
    await fetchTasksAndApply(setData);
  } else {
    setData((d) => ({ ...d, tasks: (d.tasks || []).filter((t) => t.id !== id) }));
  }
}

// Delete a project (Sheet + local).
export async function deleteProject(setData, id) {
  if (isLiveMode()) {
    await deleteProjectFromSheet(id);
    await fetchProjectsAndApply(setData);
  } else {
    setData((d) => ({ ...d, projects: (d.projects || []).filter((p) => p.id !== id) }));
  }
}

export function saveData(data) {
  // Don't persist canonical projects; they come from Excel each load
  const { projects: _omit, ...rest } = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...rest, _hydratedAt: now() }));
}

// Update an override field for a single project (writes to projectOverrides map)
export function setProjectOverride(data, projectId, patch) {
  const next = { ...(data.projectOverrides || {}) };
  next[projectId] = { ...(next[projectId] || {}), ...patch };
  return { ...data, projectOverrides: next };
}

// ============ FOCUS MODE ============
export function loadFocusMode() {
  try {
    const raw = localStorage.getItem(FOCUS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { mode: 'mixed', selectedAt: now() };
}

export function saveFocusMode(fm) {
  localStorage.setItem(FOCUS_KEY, JSON.stringify(fm));
}

// ============ PROJECT STAGES ============
export function getProjectStages(data, projectId) {
  return (data.projectStages || []).filter((s) => s.projectId === projectId).sort((a, b) => a.order - b.order);
}

export function getProjectProgress(data, projectId) {
  const project = data.projects.find((p) => p.id === projectId);
  const stages = getProjectStages(data, projectId);
  if (stages.length > 0) {
    const done = stages.filter((s) => s.status === 'completed').length;
    return Math.round((done / stages.length) * 100);
  }
  return project?.progress || 0;
}

// ============ AGGREGATIONS (Excel-driven dashboards) ============
export function groupByOwner(projects) {
  const map = {};
  for (const p of projects) {
    const k = p.ownerCompany || '— Belirsiz —';
    if (!map[k]) map[k] = [];
    map[k].push(p);
  }
  return map;
}
export function groupByMaker(projects) {
  const map = {};
  for (const p of projects) {
    const k = p.makerCompany || '— Belirsiz —';
    if (!map[k]) map[k] = [];
    map[k].push(p);
  }
  return map;
}
export function groupByType(projects) {
  const map = {};
  for (const p of projects) {
    const k = p.projectType || 'other';
    if (!map[k]) map[k] = [];
    map[k].push(p);
  }
  return map;
}
export function groupByStatus(projects) {
  const map = {};
  for (const p of projects) {
    const k = p.status || 'idea';
    if (!map[k]) map[k] = [];
    map[k].push(p);
  }
  return map;
}
export function groupByBusinessArea(projects) {
  const map = {};
  for (const p of projects) {
    const k = p.businessArea || '— Belirsiz —';
    if (!map[k]) map[k] = [];
    map[k].push(p);
  }
  return map;
}

// Domain expiry alerts: K kolonu (Domain Bitiş Tarihi)
export function getDomainExpiryAlerts(projects, daysAhead = 90) {
  const now = new Date();
  const cutoff = new Date(now.getTime() + daysAhead * 86400000);
  return projects
    .filter((p) => p.domainExpiry)
    .map((p) => {
      const exp = new Date(p.domainExpiry);
      const daysLeft = Math.floor((exp - now) / 86400000);
      return { project: p, expiryDate: p.domainExpiry, daysLeft };
    })
    .filter((a) => a.expiryDate <= cutoff.toISOString().slice(0, 10) || a.daysLeft <= daysAhead)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

// Yayında ya da yayına yakın projeler
export function getLiveProjects(data) {
  return data.projects.filter((p) => p.status === 'live' || p.status === 'optimization');
}
export function getActiveProjects(data) {
  return data.projects.filter((p) => p.status === 'in_progress' || p.status === 'optimization' || p.status === 'draft');
}
export function getIdeaProjects(data) {
  return data.projects.filter((p) => p.status === 'idea');
}
export function getPausedProjects(data) {
  return data.projects.filter((p) => p.status === 'paused');
}
export function getPublishingQueue(data) {
  return data.projects.filter((p) => p.publishOnOcianix === 'Evet');
}
export function getFeaturedProjects(data) {
  return data.projects.filter((p) => p.featured);
}
export function getStaleProjects(data) {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return data.projects.filter((p) => (p.status === 'in_progress' || p.status === 'optimization') && p.lastActivity && p.lastActivity < cutoffStr);
}
export function getStaleProjectsWithDays(data) {
  const today = new Date();
  return data.projects
    .filter((p) => p.status === 'in_progress' || p.status === 'optimization')
    .map((p) => {
      const ref = p.lastActivity || p.createdAt;
      if (!ref) return null;
      const days = Math.floor((today - new Date(ref)) / 86400000);
      return { ...p, staleDays: days };
    })
    .filter((p) => p && p.staleDays >= 14)
    .sort((a, b) => b.staleDays - a.staleDays);
}
export function getNearCompleteProjects(data) {
  return data.projects.filter((p) => p.status === 'optimization' && (p.progress || 0) >= 85);
}
export function isAlertDismissed(data, alertKey, resetDays) {
  const dismissals = data.alertDismissals || {};
  const dismissed = dismissals[alertKey];
  if (!dismissed) return false;
  const daysSince = Math.floor((new Date() - new Date(dismissed)) / 86400000);
  return daysSince < resetDays;
}

// ============ TASKS / NOTES / ASSETS / etc. (project-scoped) ============
export function getProjectTasks(data, projectId) { return data.tasks.filter((t) => t.projectId === projectId); }
export function getProjectPhases(data, projectId) { return data.phases.filter((p) => p.projectId === projectId).sort((a, b) => a.phaseOrder - b.phaseOrder); }
export function getProjectNotes(data, projectId) { return data.notes.filter((n) => n.projectId === projectId); }
export function getProjectAssets(data, projectId) { return data.assets.filter((a) => a.projectId === projectId); }
export function getProjectReviews(data, projectId) { return data.reviews.filter((r) => r.projectId === projectId); }
export function getProjectPrompts(data, projectId) { return data.prompts.filter((p) => p.projectId === projectId); }
export function getProjectDecisions(data, projectId) { return data.decisions.filter((d) => d.projectId === projectId); }
export function getLearningModules(data, learningItemId) { return data.learningModules.filter((m) => m.learningItemId === learningItemId).sort((a, b) => a.moduleOrder - b.moduleOrder); }
export function getLearningNotes(data, learningItemId) { return data.notes.filter((n) => n.learningItemId === learningItemId); }
export function getTodayTasks(data) {
  const today = now();
  return data.tasks.filter((t) => t.isToday || t.dueDate === today).filter((t) => t.status !== 'completed' && t.status !== 'cancelled');
}
export function getOverdueTasks(data) {
  const today = now();
  return data.tasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== 'completed' && t.status !== 'cancelled');
}
export function getActiveLearning(data) { return data.learningItems.filter((l) => l.status === 'in_progress'); }

// ============ LEARNING CATEGORIES / SCHEDULES (kept) ============
export function getLearningCategoryById(data, id) { return (data.learningCategories || []).find((c) => c.id === id); }
export function getLearningCategoriesForItem(data, item) { return (item.categoryIds || []).map((id) => getLearningCategoryById(data, id)).filter(Boolean); }
export function getLearningSchedule(data, learningItemId) { return (data.learningSchedules || []).find((s) => s.learningItemId === learningItemId && s.isActive); }
export function getTodayLearning(data, dateStr) {
  const date = dateStr ? new Date(dateStr) : new Date();
  const dateS = date.toISOString().slice(0, 10);
  const isoDay = date.getDay() === 0 ? 7 : date.getDay();
  const dayOfMonth = date.getDate();
  return (data.learningSchedules || []).filter((s) => {
    if (!s.isActive) return false;
    if (s.startDate && dateS < s.startDate) return false;
    if (s.endDate && dateS > s.endDate) return false;
    switch (s.scheduleType) {
      case 'one_time': return s.date === dateS;
      case 'weekly': return (s.weeklyDays || []).includes(isoDay);
      case 'monthly': return (s.monthlyDays || []).includes(dayOfMonth);
      case 'custom_days': return (s.customDates || []).includes(dateS);
      case 'flexible_hours': return (s.preferredDays || []).includes(isoDay);
      default: return false;
    }
  }).map((s) => {
    const item = data.learningItems.find((l) => l.id === s.learningItemId);
    let timeStart = null, timeEnd = null;
    switch (s.scheduleType) {
      case 'one_time': timeStart = s.timeStart; timeEnd = s.timeEnd; break;
      case 'weekly': timeStart = s.weeklyTimeStart; timeEnd = s.weeklyTimeEnd; break;
      case 'monthly': timeStart = s.monthlyTimeStart; timeEnd = s.monthlyTimeEnd; break;
      case 'custom_days': timeStart = s.customTimeStart; timeEnd = s.customTimeEnd; break;
    }
    return { learningItem: item, schedule: s, timeStart, timeEnd };
  }).filter((e) => e.learningItem);
}
export function getWeekLearningPlan(data, weekStartDate) {
  const start = weekStartDate ? new Date(weekStartDate) : (() => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; })();
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const sessions = getTodayLearning(data, dateStr);
    const tasks = data.tasks.filter((t) => t.dueDate === dateStr && t.status !== 'completed' && t.status !== 'cancelled');
    days.push({ date: dateStr, dayIndex: d.getDay(), sessions, tasks });
  }
  return days;
}
