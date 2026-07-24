import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('art_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401, clear token
api.interceptors.response.use(
  (res) => {
    // If the proxy fails or isn't running, Vite might serve index.html instead of a 404
    if (typeof res.data === 'string' && res.data.trim().startsWith('<')) {
      return Promise.reject(new Error('API connection failed. Received HTML response.'))
    }
    return res
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('art_token')
      localStorage.removeItem('art_user')
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  signup: (data) => api.post('/auth/signup', data),
  verifyOTP: (data) => api.post('/auth/verify-signup-otp', data),
  resendOTP: (data) => api.post('/auth/resend-signup-otp', data),
  login: (data) => api.post('/auth/login', data),
  googleAuth: (data) => api.post('/auth/google', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  updatePassword: (data) => api.post('/auth/update-password', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

// ── Videos ────────────────────────────────────────────────────────────────
export const videoApi = {
  list: (params) => api.get('/videos', { params }),
  get: (videoId) => api.get(`/videos/${videoId}`),
  update: (videoId, data) => api.patch(`/videos/${videoId}`, data),
  delete: (videoId) => api.delete(`/videos/${videoId}`),
  // Admin upload (presigned multipart — requires S3 CORS to be configured)
  initiateUpload: (data) => api.post('/videos/upload/initiate', data),
  completeUpload: (data) => api.post('/videos/upload/complete', data),
  abortUpload: (data) => api.post('/videos/upload/abort', data),
  getJobStatus: (videoId) => api.get(`/videos/${videoId}/job-status`),
  // Proxy upload — no S3 CORS needed, file goes through the backend
  proxyUpload: (formData, onProgress) => api.post('/videos/upload/proxy', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 0, // disable timeout for large files
    onUploadProgress: onProgress,
  }),
}

// ── Purchases ─────────────────────────────────────────────────────────────
export const purchaseApi = {
  createOrder: (data) => api.post('/purchase/create-order', data),
  verify: (data) => api.post('/purchase/verify', data),
  getMyPurchases: () => api.get('/purchase/my'),
  checkPurchase: (videoId) => api.get(`/purchase/check/${videoId}`),
}

// ── Progress ──────────────────────────────────────────────────────────────
export const progressApi = {
  get: (videoId) => api.get(`/progress/${videoId}`),
  update: (data) => api.post('/progress/save', data),
  complete: (data) => api.post('/progress/complete', data),
  getAll: () => api.get('/progress/history'),
}

// ── Wishlist ──────────────────────────────────────────────────────────────
export const wishlistApi = {
  get: () => api.get('/wishlist'),
  add: (videoId) => api.post(`/wishlist/${videoId}`),
  remove: (videoId) => api.delete(`/wishlist/${videoId}`),
}

// ── Artists ───────────────────────────────────────────────────────────────
export const artistApi = {
  list: (params) => api.get('/artists', { params }),
  getById: (id) => api.get(`/artists/${id}`),
  create: (data) => api.post('/artists', data),
  update: (id, data) => api.patch(`/artists/${id}`, data),
  delete: (id) => api.delete(`/artists/${id}`),
  apply: (data) => api.post('/artists/apply', data),
}

// ── Admin ─────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  listUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (userId) => api.get(`/admin/users/${userId}`),
  updateUserRole: (userId, role) => api.patch(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  listAllVideos: (params) => api.get('/admin/videos', { params }),
  updateFeaturedVideos: (data) => api.put('/admin/videos/featured', data),
  getRevenue: () => api.get('/admin/revenue'),
  uploadImage: (formData) => api.post('/admin/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getApplications: (params) => api.get('/admin/applications', { params }),
  updateApplicationStatus: (id, data) => api.patch(`/admin/applications/${id}/status`, data),
  deleteApplication: (id) => api.delete(`/admin/applications/${id}`),
}

// ── Playback ──────────────────────────────────────────────────────────────
export const playbackApi = {
  registerDevice: (data) => api.post('/playback/register-device', data),
  requestPlayback: (data) => api.post('/playback/request', data),
  logoutDevice: () => api.post('/playback/logout-device'),
}

export default api
