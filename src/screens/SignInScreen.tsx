import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import ThemedInput from '../components/ThemedInput';
import { getAuth, onAuthStateChanged, signInWithPhoneNumber } from '@react-native-firebase/auth';
import { validatePhoneNumber } from '../helper/Validation';
import Loader from '../components/Loader';
import { moderateScale } from 'react-native-size-matters';
import { useCommonToast } from '../common/CommonToast';
// import { firebaseAuth } from '../../App';
type SignInScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'SignIn'
>;

interface Props {
  navigation: SignInScreenNavigationProp;
}

const SignInScreen: React.FC<Props> = ({ navigation }) => {
  const { showErrorToast, showSuccessToast } = useCommonToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});


  const handleSignIn = async () => {
    console.log('---1')
    const cleanPhoneNumber = phoneNumber.trim().replace(/\s+/g, '');
    console.log('---2')
    if (!cleanPhoneNumber) {
      const newErrors: any = {};
      newErrors.phoneNumber = 'Please enter your phone number.';
      setErrors(newErrors);
      return;
    }
    console.log('---3')
    // Ensure it has +country code
    const formattedPhone = cleanPhoneNumber.startsWith('+') ? cleanPhoneNumber : `+91${cleanPhoneNumber}`;
    console.log('---4')
    if (!validatePhoneNumber(formattedPhone)) {
      // Alert.alert('Validation Error', 'Please enter a valid phone number in international format.');
      const newErrors: any = {};
      newErrors.phoneNumber = 'Please enter a valid phone number in international format.';
      setErrors(newErrors);
      return;
    }

    setErrors({})
    console.log('---5-new')
    try {
      // const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
      setLoading(true);
      const confirmation = await signInWithPhoneNumber(getAuth(), formattedPhone);
      setLoading(false);
      // Alert.alert('Success', 'OTP has been sent to your phone.');
      showSuccessToast('OTP has been sent to your phone.')
      // console.log('---6 : ',confirmation)
      navigation.navigate('OTPVerification', {
        phoneNumber: formattedPhone,
        confirmation,
      });
      console.log('---7')
    } catch (error: any) {
      console.log('---8')
      console.error(error);
      setLoading(false);
      // Alert.alert('Error', error?.message || 'Failed to send OTP. Please try again.');
      showErrorToast(error?.message || 'Failed to send OTP. Please try again.')
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <Loader loading={isLoading} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to PanditApp</Text>
          <Text style={styles.subtitle}>
            Please enter your phone number to continue
          </Text>

          {/* <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              maxLength={15}
            />
          </View> */}
          <ThemedInput
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            maxLength={10}
            errors={errors}
            errorField='phoneNumber'
          />

          <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
            <Text style={styles.signInButtonText}>Get OTP</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  signInButton: {
    height: 48,
    backgroundColor: '#00BCD4',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(16),
    marginTop: moderateScale(10)
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
  },
});

export default SignInScreen;
