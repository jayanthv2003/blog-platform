import api from './api';

const commentService = {
  getForPost: (postId) => api.get(`/comments/${postId}`).then((res) => res.data),
  add: (data) => api.post('/comments', data).then((res) => res.data),
  update: (id, content) => api.put(`/comments/${id}`, { content }).then((res) => res.data),
  remove: (id) => api.delete(`/comments/${id}`).then((res) => res.data),
  toggleLike: (id) => api.put(`/comments/${id}/like`).then((res) => res.data),
  toggleSpam: (id) => api.put(`/comments/${id}/spam`).then((res) => res.data),
};

export default commentService;
