import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  KeyboardTypeOptions,
  TextInputProps,
  useColorScheme,
} from 'react-native';
import { COLORS, COMPONENT_STYLES } from '../theme/theme';
import { moderateScale } from 'react-native-size-matters';

interface ThemedInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  label?: string;
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  errors?: any;
  errorField?: string;
}

const ThemedInput: React.FC<ThemedInputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  secureTextEntry = false,
  keyboardType = 'default',
  autoComplete = 'off',
  textContentType = 'none',
  maxLength,
  errors,
  errorField,
}) => {
  const colorScheme = useColorScheme();
  // Set input text color and placeholder text color for light/dark
  const inputTextColor = colorScheme === 'dark' ? COLORS.white : COLORS.textPrimary;
  const placeholderColor = colorScheme === 'dark' ? COLORS.gray : COLORS.gray;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          COMPONENT_STYLES.input,
          { color: inputTextColor },
          errorField && errors?.[`${errorField}`] && styles.errorField,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoComplete={autoComplete}
        textContentType={textContentType}
        maxLength={maxLength}
      />
      {errorField && errors?.[`${errorField}`] && (
        <Text style={styles.errorText}>{errors.phoneNumber}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  errorField: {
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: moderateScale(5),
  },
  container: {
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: COLORS.textPrimary,
  },
});

export default ThemedInput;