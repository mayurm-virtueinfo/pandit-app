import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
} from 'react-native';
import {moderateScale} from 'react-native-size-matters';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {COLORS, wp} from '../theme/theme';
import Fonts from '../theme/fonts';
import {useTranslation} from 'react-i18next';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({onSendMessage}) => {
  const [message, setMessage] = useState('');
  const {t, i18n} = useTranslation();

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      Keyboard.dismiss();
    }
  };

  const handleEmojiPress = () => {
    // Handle emoji picker functionality
    console.log('Emoji pressed');
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.emojiButton}
          onPress={handleEmojiPress}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <MaterialIcons name="emoji-emotions" size={24} color="#BAB8B8" />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder={t('message')}
          placeholderTextColor="rgba(25, 19, 19, 0.3)"
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={1000}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />

        <TouchableOpacity
          style={[styles.sendButton, {opacity: message.trim() ? 1 : 0.6}]}
          onPress={handleSend}
          disabled={!message.trim()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons name="send" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(16),
    backgroundColor: COLORS.white,
    ...Platform.select({
      ios: {
        paddingBottom: moderateScale(32),
      },
      android: {
        paddingBottom: moderateScale(16),
      },
    }),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.chatColor,
    borderRadius: moderateScale(23),
    minHeight: moderateScale(46),
    maxWidth: wp(95),
    alignContent: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  emojiButton: {
    paddingHorizontal: moderateScale(16),
  },
  textInput: {
    flex: 1,
    fontSize: moderateScale(14),
    fontFamily: Fonts.Sen_Regular,
    color: COLORS.primaryTextDark,
    letterSpacing: -0.33,
    maxHeight: moderateScale(100),
    paddingVertical: moderateScale(8),
    paddingHorizontal: 0,
    textAlignVertical: 'center',
  },
  sendButton: {
    backgroundColor: COLORS.primaryBackgroundButton,
    borderRadius: moderateScale(19),
    width: moderateScale(38),
    height: moderateScale(38),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: moderateScale(8),
  },
});

export default ChatInput;
