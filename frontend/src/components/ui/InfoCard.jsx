export default function InfoCard({ title, description, children }) {
  return (
    <section className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] hover-scale">
      <div className="mb-6 space-y-2">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">{title}</h3>
        {description ? (
          <p className="text-sm leading-6 text-[var(--color-muted)]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
