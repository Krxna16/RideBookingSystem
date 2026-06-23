import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authorization token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data; // Returns AuthResponse (token, email, role, name, userId)
  },
  registerUser: async (name, email, password) => {
    const response = await apiClient.post('/auth/register/user', { name, email, password });
    return response.data;
  },
  registerDriver: async (name, email, password, phone, vehicleNumber) => {
    const response = await apiClient.post('/auth/register/driver', {
      name,
      email,
      password,
      phone,
      vehicleNumber,
    });
    return response.data;
  },
};

export const rideAPI = {
  bookRide: async (userId, pickupLocation, dropLocation, distance) => {
    const response = await apiClient.post('/rides/book', {
      userId,
      pickupLocation,
      dropLocation,
      distance,
    });
    return response.data;
  },
  getRideDetails: async (rideId) => {
    const response = await apiClient.get(`/rides/${rideId}`);
    return response.data;
  },
  getRideHistory: async (userId) => {
    const response = await apiClient.get(`/rides/history/user/${userId}`);
    return response.data;
  },
  getRequestedRides: async () => {
    const response = await apiClient.get('/rides/requested');
    return response.data;
  },
  getAssignedRides: async (driverId) => {
    const response = await apiClient.get(`/rides/assigned/driver/${driverId}`);
    return response.data;
  },
  updateRideStatus: async (rideId, status, driverId) => {
    let url = `/rides/${rideId}/status?status=${status}`;
    if (driverId) {
      url += `&driverId=${driverId}`;
    }
    const response = await apiClient.put(url);
    return response.data;
  },
  toggleDriverAvailability: async (driverId, available) => {
    const response = await apiClient.put(`/rides/driver/${driverId}/availability?available=${available}`);
    return response.data;
  },
  getDriverAvailability: async (driverId) => {
    const response = await apiClient.get(`/rides/driver/${driverId}/availability`);
    return response.data;
  },
  acceptRide: async (rideId, driverId) => {
    const response = await apiClient.put(`/rides/${rideId}/accept?driverId=${driverId}`);
    return response.data;
  },
};

export default apiClient;
