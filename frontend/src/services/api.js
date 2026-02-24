import axios from 'axios';
const api = axios.create({ baseURL: process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL + '/api' : '/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use((res) => res.data, (err) => Promise.reject(err.response?.data || err));
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};
export const storesAPI = {
  getOpen: () => api.get('/stores/open'),
  getById: (id) => api.get(`/stores/${id}`),
  getMyStores: () => api.get('/stores'),
  create: (data) => api.post('/stores', data),
  update: (id, data) => api.put(`/stores/${id}`, data),
  delete: (id) => api.delete(`/stores/${id}`),
};
export const productsAPI = {
  getByStore: (storeId) => api.get(`/products/store/${storeId}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  myOrders: () => api.get('/orders/my'),
  storeOrders: (storeId) => api.get(`/orders/store/${storeId}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};
