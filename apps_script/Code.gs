/**
 * proje.ocianix.com  ↔  Google Sheet  iki yönlü senkron köprüsü
 *
 * KURULUM:
 * 1. Google Sheet aç → Extensions → Apps Script → bu kodu yapıştır.
 * 2. SHEET_NAME ve ADMIN_TOKEN'ı kendi değerlerinle güncelle.
 * 3. Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    Deploy URL'sini al, sitedeki Ayarlar panelinde "Sheet API URL" alanına yapıştır.
 * 4. Aynı tokenı sitedeki "Admin Token" alanına gir.
 *
 * Sheet 1. satır (başlıklar) — Excel ile birebir:
 * A: Projeyi Yapan İşletme
 * B: Proje Sahibi İşetme
 * C: Proje Türü
 * D: Proje Ocianix'te Yayınlanacakmı
 * E: Proje İş Alanı
 * F: İş Alt Kolu
 * G: Proje & Firma & İş  Adı
 * H: Proje Açıklama
 * I: Proje Dosya Yolu
 * J: Web Sitesi
 * K: Domain Bitiş Tarihi
 * L: Proje İlerleme Drumu
 * M: Genel Açıklama
 * N: id              (otomatik — site oluşturuyor / koruyor)
 * O: updatedAt       (otomatik — her yazıldığında ISO timestamp)
 */

const SHEET_NAME = 'Sayfa1';                   // sheet sekmesi adı
const ADMIN_TOKEN = 'CHANGE_ME_STRONG_TOKEN';  // güçlü bir token koy, sitede aynısını kullan

const HEADERS = [
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
];

// Excel kolon → JSON alanı eşleşmesi
const COL_MAP = [
  'makerCompany',       // A
  'ownerCompany',       // B
  'projectTypeRaw',     // C
  'publishOnOcianix',   // D
  'businessArea',       // E
  'subBusiness',        // F
  'name',               // G
  'description',        // H
  'folderPath',         // I
  'websiteUrlRaw',      // J
  'domainExpiry',       // K
  'progressStatusRaw',  // L
  'generalNote',        // M
  'id',                 // N
  'updatedAt',          // O
];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(SHEET_NAME);
  if (!s) s = ss.insertSheet(SHEET_NAME);
  // ensure headers
  const firstRow = s.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  if (firstRow.join('|') !== HEADERS.join('|')) {
    s.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    s.setFrozenRows(1);
  }
  return s;
}

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
  return ({ idea: 0, draft: 15, in_progress: 50, paused: 30, optimization: 85, live: 100 })[s] || 0;
}

function normalizeUrl_(raw) {
  if (raw === null || raw === undefined || String(raw).trim() === '') return { raw: null, url: null, placeholder: null };
  const rr = String(raw).trim();
  const lower = rr.toLowerCase();
  const placeholderKeywords = ['bulunacak', 'alınacak', 'alinacak', 'taşınacak', 'tasinacak'];
  if (placeholderKeywords.some(k => lower.indexOf(k) >= 0) && lower.indexOf('http') !== 0) {
    return { raw: null, url: null, placeholder: rr };
  }
  if (lower.indexOf('http') === 0) return { raw: rr, url: rr, placeholder: null };
  if (/^[a-z0-9.-]+\.[a-z]{2,}/i.test(rr)) return { raw: rr, url: 'https://' + rr, placeholder: null };
  return { raw: rr, url: null, placeholder: rr };
}

function slugify_(name) {
  if (!name) return 'proje';
  let s = String(name).toLowerCase();
  s = s.replace(/[İı]/g, 'i').replace(/[Ğğ]/g, 'g').replace(/[Şş]/g, 's')
       .replace(/[Çç]/g, 'c').replace(/[Öö]/g, 'o').replace(/[Üü]/g, 'u');
  s = s.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return s || 'proje';
}

function nowIso_() { return new Date().toISOString(); }

function rowToProject_(row, rowNumber) {
  const obj = {};
  for (let i = 0; i < COL_MAP.length; i++) obj[COL_MAP[i]] = row[i] === '' ? null : row[i];
  // domain expiry: Excel may give Date object — convert
  if (obj.domainExpiry instanceof Date) {
    obj.domainExpiry = Utilities.formatDate(obj.domainExpiry, 'UTC', 'yyyy-MM-dd');
  } else if (typeof obj.domainExpiry === 'number') {
    const ms = (obj.domainExpiry - 25569) * 86400 * 1000;
    obj.domainExpiry = Utilities.formatDate(new Date(ms), 'UTC', 'yyyy-MM-dd');
  }
  // url normalize
  const u = normalizeUrl_(obj.websiteUrlRaw);
  obj.websiteUrl = u.url;
  obj.websiteUrlPlaceholder = u.placeholder;
  obj.websiteUrlRaw = u.raw;
  // derived
  obj.status = statusFromRaw_(obj.progressStatusRaw);
  obj.projectType = typeFromRaw_(obj.projectTypeRaw);
  obj.progress = progressForStatus_(obj.status);
  // numbering
  obj.rowIndex = rowNumber - 1; // header is row 1
  // ensure id
  if (!obj.id) obj.id = 'row-' + String(obj.rowIndex).padStart(2, '0') + '-' + slugify_(obj.name || ('proje-' + obj.rowIndex));
  // updatedAt
  if (obj.updatedAt instanceof Date) obj.updatedAt = obj.updatedAt.toISOString();
  return obj;
}

