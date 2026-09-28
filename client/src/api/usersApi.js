import api from './axios';

export const usersApi = {
  list: (params) => api.get('/users', { params }).then((r) => r.data),
  getById: (id) => api.get(`/users/${id}`).then((r) => r.data),
  update: (id, payload) => api.put(`/users/${id}`, payload).then((r) => r.data),
  setStatus: (id, isActive) => api.patch(`/users/${id}/status`, { isActive }).then((r) => r.data),
  remove: (id) => api.delete(`/users/${id}`).then((r) => r.data),
  uploadProfileImage: (id, file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    return api
      .put(`/users/${id}/profile-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data); 
  },
};
