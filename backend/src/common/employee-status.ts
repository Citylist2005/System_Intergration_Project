export const EMPLOYEE_STATUS_OPTIONS = [
  'Active',
  'On Leave',
  'Probation',
  'Intern',
  'Inactive',
] as const;

export type EmployeeStatus = (typeof EMPLOYEE_STATUS_OPTIONS)[number];

export const DEFAULT_EMPLOYEE_STATUS: EmployeeStatus = 'Active';

export function normalizeEmployeeStatus(status: string | null | undefined): EmployeeStatus {
  const normalized = String(status ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  if (!normalized) {
    return DEFAULT_EMPLOYEE_STATUS;
  }

  if (normalized.includes('inactive')) {
    return 'Inactive';
  }

  if (
    normalized === 'active' ||
    normalized.includes('dang lam') ||
    normalized.includes('danglam') ||
    normalized.includes('lam viec') ||
    normalized.includes('lamviec')
  ) {
    return 'Active';
  }

  if (
    normalized.includes('on leave') ||
    normalized.includes('leave') ||
    normalized.includes('nghi') ||
    normalized.includes('phep')
  ) {
    return 'On Leave';
  }

  if (
    normalized.includes('probation') ||
    normalized.includes('thu viec') ||
    normalized.includes('thuviec')
  ) {
    return 'Probation';
  }

  if (
    normalized.includes('intern') ||
    normalized.includes('thuc tap') ||
    normalized.includes('thuctap')
  ) {
    return 'Intern';
  }

  return DEFAULT_EMPLOYEE_STATUS;
}

export function isPayrollEligibleStatus(
  status: string | null | undefined,
): boolean {
  const normalizedStatus = normalizeEmployeeStatus(status);

  return normalizedStatus !== 'On Leave' && normalizedStatus !== 'Inactive';
}
