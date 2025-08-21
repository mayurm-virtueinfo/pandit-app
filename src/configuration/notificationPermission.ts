import {Platform, Alert} from 'react-native';
import {
  getMessaging,
  requestPermission,
  getToken,
  getAPNSToken,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import {getApp} from '@react-native-firebase/app';

const messaging = getMessaging(getApp());

export async function requestUserPermission(): Promise<boolean> {
  const authStatus = await requestPermission(messaging);
  const enabled =
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('✅ Notification permission granted');

    try {
      if (Platform.OS === 'ios') {
        const apnsToken = await getAPNSToken(messaging);
        console.log('📲 APNs Token:', apnsToken);
      }

      const fcmToken = await getFcmToken();
      console.log('🎯 FCM Token:', fcmToken);
    } catch (error) {
      console.error('🚫 Error during notification setup:', error);
    }

    return true;
  } else {
    Alert.alert(
      'Notifications Disabled',
      'Please enable push notifications in settings to receive alerts.',
    );
    return false;
  }
}

export async function getFcmToken(): Promise<string | null> {
  try {
    const fcmToken = await getToken(messaging);
    return fcmToken;
  } catch (error) {
    console.error('🚫 Failed to get FCM token:', error);
    return null;
  }
}
