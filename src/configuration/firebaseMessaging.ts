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
import notifee, { AndroidImportance } from '@notifee/react-native';
import { useNavigation } from '@react-navigation/native';
import { navigate } from '../helper/navigationRef';

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
      'Please enable push notifications in settings to receive alerts.',
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

const handleNotificationNavigation = (remoteMessage: any) => {
  if (remoteMessage?.data?.navigation) {
    const { booking_id, sender_id, screen } = remoteMessage.data;

    const targetScreen = screen;

    navigate(targetScreen, {
      booking_id: booking_id,
      pandit_id: sender_id,
    });
  }
};

export async function registerNotificationListeners() {
  await notifee.requestPermission();

  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });

  messaging.onMessage(async (remoteMessage: any) => {
    console.log('📩 Foreground FCM message:', remoteMessage);

    const { title, body } = remoteMessage.notification || {};

    await notifee.displayNotification({
      title: title || 'New Notification',
      body: body || 'You have a new message!',
      android: {
        channelId,
        smallIcon: 'ic_notifcation',
        pressAction: {
          id: 'default',
        },
      },
      ios: {},
    });
  });

  // App opened from background notification
  messaging.onNotificationOpenedApp((remoteMessage: any) => {
    if (remoteMessage) {
      console.log('🔁 Opened from background:', remoteMessage);
      handleNotificationNavigation(remoteMessage);
    }
  });

  // App opened from quit state
  messaging.getInitialNotification().then((remoteMessage: any) => {
    if (remoteMessage) {
      console.log('🚀 Opened from quit state:', remoteMessage.notification);
      handleNotificationNavigation(remoteMessage);
    }
  });
}

// ✅ Must be called outside React component scope (e.g., in index.js or this file)
messaging.setBackgroundMessageHandler(async remoteMessage => {
  console.log('📨 Background FCM message:', remoteMessage);
  // Process the message or show local notification
});