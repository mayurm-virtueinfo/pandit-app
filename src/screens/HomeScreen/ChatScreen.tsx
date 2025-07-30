import React, {useState, useEffect} from 'react';
import {View, StyleSheet, StatusBar, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {moderateScale} from 'react-native-size-matters';
import {COLORS} from '../../theme/theme';
import UserCustomHeader from '../../components/CustomHeader';
import ChatMessages from '../../components/ChatMessages';
import ChatInput from '../../components/ChatInput';
import io from 'socket.io-client';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import {getMessageHistory} from '../../api/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your server's IP address or domain

export interface Message {
  id: string;
  text: string;
  time: string;
  isOwn: boolean;
}

const ChatScreen: React.FC = () => {
  const route = useRoute() as any;
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<any>(null);

  const {uuid, other_user_name, other_user_image} = route.params;

  // Get access token from AsyncStorage (or your auth provider)
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      setAccessToken(token);
    };
    fetchToken();
  }, []);

  const SOCKET_URL = accessToken
    ? `ws://127.0.0.1:8001/ws/chat/${uuid}/?token=${accessToken}`
    : null;

  // Fetch message history on mount
  useFocusEffect(() => {
    let isMounted = true;
    if (uuid) {
      getMessageHistory(uuid)
        .then((response: any) => {
          // Assuming response.data is an array of messages
          // You may need to adjust this mapping based on your API response
          const history = (response?.data || response)?.map((msg: any) => ({
            id: msg.id?.toString() || Date.now().toString() + Math.random(),
            text: msg.text || msg.message || '',
            time: msg.time
              ? msg.time
              : new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
            isOwn: msg.is_own ?? msg.isOwn ?? false,
          }));
          if (isMounted && Array.isArray(history)) {
            setMessages(history);
          }
        })
        .catch(error => {
          console.error('Failed to fetch message history:', error);
        });
    }
    return () => {
      isMounted = false;
    };
  });

  // Initialize Socket.IO connection
  useFocusEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket'], // Force WebSocket transport
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(socketInstance);

    // Handle connection
    socketInstance.on('connect', () => {
      console.log('Connected to server:', socketInstance.id);
    });

    // Listen for incoming messages
    socketInstance.on('message', (data: any) => {
      // If data is a string, treat as text; if object, extract fields
      let text = '';
      let id = Date.now().toString();
      let time = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      if (typeof data === 'string') {
        text = data;
      } else if (typeof data === 'object' && data !== null) {
        text = data.text || data.message || '';
        id = data.id?.toString() || id;
        time = data.time ? data.time : time;
      }
      const newMessage: Message = {
        id,
        text,
        time,
        isOwn: false, // Assume messages from server are not from the user
      };
      setMessages(prev => [...prev, newMessage]);
    });

    // Handle connection errors
    socketInstance.on('connect_error', (error: Error) => {
      console.error('Connection error:', error);
    });

    // Cleanup on component unmount
    return () => {
      socketInstance.disconnect();
    };
  });

  // Send message to server
  const handleSendMessage = (text: string) => {
    if (socket && text.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isOwn: true,
      };
      socket.emit('message', text); // Send message to server
      setMessages(prev => [...prev, newMessage]); // Add to local messages
    }
  };

  return (
    <View style={{flex: 1}}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primaryBackground}
        translucent
      />
      <SafeAreaView style={styles.safeArea}>
        <UserCustomHeader
          title={other_user_name || 'Chat'}
          showBackButton={true}
          showCallButton={true}
        />
        <View style={styles.chatContainer}>
          <View style={styles.messagesContainer}>
            <ChatMessages messages={messages} />
          </View>
          <ChatInput onSendMessage={handleSendMessage} />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.primaryBackground,
  },
  flex1: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    paddingTop: moderateScale(24),
    minHeight: '100%',
    paddingBottom: Platform.OS === 'ios' ? 90 : 100,
  },
  messagesContainer: {
    flex: 1,
  },
});

export default ChatScreen;
