export default function DataTable({
  columns,
  rows,
  loading,
  emptyMessage = 'Không có dữ liệu.',
  rowKey,
}) {
  if (loading) {
    return (
      <div className="rounded-[30px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
        <div className="space-y-3">
          <div className="h-5 w-40 animate-pulse rounded-full bg-slate-200" />
          <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[30px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--color-border)]">
          <thead className="bg-[var(--color-primary-soft)]/45">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-dark)]"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <tr
                  key={
                    typeof rowKey === 'function'
                      ? rowKey(row, index)
                      : rowKey
                        ? row[rowKey] ?? index
                        : row.id ?? index
                  }
                  className="transition-colors hover:bg-[var(--color-surface-soft)]"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="whitespace-nowrap px-6 py-4 text-sm text-slate-600"
                    >
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-[var(--color-muted)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
