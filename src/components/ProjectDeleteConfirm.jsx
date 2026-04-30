import { useState } from 'react';
import { AlertTriangle, X, Loader2, Trash2 } from 'lucide-react';

const REQUIRED = 'SİL';

// Generic delete confirm — `entity` herhangi bir kayıt (proje, görev, ...)
// label = ekranda gösterilecek kayıt adı
export default function ProjectDeleteConfirm({ project, entity, label, kindLabel, onClose, onConfirm }) {
  const target = entity || project;  // backward compat
  const displayLabel = label || target?.name || target?.title || 'Kayıt';
  const kind = kindLabel || (project ? 'projeyi' : 'kaydı');
  const [stage, setStage] = useState(1);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  if (!target) return null;
  const matches = typed === REQUIRED;

  const handleConfirm = async () => {
    if (!matches) return;
    setBusy(true); setErr(null);
    try {
      await onConfirm(target.id);
    } catch (e) {
      setErr(e.message || String(e));
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-border-light dark:border-border-dark">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold">{kind === 'görevi' ? 'Görevi Sil' : kind === 'kaydı' ? 'Kaydı Sil' : 'Projeyi Sil'}</h2>
              <p className="text-xs text-text-muted mt-0.5 break-words">{displayLabel}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-primary/10"><X size={16} /></button>
        </div>

        {stage === 1 && (
          <div className="p-5 space-y-4">
            <p className="text-sm leading-relaxed">
              <strong>Bu {kind} silmek istediğine emin misin?</strong>
            </p>
            <p className="text-xs text-text-muted leading-relaxed">
              Soft delete yapılır — Sheet'te kayıt korunur ve <code className="px-1 py-0.5 bg-surface-alt dark:bg-surface-dark rounded text-[10px]">deleted=TRUE</code> bayrağı atılır. Listede ve düzenleme ekranında gözükmez. İleride geri alınabilir.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={onClose} className="px-4 py-2 text-sm text-text-muted">Vazgeç</button>
              <button
                onClick={() => setStage(2)}
                className="px-4 py-2 bg-danger/10 text-danger border border-danger/20 rounded-lg text-sm font-medium hover:bg-danger/20"
              >
                Devam Et
              </button>
            </div>
          </div>
        )}

        {stage === 2 && (
          <div className="p-5 space-y-3">
            <p className="text-sm">
              Onaylamak için aşağıya <code className="px-1.5 py-0.5 bg-danger/10 text-danger rounded font-mono text-xs font-bold">{REQUIRED}</code> yaz.
            </p>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && matches) handleConfirm(); }}
              autoFocus
              spellCheck={false}
              autoCapitalize="characters"
              placeholder={REQUIRED}
              className="w-full px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-danger/30 focus:border-danger"
            />
            {err && <div className="px-3 py-2 bg-danger/10 text-danger text-xs rounded-lg">{err}</div>}
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={onClose} className="px-4 py-2 text-sm text-text-muted">Vazgeç</button>
              <button
                onClick={handleConfirm}
                disabled={!matches || busy}
                className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-danger/90"
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Sil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
