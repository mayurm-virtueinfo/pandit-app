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
  Keyboard,
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

  // For forcing WebSocket effect when remount
  const [wsKey, setWsKey] = useState(0);

  // For websocket connect loader
  const [wsConnecting, setWsConnecting] = useState(false);

  // WebSocket Ref
  const ws = useRef<WebSocket | null>(null);
  // Track if ws was manually closed to avoid duplicate alert
  const socketClosedManually = useRef(false);

  // Scroll & UI Refs
  const scrollViewRef = useRef<ScrollView | null>(null);
  const isUserAtBottom = useRef(true);

  const jitsiMeeting = useRef<any>(null);

  let JitsiMeeting: any = null;
  try {
    JitsiMeeting = require('@jitsi/react-native-sdk').JitsiMeeting;
  } catch (e) {
    JitsiMeeting = null;
  }

  // Compose web socket url properly
  const getSocketURL = (token: string, bookingId: string) => {
    if (__DEV__) {
      // Local development: connect directly to your backend
      return `wss://puja-guru.com/ws/chat/by-booking/${bookingId}/?token=${token}`;
    }
    // Production: use secure WebSocket (wss) via Apache proxy on port 443
    return `wss://puja-guru.com/ws/chat/by-booking/${bookingId}/?token=${token}`;
  };

  // Only fetch tokens once on mount
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

  // --- Chat History: Fetch on entry (and when user id changes) ---
  const fetchChatHistory = async () => {
    setLoading(true);
    try {
      const resp: any = await getMessageHistory(booking_id);
      console.log("resp",resp)
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
      // show error optionally
    } finally {
      setLoading(false);
    }
  };

  // Fix for navigation: when you come back to this screen, force ws re-connection and fetch chat
  useFocusEffect(
    useCallback(() => {
      fetchChatHistory();
      // This forces the useEffect([wsKey]) to run again and clean/setup new ws connection
      setWsKey(prev => prev + 1);
      // Optional: reset scroll
    }, [panditID, booking_id])
  );

  // WebSocket connection management (runs fresh on wsKey change)
  useEffect(() => {
    // Wait until have token/id/info to connect
    if (!accessToken || !booking_id || !panditID) return;

    // Always cleanup before new socket (very important for navigation back/forth)
    if (ws.current) {
      try {
        ws.current.onopen = null;
        ws.current.onmessage = null;
        ws.current.onerror = null;
        ws.current.onclose = null;
        ws.current.close();
      } catch (err) {}
      ws.current = null;
    }

    // Start loader before websocket connect
    setWsConnecting(true);

    // Automatically hide loader after 2.3 seconds if not connected (safety timeout)
    let autoLoaderTimeout: NodeJS.Timeout | null = setTimeout(() => {
      setWsConnecting(false);
    }, 2300);

    const socketURL = getSocketURL(accessToken, booking_id);
    let newWs: WebSocket | null = null;
    try {
      newWs = new WebSocket(socketURL);
      ws.current = newWs;
    } catch (e) {
      setWsConnecting(false);
      if (autoLoaderTimeout) clearTimeout(autoLoaderTimeout);
      Alert.alert('WebSocket Error', 'Could not create socket!');
      return;
    }

    newWs.onopen = () => {
      socketClosedManually.current = false;
      setWsConnecting(false);
      if (autoLoaderTimeout) {
        clearTimeout(autoLoaderTimeout);
        autoLoaderTimeout = null;
      }
    };

    newWs.onmessage = e => {
      let data;
      try {
        data = JSON.parse(e.data);
      } catch {
        return;
      }
      if (!data?.uuid) return;
      // Accept only messages from others
      const isOwn = String(data.sender_id) === String(panditID);
      // If isOwn, do not set (it is already on chat optimistically)
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
        setMessages(prev => [...prev, newMsg]);
      }
    };

    newWs.onerror = (e: any) => {
      setWsConnecting(false);
      if (autoLoaderTimeout) {
        clearTimeout(autoLoaderTimeout);
        autoLoaderTimeout = null;
      }
      if (!__DEV__) {
        Alert.alert(
          'WebSocket error',
          e.message ? String(e.message) : 'Unknown socket error',
        );
      }
    };
    newWs.onclose = (e: any) => {
      setWsConnecting(false);
      if (autoLoaderTimeout) {
        clearTimeout(autoLoaderTimeout);
        autoLoaderTimeout = null;
      }
      if (!socketClosedManually.current && !__DEV__) {
        Alert.alert('WebSocket Closed', `Code: ${e.code}\nReason: ${e.reason}`);
      }
    };

    // Cleanup on unmount or wsKey change
    return () => {
      setWsConnecting(false);
      if (autoLoaderTimeout) {
        clearTimeout(autoLoaderTimeout);
        autoLoaderTimeout = null;
      }
      socketClosedManually.current = true;
      if (newWs) {
        try {
          newWs.onopen = null;
          newWs.onmessage = null;
          newWs.onerror = null;
          newWs.onclose = null;
          newWs.close();
        } catch (err) {}
        if (ws.current === newWs) {
          ws.current = null;
        }
      }
    };
    // NOTE: wsKey is used so this effect reruns every time you come back to the screen
  }, [accessToken, booking_id, panditID, wsKey]);

  // --- Message Sending: Add to chat on send, but do NOT add a duplicate on websocket receive ---
  const handleSendMessage = async (text: string) => {
    if (!panditID) {
      Alert.alert('You are not logged in.');
      return;
    }

    // -- Fix: ws.current may be non-null but closed, so check readyState
    if (!ws.current && ws?.current?.OPEN !== WebSocket.OPEN) {
      Alert.alert(
        'WebSocket not connected',
        'Reconnecting or starting up. Please try again in a moment.'
      );
      // Optionally, you could call setWsKey(prev=>prev+1); to force reconnect quicker if desired.
      return;
    }
    const messageId = `${Date.now()}-local`; // Temporary id for optimistic rendering
    const timestamp = new Date();

    const messageObj = {
      message: text,
      sender_id: panditID,
      // receiver_id: user_id,
    };

    // Optimistically show the message
    setMessages(prev => [
      ...prev,
      {
        id: messageId,
        text: text,
        time: timestamp.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isOwn: true,
      },
    ]);

    isUserAtBottom.current = true;
    try {
      ws.current.send(JSON.stringify(messageObj));
    } catch {
      Alert.alert('Send Failed', 'Unable to send message.');
      // Remove optimistic message if send fails
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    }
  };

  // --- Incoming scroll and view logic ---
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

  // --- Video/Meeting Handling ---
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
          // Parse meeting_url
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

  // Parse incomingMeetingUrl
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

  // Jitsi events
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

  // Support end call from navigation params
  useEffect(() => {
    if ((route as any)?.params?.endCall) {
      onReadyToClose();
    }
  }, [(route as any)?.params?.endCall]);

  // Hide tabBar during call
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

  // ----- Android 15+ Keyboard Fix -----
  // See: https://stackoverflow.com/questions/78452064/keyboardavoidingview-not-working-properly-on-android-14-react-native
  // Solution: Use "height: 100%" and avoid "flex: 1" directly on KeyboardAvoidingView, and/or new Android windowSoftInputMode defaults.
  // Also, new react-native 0.73+ and Android 14+ require behavior="height" for KeyboardAvoidingView.

  // You can also try dynamically measuring keyboard height to ensure input is always visible.
  // But first, properly set the KeyboardAvoidingView props based on platform.

  const keyboardVerticalOffset = Platform.select({
    ios: moderateScale(90),
    android: insets.top, // or 0, as needed (try insets.bottom if nav bar at bottom)
    default: 0,
  });

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
    <View
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
        {/* Android 14/15+ fix: 
            1. Use "behavior='height'" (NOT 'padding') for KeyboardAvoidingView.
            2. Assign style={{flex: 1, minHeight: 0}} to ensure the chat is not forced out.
            3. Try to set keyboardVerticalOffset: 0 or insets.bottom if nav-bar present, but test visually.*/}
        <KeyboardAvoidingView
          style={styles.chatContainerFixed}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
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
  // Keep original for fallback, but use chatContainerFixed for the KeyboardAvoidingView.
  chatContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    paddingTop: moderateScale(24),
  },
  // ADDED: For Android 14+/15+ keyboard fix. Remove "flex: 1" and use minHeight: 0 for better flexibility.
  chatContainerFixed: {
    flexGrow: 1,
    minHeight: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    paddingTop: moderateScale(24),
    flexDirection: 'column',
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
