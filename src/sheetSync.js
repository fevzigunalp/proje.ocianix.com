// Google Sheet ↔ site iki yönlü senkron istemcisi.
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

// Read all projects from Sheet (or fall back to /projects.json)
export async function fetchProjectsFromSheet() {
  const url = getSheetUrl();
  if (!url) {
    // Fallback to static JSON
    const res = await fetch('/projects.json?t=' + Date.now());
    if (!res.ok) throw new Error('projects.json fetch failed');
    const arr = await res.json();
    return { source: 'static', projects: arr };
  }
  const res = await fetch(url + (url.includes('?') ? '&' : '?') + 't=' + Date.now(), {
    method: 'GET',
    redirect: 'follow',
  });
  if (!res.ok) throw new Error('Sheet API GET failed: ' + res.status);
  const data = await res.json();
  if (!data.ok) throw new Error('Sheet API error: ' + data.error);
  return { source: 'sheet', projects: data.projects || [], ts: data.ts };
}

async function postSheet(body) {
  const url = getSheetUrl();
  const token = getAdminToken();
  if (!url) throw new Error('Sheet API URL ayarlanmamış');
  if (!token) throw new Error('Admin token ayarlanmamış');
  // Apps Script web app çağrılarında preflight'tan kaçınmak için text/plain kullanıyoruz.
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...body, token }),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error('Sheet API POST failed: ' + res.status);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'unknown');
  return data;
}

export async function upsertProjectToSheet(project) {
  return postSheet({ action: 'upsert', project });
}

export async function deleteProjectFromSheet(id) {
  return postSheet({ action: 'delete', id });
}

export async function replaceAllInSheet(projects) {
  return postSheet({ action: 'replaceAll', projects });
}
