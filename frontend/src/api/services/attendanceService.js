import apiClient from '../apiClient';

export async function getAttendance(params = {}) {
  const response = await apiClient.get('/attendance', { params });
  return response.data;
}

export async function getAttendanceSummary(params = {}) {
  const response = await apiClient.get('/attendance/summary', { params });
  return response.data;
}

export async function upsertManualAttendance(payload) {
  const response = await apiClient.post('/attendance/manual', payload);
  return response.data;
}

export async function updateAttendance(attendanceId, payload) {
  const response = await apiClient.put(`/attendance/${attendanceId}`, payload);
  return response.data;
}
