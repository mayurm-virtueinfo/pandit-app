import {StyleSheet} from 'react-native';
import {moderateScale} from 'react-native-size-matters';

// Colors
export const COLORS = {
  primary: '#F21825',
  primaryDisabled: '#B2EAF1',
  primaryBackground: '#FB3440',
  primaryBackgroundButton: '#FFB900',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#888888',
  lightGray: '#F5F5F5',
  backgroundPrimary: '#FFFFFF',
  backGroundSecondary: '#ebeded',
  textPrimary: '#222222',
  textSecondary: '#888888',
  success: '#32CD32',
  warning: '#FF4500',
  error: '#FF0000',
  textDark: '#1A1A1A',
  textGray: '#7D7D7D',
  background: '#F7F9FC',
  border: '#DDDDDD',
  darkText: '#1F2937',
  inputBg: '#ECEEF2',
  inputLabelText: '#6C7278',
  inputBoder: '#E4E8E9',
  borderColor: '#E4E8E9',
  disabled: '#E5E7EB',
  lighttext: '#6C7278',
};

export const THEMESHADOW = {
  shadow: {
    borderRadius: moderateScale(10),
    elevation: 7,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 7,
  },
};

// Typography
export const FONTS = {
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subheading: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  body: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  small: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
};

// Common component styles
export const COMPONENT_STYLES = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
    padding: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    // marginBottom: 20,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 20,
  },
});
