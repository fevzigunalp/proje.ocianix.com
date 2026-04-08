import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'ocianix-ops-center';
const FOCUS_KEY = 'ocianix-ops-focus';

// ============ ENUMS ============
export const PROJECT_TYPES = ['website', 'automation', 'content', 'brand', 'learning_project', 'documentation', 'operations', 'business_development', 'personal_system', 'mobile_app', 'api_backend', 'other'];
export const PROJECT_STATUSES = ['idea', 'planning', 'active', 'on_hold', 'blocked', 'completed', 'archived'];
export const PRIORITIES = ['critical', 'high', 'medium', 'low'];
export const TASK_STATUSES = ['todo', 'in_progress', 'waiting', 'review', 'completed', 'cancelled'];
export const ENERGY_LEVELS = ['deep', 'medium', 'light'];
export const LEARNING_STATUSES = ['planned', 'purchased', 'not_started', 'in_progress', 'paused', 'completed', 'revisit'];
export const LEARNING_FORMATS = ['course', 'youtube_series', 'workshop', 'bootcamp', 'article_series', 'mentorship', 'book', 'documentation', 'other'];
export const LEARNING_LEVELS = ['beginner', 'intermediate', 'advanced'];
export const NOTE_TYPES = ['quick_note', 'project_note', 'learning_note', 'idea', 'decision', 'meeting_note', 'prompt_summary', 'issue_solution', 'research_note'];
export const ASSET_TYPES = ['pdf', 'doc', 'image', 'video', 'link', 'github', 'drive', 'prompt', 'checklist', 'spreadsheet', 'other'];
export const REVIEW_TYPES = ['daily', 'weekly', 'monthly', 'milestone', 'learning_review'];
export const PROMPT_TYPES = ['planning', 'content_generation', 'code_generation', 'design', 'research', 'debugging', 'seo', 'system_prompt', 'other'];
export const MODULE_STATUSES = ['not_started', 'in_progress', 'completed', 'skipped'];
export const PHASE_STATUSES = ['planned', 'active', 'on_hold', 'completed'];
export const STAGE_STATUSES = ['not_started', 'in_progress', 'completed', 'skipped'];
export const SCHEDULE_TYPES = ['one_time', 'weekly', 'monthly', 'custom_days', 'flexible_hours'];
export const FOCUS_MODES = ['project', 'learning', 'mixed', 'admin', 'deep_work'];

// From Proje 1 - categories & project types for filtering
export const PROJECT_CATEGORIES = ['turizm', 'studio', 'kurumsal', 'yazilim', 'e-ticaret', 'diger'];
export const PROJECT_CATEGORY_LABELS = { turizm: 'Turizm', studio: 'Stüdyo', kurumsal: 'Kurumsal', yazilim: 'Yazılım', 'e-ticaret': 'E-Ticaret', diger: 'Diğer' };

