export default function InlineMessage({ tone = 'info', children }) {
  const toneClassName = {
    info: 'border-blue-200 bg-blue-50/80 text-blue-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    danger: 'border-rose-200 bg-rose-50 text-rose-700',
  }[tone];

  return (
    <div
      className={[
        'rounded-2xl border px-4 py-3 text-sm shadow-sm',
        toneClassName,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
