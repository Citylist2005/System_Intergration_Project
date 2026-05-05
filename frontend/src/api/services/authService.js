import apiClient from '../apiClient';

/**
 * Login and persist user data (including roles & permissions) to localStorage.
 */
export async function login(username, password) {
  const response = await apiClient.post('/auth/login', { username, password });
  const result = response.data;

  // Persist token
  if (result?.data?.accessToken) {
    localStorage.setItem('hr_token', result.data.accessToken);
  }

  // Persist full user object (includes roles & permissions)
  if (result?.data?.user) {
    localStorage.setItem('hr_user', JSON.stringify(result.data.user));
  }

  return result;
}

/**
 * Fetch the current user's profile from the server.
 * Also refreshes the cached user data in localStorage.
 */
export async function getProfile() {
  const response = await apiClient.get('/auth/profile');
  const result = response.data;

  if (result?.data) {
    localStorage.setItem('hr_user', JSON.stringify(result.data));
  }

  return result;
}

/**
 * Clear all auth data from localStorage.
 */
export function logout() {
  localStorage.removeItem('hr_token');
  localStorage.removeItem('hr_user');
}
