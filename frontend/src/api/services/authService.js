import apiClient from '../apiClient';

export async function login(username, password) {
  const response = await apiClient.post('/auth/login', { username, password });
  return response.data;
}

export async function getProfile() {
  const token = localStorage.getItem('hr_token');
  const response = await apiClient.get('/auth/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
