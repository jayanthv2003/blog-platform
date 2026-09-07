import api from './api';

const newsletterService = {
  subscribe: (email) => api.post('/newsletter/subscribe', { email }).then((res) => res.data),
};

export default newsletterService;
