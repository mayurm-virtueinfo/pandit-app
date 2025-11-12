import React, { useEffect, useState } from 'react';
import { WebSocketProvider } from '../context/WebSocketContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppConstant from '../utils/AppContent';

interface WebSocketWrapperProps {
  children: React.ReactNode;
}

const WebSocketWrapper: React.FC<WebSocketWrapperProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(
          AppConstant.ACCESS_TOKEN,
        );
        const storedUserId = await AsyncStorage.getItem(AppConstant.USER_ID);
        if (storedToken && storedUserId) {
          setToken(storedToken);
          setUserId(storedUserId);
        } else {
          console.log('⚠️ [Pandit WS] Missing token or userId');
        }
      } catch (error) {
        console.error('❌ [Pandit WS] Error loading credentials:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCredentials();
  }, []);

  if (loading) return null;

  if (!token || !userId) {
    return <>{children}</>;
  }

  return (
    <WebSocketProvider token={token} userId={userId}>
      {children}
    </WebSocketProvider>
  );
};

export default WebSocketWrapper;
