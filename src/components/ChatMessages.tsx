import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {moderateScale} from 'react-native-size-matters';
import ChatBubble from './ChatBubble';
import {Message} from '../screens/HomeScreen/ChatScreen';
import {SCREEN_HEIGHT} from '../theme/theme';

interface ChatMessagesProps {
  messages: Message[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({messages}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {messages.map(message => (
          <ChatBubble
            key={message.id}
            text={message.text}
            time={message.time}
            isOwn={message.isOwn}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: moderateScale(24),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: moderateScale(20),
    minHeight: SCREEN_HEIGHT * 0.4,
  },
});

export default ChatMessages;
