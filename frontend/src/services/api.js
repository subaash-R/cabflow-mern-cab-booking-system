// CabFlow API Client using Fetch API
// In production set VITE_API_BASE_URL=https://your-backend.com/api
// In development it falls back to /api which is proxied by Vite to http://localhost:5000
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('cabflow_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// Auth API
export const authAPI = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
  demoLogin: (role) => request('/auth/demo-login', { method: 'POST', body: { role } }),
  getMe: () => request('/auth/me'),
};

// Cab & Location API
export const cabAPI = {
  getTiers: () => request('/cabs/tiers'),
  getLocations: () => request('/cabs/locations'),
  getNearby: (lat, lng, category) => {
    const params = new URLSearchParams();
    if (lat) params.append('lat', lat);
    if (lng) params.append('lng', lng);
    if (category) params.append('category', category);
    return request(`/cabs/nearby?${params.toString()}`);
  },
};

// Rides API
export const rideAPI = {
  estimate: (pickup, dropoff, couponCode) =>
    request('/rides/estimate', {
      method: 'POST',
      body: { pickup, dropoff, couponCode },
    }),
  verifyCoupon: (code) =>
    request('/rides/coupon/verify', {
      method: 'POST',
      body: { code },
    }),
  book: (bookingData) =>
    request('/rides/book', {
      method: 'POST',
      body: bookingData,
    }),
  getMyRides: () => request('/rides/my-rides'),
  getById: (id) => request(`/rides/${id}`),
  updateStatus: (id, status, otp) =>
    request(`/rides/${id}/status`, {
      method: 'PATCH',
      body: { status, otp },
    }),
  rate: (id, score, review) =>
    request(`/rides/${id}/rate`, {
      method: 'POST',
      body: { score, review },
    }),
};

// Driver API
export const driverAPI = {
  getProfile: () => request('/driver/profile'),
  toggleStatus: (isOnline) =>
    request('/driver/toggle-status', {
      method: 'PATCH',
      body: { isOnline },
    }),
  getRequests: () => request('/driver/requests'),
  acceptRide: (rideId) =>
    request(`/driver/accept/${rideId}`, {
      method: 'POST',
    }),
  updateLocation: (lat, lng, address) =>
    request('/driver/location', {
      method: 'PATCH',
      body: { lat, lng, address },
    }),
};

// Admin API
export const adminAPI = {
  getMetrics: () => request('/admin/metrics'),
  getAllRides: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return request(`/admin/rides?${params.toString()}`);
  },
  getAllDrivers: () => request('/admin/drivers'),
  getAllUsers: () => request('/admin/users'),
};
