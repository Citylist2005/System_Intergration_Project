import apiClient from '../apiClient';

export async function getPayroll(params = {}) {
  const response = await apiClient.get('/payroll', { params });
  return response.data;
}

export async function calculatePayroll(payload) {
  const response = await apiClient.post('/payroll/calculate', payload);
  return response.data;
}

export async function upsertPayroll(payload) {
  const response = await apiClient.post('/payroll/manual', payload);
  return response.data;
}

export async function updatePayroll(salaryId, payload) {
  const response = await apiClient.put(`/payroll/${salaryId}`, payload);
  return response.data;
}
