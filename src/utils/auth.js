const TOKEN_KEY = 'adminToken';

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const isAuthenticated = () => !!getToken();

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};
