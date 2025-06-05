import { StyleSheet } from 'react-native';

// Colors
export const COLORS = {
  primary: '#00BCD4', // The teal/turquoise color from your button
  primaryDisabled: '#B2EAF1', // Lighter shade for disabled state
  white: '#FFFFFF',
  black: '#000000',
  gray: '#888888',
  lightGray: '#F5F5F5',
  backgroundPrimary: '#FFFFFF',
  textPrimary: '#222222',
  textSecondary: '#888888',
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
    marginBottom: 20,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 20,
  },
});