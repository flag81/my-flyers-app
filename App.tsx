import 'react-native-gesture-handler';
// UPDATED: Added useMemo for snap points
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/hooks/useAuth';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeAnonymousSession } from './src/services/apiService';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { registerForPushNotificationsAsync } from './src/services/pushNotificationService';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// REMOVED: Modalize is no longer used
// import { Modalize } from 'react-native-modalize';
// NEW: Import components from @gorhom/bottom-sheet
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import NotificationProductsSheet from './src/components/NotificationProductsSheet';

const queryClient = new QueryClient();

// This is the crucial part for showing notifications when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    // The following properties are added to satisfy the updated NotificationBehavior type.
    // These are likely Android-specific and ensure the notification appears in the notification tray.
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const navigationRef = useNavigationContainerRef();
  // UPDATED: Ref type changed for BottomSheetModal
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [notificationProductIds, setNotificationProductIds] = useState<number[]>([]);

  // NEW: Define snap points for the bottom sheet. useMemo is recommended for performance.
  const snapPoints = useMemo(() => ['50%', '85%'], []);

  // Load the fonts required by the app
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });
  
  useEffect(() => {
    // This function runs once when the app starts.
    const bootstrapApp = async () => {
      try {
        console.log('--- [Bootstrap] Start ---');

        console.log('1. [Bootstrap] Awaiting session initialization...');
        await initializeAnonymousSession();
        console.log('✅ 1. [Bootstrap] Session initialization complete.');

        console.log('2. [Bootstrap] Awaiting push notification registration...');
        await registerForPushNotificationsAsync();
        console.log('✅ 2. [Bootstrap] Push notification registration complete.');

      } catch (error) {
        console.error('❌ [Bootstrap] CRITICAL ERROR during initialization:', error);
      } finally {
        // This will now run and hide the spinner, even if an error occurred.
        console.log('🏁 [Bootstrap] Reached finally block. Hiding spinner.');
        setIsInitialized(true);
      }
    };

    bootstrapApp();
  }, []);

  useEffect(() => {
    // Listen for the user tapping a notification
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      // Extract product IDs from the notification's data payload
      const productIds = response.notification.request.content.data.productIds as number[];

      // Check if the navigation container is ready
      if (navigationRef.isReady()) {
        // Navigate to the 'Fillimi' screen (your HomeScreen), passing the product IDs
        navigationRef.navigate('Home', { 
          screen: 'Fillimi',
          params: { notificationProductIds: productIds } 
        });
      }
    });

    return () => subscription.remove();
  }, [navigationRef]); // Add navigationRef to dependency array

  // While we wait for the token, show a loading screen.
  if (!isInitialized || !fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* FIX: QueryClientProvider must wrap BottomSheetModalProvider */}
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <PaperProvider>
              <BottomSheetModalProvider>
                <NavigationContainer ref={navigationRef}>
                  <AppNavigator />
                </NavigationContainer>

                {/* This modal now has access to all parent contexts */}
                <BottomSheetModal
                  ref={bottomSheetModalRef}
                  index={0} // Start at the first snap point
                  snapPoints={snapPoints}
                  // Optional: Add a backdrop
                  enablePanDownToClose={true}
                >
                  <NotificationProductsSheet productIds={notificationProductIds} />
                </BottomSheetModal>
              </BottomSheetModalProvider>
            </PaperProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});