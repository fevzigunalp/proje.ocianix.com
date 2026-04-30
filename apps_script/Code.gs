/**
 * proje.ocianix.com  ↔  Google Sheet  iki yönlü senkron köprüsü
 *
 * MULTI-TAB MİMARİSİ:
 *   GET  ?tab=projects                  → Projeler sekmesi
 *   GET  ?tab=tasks                     → Görevler sekmesi
 *   GET  ?tab=tasks&include_deleted=true
 *   POST { tab:"tasks", action:"upsert", record:{...}, token }
 *   POST { tab:"tasks", action:"delete", id, token }
 *   POST { tab:"tasks", action:"restore", id, token }
 *
 * Tab parametresi yoksa default = projects (geri uyumluluk).
 *
 * Sekme bazında HEADERS / COL_MAP / row<->object transformer ayrı.
 * Tüm sekmelerde ortak kolonlar: id, createdAt, updatedAt, deleted (sırası tab tanımına bağlı).
 */

const ADMIN_TOKEN = 'CHANGE_ME_STRONG_TOKEN';  // güçlü bir token koy, sitede aynısını kullan

// ============================================================================
// PROJELER (existing — Excel başlıklarıyla birebir, geri uyumlu)
// ============================================================================
const PROJECTS_HEADERS = [
  'Projeyi Yapan İşletme',
  'Proje Sahibi İşetme',
  'Proje Türü',
  "Proje Ocianix'te Yayınlanacakmı",
  'Proje İş Alanı',
  'İş Alt Kolu',
  'Proje & Firma & İş  Adı',
  'Proje Açıklama',
  'Proje Dosya Yolu',
  'Web Sitesi',
  'Domain Bitiş Tarihi',
  'Proje İlerleme Drumu',
  'Genel Açıklama',
  'id',
  'updatedAt',
  'deleted',
];

const PROJECTS_COL_MAP = [
  'makerCompany','ownerCompany','projectTypeRaw','publishOnOcianix',
  'businessArea','subBusiness','name','description','folderPath',
  'websiteUrlRaw','domainExpiry','progressStatusRaw','generalNote',
  'id','updatedAt','deleted',
];

// ============================================================================
// GÖREVLER  (yeni)
// ============================================================================
const TASKS_HEADERS = [
  'Başlık',                // A
  'Açıklama',              // B
  'Durum',                 // C — yapılacak/devam-ediyor/beklemede/incelemede/tamamlandı/iptal
  'Öncelik',               // D — kritik/yüksek/orta/düşük
  'Enerji',                // E — derin/orta/hafif
  'Bugün mü',              // F — TRUE/FALSE
  'Sonraki Adım mı',       // G — TRUE/FALSE
  'Tahmini Süre (dk)',     // H — int
  'Gerçekleşen Süre (dk)', // I — int
  'Başlangıç',             // J — date YYYY-MM-DD
  'Termin',                // K — date YYYY-MM-DD
  'Tamamlanma',            // L — date YYYY-MM-DD
  'Engellendi',            // M — text
  'Bağımlı Görev',         // N — task id ref
  'Sonuç Notu',            // O — text
  'Etiketler',             // P — comma-separated
  'relatedProjectId',      // Q
  'relatedLearningId',     // R
  'id',                    // S
  'createdAt',             // T
  'updatedAt',             // U
  'deleted',               // V
];

const TASKS_COL_MAP = [
  'title','description','status','priority','energyLevel',
  'isToday','isNextStep','estimatedMinutes','actualMinutes',
  'startDate','dueDate','completedAt',
  'blockedReason','dependsOnTaskId','resultNote',
  'tags','relatedProjectId','relatedLearningId',
  'id','createdAt','updatedAt','deleted',
];

// ============================================================================
// TAB CONFIGS
// ============================================================================
const TABS = {
  projects: {
    sheetName: 'Sayfa1',     // mevcut sekme adı (geri uyumlu)
    headers: PROJECTS_HEADERS,
    colMap: PROJECTS_COL_MAP,
    idIndex: 14,              // 1-based: id kolonu N (14)
    toObject: rowToProject_,
    toRow: projectToRow_,
    idPrefix: 'row',
  },
  tasks: {
    sheetName: 'Görevler',
    headers: TASKS_HEADERS,
    colMap: TASKS_COL_MAP,
    idIndex: 19,              // S (19)
    toObject: rowToTask_,
    toRow: taskToRow_,
    idPrefix: 'tsk',
  },
};

