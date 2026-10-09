/**
 * pujaRequestHandler.ts
 *
 * Central event store + handler for incoming Puja requests.
 * Uses an EventEmitter pattern to bridge background notification events
 * to the foreground React UI (PujaRequestModal).
 *
 * Flow:
 *  1. FCM data message arrives → background handler calls handleIncomingPujaRequest()
 *  2. This module displays the notification AND emits a 'PUJA_REQUEST' event
 *  3. PujaRequestModal (in foreground) subscribes to the event and shows the modal
 *  4. Notification action (ACCEPT/DECLINE) or timer expiry triggers cleanup
 */

import { DeviceEventEmitter } from 'react-native';
import apiDev from '../../api/apiDev';
import { postUpdateStatus } from '../../api/apiService';
import { navigate } from '../../helper/navigationRef';
import {
  PujaRequestData,
  displayPujaRequestNotification,
  cancelPujaRequestNotification,
} from './pujaRequestNotification';

// ─────────────────────────────────────────────────────────────
// Event Names
// ─────────────────────────────────────────────────────────────
export const PUJA_REQUEST_EVENT = 'PUJA_REQUEST_INCOMING';
export const PUJA_REQUEST_DISMISS_EVENT = 'PUJA_REQUEST_DISMISS';

// ─────────────────────────────────────────────────────────────
// State: track current active request
// ─────────────────────────────────────────────────────────────
let activePujaRequest: PujaRequestData | null = null;

export function getActivePujaRequest(): PujaRequestData | null {
  return activePujaRequest;
}

export function clearActivePujaRequest(): void {
  activePujaRequest = null;
}

// ─────────────────────────────────────────────────────────────
// Handle Incoming FCM Data Message
// ─────────────────────────────────────────────────────────────
export async function handleIncomingPujaRequest(
  data: Record<string, string>,
): Promise<void> {
  if (data?.type !== 'PUJA_REQUEST' && data?.screen !== 'WaitingApprovalPujaScreen') {
    return;
  }

  const requestData: PujaRequestData = {
    type: data.type || 'PUJA_REQUEST',
    bookingId: data.bookingId || data.booking_id,
    pujaName: data.pujaName || data.puja_name || 'New Puja Request',
    dakshina: data.dakshina || '...',
    location: data.location || '...',
    pujaTime: data.pujaTime || data.puja_time || '...',
    distance: data.distance || '...',
    expireInSeconds: data.expireInSeconds || '30',
    customerName: data.customerName || data.customer_name || 'Customer',
    pujaDate: data.pujaDate || data.puja_date || '...',
    offerId: data.offerId || data.offer_id,
  };

  console.log('🛕 Incoming Puja Request:', requestData.bookingId);

  // Store as active request
  activePujaRequest = requestData;

  // Display the system notification (works even when app is killed)
  await displayPujaRequestNotification(requestData);

  // Emit event for foreground UI to pick up
  DeviceEventEmitter.emit(PUJA_REQUEST_EVENT, requestData);
}

// ─────────────────────────────────────────────────────────────
// Accept Puja Request
// ─────────────────────────────────────────────────────────────
export async function acceptPujaRequest(bookingId: string, offerId?: string): Promise<boolean> {
  try {
    console.log('✅ Accepting Puja Request:', bookingId);

    // Cancel the notification + stop sound
    await cancelPujaRequestNotification();

    // API call to accept the booking
    const requestData = getActivePujaRequest();
    const finalOfferId = offerId || requestData?.offerId || '0';
    
    const response: any = await postUpdateStatus({
      booking_id: Number(bookingId),
      action: 'accept',
      offer_id: Number(finalOfferId),
    });

    console.log('✅ Puja Request accepted successfully:', response?.data);

    // Clear active request
    clearActivePujaRequest();

    // Dismiss the modal
    DeviceEventEmitter.emit(PUJA_REQUEST_DISMISS_EVENT);

    // Navigate to the active booking screen
    navigate('Main', {
      screen: 'AppBottomTabNavigator',
      params: {
        screen: 'HomeNavigator',
        params: {
          screen: 'PujaDetailsScreen',
          params: {
            booking_id: bookingId,
          },
        },
      },
    });

    return true;
  } catch (error: any) {
    console.error('❌ Failed to accept Puja Request:', error?.message);
    // Even on error, cancel the notification
    await cancelPujaRequestNotification();
    clearActivePujaRequest();
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// Decline Puja Request
// ─────────────────────────────────────────────────────────────
export async function declinePujaRequest(bookingId: string, offerId?: string): Promise<boolean> {
  try {
    console.log('❌ Declining Puja Request:', bookingId);

    // Cancel the notification + stop sound
    await cancelPujaRequestNotification();

    // API call to decline the booking — passes it to the next Pandit
    const requestData = getActivePujaRequest();
    const finalOfferId = offerId || requestData?.offerId || '0';

    const response: any = await postUpdateStatus({
      booking_id: Number(bookingId),
      action: 'reject',
      offer_id: Number(finalOfferId),
    });

    console.log('❌ Puja Request declined, forwarded to next pandit:', response?.data);

    // Clear active request
    clearActivePujaRequest();

    // Dismiss the modal
    DeviceEventEmitter.emit(PUJA_REQUEST_DISMISS_EVENT);

    return true;
  } catch (error: any) {
    console.error('❌ Failed to decline Puja Request:', error?.message);
    await cancelPujaRequestNotification();
    clearActivePujaRequest();
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// Auto-Decline (timer expired)
// ─────────────────────────────────────────────────────────────
export async function autoDeclinePujaRequest(bookingId: string): Promise<void> {
  console.log('⏰ Auto-declining expired Puja Request:', bookingId);
  await declinePujaRequest(bookingId);
}
