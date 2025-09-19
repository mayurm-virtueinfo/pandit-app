import notifee, { EventType, AndroidImportance } from '@notifee/react-native';
import { getMessaging } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { COLORS } from '../theme/theme';
import { navigate, navigationRef } from '../helper/navigationRef';

const messaging = getMessaging(getApp());

let isSetup = false;
let foregroundUnsubscribe: (() => void) | null = null;

export async function setupNotifications() {
  if (isSetup) {
    console.log('Notifications already set up, skipping...');
    return;
  }

  isSetup = true;

  await notifee.requestPermission();
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });

  // Foreground message handler (displays notification)
  messaging.onMessage(async (remoteMessage: any) => {
    console.log('📩 Foreground FCM message:', remoteMessage);

    const { title, body } = remoteMessage.notification || {};
    await notifee.displayNotification({
      id: remoteMessage.messageId,
      title: title || 'New Notification',
      body: body || 'You have a new message!',
      data: remoteMessage.data,
      android: {
        channelId,
        smallIcon: 'ic_notification',
        pressAction: { id: 'default' },
        color: COLORS.primary,
      },
      ios: {},
    });
  });

  // Handle notification press in foreground
  foregroundUnsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      console.log('Notification pressed in foreground', detail);
      const data = detail.notification?.data || {};
      handleNotificationNavigation(data);
    }
  });

  // App opened from background
  messaging.onNotificationOpenedApp((remoteMessage: any) => {
    if (remoteMessage) {
      console.log('🔁 Opened from background:', remoteMessage);
      handleNotificationNavigation(remoteMessage.data);
    }
  });

  // Background handler (must be top-level)
  messaging.setBackgroundMessageHandler(async (remoteMessage: any) => {
    console.log('📨 Background FCM message:', remoteMessage);
    // Optionally display a local notification here if needed
  });
}

export function handleNotificationNavigation(data: any) {
  if (data?.screen === 'WaitingApprovalPujaScreen') {
    const targetScreen = data?.screen;
    const booking_id = data?.booking_id;
    const offer_id = data?.offer_id;

    const nestedParams = {
      screen: 'AppBottomTabNavigator',
      params: {
        screen: 'HomeNavigator',
        params: {
          screen: targetScreen,
          params: {
            booking_id,
            offer_id,
          },
        },
      },
    };

    setTimeout(() => {
      if (navigationRef.isReady()) {
        navigate('Main', nestedParams);
      } else {
        console.warn('Navigation not ready yet');
      }
    }, 500);
  } else if (data?.screen === 'ChatScreen') {
    const targetScreen = data?.screen;
    const booking_id = data?.booking_id;
    const user_id = data?.sender_id;
    const videocall = data?.video_call;

    const nestedParams = {
      screen: 'AppBottomTabNavigator',
      params: {
        screen: 'HomeNavigator',
        params: {
          screen: targetScreen,
          params: {
            booking_id,
            user_id,
            videocall
          },
        },
      },
    };

    setTimeout(() => {
      if (navigationRef.isReady()) {
        navigate('Main', nestedParams);
      } else {
        console.warn('Navigation not ready yet');
      }
    }, 500);
  }
}

export function cleanupNotifications() {
  if (foregroundUnsubscribe) {
    foregroundUnsubscribe();
    foregroundUnsubscribe = null;
  }
  isSetup = false;
}
