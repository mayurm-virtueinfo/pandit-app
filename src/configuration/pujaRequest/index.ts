/**
 * pujaRequest/index.ts
 *
 * Barrel export for the Puja Request notification system.
 */

// Notification engine
export {
  createPujaRequestChannel,
  displayPujaRequestNotification,
  cancelPujaRequestNotification,
  isPujaRequestAction,
  getPujaRequestActionType,
  PUJA_REQUEST_CHANNEL_ID,
  PUJA_REQUEST_NOTIFICATION_ID,
} from './pujaRequestNotification';
export type { PujaRequestData } from './pujaRequestNotification';

// Event handler
export {
  handleIncomingPujaRequest,
  acceptPujaRequest,
  declinePujaRequest,
  autoDeclinePujaRequest,
  getActivePujaRequest,
  clearActivePujaRequest,
  PUJA_REQUEST_EVENT,
  PUJA_REQUEST_DISMISS_EVENT,
} from './pujaRequestHandler';

// Permissions
export {
  requestNotificationPermission,
  checkOverlayPermission,
  openOverlayPermissionSettings,
  requestBatteryOptimizationExemption,
  checkFullScreenIntentPermission,
  requestAllPujaRequestPermissions,
} from './notificationPermissions';
