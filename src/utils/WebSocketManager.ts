import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import AppConstant from './AppContent';

type WSState = {
  socket: WebSocket | null;
  manuallyStopped: boolean;
  reconnectTimeout: number;
};

const state: WSState = {
  socket: null,
  manuallyStopped: false,
  reconnectTimeout: 1000,
};

const getSocketURL = (token: string, userId: string) => {
  if (__DEV__) {
    return `wss://dev.puja-guru.com/ws/pandit/requests/${userId}/?token=${token}`;
  }
  return `wss://puja-guru.com/ws/pandit/requests/${userId}/?token=${token}`;
};

const handleMessage = (raw: string) => {
  try {
    const data = JSON.parse(raw);
    console.log('[WebSocketManager] message:', data);

    if (
      data?.type === 'booking_request' &&
      ['created', 'accepted', 'rejected', 'expired'].includes(data?.action)
    ) {
      console.log(
        '[WebSocketManager] 🔔 Booking update received:',
        data.action,
      );
      DeviceEventEmitter.emit('PUJA_DATA_UPDATED', data);
    }
  } catch (err) {
    console.warn('[WebSocketManager] parse error', err);
  }
};

const connect = async () => {
  try {
    const token = await AsyncStorage.getItem(AppConstant.ACCESS_TOKEN);
    const userId = await AsyncStorage.getItem(AppConstant.USER_ID);

    if (!token || !userId) {
      console.log('[WebSocketManager] Missing token/userId.');
      return;
    }

    const wsUrl = getSocketURL(token, userId);

    if (state.socket) {
      try {
        state.socket.close();
      } catch {}
      state.socket = null;
    }

    const socket = new WebSocket(wsUrl);
    state.socket = socket;

    socket.onopen = () => {
      console.log('[WebSocketManager] ✅ connected');
      state.reconnectTimeout = 1000;
    };

    socket.onmessage = event => {
      if (event.data) handleMessage(event.data);
    };

    socket.onerror = error => {
      console.error('[WebSocketManager] ⚠️ error:', error);
    };

    socket.onclose = () => {
      console.log('[WebSocketManager] 🔌 closed');
      state.socket = null;
      if (!state.manuallyStopped) {
        const t = state.reconnectTimeout;
        state.reconnectTimeout = Math.min(t * 2, 30000);
        setTimeout(connect, t);
      }
    };
  } catch (err) {
    console.error('[WebSocketManager] connect failed:', err);
    if (!state.manuallyStopped) {
      const t = state.reconnectTimeout;
      state.reconnectTimeout = Math.min(t * 2, 30000);
      setTimeout(connect, t);
    }
  }
};

const start = () => {
  state.manuallyStopped = false;
  connect();
};

const stop = () => {
  state.manuallyStopped = true;
  state.socket?.close();
  state.socket = null;
};

export default { start, stop };
