import axios from 'axios'

// In dev: Vite proxies /api → localhost:8000 (see vite.config.js)
// In production (Vercel): set VITE_API_URL=https://your-backend.railway.app
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => {
    const form = new FormData()
    form.append('username', email)
    form.append('password', password)
    return api.post('/auth/login', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  me: () => api.get('/auth/me'),
}

// ── Services ──────────────────────────────────────────────────────────────
export const servicesAPI = {
  list: (category) => api.get('/services', { params: category ? { category } : {} }),
  categories: () => api.get('/services/categories'),
  get: (id) => api.get(`/services/${id}`),
}

// ── Orders ────────────────────────────────────────────────────────────────
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  list: () => api.get('/orders'),
  get: (id) => api.get(`/orders/${id}`),
  refill: (id) => api.post(`/orders/${id}/refill`),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
}

// ── Transactions ──────────────────────────────────────────────────────────
export const transactionsAPI = {
  list: () => api.get('/transactions'),
  addFunds: (amount) => api.post('/transactions/add-funds', { amount }),
}

// ── Admin ─────────────────────────────────────────────────────────────────
export const adminAPI = {
  stats: () => api.get('/admin/stats'),
  users: () => api.get('/admin/users'),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  addFundsToUser: (id, amount) => api.post(`/admin/users/${id}/add-funds`, { amount }),
  services: () => api.get('/admin/services'),
  syncServices: () => api.post('/admin/services/sync'),
  updateService: (id, data) => api.patch(`/admin/services/${id}`, data),
  orders: (status) => api.get('/admin/orders', { params: status ? { status } : {} }),
}

export default api
