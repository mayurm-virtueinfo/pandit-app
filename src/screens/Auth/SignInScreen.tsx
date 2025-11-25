import React, { useState, useCallback, useEffect, useRef } from 'react';

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
  Modal,
  StatusBar,
  useColorScheme,
  Keyboard,
} from 'react-native';

import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import ThemedInput from '../../components/ThemedInput';
import { getAuth, signInWithPhoneNumber } from '@react-native-firebase/auth';
import { moderateScale } from 'react-native-size-matters';
import { useCommonToast } from '../../common/CommonToast';
import { COLORS } from '../../theme/theme';
import Fonts from '../../theme/fonts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Picker } from '@react-native-picker/picker';
import i18n, {
  getSavedLanguage,
  setAppLanguage,
  getCurrentLanguage,
} from '../../i18n';
import PrimaryButton from '../../components/PrimaryButton';
import { Images } from '../../theme/Images';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  getTermsConditions,
  getUserAgreement,
  getRefundPolicy,
} from '../../api/apiService';
import CountrySelect, { ICountry } from 'react-native-country-select';
import CustomTextInput from '../../components/CustomTextInput';
// Import Firebase error handler
import { getFirebaseAuthErrorMessage } from '../../helper/firebaseErrorHandler';
import Config from 'react-native-config';
import CustomeLoader from '../../components/CustomLoader';

