// components/PrimaryButtonOutlined.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {COLORS} from '../theme/theme';
import Fonts from '../theme/fonts';
import {moderateScale} from 'react-native-size-matters';

interface Props {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const PrimaryButtonOutlined: React.FC<Props> = ({
  title,
  onPress,
  disabled = false,
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, style, disabled && styles.disabled]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}>
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: moderateScale(48),
    backgroundColor: COLORS.white, // Customize with your primary color
    borderRadius: 10,
    borderColor: COLORS.primaryBackgroundButton, // Border color
    borderWidth: 1, // Border width
    justifyContent: 'center',
    alignItems: 'center',
    // shadowColor: '#000',
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // shadowOffset: { width: 0, height: 2 },
    // elevation: 3,
    marginTop: moderateScale(10),
  },
  buttonText: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.primaryTextDark,
  },
  disabled: {
    backgroundColor: '#E5E7EB',
  },
});

export default PrimaryButtonOutlined;
