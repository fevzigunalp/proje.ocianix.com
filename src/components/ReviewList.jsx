import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { REVIEW_TYPE_LABELS } from '../store';

const typeColors = { daily: 'bg-warm-light/20 text-text-muted', weekly: 'bg-primary/10 text-primary', monthly: 'bg-accent/10 text-accent', milestone: 'bg-warm/10 text-warm', learning_review: 'bg-success/10 text-success' };

export default function ReviewList({ data, update, remove }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ reviewType: 'weekly', projectId: '', completedSummary: '', blockedSummary: '', learnedSummary: '', nextFocus: '', decisionsTaken: '', score: 7 });
  const today = new Date().toISOString().slice(0, 10);

  const reviews = [...data.reviews].sort((a, b) => (b.reviewDate || b.createdAt || '').localeCompare(a.reviewDate || a.createdAt || ''));

  const addReview = () => {
    update('reviews', {
      id: uuidv4(), projectId: form.projectId || null, learningItemId: null, reviewType: form.reviewType,
      reviewDate: today, completedSummary: form.completedSummary, blockedSummary: form.blockedSummary,
      learnedSummary: form.learnedSummary, nextFocus: form.nextFocus, decisionsTaken: form.decisionsTaken,
      score: Number(form.score), createdAt: today,
    });
    setForm({ reviewType: 'weekly', projectId: '', completedSummary: '', blockedSummary: '', learnedSummary: '', nextFocus: '', decisionsTaken: '', score: 7 });
    setShowForm(false);
  };

  const avgScore = reviews.length ? (reviews.reduce((s, r) => s + (r.score || 0), 0) / reviews.length).toFixed(1) : '-';

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">İlerleme & Reviewlar</h1>
          <p className="text-sm text-text-muted">{reviews.length} kayıt · Ortalama skor: {avgScore}/10</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium">
          <Plus size={16} /> Yeni Review
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {['daily', 'weekly', 'monthly', 'milestone'].map((type) => {
          const count = reviews.filter((r) => r.reviewType === type).length;
          return (
            <div key={type} className={`${typeColors[type]} rounded-xl p-3 text-center`}>
              <p className="text-xl font-bold">{count}</p>
              <p className="text-xs">{REVIEW_TYPE_LABELS[type]}</p>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5 space-y-3">
          <div className="flex gap-3">
            <select value={form.reviewType} onChange={(e) => setForm({ ...form, reviewType: e.target.value })} className="px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-sm">
              {Object.entries(REVIEW_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className="flex-1 px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-sm">
              <option value="">Genel Review</option>
              {data.projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <textarea value={form.completedSummary} onChange={(e) => setForm({ ...form, completedSummary: e.target.value })} placeholder="Bu dönemde ne yapıldı?" rows={2} className="w-full px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <textarea value={form.blockedSummary} onChange={(e) => setForm({ ...form, blockedSummary: e.target.value })} placeholder="Neler tıkandı?" rows={2} className="w-full px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <textarea value={form.learnedSummary} onChange={(e) => setForm({ ...form, learnedSummary: e.target.value })} placeholder="Ne öğrenildi?" rows={2} className="w-full px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="text" value={form.nextFocus} onChange={(e) => setForm({ ...form, nextFocus: e.target.value })} placeholder="Sonraki odak nedir?" className="w-full px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <div className="flex items-center gap-3">
            <label className="text-sm text-text-muted">Skor: {form.score}/10</label>
            <input type="range" min={1} max={10} value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} className="flex-1 accent-primary" />
          </div>
          <div className="flex gap-2">
            <button onClick={addReview} className="px-4 py-2 bg-primary text-white rounded-xl text-sm">Kaydet</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-border-light dark:border-border-dark rounded-xl text-sm text-text-muted">İptal</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {reviews.map((r) => {
          const project = data.projects.find((p) => p.id === r.projectId);
          return (
            <div key={r.id} className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] rounded-md font-medium ${typeColors[r.reviewType]}`}>{REVIEW_TYPE_LABELS[r.reviewType]}</span>
                  {project && <span className="text-xs text-primary">{project.title}</span>}
                  <span className="text-xs text-text-muted">{r.reviewDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-primary">{r.score}/10</span>
                  <button onClick={() => remove('reviews', r.id)} className="p-1 text-text-muted hover:text-danger"><Trash2 size={13} /></button>
                </div>
              </div>
              {r.completedSummary && <div className="mt-2"><p className="text-[10px] text-success font-medium uppercase">Tamamlanan</p><p className="text-sm text-text-muted">{r.completedSummary}</p></div>}
              {r.blockedSummary && <div className="mt-2"><p className="text-[10px] text-danger font-medium uppercase">Tıkanan</p><p className="text-sm text-text-muted">{r.blockedSummary}</p></div>}
              {r.learnedSummary && <div className="mt-2"><p className="text-[10px] text-warm font-medium uppercase">Öğrenilen</p><p className="text-sm text-text-muted">{r.learnedSummary}</p></div>}
              {r.nextFocus && <p className="text-xs text-primary mt-2">Sonraki Odak: {r.nextFocus}</p>}
            </div>
          );
        })}
      </div>

      {reviews.length === 0 && <p className="text-text-muted text-center py-12">Henüz review yok</p>}
    </div>
  );
}