function resolveTab_(name) {
  const key = (name || 'projects').toString().trim().toLowerCase();
  if (!TABS[key]) throw new Error('unknown_tab: ' + key);
  return TABS[key];
}

// ============================================================================
// ORTAK HELPERLAR
// ============================================================================
function nowIso_() { return new Date().toISOString(); }

function todayIso_() {
  return Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM-dd');
}

function isDeleted_(v) {
  if (v === true) return true;
  if (typeof v === 'string' && v.toUpperCase() === 'TRUE') return true;
  return false;
}

function asBool_(v) {
  if (v === true) return true;
  if (typeof v === 'string' && v.toUpperCase() === 'TRUE') return true;
  return false;
}

function asInt_(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
}

function asDate_(v) {
  if (!v) return null;
  if (v instanceof Date) return Utilities.formatDate(v, 'UTC', 'yyyy-MM-dd');
  if (typeof v === 'number') {
    const ms = (v - 25569) * 86400 * 1000;
    return Utilities.formatDate(new Date(ms), 'UTC', 'yyyy-MM-dd');
  }
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s;
}

function asTags_(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(x => String(x).trim()).filter(Boolean);
  return String(v).split(',').map(x => x.trim()).filter(Boolean);
}

function tagsToCell_(arr) {
  if (!arr) return '';
  if (Array.isArray(arr)) return arr.join(',');
  return String(arr);
}

function slugify_(name) {
  if (!name) return 'kayit';
  let s = String(name).toLowerCase();
  s = s.replace(/[İı]/g, 'i').replace(/[Ğğ]/g, 'g').replace(/[Şş]/g, 's')
       .replace(/[Çç]/g, 'c').replace(/[Öö]/g, 'o').replace(/[Üü]/g, 'u');
  s = s.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return s || 'kayit';
}

function newId_(prefix) {
  // tsk-2026Q2-XXXX, lrn-2026-XXXX gibi — basit tarih+random
  const d = new Date();
  const y = d.getFullYear();
  const q = Math.floor(d.getMonth()/3)+1;
  const rnd = Math.floor(Math.random()*9000+1000);
  if (prefix === 'tsk') return prefix + '-' + y + 'Q' + q + '-' + rnd;
  return prefix + '-' + y + '-' + rnd;
}

function getSheet_(tabKey) {
  const cfg = resolveTab_(tabKey);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(cfg.sheetName);
  if (!s) s = ss.insertSheet(cfg.sheetName);
  const firstRow = s.getRange(1, 1, 1, cfg.headers.length).getValues()[0];
  if (firstRow.join('|') !== cfg.headers.join('|')) {
    s.getRange(1, 1, 1, cfg.headers.length).setValues([cfg.headers]);
    s.setFrozenRows(1);
  }
  return s;
}

function findRowById_(tabKey, id) {
  const cfg = resolveTab_(tabKey);
  const sh = getSheet_(tabKey);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return null;
  const ids = sh.getRange(2, cfg.idIndex, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) return i + 2;
  }
  return null;
}

function readAll_(tabKey, opts) {
  const includeDeleted = !!(opts && opts.includeDeleted);
  const cfg = resolveTab_(tabKey);
  const sh = getSheet_(tabKey);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];
  const range = sh.getRange(2, 1, lastRow - 1, cfg.headers.length);
  const values = range.getValues();
  const list = [];
  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    if (row.every(v => v === '' || v === null)) continue;
    const obj = cfg.toObject(row, i + 2, cfg);
    if (!includeDeleted && isDeleted_(obj.deleted)) continue;
    list.push(obj);
  }
  return list;
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function checkAuth_(token) {
  return token && String(token) === String(ADMIN_TOKEN);
}

