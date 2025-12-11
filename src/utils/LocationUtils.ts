import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import Geolocation, {
  GeoPosition,
  GeoError,
} from 'react-native-geolocation-service';

/**
 * Configuration options for location requests
 */
interface LocationConfig {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  showLocationDialog?: boolean; // Android only: Whether to show the location settings dialog
  forceRequestLocation?: boolean; // Force request location even if permission checks pass (useful for logic flows)
  suppressPermissionAlert?: boolean; // If true, do not show the default Alert on permission denial (let caller handle it)
}

/**
 * Default configuration for location requests
 */
const DEFAULT_LOCATION_CONFIG: LocationConfig = {
  enableHighAccuracy: true, // Prefer high accuracy for better results
  timeout: 15000, // 15 seconds timeout
  maximumAge: 10000, // Accept cached location up to 10 seconds old
  showLocationDialog: true,
  forceRequestLocation: true,
  suppressPermissionAlert: false,
};

/**
 * Custom Error class for Location related errors to handle them gracefully app-wide
 */
export class LocationError extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);
    this.name = 'LocationError';
    this.code = code;
  }
}

/**
 * Request location permission based on the platform.
 * Returns true if permission is granted, false otherwise.
 * Handles different permission levels and rationality.
 */
export type LocationPermissionStatus =
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable';

/**
 * Request location permission based on the platform.
 * Returns the specific status of the permission.
 */
export const requestLocationPermission =
  async (): Promise<LocationPermissionStatus> => {
    if (Platform.OS === 'ios') {
      try {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        if (auth === 'granted') return 'granted';
        // On iOS, if permission is denied, it cannot be requested again programmatically.
        // It is effectively "blocked" (requires Settings).
        if (auth === 'denied') return 'blocked';
        if (auth === 'disabled') return 'blocked'; // Or restricted
        if (auth === 'restricted') return 'blocked';
        return 'blocked'; // Default to blocked for safety on iOS deny cases
      } catch (error) {
        console.error('Location permission error (iOS):', error);
        return 'unavailable';
      }
    }

    if (Platform.OS === 'android') {
      try {
        const status = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (status === PermissionsAndroid.RESULTS.GRANTED) return 'granted';
        if (status === PermissionsAndroid.RESULTS.DENIED) return 'denied';
        if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)
          return 'blocked';
        return 'denied';
      } catch (err) {
        console.error('Location permission error (Android):', err);
        return 'unavailable';
      }
    }

    return 'unavailable';
  };

/**
 * Get the current device location.
 * Prompts for permission if not already granted.
 * Includes error handling for timeouts, disabled services, and permission denials.
 *
 * @param config Optional configuration object to override defaults
 */
export const getCurrentLocation = (
  config: LocationConfig = {},
): Promise<GeoPosition> => {
  const finalConfig = { ...DEFAULT_LOCATION_CONFIG, ...config };

  return new Promise(async (resolve, reject) => {
    try {
      const status = await requestLocationPermission();

      if (status !== 'granted') {
        // If suppressed, just reject immediately without alert
        if (finalConfig.suppressPermissionAlert) {
          // Pass the specific status code in the error for the caller to handle
          const errorCode = status === 'blocked' ? 2 : 1; // 2 for blocked/permanent
          reject(
            new LocationError(`Location permission ${status}.`, errorCode),
          );
          return;
        }

        // Prompt user to open settings if permission is strictly required and denied.
        Alert.alert(
          'Location Permission Denied',
          'Location access is denied. Please enable it in your device settings to use this feature.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () =>
                reject(new LocationError('Permission denied by user', 1)),
            },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          resolve(position);
        },
        (error: GeoError) => {
          // Map library errors to our custom/application error structure if needed
          // Error codes: 1: PERMISSION_DENIED, 2: POSITION_UNAVAILABLE, 3: TIMEOUT
          let errorMessage = 'Failed to fetch location.';

          switch (error.code) {
            case 1:
              errorMessage = 'Location permission denied.';
              break;
            case 2:
              errorMessage =
                'Location provider unavailable. Please checks your GPS settings.';
              break;
            case 3:
              errorMessage =
                'Location request timed out. Please check your signal.';
              break;
            default:
              errorMessage = error.message;
          }

          reject(new LocationError(errorMessage, error.code));
        },
        {
          enableHighAccuracy: finalConfig.enableHighAccuracy,
          timeout: finalConfig.timeout,
          maximumAge: finalConfig.maximumAge,
          showLocationDialog: finalConfig.showLocationDialog,
          forceRequestLocation: finalConfig.forceRequestLocation,
        },
      );
    } catch (unexpectedError) {
      reject(
        new LocationError(
          'An unexpected error occurred while fetching location.',
          -1,
        ),
      );
    }
  });
};

/**
 * Get city name from coordinates using OpenStreetMap (Nominatim).
 * @param lat Latitude
 * @param lon Longitude
 */
export const getCityName = async (
  lat: number,
  lon: number,
): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'PanditApp/1.0', // Required by Nominatim
        },
      },
    );
    const data = await response.json();

    if (data && data.address) {
      const addr = data.address;
      // Prioritize city-level names.
      let city =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.municipality ||
        addr.suburb;

      // If strict city fail, try broader regions but clean them
      if (!city) {
        // Prioritize county (often Taluka/Tehsil) over state_district
        // for better local recognition if explicit city field is missing.
        const broader = addr.county || addr.state_district;
        if (broader) {
          city = broader.replace(/\s(District|Region|Taluka|Mandal)$/i, '');
        }
      }

      return city || null;
    }
    return null;
  } catch (error) {
    console.warn('Error fetching city name:', error);
    return null;
  }
};
