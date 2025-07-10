import React, {useState, useTransition} from 'react';
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
  Image,
  ImageBackground,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../../navigation/AuthNavigator';
import ThemedInput from '../../components/ThemedInput';
import {
  getAuth,
  onAuthStateChanged,
  signInWithPhoneNumber,
} from '@react-native-firebase/auth';
import {validatePhoneNumber} from '../../helper/Validation';
import Loader from '../../components/Loader';
import {moderateScale} from 'react-native-size-matters';
import {useCommonToast} from '../../common/CommonToast';
import {COLORS} from '../../theme/theme';
// import PrimaryButton from '../components/PrimaryButton';
// import {Images} from '../theme/Images';
import Fonts from '../../theme/fonts';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import PrimaryButton from '../../components/PrimaryButton';
import {Images} from '../../theme/Images';
// import { firebaseAuth } from '../../App';
type SignInScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'SignIn'
>;

interface Props {
  navigation: SignInScreenNavigationProp;
}

const SignInScreen: React.FC<Props> = ({navigation}) => {
  const {t, i18n} = useTranslation();
  const inset = useSafeAreaInsets();
  const {showErrorToast, showSuccessToast} = useCommonToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleSignIn = async () => {
    console.log('---1');
    const cleanPhoneNumber = phoneNumber.trim().replace(/\s+/g, '');
    console.log('---2');
    if (!cleanPhoneNumber) {
      const newErrors: any = {};
      newErrors.phoneNumber = 'Please enter your phone number.';
      setErrors(newErrors);
      return;
    }
    console.log('---3');
    // Ensure it has +country code
    const formattedPhone = cleanPhoneNumber.startsWith('+')
      ? cleanPhoneNumber
      : `+91${cleanPhoneNumber}`;
    console.log('---4');
    if (!validatePhoneNumber(formattedPhone)) {
      // Alert.alert('Validation Error', 'Please enter a valid phone number in international format.');
      const newErrors: any = {};
      newErrors.phoneNumber =
        'Please enter a valid phone number in international format.';
      setErrors(newErrors);
      return;
    }

    setErrors({});
    console.log('---5-new');
    try {
      // const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
      setLoading(true);
      const confirmation = await signInWithPhoneNumber(
        getAuth(),
        formattedPhone,
      );
      setLoading(false);
      // Alert.alert('Success', 'OTP has been sent to your phone.');
      showSuccessToast('OTP has been sent to your phone.');
      // console.log('---6 : ',confirmation)
      navigation.navigate('OTPVerification', {
        phoneNumber: formattedPhone,
        confirmation,
      });
      console.log('---7');
    } catch (error: any) {
      console.log('---8');
      console.error(error);
      setLoading(false);
      // Alert.alert('Error', error?.message || 'Failed to send OTP. Please try again.');
      showErrorToast(error?.message || 'Failed to send OTP. Please try again.');
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
                style={{width: '33%', resizeMode: 'contain'}}></Image>
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
                onChangeText={setPhoneNumber}
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
    // padding: 20,
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
    // justifyContent: 'center',
  },
  containerBody: {
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    flex: 1,
    padding: moderateScale(24),
    // justifyContent: 'center',
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