// ============================================================================
// PROJELER row<->object transformerlar (mevcut davranış birebir korundu)
// ============================================================================
function statusFromRaw_(raw) {
  if (!raw) return 'idea';
  const r = String(raw).trim().toLowerCase();
  if (r.indexOf('fikir') === 0) return 'idea';
  if (r.indexOf('taslak') === 0) return 'draft';
  if (r.indexOf('yapım') === 0 || r.indexOf('yapim') === 0) return 'in_progress';
  if (r.indexOf('ara') === 0) return 'paused';
  if (r.indexOf('optim') === 0) return 'optimization';
  if (r.indexOf('bitti') === 0 || r.indexOf('yayında') >= 0 || r.indexOf('yayinda') >= 0) return 'live';
  return 'idea';
}

function typeFromRaw_(raw) {
  if (!raw) return 'other';
  const r = String(raw).trim().toLowerCase();
  if (r.indexOf('web') === 0) return 'website';
  if (r === 'saas') return 'saas';
  if (r.indexOf('uygulama') === 0) return 'app';
  if (r.indexOf('oto') === 0) return 'automation';
  return 'other';
}

function progressForStatus_(s) {
  return ({ idea:0, draft:15, in_progress:50, paused:30, optimization:85, live:100 })[s] || 0;
}

function normalizeUrl_(raw) {
  if (raw === null || raw === undefined || String(raw).trim() === '') return { raw:null, url:null, placeholder:null };
  const rr = String(raw).trim();
  const lower = rr.toLowerCase();
  const placeholderKeywords = ['bulunacak','alınacak','alinacak','taşınacak','tasinacak'];
  if (placeholderKeywords.some(k => lower.indexOf(k) >= 0) && lower.indexOf('http') !== 0) {
    return { raw:null, url:null, placeholder:rr };
  }
  if (lower.indexOf('http') === 0) return { raw:rr, url:rr, placeholder:null };
  if (/^[a-z0-9.-]+\.[a-z]{2,}/i.test(rr)) return { raw:rr, url:'https://'+rr, placeholder:null };
  return { raw:rr, url:null, placeholder:rr };
}

function rowToProject_(row, rowNumber, cfg) {
  const obj = {};
  for (let i = 0; i < cfg.colMap.length; i++) obj[cfg.colMap[i]] = row[i] === '' ? null : row[i];
  if (obj.domainExpiry instanceof Date) {
    obj.domainExpiry = Utilities.formatDate(obj.domainExpiry, 'UTC', 'yyyy-MM-dd');
  } else if (typeof obj.domainExpiry === 'number') {
    const ms = (obj.domainExpiry - 25569) * 86400 * 1000;
    obj.domainExpiry = Utilities.formatDate(new Date(ms), 'UTC', 'yyyy-MM-dd');
  }
  const u = normalizeUrl_(obj.websiteUrlRaw);
  obj.websiteUrl = u.url;
  obj.websiteUrlPlaceholder = u.placeholder;
  obj.websiteUrlRaw = u.raw;
  obj.status = statusFromRaw_(obj.progressStatusRaw);
  obj.projectType = typeFromRaw_(obj.projectTypeRaw);
  obj.progress = progressForStatus_(obj.status);
  obj.rowIndex = rowNumber - 1;
  if (!obj.id) obj.id = 'row-' + String(obj.rowIndex).padStart(2, '0') + '-' + slugify_(obj.name || ('proje-' + obj.rowIndex));
  if (obj.updatedAt instanceof Date) obj.updatedAt = obj.updatedAt.toISOString();
  return obj;
}

function projectToRow_(p, cfg) {
  return [
    p.makerCompany || '', p.ownerCompany || '', p.projectTypeRaw || '',
    p.publishOnOcianix || '', p.businessArea || '', p.subBusiness || '',
    p.name || '', p.description || '', p.folderPath || '',
    p.websiteUrlRaw || p.websiteUrl || p.websiteUrlPlaceholder || '',
    p.domainExpiry || '', p.progressStatusRaw || '', p.generalNote || '',
    p.id, nowIso_(),
    isDeleted_(p.deleted) ? 'TRUE' : 'FALSE',
  ];
}

// ============================================================================
// GÖREVLER row<->object transformerlar
// ============================================================================
const TASK_STATUSES = ['yapılacak','devam-ediyor','beklemede','incelemede','tamamlandı','iptal'];
const TASK_PRIORITIES = ['kritik','yüksek','orta','düşük'];
const TASK_ENERGIES = ['derin','orta','hafif'];

