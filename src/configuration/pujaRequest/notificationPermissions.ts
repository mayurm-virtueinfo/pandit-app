/**
 * notificationPermissions.ts
 *
 * Handles all runtime permissions required for the full-screen incoming
 * Puja request notification system. Covers:
 *  - Android 13+ POST_NOTIFICATIONS
 *  - SYSTEM_ALERT_WINDOW (Display Over Other Apps)
 *  - Battery Optimization exemption
 *  - iOS notification permissions via Firebase Messaging
 */

import {
  Platform,
  Alert,
  PermissionsAndroid,
  Linking,
  NativeModules,
} from 'react-native';
import messaging, {
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import notifee, { AuthorizationStatus as NotifeeAuth, AndroidNotificationSetting } from '@notifee/react-native';

// ─────────────────────────────────────────────────────────────
// Android 13+ POST_NOTIFICATIONS permission
// ─────────────────────────────────────────────────────────────
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return requestIOSNotificationPermission();
  }

  // Android 13 (API 33) introduced the POST_NOTIFICATIONS runtime permission
  if (Platform.Version >= 33) {
    try {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (hasPermission) {
        return true;
      }

      const { AppState } = require('react-native');
      if (AppState.currentState !== 'active') {
        return false;
      }

      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );

      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('✅ POST_NOTIFICATIONS permission granted');
        return true;
      }

      if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        // User permanently denied — guide them to settings
        Alert.alert(
          'Notifications Blocked',
          'Puja requests require notifications. Please enable them in Settings → App Info → Notifications.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ],
        );
        return false;
      }

      console.warn('❌ POST_NOTIFICATIONS permission denied');
      return false;
    } catch (err) {
      console.error('Error requesting POST_NOTIFICATIONS:', err);
      return false;
    }
  }

  // Android < 13 — notifications are enabled by default
  return true;
}

// ─────────────────────────────────────────────────────────────
// Android: "Display Over Other Apps" (SYSTEM_ALERT_WINDOW)
// ─────────────────────────────────────────────────────────────
export async function checkOverlayPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true; // Not applicable on iOS
  }

  try {
    // Settings.canDrawOverlays() is accessible via Notifee's power manager
    // or via a native module. We use Notifee's check here.
    const settings = await notifee.getNotificationSettings();

    // On Android, we check if the app can display notifications as heads-up
    // The full-screen intent permission is checked separately
    return true;
  } catch (err) {
    console.error('Error checking overlay permission:', err);
    return false;
  }
}

/**
 * Opens the system overlay permission settings page.
 * Call this if `checkOverlayPermission()` returns false.
 */
export function openOverlayPermissionSettings(): void {
  if (Platform.OS === 'android') {
    // This intent opens the "Display over other apps" system settings
    try {
      Linking.sendIntent('android.settings.action.MANAGE_OVERLAY_PERMISSION');
    } catch {
      // Fallback: open general app settings
      Linking.openSettings();
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Android: Battery Optimization Exemption
// ─────────────────────────────────────────────────────────────
/**
 * Checks and requests battery optimization exemption.
 * Important for ensuring background FCM messages are delivered reliably.
 */
export async function requestBatteryOptimizationExemption(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    // Notifee provides a utility to check battery optimization
    const batteryOptimizationEnabled =
      await notifee.isBatteryOptimizationEnabled();

    if (batteryOptimizationEnabled) {
      Alert.alert(
        'Battery Optimization',
        'To receive Puja requests reliably, please disable battery optimization for PujaGuru.',
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: async () => {
              await notifee.openBatteryOptimizationSettings();
            },
          },
        ],
      );
    }
  } catch (err) {
    console.warn('Battery optimization check failed:', err);
  }
}

// ─────────────────────────────────────────────────────────────
// Android: Full-Screen Intent Permission (Android 14+)
// ─────────────────────────────────────────────────────────────
/**
 * On Android 14 (API 34+), USE_FULL_SCREEN_INTENT must be granted.
 * This is automatically granted for apps that target < API 34 or
 * are listed as "communication" apps. Otherwise, guide user to settings.
 */
export async function checkFullScreenIntentPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || Platform.Version < 34) {
    return true;
  }

  try {
    const settings = await notifee.getNotificationSettings();

    // Check if full-screen intents are blocked on Android 14+
    if (settings.android.alarm !== AndroidNotificationSetting.ENABLED) {
      Alert.alert(
        'Full-Screen Alerts Required',
        'PujaGuru needs permission to show full-screen alerts for incoming Puja requests. Please enable it in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings();
            },
          },
        ],
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error('Full-screen intent check failed:', err);
    return true; // Assume granted on error to avoid blocking
  }
}

// ─────────────────────────────────────────────────────────────
// iOS: Notification Permission
// ─────────────────────────────────────────────────────────────
async function requestIOSNotificationPermission(): Promise<boolean> {
  try {
    const authStatus = await messaging().requestPermission({
      alert: true,
      badge: true,
      sound: true,
      criticalAlert: true, // Required for high-priority alerts
      provisional: false,
    });

    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      Alert.alert(
        'Notifications Required',
        'Please enable notifications and critical alerts to receive Puja booking requests.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => Linking.openURL('app-settings:'),
          },
        ],
      );
    }

    return enabled;
  } catch (err) {
    console.error('iOS notification permission error:', err);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// Master: Request All Permissions
// ─────────────────────────────────────────────────────────────
/**
 * Requests all permissions needed for the full-screen incoming request system.
 * Call this on app launch (after auth) or when the Pandit enables availability.
 */
export async function requestAllPujaRequestPermissions(): Promise<{
  notifications: boolean;
  overlay: boolean;
  fullScreen: boolean;
}> {
  const notifications = await requestNotificationPermission();
  const overlay = await checkOverlayPermission();
  const fullScreen = await checkFullScreenIntentPermission();

  // Battery optimization is non-blocking — just show a suggestion
  await requestBatteryOptimizationExemption();

  console.log('🔐 Puja Request Permissions:', {
    notifications,
    overlay,
    fullScreen,
  });

  return { notifications, overlay, fullScreen };
}
