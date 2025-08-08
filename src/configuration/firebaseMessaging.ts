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
} from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { navigate, storePendingNavigation } from '../helper/navigationRef';

// Firebase Messaging instance
const messaging = getMessaging(getApp());

/**
 * Ask for user permission and fetch FCM token
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

/**
 * Fetch FCM token
 */
export async function getFcmToken(): Promise<string | null> {
  try {
    return await getToken(messaging);
  } catch (error) {
    console.error('🚫 Failed to get FCM token:', error);
    return null;
  }
}

/**
 * Navigate to a screen if navigation data is present
 */
const handleNotificationNavigation = (remoteMessage: any) => {
  if (remoteMessage?.data?.navigation) {
    const { booking_id, sender_id, screen } = remoteMessage.data;
    console.log("➡️ Navigating to", screen);

    storePendingNavigation({
      name: screen,
      params: {
        booking_id,
        pandit_id: sender_id,
      },
    });
  }
};

/**
 * Register all notification listeners
 */
export async function registerNotificationListeners() {
  await notifee.requestPermission();

  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });

  // Foreground messages
  onMessage(messaging, async (remoteMessage: any) => {
    console.log('📩 Foreground FCM message:', remoteMessage);

    const { title, body } = remoteMessage.notification || {};

    await notifee.displayNotification({
      title: title || 'New Notification',
      body: body || 'You have a new message!',
      android: {
        channelId,
        smallIcon: 'ic_notifcation',
        pressAction: { id: 'default' },
      },
      ios: {},
      data: remoteMessage.data || {},
    });
  });

  // Foreground tap events
  notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS && detail?.notification?.data?.navigation) {
      handleNotificationNavigation({ data: detail.notification.data });
    }
  });

  // Background tap events
  onNotificationOpenedApp(messaging, (remoteMessage: any) => {
    console.log('🔁 Opened from background:', remoteMessage);
    handleNotificationNavigation(remoteMessage);
  });

  // Quit state tap events
  const initialNotification = await getInitialNotification(messaging);
  if (initialNotification) {
    console.log('🚀 Opened from quit state:', initialNotification.notification);
    handleNotificationNavigation(initialNotification);
  }
}

// Background handler for data-only messages
messaging.setBackgroundMessageHandler(async remoteMessage => {
  console.log('📨 Background FCM message:', remoteMessage);

  await notifee.displayNotification({
    title: remoteMessage.data?.title || 'Background Notification',
    body: remoteMessage.data?.body || '',
    android: {
      channelId: 'default',
      pressAction: { id: 'default' },
    },
    data: remoteMessage.data,
  });
});
