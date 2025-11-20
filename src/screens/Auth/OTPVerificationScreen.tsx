import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  Image,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import Loader from '../../components/Loader';
import { getAuth, signInWithPhoneNumber } from '@react-native-firebase/auth';
import { useCommonToast } from '../../common/CommonToast';
import { COLORS } from '../../theme/theme';
import { Images } from '../../theme/Images';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import Fonts from '../../theme/fonts';
import PrimaryButton from '../../components/PrimaryButton';
import PrimaryButtonLabeled from '../../components/PrimaryButtonLabeled';
import PrimaryButtonOutlined from '../../components/PrimaryButtonOutlined';
// import {apiService, postSignIn} from '../../api/apiService';
import { useAuth } from '../../provider/AuthProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postRegisterFCMToken, postSignIn } from '../../api/apiService';
import AppConstant from '../../utils/AppContent';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import { getFirebaseAuthErrorMessage } from '../../helper/firebaseErrorHandler';
import Icon from 'react-native-vector-icons/MaterialIcons';

type OTPVerificationScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'OTPVerification' | 'AppBottomTabNavigator' | 'SignIn'
>;

type OTPVerificationScreenRouteProp = RouteProp<
  AuthStackParamList,
  'OTPVerification'
>;

interface Props {
  navigation: OTPVerificationScreenNavigationProp;
  route: OTPVerificationScreenRouteProp;
}

const OTPVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { showErrorToast, showSuccessToast } = useCommonToast();
  const { signIn } = useAuth();
  const inset = useSafeAreaInsets();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setLoading] = useState(false);
  const [otpConfirmation, setOtpConfirmation] = useState(
    route.params.confirmation,
  );
  const { phoneNumber, agree } = route.params;
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Timer state for resend OTP
  const [timer, setTimer] = useState(30);
  const [showResend, setShowResend] = useState(false);
  const [disableModalVisible, setDisableModalVisible] = useState(false);
  const [disableMessage, setDisableMessage] = useState('');

  useEffect(() => {
    setShowResend(false);
    setTimer(30);
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpConfirmation]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSignIn = async (phoneNumber: string, uid: string) => {
    setLoading(true);
    try {
      const params = {
        mobile: phoneNumber,
        firebase_uid: uid,
        role: 2,
        agree,
      };

      const response: any = await postSignIn(params);
      console.log('SignIn response :: ', response);

      if (!response) {
        showErrorToast('No response from server.');
        return;
      }

      if (response.is_register === false) {
        navigation.navigate('CompleteProfileScreen', { phoneNumber });
        return;
      }

      if (response.is_enabled === false) {
        setDisableMessage(
          response.message ||
            'Your account is pending approval. We will notify you once the administrator has verified your profile.',
        );
        setDisableModalVisible(true);
        return;
      }

      if (response?.user?.id) {
        await AsyncStorage.setItem(
          AppConstant.USER_ID,
          String(response.user.id),
        );
      }

      if (response.access_token && response.refresh_token) {
        signIn(response.access_token, response.refresh_token);
      } else {
        showErrorToast('Invalid login tokens.');
        return;
      }

      try {
        const messaging = getMessaging();
        const fcmToken = await getToken(messaging);
        if (fcmToken) await postRegisterFCMToken(fcmToken, 'pandit');
      } catch (err) {
        console.warn('FCM registration failed:', err);
      }

      navigation.navigate('AppBottomTabNavigator');
    } catch (error: any) {
      console.error('SignIn error:', error);
      showErrorToast(error?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (code: string) => {
    try {
      setLoading(true);
      const userCredential = await otpConfirmation.confirm(code);
      if (userCredential?.user) {
        await handleSignIn(phoneNumber, userCredential.user.uid);
        await AsyncStorage.setItem(
          AppConstant.FIREBASE_UID,
          userCredential.user.uid,
        );
      }
    } catch (error: any) {
      // Use firebaseErrorHandler
      const errorMsg = getFirebaseAuthErrorMessage(error);
      showErrorToast(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      showErrorToast(t('invalid_otp_length'));
      return;
    }
    await verifyOtp(otpValue);
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      const confirmation = await signInWithPhoneNumber(getAuth(), phoneNumber);
      console.log('confirmation', confirmation);
      setOtpConfirmation(confirmation);
      showSuccessToast(t('otp_resent'));
      setShowResend(false);
      setTimer(30);
      setOtp(['', '', '', '', '', '']);
      // Focus the first input after resetting OTP
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (error: any) {
      // Use firebaseErrorHandler
      const errorMsg = getFirebaseAuthErrorMessage(error);
      showErrorToast(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <View style={[styles.container, { paddingTop: inset.top }]}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <ImageBackground
          source={Images.ic_splash_background}
          style={styles.container}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            style={styles.container}
          >
            <Loader loading={isLoading} />
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={true}
              bounces={false}
              nestedScrollEnabled={true}
            >
              <View style={[styles.content]}>
                {/* Back Button */}
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                  accessibilityRole="button"
                  accessibilityLabel={t('back') || 'Back'}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="arrow-back-ios" size={28} color={COLORS.white} />
                </TouchableOpacity>
                <View style={styles.header}>
                  <Image source={Images.ic_app_logo} style={styles.logo} />
                  <Text style={styles.title}>{t('hi_welcome')}</Text>
                </View>
                <View style={[styles.body, { paddingBottom: inset.bottom }]}>
                  <Text style={styles.mainTitle}>{t('otp_verification')}</Text>
                  <Text style={styles.subtitle}>
                    {t('enter_6_digit_the_verification_code')}
                  </Text>
                  <Text style={styles.phoneNumber}>{phoneNumber}</Text>
                  <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={ref => {
                          inputRefs.current[index] = ref;
                        }}
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
                  <PrimaryButton
                    onPress={handleVerification}
                    title={t('verify')}
                  />
                  {!showResend ? (
                    <View style={styles.resendContainer}>
                      <Text style={styles.resendText}>00:{timer}</Text>
                    </View>
                  ) : (
                    <View style={styles.resendContainer}>
                      <Text style={styles.resendText}>
                        {t('didnt_receive_the_code')}
                      </Text>
                      <PrimaryButtonLabeled
                        onPress={handleResendOTP}
                        title={t('resend_otp')}
                      />
                    </View>
                  )}
                  <PrimaryButtonOutlined
                    onPress={() =>
                      navigation.replace('SignIn', {
                        previousPhoneNumber: phoneNumber,
                      })
                    }
                    title={t('change_mobile_number')}
                  />
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </ImageBackground>
      </View>
      {disableModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{t('pending_approval')}</Text>
            <Text style={styles.modalMessage}>{disableMessage}</Text>
            <TouchableOpacity
              style={styles.okButton}
              onPress={() => {
                setDisableModalVisible(false);
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'SignIn' }],
                });
              }}
            >
              <Text style={styles.okButtonText}>{t('ok')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  content: {
    flex: 1,
    position: 'relative',
    minHeight: '100%',
  },
  header: {
    height: moderateScale(220),
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  backButton: {
    position: 'absolute',
    top: moderateScale(12),
    left: moderateScale(12),
    zIndex: 10,
    backgroundColor: 'transparent',
    padding: moderateScale(10),
  },
  body: {
    flex: 1,
    padding: moderateScale(24),
    paddingTop: moderateScale(32),
    backgroundColor: COLORS.white,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    minHeight: 'auto',
  },
  logo: {
    width: '33%',
    resizeMode: 'contain',
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
    textAlign: 'center',
    marginBottom: moderateScale(24),
  },
  subtitle: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Sen_Regular,
    color: COLORS.primaryTextDark,
    textAlign: 'center',
    marginBottom: moderateScale(24),
  },
  phoneNumber: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.primaryTextDark,
    textAlign: 'center',
    marginBottom: moderateScale(24),
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: moderateScale(10),
  },
  otpInput: {
    width: moderateScale(45),
    height: moderateScale(45),
    borderWidth: 1,
    borderColor: COLORS.primaryBackgroundButton,
    borderRadius: moderateScale(8),
    marginHorizontal: moderateScale(5),
    textAlign: 'center',
    fontSize: moderateScale(20),
    fontFamily: Fonts.Sen_Regular,
    color: COLORS.primaryTextDark,
    backgroundColor: COLORS.lightGray,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: moderateScale(16),
    marginBottom: moderateScale(24),
  },
  resendText: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Sen_Regular,
    color: COLORS.primaryTextDark,
    marginRight: moderateScale(5),
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modalBox: {
    width: '80%',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(10),
    padding: moderateScale(20),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Sen_SemiBold,
    color: COLORS.primaryTextDark,
    marginBottom: moderateScale(10),
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_Regular,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: moderateScale(20),
  },
  okButton: {
    backgroundColor: COLORS.primary,
    borderRadius: moderateScale(8),
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(25),
  },
  okButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_SemiBold,
  },
});

export default OTPVerificationScreen;