function readAllProjects_() {
  const sh = getSheet_();
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];
  const range = sh.getRange(2, 1, lastRow - 1, HEADERS.length);
  const values = range.getValues();
  const list = [];
  for (let i = 0; i < values.length; i++) {
    // skip fully blank rows
    const row = values[i];
    if (row.every(v => v === '' || v === null)) continue;
    list.push(rowToProject_(row, i + 2));
  }
  return list;
}

function findRowById_(id) {
  const sh = getSheet_();
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return null;
  const ids = sh.getRange(2, 14, lastRow - 1, 1).getValues(); // column N = id
  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) return i + 2;
  }
  return null;
}

function projectToRow_(p) {
  return [
    p.makerCompany || '',
    p.ownerCompany || '',
    p.projectTypeRaw || '',
    p.publishOnOcianix || '',
    p.businessArea || '',
    p.subBusiness || '',
    p.name || '',
    p.description || '',
    p.folderPath || '',
    p.websiteUrlRaw || p.websiteUrl || p.websiteUrlPlaceholder || '',
    p.domainExpiry || '',
    p.progressStatusRaw || '',
    p.generalNote || '',
    p.id,
    nowIso_(),
  ];
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function checkAuth_(token) {
  return token && String(token) === String(ADMIN_TOKEN);
}

// ---- HTTP handlers ----
function doGet(e) {
  try {
    const projects = readAllProjects_();
    return jsonOut_({ ok: true, projects: projects, count: projects.length, ts: nowIso_() });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    let body = {};
    try { body = JSON.parse(e.postData.contents || '{}'); } catch (_) {}
    const action = body.action;
    const token = body.token || (e.parameter && e.parameter.token);
    if (!checkAuth_(token)) return jsonOut_({ ok: false, error: 'unauthorized' });

    const sh = getSheet_();
    const lock = LockService.getDocumentLock();
    lock.waitLock(10000);
    try {
      if (action === 'upsert') {
        const p = body.project || {};
        if (!p.id) p.id = 'row-' + Date.now() + '-' + slugify_(p.name || 'proje');
        const existing = findRowById_(p.id);
        const rowVals = projectToRow_(p);
        if (existing) {
          sh.getRange(existing, 1, 1, HEADERS.length).setValues([rowVals]);
        } else {
          sh.appendRow(rowVals);
        }
        return jsonOut_({ ok: true, project: rowToProject_(rowVals, existing || sh.getLastRow()) });
      }
      if (action === 'delete') {
        const id = body.id;
        const r = findRowById_(id);
        if (!r) return jsonOut_({ ok: false, error: 'not_found' });
        sh.deleteRow(r);
        return jsonOut_({ ok: true, deletedId: id });
      }
      if (action === 'replaceAll') {
        const arr = body.projects || [];
        // wipe rows except header
        const last = sh.getLastRow();
        if (last > 1) sh.getRange(2, 1, last - 1, HEADERS.length).clearContent();
        for (let i = 0; i < arr.length; i++) {
          const p = arr[i];
          if (!p.id) p.id = 'row-' + (i + 1) + '-' + slugify_(p.name || 'proje');
          sh.getRange(2 + i, 1, 1, HEADERS.length).setValues([projectToRow_(p)]);
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

// ---- one-time seed (Excel verisi ile sheet'i doldurmak için) ----
// Seed JSON'u Code.gs içine paste etmektense, başka bir dosyada (seed.gs)
// "const SEED_PROJECTS = [...];" şeklinde tut, sonra Apps Script editöründen
// `seedFromConstant()` fonksiyonunu çalıştır.
function seedFromConstant() {
  if (typeof SEED_PROJECTS === 'undefined') {
    throw new Error('SEED_PROJECTS bulunamadı. seed.gs dosyasını ekle.');
  }
  const sh = getSheet_();
  const last = sh.getLastRow();
  if (last > 1) sh.getRange(2, 1, last - 1, HEADERS.length).clearContent();
  const rows = SEED_PROJECTS.map(p => projectToRow_(p));
  if (rows.length) sh.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
  Logger.log('Seeded ' + rows.length + ' rows');
}
