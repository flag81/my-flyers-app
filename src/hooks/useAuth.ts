import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const useAuth = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const checkUserSession = useCallback(async () => {
    try {
      console.log('[DEBUG] checkUserSession called');
      const response = await fetch(`${API_URL}/check-session`, {
        credentials: 'include'
      });
      const data = await response.json();
      console.log('[DEBUG] /check-session response:', data);

      if (data.isLoggedIn) {
        setUserId(data.userId);
        setIsRegistered(!!data.isRegistered);
        setEmail(data.email || '');
        setIsLoggedIn(true);
      } else {
        setUserId(null);
        setIsRegistered(false);
        setEmail('');
        setIsLoggedIn(false);
        console.log('[DEBUG] No user ID found, calling /initialize...');
        initializeAnonymousSession();
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setUserId(null);
      setIsRegistered(false);
      setEmail('');
      setIsLoggedIn(false);
    }
  }, []);

  const initializeAnonymousSession = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/initialize`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok && data.userId) {
        console.log('[DEBUG] Anonymous session initialized, userId:', data.userId);
        setUserId(data.userId);
        setIsRegistered(false);
        setIsLoggedIn(false);
      } else {
        console.error('[ERROR] Failed to initialize anonymous session:', data.message);
      }
    } catch (error) {
      console.error('Error initializing anonymous session:', error);
    }
  }, []);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  return {
    userId,
    isLoggedIn,
    email,
    isRegistered,
    setUserId,
    setIsLoggedIn,
    setEmail,
    checkUserSession
  };
};
