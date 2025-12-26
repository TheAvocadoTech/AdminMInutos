import axios from 'axios';

const API = axios.create({
  baseURL: 'https://api.minutos.in/api',
});

// ----------------------------------------------------------------------
// REQUEST INTERCEPTOR (Attach token)
// ----------------------------------------------------------------------
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ----------------------------------------------------------------------
// AUTH APIs
// ----------------------------------------------------------------------
export const adminLogin = async (email, password) => {
  const res = await API.post('/auth/admin/login', {
    email,
    password,
  });
  return res.data;
};

// ----------------------------------------------------------------------
// USERS APIs
// ----------------------------------------------------------------------
export const getAllUsers = async () => {
  const res = await API.get('/auth/users');
  return res.data;
};

export default API;
