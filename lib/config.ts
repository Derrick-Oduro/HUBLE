import Constants from 'expo-constants';

// API Configuration
// Priority:
// 1) EXPO_PUBLIC_API_URL (explicit override)
// 2) Auto-detected LAN host from Expo (works in Expo Go)
// 3) localhost fallback (works on simulators)
const getDevApiUrl = () => {
  const explicitApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (explicitApiUrl) {
    return explicitApiUrl;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    '';

  const host = hostUri.split(':')[0];
  if (host) {
    return `http://${host}:3000/api`;
  }

  return 'http://localhost:3000/api';
};

const API_BASE_URL = __DEV__
  ? getDevApiUrl()
  : 'https://your-production-api.com/api';

export const API_URL = API_BASE_URL;

// Environment
export const isDevelopment = __DEV__;
export const isProduction = !__DEV__;