function normalizeEnum_(v, allowed, fallback) {
  if (!v) return fallback;
  const s = String(v).trim().toLowerCase();
  for (let i = 0; i < allowed.length; i++) {
    if (allowed[i].toLowerCase() === s) return allowed[i];
  }
  return fallback;
}

function rowToTask_(row, rowNumber, cfg) {
  const obj = {};
  for (let i = 0; i < cfg.colMap.length; i++) obj[cfg.colMap[i]] = row[i] === '' ? null : row[i];
  // type-coerce
  obj.status = normalizeEnum_(obj.status, TASK_STATUSES, 'yapılacak');
  obj.priority = normalizeEnum_(obj.priority, TASK_PRIORITIES, 'orta');
  obj.energyLevel = normalizeEnum_(obj.energyLevel, TASK_ENERGIES, 'orta');
  obj.isToday = asBool_(obj.isToday);
  obj.isNextStep = asBool_(obj.isNextStep);
  obj.estimatedMinutes = asInt_(obj.estimatedMinutes);
  obj.actualMinutes = asInt_(obj.actualMinutes);
  obj.startDate = asDate_(obj.startDate);
  obj.dueDate = asDate_(obj.dueDate);
  obj.completedAt = asDate_(obj.completedAt);
  obj.tags = asTags_(obj.tags);
  if (obj.createdAt instanceof Date) obj.createdAt = obj.createdAt.toISOString();
  if (obj.updatedAt instanceof Date) obj.updatedAt = obj.updatedAt.toISOString();
  obj.rowIndex = rowNumber - 1;
  if (!obj.id) obj.id = newId_('tsk');
  return obj;
}

function taskToRow_(t, cfg) {
  // Site tarafı status==='tamamlandı' geçirdiyse completedAt'ı bugüne kilitle
  let completedAt = t.completedAt || '';
  if (t.status === 'tamamlandı' && !completedAt) completedAt = todayIso_();
  if (t.status !== 'tamamlandı') completedAt = '';
  const createdAt = t.createdAt || nowIso_();
  return [
    t.title || '',
    t.description || '',
    normalizeEnum_(t.status, TASK_STATUSES, 'yapılacak'),
    normalizeEnum_(t.priority, TASK_PRIORITIES, 'orta'),
    normalizeEnum_(t.energyLevel, TASK_ENERGIES, 'orta'),
    asBool_(t.isToday) ? 'TRUE' : 'FALSE',
    asBool_(t.isNextStep) ? 'TRUE' : 'FALSE',
    t.estimatedMinutes != null ? t.estimatedMinutes : '',
    t.actualMinutes != null ? t.actualMinutes : '',
    t.startDate || '',
    t.dueDate || '',
    completedAt,
    t.blockedReason || '',
    t.dependsOnTaskId || '',
    t.resultNote || '',
    tagsToCell_(t.tags),
    t.relatedProjectId || '',
    t.relatedLearningId || '',
    t.id,
    createdAt,
    nowIso_(),
    isDeleted_(t.deleted) ? 'TRUE' : 'FALSE',
  ];
}

