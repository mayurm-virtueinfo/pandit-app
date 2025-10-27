import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Platform,
  ScrollView,
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
} from '@react-navigation/native';
import {createMeeting, getMessageHistory} from '../../api/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppConstant from '../../utils/AppContent';
import CustomeLoader from '../../components/CustomLoader';
import {
  KeyboardAwareScrollView,
  KeyboardProvider,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';

export interface Message {
  id: string;
  text: string;
  time: string;
  isOwn: boolean;
}

const ChatScreen: React.FC = () => {
  const route = useRoute() as any;
  const navigation = useNavigation();
  const {booking_id, other_user_name, user_id, videocall, incomingMeetingUrl} =
    route?.params || {};

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

  const [wsConnecting, setWsConnecting] = useState(false);

  const ws = useRef<WebSocket | null>(null);
  const socketClosedManually = useRef(false);
  const isFocused = useRef(true);
  const hasInitialized = useRef(false);

  const scrollViewRef = useRef<ScrollView | null>(null);
  const isUserAtBottom = useRef(true);

  const jitsiMeeting = useRef<any>(null);

  let JitsiMeeting: any = null;
  try {
    JitsiMeeting = require('@jitsi/react-native-sdk').JitsiMeeting;
  } catch (e) {
    JitsiMeeting = null;
  }

  const getSocketURL = (token: string, bookingId: string) => {
    if (__DEV__) {
      return `ws://192.168.1.27:9000/ws/chat/by-booking/${bookingId}/?token=${token}`;
    }
    return `wss://puja-guru.com/ws/chat/by-booking/${bookingId}/?token=${token}`;
  };

  // Fetch tokens once on mount
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const pid = await AsyncStorage.getItem(AppConstant.USER_ID);
        setAccessToken(token);
        setPanditID(pid);
      } catch (e) {
        setAccessToken(null);
        setPanditID(null);
      }
    };
    fetchToken();
  }, []);

  // Fetch chat history only once on mount
  const fetchChatHistory = useCallback(async () => {
    if (!booking_id || !panditID) return;

    setLoading(true);
    try {
      const resp: any = await getMessageHistory(booking_id);
      console.log('resp', resp);
      if (resp && Array.isArray(resp)) {
        const normalized = resp.map((msg: any) => ({
          id: msg.uuid,
          text: msg.content || msg.message,
          time: new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isOwn: String(msg.sender) === String(panditID),
        }));
        setMessages(normalized);
        isUserAtBottom.current = true;
      }
    } catch (e) {
      console.error('Fetch chat history error:', e);
    } finally {
      setLoading(false);
    }
  }, [booking_id, panditID]);

  // Initial load - fetch history only once
  useEffect(() => {
    if (!hasInitialized.current && panditID && booking_id) {
      fetchChatHistory();
      hasInitialized.current = true;
    }
  }, [panditID, booking_id, fetchChatHistory]);

  // Track focus state - reconnect WebSocket only when coming back
  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;

      // Only reconnect if WebSocket is not already connected
      if (
        ws.current?.readyState !== WebSocket.OPEN &&
        accessToken &&
        booking_id &&
        panditID
      ) {
        console.log('🔄 Reconnecting WebSocket on focus...');
        connectWebSocket();
      }

      return () => {
        isFocused.current = false;
      };
    }, [accessToken, booking_id, panditID]),
  );

  // WebSocket connection setup
  const connectWebSocket = useCallback(() => {
    if (!accessToken || !booking_id || !panditID) return;

    // Clean up existing connection
    if (ws.current) {
      try {
        ws.current.onopen = null;
        ws.current.onmessage = null;
        ws.current.onerror = null;
        ws.current.onclose = null;
        ws.current.close();
      } catch (err) {
        console.error('Error closing existing WebSocket:', err);
      }
      ws.current = null;
    }

    setWsConnecting(true);

    const autoLoaderTimeout = setTimeout(() => {
      setWsConnecting(false);
    }, 2300);

    const socketURL = getSocketURL(accessToken, booking_id);
    let newWs: WebSocket | null = null;

    try {
      newWs = new WebSocket(socketURL);
      ws.current = newWs;
    } catch (e) {
      setWsConnecting(false);
      clearTimeout(autoLoaderTimeout);
      Alert.alert('WebSocket Error', 'Could not create socket!');
      return;
    }

    newWs.onopen = () => {
      console.log('✅ Connected to WebSocket');
      socketClosedManually.current = false;
      setWsConnecting(false);
      clearTimeout(autoLoaderTimeout);
    };

    newWs.onmessage = e => {
      let data;
      try {
        data = JSON.parse(e.data);
      } catch {
        return;
      }

      if (!data?.uuid) return;

      const isOwn = String(data.sender_id) === String(panditID);

      // Only add messages from others (own messages already added optimistically)
      if (!isOwn) {
        const newMsg: Message = {
          id: data.uuid,
          text: data.message,
          time: new Date(data.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isOwn: false,
        };

        // Add message in real-time
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(msg => msg.id === data.uuid);
          if (exists) return prev;
          return [...prev, newMsg];
        });
      }
    };

    newWs.onerror = (e: any) => {
      console.error('❌ WebSocket error:', e);
      setWsConnecting(false);
      clearTimeout(autoLoaderTimeout);

      if (!__DEV__) {
        Alert.alert(
          'WebSocket error',
          e?.message ? String(e.message) : 'Unknown socket error',
        );
      }
    };

    newWs.onclose = (e: any) => {
      console.log('🔌 WebSocket closed:', e.code, e.reason);
      setWsConnecting(false);
      clearTimeout(autoLoaderTimeout);

      if (!socketClosedManually.current && !__DEV__) {
        Alert.alert('WebSocket Closed', `Code: ${e.code}\nReason: ${e.reason}`);
      }

      // Auto-reconnect if screen is still focused and not manually closed
      if (isFocused.current && !socketClosedManually.current) {
        setTimeout(() => {
          console.log('🔄 Auto-reconnecting WebSocket...');
          connectWebSocket();
        }, 3000);
      }
    };
  }, [accessToken, booking_id, panditID]);

  // Initial WebSocket connection
  useEffect(() => {
    if (accessToken && booking_id && panditID) {
      connectWebSocket();
    }

    return () => {
      socketClosedManually.current = true;
      if (ws.current) {
        try {
          ws.current.onopen = null;
          ws.current.onmessage = null;
          ws.current.onerror = null;
          ws.current.onclose = null;
          ws.current.close();
        } catch (err) {
          console.error('Error closing WebSocket on cleanup:', err);
        }
        ws.current = null;
      }
    };
  }, [accessToken, booking_id, panditID, connectWebSocket]);

  const handleSendMessage = async (text: string) => {
    if (!panditID) {
      Alert.alert('You are not logged in.');
      return;
    }

    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      Alert.alert(
        'WebSocket not connected',
        'Reconnecting or starting up. Please try again in a moment.',
      );
      return;
    }

    const messageId = `${Date.now()}-local`;
    const timestamp = new Date();

    const messageObj = {
      message: text,
      sender_id: panditID,
    };

    // Optimistically add message to UI
    const newMessage: Message = {
      id: messageId,
      text: text,
      time: timestamp.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isOwn: true,
    };

    setMessages(prev => [...prev, newMessage]);
    isUserAtBottom.current = true;

    try {
      ws.current.send(JSON.stringify(messageObj));
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert('Send Failed', 'Unable to send message.');
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    }
  };

  const scrollToBottom = useCallback((animated = true) => {
    if (scrollViewRef.current) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({animated}), 120);
    }
  }, []);

  const handleScroll = (event: any) => {
    const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
    isUserAtBottom.current =
      contentOffset.y >= contentSize.height - layoutMeasurement.height - 10;
  };

  useEffect(() => {
    if (isUserAtBottom.current) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // Video/Meeting Handling
  useEffect(() => {
    if (incomingMeetingUrl) {
      handleMeetingURL();
    }
  }, [incomingMeetingUrl]);

  useEffect(() => {
    if (videocall) {
      handleVideoCall();
    }
  }, [videocall]);

  const handleVideoCall = () => {
    if (!booking_id) {
      Alert.alert('Error', 'No booking ID available for video call.');
      return;
    }
    setLoading(true);
    createMeeting(booking_id)
      .then(response => {
        if (response?.data?.room_name && response?.data?.token) {
          setRoomName(response.data.room_name);
          setMeetingToken(response.data.token);
          setServerUrl(
            response.data.server_url || 'https://meet.puja-guru.com/',
          );
          setInCall(true);
        } else if (response?.data?.meeting_url) {
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
      .catch(() => {
        Alert.alert(
          'Error',
          'Failed to create video meeting. Please try again.',
        );
      })
      .finally(() => setLoading(false));
  };

  const handleMeetingURL = () => {
    if (!incomingMeetingUrl) return;
    let url = incomingMeetingUrl.endsWith('/')
      ? incomingMeetingUrl.slice(0, -1)
      : incomingMeetingUrl;
    const lastSlashIdx = url.lastIndexOf('/');
    let room =
      lastSlashIdx === -1 ? 'defaultRoom' : url.substring(lastSlashIdx + 1);
    const queryIdx = room.indexOf('?');
    room =
      queryIdx !== -1 ? room.substring(0, queryIdx) : room || 'defaultRoom';
    setRoomName(room);
    setMeetingToken(null);
    setServerUrl('https://meet.puja-guru.com/');
    setInCall(true);
  };

  const onReadyToClose = useCallback(() => {
    setInCall(false);
    setRoomName(null);
    setMeetingToken(null);
    if (
      jitsiMeeting.current &&
      typeof jitsiMeeting.current.close === 'function'
    ) {
      jitsiMeeting.current.close();
    }
    navigation.getParent?.()?.setOptions?.({tabBarStyle: {display: 'flex'}});
  }, [navigation]);

  const eventListeners = {onReadyToClose};

  useEffect(() => {
    if ((route as any)?.params?.endCall) {
      onReadyToClose();
    }
  }, [(route as any)?.params?.endCall]);

  useEffect(() => {
    if (inCall) {
      navigation.getParent?.()?.setOptions?.({tabBarStyle: {display: 'none'}});
    } else {
      navigation.getParent?.()?.setOptions?.({tabBarStyle: {display: 'flex'}});
    }
    return () => {
      navigation.getParent?.()?.setOptions?.({tabBarStyle: {display: 'flex'}});
    };
  }, [inCall, navigation]);

  if (inCall) {
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
              analytics: {disabled: true},
              prejoinPageEnabled: false,
              prejoinConfig: {enabled: false},
              requireDisplayName: false,
              startWithAudioMuted: false,
              startWithVideoMuted: false,
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
              'chat.enabled': false,
              'prejoin.enabled': false,
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

  return (
    <KeyboardProvider>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: COLORS.primaryBackground,
          paddingTop: insets.top,
        }}>
        <CustomeLoader loading={loading || wsConnecting} />
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.primaryBackground}
          translucent
        />
        <View style={styles.safeArea}>
          <UserCustomHeader
            title={other_user_name || 'Chat'}
            showBackButton
            showVideoCallButton
            onVideoCallPress={handleVideoCall}
          />
        </View>

        <View style={styles.chatContainer}>
          <KeyboardAwareScrollView
            extraKeyboardSpace={Platform.OS === 'android' ? -50 : -70}
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
          </KeyboardAwareScrollView>

          <KeyboardStickyView
            offset={{
              closed: 0,
              opened: Platform.OS === 'android' ? 50 : 85,
            }}
            enabled={true}>
            <ChatInput onSendMessage={handleSendMessage} />
          </KeyboardStickyView>
        </View>
      </SafeAreaView>
    </KeyboardProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
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
