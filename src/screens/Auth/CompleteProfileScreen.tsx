import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import CustomHeader from '../../components/CustomHeader';
import {COLORS} from '../../theme/theme';
import CustomTextInput from '../../components/CustomTextInput';
import PrimaryButton from '../../components/PrimaryButton';
import Fonts from '../../theme/fonts';
import {moderateScale} from 'react-native-size-matters';
import CustomDropdown from '../../components/CustomDropdown';
import {useTranslation} from 'react-i18next';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {getCaste, getCity, getGotra, getSubCaste} from '../../api/apiService';
import {DropdownResponse} from './type';
import CustomeLoader from '../../components/CustomLoader';
import {useCommonToast} from '../../common/CommonToast';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../../navigation/AuthNavigator';

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

type ScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'CompleteProfileScreen'
>;

const CompleteProfileScreen: React.FC = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const inset = useSafeAreaInsets();
  const {t} = useTranslation();
  const {showErrorToast} = useCommonToast();

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
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [cityData, setCityData] = useState<any[]>([]);
  const [casteData, setCasteData] = useState<any[]>([]);
  const [subCasteData, setSubCasteData] = useState<any[]>([]);
  const [gotraData, setGotraData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCityData();
    fetchCasteData();
  }, []);

  useEffect(() => {
    if (formData.caste) {
      fetchSubCasteData(formData.caste);
      setFormData(prev => ({...prev, subCaste: '', gotra: ''}));
      setErrors(prev => ({...prev, subCaste: '', gotra: ''}));
    } else {
      setSubCasteData([]);
      setGotraData([]);
      setFormData(prev => ({...prev, subCaste: '', gotra: ''}));
      setErrors(prev => ({...prev, subCaste: '', gotra: ''}));
    }
  }, [formData.caste]);

  useEffect(() => {
    if (formData.subCaste) {
      fetchGotraData(formData.subCaste);
      setFormData(prev => ({...prev, gotra: ''}));
      setErrors(prev => ({...prev, gotra: ''}));
    } else {
      setGotraData([]);
      setFormData(prev => ({...prev, gotra: ''}));
      setErrors(prev => ({...prev, gotra: ''}));
    }
  }, [formData.subCaste]);

  const fetchCityData = async () => {
    setIsLoading(true);
    try {
      const response = (await getCity()) as DropdownResponse;
      if (Array.isArray(response?.data)) {
        const cities = response.data.map(item => ({
          label: 'name' in item ? item.name : item.title,
          value: item.id,
        }));
        setCityData(cities);
      } else {
        setCityData([]);
      }
    } catch (error: any) {
      showErrorToast(error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCasteData = async () => {
    setIsLoading(true);
    try {
      const response = (await getCaste()) as DropdownResponse;
      if (Array.isArray(response?.data)) {
        const castes = response.data.map(item => ({
          label: 'name' in item ? item.name : item.title,
          value: item.id,
        }));
        setCasteData(castes);
      } else {
        setCasteData([]);
      }
    } catch (error: any) {
      showErrorToast(error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubCasteData = async (casteId: string) => {
    setIsLoading(true);
    try {
      const response = (await getSubCaste(casteId)) as DropdownResponse;
      if (Array.isArray(response?.data)) {
        const subCastes = response.data.map(item => ({
          label: 'name' in item ? item.name : item.title,
          value: item.id,
        }));
        setSubCasteData(subCastes);
      } else {
        setSubCasteData([]);
      }
    } catch (error: any) {
      showErrorToast(error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGotraData = async (subCasteId: string) => {
    setIsLoading(true);
    try {
      const response = (await getGotra(subCasteId)) as DropdownResponse;
      if (Array.isArray(response?.data)) {
        const gotras = response.data.map(item => ({
          label: 'name' in item ? item.name : item.title,
          value: item.id,
        }));
        setGotraData(gotras);
      } else {
        setGotraData([]);
      }
    } catch (error: any) {
      showErrorToast(error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const validateField = (field: keyof FormData, value: string) => {
    if (field === 'phoneNumber') {
      if (!value) return 'phone number is required';
    }
    if (field === 'firstName') {
      if (!value) return 'first name is required';
    }
    if (field === 'lastName') {
      if (!value) return 'last name is required';
    }
    if (field === 'city') {
      if (!value) return 'city is required';
    }
    if (field === 'caste') {
      if (!value) return 'caste is required';
    }
    if (field === 'subCaste') {
      if (!value) return 'sub caste is required';
    }
    if (field === 'gotra') {
      if (!value) return 'gotra is required';
    }
    if (field === 'address') {
      if (!value) return 'address is required';
    }
    return '';
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
    setErrors(prev => ({...prev, [field]: validateField(field, value)}));
  };

  const handleNext = () => {
    const newErrors: Partial<FormData> = {};
    let firstError = '';

    for (const field in formData) {
      const error = validateField(
        field as keyof FormData,
        formData[field as keyof FormData],
      );
      if (error) {
        newErrors[field as keyof FormData] = error;
        if (!firstError) firstError = error;
      }
    }

    setErrors(newErrors);
    if (firstError) {
      return;
    }
    navigation.navigate('SelectCityScreen', {
      phoneNumber: formData.phoneNumber,
      firstName: formData.firstName,
      lastName: formData.lastName,
      city: formData.city,
      caste: formData.caste,
      subCaste: formData.subCaste,
      gotra: formData.gotra,
      address: formData.address,
    });
  };

  return (
    <View style={[styles.mainContainer, {paddingTop: inset.top}]}>
      <CustomeLoader loading={isLoading} />
      <SafeAreaView style={styles.container}>
        <CustomHeader
          title={t('complete_your_profile')}
          showBackButton={true}
        />
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}>
          <ScrollView
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
                keyboardType="phone-pad"
                error={errors.phoneNumber}
              />
              <CustomTextInput
                label={t('first_name')}
                value={formData.firstName}
                onChangeText={value => handleInputChange('firstName', value)}
                placeholder={t('enter_first_name')}
                error={errors.firstName}
              />
              <CustomTextInput
                label={t('last_name')}
                value={formData.lastName}
                onChangeText={value => handleInputChange('lastName', value)}
                placeholder={t('enter_last_name')}
                error={errors.lastName}
              />
              <CustomDropdown
                label={t('city')}
                items={cityData}
                selectedValue={formData.city}
                onSelect={value => handleInputChange('city', value)}
                placeholder={t('select_your_city')}
                error={errors.city}
              />
              <CustomDropdown
                label={t('caste')}
                items={casteData}
                selectedValue={formData.caste}
                onSelect={value => handleInputChange('caste', value)}
                placeholder={t('select_your_caste')}
                error={errors.caste}
              />
              <CustomDropdown
                label={t('sub_caste')}
                items={subCasteData}
                selectedValue={formData.subCaste}
                onSelect={value => handleInputChange('subCaste', value)}
                placeholder={t('select_your_sub_caste')}
                error={errors.subCaste}
              />
              <CustomDropdown
                label={t('gotra')}
                items={gotraData}
                selectedValue={formData.gotra}
                onSelect={value => handleInputChange('gotra', value)}
                placeholder={t('select_your_gotra')}
                error={errors.gotra}
              />
              <CustomTextInput
                label={t('address')}
                value={formData.address}
                onChangeText={value => handleInputChange('address', value)}
                placeholder={t('enter_address')}
                error={errors.address}
              />
            </View>
            <View style={styles.textContainer}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
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
    padding: 24,
    gap: 16,
  },
  textContainer: {
    marginHorizontal: 24,
    paddingBottom: 16,
    marginTop: -10,
  },
  text: {
    fontFamily: Fonts.Sen_Regular,
    fontSize: 14,
    color: COLORS.lighttext,
  },
  buttonContainer: {
    height: 46,
    marginHorizontal: moderateScale(24),
  },
  buttonText: {
    fontSize: 15,
    fontFamily: Fonts.Sen_Medium,
  },
});

export default CompleteProfileScreen;
