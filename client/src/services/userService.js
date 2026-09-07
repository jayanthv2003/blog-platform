import api from './api';

const userService = {
  getProfile: () => api.get('/users/profile').then((res) => res.data),
  updateProfile: (data) => api.put('/users/profile', data).then((res) => res.data),
  changePassword: (data) => api.put('/users/change-password', data).then((res) => res.data),
  getPublicProfile: (id) => api.get(`/users/${id}`).then((res) => res.data),
  getMyPosts: () => api.get('/users/my-posts').then((res) => res.data),
  getSavedPosts: () => api.get('/users/saved-posts').then((res) => res.data),
  getLikedPosts: () => api.get('/users/liked-posts').then((res) => res.data),
};

export default userService;
