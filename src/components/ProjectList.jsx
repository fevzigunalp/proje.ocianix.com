import { Search, ExternalLink, LayoutGrid, List, Columns3, ArrowUpDown, ArrowUp, ArrowDown, Globe, Building2, ShieldCheck, FileSpreadsheet, Plus, Pencil, Cloud, CloudOff } from 'lucide-react';
import { useState, useMemo } from 'react';
import { PROJECT_STATUS_LABELS, PROJECT_STATUSES, PROJECT_TYPE_LABELS, PROJECT_TYPES, STATUS_COLORS, OWNER_COLORS, getProjectProgress } from '../store';
import { isLiveMode } from '../sheetSync';

function progressColor(p) {
  if (p >= 90) return 'bg-success';
  if (p >= 60) return 'bg-accent';
  if (p >= 30) return 'bg-warm';
  if (p > 0) return 'bg-orange';
  return 'bg-warm-light';
}

export default function ProjectList({ data, navigate, onEdit, onNew }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [publishFilter, setPublishFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // table | card | kanban
  const [sortKey, setSortKey] = useState('rowIndex');
  const [sortDir, setSortDir] = useState('asc');

  const projects = data.projects || [];
  const owners = useMemo(() => [...new Set(projects.map((p) => p.ownerCompany).filter(Boolean))].sort(), [projects]);
  const areas = useMemo(() => [...new Set(projects.map((p) => p.businessArea).filter(Boolean))].sort(), [projects]);

  const filtered = projects.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (typeFilter !== 'all' && p.projectType !== typeFilter) return false;
    if (ownerFilter !== 'all' && p.ownerCompany !== ownerFilter) return false;
    if (publishFilter === 'evet' && p.publishOnOcianix !== 'Evet') return false;
    if (publishFilter === 'hayir' && p.publishOnOcianix !== 'Hayır') return false;
    if (areaFilter !== 'all' && p.businessArea !== areaFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.subBusiness || '').toLowerCase().includes(q) ||
        (p.businessArea || '').toLowerCase().includes(q) ||
        (p.ownerCompany || '').toLowerCase().includes(q) ||
        (p.websiteUrlRaw || '').toLowerCase().includes(q) ||
        (p.stack || []).some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ArrowUpDown size={11} className="text-text-muted/40" />;
    return sortDir === 'asc' ? <ArrowUp size={11} className="text-primary" /> : <ArrowDown size={11} className="text-primary" />;
  };

  const statusOrder = { live: 0, optimization: 1, in_progress: 2, draft: 3, paused: 4, idea: 5 };

  const sorted = [...filtered].sort((a, b) => {
    let av, bv;
    switch (sortKey) {
      case 'rowIndex': av = a.rowIndex || 0; bv = b.rowIndex || 0; break;
      case 'maker': av = (a.makerCompany || '').toLowerCase(); bv = (b.makerCompany || '').toLowerCase(); break;
      case 'owner': av = (a.ownerCompany || '').toLowerCase(); bv = (b.ownerCompany || '').toLowerCase(); break;
      case 'type': av = (a.projectTypeRaw || '').toLowerCase(); bv = (b.projectTypeRaw || '').toLowerCase(); break;
      case 'publish': av = (a.publishOnOcianix || 'z').toLowerCase(); bv = (b.publishOnOcianix || 'z').toLowerCase(); break;
      case 'area': av = (a.businessArea || '').toLowerCase(); bv = (b.businessArea || '').toLowerCase(); break;
      case 'sub': av = (a.subBusiness || '').toLowerCase(); bv = (b.subBusiness || '').toLowerCase(); break;
      case 'name': av = (a.name || '').toLowerCase(); bv = (b.name || '').toLowerCase(); break;
      case 'expiry': av = a.domainExpiry || '9999'; bv = b.domainExpiry || '9999'; break;
      case 'status': av = statusOrder[a.status] ?? 9; bv = statusOrder[b.status] ?? 9; break;
      case 'progress': av = getProjectProgress(data, a.id); bv = getProjectProgress(data, b.id); break;
      default: av = a.rowIndex || 0; bv = b.rowIndex || 0;
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const kanbanStatuses = ['live', 'optimization', 'in_progress', 'draft', 'paused', 'idea'];

  const FilterPill = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${active ? 'bg-primary text-white' : 'bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark text-text-muted'}`}>
      {children}
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileSpreadsheet size={22} className="text-primary" /> Projeler
            {isLiveMode() ? (
              <span className="text-[10px] inline-flex items-center gap-1 px-2 py-0.5 bg-success/10 text-success rounded-md font-medium">
                <Cloud size={11} /> Sheet canlı
              </span>
            ) : (
              <span className="text-[10px] inline-flex items-center gap-1 px-2 py-0.5 bg-warm/10 text-warm rounded-md font-medium">
                <CloudOff size={11} /> Statik
              </span>
            )}
          </h1>
          <p className="text-sm text-text-muted">
            {filtered.length}/{projects.length} proje · Son sync: {data?._projectSyncedAt ? new Date(data._projectSyncedAt).toLocaleTimeString('tr-TR') : '—'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onNew && (
            <button onClick={onNew} className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-primary-dark">
              <Plus size={14} /> Yeni Proje
            </button>
          )}
          <div className="flex bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-0.5">
            {[{ id: 'table', icon: List, label: 'Tablo' }, { id: 'card', icon: LayoutGrid, label: 'Kart' }, { id: 'kanban', icon: Columns3, label: 'Kanban' }].map((v) => {
              const Icon = v.icon;
              return (
                <button key={v.id} onClick={() => setViewMode(v.id)} title={v.label} className={`p-1.5 rounded-lg ${viewMode === v.id ? 'bg-primary text-white' : 'text-text-muted'}`}>
                  <Icon size={15} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input type="text" placeholder="Proje, açıklama, alan, sahibi, URL ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {/* Filters */}
      <div className="space-y-2">
        {/* Status (L) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-wide text-text-muted">Durum:</span>
          <FilterPill active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>Tümü</FilterPill>
          {PROJECT_STATUSES.map((s) => (
            <FilterPill key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>{PROJECT_STATUS_LABELS[s]}</FilterPill>
          ))}
        </div>
        {/* Owner (B) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-wide text-text-muted">Sahibi:</span>
          <FilterPill active={ownerFilter === 'all'} onClick={() => setOwnerFilter('all')}>Tümü</FilterPill>
          {owners.map((o) => (
            <FilterPill key={o} active={ownerFilter === o} onClick={() => setOwnerFilter(o)}>{o}</FilterPill>
          ))}
        </div>
        {/* Type (C) + Publish (D) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-wide text-text-muted">Tür:</span>
          <FilterPill active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>Tümü</FilterPill>
          {PROJECT_TYPES.map((t) => (
            <FilterPill key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>{PROJECT_TYPE_LABELS[t]}</FilterPill>
          ))}
          <span className="text-[10px] uppercase tracking-wide text-text-muted ml-3">Yayın?</span>
          <FilterPill active={publishFilter === 'all'} onClick={() => setPublishFilter('all')}>Hepsi</FilterPill>
          <FilterPill active={publishFilter === 'evet'} onClick={() => setPublishFilter('evet')}>Evet</FilterPill>
          <FilterPill active={publishFilter === 'hayir'} onClick={() => setPublishFilter('hayir')}>Hayır</FilterPill>
        </div>
        {/* Business area (E) */}
        {areas.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wide text-text-muted">İş Alanı:</span>
            <FilterPill active={areaFilter === 'all'} onClick={() => setAreaFilter('all')}>Tümü</FilterPill>
            {areas.map((a) => (
              <FilterPill key={a} active={areaFilter === a} onClick={() => setAreaFilter(a)}>{a}</FilterPill>
            ))}
          </div>
        )}
      </div>

      {/* TABLE VIEW — Excel başlıkları 1:1 */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark text-left text-[10px] text-text-muted uppercase tracking-wide">
                {[
                  { key: 'rowIndex', label: '#' },
                  { key: 'maker', label: 'Yapan' },
                  { key: 'owner', label: 'Sahibi' },
                  { key: 'type', label: 'Tür' },
                  { key: 'publish', label: 'Yayın?' },
                  { key: 'area', label: 'İş Alanı' },
                  { key: 'sub', label: 'Alt Kol' },
                  { key: 'name', label: 'Proje Adı' },
                  { key: 'site', label: 'Web Sitesi', sortable: false },
                  { key: 'expiry', label: 'Domain Bitiş' },
                  { key: 'status', label: 'Durum' },
                  { key: 'progress', label: 'İlerleme' },
                  { key: 'actions', label: '', sortable: false },
                ].map((col) => (
                  <th key={col.key} className="py-2 px-2 font-medium">
                    {col.sortable === false ? col.label : (
                      <button onClick={() => toggleSort(col.key)} className="flex items-center gap-1 hover:text-text-dark dark:hover:text-white transition-colors">
                        {col.label} <SortIcon col={col.key} />
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => {
                const progress = getProjectProgress(data, p.id);
                return (
                  <tr key={p.id} onClick={() => navigate('project-detail', p.id)} className="border-b border-border-light/40 dark:border-border-dark/40 hover:bg-primary/5 cursor-pointer">
                    <td className="py-2 px-2 text-text-muted/60 font-mono text-[10px]">{p.rowIndex}</td>
                    <td className="py-2 px-2 text-text-muted">{p.makerCompany || '—'}</td>
                    <td className="py-2 px-2">
                      {p.ownerCompany ? (
                        <span className={`px-1.5 py-0.5 text-[10px] rounded border ${OWNER_COLORS[p.ownerCompany] || 'bg-text-muted/10 text-text-muted border-text-muted/20'}`}>{p.ownerCompany}</span>
                      ) : '—'}
                    </td>
                    <td className="py-2 px-2 text-text-muted">{p.projectTypeRaw || '—'}</td>
                    <td className="py-2 px-2">
                      {p.publishOnOcianix === 'Evet' && <ShieldCheck size={12} className="text-success" />}
                      {p.publishOnOcianix === 'Hayır' && <span className="text-[10px] text-text-muted">Hayır</span>}
                    </td>
                    <td className="py-2 px-2 text-text-muted">{p.businessArea || '—'}</td>
                    <td className="py-2 px-2 text-text-muted truncate max-w-[160px]" title={p.subBusiness || ''}>{p.subBusiness || '—'}</td>
                    <td className="py-2 px-2 font-medium">{p.name}</td>
                    <td className="py-2 px-2">
                      {p.websiteUrl ? (
                        <a href={p.websiteUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-primary hover:underline text-[10px] flex items-center gap-1">
                          <Globe size={10} /> {p.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').slice(0, 30)}
                        </a>
                      ) : p.websiteUrlPlaceholder ? (
                        <span className="text-[10px] text-warm italic">{p.websiteUrlPlaceholder}</span>
                      ) : '—'}
                    </td>
                    <td className="py-2 px-2 font-mono text-[10px] text-text-muted">{p.domainExpiry || '—'}</td>
                    <td className="py-2 px-2">
                      <span className={`px-1.5 py-0.5 text-[10px] rounded-md border font-medium ${STATUS_COLORS[p.status]}`}>{p.progressStatusRaw || PROJECT_STATUS_LABELS[p.status]}</span>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-14 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${progressColor(progress)}`} style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-[9px] text-text-muted w-7">%{progress}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right">
                      {onEdit && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onEdit(p); }}
                          title="Düzenle"
                          className="p-1 rounded hover:bg-primary/10 text-text-muted hover:text-primary"
                        >
                          <Pencil size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CARD VIEW */}
      {viewMode === 'card' && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((p) => {
            const progress = getProjectProgress(data, p.id);
            return (
              <div key={p.id} onClick={() => navigate('project-detail', p.id)} className="bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{p.name}</h3>
                    {p.subBusiness && <p className="text-[10px] text-text-muted mt-0.5">{p.subBusiness}</p>}
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 text-[10px] rounded-md font-medium border ${STATUS_COLORS[p.status]}`}>{PROJECT_STATUS_LABELS[p.status]}</span>
                </div>
                {p.description && <p className="text-xs text-text-muted line-clamp-2 mb-2">{p.description}</p>}
                <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                  {p.ownerCompany && <span className={`px-1.5 py-0.5 text-[10px] rounded border ${OWNER_COLORS[p.ownerCompany] || 'bg-text-muted/10 text-text-muted border-text-muted/20'}`}>{p.ownerCompany}</span>}
                  {p.projectTypeRaw && <span className="px-1.5 py-0.5 text-[10px] rounded bg-primary/10 text-primary">{p.projectTypeRaw}</span>}
                  {p.businessArea && <span className="px-1.5 py-0.5 text-[10px] rounded bg-accent/10 text-accent">{p.businessArea}</span>}
                  {p.publishOnOcianix === 'Evet' && <span className="px-1.5 py-0.5 text-[10px] rounded bg-success/10 text-success border border-success/20 flex items-center gap-1"><ShieldCheck size={10} /> Yayın</span>}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${progressColor(progress)}`} style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-[10px] text-text-muted">%{progress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-text-muted/60">{p.lastActivity || '—'}</p>
                  {p.websiteUrl && (
                    <a href={p.websiteUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                      <ExternalLink size={10} /> Ziyaret
                    </a>
                  )}
                  {!p.websiteUrl && p.websiteUrlPlaceholder && (
                    <span className="text-[10px] text-warm italic">{p.websiteUrlPlaceholder}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanbanStatuses.map((status) => {
            const items = sorted.filter((p) => p.status === status);
            return (
              <div key={status} className="min-w-[280px] flex-shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 text-xs rounded-lg font-medium border ${STATUS_COLORS[status]}`}>{PROJECT_STATUS_LABELS[status]}</span>
                  <span className="text-xs text-text-muted">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((p) => {
                    const progress = getProjectProgress(data, p.id);
                    return (
                      <button key={p.id} onClick={() => navigate('project-detail', p.id)} className="w-full text-left bg-surface dark:bg-surface-dark-alt border border-border-light dark:border-border-dark rounded-xl p-3 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between gap-1.5 mb-1">
                          <h4 className="text-sm font-medium">{p.name}</h4>
                          {p.publishOnOcianix === 'Evet' && <ShieldCheck size={11} className="text-success shrink-0" />}
                        </div>
                        {p.subBusiness && <p className="text-[10px] text-text-muted">{p.subBusiness}</p>}
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {p.ownerCompany && <span className={`px-1 py-0.5 text-[9px] rounded border ${OWNER_COLORS[p.ownerCompany] || 'bg-text-muted/10 text-text-muted border-text-muted/20'}`}>{p.ownerCompany}</span>}
                          {p.projectTypeRaw && <span className="px-1 py-0.5 text-[9px] rounded bg-primary/10 text-primary">{p.projectTypeRaw}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1 bg-primary/10 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${progressColor(progress)}`} style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-[9px] text-text-muted">%{progress}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-muted">Filtrelere uyan proje yok</p>
        </div>
      )}
    </div>
  );
}