// Fallback mapping for country calling codes (complete list)
const COUNTRY_CALLING_CODES: { [key: string]: string } = {
  // ... same mapping as before ...
  AF: '+93',
  AL: '+355',
  DZ: '+213',
  AS: '+1',
  AD: '+376',
  AO: '+244',
  AI: '+1',
  AQ: '+672',
  AG: '+1',
  AR: '+54',
  AM: '+374',
  AW: '+297',
  AU: '+61',
  AT: '+43',
  AZ: '+994',
  BS: '+1',
  BH: '+973',
  BD: '+880',
  BB: '+1',
  BY: '+375',
  BE: '+32',
  BZ: '+501',
  BJ: '+229',
  BM: '+1',
  BT: '+975',
  BO: '+591',
  BA: '+387',
  BW: '+267',
  BR: '+55',
  IO: '+246',
  VG: '+1',
  BN: '+673',
  BG: '+359',
  BF: '+226',
  BI: '+257',
  KH: '+855',
  CM: '+237',
  CA: '+1',
  CV: '+238',
  KY: '+1',
  CF: '+236',
  TD: '+235',
  CL: '+56',
  CN: '+86',
  CX: '+61',
  CC: '+61',
  CO: '+57',
  KM: '+269',
  CG: '+242',
  CD: '+243',
  CK: '+682',
  CR: '+506',
  CI: '+225',
  HR: '+385',
  CU: '+53',
  CW: '+599',
  CY: '+357',
  CZ: '+420',
  DK: '+45',
  DJ: '+253',
  DM: '+1',
  DO: '+1',
  EC: '+593',
  EG: '+20',
  SV: '+503',
  GQ: '+240',
  ER: '+291',
  EE: '+372',
  SZ: '+268',
  ET: '+251',
  FK: '+500',
  FO: '+298',
  FJ: '+679',
  FI: '+358',
  FR: '+33',
  GF: '+594',
  PF: '+689',
  GA: '+241',
  GM: '+220',
  GE: '+995',
  DE: '+49',
  GH: '+233',
  GI: '+350',
  GR: '+30',
  GL: '+299',
  GD: '+1',
  GP: '+590',
  GU: '+1',
  GT: '+502',
  GG: '+44',
  GN: '+224',
  GW: '+245',
  GY: '+592',
  HT: '+509',
  HN: '+504',
  HK: '+852',
  HU: '+36',
  IS: '+354',
  IN: '+91',
  ID: '+62',
  IR: '+98',
  IQ: '+964',
  IE: '+353',
  IM: '+44',
  IL: '+972',
  IT: '+39',
  JM: '+1',
  JP: '+81',
  JE: '+44',
  JO: '+962',
  KZ: '+7',
  KE: '+254',
  KI: '+686',
  KP: '+850',
  KR: '+82',
  KW: '+965',
  KG: '+996',
  LA: '+856',
  LV: '+371',
  LB: '+961',
  LS: '+266',
  LR: '+231',
  LY: '+218',
  LI: '+423',
  LT: '+370',
  LU: '+352',
  MO: '+853',
  MG: '+261',
  MW: '+265',
  MY: '+60',
  MV: '+960',
  ML: '+223',
  MT: '+356',
  MH: '+692',
  MQ: '+596',
  MR: '+222',
  MU: '+230',
  YT: '+262',

  MX: '+52',
  FM: '+691',
  MD: '+373',
  MC: '+377',
  MN: '+976',
  ME: '+382',

  MS: '+1',
  MA: '+212',
  MZ: '+258',
  MM: '+95',
  NA: '+264',
  NR: '+674',

  NP: '+977',
  NL: '+31',
  NC: '+687',
  NZ: '+64',
  NI: '+505',
  NE: '+227',

  NG: '+234',
  NU: '+683',
  NF: '+672',
  MK: '+389',
  MP: '+1',
  NO: '+47',

  OM: '+968',
  PK: '+92',
  PW: '+680',
  PS: '+970',
  PA: '+507',
  PG: '+675',

  PY: '+595',
  PE: '+51',
  PH: '+63',
  PN: '+64',
  PL: '+48',
  PT: '+351',

  PR: '+1',
  QA: '+974',
  RE: '+262',
  RO: '+40',
  RU: '+7',
  RW: '+250',

  BL: '+590',
  SH: '+290',
  KN: '+1',
  LC: '+1',
  MF: '+590',
  PM: '+508',

  VC: '+1',
  WS: '+685',
  SM: '+378',
  ST: '+239',
  SA: '+966',
  SN: '+221',

  RS: '+381',
  SC: '+248',
  SL: '+232',
  SG: '+65',
  SX: '+1',
  SK: '+421',

  SI: '+386',
  SB: '+677',
  SO: '+252',
  ZA: '+27',
  GS: '+500',
  SS: '+211',

  ES: '+34',
  LK: '+94',
  SD: '+249',
  SR: '+597',
  SJ: '+47',
  SE: '+46',

  CH: '+41',
  SY: '+963',
  TW: '+886',
  TJ: '+992',
  TZ: '+255',
  TH: '+66',

  TL: '+670',
  TG: '+228',
  TK: '+690',
  TO: '+676',
  TT: '+1',
  TN: '+216',

  TR: '+90',
  TM: '+993',
  TC: '+1',
  TV: '+688',
  UG: '+256',
  UA: '+380',

  AE: '+971',
  GB: '+44',
  US: '+1',
  UM: '+1',
  UY: '+598',
  UZ: '+998',

  VU: '+678',
  VA: '+39',
  VE: '+58',
  VN: '+84',
  VI: '+1',
  WF: '+681',

  EH: '+212',
  YE: '+967',
  ZM: '+260',
  ZW: '+263',
  AX: '+358',
};

type SignInScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'SignIn'
>;

interface Props {
  navigation: SignInScreenNavigationProp;
  route: any;
}

const DEFAULT_COUNTRY_ISO = 'IN';

const SignInScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const inset = useSafeAreaInsets();
  const { showErrorToast, showSuccessToast } = useCommonToast();
  const [phoneNumber, setPhoneNumber] = useState(__DEV__ ? '7777777777' : '');
  const [isLoading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ phoneNumber?: string }>({});
  const [previousPhoneNumber, setPreviousPhoneNumber] = useState<string>('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<any>({
    name: { common: 'India' },
    flag: '🇮🇳',
    callingCode: '+91',
    cca2: 'IN',
  });
  const [showLangModal, setShowLangModal] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string>(
    getCurrentLanguage(),
  );
  const colorScheme = useColorScheme();
  const pickerTextColor =
    colorScheme === 'dark' ? COLORS.primaryTextDark : COLORS.primaryTextDark;

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    getSavedLanguage().then(saved => {
      if (!saved) {
        setShowLangModal(true);
      } else {
        setSelectedLang(saved);
      }
    });
  }, []);

  const [termsContent, setTermsContent] = useState<string>('');
  const [userAgreementContent, setUserAgreementContent] = useState<string>('');
  const [refundPolicyContent, setRefundPolicyContent] = useState<string>('');

  useFocusEffect(
    useCallback(() => {
      setErrors({});
      setLoading(false);
      if (route.params?.previousPhoneNumber) {
        setPreviousPhoneNumber(route.params.previousPhoneNumber);
      }
      getTermsConditions()
        .then(data => setTermsContent(data || ''))
        .catch(() => setTermsContent(''));
      getUserAgreement()
        .then(data => setUserAgreementContent(data || ''))
        .catch(() => setUserAgreementContent(''));
      getRefundPolicy()
        .then(data => setRefundPolicyContent(data || ''))
        .catch(() => setRefundPolicyContent(''));
    }, [route.params?.previousPhoneNumber]),
  );

  const validateInput = (input: string) => {
    const trimmed = input.trim().replace(/\s+/g, '');
    if (!trimmed) {
      return t('enter_mobile_number');
    }
    // Allow variable length based on country
    const minLength = selectedCountry?.cca2 === 'US' ? 10 : 10; // Customize per country
    if (trimmed.length < minLength) {
      return (
        t('Please_enter_valid_number') || 'Please enter a valid mobile number'
      );
    }
    if (!/^[0-9]+$/.test(trimmed)) {
      return (
        t('Please_enter_valid_number') || 'Please enter a valid mobile number'
      );
    }
    return '';
  };

  // --- UPDATED handleSignIn to resolve OTP screen blinking when keyboard is open ---

  const handleSignIn = async () => {
    // Fix start: dismiss keyboard and scroll to top to avoid blinking in OTP screen
    Keyboard.dismiss();

    // Optionally scroll the ScrollView to the top so transition is smooth
    if (scrollViewRef.current) {
      // Scroll without animation to avoid flickering
      // setTimeout to ensure keyboard fully dismissed
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
      }, 80);
    }
    // Fix end

    const errorMsg = validateInput(phoneNumber);
    if (errorMsg) {
      setErrors({ phoneNumber: errorMsg });
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
    const dialCode = selectedCountry?.callingCode || '+91';
    const formattedPhone = `${dialCode}${phoneNumber
      .trim()
      .replace(/\s+/g, '')}`;

    if (previousPhoneNumber && formattedPhone === previousPhoneNumber) {
      Alert.alert(t('same_number_detected'), t('same_number_message'), [
        {
          text: t('enter_different_number'),
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
      ]);
      return;
    }
    const phoneRegex = new RegExp(
      `^\\${dialCode}[0-9]\\d{${dialCode === '+1' ? 9 : 9}}$`,
    );
    if (!phoneRegex.test(formattedPhone)) {
      const errorText =
        t('Please_enter_valid_number') || 'Please enter a valid mobile number';
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
      // Use Firebase error handler for proper error message
      const errorMessage =
        getFirebaseAuthErrorMessage(error) ||
        t('otp_send_failed') ||
        'Failed to send OTP. Please try again.';
      showErrorToast(errorMessage);
    }
  };

  const handleContinueAsGuest = async () => {
    // navigation.replace('PanditjiGuestScreen');
  };

  const handlePhoneChange = (text: string) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 10) cleaned = cleaned.slice(0, 10);
    setPhoneNumber(cleaned);
    if (errors.phoneNumber) {
      setErrors({});
    }
  };

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

  const handleOpenLanguageModal = () => {
    setShowLangModal(true);
  };

  const handleChangeLanguage = async () => {
    await setAppLanguage(selectedLang);
    setShowLangModal(false);
  };

  const getIosPickerItemStyle = () => ({
    color: pickerTextColor,
    fontSize: moderateScale(16),
    fontFamily: Fonts.Sen_Regular,
    backgroundColor: colorScheme === 'dark' ? COLORS.white : COLORS.white,
  });

  return (
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
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}
        >
          <CustomeLoader loading={isLoading} />
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.content]}>
              <View style={styles.containerHeader}>
                <Image
                  source={Images.ic_app_logo}
                  style={{ resizeMode: 'contain' }}
                />
                <Text style={styles.title}>{t('hi_welcome')}</Text>
                <TouchableOpacity
                  style={styles.languageButton}
                  onPress={handleOpenLanguageModal}
                  accessibilityLabel="Change language"
                  activeOpacity={0.7}
                >
                  <Icon
                    name="language"
                    size={moderateScale(24)}
                    color={COLORS.white}
                  />
                  <Text style={styles.languageButtonText}>
                    {(() => {
                      switch (selectedLang) {
                        case 'en':
                          return 'English';
                        case 'hi':
                          return 'हिन्दी';
                        case 'gu':
                          return 'ગુજરાતી';
                        case 'mr':
                          return 'मराठी';
                        default:
                          return 'Language';
                      }
                    })()}
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.containerBody,
                  {
                    paddingBottom: Math.max(inset.bottom, 20) + 30,
                  },
                ]}
              >
                <Text
                  style={styles.mainTitle}
                  onPress={() => {
                    showSuccessToast(`${Config.BASE_URL}`);
                    console.log(`${Config.BASE_URL}`);
                  }}
                >
                  {t('sign_in')}
                </Text>
                <Text style={styles.subtitle}>
                  {t('please_enter_your_credential')}
                </Text>

                <View style={styles.phoneInputGroup}>
                  <TouchableOpacity
                    style={styles.countryCodeButton}
                    onPress={() => setCountryModalVisible(true)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Select country code"
                  >
                    <Text style={styles.flagText}>
                      {selectedCountry?.flag || '🇮🇳'}
                    </Text>
                    <Text style={styles.dialCodeText}>
                      {selectedCountry?.callingCode || '+91'}
                    </Text>
                    <Icon
                      name="arrow-drop-down"
                      color={COLORS.primaryTextDark}
                      size={18}
                    />
                  </TouchableOpacity>
                  <CustomTextInput
                    label=""
                    value={phoneNumber}
                    onChangeText={handlePhoneChange}
                    placeholder={t('enter_mobile_number')}
                    keyboardType="phone-pad"
                    error={errors?.phoneNumber}
                    style={{ width: '65%' }}
                  />
                </View>

                <CountrySelect
                  visible={countryModalVisible}
                  onClose={() => setCountryModalVisible(false)}
                  onSelect={(country: any) => {
                    console.log('Selected country:', country);
                    const correctCallingCode =
                      COUNTRY_CALLING_CODES[country.cca2] ||
                      (Array.isArray(country.callingCode)
                        ? country.callingCode[0]
                        : country.callingCode || country.dialCode || '+91');
                    setSelectedCountry({
                      name: country.name || {
                        common: country.name || 'Unknown',
                      },
                      flag: country.flag,
                      callingCode: correctCallingCode,
                      cca2: country.cca2 || 'IN',
                    });
                    setCountryModalVisible(false);
                  }}
                  initialCountry={selectedCountry?.cca2 || DEFAULT_COUNTRY_ISO}
                />

                <View style={styles.termsRow}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setIsAgreed(!isAgreed)}
                    activeOpacity={0.7}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isAgreed }}
                    accessibilityLabel="Agree to terms"
                  >
                    <View
                      style={[
                        styles.checkbox,
                        isAgreed && styles.checkboxChecked,
                      ]}
                    >
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
                      onPress={() => handleOpenPolicy('terms')}
                    >
                      {t('terms_and_conditions') || 'Terms & Conditions'}
                    </Text>
                    {', '}
                    <Text
                      style={styles.termsLink}
                      onPress={() => handleOpenPolicy('user')}
                    >
                      {t('user_agreement') || 'User Agreement'}
                    </Text>
                    {' & '}
                    <Text
                      style={styles.termsLink}
                      onPress={() => handleOpenPolicy('refund')}
                    >
                      {t('refund_policy') || 'Refund Policy'}
                    </Text>
                  </Text>
                </View>

                <PrimaryButton
                  onPress={handleSignIn}
                  title={t('send_otp')}
                  disabled={!isAgreed}
                  // style={{ marginBottom: 20 }}
                />
                {/* {Platform.OS === 'ios' && (
                  <PrimaryButton
                    onPress={handleContinueAsGuest}
                    title={t('continue_as_guest')}
                    style={{ marginBottom: 20 }}
                  />
                )} */}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <Modal
          visible={showLangModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowLangModal(false)}
        >
          <View style={styles.langModalOverlay}>
            <View style={styles.langModalCard}>
              <Text style={styles.langModalTitle}>
                {t('language') || 'Language'}
              </Text>
              <View style={styles.langPickerContainer}>
                <Picker
                  selectedValue={selectedLang}
                  onValueChange={v => setSelectedLang(v)}
                  mode="dropdown"
                  style={[
                    styles.langPicker,
                    Platform.OS === 'ios' && { color: pickerTextColor },
                  ]}
                  itemStyle={
                    Platform.OS === 'ios' ? getIosPickerItemStyle() : undefined
                  }
                >
                  <Picker.Item
                    label="English"
                    value="en"
                    color={Platform.OS === 'ios' ? undefined : pickerTextColor}
                    style={
                      colorScheme === 'dark'
                        ? { backgroundColor: COLORS.white }
                        : undefined
                    }
                  />
                  <Picker.Item
                    label="हिन्दी"
                    value="hi"
                    color={Platform.OS === 'ios' ? undefined : pickerTextColor}
                    style={
                      colorScheme === 'dark'
                        ? { backgroundColor: COLORS.white }
                        : undefined
                    }
                  />
                  <Picker.Item
                    label="ગુજરાતી"
                    value="gu"
                    color={Platform.OS === 'ios' ? undefined : pickerTextColor}
                    style={
                      colorScheme === 'dark'
                        ? { backgroundColor: COLORS.white }
                        : undefined
                    }
                  />
                  <Picker.Item
                    label="मराठी"
                    value="mr"
                    color={Platform.OS === 'ios' ? undefined : pickerTextColor}
                    style={
                      colorScheme === 'dark'
                        ? { backgroundColor: COLORS.white }
                        : undefined
                    }
                  />
                </Picker>
              </View>
              <View style={{ height: 12 }} />
              <PrimaryButton
                title={t('continue') || 'Continue'}
                onPress={handleChangeLanguage}
              />
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
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
  phoneInputGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    // marginBottom: moderateScale(18),
    // marginTop: moderateScale(24),
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(8),
    marginRight: moderateScale(10),
    backgroundColor: '#f7f7f7',
    minWidth: 70,
  },
  flagText: {
    fontSize: moderateScale(20),
    marginRight: moderateScale(4),
  },
  dialCodeText: {
    fontSize: moderateScale(16),
    color: COLORS.primaryTextDark,
    fontFamily: Fonts.Sen_Bold,
    marginRight: 2,
  },
  phoneInputField: {
    flex: 1,
  },
  countryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(24),
  },
  countryModalCard: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: moderateScale(8),
  },
  containerHeader: {
    height: moderateScale(220),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
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
  langModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(24),
  },
  langModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
  },
  langModalTitle: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Sen_Bold,
    color: COLORS.primaryTextDark,
    marginBottom: moderateScale(12),
    textAlign: 'center',
  },
  langPickerContainer: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    overflow: 'hidden',
  },
  langPicker: {
    width: '100%',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: moderateScale(16),
    top: moderateScale(16),
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
  },
  languageButtonText: {
    color: COLORS.white,
    fontFamily: Fonts.Sen_Bold,
    fontSize: moderateScale(14),
    marginLeft: moderateScale(6),
  },
});

export default SignInScreen;
