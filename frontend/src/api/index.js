import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add auth token if available (optional)
// axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

export const api = {

  // Accounts API
  accounts: {
    customers: {
      list: () => axios.get('/accounts/customers/')
    },
    suppliers: {
      list: () => axios.get('/accounts/suppliers/')
    }
  },


  // Products API
  products: {
    list: () => axios.get('/products/'),
    get: (id) => axios.get(`/products/${id}/`),
    create: (data) => axios.post('/products/', data),
    update: (id, data) => axios.put(`/products/${id}/`, data),
    partialUpdate: (id, data) => axios.patch(`/products/${id}/`, data),
    delete: (id) => axios.delete(`/products/${id}/`)
  },

  // Invoices API
  invoices: {
    purchases: {
      list: () => axios.get('/invoices/purchases/'),
      create: (data) => axios.post('/invoices/purchases/', data)
    },
    sales: {
      list: () => axios.get('/invoices/sales/'),
      create: (data) => axios.post('/invoices/sales/', data)
    }
  },

  // Reports API
  reports: {
    day: (date) => axios.get('/reports/day/', { params: { date } }),
    period: (start, end) => axios.get('/reports/period/', { params: { start, end } }),
    summary: (type, date) => axios.get('/reports/summary/', { params: { type, date } })
  }
};

// Error interceptor (optional)
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;