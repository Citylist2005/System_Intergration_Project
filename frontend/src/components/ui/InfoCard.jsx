export default function InfoCard({ title, description, children }) {
  return (
    <section className="rounded-[30px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft-lg)]">
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
