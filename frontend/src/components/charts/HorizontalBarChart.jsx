// Horizontal bar chart - matches design photo style
export default function HorizontalBarChart({ data, valueFormatter = (v) => v }) {
  const max = Math.max(...data.map((d) => Number(d.value ?? 0)), 1);

  return (
    <div className="space-y-3">
      {data.map((item) => {
        const pct = Math.max((Number(item.value) / max) * 100, 4);
        return (
          <div key={item.label} className="flex items-center gap-3 text-sm">
            <div
              className="flex-shrink-0 truncate font-medium"
              style={{ width: 90, color: 'var(--color-text)' }}
              title={item.label}
            >
              {item.label}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg, var(--color-primary), #818cf8)',
                }}
              />
            </div>
            <div
              className="flex-shrink-0 text-right font-semibold tabular-nums"
              style={{ width: 60, color: 'var(--color-primary)' }}
            >
              {valueFormatter(Number(item.value))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
