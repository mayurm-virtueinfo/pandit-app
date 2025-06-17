import { Platform, Alert } from 'react-native';
import {
  getMessaging,
  requestPermission,
  getToken,
  getAPNSToken,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  AuthorizationStatus,
  registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';

// Get Firebase messaging instance
const messaging = getMessaging(getApp());

/**
 * Request notification permission and fetch FCM token
 */
export async function requestUserPermission(): Promise<boolean> {
  const authStatus = await requestPermission(messaging);
  const enabled =
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('✅ Notification permission granted');

    try {
      if (Platform.OS === 'ios') {
        // Optional if auto-register is enabled in firebase.json
        // await registerDeviceForRemoteMessages(messaging);

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
      'Please enable push notifications in settings to receive alerts.'
    );
    return false;
  }
}

/**
 * Fetch current FCM token
 */
export async function getFcmToken(): Promise<string | null> {
  try {
    const fcmToken = await getToken(messaging);
    return fcmToken;
  } catch (error) {
    console.error('🚫 Failed to get FCM token:', error);
    return null;
  }
}

/**
 * Register all notification listeners (foreground, background, taps)
 */
export function registerNotificationListeners() {
  // Foreground message handler
  onMessage(messaging, async remoteMessage => {
    console.log('📩 Foreground FCM message:', remoteMessage);
    // Optionally show local notification here
  });

  // App opened from background notification
  onNotificationOpenedApp(messaging, remoteMessage => {
    if (remoteMessage) {
      console.log('🔁 Opened from background:', remoteMessage.notification);
      // Navigate or update state
    }
  });

  // App opened from quit state
  getInitialNotification(messaging).then(remoteMessage => {
    if (remoteMessage) {
      console.log('🚀 Opened from quit state:', remoteMessage.notification);
      // Navigate or update state
    }
  });
}

// ✅ Must be called outside React component scope (e.g., in index.js or this file)
messaging.setBackgroundMessageHandler(async remoteMessage => {
  console.log('📨 Background FCM message:', remoteMessage);
  // Process the message or show local notification
});
