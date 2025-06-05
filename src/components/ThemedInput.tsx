import React from 'react';
import { TextInput, View, Text, StyleSheet, KeyboardTypeOptions, TextInputProps } from 'react-native';
import { COLORS, COMPONENT_STYLES } from '../theme/theme';

interface ThemedInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  label?: string;
  autoComplete?: TextInputProps['autoComplete']; // Change this line
  textContentType?: TextInputProps['textContentType']; // Change this line
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions; // Change this line
  maxLength?: number; // Optional prop for maximum length
}

const ThemedInput: React.FC<ThemedInputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  secureTextEntry = false,
  keyboardType = 'default',
  autoComplete = 'off', // Default to 'off' for autoComplete
  textContentType = 'none', // Default to 'none' for textContentType
  maxLength
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={COMPONENT_STYLES.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoComplete={autoComplete}
        textContentType={textContentType}
        maxLength={maxLength}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: COLORS.textPrimary,
  },
});

export default ThemedInput;