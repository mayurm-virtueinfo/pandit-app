import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import CustomHeader from '../components/CustomHeader'; // Adjust the path as needed
import {COLORS} from '../theme/theme';
import {useTranslation} from 'react-i18next';
// import { COLORS } from '../constants/theme'; // Ensure COLORS.primary is defined here

const PinVerificationScreen = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const {t} = useTranslation();

  const handleSubmit = () => {
    if (!pin.trim()) {
      setError('Please enter a pin.');
      return;
    }
    if (!/^\d{4,6}$/.test(pin)) {
      setError('Pin must be 4 to 6 digits.');
      return;
    }

    setError('');
    Alert.alert('Success', `Pin "${pin}" submitted successfully.`);
    // Proceed with pin verification logic
  };

  const handleCancel = () => {
    setPin('');
    setError('');
    // Navigate back or perform other logic
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ios: 'padding', android: undefined})}>
      <CustomHeader
        showBackButton={true}
        showMenuButton={false}
        title={t('pin_verification')}
      />

      <View style={styles.content}>
        <Text style={styles.label}>{t('pin_code_desc')}</Text>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={pin}
          onChangeText={setPin}
          placeholder={t('enter_pin')}
          keyboardType="numeric"
          maxLength={6}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>{t('submit')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#EDEDED',
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#EDEDED',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
  },
});

export default PinVerificationScreen;
