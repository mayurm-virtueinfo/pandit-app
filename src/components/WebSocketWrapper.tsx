import React, { useEffect, useState, useRef } from 'react';
import { WebSocketProvider } from '../context/WebSocketContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppConstant from '../utils/AppContent';
import CustomeLoader from './CustomLoader';
import { ActivityIndicator, View } from 'react-native';

interface WebSocketWrapperProps {
  children: React.ReactNode;
}

const WebSocketWrapper: React.FC<WebSocketWrapperProps> = ({ children }) => {
  const [token, setToken] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [credentialsLoaded, setCredentialsLoaded] = useState(false);
  const prevTokenRef = useRef<string>('');
  const prevUserIdRef = useRef<string>('');

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        console.log('🔄 [Pandit WS] Loading credentials from storage...');
        const storedToken = await AsyncStorage.getItem(
          AppConstant.ACCESS_TOKEN,
        );
        const storedUserId = await AsyncStorage.getItem(AppConstant.USER_ID);

        console.log('📦 [Pandit WS] Retrieved credentials:', {
          token: storedToken ? 'exists' : 'missing',
          userId: storedUserId ? 'exists' : 'missing',
        });

        if (storedToken && storedUserId) {
          console.log('✅ [Pandit WS] Credentials found, setting state...');
          setToken(storedToken);
          setUserId(storedUserId);
          prevTokenRef.current = storedToken;
          prevUserIdRef.current = storedUserId;
        } else {
          console.warn('⚠️ [Pandit WS] Credentials missing in storage');
        }
      } catch (error) {
        console.error('❌ [Pandit WS] Error loading credentials:', error);
      } finally {
        setCredentialsLoaded(true);
      }
    };

    loadCredentials();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const storedToken = await AsyncStorage.getItem(
          AppConstant.ACCESS_TOKEN,
        );
        const storedUserId = await AsyncStorage.getItem(AppConstant.USER_ID);

        // If credentials changed, update state
        if (
          storedToken !== prevTokenRef.current ||
          storedUserId !== prevUserIdRef.current
        ) {
          if (storedToken && storedUserId) {
            console.log(
              '🔄 [Pandit WS] Credentials updated after login, reconnecting...',
            );
            setToken(storedToken);
            setUserId(storedUserId);
            prevTokenRef.current = storedToken;
            prevUserIdRef.current = storedUserId;
          }
        }
      } catch (error) {
        console.error('❌ [Pandit WS] Error polling credentials:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!credentialsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
      // <CustomeLoader loading={!credentialsLoaded} />
    );
  }

  return (
    <WebSocketProvider token={token} userId={userId}>
      {children}
    </WebSocketProvider>
  );
};

export default WebSocketWrapper;
