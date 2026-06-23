import axios from 'axios';

// Connexion directe à l'API Gateway - comme le projet fonctionnel
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Function to get token - will be set by AuthContext
let getTokenFunction = null;

export const setTokenGetter = (fn) => {
  getTokenFunction = fn;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (getTokenFunction) {
      const token = getTokenFunction();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 API Request with token to:', config.url);
      } else {
        console.warn('⚠️ No token available for request:', config.url);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('⚠️ 401 Unauthorized - token may be expired');
    }
    return Promise.reject(error);
  }
);

// Offre Service API
export const offreApi = {
  getAllOffres: () => api.get('/api/offres'),
  getOffreById: (id) => api.get(`/api/offres/${id}`),
  createOffre: (offre) => api.post('/api/offres', offre),
  updateOffre: (id, offre) => api.put(`/api/offres/${id}`, offre),
  deleteOffre: (id) => api.delete(`/api/offres/${id}`),
  searchOffres: (keyword) => api.get(`/api/offres/search?keyword=${keyword}`),
};

// Candidature Service API
export const candidatureApi = {
  getAllCandidatures: () => api.get('/api/candidatures'),
  getCandidatureById: (id) => api.get(`/api/candidatures/${id}`),
  createCandidature: (candidature) => api.post('/api/candidatures', candidature),
  updateCandidature: (id, candidature) => api.put(`/api/candidatures/${id}`, candidature),
  deleteCandidature: (id) => api.delete(`/api/candidatures/${id}`),
  updateStatut: (id, statut) => api.patch(`/api/candidatures/${id}/statut?statut=${statut}`),
  getCandidaturesByUserId: (userId) => api.get(`/api/candidatures/user/${userId}`),
  getCandidaturesByOffreId: (offreId) => api.get(`/api/candidatures/offre/${offreId}`),
};

// Auth Service API
export const authApi = {
  getUserProfile: () => api.get('/api/auth/users/profile'),
  updateUserRoles: (userId, roles) => api.put(`/api/auth/users/${userId}/roles`, { roles }),
};

export default api;
