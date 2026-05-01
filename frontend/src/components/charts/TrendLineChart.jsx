// Line chart matching design: smooth line, dots, axis labels below
function buildPoints(data) {
  const values = data.map((d) => Number(d.value ?? 0));
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const W = 300, H = 100, PAD = 10;

  return data.map((d, i) => {
    const x = data.length === 1 ? W / 2 : PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((Number(d.value) - min) / range) * (H - PAD * 2);
    return { x, y, label: d.label, value: Number(d.value) };
  });
}

export default function TrendLineChart({ data, valueFormatter = (v) => v }) {
  if (!data || data.length === 0) return null;
  const pts = buildPoints(data);

  // Smooth bezier path
  const pathD = pts.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = pts[i - 1];
    const cpx = (prev.x + pt.x) / 2;
    return `${acc} C ${cpx} ${prev.y} ${cpx} ${pt.y} ${pt.x} ${pt.y}`;
  }, '');

  // Area fill
  const areaD = `${pathD} L ${pts[pts.length - 1].x} 110 L ${pts[0].x} 110 Z`;

  return (
    <div className="space-y-2">
      <svg viewBox="0 0 300 120" className="w-full" style={{ height: 140 }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <path d={areaD} fill="url(#lineGrad)" />
        {/* Line */}
        <path d={pathD} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {pts.map((pt) => (
          <g key={pt.label}>
            <circle cx={pt.x} cy={pt.y} r="4" fill="white" stroke="var(--color-primary)" strokeWidth="2" />
          </g>
        ))}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between text-xs" style={{ color: 'var(--color-muted)' }}>
        {pts.map((pt) => (
          <div key={pt.label} className="flex flex-col items-center gap-0.5 text-center" style={{ maxWidth: 70 }}>
            <span className="truncate w-full">{pt.label}</span>
            <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>
              {valueFormatter(pt.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