// ============================================================================
// HTTP HANDLERS
// ============================================================================
function doGet(e) {
  try {
    const tab = (e && e.parameter && e.parameter.tab) || 'projects';
    const includeDeleted = e && e.parameter && (e.parameter.include_deleted === 'true' || e.parameter.include_deleted === '1');
    const items = readAll_(tab, { includeDeleted: includeDeleted });
    // Geri uyumluluk: projects tab'inde 'projects' anahtarıyla döndür, diğerlerinde 'records'
    const payload = { ok: true, count: items.length, ts: nowIso_(), tab: tab };
    if (tab === 'projects') payload.projects = items;
    payload.records = items;
    return jsonOut_(payload);
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    let body = {};
    try { body = JSON.parse(e.postData.contents || '{}'); } catch (_) {}
    const tab = body.tab || 'projects';
    const action = body.action;
    const token = body.token || (e.parameter && e.parameter.token);
    if (!checkAuth_(token)) return jsonOut_({ ok: false, error: 'unauthorized' });

    const cfg = resolveTab_(tab);
    const sh = getSheet_(tab);
    const lock = LockService.getDocumentLock();
    lock.waitLock(10000);
    try {
      // record'u her tab için: projects→body.project, diğerleri→body.record (geri uyumlu hibrit)
      const record = body.record || body.project || {};

      if (action === 'upsert') {
        if (!record.id) record.id = (tab === 'projects')
          ? 'row-' + Date.now() + '-' + slugify_(record.name || 'proje')
          : newId_(cfg.idPrefix);
        if (!record.createdAt && tab !== 'projects') record.createdAt = nowIso_();
        const existing = findRowById_(tab, record.id);
        const rowVals = cfg.toRow(record, cfg);
        if (existing) {
          sh.getRange(existing, 1, 1, cfg.headers.length).setValues([rowVals]);
        } else {
          sh.appendRow(rowVals);
        }
        const written = cfg.toObject(rowVals, existing || sh.getLastRow(), cfg);
        return jsonOut_({ ok: true, record: written, project: tab === 'projects' ? written : undefined });
      }

      if (action === 'delete') {
        // SOFT DELETE
        const id = body.id;
        const r = findRowById_(tab, id);
        if (!r) return jsonOut_({ ok: false, error: 'not_found' });
        const cur = sh.getRange(r, 1, 1, cfg.headers.length).getValues()[0];
        const obj = cfg.toObject(cur, r, cfg);
        obj.deleted = true;
        sh.getRange(r, 1, 1, cfg.headers.length).setValues([cfg.toRow(obj, cfg)]);
        return jsonOut_({ ok: true, deletedId: id, soft: true });
      }

      if (action === 'restore') {
        const id = body.id;
        const r = findRowById_(tab, id);
        if (!r) return jsonOut_({ ok: false, error: 'not_found' });
        const cur = sh.getRange(r, 1, 1, cfg.headers.length).getValues()[0];
        const obj = cfg.toObject(cur, r, cfg);
        obj.deleted = false;
        sh.getRange(r, 1, 1, cfg.headers.length).setValues([cfg.toRow(obj, cfg)]);
        return jsonOut_({ ok: true, restoredId: id });
      }

      if (action === 'hardDelete') {
        const id = body.id;
        const r = findRowById_(tab, id);
        if (!r) return jsonOut_({ ok: false, error: 'not_found' });
        sh.deleteRow(r);
        return jsonOut_({ ok: true, hardDeletedId: id });
      }

      if (action === 'replaceAll') {
        const arr = body.records || body.projects || [];
        const last = sh.getLastRow();
        if (last > 1) sh.getRange(2, 1, last - 1, cfg.headers.length).clearContent();
        for (let i = 0; i < arr.length; i++) {
          const r = arr[i];
          if (!r.id) r.id = (tab === 'projects')
            ? 'row-' + (i + 1) + '-' + slugify_(r.name || 'proje')
            : newId_(cfg.idPrefix);
          sh.getRange(2 + i, 1, 1, cfg.headers.length).setValues([cfg.toRow(r, cfg)]);
        }
        return jsonOut_({ ok: true, count: arr.length });
      }

      return jsonOut_({ ok: false, error: 'unknown_action' });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

// ============================================================================
// BAKIM / ADMIN
// ============================================================================
function seedFromConstant() {
  if (typeof SEED_PROJECTS === 'undefined') {
    throw new Error('SEED_PROJECTS bulunamadı. seed.gs dosyasını ekle.');
  }
  const cfg = TABS.projects;
  const sh = getSheet_('projects');
  const last = sh.getLastRow();
  if (last > 1) sh.getRange(2, 1, last - 1, cfg.headers.length).clearContent();
  const rows = SEED_PROJECTS.map(p => cfg.toRow(p, cfg));
  if (rows.length) sh.getRange(2, 1, rows.length, cfg.headers.length).setValues(rows);
  Logger.log('Seeded ' + rows.length + ' projects');
}

// Görevler sekmesini elle initialize etmek için (ilk kullanım)
function initTasksTab() {
  getSheet_('tasks');
  Logger.log('Görevler sekmesi hazır.');
}
