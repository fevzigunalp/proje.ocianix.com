import { ExternalLink } from 'lucide-react';

// İlişkili projeyi gösteren tıklanabilir rozet — tüm modüllerde ortak.
export default function RelatedProjectBadge({ projectId, projects, navigate, size = 'sm' }) {
  if (!projectId) return null;
  const p = (projects || []).find((x) => x.id === projectId);
  const cls = size === 'xs'
    ? 'px-1.5 py-0.5 text-[10px]'
    : 'px-2 py-0.5 text-[11px]';
  if (!p) {
    return (
      <span className={`${cls} rounded-md bg-text-muted/10 text-text-muted border border-text-muted/20 font-mono`} title={`Eşleşmeyen id: ${projectId}`}>
        {projectId}
      </span>
    );
  }
  return (
    <button
      onClick={(e) => { e.stopPropagation(); navigate('project-detail', p.id); }}
      title={`Projeye git: ${p.name}`}
      className={`${cls} rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 inline-flex items-center gap-1 transition-colors`}
    >
      {p.name}
      <ExternalLink size={10} />
    </button>
  );
}
