const palette = ['#0f172a', '#334155', '#64748b', '#94a3b8', '#cbd5e1'];
const dotClasses = ['bg-slate-950', 'bg-slate-700', 'bg-slate-500', 'bg-slate-400', 'bg-slate-300'];

function polarToCartesian(cx, cy, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function describeArc(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

export default function SimplePieChart({ data, titleKey = 'label', valueKey = 'value' }) {
  const total = data.reduce((sum, item) => sum + Number(item[valueKey] ?? 0), 0);
  let cumulativeAngle = 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[180px_1fr] lg:items-center">
      <svg viewBox="0 0 180 180" className="mx-auto h-44 w-44">
        {data.map((item, index) => {
          const value = Number(item[valueKey] ?? 0);
          const angle = total > 0 ? (value / total) * 360 : 0;
          const startAngle = cumulativeAngle;
          const endAngle = cumulativeAngle + angle;
          cumulativeAngle += angle;

          return (
            <path
              key={item[titleKey]}
              d={describeArc(90, 90, 72, startAngle, endAngle)}
              fill={palette[index % palette.length]}
            />
          );
        })}
        <circle cx="90" cy="90" r="38" fill="white" />
      </svg>

      <div className="space-y-3">
        {data.map((item, index) => {
          const value = Number(item[valueKey] ?? 0);
          const percent = total > 0 ? Math.round((value / total) * 100) : 0;

          return (
            <div key={item[titleKey]} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={['h-3 w-3 rounded-full', dotClasses[index % dotClasses.length]].join(' ')} />
                <span className="text-sm font-medium text-slate-700">{item[titleKey]}</span>
              </div>
              <span className="text-sm text-slate-500">{percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
