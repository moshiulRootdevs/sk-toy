import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const adminToken = localStorage.getItem('sk_admin_token');
    const customerToken = localStorage.getItem('sk_customer_token');
    // Pick the token that matches the surface the request is for. Without this
    // an admin token would clobber a customer token (or vice-versa) and the
    // backend would reject the request with 401 even though the user *is*
    // logged in on the relevant surface.
    const isAdminCall = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    const token = isAdminCall
      ? (adminToken || customerToken)
      : (customerToken || adminToken);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      const isAdminRoute = window.location.pathname.startsWith('/admin');
      if (isAdminRoute) {
        localStorage.removeItem('sk_admin_token');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
