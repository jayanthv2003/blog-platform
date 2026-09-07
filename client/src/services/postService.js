import api from './api';

const postService = {
  getPosts: (params) => api.get('/posts', { params }).then((res) => res.data),
  getPost: (idOrSlug) => api.get(`/posts/${idOrSlug}`).then((res) => res.data),
  createPost: (data) => api.post('/posts', data).then((res) => res.data),
  updatePost: (id, data) => api.put(`/posts/${id}`, data).then((res) => res.data),
  deletePost: (id) => api.delete(`/posts/${id}`).then((res) => res.data),
  toggleLike: (id) => api.put(`/posts/${id}/like`).then((res) => res.data),
  toggleSave: (id) => api.put(`/posts/${id}/save`).then((res) => res.data),
  getRelated: (id) => api.get(`/posts/${id}/related`).then((res) => res.data),
  getFeatured: () => api.get('/posts/meta/featured').then((res) => res.data),
  getTrending: () => api.get('/posts/meta/trending').then((res) => res.data),
};

export default postService;
