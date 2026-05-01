export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const baseClassName =
    'inline-flex items-center justify-center rounded-2xl border font-semibold transition-all duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60';

  const variantClassName = {
    primary:
      'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:bg-[var(--color-primary-dark)] hover:shadow-[var(--shadow-soft-lg)] focus:ring-blue-100',
    secondary:
      'border-[var(--color-border)] bg-white text-[var(--color-text)] shadow-sm hover:-translate-y-0.5 hover:border-blue-200 hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-primary-dark)] focus:ring-blue-100',
    danger:
      'border-[var(--color-danger)] bg-[var(--color-danger)] text-white shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:bg-rose-700 focus:ring-rose-100',
    soft:
      'border-transparent bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)] hover:-translate-y-0.5 hover:bg-blue-100 focus:ring-blue-100',
  }[variant];

  const sizeClassName = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-4.5 py-2.5 text-sm',
    lg: 'px-5 py-3 text-sm',
  }[size];

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={[baseClassName, variantClassName, sizeClassName, className].join(
        ' ',
      )}
      {...props}
    >
      {loading ? 'Đang xử lý...' : children}
    </button>
  );
}