// ============ LABEL MAPS ============
export const PROJECT_STATUS_LABELS = { idea: 'Fikir', planning: 'Planlama', active: 'Aktif', on_hold: 'Beklemede', blocked: 'Tıkandı', completed: 'Tamamlandı', archived: 'Arşiv' };
export const PRIORITY_LABELS = { critical: 'Kritik', high: 'Yüksek', medium: 'Orta', low: 'Düşük' };
export const TASK_STATUS_LABELS = { todo: 'Yapılacak', in_progress: 'Devam Ediyor', waiting: 'Beklemede', review: 'İnceleme', completed: 'Tamamlandı', cancelled: 'İptal' };
export const LEARNING_STATUS_LABELS = { planned: 'Planlandı', purchased: 'Satın Alındı', not_started: 'Başlanmadı', in_progress: 'Devam Ediyor', paused: 'Donduruldu', completed: 'Tamamlandı', revisit: 'Tekrar Edilecek' };
export const NOTE_TYPE_LABELS = { quick_note: 'Hızlı Not', project_note: 'Proje Notu', learning_note: 'Eğitim Notu', idea: 'Fikir', decision: 'Karar', meeting_note: 'Toplantı', prompt_summary: 'Prompt Özeti', issue_solution: 'Problem/Çözüm', research_note: 'Araştırma' };
export const REVIEW_TYPE_LABELS = { daily: 'Günlük', weekly: 'Haftalık', monthly: 'Aylık', milestone: 'Milestone', learning_review: 'Eğitim' };
export const ENERGY_LABELS = { deep: 'Derin', medium: 'Orta', light: 'Hafif' };
export const PROJECT_TYPE_LABELS = { website: 'Website', automation: 'Otomasyon', content: 'İçerik', brand: 'Marka', learning_project: 'Eğitim Projesi', documentation: 'Dokümantasyon', operations: 'Operasyon', business_development: 'İş Geliştirme', personal_system: 'Kişisel Sistem', mobile_app: 'Mobil Uygulama', api_backend: 'API/Backend', other: 'Diğer' };
export const STAGE_STATUS_LABELS = { not_started: 'Başlanmadı', in_progress: 'Devam Ediyor', completed: 'Tamamlandı', skipped: 'Atlandı' };
export const SCHEDULE_TYPE_LABELS = { one_time: 'Tek Seferlik', weekly: 'Haftalık', monthly: 'Aylık', custom_days: 'Özel Günler', flexible_hours: 'Esnek Saat' };
export const FOCUS_MODE_LABELS = { project: 'Proje Odak', learning: 'Eğitim Odak', mixed: 'Karışık', admin: 'Admin', deep_work: 'Derin Çalışma' };
export const FOCUS_MODE_ICONS = { project: '🎯', learning: '📚', mixed: '🔄', admin: '📋', deep_work: '🧠' };
export const DAY_LABELS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

