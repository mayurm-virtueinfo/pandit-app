import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {moderateScale} from 'react-native-size-matters';
import {COLORS} from '../../theme/theme';
import UserCustomHeader from '../../components/CustomHeader';
import ChatMessages from '../../components/ChatMessages';
import ChatInput from '../../components/ChatInput';

export interface Message {
  id: string;
  text: string;
  time: string;
  isOwn: boolean;
}

//smaple comment
const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Are you coming?',
      time: '8:10 pm',
      isOwn: true,
    },
    {
      id: '2',
      text: "I'm Coming , just wait ...",
      time: '8:12 pm',
      isOwn: false,
    },
  ]);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isOwn: true,
    };
    setMessages(prev => [...prev, newMessage]);
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
          title="Dharmesh Shah"
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
    // flex: 1,
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
