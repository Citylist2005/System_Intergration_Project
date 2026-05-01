import apiClient from '../apiClient';

export async function getAttendance(params = {}) {
  const response = await apiClient.get('/attendance', { params });
  return response.data;
}

export async function getAttendanceSummary(params = {}) {
  const response = await apiClient.get('/attendance/summary', { params });
  return response.data;
}

