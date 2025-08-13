import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';


const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';


console.log('API URL env:', process.env.EXPO_PUBLIC_API_URL);

const TOKEN_KEY = 'userToken';

console.log('API URL:', API_URL);
console.log('Token Key:', TOKEN_KEY);

// Create an axios instance with the base URL
const apiService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Use an interceptor to automatically attach the JWT to every request
apiService.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);

    console.log('Current token:', token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Calls the backend to initialize a session for an anonymous user.
 * It retrieves a JWT and stores it securely.
 */
export const initializeAnonymousSession = async (): Promise<string | null> => {
  try {
    // Check if a token already exists in secure storage
    const existingToken = await SecureStore.getItemAsync(TOKEN_KEY);
    if (existingToken) {
      console.log('Session already initialized from SecureStore.');
      return existingToken;
    }

    console.log('Initializing new anonymous session...');
    // Use a plain axios call since the interceptor won't have a token yet.
    const response = await axios.get(`${API_URL}/initialize-anonymous`);
    
    const { token } = response.data;

    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      console.log('Anonymous session initialized and token stored securely.');
      return token;
    }
    return null;
  } catch (error) {
    console.error('Failed to initialize anonymous session:', error);
    return null;
  }
};

export default apiService;