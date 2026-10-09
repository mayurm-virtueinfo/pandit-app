import { Platform, Alert, PermissionsAndroid } from 'react-native';
import messaging, {
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import { checkNotifications } from 'react-native-permissions';

export const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    try {
      const { AppState } = require('react-native');
      if (AppState.currentState !== 'active') {
        return false;
      }
      
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);

      const cameraGranted = granted['android.permission.CAMERA'] === 'granted';
      const audioGranted = granted['android.permission.RECORD_AUDIO'] === 'granted';

      if (!cameraGranted || !audioGranted) {
        Alert.alert('Permissions required', 'Camera and microphone are required for video calls.');
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};

export async function requestUserPermission(): Promise<boolean> {
  console.log('Requesting permission...');

  let rnpStatus = 'unknown';
  try {
    // Check with react-native-permissions first for debugging
    const settings = await checkNotifications();
    rnpStatus = settings.status;
    console.log('RN Permissions Status:', settings.status, settings.settings);
  } catch (err) {
    console.warn('RN Permissions check failed:', err);
  }

  try {
    let authStatus = await messaging().requestPermission();
    console.log('Authorization Status:', authStatus);

    // Status -1 means NOT_DETERMINED — the OS hasn't resolved the permission yet.
    // This can happen on iOS if APNs isn't ready or on simulators.
    // Retry once after a short delay before giving up.
    if (authStatus === AuthorizationStatus.NOT_DETERMINED) {
      console.log('⏳ Permission not determined yet, retrying after delay...');
      await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
      authStatus = await messaging().requestPermission();
      console.log('Authorization Status (retry):', authStatus);
    }

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
    } else if (authStatus === AuthorizationStatus.NOT_DETERMINED) {
      // Still not determined after retry — likely a simulator or APNs config issue.
      // Don't show a scary alert; just log and return false silently.
      console.log(
        '⚠️ Notification permission still not determined after retry. Status:',
        authStatus,
        '— This is expected on iOS Simulator or if APNs is not configured.',
      );
      return false;
    } else {
      // Truly denied (status 0)
      console.log(
        '❌ Notification permission denied. Status:',
        authStatus,
      );
      Alert.alert(
        'Notifications Disabled',
        'Please enable push notifications in settings to receive alerts.',
      );
      return false;
    }
  } catch (error) {
    console.error('🚫 Error requesting user permission:', error);
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
