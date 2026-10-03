import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatic token attachment
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aksaraloka_token') || localStorage.getItem('mylibrary_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  getDemoAccounts: async () => {
    const response = await api.get('/auth/demo-accounts');
    return response.data;
  },
};

// Books API
export const booksAPI = {
  getAll: async (params) => {
    const response = await api.get('/books', { params });
    return response;
  },
  getById: async (id) => {
    const response = await api.get(`/books/${id}`);
    return response;
  },
  create: async (data) => {
    const response = await api.post('/books', data);
    return response;
  },
  update: async (id, data) => {
    const response = await api.put(`/books/${id}`, data);
    return response;
  },
  delete: async (id) => {
    const response = await api.delete(`/books/${id}`);
    return response;
  },
  updateCondition: async (id, data) => {
    const response = await api.patch(`/books/${id}/condition`, data);
    return response.data;
  },
  getConditionStats: async () => {
    const response = await api.get('/books/stats/condition');
    return response.data;
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response;
  },
};

// Loans & Circulation API
export const loansAPI = {
  getMyLoans: async () => {
    const response = await api.get('/loans/my-loans');
    return response;
  },
  getAll: async (params) => {
    const response = await api.get('/loans', { params });
    return response;
  },
  getStats: async () => {
    const response = await api.get('/loans/stats');
    return response;
  },
  create: async (data) => {
    const response = await api.post('/loans', data);
    return response;
  },
  returnBook: async (id, notes = '') => {
    const response = await api.post(`/loans/${id}/return`, { notes });
    return response;
  },
};

// Users / Members API
export const usersAPI = {
  getAll: async (params) => {
    const response = await api.get('/users', { params });
    return response;
  },
  create: async (data) => {
    const response = await api.post('/users', data);
    return response;
  },
};

// Admin API (User management, Settings, Stats)
export const adminAPI = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  getUsers: async (params) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },
  updateUserRole: async (id, role) => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },
  updateUserStatus: async (id, isActive) => {
    const response = await api.put(`/admin/users/${id}/status`, { is_active: isActive });
    return response.data;
  },
  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },
  updateSettings: async (settings) => {
    const response = await api.put('/admin/settings', { settings });
    return response.data;
  },
};

// Open Library API (Open-Source GitHub Book API integration)
export const openLibraryAPI = {
  search: async (query, limit = 16) => {
    const response = await api.get('/open-library/search', { params: { q: query, limit } });
    return response.data;
  },
  getTrending: async (subject = 'literature', limit = 16) => {
    const response = await api.get('/open-library/trending', { params: { subject, limit } });
    return response.data;
  },
  importBook: async (book, options = {}) => {
    const response = await api.post('/open-library/import', { book, options });
    return response.data;
  },
};

// Reader API (Direct in-browser reading of open-source books)
export const readerAPI = {
  getCurated: async (category = '') => {
    const response = await api.get('/reader/curated', { params: category ? { category } : {} });
    return response.data;
  },
  searchGutenberg: async (q) => {
    const response = await api.get('/reader/search', { params: { q } });
    return response.data;
  },
  getGutenbergBook: async (gutenbergId) => {
    const response = await api.get(`/reader/gutenberg/${gutenbergId}`);
    return response.data;
  },
  getBookContent: async (bookId) => {
    const response = await api.get(`/reader/book/${bookId}`);
    return response.data;
  },
  saveProgress: async (progressData) => {
    const response = await api.post('/reader/progress', progressData);
    return response.data;
  },
};

// Comics & Manga API (MangaDex & XKCD Open APIs)
export const comicsAPI = {
  getAll: async () => {
    const response = await api.get('/comics');
    return response.data;
  },
  getDetail: async (id) => {
    const response = await api.get(`/comics/${id}`);
    return response.data;
  },
  getChapterPages: async (chapterId) => {
    const response = await api.get(`/comics/chapter/${chapterId}`);
    return response.data;
  },
};

// System & Engine Status API
export const systemAPI = {
  getStatus: async () => {
    const response = await api.get('/system/status');
    return response;
  },
};

export default api;
