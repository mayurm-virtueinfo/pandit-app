import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Linking,
  Alert,
  Text,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
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
import {request, PERMISSIONS} from 'react-native-permissions';

export interface Message {
  id: string;
  text: string;
  time: string;
  isOwn: boolean;
}

const ChatScreen: React.FC = () => {
  const route = useRoute() as any;
  const {
    booking_id,
    other_user_name,
    other_user_image,
    other_user_phone,
    user_id,
  } = route.params;

  console.log('booking_id :: ', booking_id);
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [panditID, setPanditID] = useState<string | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const isUserAtBottom = useRef(true);

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
    if (accessToken && booking_id) {
      const socketURL = `ws://puja-guru.com:9000/ws/chat/by-booking/${booking_id}/?token=${accessToken}`;
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
      const response: any = await getMessageHistory(booking_id);
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
        isUserAtBottom.current = true;
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
      }, 100);
    }
  }, []);

  const handleSendMessage = (text: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const messageData = {
        message: text,
        sender_id: panditID,
        receiver_id: user_id,
      };
      ws.current.send(JSON.stringify(messageData));
      isUserAtBottom.current = true;
    } else {
      console.warn('WebSocket not connected');
    }
  };

  const handleScroll = (event: any) => {
    const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
    const isAtBottom =
      contentOffset.y >= contentSize.height - layoutMeasurement.height - 10;
    isUserAtBottom.current = isAtBottom;
  };

  useEffect(() => {
    if (isUserAtBottom.current) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const requestCallPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const result = await request(PERMISSIONS.ANDROID.CALL_PHONE);
        return result === 'granted';
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    }
    return true; // iOS doesn't require explicit permission for tel:
  };

  const handleOnCallPress = async () => {
    if (
      !other_user_phone ||
      typeof other_user_phone !== 'string' ||
      other_user_phone.trim() === ''
    ) {
      Alert.alert(
        'No Phone Number',
        'No valid phone number available for this user.',
      );
      return;
    }

    let sanitizedPhoneNumber = other_user_phone.replace(/[^0-9+]/g, '');
    if (
      !sanitizedPhoneNumber.startsWith('+91') &&
      sanitizedPhoneNumber.length === 10
    ) {
      sanitizedPhoneNumber = `+91${sanitizedPhoneNumber}`;
    }

    if (!/^\+91[6-9][0-9]{9}$/.test(sanitizedPhoneNumber)) {
      Alert.alert(
        'Invalid Phone Number',
        'Please provide a valid 10-digit Indian mobile number.',
      );
      return;
    }

    const phoneUrl = `tel:${sanitizedPhoneNumber}`;
    console.log('phoneUrl:', phoneUrl);

    const hasPermission = await requestCallPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Cannot make a call without permission.',
      );
      return;
    }

    Linking.openURL(phoneUrl).catch(err => {
      console.error('Error opening dialer:', err);
      Alert.alert(
        'Error',
        'Unable to open the dialer. Please check the phone number or try again.',
      );
    });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.primaryBackground,
        paddingTop: insets.top,
      }}>
      <CustomeLoader loading={loading} />
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primaryBackground}
        translucent
      />
      <View style={styles.safeArea}>
        <UserCustomHeader
          title={other_user_name || 'Chat'}
          showBackButton={true}
          showCallButton={true}
          onCallPress={handleOnCallPress}
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
            {messages.length === 0 ? (
              <View style={styles.noChatContainer}>
                <Text style={styles.noChatText}>
                  No chat messages yet. Start the conversation!
                </Text>
              </View>
            ) : (
              <ChatMessages messages={messages} />
            )}
          </ScrollView>
          <ChatInput onSendMessage={handleSendMessage} />
        </KeyboardAvoidingView>
      </View>
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
  noChatContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(24),
  },
  noChatText: {
    color: COLORS.textGray || '#888',
    fontSize: moderateScale(16),
    textAlign: 'center',
    marginTop: moderateScale(20),
  },
});

export default ChatScreen;
