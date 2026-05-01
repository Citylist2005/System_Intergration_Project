// Donut chart matching design: dark center, colored segments, right-side legend with %
const COLORS = ['#1e2348', '#4f6ef7', '#818cf8', '#94a3b8', '#cbd5e1', '#e2e8f0'];

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, r, start, end) {
  const s = polarToCartesian(cx, cy, r, end);
  const e = polarToCartesian(cx, cy, r, start);
  const large = end - start <= 180 ? '0' : '1';
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y} Z`;
}

export default function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + Number(d.value ?? 0), 0);
  let cum = 0;

  return (
    <div className="flex items-center gap-6">
      {/* Donut SVG */}
      <div className="flex-shrink-0">
        <svg viewBox="0 0 160 160" className="h-36 w-36">
          {data.map((item, i) => {
            const val = Number(item.value ?? 0);
            const angle = total > 0 ? (val / total) * 360 : 0;
            const start = cum;
            const end = cum + angle;
            cum += angle;
            return (
              <path
                key={item.label}
                d={arcPath(80, 80, 64, start, end)}
                fill={COLORS[i % COLORS.length]}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
          {/* Center hole */}
          <circle cx="80" cy="80" r="36" fill="white" />
          {/* Center text */}
          <text x="80" y="76" textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="Manrope">
            Total
          </text>
          <text x="80" y="90" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0f172a" fontFamily="Manrope">
            {total}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2">
        {data.map((item, i) => {
          const val = Number(item.value ?? 0);
          const pct = total > 0 ? Math.round((val / total) * 100) : 0;
          return (
            <div key={item.label} className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                <span style={{ color: 'var(--color-text)' }} className="text-xs">
                  {item.label}
                </span>
              </div>
              <span className="font-semibold text-xs tabular-nums" style={{ color: 'var(--color-muted)' }}>
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
