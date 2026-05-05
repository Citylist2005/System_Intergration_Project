export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = 'bg-[var(--color-primary)] text-white',
}) {
  return (
    <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] hover-scale">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-sm font-medium text-[var(--color-muted)]">{title}</p>
          <p className="text-3xl font-semibold tracking-tight text-[var(--color-text)]">
            {value}
          </p>
          {subtitle ? (
            <p className="text-sm leading-6 text-[var(--color-muted)]">{subtitle}</p>
          ) : null}
        </div>
        <div
          className={[
            'flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm',
            accent,
          ].join(' ')}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
