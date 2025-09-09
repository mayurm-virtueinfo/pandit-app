import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ImageBackground,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../../navigation/AuthNavigator';
import ThemedInput from '../../components/ThemedInput';
import {getAuth, signInWithPhoneNumber} from '@react-native-firebase/auth';
import Loader from '../../components/Loader';
import {moderateScale} from 'react-native-size-matters';
import {useCommonToast} from '../../common/CommonToast';
import {COLORS} from '../../theme/theme';
import Fonts from '../../theme/fonts';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import PrimaryButton from '../../components/PrimaryButton';
import {Images} from '../../theme/Images';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  getTermsConditions,
  getUserAgreement,
  getRefundPolicy,
} from '../../api/apiService';

type SignInScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'SignIn'
>;

interface Props {
  navigation: SignInScreenNavigationProp;
  route: any;
}

const SignInScreen: React.FC<Props> = ({navigation, route}) => {
  const {t} = useTranslation();
  const inset = useSafeAreaInsets();
  const {showErrorToast, showSuccessToast} = useCommonToast();
  const [phoneNumber, setPhoneNumber] = useState('1111111111');
  const [isLoading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{phoneNumber?: string}>({});
  const [previousPhoneNumber, setPreviousPhoneNumber] = useState<string>('');
  const [isAgreed, setIsAgreed] = useState(false);

  // State for policy contents and titles
  const [termsContent, setTermsContent] = useState<string>('');
  const [userAgreementContent, setUserAgreementContent] = useState<string>('');
  const [refundPolicyContent, setRefundPolicyContent] = useState<string>('');

  // Fetch policy contents on mount
  useFocusEffect(
    useCallback(() => {
      // Reset state
      setErrors({});
      setLoading(false);

      if (route.params?.previousPhoneNumber) {
        setPreviousPhoneNumber(route.params.previousPhoneNumber);
      }

      // Fetch Terms & Conditions
      getTermsConditions()
        .then(data => {
          setTermsContent(data || '');
        })
        .catch(() => {
          setTermsContent('');
        });

      // Fetch User Agreement
      getUserAgreement()
        .then(data => {
          setUserAgreementContent(data || '');
        })
        .catch(() => {
          setUserAgreementContent('');
        });

      // Fetch Refund Policy
      getRefundPolicy()
        .then(data => {
          setRefundPolicyContent(data || '');
        })
        .catch(() => {
          setRefundPolicyContent('');
        });
    }, []),
  );

  // Improved validation: Only allow 10 digit numbers, no letters, no special chars, must start with 6-9
  // Also, do not show error if exactly 10 digits and starts with 6-9
  const validateInput = (input: string) => {
    const trimmed = input.trim().replace(/\s+/g, '');
    if (!trimmed) {
      return t('enter_mobile_number');
    }
    // Only check length first
    if (trimmed.length !== 10) {
      return (
        t('Please_enter_valid_number') ||
        'Please enter a valid 10-digit mobile number'
      );
    }
    // Only check pattern if length is exactly 10
    if (trimmed.length === 10 && !/^[0-9]\d{9}$/.test(trimmed)) {
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

    if (!isAgreed) {
      showErrorToast(
        t('please_agree_terms') ||
          'Please agree to the Terms & Conditions, User Agreement, and Refund Policy.',
      );
      return;
    }

    setErrors({});
    const formattedPhone = `+91${phoneNumber.trim().replace(/\s+/g, '')}`;

    if (previousPhoneNumber && formattedPhone === previousPhoneNumber) {
      Alert.alert(
        'Same Number Detected',
        'You entered the same phone number. What would you like to do?',
        [
          {
            text: 'Enter Different Number',
            onPress: () => {
              setPhoneNumber('');
              setPreviousPhoneNumber('');
            },
            style: 'default',
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
      );
      return;
    }
    if (!/^\+91[0-9]\d{9}$/.test(formattedPhone)) {
      const errorText =
        t('Please_enter_valid_number') ||
        'Please enter a valid 10-digit mobile number';
      setErrors({
        phoneNumber: errorText,
      });
      showErrorToast(errorText);
      return;
    }
    const auth = getAuth();
    try {
      setLoading(true);
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone);
      setLoading(false);
      showSuccessToast(t('otp_sent') || 'OTP has been sent to your phone.');
      navigation.navigate('OTPVerification', {
        phoneNumber: formattedPhone,
        confirmation,
        agree: true,
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

  // Handler for opening policy in TermsPolicy screen and passing html content
  const handleOpenPolicy = (type: 'terms' | 'user' | 'refund') => {
    let title = '';
    let htmlContent = '';
    if (type === 'terms') {
      title = t('terms_and_conditions') || 'Terms & Conditions';
      htmlContent =
        termsContent ||
        t('terms_and_conditions_content') ||
        'Here are the Terms & Conditions...';
    } else if (type === 'user') {
      title = t('user_agreement') || 'User Agreement';
      htmlContent =
        userAgreementContent ||
        t('user_agreement_content') ||
        'Here is the User Agreement...';
    } else if (type === 'refund') {
      title = t('refund_policy') || 'Refund Policy';
      htmlContent =
        refundPolicyContent ||
        t('refund_policy_content') ||
        'Here is the Refund Policy...';
    }

    navigation.navigate('TermsPolicyScreen', {
      title,
      htmlContent,
    });
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

              {/* Terms and Conditions, User Agreement, Refund Policy with checkbox */}
              <View style={styles.termsRow}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setIsAgreed(!isAgreed)}
                  activeOpacity={0.7}
                  accessibilityRole="checkbox"
                  accessibilityState={{checked: isAgreed}}
                  accessibilityLabel="Agree to terms">
                  <View
                    style={[
                      styles.checkbox,
                      isAgreed && styles.checkboxChecked,
                    ]}>
                    {isAgreed && (
                      <Icon
                        name="check"
                        size={moderateScale(16)}
                        color="#fff"
                        style={styles.checkboxIcon}
                      />
                    )}
                  </View>
                </TouchableOpacity>
                <Text style={styles.termsText}>
                  {t('i_agree_to') || 'I agree to the '}
                  <Text
                    style={styles.termsLink}
                    onPress={() => handleOpenPolicy('terms')}>
                    {t('terms_and_conditions') || 'Terms & Conditions'}
                  </Text>
                  {', '}
                  <Text
                    style={styles.termsLink}
                    onPress={() => handleOpenPolicy('user')}>
                    {t('user_agreement') || 'User Agreement'}
                  </Text>
                  {' & '}
                  <Text
                    style={styles.termsLink}
                    onPress={() => handleOpenPolicy('refund')}>
                    {t('refund_policy') || 'Refund Policy'}
                  </Text>
                </Text>
              </View>

              <PrimaryButton
                onPress={handleSignIn}
                title={t('send_otp')}
                disabled={!isAgreed}
              />
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(16),
    marginBottom: moderateScale(16),
    flexWrap: 'wrap',
  },
  checkboxContainer: {
    marginRight: moderateScale(8),
    padding: moderateScale(4),
  },
  checkbox: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderWidth: 1,
    borderColor: COLORS.primaryBackgroundButton,
    borderRadius: 4,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primaryBackgroundButton,
    borderColor: COLORS.primaryBackgroundButton,
  },
  // Add icon centering for check icon
  checkboxIcon: {
    alignSelf: 'center',
  },
  checkboxTick: {
    width: moderateScale(10),
    height: moderateScale(10),
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  termsText: {
    fontSize: moderateScale(12),
    color: COLORS.primaryTextDark,
    fontFamily: Fonts.Sen_Regular,
    textAlign: 'left',
    flex: 1,
    flexWrap: 'wrap',
  },
  termsLink: {
    color: COLORS.primaryBackgroundButton,
    fontFamily: Fonts.Sen_Bold,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
  },
});

export default SignInScreen;
