import { useState, useEffect } from 'react';
import { Cloud, Save, RefreshCcw, CheckCircle2, AlertTriangle, ExternalLink, KeyRound, Timer, FileSpreadsheet } from 'lucide-react';
import {
  getSheetUrl, setSheetUrl, getAdminToken, setAdminToken,
  getPollSeconds, setPollSeconds, isLiveMode, fetchProjectsFromSheet, replaceAllInSheet,
} from '../sheetSync';
import { fetchProjectsAndApply } from '../store';

export default function SyncSettings({ data, setData }) {
  const [url, setUrl] = useState(getSheetUrl());
  const [token, setToken] = useState(getAdminToken());
  const [poll, setPoll] = useState(getPollSeconds());
  const [status, setStatus] = useState(null); // {ok, msg}
  const [busy, setBusy] = useState(false);

  useEffect(() => { setStatus(null); }, [url, token, poll]);

  const save = () => {
    setSheetUrl(url);
    setAdminToken(token);
    setPollSeconds(poll);
    setStatus({ ok: true, msg: 'Ayarlar kaydedildi.' });
  };

  const test = async () => {
    setBusy(true); setStatus(null);
    try {
      setSheetUrl(url); // ensure latest
      const r = await fetchProjectsFromSheet();
      setStatus({ ok: true, msg: `Bağlantı OK (${r.source}, ${r.projects.length} proje)` });
    } catch (e) {
      setStatus({ ok: false, msg: 'Hata: ' + e.message });
    } finally { setBusy(false); }
  };

  const refreshNow = async () => {
    setBusy(true); setStatus(null);
    try {
      const r = await fetchProjectsAndApply(setData);
      setStatus({ ok: true, msg: r ? `Güncellendi (${r.source}, ${r.count} proje)` : 'Bilinmeyen' });
    } catch (e) {
      setStatus({ ok: false, msg: 'Hata: ' + e.message });
    } finally { setBusy(false); }
  };

  const seedFromLocal = async () => {
    if (!confirm('Sheet üzerindeki TÜM satırlar silinip mevcut /projects.json içeriğiyle yeniden yazılacak. Devam edilsin mi?')) return;
    setBusy(true); setStatus(null);
    try {
      setSheetUrl(url); setAdminToken(token);
      const res = await fetch('/projects.json?t=' + Date.now());
      const arr = await res.json();
      const r = await replaceAllInSheet(arr);
      setStatus({ ok: true, msg: `Sheet doldurma tamam: ${r.count} proje` });
      await fetchProjectsAndApply(setData);
    } catch (e) {
      setStatus({ ok: false, msg: 'Hata: ' + e.message });
    } finally { setBusy(false); }
  };

  const live = isLiveMode();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Cloud size={22} className="text-primary" /> Google Sheet Senkronizasyonu
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Site projeler kısmı, Drive'daki Google Sheet ile iki yönlü canlı senkron çalışır.
          {live ? (
            <span className="ml-2 inline-flex items-center gap-1 text-success">
              <CheckCircle2 size={13} /> Canlı mod
            </span>
          ) : (
            <span className="ml-2 inline-flex items-center gap-1 text-warm">
              <AlertTriangle size={13} /> Sheet bağlı değil — projects.json okuyor
            </span>
          )}
        </p>
      </div>

      <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-text-muted flex items-center gap-1.5"><FileSpreadsheet size={13} /> Apps Script Web App URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="w-full mt-1 px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm font-mono"
          />
          <p className="text-[11px] text-text-muted mt-1">
            Apps Script editöründe <code>Deploy → New deployment → Type: Web app</code>'ten alacağın URL.
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-text-muted flex items-center gap-1.5"><KeyRound size={13} /> Admin Token</label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Code.gs içindeki ADMIN_TOKEN ile aynı"
            className="w-full mt-1 px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm font-mono"
          />
          <p className="text-[11px] text-text-muted mt-1">Yazma işlemleri (oluştur/güncelle/sil) bu tokenla doğrulanır.</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-text-muted flex items-center gap-1.5"><Timer size={13} /> Polling süresi (saniye)</label>
          <input
            type="number"
            min={5}
            value={poll}
            onChange={(e) => setPoll(parseInt(e.target.value || '30', 10))}
            className="w-32 mt-1 px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm"
          />
          <p className="text-[11px] text-text-muted mt-1">Site bu aralıkla Sheet'i tekrar okur — sheet'te yapılan değişiklik bu sürede siteye yansır.</p>
        </div>

        {status && (
          <div className={`text-sm rounded-lg px-3 py-2 ${status.ok ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
            {status.msg}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border-light dark:border-border-dark">
          <button onClick={save} className="px-4 py-2 bg-primary text-white rounded-lg text-sm flex items-center gap-1.5 hover:bg-primary-dark transition-colors">
            <Save size={14} /> Kaydet
          </button>
          <button disabled={busy} onClick={test} className="px-4 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm flex items-center gap-1.5 disabled:opacity-50">
            <CheckCircle2 size={14} /> Bağlantı Testi
          </button>
          <button disabled={busy} onClick={refreshNow} className="px-4 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm flex items-center gap-1.5 disabled:opacity-50">
            <RefreshCcw size={14} /> Şimdi Yenile
          </button>
          <button disabled={busy} onClick={seedFromLocal} className="px-4 py-2 bg-warm/10 text-warm border border-warm/20 rounded-lg text-sm disabled:opacity-50">
            Sheet'i projects.json ile doldur
          </button>
        </div>
      </div>

      <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5 text-sm space-y-3">
        <h2 className="font-semibold text-base">Kurulum Adımları</h2>
        <ol className="list-decimal pl-5 space-y-2 text-text-muted">
          <li>
            Drive klasöründe (<a className="text-primary hover:underline inline-flex items-center gap-1" href="https://drive.google.com/drive/folders/130ZtMupBUogh5s6InNO_ceF56mn0urBb" target="_blank" rel="noreferrer">Ocianix Projeler<ExternalLink size={11} /></a>) yeni bir Google Sheet oluştur. Adı: <b>Ocianix Projeler Master</b>.
          </li>
          <li>İlk sekmenin adını <code>Sayfa1</code> olarak bırak.</li>
          <li>Sheet'te <code>Extensions → Apps Script</code> aç. Proje klasöründeki <code>apps_script/Code.gs</code> ve <code>apps_script/seed.gs</code> dosyalarını yapıştır.</li>
          <li><code>ADMIN_TOKEN</code> değerini güçlü bir string ile değiştir, kaydet.</li>
          <li>Apps Script editöründen <code>seedFromConstant</code> fonksiyonunu bir kez çalıştır — Excel'deki tüm projeler sheet'e yazılır.</li>
          <li><code>Deploy → New deployment → Type: Web app</code>, Execute: <i>Me</i>, Access: <i>Anyone</i>. URL'yi kopyala, yukarıdaki kutuya yapıştır + tokenı gir, Kaydet.</li>
          <li>"Bağlantı Testi" → yeşil OK göreceksin. Polling otomatik başlar.</li>
        </ol>
      </div>

      <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5 text-sm space-y-2">
        <h2 className="font-semibold text-base">Şu anki kaynak</h2>
        <p className="text-text-muted">
          Source: <code>{data?._projectSource || 'static'}</code> · Son sync: <code>{data?._projectSyncedAt || '—'}</code> · Toplam: <b>{data?.projects?.length || 0}</b> proje
        </p>
      </div>
    </div>
  );
}
