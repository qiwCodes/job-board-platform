import axios from 'axios';

const TOKEN_KEY = 'token';
let isRedirectingForUnauthorized = false;

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

api.interceptors.request.use((config) => {
  const nextConfig = { ...config };
  const token = window.localStorage.getItem(TOKEN_KEY);

  if (token) {
    nextConfig.headers = {
      ...nextConfig.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return nextConfig;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      window.localStorage.clear();

      if (!isRedirectingForUnauthorized) {
        isRedirectingForUnauthorized = true;
        window.location.replace('/login');
        window.setTimeout(() => {
          isRedirectingForUnauthorized = false;
        }, 250);
      }
    }

    return Promise.reject(error);
  },
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const jobsAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getMine: (params) => api.get('/jobs/company/me', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
};

export const applicationsAPI = {
  apply: (jobId, formData) =>
    api.post(`/jobs/${jobId}/apply`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  getMine: () => api.get('/applications/me'),
  getJobApplicants: (jobId) => api.get(`/jobs/${jobId}/applications`),
  updateStatus: (id, status) => api.patch(`/applications/company/${id}/status`, { status }),
};

export default api;
