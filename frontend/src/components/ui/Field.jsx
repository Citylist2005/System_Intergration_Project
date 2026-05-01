export function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] shadow-sm outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100"
      />
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  disabled = false,
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text)] shadow-sm outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
