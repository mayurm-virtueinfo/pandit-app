import { Dimensions, StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;

// Responsive helper functions
export const wp = (percentage: number) => {
  const value = (percentage * SCREEN_WIDTH) / 100;
  return Math.round(value);
};

export const hp = (percentage: number) => {
  const value = (percentage * SCREEN_HEIGHT) / 100;
  return Math.round(value);
};

export const THEMESHADOW = {
  shadow: {
    borderRadius: moderateScale(10),
    elevation: 7, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {
      width: 0,
      height: 5, // iOS shadow
    },
    shadowOpacity: 0.2, // iOS shadow
    shadowRadius: 7, // iOS shadow
  }
}

// Colors
export const COLORS = {
  primary: '#F21825', // The teal/turquoise color from your button
  primaryDisabled: '#B2EAF1', // Lighter shade for disabled state
  primaryBackground: '#FB3440',
  primaryBackgroundButton: '#FFB900', // Background color for primary button
  primaryTextDark: '#191313',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#888888',
  lightGray: '#F5F5F5',
  backgroundPrimary: '#FFFFFF',
  backGroundSecondary: '#ebeded',
  textPrimary: '#222222',
  textSecondary: '#888888',
  success: '#32CD32', // Green for "Completed"
  warning: '#FF4500', // Orange-Red for "Cancelled by User"
  error: '#FF0000', // Red for "Rejected"
  textDark: '#1A1A1A', // Primary dark text (e.g. pooja name)
  textGray: '#7D7D7D', // Secondary gray text (e.g. date, maharaj name)
  background: '#F7F9FC', // Light background color for screens
  border: '#DDDDDD', // Border/light separator if needed
  darkText: '#1F2937',
  inputBg: '#ECEEF2',
  inputLabelText: '#6C7278',
  inputBoder: '#E4E8E9',
  borderColor: '#E4E8E9',
  // Puja List specific colors
  pujaBackground: '#F9F7F7',
  gradientStart: '#FB3440',
  gradientEnd: '#FA1927',
  pujaTextSecondary: '#6C7278',
  pujaCardPrice: '#FA1927',
  pujaCardSubtext: '#8A8A8A',
  separatorColor: '#EBEBEB',
  bottomNavBackground: '#F5F6F7',
  bottomNavIcon: '#484C52',
  bottomNavActive: '#FA1927',
  chatColor: '#F0F0F0',
  chatUserBackground: '#FFD1D4',
  badgeBackground: '#EAEAEA',
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
