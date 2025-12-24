import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNetwork } from '../provider/NetworkProvider';

interface WebSocketContextType {
  messages: any[];
  connected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  messages: [],
  connected: false,
});

interface WebSocketProviderProps {
  token: string;
  userId: string;
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  token,
  userId,
  children,
}) => {
  const { isConnected } = useNetwork();
  const [messages, setMessages] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manuallyClosed = useRef(false);

  /** ✅ Build WebSocket URL */
  const getSocketURL = () =>
    __DEV__
      ? `wss://dev.puja-guru.com/ws/pandit/requests/${userId}/?token=${token}`
      : `wss://puja-guru.com/ws/pandit/requests/${userId}/?token=${token}`;

  /** ✅ Connect WebSocket */
  const connect = () => {
    if (!isConnected || !token || !userId) return;

    // Prevent multiple active sockets
    if (wsRef.current) {
      console.log(
        '⚠️ [Pandit booking status webSocket] Already connected, skipping...',
      );
      return;
    }

    manuallyClosed.current = false;
    const ws = new WebSocket(getSocketURL());
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('🔗 [Pandit booking status webSocket] Connected');
      setConnected(true);
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        console.log('📩 [Pandit booking status webSocket] message :: ', data);
        setMessages(prev => [...prev, data]);
      } catch (err) {
        console.warn('⚠️ [Pandit booking status webSocket] parse error', err);
      }
    };

    ws.onerror = error => {
      console.log('⚠️ [Pandit booking status webSocket] error:', error);
    };

    ws.onclose = e => {
      console.log('🔌 [Pandit booking status webSocket] closed:', e.reason);
      setConnected(false);
      wsRef.current = null;

      // Reconnect if not manually closed
      if (!manuallyClosed.current) {
        reconnectRef.current = setTimeout(() => {
          console.log('♻️ [Pandit booking status webSocket] reconnecting...');
          connect();
        }, 3000);
      }
    };
  };

  /** ✅ Clean Disconnect */
  const disconnect = () => {
    manuallyClosed.current = true;
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }
    setConnected(false);
  };

  /** ✅ Manage connection based on internet & token */
  useEffect(() => {
    console.log('🔍 [Pandit booking status webSocket] useEffect triggered:', {
      isConnected,
      hasToken: !!token,
      hasUserId: !!userId,
    });

    if (isConnected && token && userId) {
      console.log(
        '✅ [Pandit booking status webSocket] All conditions met, attempting to connect...',
      );
      connect();
    } else {
      console.log('⏸️ [Pandit booking status webSocket] Skipping connection:', {
        reason: !isConnected
          ? 'network disconnected'
          : !token
          ? 'no token'
          : !userId
          ? 'no userId'
          : 'unknown',
      });
      disconnect();
    }

    return () => disconnect();
  }, [isConnected, token, userId]);

  return (
    <WebSocketContext.Provider value={{ messages, connected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used inside a WebSocketProvider');
  }
  return context;
};
