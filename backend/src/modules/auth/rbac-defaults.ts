export const DEFAULT_ROLES = [
  { name: 'ADMIN', description: 'System administrator' },
  { name: 'HR_MANAGER', description: 'HR manager' },
  { name: 'PAYROLL_MANAGER', description: 'Payroll manager' },
  { name: 'EMPLOYEE', description: 'Employee' },
] as const;

export const DEFAULT_PERMISSIONS = [
  'dashboard.read',
  'employee.read',
  'employee.create',
  'employee.update',
  'employee.delete',
  'employee.manage',
  'lifecycle.read',
  'attendance.read',
  'attendance.create',
  'attendance.update',
  'benefits.read',
  'payroll.read',
  'payroll.calculate',
  'payroll.update',
  'payroll.manage',
  'department.manage',
  'position.manage',
  'shift.manage',
  'leave.read',
  'leave.manage',
  'overtime.manage',
  'kpi.read',
  'kpi.manage',
  'performance.manage',
  'reports.read',
  'report.read',
  'audit.read',
  'alert.read',
  'alert.manage',
  'backup.manage',
  'user.manage',
  'role.manage',
  'system.manage',
] as const;

export type DefaultRoleName = (typeof DEFAULT_ROLES)[number]['name'];

export const ROLE_PERMISSION_MAP: Record<DefaultRoleName, string[]> = {
  ADMIN: [...DEFAULT_PERMISSIONS],
  HR_MANAGER: [
    'dashboard.read',
    'employee.read',
    'employee.create',
    'employee.update',
    'employee.delete',
    'employee.manage',
    'lifecycle.read',
    'attendance.read',
    'attendance.create',
    'attendance.update',
    'department.manage',
    'position.manage',
    'shift.manage',
    'leave.read',
    'leave.manage',
    'overtime.manage',
    'kpi.read',
    'kpi.manage',
    'performance.manage',
    'reports.read',
    'report.read',
    'alert.read',
    'alert.manage',
  ],
  PAYROLL_MANAGER: [
    'dashboard.read',
    'employee.read',
    'attendance.read',
    'benefits.read',
    'payroll.read',
    'payroll.calculate',
    'payroll.update',
    'payroll.manage',
    'shift.manage',
    'leave.read',
    'overtime.manage',
    'leave.manage',
    'kpi.read',
    'kpi.manage',
    'reports.read',
    'report.read',
    'alert.read',
  ],
  EMPLOYEE: [
    'dashboard.read',
    'employee.read',
    'attendance.read',
    'payroll.read',
    'leave.read',
    'leave.manage',
    'overtime.manage',
    'kpi.read',
    'kpi.manage',
    'performance.manage',
  ],
};

export function normalizeRoleName(value?: string | null): DefaultRoleName | null {
  const normalized = String(value ?? '')
    .trim()
    .replace(/[\s-]+/g, '_')
    .toUpperCase();

  if (normalized === 'ADMIN') return 'ADMIN';
  if (normalized === 'HR_MANAGER' || normalized === 'HR') return 'HR_MANAGER';
  if (normalized === 'PAYROLL_MANAGER' || normalized === 'PAYROLL') {
    return 'PAYROLL_MANAGER';
  }
  if (normalized === 'EMPLOYEE') return 'EMPLOYEE';

  return null;
}
