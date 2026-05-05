/**
 * useAuth — reads user, roles, and permissions from localStorage.
 * The auth data is written by authService.js after a successful login.
 */

const STORAGE_KEY = 'hr_user';

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

function normalizeRole(role) {
  const normalized = String(role || '')
    .trim()
    .replace(/[\s-]+/g, '_')
    .toUpperCase();

  if (normalized === 'ADMIN') return 'ADMIN';
  if (normalized === 'HR_MANAGER' || normalized === 'HR') return 'HR_MANAGER';
  if (normalized === 'PAYROLL_MANAGER' || normalized === 'PAYROLL') return 'PAYROLL_MANAGER';
  if (normalized === 'EMPLOYEE') return 'EMPLOYEE';
  return normalized;
}

/**
 * Returns auth helpers. Safe to call on every render; reads localStorage synchronously.
 * For reactive updates (e.g. after login), call this inside a component and trigger
 * a re-render by updating a state variable.
 */
export function useAuth() {
  const user = getStoredUser();

  const roles = Array.isArray(user?.roles)
    ? user.roles.map(normalizeRole).filter(Boolean)
    : [];
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];

  /**
   * Check if the current user has ALL of the specified permissions.
   * ADMIN role bypasses all permission checks.
   */
  function hasPermission(...required) {
    if (!user) return false;
    if (roles.includes('ADMIN')) return true;
    return required.every((p) => permissions.includes(p));
  }

  /**
   * Check if the current user has at least ONE of the specified roles.
   */
  function hasRole(...required) {
    if (!user) return false;
    return required.some((r) => roles.includes(r));
  }

  return { user, roles, permissions, hasPermission, hasRole, isLoggedIn: Boolean(user) };
}

export default useAuth;
