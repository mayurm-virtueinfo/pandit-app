import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Alert } from 'react-native';

interface NetworkContextType {
  isConnected: boolean;
}

const NetworkContext = createContext<NetworkContextType>({
  isConnected: true,
});

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [alertShown, setAlertShown] = useState<boolean>(false);

  const handleRetry = () => {
    NetInfo.fetch().then(state => {
      const connected = !!state.isConnected;
      setIsConnected(connected);

      if (!connected) {
        setAlertShown(true);
        showNoInternetAlert();
      } else {
        setAlertShown(false);
      }
    });
  };

  const showNoInternetAlert = () => {
    Alert.alert(
      'No Internet Connection',
      'Please turn on your internet to continue using the app.',
      [
        {
          text: 'Retry',
          onPress: handleRetry,
        },
      ],
      { cancelable: false },
    );
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = !!state.isConnected;
      setIsConnected(connected);

      if (!connected && !alertShown) {
        setAlertShown(true);
        showNoInternetAlert();
      }

      if (connected) {
        setAlertShown(false);
      }
    });

    return () => unsubscribe();
  }, [alertShown]);

  return (
    <NetworkContext.Provider value={{ isConnected }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => useContext(NetworkContext);
