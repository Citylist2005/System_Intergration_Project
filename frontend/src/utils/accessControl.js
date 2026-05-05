export const routeAccess = {
  '/dashboard': { permissions: ['dashboard.read'] },
  '/employees': { permissions: ['employee.read'] },
  '/attendance': { permissions: ['attendance.read'] },
  '/payroll': { permissions: ['payroll.read'] },
  '/reports': { permissions: ['reports.read'] },
  '/admin': { permissions: ['user.manage'] },
  '/sync': { roles: ['ADMIN'] },
  '/employee-lifecycle': { roles: ['ADMIN', 'HR_MANAGER'] },
  '/onboarding-offboarding': { roles: ['ADMIN', 'HR_MANAGER'] },
  '/work-shifts': { roles: ['ADMIN', 'HR_MANAGER', 'PAYROLL_MANAGER'] },
  '/overtime-leave': { roles: ['ADMIN', 'HR_MANAGER', 'PAYROLL_MANAGER', 'EMPLOYEE'] },
  '/salary-policies': { roles: ['ADMIN', 'PAYROLL_MANAGER'] },
  '/benefits-insurance': { roles: ['ADMIN', 'PAYROLL_MANAGER'] },
  '/payroll-adjustments': { roles: ['ADMIN', 'PAYROLL_MANAGER'] },
  '/kpi-okr': { roles: ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'] },
  '/performance-evaluation': { roles: ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'] },
  '/users': { roles: ['ADMIN'] },
  '/system-backup': { roles: ['ADMIN'] },
};

export const endpointAccess = {
  '/departments': { roles: ['ADMIN', 'HR_MANAGER'] },
  '/positions': { roles: ['ADMIN', 'HR_MANAGER'] },
  '/employee-lifecycle': { roles: ['ADMIN', 'HR_MANAGER'] },
  '/onboarding-offboarding': { roles: ['ADMIN', 'HR_MANAGER'] },
  '/work-shifts': { roles: ['ADMIN', 'HR_MANAGER', 'PAYROLL_MANAGER'] },
  '/shift-assignments': { roles: ['ADMIN', 'HR_MANAGER', 'PAYROLL_MANAGER'] },
  '/leave-requests': { roles: ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'] },
  '/overtime-requests': { roles: ['ADMIN', 'HR_MANAGER', 'PAYROLL_MANAGER', 'EMPLOYEE'] },
  '/salary-policies': { roles: ['ADMIN', 'PAYROLL_MANAGER'] },
  '/benefits-insurance': { roles: ['ADMIN', 'PAYROLL_MANAGER'] },
  '/payroll-adjustments': { roles: ['ADMIN', 'PAYROLL_MANAGER'] },
  '/kpi-okr': { roles: ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'] },
  '/performance-evaluation': { roles: ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'] },
  '/users': { roles: ['ADMIN'] },
  '/system-backup': { roles: ['ADMIN'] },
  '/audit-logs': { permissions: ['audit.read'] },
};

export function canAccess(rule, { roles = [], permissions = [] } = {}) {
  if (!rule) return true;
  if (roles.includes('ADMIN')) return true;
  const roleOk = !rule.roles?.length || rule.roles.some((role) => roles.includes(role));
  const permissionOk =
    !rule.permissions?.length ||
    rule.permissions.every((permission) => permissions.includes(permission));
  return roleOk && permissionOk;
}

export function canAccessRoute(path, auth) {
  return canAccess(routeAccess[path], auth);
}

export function canAccessEndpoint(endpoint, auth) {
  return canAccess(endpointAccess[endpoint], auth);
}
