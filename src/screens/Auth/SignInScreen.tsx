import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ImageBackground,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../../navigation/AuthNavigator';
import ThemedInput from '../../components/ThemedInput';
import {getAuth, signInWithPhoneNumber} from '@react-native-firebase/auth';
import {validatePhoneNumber} from '../../helper/Validation';
import Loader from '../../components/Loader';
import {moderateScale} from 'react-native-size-matters';
import {useCommonToast} from '../../common/CommonToast';
import {COLORS} from '../../theme/theme';
import Fonts from '../../theme/fonts';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import PrimaryButton from '../../components/PrimaryButton';
import {Images} from '../../theme/Images';

type SignInScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'SignIn'
>;

interface Props {
  navigation: SignInScreenNavigationProp;
}

const SignInScreen: React.FC<Props> = ({navigation}) => {
  const {t} = useTranslation();
  const inset = useSafeAreaInsets();
  const {showErrorToast, showSuccessToast} = useCommonToast();
  const [phoneNumber, setPhoneNumber] = useState('1111111111');
  const [isLoading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{phoneNumber?: string}>({});

  // Proper validation: Only allow 10 digit numbers, no letters, no special chars, must start with 6-9
  const validateInput = (input: string) => {
    const trimmed = input.trim().replace(/\s+/g, '');
    if (!trimmed) {
      return t('enter_mobile_number');
    }
    if (!/^[6-9]\d{9}$/.test(trimmed)) {
      return (
        t('Please_enter_valid_number') ||
        'Please enter a valid 10-digit mobile number'
      );
    }
    return '';
  };

  const handleSignIn = async () => {
    const errorMsg = validateInput(phoneNumber);
    if (errorMsg) {
      setErrors({phoneNumber: errorMsg});
      showErrorToast(errorMsg);
      return;
    }

    setErrors({});
    const formattedPhone = `+91${phoneNumber.trim().replace(/\s+/g, '')}`;
    if (!validatePhoneNumber(formattedPhone)) {
      const errorText =
        t('Please_enter_valid_number') ||
        'Please enter a valid 10-digit mobile number';
      setErrors({
        phoneNumber: errorText,
      });
      showErrorToast(errorText);
      return;
    }

    try {
      setLoading(true);
      const confirmation = await signInWithPhoneNumber(
        getAuth(),
        formattedPhone,
      );
      setLoading(false);
      showSuccessToast(t('otp_sent') || 'OTP has been sent to your phone.');
      navigation.navigate('OTPVerification', {
        phoneNumber: formattedPhone,
        confirmation,
      });
    } catch (error: any) {
      setLoading(false);
      showErrorToast(
        t('otp_send_failed') || 'Failed to send OTP. Please try again.',
      );
    }
  };

  // Only allow numeric input, max 10 digits
  const handlePhoneChange = (text: string) => {
    // Remove all non-numeric characters
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 10) cleaned = cleaned.slice(0, 10);
    setPhoneNumber(cleaned);
    if (errors.phoneNumber) {
      setErrors({});
    }
  };

  return (
    <ImageBackground
      source={Images.ic_splash_background}
      style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <Loader loading={isLoading} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={[styles.content, {paddingTop: inset.top}]}>
            <View style={styles.containerHeader}>
              <Image
                source={Images.ic_app_logo}
                style={{width: '33%', resizeMode: 'contain'}}
              />
              <Text style={styles.title}>{t('hi_welcome')}</Text>
            </View>

            <View style={[styles.containerBody, {paddingBottom: inset.bottom}]}>
              <Text style={styles.mainTitle}>{t('sign_in')}</Text>
              <Text style={styles.subtitle}>
                {t('please_enter_your_credential')}
              </Text>

              <ThemedInput
                label={t('')}
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                placeholder={t('enter_mobile_number')}
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                maxLength={10}
                errors={errors}
                errorField="phoneNumber"
              />

              <PrimaryButton onPress={handleSignIn} title={t('send_otp')} />

              {/* <Text style={styles.termsText}>
                {t('by_signing_in_you_agree_to_our')}
                <Text
                  style={{color: COLORS.primary, fontFamily: Fonts.Sen_Bold}}
                  onPress={() => {
                    Alert.alert(
                      t('terms_of_service'),
                      t('terms_of_service_content'),
                    );
                  }}>
                  {` ${t('terms_of_service')}`}
                </Text>
                {` ${t('and')}`}
                <Text
                  style={{color: COLORS.primary, fontFamily: Fonts.Sen_Bold}}
                  onPress={() => {
                    Alert.alert(
                      t('privacy_policy'),
                      t('privacy_policy_content'),
                    );
                  }}>
                  {` ${t('privacy_policy')}`}
                </Text>
              </Text> */}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: moderateScale(32),
    fontFamily: Fonts.Sen_Bold,
    color: COLORS.white,
  },
  mainTitle: {
    fontSize: moderateScale(24),
    fontFamily: Fonts.Sen_Bold,
    color: COLORS.primaryTextDark,
    marginBottom: moderateScale(24),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Sen_Regular,
    color: COLORS.primaryTextDark,
    marginBottom: moderateScale(24),
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  containerHeader: {
    height: moderateScale(220),
    alignItems: 'center',
  },
  containerBody: {
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    flex: 1,
    padding: moderateScale(24),
    backgroundColor: '#FFFFFF',
  },
  termsText: {
    fontSize: moderateScale(12),
    color: COLORS.primaryTextDark,
    fontFamily: Fonts.Sen_Regular,
    marginTop: moderateScale(16),
    textAlign: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
  },
});

export default SignInScreen;
