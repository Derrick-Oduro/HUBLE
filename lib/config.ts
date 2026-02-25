// API Configuration
// Use the network IP for development to allow connection from mobile device
// For production, use your deployed API URL
const API_BASE_URL = __DEV__ 
  ? 'http://10.21.48.60:3000/api'  // Update this IP to match your local network
  : 'https://your-production-api.com/api';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || API_BASE_URL;

// Environment
export const isDevelopment = __DEV__;
export const isProduction = !__DEV__;
