import notifee, { EventType, AndroidImportance } from '@notifee/react-native';
import { getMessaging } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { COLORS } from '../theme/theme';
import { navigate, navigationRef } from '../helper/navigationRef';
import { displayIncomingCall, endIncomingCall } from './callValidation';

const messaging = getMessaging(getApp());

// Lightweight UUID v4 generator (RFC4122) without extra deps
function uuidv4(): string {
  const bytes = new Uint8Array(16);
  (global as any).crypto?.getRandomValues?.(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  const b = Array.from(bytes, toHex);
  return `${b[0]}${b[1]}${b[2]}${b[3]}-${b[4]}${b[5]}-${b[6]}${b[7]}-${b[8]}${b[9]}-${b[10]}${b[11]}${b[12]}${b[13]}${b[14]}${b[15]}`;
}

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

    if (remoteMessage.data?.type === 'video_call_invite') {
      const callUUID = uuidv4();
      displayIncomingCall({
        callUUID,
        handle: remoteMessage.data.callerId ?? 'PujaGuru',
        localizedCallerName: remoteMessage.data.callerName ?? 'Incoming call',
        hasVideo: true,
        payload: remoteMessage.data,
      });
      return;
    }

    if (remoteMessage.data?.type === 'end_call') {
      const callUUID = remoteMessage.data.callUUID;
      if (callUUID) {
        endIncomingCall(callUUID);
      }
      return;
    }

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
    console.log('📨 Background FCM message:', JSON.stringify(remoteMessage));
    if (remoteMessage.data?.type === 'video_call_invite') {
      console.log('Processing video_call_invite in background');
      const callUUID = uuidv4();
      console.log('Generated callUUID:', callUUID);
      try {
        await displayIncomingCall({
          callUUID,
          handle: remoteMessage.data.callerId ?? 'PujaGuru',
          localizedCallerName: remoteMessage.data.callerName ?? 'Incoming call',
          hasVideo: true,
          payload: remoteMessage.data,
        });
        console.log('displayIncomingCall called successfully');
      } catch (error) {
        console.error('Error in displayIncomingCall:', error);
      }
      return;
    }
    if (remoteMessage.data?.type === 'end_call') {
      const callUUID = remoteMessage.data.callUUID;
      if (callUUID) {
        console.log('Ending call with callUUID:', callUUID);
        endIncomingCall(callUUID);
      }
      return;
    }
    console.log('Non-video call message received:', remoteMessage.data?.type);
  });
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
  }
}

export function cleanupNotifications() {
  if (foregroundUnsubscribe) {
    foregroundUnsubscribe();
    foregroundUnsubscribe = null;
  }
  isSetup = false;
}