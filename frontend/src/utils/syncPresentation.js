export function formatDateTime(value) {
  return value
    ? new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }).format(new Date(value))
    : 'Không có dữ liệu';
}

export function calculateDuration(startedAt, completedAt) {
  if (!startedAt || !completedAt) {
    return 'Không có dữ liệu';
  }

  const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime();

  if (Number.isNaN(durationMs) || durationMs < 0) {
    return 'Không có dữ liệu';
  }

  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  return `${(durationMs / 1000).toFixed(durationMs >= 10000 ? 0 : 1)} giây`;
}

export function getStatusBadgeClass(status) {
  const normalized = String(status ?? '').toLowerCase();

  if (normalized.includes('success')) {
    return 'border border-emerald-200 bg-emerald-50 text-emerald-700';
  }
  if (normalized.includes('running')) {
    return 'border border-blue-200 bg-blue-50 text-blue-700';
  }
  if (normalized.includes('partial')) {
    return 'border border-amber-200 bg-amber-50 text-amber-700';
  }
  if (normalized.includes('failed')) {
    return 'border border-rose-200 bg-rose-50 text-rose-700';
  }

  return 'border border-slate-200 bg-slate-100 text-slate-700';
}
