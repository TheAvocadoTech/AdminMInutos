// src/services/SubcategoryService.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get all subcategories
export const getSubCategories = async () => {
  const res = await API.get('/subcategory');
  return res.data;
};

// Create subcategory (ADMIN ONLY)
export const createSubcategory = async (payload) => {
  const res = await API.post('/subcategory', payload);
  return res.data;
};

// Update subcategory (ADMIN ONLY)
export const updateSubcategory = async (id, payload) => {
  const res = await API.put(`/subcategory/${id}`, payload);
  return res.data;
};

// Delete subcategory (ADMIN ONLY)
export const deleteSubcategory = async (id, payload) => {
  const res = await API.delete(`/subcategory/${id}`, payload);
  return res.data;
};
