import api from './api';

const categoryService = {
  getAll: () => api.get('/categories').then((res) => res.data),
  create: (data) => api.post('/categories', data).then((res) => res.data),
  update: (id, data) => api.put(`/categories/${id}`, data).then((res) => res.data),
  remove: (id) => api.delete(`/categories/${id}`).then((res) => res.data),
};

export default categoryService;
