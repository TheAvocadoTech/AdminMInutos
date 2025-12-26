// src/services/SubcategoryService.js
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

// Get all subcategories
export const getProduct = async () => {
  const res = await API.get('/product');
  return res.data;
};

// Create subcategory (ADMIN ONLY)
export const createProduct = async (payload) => {
  const res = await API.post('product/create', payload);
  return res.data;
};

// Update subcategory (ADMIN ONLY)
export const updateProduct = async (id, payload) => {
  const res = await API.put(`/product/${id}`, payload);
  return res.data;
};

// Delete subcategory (ADMIN ONLY)
export const deleteProduct = async (id, payload) => {
  const res = await API.delete(`/product/${id}`, payload);
  return res.data;
};
