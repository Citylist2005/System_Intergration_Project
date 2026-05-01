export function formatCurrency(value) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactCurrency(value) {
  const amount = Number(value ?? 0);

  if (Math.abs(amount) < 1000000) {
    return formatCurrency(amount);
  }

  return new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatCompactNumber(value) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatDateLabel(value) {
  if (!value) {
    return '--';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('vi-VN', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(value) {
  if (!value) {
    return '--';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('vi-VN', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getActiveEmployeesCount(employees) {
  return employees.filter((employee) => employee.Status === 'Active').length;
}

export function sumValues(rows, field) {
  return rows.reduce((total, row) => total + Number(row[field] ?? 0), 0);
}
