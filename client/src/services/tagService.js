import api from './api';

const tagService = {
  getPopular: (limit = 15) => api.get('/tags/popular', { params: { limit } }).then((res) => res.data),
};

export default tagService;
