import axios from 'axios';

const API = axios.create({
  baseURL: 'https://api.minutos.in/api',
});
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get all categories
export const getCategories = async () => {
  const res = await API.get('/category/categories');
  return res.data;
};

// Create category (ADMIN ONLY)
export const createCategory = async (payload) => {
  const res = await API.post('/category/categories', payload);
  return res.data;
};

// Update category (ADMIN ONLY)
export const updateCategory = async (id, payload) => {
  const res = await API.put(`/category/categories/${id}`, payload);
  return res.data;
};

// Delete category(ADMIN ONLY)
export const deleteCategory = async (id) => {
  const res = await API.delete(`/category/categories/${id}`);
  return res.data;
};
