import apiClient from '../apiClient';

export async function listRecords(endpoint, params = {}) {
  const response = await apiClient.get(endpoint, { params });
  return response.data;
}

export async function getRecord(endpoint, id) {
  const response = await apiClient.get(`${endpoint}/${id}`);
  return response.data;
}

export async function createRecord(endpoint, payload) {
  const response = await apiClient.post(endpoint, payload);
  return response.data;
}

export async function updateRecord(endpoint, id, payload) {
  const response = await apiClient.patch(`${endpoint}/${id}`, payload);
  return response.data;
}

export async function deleteRecord(endpoint, id) {
  const response = await apiClient.delete(`${endpoint}/${id}`);
  return response.data;
}
