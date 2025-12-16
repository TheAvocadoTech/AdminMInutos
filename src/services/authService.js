import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export const adminLogin = async (email, password) => {
  const res = await API.post('/auth/admin/login', {
    email,
    password,
  });
  return res.data;
};
