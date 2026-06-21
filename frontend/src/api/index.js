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

// Auto-logout on 401 — but only for an *expired/invalid existing session*,
// never for a failed login/register attempt itself. Those endpoints return
// 401/422 with a normal error message that the page should show inline;
// force-redirecting on every 401 used to hijack that response and hard-reload
// the page back to /login before the error could ever render.
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register']

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthEndpoint = AUTH_ENDPOINTS.some((p) => err.config?.url?.includes(p))
    const hadToken = !!localStorage.getItem('token')
    if (err.response?.status === 401 && hadToken && !isAuthEndpoint) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Pulls a human-readable message out of a failed API call. FastAPI returns
// `detail` as a plain string for most errors, but as an array of
// { msg, loc, ... } objects for pydantic validation errors (422s) — those
// must never be rendered directly as a React child or the page blanks out.
export function getErrorMessage(err, fallback = 'Something went wrong') {
  const detail = err?.response?.data?.detail
  if (!detail) return fallback
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || JSON.stringify(d)).join('; ')
  }
  return fallback
}

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
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, new_password) => api.post('/auth/reset-password', { token, new_password }),
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
  // QR scan-and-pay: fetch the QR image admin has configured
  getPaymentQR: () => api.get('/transactions/payment-qr'),
  // Submit a manual payment for admin review (amount, transaction ID, optional screenshot)
  submitPaymentRequest: (data) => api.post('/transactions/payment-requests', data),
  // List the current user's own submitted payment requests (screenshot blobs excluded — lazy-load below)
  myPaymentRequests: () => api.get('/transactions/payment-requests'),
  getMyScreenshot: (id) => api.get(`/transactions/payment-requests/${id}/screenshot`),
  // Admin-only direct credit
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
  bulkPriceAdjust: (data) => api.post('/admin/services/bulk-price-adjust', data),
  detectCountries: () => api.post('/admin/services/detect-countries'),
  orders: (status) => api.get('/admin/orders', { params: status ? { status } : {} }),
  // Payment QR settings
  getPaymentQR: () => api.get('/admin/settings/payment-qr'),
  setPaymentQR: (image) => api.put('/admin/settings/payment-qr', { image }),
  // Manual payment requests review (screenshot blobs excluded from the list — lazy-load below)
  paymentRequests: (status, limit = 50, offset = 0) =>
    api.get('/admin/payment-requests', { params: { ...(status ? { status } : {}), limit, offset } }),
  getPaymentRequestScreenshot: (id) => api.get(`/admin/payment-requests/${id}/screenshot`),
  approvePaymentRequest: (id, admin_note) => api.post(`/admin/payment-requests/${id}/approve`, { admin_note }),
  rejectPaymentRequest: (id, admin_note) => api.post(`/admin/payment-requests/${id}/reject`, { admin_note }),
}

export default api
