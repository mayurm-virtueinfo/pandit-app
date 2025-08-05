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
import messaging from '@react-native-firebase/messaging';

export interface Message {
  id: string;
  text: string;
  time: string;
  isOwn: boolean;
}

const ChatScreen: React.FC = () => {
  const route = useRoute() as any;
  const {uuid, other_user_name, other_user_image, other_user_phone} =
    route.params;

  console.log('uuid :: ', uuid);
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [panditID, setPanditID] = useState<string | null>(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const isUserAtBottom = useRef(true);

  // Set up FCM token and onMessage handler
  useEffect(() => {
    let unsubscribeOnMessage: (() => void) | undefined;

    const setupFCM = async () => {
      try {
        // Get FCM token
        const token = await messaging().getToken();
        setFcmToken(token);
        // Optionally, send this token to your backend here
        // await api.post('/save-fcm-token', { token });

        // Listen for foreground messages
        unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
          // Handle the incoming message as needed
          // For example, you could show a local notification or update chat UI
          console.log('📩 FCM Message Received in foreground:', remoteMessage);
        });
      } catch (err) {
        console.error('Error getting FCM token or setting onMessage:', err);
      }
    };

    setupFCM();

    return () => {
      if (unsubscribeOnMessage) {
        unsubscribeOnMessage();
      }
    };
  }, []);

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
      const socketURL = `ws://192.168.1.10:8081/ws/chat/${uuid}/?token=${accessToken}`;
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

  // Send notification only on Android, otherwise skip and log warning
  const sendNotification = async (text: string) => {
    if (Platform.OS !== 'android') {
      console.warn(
        'sendNotification: firebase.messaging().sendMessage() is only supported on Android devices. Skipping notification send.',
      );
      return;
    }
    try {
      // Fetch recipient's FCM token (replace with actual API call)
      const recipientFcmToken =
        'cB_DAvomRvCvLCm2iI4GJL:APA91bH3-MnAjT6ATheRcGMaFlLj_Q6DtxvRTkJ0tw19lxJN_OIUmTf0kFbI4fwMaLebBA0S10SVd-Whq9YtyoD1EAGipjrD6nSGzHZssvAO0qePNqoeMCs';
      if (!recipientFcmToken) {
        console.error('🚫 No FCM token found for recipient');
        return;
      }

      const message = {
        to: recipientFcmToken,
        notification: {
          title: `New Message from ${other_user_name || 'User'}`,
          body: text.length > 50 ? `${text.substring(0, 47)}...` : text,
        },
        data: {
          chatUuid: uuid,
          type: 'chat_message',
        },
      };

      // Use the messaging instance to send the message (Android only)
      // @ts-ignore
      await messaging().sendMessage(message);
      console.log('📩 Chat notification sent successfully');
    } catch (error) {
      if (error instanceof Error) {
        console.error('🚫 Failed to send chat notification:', error.message);
      } else {
        console.error('🚫 Failed to send chat notification:', error);
      }
    }
  };

  // Placeholder function to fetch recipient's FCM token
  const fetchRecipientFcmToken = async (
    phone: string,
  ): Promise<string | null> => {
    // Implement API call to your backend to get the recipient's FCM token
    // Example: const response = await api.get(`/users/phone/${phone}/fcm-token`);
    // return response.data.fcmToken;
    return null; // Replace with actual implementation
  };

  const handleSendMessage = (text: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({message: text}));
      isUserAtBottom.current = true;
      // Send push notification to recipient
      sendNotification(text);
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
            <ChatMessages messages={messages} />
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
});

export default ChatScreen;
