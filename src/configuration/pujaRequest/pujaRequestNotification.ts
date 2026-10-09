/**
 * pujaRequestNotification.ts
 *
 * Handles displaying the full-screen incoming Puja request notification.
 * Creates a dedicated high-priority channel with custom sound (temple_bell),
 * configures full-screen intent to wake device and show over lock screen,
 * and attaches ACCEPT / DECLINE action buttons to the notification itself.
 */

import notifee, {
  AndroidImportance,
  AndroidVisibility,
  AndroidCategory,
  EventType,
  Event,
} from '@notifee/react-native';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
export const PUJA_REQUEST_CHANNEL_ID = 'puja-request-incoming';
export const PUJA_REQUEST_NOTIFICATION_ID = 'puja-request-active';

export interface PujaRequestData {
  type: string;
  bookingId: string;
  pujaName: string;
  dakshina: string;
  location: string;
  pujaTime: string;
  distance: string;
  expireInSeconds: string;
  customerName?: string;
  pujaDate?: string;
  offerId?: string;
}

// ─────────────────────────────────────────────────────────────
// Create Notification Channel (called once on app init)
// ─────────────────────────────────────────────────────────────
export async function createPujaRequestChannel(): Promise<string> {
  const channelId = await notifee.createChannel({
    id: PUJA_REQUEST_CHANNEL_ID,
    name: 'Incoming Puja Requests',
    description: 'High-priority alerts for new booking requests from customers',
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    sound: 'temple_bell', // Maps to android/app/src/main/res/raw/temple_bell.mp3
    vibration: true,
    vibrationPattern: [300, 500, 200, 500, 200, 500],
    lights: true,
    lightColor: '#FF4500',
    badge: true,
    bypassDnd: true,
  });

  console.log('🔔 Puja Request channel created:', channelId);
  return channelId;
}

// ─────────────────────────────────────────────────────────────
// Display Full-Screen Puja Request Notification
// ─────────────────────────────────────────────────────────────
export async function displayPujaRequestNotification(
  data: PujaRequestData,
): Promise<void> {
  // Cancel any existing puja request notification first
  await cancelPujaRequestNotification();

  const expireSeconds = parseInt(data.expireInSeconds, 10) || 30;
  const formattedDakshina = `₹${parseInt(data.dakshina, 10).toLocaleString('en-IN')}`;

  await notifee.displayNotification({
    id: PUJA_REQUEST_NOTIFICATION_ID,
    title: '🔔 NEW PUJA REQUEST',
    subtitle: `${data.pujaName}`,
    body: `${formattedDakshina} • ${data.location} • ${data.distance} km away\nExpires in ${expireSeconds} seconds`,
    data: { ...data } as any,
    android: {
      channelId: PUJA_REQUEST_CHANNEL_ID,
      smallIcon: 'ic_notification', // Must exist in res/drawable
      color: '#F21825',
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      category: AndroidCategory.CALL, // Treat as incoming call for priority
      sound: 'temple_bell',
      vibrationPattern: [300, 500, 200, 500, 200, 500],
      loopSound: true, // Continuous ringing until action taken
      autoCancel: false, // Don't dismiss on tap — force ACCEPT or DECLINE
      ongoing: true, // Can't swipe away
      showTimestamp: true,

      // Full-screen intent: wakes device and shows over lock screen
      fullScreenAction: {
        id: 'puja-request-fullscreen',
        launchActivity: 'default',
      },

      // Default press action (tapping the notification body)
      pressAction: {
        id: 'puja-request-open',
        launchActivity: 'default',
      },

      // Quick action buttons on the notification
      actions: [
        {
          title: '❌ DECLINE',
          pressAction: {
            id: 'puja-request-decline',
          },
        },
        {
          title: '✅ ACCEPT PUJA',
          pressAction: {
            id: 'puja-request-accept',
          },
        },
      ],

      // Show chronometer counting down
      chronometerDirection: 'down',
      showChronometer: true,
      timestamp: Date.now() + expireSeconds * 1000,
    },
    ios: {
      categoryId: 'puja-request',
      sound: 'temple_bell.caf',
      critical: true,
      criticalVolume: 1.0,
      interruptionLevel: 'timeSensitive',
      foregroundPresentationOptions: {
        badge: true,
        sound: true,
        banner: true,
        list: true,
      },
    },
  });

  console.log('📳 Puja Request notification displayed for:', data.bookingId);
}

// ─────────────────────────────────────────────────────────────
// Cancel / Dismiss Puja Request Notification
// ─────────────────────────────────────────────────────────────
export async function cancelPujaRequestNotification(): Promise<void> {
  try {
    await notifee.cancelNotification(PUJA_REQUEST_NOTIFICATION_ID);
    console.log('🔕 Puja Request notification cancelled');
  } catch (err) {
    console.warn('Failed to cancel puja request notification:', err);
  }
}

// ─────────────────────────────────────────────────────────────
// Handle Notification Actions (Background & Foreground)
// ─────────────────────────────────────────────────────────────
export function isPujaRequestAction(event: Event): boolean {
  const actionId = event.detail?.pressAction?.id;
  return (
    actionId === 'puja-request-accept' ||
    actionId === 'puja-request-decline' ||
    actionId === 'puja-request-open' ||
    actionId === 'puja-request-fullscreen'
  );
}

export function getPujaRequestActionType(
  event: Event,
): 'accept' | 'decline' | 'open' | null {
  const actionId = event.detail?.pressAction?.id;
  switch (actionId) {
    case 'puja-request-accept':
      return 'accept';
    case 'puja-request-decline':
      return 'decline';
    case 'puja-request-open':
    case 'puja-request-fullscreen':
      return 'open';
    default:
      return null;
  }
}
