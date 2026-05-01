import { formatCompactNumber } from '../../utils/formatters';

function buildPoints(data, valueKey) {
  const values = data.map((item) => Number(item[valueKey] ?? 0));
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);

  return data.map((item, index) => {
    const x = data.length === 1 ? 160 : (index / (data.length - 1)) * 320;
    const y = 120 - ((Number(item[valueKey] ?? 0) - min) / range) * 100;
    return { x, y, label: item.label, value: Number(item[valueKey] ?? 0) };
  });
}

export default function SimpleLineChart({
  data,
  valueKey = 'value',
  valueFormatter = formatCompactNumber,
}) {
  if (data.length === 0) {
    return null;
  }

  const points = buildPoints(data, valueKey);
  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <div className="space-y-4">
      <svg viewBox="0 0 320 140" className="h-40 w-full overflow-visible">
        <path d={path} fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
        {points.map((point) => (
          <circle key={point.label} cx={point.x} cy={point.y} r="4" fill="#0f172a" />
        ))}
      </svg>
      <div className="grid gap-3 sm:grid-cols-3">
        {points.map((point) => (
          <div key={point.label} className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              {point.label}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {valueFormatter(point.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
