/**
 * @format
 *
 * Root entry point for PanditApp.
 * Registers background handlers for FCM + Notifee at the top level
 * so they fire even when the app is fully killed/terminated.
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// ─────────────────────────────────────────────────────────────
// Background FCM Message Handler (runs when app is killed/bg)
// ─────────────────────────────────────────────────────────────
import { getMessaging } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import notifee, { EventType, AndroidImportance } from '@notifee/react-native';
import {
  createPujaRequestChannel,
  handleIncomingPujaRequest,
  cancelPujaRequestNotification,
  isPujaRequestAction,
  getPujaRequestActionType,
  acceptPujaRequest,
  declinePujaRequest,
} from './src/configuration/pujaRequest';

const messaging = getMessaging(getApp());

/**
 * FCM Background/Terminated Message Handler.
 *
 * This fires for DATA-ONLY messages when the app is in the background
 * or has been killed. We check for PUJA_REQUEST type and display
 * a full-screen notification via Notifee.
 */
messaging.setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('📨 [BG] FCM message received:', JSON.stringify(remoteMessage));

  const data = remoteMessage.data;

  if (data?.type === 'PUJA_REQUEST' || data?.screen === 'WaitingApprovalPujaScreen') {
    // Workaround: Attempt to cancel the auto-generated FCM notification
    // before showing our full-screen custom notification.
    if (remoteMessage.notification) {
      try {
        if (remoteMessage.messageId) {
          await notifee.cancelNotification(remoteMessage.messageId);
        }
        const displayed = await notifee.getDisplayedNotifications();
        for (const n of displayed) {
          if (
            n.notification.title === remoteMessage.notification.title ||
            n.notification.body === remoteMessage.notification.body
          ) {
            await notifee.cancelNotification(n.id);
          }
        }
      } catch (e) {
        console.log('Error canceling auto-generated FCM notification', e);
      }
    }

    // Ensure the high-priority channel exists
    await createPujaRequestChannel();

    // Display the full-screen notification with sound + vibration
    await handleIncomingPujaRequest(data);
  }
});

/**
 * Notifee Background Event Handler.
 *
 * Handles notification action button presses (ACCEPT / DECLINE)
 * when the app is in the background or terminated state.
 */
notifee.onBackgroundEvent(async (event) => {
  const { type, detail } = event;

  console.log('🔔 [BG] Notifee event:', type, detail?.pressAction?.id);

  if (type === EventType.ACTION_PRESS && isPujaRequestAction(event)) {
    const actionType = getPujaRequestActionType(event);
    const notificationData = detail.notification?.data || {};
    const bookingId = notificationData.bookingId || notificationData.booking_id;
    const offerId = notificationData.offerId || notificationData.offer_id;

    if (!bookingId) {
      console.warn('No bookingId in notification data');
      return;
    }

    switch (actionType) {
      case 'accept':
        await acceptPujaRequest(bookingId, offerId);
        break;
      case 'decline':
        await declinePujaRequest(bookingId, offerId);
        break;
      case 'open':
        // App will open and PujaRequestModal will handle via event emitter
        break;
    }
  }

  // Handle notification dismissal
  if (type === EventType.DISMISSED) {
    const notifData = detail.notification?.data || {};
    if (notifData.type === 'PUJA_REQUEST' || notifData.screen === 'WaitingApprovalPujaScreen') {
      // Treat dismissal as decline
      const bookingId = notifData.bookingId || notifData.booking_id;
      const offerId = notifData.offerId || notifData.offer_id;
      if (bookingId) {
        await declinePujaRequest(bookingId, offerId);
      }
    }
  }
});

// ─────────────────────────────────────────────────────────────
// Register the App Component
// ─────────────────────────────────────────────────────────────
AppRegistry.registerComponent(appName, () => App);
