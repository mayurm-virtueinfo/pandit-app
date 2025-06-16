import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {AuthStackParamList} from '../navigation/AuthNavigator';
import Loader from '../components/Loader';
import { getAuth, signInWithPhoneNumber } from '@react-native-firebase/auth';
import { useCommonToast } from '../common/CommonToast';

type OTPVerificationScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'OTPVerification'
>;

type OTPVerificationScreenRouteProp = RouteProp<
  AuthStackParamList,
  'OTPVerification'
>;

interface Props {
  navigation: OTPVerificationScreenNavigationProp;
  route: OTPVerificationScreenRouteProp;
}

const OTPVerificationScreen: React.FC<Props> = ({navigation, route}) => {
  const { showErrorToast, showSuccessToast } = useCommonToast();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const {phoneNumber,confirmation} = route.params;

  const [otpConfirmation, setOtpConfirmation] = useState(confirmation)
  const [isLoading,setLoading] = useState(false);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input if value is entered
      if (value !== '' && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const confirmCode = async (code:string) => {
    try {
      setLoading(true)
      await otpConfirmation.confirm(code);
      setLoading(false)
      navigation.navigate('PanditRegistration');
    } catch (error:any) {
      console.log('Invalid code.');
      setLoading(false)
      // Alert.alert('','Invalid code');
      showErrorToast(error?.message || 'Failed to Resend OTP. Please try again.')
    }
  }
  const handleVerification = async () => {
    try {
      const otpValue = otp.join('');
      if (otpValue.length !== 6) {
        // Alert.alert('Error', 'Please enter a valid 6-digit OTP');
        showErrorToast('Please enter a valid 6-digit OTP')
        return;
      }

      // Here you would typically make an API call to verify the OTP
      // For now, we'll simulate a successful verification

      confirmCode(otpValue);
      // Navigate to registration screen after successful verification
      
    } catch (error) {
      console.error('Verification failed:', error);
      // Alert.alert('Error', 'OTP verification failed. Please try again.');
      showErrorToast('OTP verification failed. Please try again.')
    }
  };

  const handleResendOTP = async() => {
    // Implement resend OTP logic here
    try {
          // const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
          setLoading(true);
          const confirmation = await signInWithPhoneNumber(getAuth(), phoneNumber);
          setLoading(false);
          // Alert.alert('Success', 'New OTP has been sent to your phone number');
          showSuccessToast('New OTP has been sent to your phone number');
          setOtpConfirmation(confirmation);
        } catch (error: any) {
          console.log('---8')
          console.error(error);
          setLoading(false);
          // Alert.alert('Error', error?.message || 'Failed to Resend OTP. Please try again.');
          showErrorToast(error?.message || 'Failed to Resend OTP. Please try again.')
        }
    
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <Loader loading={isLoading}/>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.title}>OTP Verification</Text>
          <Text style={styles.subtitle}>
            Enter the verification code we sent to
          </Text>
          <Text style={styles.phoneNumber}>{phoneNumber}</Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => (inputRefs.current[index] = ref)}
                style={styles.otpInput}
                value={digit}
                onChangeText={value => handleOtpChange(value, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                testID={`otp-input-${index}`}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.verifyButton}
            onPress={handleVerification}>
            <Text style={styles.verifyButtonText}>Verify</Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={handleResendOTP}>
              <Text style={styles.resendButton}>Resend OTP</Text>
            </TouchableOpacity>
          </View>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  otpInput: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginHorizontal: 5,
    textAlign: 'center',
    fontSize: 20,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  verifyButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#00BCD4',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
  },
  resendButton: {
    fontSize: 14,
    color: '#00BCD4',
    fontWeight: '600',
  },
});

export default OTPVerificationScreen;
