import api from './axios';

export const projectsApi = {
  list: (params) => api.get('/projects', { params }).then((r) => r.data),
  getById: (id) => api.get(`/projects/${id}`).then((r) => r.data),
  create: (payload) => api.post('/projects', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/projects/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/projects/${id}`).then((r) => r.data),
  addMembers: (id, memberIds) => api.post(`/projects/${id}/members`, { memberIds }).then((r) => r.data),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`).then((r) => r.data),
};
