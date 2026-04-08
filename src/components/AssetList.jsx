import { useState } from 'react';
import { Plus, Search, ExternalLink, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { ASSET_TYPES } from '../store';

const typeIcons = { pdf: '📄', doc: '📝', image: '🖼️', video: '🎬', link: '🔗', github: '💻', drive: '☁️', prompt: '🤖', checklist: '✅', spreadsheet: '📊', other: '📎' };

export default function AssetList({ data, update, remove }) {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', assetType: 'link', externalUrl: '', description: '', projectId: '' });
  const today = new Date().toISOString().slice(0, 10);

  const filtered = data.assets.filter((a) => {
    if (search) return a.title.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const addAsset = () => {
    if (!form.title.trim()) return;
    update('assets', { id: uuidv4(), brandId: null, projectId: form.projectId || null, learningItemId: null, title: form.title.trim(), assetType: form.assetType, fileUrl: '', externalUrl: form.externalUrl, description: form.description, tags: [], createdAt: today, updatedAt: today });
    setForm({ title: '', assetType: 'link', externalUrl: '', description: '', projectId: '' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Kaynaklar & Dökümanlar</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium">
          <Plus size={16} /> Yeni Kaynak
        </button>
      </div>

      {showAdd && (
        <div className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-4 space-y-3">
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Başlık" className="w-full px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <div className="flex gap-3">
            <select value={form.assetType} onChange={(e) => setForm({ ...form, assetType: e.target.value })} className="px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-sm">
              {ASSET_TYPES.map((t) => <option key={t} value={t}>{typeIcons[t]} {t}</option>)}
            </select>
            <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className="flex-1 px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-sm">
              <option value="">Proje seçin (opsiyonel)</option>
              {data.projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <input type="url" value={form.externalUrl} onChange={(e) => setForm({ ...form, externalUrl: e.target.value })} placeholder="URL" className="w-full px-3 py-2 bg-surface-alt dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <div className="flex gap-2">
            <button onClick={addAsset} className="px-4 py-2 bg-primary text-white rounded-xl text-sm">Ekle</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-border-light dark:border-border-dark rounded-xl text-sm text-text-muted">İptal</button>
          </div>
        </div>
      )}

      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input type="text" placeholder="Kaynak ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((a) => {
          const project = data.projects.find((p) => p.id === a.projectId);
          return (
            <div key={a.id} className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-4 flex items-start gap-3">
              <span className="text-xl">{typeIcons[a.assetType] || '📎'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{a.title}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-text-muted">
                  <span>{a.assetType}</span>
                  {project && <span className="text-primary">{project.title}</span>}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                {a.externalUrl && <a href={a.externalUrl} target="_blank" rel="noreferrer" className="p-1 text-primary hover:bg-primary/10 rounded"><ExternalLink size={14} /></a>}
                <button onClick={() => remove('assets', a.id)} className="p-1 text-text-muted hover:text-danger"><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && <p className="text-text-muted text-center py-12">Kaynak bulunamadı</p>}
    </div>
  );
}
