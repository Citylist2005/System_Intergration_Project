import { formatCompactNumber } from '../../utils/formatters';

export default function SimpleBarChart({
  data,
  titleKey = 'label',
  valueKey = 'value',
  colorClassName = 'fill-slate-900',
  valueFormatter = formatCompactNumber,
}) {
  const maxValue = Math.max(...data.map((item) => Number(item[valueKey] ?? 0)), 0);

  return (
    <div className="space-y-4">
      {data.map((item) => {
        const value = Number(item[valueKey] ?? 0);
        const width = maxValue > 0 ? Math.max((value / maxValue) * 100, 8) : 0;

        return (
          <div key={item[titleKey]} className="space-y-2">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-medium text-slate-700">{item[titleKey]}</span>
              <span className="text-slate-500">{valueFormatter(value)}</span>
            </div>
            <svg viewBox="0 0 100 12" className="h-3 w-full">
              <rect x="0" y="0" width="100" height="12" rx="6" className="fill-slate-100" />
              <rect x="0" y="0" width={width} height="12" rx="6" className={colorClassName} />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
