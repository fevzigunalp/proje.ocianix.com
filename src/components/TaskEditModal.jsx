import { useState, useMemo } from 'react';
import { X, Save, Loader2, Zap } from 'lucide-react';
import { isLiveMode } from '../sheetSync';
import {
  TASK_STATUSES, TASK_STATUS_LABELS,
  PRIORITIES, PRIORITY_LABELS,
  ENERGY_LEVELS, ENERGY_LABELS,
} from '../store';

export default function TaskEditModal({ task, projects, onClose, onSave }) {
  const isNew = !task?.id;
  const [form, setForm] = useState(() => ({
    id: task?.id,
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    energyLevel: task?.energyLevel || 'medium',
    isToday: !!task?.isToday,
    isNextStep: !!task?.isNextStep,
    estimatedMinutes: task?.estimatedMinutes ?? '',
    actualMinutes: task?.actualMinutes ?? '',
    startDate: task?.startDate || '',
    dueDate: task?.dueDate || '',
    completedAt: task?.completedAt || '',
    blockedReason: task?.blockedReason || '',
    dependsOnTaskId: task?.dependsOnTaskId || task?.parentTaskId || '',
    resultNote: task?.resultNote || '',
    tags: Array.isArray(task?.tags) ? task.tags.join(', ') : (task?.tags || ''),
    relatedProjectId: task?.relatedProjectId || task?.projectId || '',
    relatedLearningId: task?.relatedLearningId || task?.learningItemId || '',
    createdAt: task?.createdAt || '',
  }));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const live = isLiveMode();

  const valid = useMemo(() => (form.title || '').trim().length > 0, [form.title]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!valid) { setErr('Başlık zorunlu'); return; }
    setSaving(true); setErr(null);
    try {
      const payload = {
        ...form,
        estimatedMinutes: form.estimatedMinutes === '' ? null : Number(form.estimatedMinutes),
        actualMinutes: form.actualMinutes === '' ? null : Number(form.actualMinutes),
        tags: typeof form.tags === 'string'
          ? form.tags.split(',').map((s) => s.trim()).filter(Boolean)
          : form.tags,
      };
      // boş stringleri null'a çek
      Object.keys(payload).forEach((k) => { if (payload[k] === '') payload[k] = null; });
      await onSave(payload);
    } catch (e) {
      setErr(e.message || String(e));
    } finally { setSaving(false); }
  };

  const Section = ({ children, title }) => (
    <div className="space-y-3 pb-4 border-b border-border-light/50 dark:border-border-dark/50 last:border-0 last:pb-0">
      {title && <h3 className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{title}</h3>}
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border-light dark:border-border-dark sticky top-0 bg-surface dark:bg-surface-dark-alt z-10">
          <div>
            <h2 className="text-lg font-bold">{isNew ? 'Yeni Görev' : 'Görevi Düzenle'}</h2>
            <p className="text-xs text-text-muted mt-0.5">
              {live ? "Kaydedince Görevler sekmesine yazılır." : 'Canlı sync kapalı — yalnızca yerel state.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-primary/10"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Başlık + açıklama */}
          <Section title="Temel">
            <div>
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Başlık <span className="text-danger">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="1 cümlede ne yapılacak"
                autoFocus
                className="w-full mt-1 px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Açıklama</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Detay (markdown ok)"
                className="w-full mt-1 px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm resize-y"
              />
            </div>
          </Section>

          {/* Durum / Öncelik / Enerji */}
          <Section title="Sınıflandırma">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Durum</label>
                <select value={form.status} onChange={(e) => set('status', e.target.value)} className="w-full mt-1 px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm">
                  {TASK_STATUSES.map((s) => <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Öncelik</label>
                <select value={form.priority} onChange={(e) => set('priority', e.target.value)} className="w-full mt-1 px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm">
                  {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Enerji</label>
                <select value={form.energyLevel} onChange={(e) => set('energyLevel', e.target.value)} className="w-full mt-1 px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm">
                  {ENERGY_LEVELS.map((e) => <option key={e} value={e}>{ENERGY_LABELS[e]}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isToday} onChange={(e) => set('isToday', e.target.checked)} className="w-4 h-4 accent-primary" />
                <Zap size={14} className="text-primary" /> Bugün yap
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isNextStep} onChange={(e) => set('isNextStep', e.target.checked)} className="w-4 h-4 accent-primary" />
                Sonraki adım (proje pinine sabitle)
              </label>
            </div>
          </Section>

          {/* Tarihler + süreler */}
          <Section title="Zaman">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Başlangıç</label>
                <input type="date" value={form.startDate || ''} onChange={(e) => set('startDate', e.target.value)} className="w-full mt-1 px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Termin</label>
                <input type="date" value={form.dueDate || ''} onChange={(e) => set('dueDate', e.target.value)} className="w-full mt-1 px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Tahmini (dk)</label>
                <input type="number" min={0} value={form.estimatedMinutes} onChange={(e) => set('estimatedMinutes', e.target.value)} placeholder="60" className="w-full mt-1 px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Gerçekleşen (dk)</label>
                <input type="number" min={0} value={form.actualMinutes} onChange={(e) => set('actualMinutes', e.target.value)} className="w-full mt-1 px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Tamamlanma</label>
                <input type="date" value={form.completedAt || ''} onChange={(e) => set('completedAt', e.target.value)} className="w-full mt-1 px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm" />
                <p className="text-[10px] text-text-muted mt-0.5">Status "tamamlandı" → otomatik dolar</p>
              </div>
            </div>
          </Section>

          {/* Bağlantılar */}
          <Section title="Bağlantılar">
            <div>
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Bağlı Proje</label>
              <select value={form.relatedProjectId || ''} onChange={(e) => set('relatedProjectId', e.target.value)} className="w-full mt-1 px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm">
                <option value="">— bağımsız —</option>
                {(projects || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Bağımlı Görev (id)</label>
              <input type="text" value={form.dependsOnTaskId} onChange={(e) => set('dependsOnTaskId', e.target.value)} placeholder="tsk-..." className="w-full mt-1 px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm font-mono" />
              <p className="text-[10px] text-text-muted mt-0.5">Bu görev, başka bir görev bittikten sonra yapılabilir</p>
            </div>
          </Section>

          {/* Engellendi / sonuç notu */}
          <Section title="Detay">
            <div>
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Engellendi (sebep)</label>
              <input type="text" value={form.blockedReason} onChange={(e) => set('blockedReason', e.target.value)} placeholder='Örn: "Mustafa onay verecek"' className="w-full mt-1 px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Sonuç Notu</label>
              <textarea rows={2} value={form.resultNote} onChange={(e) => set('resultNote', e.target.value)} placeholder="İş bitince ne çıktı (tek satır)" className="w-full mt-1 px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm resize-y" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Etiketler (virgülle)</label>
              <input type="text" value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="#deploy, #bug, #test" className="w-full mt-1 px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm" />
            </div>
          </Section>
        </div>

        {err && <div className="mx-5 mb-3 px-3 py-2 bg-danger/10 text-danger text-sm rounded-lg">{err}</div>}

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
