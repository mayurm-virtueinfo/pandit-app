import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {Alert, Linking, Platform} from 'react-native';

interface NetworkContextType {
  isConnected: boolean;
}

const NetworkContext = createContext<NetworkContextType>({
  isConnected: true,
});

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({children}) => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [alertShown, setAlertShown] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = !!state.isConnected;
      setIsConnected(connected);

      if (!connected && !alertShown) {
        setAlertShown(true);
        Alert.alert(
          'No Internet Connection',
          'Please turn on your internet to continue using the app.',
          [
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL(
                    'App-Prefs:root=MOBILE_DATA_SETTINGS_ID',
                  ).catch(() => {
                    Linking.openURL('App-Prefs:');
                  });
                } else {
                  Linking.openSettings().catch(() => {
                    Linking.openURL('android.settings.WIRELESS_SETTINGS');
                  });
                }
              },
            },
          ],
          {cancelable: false},
        );
      }

      if (connected) {
        setAlertShown(false);
      }
    });

    return () => unsubscribe();
  }, [alertShown]);

  return (
    <NetworkContext.Provider value={{isConnected}}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => useContext(NetworkContext);
