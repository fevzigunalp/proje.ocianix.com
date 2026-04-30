// Google Sheet ↔ site iki yönlü senkron istemcisi (multi-tab).
// Apps Script Web App URL ve admin token localStorage'tan veya VITE_* env'den okunur.

const URL_KEY = 'sheetApiUrl';
const TOKEN_KEY = 'sheetAdminToken';
const POLL_KEY = 'sheetPollSeconds';

export function getSheetUrl() {
  const ls = typeof localStorage !== 'undefined' ? localStorage.getItem(URL_KEY) : '';
  return (ls || import.meta.env.VITE_SHEET_API_URL || '').trim();
}
export function setSheetUrl(v) {
  if (typeof localStorage === 'undefined') return;
  if (v) localStorage.setItem(URL_KEY, v.trim());
  else localStorage.removeItem(URL_KEY);
}
export function getAdminToken() {
  const ls = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : '';
  return (ls || import.meta.env.VITE_SHEET_ADMIN_TOKEN || '').trim();
}
export function setAdminToken(v) {
  if (typeof localStorage === 'undefined') return;
  if (v) localStorage.setItem(TOKEN_KEY, v.trim());
  else localStorage.removeItem(TOKEN_KEY);
}
export function getPollSeconds() {
  const ls = typeof localStorage !== 'undefined' ? localStorage.getItem(POLL_KEY) : '';
  const n = parseInt(ls || '30', 10);
  return Number.isFinite(n) && n >= 5 ? n : 30;
}
export function setPollSeconds(v) {
  if (typeof localStorage === 'undefined') return;
  if (v) localStorage.setItem(POLL_KEY, String(v));
  else localStorage.removeItem(POLL_KEY);
}

export function isLiveMode() {
  return !!getSheetUrl();
}

// ----- Generic GET / POST -----

async function getRecords(tab) {
  const url = getSheetUrl();
  if (!url) {
    if (tab === 'projects') {
      const res = await fetch('/projects.json?t=' + Date.now());
      if (!res.ok) throw new Error('projects.json fetch failed');
      const arr = await res.json();
      return { source: 'static', records: arr };
    }
    // Diğer tablar için statik fallback yok — boş dön
    return { source: 'static', records: [] };
  }
  const sep = url.includes('?') ? '&' : '?';
  const res = await fetch(`${url}${sep}tab=${encodeURIComponent(tab)}&t=${Date.now()}`, {
    method: 'GET',
    redirect: 'follow',
  });
  if (!res.ok) throw new Error('Sheet API GET failed: ' + res.status);
  const data = await res.json();
  if (!data.ok) throw new Error('Sheet API error: ' + data.error);
  // Apps Script multi-tab güncellemesi yapılmadıysa response'da tab alanı yoktur
  // ve hangi sekme istendiyse istensin Sayfa1 (projects) döner. Yanlış sekme verisini
  // hedef state'e yazmamak için "tasks" istenip projeler dönüyorsa boş kabul et.
  if (tab !== 'projects' && data.tab !== tab) {
    console.warn(`[sync] Apps Script multi-tab güncellemesi yapılmamış — ${tab} sekmesi şu an boş döndürülecek.`);
    return { source: 'sheet-legacy', records: [], ts: data.ts };
  }
  const records = data.records || data.projects || [];
  return { source: 'sheet', records, ts: data.ts };
}

async function postAction(tab, body) {
  const url = getSheetUrl();
  const token = getAdminToken();
  if (!url) throw new Error('Sheet API URL ayarlanmamış');
  if (!token) throw new Error('Admin token ayarlanmamış');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...body, tab, token }),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error('Sheet API POST failed: ' + res.status);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'unknown');
  return data;
}

// ----- Projects (geri uyumlu wrapper'lar — eski isimler) -----

export async function fetchProjectsFromSheet() {
  const r = await getRecords('projects');
  return { source: r.source, projects: r.records, ts: r.ts };
}

export async function upsertProjectToSheet(project) {
  return postAction('projects', { action: 'upsert', record: project });
}

export async function deleteProjectFromSheet(id) {
  return postAction('projects', { action: 'delete', id });
}

export async function replaceAllInSheet(projects) {
  return postAction('projects', { action: 'replaceAll', records: projects });
}

// ----- Generic helpers (yeni tablar için) -----

export async function fetchTabRecords(tab) {
  return getRecords(tab);
}

export async function upsertRecord(tab, record) {
  return postAction(tab, { action: 'upsert', record });
}

export async function deleteRecord(tab, id) {
  return postAction(tab, { action: 'delete', id });
}

export async function restoreRecord(tab, id) {
  return postAction(tab, { action: 'restore', id });
}
