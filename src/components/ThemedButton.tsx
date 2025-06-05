import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, COMPONENT_STYLES } from '../theme/theme';

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: object;
}

const ThemedButton: React.FC<ThemedButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style = {},
}) => {
  return (
    <TouchableOpacity
      style={[
        COMPONENT_STYLES.button,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <Text style={COMPONENT_STYLES.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  disabledButton: {
    backgroundColor: COLORS.gray,
    opacity: 0.7,
  },
});

export default ThemedButton;