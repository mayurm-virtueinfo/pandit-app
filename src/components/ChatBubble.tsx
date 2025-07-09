import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {moderateScale} from 'react-native-size-matters';
import Fonts from '../theme/fonts';
import {COLORS, wp} from '../theme/theme';

interface ChatBubbleProps {
  text: string;
  time: string;
  isOwn: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({text, time, isOwn}) => {
  return (
    <View
      style={[
        styles.container,
        isOwn ? styles.ownMessage : styles.otherMessage,
      ]}>
      <View
        style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        <Text
          style={[
            styles.messageText,
            isOwn ? styles.ownText : styles.otherText,
          ]}>
          {text}
        </Text>
      </View>
      <Text
        style={[styles.timeText, isOwn ? styles.ownTime : styles.otherTime]}>
        {time}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: moderateScale(16),
    maxWidth: wp(75),
  },
  ownMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(11),
    borderRadius: moderateScale(10),
    minHeight: moderateScale(40),
    justifyContent: 'center',
  },
  ownBubble: {
    backgroundColor: COLORS.chatUserBackground,
    borderTopRightRadius: moderateScale(10),
    borderTopLeftRadius: moderateScale(10),
    borderBottomLeftRadius: moderateScale(10),
    borderBottomRightRadius: 0,
  },
  otherBubble: {
    backgroundColor: COLORS.chatColor,
    borderTopRightRadius: moderateScale(10),
    borderTopLeftRadius: moderateScale(10),
    borderBottomRightRadius: moderateScale(10),
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Sen_Regular,
    lineHeight: moderateScale(17),
  },
  ownText: {
    color: COLORS.primaryTextDark,
    textAlign: 'right',
  },
  otherText: {
    color: COLORS.primaryTextDark,
    textAlign: 'left',
  },
  timeText: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Sen_Regular,
    color: COLORS.pujaCardSubtext,
    marginTop: moderateScale(5),
    lineHeight: moderateScale(15),
  },
  ownTime: {
    textAlign: 'right',
  },
  otherTime: {
    textAlign: 'left',
  },
});

export default ChatBubble;
