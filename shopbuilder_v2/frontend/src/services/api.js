import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      const refresh = localStorage.getItem('refreshToken')
      if (refresh) {
        try {
          const res = await axios.post(`${API_URL}/api/v1/auth/refresh`, { refreshToken: refresh })
          const newToken = res.data.data.accessToken
          localStorage.setItem('accessToken', newToken)
          err.config.headers.Authorization = `Bearer ${newToken}`
          return api.request(err.config)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  }
)

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
}

export const tenants = {
  onboard: (data) => api.post('/tenants/onboard', data),
  getMyTenants: () => api.get('/tenants/me'),
  createWebhook: (data) => api.post('/tenants/webhooks', data),
  listWebhooks: () => api.get('/tenants/webhooks'),
}

export const products = {
  create: (data, tenantId) => api.post(`/products?tenantId=${tenantId}`, data),
  list: (tenantId, cursor) => api.get(`/products?tenantId=${tenantId}${cursor ? `&cursor=${cursor}` : ''}`),
  get: (id, tenantId) => api.get(`/products/${id}?tenantId=${tenantId}`),
  update: (id, data, tenantId) => api.patch(`/products/${id}?tenantId=${tenantId}`, data),
  generateVariants: (id, data, tenantId) => api.post(`/products/${id}/variants/generate?tenantId=${tenantId}`, data),
  updateStock: (variantId, delta, tenantId) => api.patch(`/products/variants/${variantId}/stock?tenantId=${tenantId}`, { delta }),
}

export const orders = {
  create: (slug, data) => api.post(`/stores/${slug}/orders`, data),
  list: () => api.get('/orders'),
  get: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
}

export const admin = {
  dashboard: () => api.get('/admin/dashboard'),
  listTenants: () => api.get('/admin/tenants'),
  suspendTenant: (id, reason) => api.patch(`/admin/tenants/${id}/suspend`, { reason }),
  activateTenant: (id) => api.patch(`/admin/tenants/${id}/activate`),
  listUsers: () => api.get('/admin/users'),
  deactivateUser: (id) => api.patch(`/admin/users/${id}/deactivate`),
}

export default api
