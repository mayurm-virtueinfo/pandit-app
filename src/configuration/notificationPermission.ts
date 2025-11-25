import { Platform, Alert } from 'react-native';
import messaging, {
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import { checkNotifications } from 'react-native-permissions';

export async function requestUserPermission(): Promise<boolean> {
  console.log('Requesting permission...');

  // Check with react-native-permissions first for debugging
  const settings = await checkNotifications();
  console.log('RN Permissions Status:', settings.status, settings.settings);

  const authStatus = await messaging().requestPermission();
  console.log('Authorization Status:', authStatus);

  const enabled =
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('✅ Notification permission granted');

    try {
      if (Platform.OS === 'ios') {
        const apnsToken = await messaging().getAPNSToken();
        console.log('📲 APNs Token:', apnsToken);
      }

      const fcmToken = await getFcmToken();
      console.log('🎯 FCM Token:', fcmToken);
    } catch (error) {
      console.error('🚫 Error during notification setup:', error);
    }

    return true;
  } else {
    console.log(
      '❌ Notification permission denied or not determined. Status:',
      authStatus,
    );
    Alert.alert(
      'Notifications Disabled',
      `Please enable push notifications in settings to receive alerts.\nStatus: ${authStatus}\nRNP Status: ${settings.status}`,
    );
    return false;
  }
}

export async function getFcmToken(): Promise<string | null> {
  try {
    const fcmToken = await messaging().getToken();
    return fcmToken;
  } catch (error) {
    console.error('🚫 Failed to get FCM token:', error);
    return null;
  }
}
