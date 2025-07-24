import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/hooks/useAuth';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeAnonymousSession } from './src/services/apiService';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';


const queryClient = new QueryClient();

export default function App() {

  const [isInitialized, setIsInitialized] = useState(false);

  // Load the fonts required by the app
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });
  
  useEffect(() => {
    // This function runs once when the app starts.
    const bootstrapApp = async () => {
      try {
        console.log('[App.tsx] Initializing session...');
        // We wait here until the token is fetched and stored.
        await initializeAnonymousSession();
        console.log('[App.tsx] Session initialization complete.');
      } catch (error) {
        console.error('[App.tsx] Failed to initialize session:', error);
      } finally {
        // Allow the rest of the app to render, even if initialization failed.
        setIsInitialized(true);
      }
    };

    bootstrapApp();
  }, []);

  // While we wait for the token, show a loading screen.
  if (!isInitialized || !fontsLoaded) {
    return (
      <View >
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }


  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PaperProvider>
            <AppNavigator />
          </PaperProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
      );
}