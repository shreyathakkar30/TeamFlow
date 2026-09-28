import api from './axios';

export const dashboardApi = {
  admin: () => api.get('/dashboard/admin').then((r) => r.data),
  member: () => api.get('/dashboard/member').then((r) => r.data),
};
