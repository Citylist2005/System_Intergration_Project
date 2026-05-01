import apiClient from '../apiClient';

export async function getSyncStatus() {
  const response = await apiClient.get('/sync/status');
  return response.data;
}

export async function syncDepartments() {
  const response = await apiClient.post('/sync/departments');
  return response.data;
}

export async function syncPositions() {
  const response = await apiClient.post('/sync/positions');
  return response.data;
}

export async function syncEmployees() {
  const response = await apiClient.post('/sync/employees');
  return response.data;
}

export async function syncAttendance(payload = {}) {
  const response = await apiClient.post('/sync/attendance', payload);
  return response.data;
}

export async function syncAll() {
  const response = await apiClient.post('/sync/all');
  return response.data;
}

