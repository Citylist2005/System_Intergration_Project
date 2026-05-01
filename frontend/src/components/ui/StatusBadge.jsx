const statusToneMap = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'on leave': 'bg-amber-50 text-amber-700 ring-amber-200',
  probation: 'bg-sky-50 text-sky-700 ring-sky-200',
  intern: 'bg-violet-50 text-violet-700 ring-violet-200',
  inactive: 'bg-rose-50 text-rose-700 ring-rose-200',
  default: 'bg-slate-100 text-slate-700 ring-slate-200',
};

const statusLabelMap = {
  Active: 'Đang làm việc',
  'On Leave': 'Nghỉ phép',
  Probation: 'Thử việc',
  Intern: 'Thực tập',
  Inactive: 'Ngừng hoạt động',
};

function resolveTone(status) {
  return statusToneMap[(status || '').toLowerCase()] || statusToneMap.default;
}

function resolveLabel(status) {
  return statusLabelMap[status] || status || 'Không xác định';
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
        resolveTone(status),
      ].join(' ')}
    >
      {resolveLabel(status)}
    </span>
  );
}