// ============ STAGE TEMPLATES ============
export const DEFAULT_STAGE_TEMPLATES = {
  website: ['Ürün Tanımı', 'Bilgi Mimarisi', 'UI/UX Tasarım', 'Frontend Geliştirme', 'Backend Geliştirme', 'Test', 'Deploy', 'Optimizasyon'],
  automation: ['Gereksinim Analizi', 'Workflow Tasarımı', 'Entegrasyon Kurulumu', 'Test & Debug', 'Deploy', 'İzleme', 'Optimizasyon'],
  content: ['Konu Araştırma', 'İçerik Planlama', 'Taslak Oluşturma', 'İnceleme & Düzenleme', 'Yayınlama', 'Dağıtım', 'Analitik'],
  brand: ['Marka Stratejisi', 'Görsel Kimlik', 'Guideline Oluşturma', 'Materyal Üretimi', 'Lansman', 'İzleme', 'İterasyon'],
  learning_project: ['Müfredat Tasarımı', 'Materyal Toplama', 'Çalışma Planı', 'Öğrenme Uygulama', 'Pratik & Projeler', 'Değerlendirme'],
  documentation: ['Kapsam Belirleme', 'Araştırma', 'Taslak Yazımı', 'İnceleme', 'Yayınlama', 'Güncelleme'],
  operations: ['Analiz', 'Planlama', 'Uygulama', 'Test', 'Devreye Alma', 'İzleme'],
  business_development: ['Pazar Araştırması', 'Strateji', 'Uygulama', 'Değerlendirme', 'Ölçekleme'],
  personal_system: ['Tasarım', 'Kurulum', 'Test', 'Kullanım', 'İyileştirme'],
  mobile_app: ['Ürün Tanımı', 'UI/UX Tasarım', 'Geliştirme', 'Test', 'Deploy', 'Yayınlama'],
  api_backend: ['API Tasarımı', 'Veritabanı', 'Geliştirme', 'Test', 'Deploy', 'Dokümantasyon'],
  other: ['Planlama', 'Tasarım', 'Geliştirme', 'Test', 'Deploy', 'İnceleme'],
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

// Map Proje 1 status to new statuses
function mapOldStatus(s) {
  if (s === 'devam') return 'active';
  if (s === 'baslanacak') return 'idea';
  if (s === 'tamamlandi') return 'completed';
  return 'active';
}

// Map Proje 1 category
function mapOldCategory(c) {
  if (c === 'stüdyo') return 'studio';
  if (c === 'diger') return 'diger';
  return c;
}

// ============ IMPORT FROM projects.json (Proje 1 data) ============
function importFromProjectsJson(existingData) {
  // Only import if projects array is empty (first load)
  if (existingData && existingData.projects && existingData.projects.length > 0) return existingData;

  // Hardcoded Proje 1 data for initial seed
  const oldProjects = [
    { id: 'cappadocia-shooting', name: 'Cappadocia Shooting', description: 'Kapadokya fotoğraf/video stüdyo web sitesi. Lüks çekim paketleri, portfolyo, blog.', type: 'Web Sitesi', category: 'turizm', status: 'devam', progress: 87, featured: true, highlight: '32 sayfa, 109 blog yazisi, 2 dil destegi ile en kapsamli proje', url: '', repo: '', stack: ['Astro', 'TypeScript', 'CSS Variables', 'Sharp'], tools: ['Cloudflare Pages', 'Web3Forms', 'Google Analytics', 'Microsoft Clarity'], tags: ['turizm', 'fotoğrafçılık', 'çok-dilli', 'SEO'], folder: '/home/fevzi/projects/Cappadocia_Shooting/', lastActivity: '2026-03-30', pages: 32, components: 115, languages: ['TR', 'EN'], todos: ['Booking/rezervasyon sistemi entegrasyonu', 'SEO pillar article konsolidasyonu', 'Final production deploy'], client: '', clientContact: '', portfolio: true, createdAt: '2025-01-01' },
    { id: 'teklif-kapadokya', name: 'Teklif Kapadokya', description: 'Kapadokya evlilik teklifi organizasyon sitesi. Paketler, konseptler, galeri.', type: 'Web Sitesi', category: 'turizm', status: 'devam', progress: 77, featured: true, highlight: 'Next.js 16 + React 19 ile en modern stack, lüks tasarim', url: 'https://teklifkapadokya.com', repo: 'https://github.com/fevzigunalp/teklif-kapadokya', stack: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS', 'Supabase'], tools: ['Cloudflare Pages', 'Resend', 'Google Maps API', 'Google Analytics'], tags: ['turizm', 'düğün', 'organizasyon', 'lead-generation'], folder: '/home/fevzi/teklif-kapadokya/', lastActivity: '2026-03-30', pages: 16, components: 41, languages: ['TR'], todos: ['Gerçek fotoğraf/görsel eklenmesi', 'Supabase + Resend env ayarları', 'Blog içerikleri yazılacak', 'Galeri doldurulacak', 'Final Cloudflare Pages deploy'], client: '', clientContact: '', portfolio: true, createdAt: '2026-03-30' },
    { id: 'above-cappadocia', name: 'Above Cappadocia', description: 'Sıcak hava balonu turu rezervasyon ve pazarlama sitesi. Dinamik fiyatlama.', type: 'Web Sitesi', category: 'turizm', status: 'devam', progress: 77, featured: false, highlight: 'Puppeteer ile rakip fiyat scraping, dinamik fiyatlama sistemi', url: '', repo: '', stack: ['Next.js 15.5', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Zod'], tools: ['Cloudflare Pages', 'Puppeteer (fiyat scraping)'], tags: ['turizm', 'balon', 'e-ticaret', 'SEO'], folder: '/home/fevzi/projects/Ocianix/web/above-cappadocia/', lastActivity: '2026-03-29', pages: 16, components: 18, languages: ['EN'], todos: ['Booking sistemi tamamlanacak', 'Eksik görseller eklenecek', 'Production deploy'], client: '', clientContact: '', portfolio: false, createdAt: '2025-06-01' },
    { id: 'cekimatolyesi-v2', name: 'Çekim Atölyesi V2', description: 'Fairy Light Studio sinema/fotoğraf stüdyo sitesi.', type: 'Web Sitesi', category: 'studio', status: 'devam', progress: 62, featured: false, highlight: 'Framer Motion animasyonlari ile gorsel zenginlik', url: '', repo: '', stack: ['Next.js 14.1', 'TypeScript', 'Tailwind CSS', 'Framer Motion'], tools: ['Cloudflare Workers'], tags: ['stüdyo', 'fotoğrafçılık', 'sinema'], folder: '/home/fevzi/projects/Ocianix/web/cekimatolyesi-v2/', lastActivity: '2026-03-30', pages: 7, components: 8, languages: ['TR'], todos: ['Component kütüphanesi genişletilecek', 'İçerik ve görseller eklenecek', 'SEO optimizasyonu'], client: '', clientContact: '', portfolio: false, createdAt: '2025-09-01' },
    { id: 'premium-agent-studio', name: 'Premium Agent Studio', description: 'AI destekli web sitesi üretici. Dashboard + multi-agent generator.', type: 'Uygulama', category: 'yazilim', status: 'devam', progress: 62, featured: true, highlight: 'Claude AI multi-agent sistemi ile otomatik site uretimi', url: '', repo: '', stack: ['Python', 'Flask', 'HTML/CSS/JS', 'Bash', 'Claude AI'], tools: ['Claude API', 'Localhost:8500'], tags: ['AI', 'otomasyon', 'site-üretici', 'dashboard'], folder: '/home/fevzi/projects/premium-agent-studio/', lastActivity: '2026-03-16', pages: 3, components: 0, languages: ['TR'], todos: ['Dokümantasyon dosyaları yazılacak', 'Test suite eklenecek', 'Production hosting entegrasyonu', 'Deploy pipeline tamamlanacak'], client: '', clientContact: '', portfolio: false, createdAt: '2026-03-01' },
    { id: 'ocianix-com', name: 'Ocianix.com', description: 'Ocianix tasarım stüdyo portfolyo sitesi.', type: 'Web Sitesi', category: 'kurumsal', status: 'devam', progress: 47, featured: false, highlight: 'Ana marka sitesi, portfolyo vitrin', url: '', repo: '', stack: ['Astro 4.16', 'Tailwind CSS', 'Supabase'], tools: ['Statik Build'], tags: ['portfolyo', 'stüdyo', 'kurumsal'], folder: '/home/fevzi/projects/Ocianix/web/ocianix-com/', lastActivity: '2026-03-28', pages: 6, components: 2, languages: ['EN'], todos: ['i18n tamamlanacak', 'Daha fazla portfolyo eklenmeli', 'Component sayısı artırılmalı', 'Deploy konfigürasyonu'], client: '', clientContact: '', portfolio: false, createdAt: '2025-06-01' },
  ];

  const defaultCats = createDefaultLearningCategories();

  const projects = oldProjects.map((p) => ({
    id: p.id,
    brandId: null,
    title: p.name,
    slug: p.id,
    shortDescription: p.description,
    fullDescription: p.description,
    projectType: 'website',
    priority: p.progress >= 80 ? 'high' : 'medium',
    status: mapOldStatus(p.status),
    category: mapOldCategory(p.category),
    stageSummary: '',
    objective: '',
    successCriteria: '',
    currentBlockers: '',
    risks: '',
    nextStep: p.todos?.[0] || '',
    startDate: p.createdAt,
    targetDate: '',
    completedAt: null,
    tags: [...(p.stack || []), ...(p.tags || [])],
    links: [
      ...(p.url ? [{ label: 'Canlı Site', url: p.url }] : []),
      ...(p.repo ? [{ label: 'GitHub', url: p.repo }] : []),
    ],
    // Proje 1 specific fields
    highlight: p.highlight || '',
    featured: p.featured || false,
    portfolio: p.portfolio || false,
    siteUrl: p.url || '',
    repoUrl: p.repo || '',
    folderPath: p.folder || '',
    techStack: p.stack || [],
    toolsServices: p.tools || [],
    pages: p.pages || 0,
    components: p.components || 0,
    languages: p.languages || [],
    client: p.client || '',
    clientContact: p.clientContact || '',
    progress: p.progress || 0,
    createdAt: p.createdAt,
    updatedAt: p.lastActivity || now(),
  }));

  // Convert todos to tasks
  const tasks = [];
  oldProjects.forEach((p) => {
    (p.todos || []).forEach((todo) => {
      tasks.push({
        id: uuidv4(), projectId: p.id, phaseId: null, learningItemId: null, parentTaskId: null,
        title: todo, description: '', status: 'todo', priority: 'medium', energyLevel: 'medium',
        estimatedMinutes: null, actualMinutes: null, dueDate: null, startDate: null, completedAt: null,
        isToday: false, isNextStep: false, isRecurring: false, blockedReason: '', resultNote: '', tags: [],
        createdAt: p.lastActivity || now(), updatedAt: p.lastActivity || now(),
      });
    });
  });

  return {
    brands: [],
    projects,
    projectStages: [],
    phases: [],
    tasks,
    learningCategories: defaultCats,
    learningItems: [],
    learningModules: [],
    learningSchedules: [],
    notes: [],
    assets: [],
    reviews: [],
    prompts: [],
    decisions: [],
    tags: [],
    // Alert dismiss state (from Proje 1)
    alertDismissals: {},
  };
}

// ============ LOAD / SAVE ============
export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      const defaults = createDefaultStructure();
      for (const key of Object.keys(defaults)) {
        if (!data[key]) data[key] = Array.isArray(defaults[key]) ? [] : defaults[key];
      }
      // Auto-sync from projects.json in background
      syncFromProjectsJson(data);
      return data;
    }
  } catch {}
  const data = importFromProjectsJson(null);
  saveData(data);
  return data;
}

// Fetch projects.json and merge new projects
function syncFromProjectsJson(data) {
  fetch('/projects.json?t=' + Date.now()).then((r) => r.ok ? r.json() : []).then((scanned) => {
    let changed = false;
    for (const p of scanned) {
      const existingById = data.projects.find((x) => x.id === p.id);
      const existingByTitle = data.projects.find((x) => x.title.toLowerCase() === (p.name || '').toLowerCase());
      if (!existingById && !existingByTitle) {
        data.projects.push({
          id: p.id, brandId: null, title: p.name, slug: p.id,
          shortDescription: p.description || '', fullDescription: p.description || '',
          projectType: p.type || 'website', priority: (p.progress || 0) >= 80 ? 'high' : 'medium',
          status: p.status === 'on_hold' ? 'on_hold' : p.status === 'archived' ? 'archived' : p.status === 'idea' ? 'idea' : 'active',
          category: p.category || 'diger', stageSummary: '', objective: '', successCriteria: '',
          currentBlockers: '', risks: '', nextStep: '', startDate: p.createdAt || now(), targetDate: '', completedAt: null,
          tags: [...(p.stack || []), ...(p.tags || [])],
          links: [...(p.url ? [{ label: 'Canlı Site', url: p.url }] : []), ...(p.repo ? [{ label: 'GitHub', url: p.repo }] : [])],
          highlight: p.highlight || '', featured: p.featured || false, portfolio: false,
          siteUrl: p.url || '', repoUrl: p.repo || '', folderPath: p.folder || '',
          techStack: p.stack || [], toolsServices: [], pages: p.pages || 0, components: p.components || 0,
          languages: p.languages || [], client: '', clientContact: '', progress: p.progress || 0,
          createdAt: p.createdAt || now(), updatedAt: p.lastActivity || now(),
        });
        changed = true;
      } else if (existingById && p.lastActivity && p.lastActivity > (existingById.updatedAt || '')) {
        existingById.updatedAt = p.lastActivity;
        existingById.pages = p.pages || existingById.pages;
        existingById.components = p.components || existingById.components;
        changed = true;
      }
    }
    if (changed) saveData(data);
  }).catch(() => {});
}

function createDefaultStructure() {
  return {
    brands: [], projects: [], projectStages: [], phases: [], tasks: [],
    learningCategories: [], learningItems: [], learningModules: [], learningSchedules: [],
    notes: [], assets: [], reviews: [], prompts: [], decisions: [], tags: [],
    alertDismissals: {},
  };
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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

export function initProjectStages(projectId, projectType) {
  const templates = DEFAULT_STAGE_TEMPLATES[projectType] || DEFAULT_STAGE_TEMPLATES.other;
  return templates.map((title, i) => ({
    id: uuidv4(), projectId, templateId: null, title, description: '', order: i + 1, status: 'not_started', completedAt: null, createdAt: now(),
  }));
}

export function getProjectProgress(data, projectId) {
  const project = data.projects.find((p) => p.id === projectId);
  // If project has manual progress (from Proje 1 data), use it
  if (project && project.progress > 0) {
    const stages = getProjectStages(data, projectId);
    if (stages.length === 0) return project.progress;
  }
  const stages = getProjectStages(data, projectId);
  if (stages.length > 0) {
    const done = stages.filter((s) => s.status === 'completed').length;
    return Math.round((done / stages.length) * 100);
  }
  const tasks = getProjectTasks(data, projectId);
  if (tasks.length > 0) {
    const done = tasks.filter((t) => t.status === 'completed').length;
    return Math.round((done / tasks.length) * 100);
  }
  return project?.progress || 0;
}

// ============ LEARNING CATEGORIES ============
export function getLearningCategoryById(data, id) {
  return (data.learningCategories || []).find((c) => c.id === id);
}

export function getLearningCategoriesForItem(data, item) {
  return (item.categoryIds || []).map((id) => getLearningCategoryById(data, id)).filter(Boolean);
}

// ============ LEARNING SCHEDULE ============
export function getLearningSchedule(data, learningItemId) {
  return (data.learningSchedules || []).find((s) => s.learningItemId === learningItemId && s.isActive);
}

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

// ============ SMART ALERTS (from Proje 1) ============
export function getNearCompleteProjects(data) {
  return data.projects.filter((p) => {
    const progress = getProjectProgress(data, p.id);
    return progress >= 85 && progress < 100 && p.status === 'active';
  });
}

export function getStaleProjectsWithDays(data) {
  const today = new Date();
  return data.projects.filter((p) => p.status === 'active').map((p) => {
    const lastDate = new Date(p.updatedAt);
    const days = Math.floor((today - lastDate) / 86400000);
    return { ...p, staleDays: days };
  }).filter((p) => p.staleDays >= 7).sort((a, b) => b.staleDays - a.staleDays);
}

export function isAlertDismissed(data, alertKey, resetDays) {
  const dismissals = data.alertDismissals || {};
  const dismissed = dismissals[alertKey];
  if (!dismissed) return false;
  const daysSince = Math.floor((new Date() - new Date(dismissed)) / 86400000);
  return daysSince < resetDays;
}

// ============ EXISTING HELPERS ============
export function getProjectTasks(data, projectId) {
  return data.tasks.filter((t) => t.projectId === projectId);
}
export function getProjectPhases(data, projectId) {
  return data.phases.filter((p) => p.projectId === projectId).sort((a, b) => a.phaseOrder - b.phaseOrder);
}
export function getProjectNotes(data, projectId) {
  return data.notes.filter((n) => n.projectId === projectId);
}
export function getProjectAssets(data, projectId) {
  return data.assets.filter((a) => a.projectId === projectId);
}
export function getProjectReviews(data, projectId) {
  return data.reviews.filter((r) => r.projectId === projectId);
}
export function getProjectPrompts(data, projectId) {
  return data.prompts.filter((p) => p.projectId === projectId);
}
export function getProjectDecisions(data, projectId) {
  return data.decisions.filter((d) => d.projectId === projectId);
}
export function getLearningModules(data, learningItemId) {
  return data.learningModules.filter((m) => m.learningItemId === learningItemId).sort((a, b) => a.moduleOrder - b.moduleOrder);
}
export function getLearningNotes(data, learningItemId) {
  return data.notes.filter((n) => n.learningItemId === learningItemId);
}
export function getTodayTasks(data) {
  const today = now();
  return data.tasks.filter((t) => t.isToday || t.dueDate === today).filter((t) => t.status !== 'completed' && t.status !== 'cancelled');
}
export function getOverdueTasks(data) {
  const today = now();
  return data.tasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== 'completed' && t.status !== 'cancelled');
}
export function getActiveProjects(data) {
  return data.projects.filter((p) => p.status === 'active' || p.status === 'planning');
}
export function getStaleProjects(data) {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return data.projects.filter((p) => p.status === 'active' && p.updatedAt < cutoffStr);
}
export function getActiveLearning(data) {
  return data.learningItems.filter((l) => l.status === 'in_progress');
}
export function getFeaturedProjects(data) {
  return data.projects.filter((p) => p.featured);
}
export function getPortfolioProjects(data) {
  return data.projects.filter((p) => p.portfolio);
}
