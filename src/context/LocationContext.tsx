import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  ReactNode,
} from 'react';
import { AppState, AppStateStatus, Linking, Platform } from 'react-native';
import { getCurrentLocation, LocationError } from '../utils/LocationUtils';

// Define the shape of the Location Data
export interface LocationData {
  lat: number;
  lon: number;
}

// Define the shape of the Context
export interface LocationContextType {
  location: LocationData | null;
  isLoading: boolean;
  permissionStatus: 'undetermined' | 'granted' | 'denied' | 'permanent_denial';
  requestLocation: () => Promise<void>;
  openSettings: () => Promise<void>;
}

// Create the Context with default values
const LocationContext = createContext<LocationContextType | undefined>(
  undefined,
);

// Provider Component
export const LocationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [permissionStatus, setPermissionStatus] = useState<
    'undetermined' | 'granted' | 'denied' | 'permanent_denial'
  >('undetermined');

  // Function to fetch location
  const fetchLocation = useCallback(async (retry = false) => {
    setIsLoading(true);
    try {
      // Create a timeout promise to prevent infinite loading
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Location request timed out')), 5000),
      );

      // Suppress alert so we can control the UI via permissionStatus
      const locationPromise = getCurrentLocation({
        suppressPermissionAlert: true,
      });

      // Race between location fetch and timeout
      const loc = (await Promise.race([
        locationPromise,
        timeoutPromise,
      ])) as any;

      if (loc) {
        setLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });
        setPermissionStatus('granted');
      }
    } catch (error: any) {
      console.warn('LocationContext: Location access failed', error);

      // Check for specific error code 2 from LocationUtils which means "blocked" or "never_ask_again"
      if (error.code === 2) {
        setPermissionStatus('permanent_denial');
      } else if (retry) {
        // If it was a retry and still failed (and wasn't caught as blocked),
        // it is likely permanently denied or user keeps saying no
        setPermissionStatus('permanent_denial');
      } else {
        setPermissionStatus('denied');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  // AppState listener to auto-refresh on resume
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (
          nextAppState === 'active' &&
          (permissionStatus === 'denied' ||
            permissionStatus === 'permanent_denial')
        ) {
          console.log(
            'LocationContext: App resumed, retrying location check...',
          );
          fetchLocation();
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [permissionStatus, fetchLocation]);

  // Public API: Request Location (Retry)
  const requestLocation = async () => {
    await fetchLocation(true);
  };

  // Public API: Open Settings
  const openSettings = async () => {
    if (Platform.OS === 'android') {
      try {
        await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
        return;
      } catch (e) {
        console.warn(
          'LocationContext: Failed to open specific location settings',
          e,
        );
        // Fallback to app settings
      }
    }
    await Linking.openSettings();
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        isLoading,
        permissionStatus,
        requestLocation,
        openSettings,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

// Custom Hook
export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
