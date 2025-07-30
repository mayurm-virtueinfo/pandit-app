import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
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
  const scrollViewRef = useRef<ScrollView | null>(null);
  const isUserAtBottom = useRef(true); // Track if user is at the bottom

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
      console.log('ws.current', JSON.stringify(ws.current));
      ws.current.onopen = () => {
        console.log('✅ Connected to WebSocket');
      };

      ws.current.onmessage = e => {
        const data = JSON.parse(e.data);
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
  }, [accessToken, panditID]);

  useFocusEffect(
    useCallback(() => {
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
        isUserAtBottom.current = true; // Ensure scrolling to bottom after load
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = useCallback((animated = true) => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({animated});
      }, 100); // Slight delay to ensure content is rendered
    }
  }, []);

  const handleSendMessage = (text: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({message: text}));
      isUserAtBottom.current = true; // Scroll to bottom after sending
    } else {
      console.warn('WebSocket not connected');
    }
  };

  const handleScroll = (event: any) => {
    const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
    const isAtBottom =
      contentOffset.y >= contentSize.height - layoutMeasurement.height - 10; // 10px threshold
    isUserAtBottom.current = isAtBottom;
  };

  useEffect(() => {
    if (isUserAtBottom.current) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

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
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={
            Platform.OS === 'ios' ? moderateScale(90) : 0
          }>
          <ScrollView
            style={styles.messagesContainer}
            contentContainerStyle={{flexGrow: 1, justifyContent: 'flex-end'}}
            ref={scrollViewRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onContentSizeChange={() => {
              if (isUserAtBottom.current) {
                scrollToBottom();
              }
            }}
            keyboardShouldPersistTaps="handled">
            <ChatMessages messages={messages} />
          </ScrollView>
          <ChatInput onSendMessage={handleSendMessage} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    paddingTop: moderateScale(24),
  },
  messagesContainer: {
    flex: 1,
  },
});

export default ChatScreen;
