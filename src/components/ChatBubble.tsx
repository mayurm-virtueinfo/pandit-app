import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import Fonts from '../theme/fonts';
import { COLORS, wp } from '../theme/theme';

interface ChatBubbleProps {
  text: string;
  time: string;
  isOwn: boolean;
  date?: string; // Add optional date prop (expects any format)
}

// Helper to format date string to DDMMYYYY
const formatDateToDDMMYYYY = (dateString?: string) => {
  if (!dateString) return '';
  // Try parsing with Date when ISO string, fallback to just show as is.
  let dateObj: Date | null = null;

  // Try to parse common formats, fallback to plain string
  if (dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
    // e.g., 2024-05-12
    dateObj = new Date(dateString);
  } else if (dateString.match(/^\d{2}\/\d{2}\/\d{4}/)) {
    // e.g., 12/05/2024 DD/MM/YYYY
    const [d, m, y] = dateString.split(/[\/\-\.]/);
    dateObj = new Date(`${y}-${m}-${d}`);
  }
  if (dateObj && !isNaN(dateObj.getTime())) {
    const dd = `0${dateObj.getDate()}`.slice(-2);
    const mm = `0${dateObj.getMonth() + 1}`.slice(-2);
    const yyyy = dateObj.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  // If not parseable, try to split or fallback as is
  // Try for timestamps: 2024-05-12T10:15:00Z etc.
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[3]}${match[2]}${match[1]}`;
  }
  // Fallback
  return dateString;
};

const ChatBubble: React.FC<ChatBubbleProps> = ({ text, time, isOwn, date }) => {
  const formattedDate = date ? formatDateToDDMMYYYY(date) : '';
  return (
    <View
      style={[
        styles.container,
        isOwn ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      <View
        style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}
      >
        <Text
          style={[
            styles.messageText,
            isOwn ? styles.ownText : styles.otherText,
          ]}
        >
          {text}
        </Text>
        <View style={[styles.row, isOwn ? styles.rowRight : styles.rowLeft]}>
          {formattedDate !== '' && (
            <Text style={[styles.metaText, styles.dateMetaText]}>
              {formattedDate}
            </Text>
          )}
          <Text style={[styles.metaText, styles.timeMetaText]}>{time}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: moderateScale(14),
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
    marginBottom: moderateScale(8),
  },
  ownText: {
    color: COLORS.primaryTextDark,
    textAlign: 'right',
  },
  otherText: {
    color: COLORS.primaryTextDark,
    textAlign: 'left',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(2),
    gap: moderateScale(6),
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  rowLeft: {
    justifyContent: 'flex-start',
  },
  metaText: {
    fontSize: moderateScale(11),
    fontFamily: Fonts.Sen_Regular,
    color: COLORS.pujaCardSubtext,
  },
  dateMetaText: {
    opacity: 0.8,
  },
  timeMetaText: {
    fontWeight: '500',
  },
});

export default ChatBubble;
