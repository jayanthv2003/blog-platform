import api from './api';

const uploadService = {
  uploadImage: (file, onProgress) => {
    const formData = new FormData();
    formData.append('image', file);
    return api
      .post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (onProgress && evt.total) onProgress(Math.round((evt.loaded * 100) / evt.total));
        },
      })
      .then((res) => res.data);
  },
};

export default uploadService;
