import api from './api';

const adminService = {
  getStats: () => api.get('/admin/stats').then((res) => res.data),
  getUsers: (params) => api.get('/admin/users', { params }).then((res) => res.data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data).then((res) => res.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((res) => res.data),
  getPosts: (params) => api.get('/admin/posts', { params }).then((res) => res.data),
  updatePostStatus: (id, status) =>
    api.put(`/admin/posts/${id}/status`, { status }).then((res) => res.data),
  getComments: (params) => api.get('/admin/comments', { params }).then((res) => res.data),
};

export default adminService;
