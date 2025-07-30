import React, {useState, useEffect, useRef} from 'react';
import {View, StyleSheet, StatusBar, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {moderateScale} from 'react-native-size-matters';
import {COLORS} from '../../theme/theme';
import UserCustomHeader from '../../components/CustomHeader';
import ChatMessages from '../../components/ChatMessages';
import ChatInput from '../../components/ChatInput';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import {getMessageHistory} from '../../api/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppConstant from '../../utils/AppContent';
import CustomeLoader from '../../components/CustomLoader';

export interface Message {
  id: string;
  text: string;
  time: string;
  isOwn: boolean;
}

const ChatScreen: React.FC = () => {
  const route = useRoute() as any;
  const {uuid, other_user_name, other_user_image} = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [panditID, setPanditID] = useState<string | null>(null);

  const ws = useRef<WebSocket | null>(null);

  console.log('messages :: ', messages);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      const panditID = await AsyncStorage.getItem(AppConstant.USER_ID);
      setAccessToken(token);
      setPanditID(panditID);
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (accessToken && uuid) {
      const socketURL = `ws://192.168.1.10:8001/ws/chat/${uuid}/?token=${accessToken}`;
      ws.current = new WebSocket(socketURL);

      ws.current.onopen = () => {
        console.log('✅ Connected to WebSocket');
      };

      ws.current.onmessage = e => {
        const data = JSON.parse(e.data);
        console.log('e :: ', JSON.parse(e.data));
        const newMsg: Message = {
          id: data.uuid,
          text: data.message,
          time: new Date(data.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isOwn: data.sender_id == panditID,
        };
        setMessages(prev => [...prev, newMsg]);
      };

      ws.current.onerror = e => {
        console.error('WebSocket error:', e.message);
      };

      ws.current.onclose = e => {
        console.log('WebSocket closed:', e.code, e.reason);
      };

      return () => {
        if (ws.current) {
          ws.current.close();
        }
      };
    }
  }, [accessToken, uuid, panditID]);

  useFocusEffect(
    React.useCallback(() => {
      fetchChatHistory();
    }, [panditID]),
  );

  const fetchChatHistory = async () => {
    setLoading(true);
    try {
      const response: any = await getMessageHistory(uuid);
      if (response) {
        const normalized = response.map((msg: any) => ({
          id: msg.uuid,
          text: msg.content || msg.message,
          time: new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isOwn: msg.sender == panditID,
        }));
        setMessages(normalized);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (text: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({message: text}));
    } else {
      console.warn('WebSocket not connected');
    }
  };

  return (
    <View style={{flex: 1}}>
      <CustomeLoader loading={loading} />
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
