import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../components/CustomHeader';
import {COLORS} from '../theme/theme';
import CustomTextInput from '../components/CustomTextInput';
import PrimaryButton from '../components/PrimaryButton';
import Fonts from '../theme/fonts';
import {moderateScale} from 'react-native-size-matters';
import {casteOptions} from '../helper/helper';
import CustomDropdown from '../components/CustomDropdown';
import {useTranslation} from 'react-i18next';

interface FormData {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  city: string;
  caste: string;
  subCaste: string;
  gotra: string;
  address: string;
}

const CompleteProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRefs = useRef<{[key: string]: TextInput | null}>({});

  const {t} = useTranslation();

  const [formData, setFormData] = useState<FormData>({
    phoneNumber: '',
    firstName: '',
    lastName: '',
    city: '',
    caste: '',
    subCaste: '',
    gotra: '',
    address: '',
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    const requiredFields = ['phoneNumber', 'firstName', 'lastName', 'caste'];
    const missingFields = requiredFields.filter(
      field => !formData[field as keyof FormData],
    );

    if (missingFields.length > 0) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    console.log('Form data:', formData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primaryBackground}
      />
      <CustomHeader title={t('complete_your_profile')} showBackButton={true} />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <CustomTextInput
              label={t('phone_number')}
              value={formData.phoneNumber}
              onChangeText={value => handleInputChange('phoneNumber', value)}
              placeholder={t('enter_phone_number')}
            />
            <CustomTextInput
              label={t('first_name')}
              value={formData.firstName}
              onChangeText={value => handleInputChange('firstName', value)}
              placeholder={t('enter_first_name')}
            />
            <CustomTextInput
              label={t('last_name')}
              value={formData.lastName}
              onChangeText={value => handleInputChange('lastName', value)}
              placeholder={t('enter_last_name')}
            />
            <CustomDropdown
              label={t('city')}
              items={casteOptions}
              selectedValue={formData.city}
              onSelect={value => handleInputChange('city', value)}
              placeholder={t('select_your_city')}
            />
            <CustomDropdown
              label={t('caste')}
              items={casteOptions}
              selectedValue={formData.caste}
              onSelect={value => handleInputChange('caste', value)}
              placeholder={t('select_your_caste')}
            />
            <CustomDropdown
              label={t('sub_caste')}
              items={casteOptions}
              selectedValue={formData.subCaste}
              onSelect={value => handleInputChange('subCaste', value)}
              placeholder={t('select_your_sub_caste')}
            />
            <CustomDropdown
              label={t('gotra')}
              items={casteOptions}
              selectedValue={formData.gotra}
              onSelect={value => handleInputChange('gotra', value)}
              placeholder={t('select_your_gotra')}
            />
            <CustomTextInput
              label={t('address')}
              value={formData.address}
              onChangeText={value => handleInputChange('address', value)}
              placeholder={t('enter_address')}
            />
          </View>
          <View style={styles.textcontainer}>
            <Text style={styles.text}>{t('address_desc')}</Text>
          </View>
          <PrimaryButton
            title={t('next')}
            onPress={handleNext}
            style={styles.buttonContainer}
            textStyle={styles.buttonText}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  formContainer: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: 24,
    gap: 16,
  },
  textcontainer: {
    marginHorizontal: 20,
    paddingVertical: 10,
    marginTop: -20,
  },
  text: {
    fontFamily: Fonts.Sen_Regular,
    fontSize: 14,
    color: COLORS.lighttext,
  },
  buttonContainer: {
    height: 46,
    marginHorizontal: moderateScale(16),
  },
  buttonText: {
    fontSize: 15,
    fontFamily: Fonts.Sen_Medium,
  },
});

export default CompleteProfileScreen;
