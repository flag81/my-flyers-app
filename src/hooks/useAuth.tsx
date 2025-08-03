import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import apiService, { initializeAnonymousSession } from '../services/apiService'; // Import apiService

export const useAuth = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const checkUserSession = useCallback(async () => {
    try {
      console.log('[Auth] Checking user session...');
      // Use the centralized apiService for all calls
      const response = await apiService.get('/check-session');
      const data = response.data;
      console.log('[Auth] /check-session response:', data);

      if (data.isLoggedIn) {
        setUserId(data.userId);
        setIsRegistered(!!data.isRegistered);
        setEmail(data.email || '');
        setIsLoggedIn(true);
      } else {
        // If not logged in, ensure we have an anonymous token
        console.log('[Auth] No active session, ensuring anonymous token exists...');
        await initializeAnonymousSession();
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('[Auth] Error checking session:', error);
      setIsLoggedIn(false);
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



// Create the context to hold the auth state
const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);

// Create the provider component that will wrap your app
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// Create a custom hook to easily access the auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};