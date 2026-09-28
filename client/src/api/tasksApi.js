import api from './axios';

export const tasksApi = {
  list: (params) => api.get('/tasks', { params }).then((r) => r.data),
  getById: (id) => api.get(`/tasks/${id}`).then((r) => r.data),
  create: (payload) => api.post('/tasks', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/tasks/${id}`, payload).then((r) => r.data),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }).then((r) => r.data),
  remove: (id) => api.delete(`/tasks/${id}`).then((r) => r.data),
  getComments: (taskId) => api.get(`/tasks/${taskId}/comments`).then((r) => r.data),
  addComment: (taskId, comment) => api.post(`/tasks/${taskId}/comments`, { comment }).then((r) => r.data),
  getActivity: (taskId) => api.get(`/tasks/${taskId}/activity`).then((r) => r.data),
};

export const commentsApi = {
  update: (id, comment) => api.put(`/comments/${id}`, { comment }).then((r) => r.data),
  remove: (id) => api.delete(`/comments/${id}`).then((r) => r.data),
};
