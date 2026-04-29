import { useState, useMemo } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { isLiveMode } from '../sheetSync';

// Excel başlıkları → form alanları (sheet ile birebir)
const FIELDS = [
  { key: 'makerCompany',      label: 'Projeyi Yapan İşletme', type: 'text' },
  { key: 'ownerCompany',      label: 'Proje Sahibi İşletme',  type: 'text' },
  { key: 'projectTypeRaw',    label: 'Proje Türü',            type: 'select', options: ['Web Sitesi', 'SaaS', 'Uygulama', 'Otomasyon', 'Diğer'] },
  { key: 'publishOnOcianix',  label: "Proje Ocianix'te Yayınlanacakmı", type: 'select', options: ['', 'Evet', 'Hayır'] },
  { key: 'businessArea',      label: 'Proje İş Alanı',        type: 'text' },
  { key: 'subBusiness',       label: 'İş Alt Kolu',           type: 'text' },
  { key: 'name',              label: 'Proje & Firma & İş Adı', type: 'text', required: true },
  { key: 'description',       label: 'Proje Açıklama',        type: 'textarea' },
  { key: 'folderPath',        label: 'Proje Dosya Yolu',      type: 'text' },
  { key: 'websiteUrlRaw',     label: 'Web Sitesi',            type: 'text' },
  { key: 'domainExpiry',      label: 'Domain Bitiş Tarihi',   type: 'date' },
  { key: 'progressStatusRaw', label: 'Proje İlerleme Durumu', type: 'select', options: ['Fikir Aşamasında', 'Taslakta Başlanacak', 'Yapım Aşamsında', 'Ara verildi', 'Optimizasyonları Kaldı', 'Bitti - Yayında'] },
  { key: 'generalNote',       label: 'Genel Açıklama',        type: 'textarea' },
];

export default function ProjectEditModal({ project, onClose, onSave }) {
  const isNew = !project?.id;
  const [form, setForm] = useState(() => {
    const base = {};
    FIELDS.forEach((f) => { base[f.key] = project?.[f.key] || ''; });
    return { ...project, ...base };
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const live = isLiveMode();

  const valid = useMemo(() => (form.name || '').trim().length > 0, [form.name]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!valid) { setErr('Proje adı zorunlu'); return; }
    setSaving(true); setErr(null);
    try {
      const payload = { ...form };
      // empty strings → null for cleanliness
      Object.keys(payload).forEach((k) => { if (payload[k] === '') payload[k] = null; });
      await onSave(payload);
    } catch (e) {
      setErr(e.message || String(e));
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border-light dark:border-border-dark sticky top-0 bg-surface dark:bg-surface-dark-alt z-10">
          <div>
            <h2 className="text-lg font-bold">{isNew ? 'Yeni Proje' : 'Projeyi Düzenle'}</h2>
            <p className="text-xs text-text-muted mt-0.5">
              {live ? 'Kaydedince Google Sheet\'e yazılır.' : 'Canlı sync kapalı — yalnızca yerel state güncellenir.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-primary/10"><X size={18} /></button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {FIELDS.map((f) => (
            <div key={f.key} className={f.type === 'textarea' ? 'md:col-span-2' : ''}>
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">
                {f.label}{f.required && <span className="text-danger ml-0.5">*</span>}
              </label>
              {f.type === 'select' ? (
                <select
                  value={form[f.key] || ''}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm"
                >
                  {f.options.map((o) => <option key={o} value={o}>{o || '— seçiniz —'}</option>)}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea
                  rows={3}
                  value={form[f.key] || ''}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm resize-y"
                />
              ) : (
                <input
                  type={f.type}
                  value={form[f.key] || ''}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm"
                />
              )}
            </div>
          ))}
        </div>

        {err && (
          <div className="mx-5 mb-3 px-3 py-2 bg-danger/10 text-danger text-sm rounded-lg">{err}</div>
        )}

        <div className="p-5 border-t border-border-light dark:border-border-dark sticky bottom-0 bg-surface dark:bg-surface-dark-alt flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-text-muted">Vazgeç</button>
          <button
            onClick={handleSave}
            disabled={saving || !valid}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm flex items-center gap-1.5 disabled:opacity-50 hover:bg-primary-dark transition-colors"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isNew ? 'Oluştur' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
