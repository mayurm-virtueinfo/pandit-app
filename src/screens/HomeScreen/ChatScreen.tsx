import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  Text,
  SafeAreaView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {moderateScale} from 'react-native-size-matters';
import {COLORS} from '../../theme/theme';
import UserCustomHeader from '../../components/CustomHeader';
import ChatMessages from '../../components/ChatMessages';
import ChatInput from '../../components/ChatInput';
import {
  useFocusEffect,
  useRoute,
  useNavigation,
  useNavigationState,
} from '@react-navigation/native';
import {createMeeting, getMessageHistory} from '../../api/apiService';
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
  const navigation = useNavigation();
  const {
    booking_id,
    other_user_name,
    other_user_image,
    other_user_phone,
    user_id,
    videocall,
  } = route.params;

  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [panditID, setPanditID] = useState<string | null>(null);
  const [inCall, setInCall] = useState(false);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [meetingToken, setMeetingToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string>(
    'https://meet.puja-guru.com/',
  );

  const ws = useRef<WebSocket | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const isUserAtBottom = useRef(true);
  const jitsiMeeting = useRef<any>(null);

  // Dynamically require JitsiMeeting to avoid import error
  let JitsiMeeting: any = null;
  try {
    // @ts-ignore
    JitsiMeeting = require('@jitsi/react-native-sdk').JitsiMeeting;
  } catch (e) {
    // If not available, JitsiMeeting remains null
    JitsiMeeting = null;
  }

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
      ws.current.onopen = () => console.log('✅ Connected to WebSocket');
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
      ws.current.onerror = e => console.error('WebSocket error:', e.message);
      ws.current.onclose = e =>
        console.log('WebSocket closed:', e.code, e.reason);
      return () => ws.current?.close();
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
      setTimeout(() => scrollViewRef.current?.scrollToEnd({animated}), 100);
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

  // Use room_name and token from API response instead of extracting from URL
  const handleVideoCall = () => {
    if (!booking_id) {
      Alert.alert('Error', 'No booking ID available for video call.');
      return;
    }
    setLoading(true);
    createMeeting(booking_id)
      .then(response => {
        console.log('response:::1', response?.data);
        if (response?.data?.room_name && response?.data?.token) {
          setRoomName(response.data.room_name);
          setMeetingToken(response.data.token);
          setServerUrl(
            response.data.server_url || 'https://meet.puja-guru.com/',
          );
          setInCall(true);
        } else if (response?.data?.meeting_url) {
          // fallback: extract room name from URL if needed
          const meetingUrl = response.data.meeting_url;
          let url = meetingUrl.endsWith('/')
            ? meetingUrl.slice(0, -1)
            : meetingUrl;
          const lastSlashIdx = url.lastIndexOf('/');
          let room =
            lastSlashIdx === -1
              ? 'defaultRoom'
              : url.substring(lastSlashIdx + 1);
          const queryIdx = room.indexOf('?');
          room =
            queryIdx !== -1
              ? room.substring(0, queryIdx)
              : room || 'defaultRoom';
          setRoomName(room);
          setMeetingToken(null);
          setServerUrl('https://meet.puja-guru.com/');
          setInCall(true);
        } else {
          Alert.alert('Error', 'Meeting information not found.');
        }
      })
      .catch(error => {
        console.error('Failed to create meeting:', error);
        Alert.alert(
          'Error',
          'Failed to create video meeting. Please try again.',
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Call handleVideoCall if videocall is true on mount
  useEffect(() => {
    if (videocall) {
      handleVideoCall();
    }
    // We only want to run this on mount or when videocall changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videocall]);

  // JitsiMeeting event handlers
  const onReadyToClose = useCallback(() => {
    setInCall(false);
    setRoomName(null);
    setMeetingToken(null);
    // @ts-ignore
    if (
      jitsiMeeting.current &&
      typeof jitsiMeeting.current.close === 'function'
    ) {
      jitsiMeeting.current.close();
    }
    // Restore tab bar visibility when call ends
    navigation.getParent?.()?.setOptions?.({tabBarStyle: {display: 'flex'}});
  }, [navigation]);

  const onEndpointMessageReceived = useCallback(() => {
    console.log('You got a message!');
  }, []);

  const eventListeners = {
    onReadyToClose,
    onEndpointMessageReceived,
  };

  // Hide bottom tab bar when in video call
  useEffect(() => {
    if (inCall) {
      // Hide the tab bar
      navigation.getParent?.()?.setOptions?.({tabBarStyle: {display: 'none'}});
    } else {
      // Show the tab bar
      navigation.getParent?.()?.setOptions?.({tabBarStyle: {display: 'flex'}});
    }
    // Optionally, restore tab bar on unmount
    return () => {
      navigation.getParent?.()?.setOptions?.({tabBarStyle: {display: 'flex'}});
    };
  }, [inCall, navigation]);

  // Show full screen when video call starts
  if (inCall) {
    // Full screen JitsiMeeting (no header, no chat, no input)
    return (
      <View style={styles.jitsiFullScreenView}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#000"
          translucent
        />
        <CustomeLoader loading={loading} />
        {JitsiMeeting ? (
          <JitsiMeeting
            ref={jitsiMeeting}
            room={roomName || 'defaultRoom'}
            serverURL={serverUrl}
            token={meetingToken || undefined}
            config={{
              hideConferenceTimer: true,
              whiteboard: {
                enabled: true,
                collabServerBaseUrl: serverUrl,
              },
              analytics: {
                disabled: true,
              },
            }}
            eventListeners={eventListeners as any}
            flags={{
              'audioMute.enabled': true,
              'ios.screensharing.enabled': true,
              'fullscreen.enabled': false,
              'audioOnly.enabled': false,
              'android.screensharing.enabled': true,
              'pip.enabled': true,
              'pip-while-screen-sharing.enabled': true,
              'conference-timer.enabled': true,
              'close-captions.enabled': false,
              'toolbox.enabled': true,
            }}
            style={styles.jitsiFullScreenView}
          />
        ) : (
          <View style={styles.jitsiFullScreenView}>
            <Text style={{color: '#fff', textAlign: 'center', marginTop: 40}}>
              Video call is not available. Please check your app installation.
            </Text>
          </View>
        )}
      </View>
    );
  }

  // Normal chat UI when not in call
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
          showVideoCallButton={true}
          onVideoCallPress={handleVideoCall}
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
  jitsiView: {
    flex: 1,
    backgroundColor: '#000',
  },
  jitsiFullScreenView: {
    flex: 1,
    backgroundColor: '#000',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
});

export default ChatScreen;
