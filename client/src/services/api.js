import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1',
});

// Request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Log request details
  console.log(`[API] Sending ${config.method.toUpperCase()} to: ${config.url}`);
  console.log('Full URL:', config.baseURL + config.url);
  console.log('Params:', config.params);
  console.log('Payload:', config.data);

  return config;
}, error => {
  console.error('[API] Request error:', error);
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(response => {
  console.log(`[API] Response from ${response.config.url}:`, response.data);
  return response;
}, error => {
  const errorResponse = error.response || {};
  const errorData = errorResponse.data || {};

  console.error('[API] Error response:', {
    status: errorResponse.status,
    url: error.config?.url,
    message: error.message,
    responseData: errorData
  });

  // Redirect to login on 401
  if (errorResponse.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location = '/auth';
  }

  return Promise.reject({
    message: errorData.message || errorData.error || error.message || 'Request failed',
    status: errorResponse.status,
    data: errorData
  });
});

// Bid API functions
export const fetchFarmerBids = async (farmerId) => {
  try {
    const response = await api.get(`/bids/farmer/${farmerId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateBidStatus = async (bidId, status) => {
  try {
    const response = await api.patch(`/bids/${bidId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log request details
    console.log(`[API] Sending ${config.method.toUpperCase()} to: ${config.url}`);
    console.log('Full URL:', config.baseURL + config.url);
    
    // Special handling for FormData
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
      console.log('Payload: (FormData)');
    } else {
      console.log('Payload:', config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response from ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    const errorResponse = error.response || {};
    
    console.error('[API] Error response:', {
      status: errorResponse.status,
      url: error.config?.url,
      message: error.message,
      responseData: errorResponse.data
    });

    return Promise.reject({
      message: errorResponse.data?.message || errorResponse.data?.error || error.message || 'Request failed',
      status: errorResponse.status,
      data: errorResponse.data
    });
  }
);

export default api;