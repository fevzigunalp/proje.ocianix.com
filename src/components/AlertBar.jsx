import { Trophy, AlertTriangle, X } from 'lucide-react';
import { getNearCompleteProjects, getStaleProjectsWithDays, isAlertDismissed, getProjectProgress } from '../store';

export default function AlertBar({ data, updateData, navigate }) {
  const nearComplete = getNearCompleteProjects(data);
  const staleProjects = getStaleProjectsWithDays(data);
  const today = new Date().toISOString().slice(0, 10);

  const dismiss = (key) => {
    updateData((d) => ({
      ...d,
      alertDismissals: { ...d.alertDismissals, [key]: today },
    }));
  };

  const visibleAlerts = [];

  nearComplete.forEach((p) => {
    const key = `near-${p.id}`;
    if (!isAlertDismissed(data, key, 3)) {
      visibleAlerts.push({
        key,
        type: 'success',
        icon: Trophy,
        text: `${p.title} %${getProjectProgress(data, p.id)} tamamlandı! Bitiş çizgisi yakın!`,
        action: () => navigate('project-detail', p.id),
        actionLabel: 'Projeye Git',
      });
    }
  });

  staleProjects.slice(0, 2).forEach((p) => {
    const key = `stale-${p.id}`;
    if (!isAlertDismissed(data, key, 7)) {
      visibleAlerts.push({
        key,
        type: 'warning',
        icon: AlertTriangle,
        text: `${p.title} ${p.staleDays} gündür güncellenmedi`,
        action: () => navigate('project-detail', p.id),
        actionLabel: 'İncele',
      });
    }
  });

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="px-4 md:px-6 lg:px-8 pt-4 max-w-7xl mx-auto space-y-2">
      {visibleAlerts.map((alert) => {
        const Icon = alert.icon;
        const isSuccess = alert.type === 'success';
        return (
          <div key={alert.key} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${isSuccess ? 'bg-success/5 border-success/20' : 'bg-warm/5 border-warm/20'}`}>
            <Icon size={16} className={isSuccess ? 'text-success' : 'text-warm'} />
            <span className="text-sm flex-1">{alert.text}</span>
            <button onClick={alert.action} className={`text-xs font-medium px-3 py-1 rounded-lg ${isSuccess ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-warm/10 text-warm hover:bg-warm/20'}`}>
              {alert.actionLabel}
            </button>
            <button onClick={() => dismiss(alert.key)} className="p-1 text-text-muted hover:text-text-dark">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
