import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import apiService from './apiService';


// Configure how notifications are handled when the app is in the foreground
// FIX: Added missing properties to satisfy the NotificationBehavior type.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Registers the device for push notifications, gets the token, and sends it to your backend.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token;

  // Push notifications only work on physical devices, not simulators.
  if (!Device.isDevice) {
    Alert.alert('Vërejtje', 'Njoftimet funksionojnë vetëm në pajisje fizike.');
    return null;
  }

  // Check for existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // If permissions are not granted, ask the user.
  if (existingStatus !== 'granted') {
    console.log('[Push Service] Permissions not granted, requesting...');
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // If permissions are still not granted, exit.
  if (finalStatus !== 'granted') {
    Alert.alert('Leja u refuzua', 'Ju nuk do të pranoni njoftime për ofertat.');
    return null;
  }

  // Get the Expo push token using the Project ID from your .env file
  try {
    const expoPushToken = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    token = expoPushToken.data;
    console.log('✅ [Push Service] Successfully received Expo push token:', token);
  } catch (e) {
    console.error('❌ [Push Service] Failed to get Expo push token:', e);
    return null;
  }

  // Send the token to your backend server to be stored
  if (token) {
    try {
      console.log('📡 [Push Service] Sending token to /register-push-token...');
      await apiService.post('/register-push-token', { token });
      console.log('✅ [Push Service] Token sent to server successfully.');
    } catch (error) {
      console.error('❌ [Push Service] Failed to send token to server:', error);
    }
  }

  // Required for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}