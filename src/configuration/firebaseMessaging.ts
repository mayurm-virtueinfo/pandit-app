import notifee, { EventType, AndroidImportance } from '@notifee/react-native';
import { getMessaging } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { COLORS } from '../theme/theme';
import { navigate, navigationRef } from '../helper/navigationRef';
import {
  handleIncomingPujaRequest,
  createPujaRequestChannel,
  isPujaRequestAction,
  getPujaRequestActionType,
  acceptPujaRequest,
  declinePujaRequest,
} from './pujaRequest';
 
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

  // Create the dedicated Puja Request channel on app init
  await createPujaRequestChannel();
 
  // Foreground message handler
  messaging.onMessage(async (remoteMessage: any) => {
    console.log('📩 Foreground FCM message:', remoteMessage);

    const data = remoteMessage.data;

    // ── PUJA REQUEST: Show full-screen modal in foreground ──
    if (data?.type === 'PUJA_REQUEST' || data?.screen === 'WaitingApprovalPujaScreen') {
      console.log('🛕 [FG] Incoming Puja Request — triggering modal');
      await handleIncomingPujaRequest(data);
      return;
    }

    // ── Standard notification ──
    // In foreground, FCM does not automatically show the notification, so we display it here.
    const { title, body } = remoteMessage.notification || {};
    
    // Only display if there's actually a title or body, to avoid showing empty generic notifications
    if (title || body || data?.title || data?.body) {
      await notifee.displayNotification({
        id: remoteMessage.messageId,
        title: title || data?.title || 'New Notification',
        body: body || data?.body || 'You have a new message!',
        data: remoteMessage.data,
        android: {
          channelId,
          smallIcon: 'ic_notification',
          pressAction: { id: 'default' },
          color: COLORS.primary,
        },
        ios: {},
      });
    }
  });
 
  // Handle notification press/action in foreground
  foregroundUnsubscribe = notifee.onForegroundEvent((event) => {
    const { type, detail } = event;

    // ── Handle Puja Request actions (ACCEPT/DECLINE) ──
    if (type === EventType.ACTION_PRESS && isPujaRequestAction(event)) {
      const actionType = getPujaRequestActionType(event);
      const notificationData = detail.notification?.data || {};
      const bookingId = (notificationData.bookingId || notificationData.booking_id) as string;
      const offerId = (notificationData.offerId || notificationData.offer_id) as string;

      if (bookingId) {
        if (actionType === 'accept') {
          acceptPujaRequest(bookingId, offerId);
        } else if (actionType === 'decline') {
          declinePujaRequest(bookingId, offerId);
        }
      }
      return;
    }

    // ── Standard notification press ──
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
 
  // NOTE: Background handler is now registered in index.js (top-level)
  // to ensure it fires even when the app is fully killed.
}
 
export function handleNotificationNavigation(data: any) {
  if (data?.type === 'video_call_invite') {
    const nestedParams = {
      screen: 'AppBottomTabNavigator',
      params: {
        screen: 'HomeNavigator',
        params: {
          screen: 'ChatScreen',
          params: {
            booking_id: data?.booking_id,
            user_id: data?.sender_id,
            other_user_name: data?.callerName || 'Call',
            videocall: true,
            incomingMeetingUrl: data?.meeting_url,
            currentCallUUID: data?.callUUID,
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
  } else if (data?.screen === 'WaitingApprovalPujaScreen') {
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
            videocall,
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
  }else if (data?.pandit_screen === 'CompletePujaDetailsScreen') {
    const targetScreen = data?.pandit_screen;
    const booking_id = data?.booking_id;
 
    const nestedParams = {
      screen: 'AppBottomTabNavigator',
      params: {
        screen: 'ProfileNavigator',
        params: {
          screen: targetScreen,
          params: {
            booking_id,
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
   else if (data?.panditji_screen === 'PujaDetailsScreen') {
    // Directly navigate to PujaDetailsScreen and pass booking_id
    setTimeout(() => {
      if (navigationRef.isReady()) {
        navigate('Main', {
          screen: 'AppBottomTabNavigator',
          params: {
            screen: 'HomeNavigator',
            params: {
              screen: 'PujaDetailsScreen',
              params: {
                booking_id: data?.booking_id,
              },
            },
          },
        });
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
 