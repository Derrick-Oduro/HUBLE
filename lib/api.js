import AsyncStorage from "@react-native-async-storage/async-storage";

// API Configuration
export const API_CONFIG = {
  // Update these URLs based on your setup
  BASE_URL: __DEV__
    ? "http://localhost:3000/api" // Development
    : "https://your-production-api.com/api", // Production

  TIMEOUT: 10000, // 10 seconds
};

// For local development
const API_BASE_URL = "http://localhost:3000/api";

// For physical device testing (replace with your computer's IP)
const API_BASE_URL = "http://192.168.1.100:3000/api";

// For production
const API_BASE_URL = "https://your-domain.com/api";

// API Helper functions
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = await AsyncStorage.getItem("userToken");

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      timeout: API_CONFIG.TIMEOUT,
    };

    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      ...defaultOptions,
      ...options,
    });

    const data = await response.json();

    // Handle token expiration
    if (response.status === 401 && data.error?.includes("token")) {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userData");
      await AsyncStorage.removeItem("isLoggedIn");
      // You might want to redirect to login here
    }

    return data;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  register: (userData) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  getProfile: () => apiRequest("/auth/profile"),

  updateProfile: (profileData) =>
    apiRequest("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),
};

// Habits API functions
export const habitsAPI = {
  getAll: () => apiRequest("/habits"),

  create: (habitData) =>
    apiRequest("/habits", {
      method: "POST",
      body: JSON.stringify(habitData),
    }),

  update: (id, habitData) =>
    apiRequest(`/habits/${id}`, {
      method: "PUT",
      body: JSON.stringify(habitData),
    }),

  complete: (id) =>
    apiRequest(`/habits/${id}/complete`, {
      method: "POST",
    }),

  delete: (id) =>
    apiRequest(`/habits/${id}`, {
      method: "DELETE",
    }),
};
