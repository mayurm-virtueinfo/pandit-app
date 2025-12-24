import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Keyboard,
  Alert,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import CustomHeader from '../../components/CustomHeader';
import { COLORS } from '../../theme/theme';
import CustomTextInput from '../../components/CustomTextInput';
import PrimaryButton from '../../components/PrimaryButton';
import Fonts from '../../theme/fonts';
import { moderateScale } from 'react-native-size-matters';
import CustomDropdown from '../../components/CustomDropdown';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCaste, getCity, getGotra, getSubCaste } from '../../api/apiService';
import { DropdownResponse } from './type';
import CustomeLoader from '../../components/CustomLoader';
import { useCommonToast } from '../../common/CommonToast';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import ImagePicker from 'react-native-image-crop-picker';
import Feather from 'react-native-vector-icons/Feather';
import { translateData } from '../../utils/TranslateData';
import DateTimePicker from '@react-native-community/datetimepicker';

interface FormData {
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  dob: string;
  city: string;
  caste: string;
  subCaste: string;
  gotra: string;
  address: string;
  profile_img: {
    uri: any;
    type: any;
    name: string;
  };
}

type RouteParams = {
  phoneNumber?: string;
};

type ScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'CompleteProfileScreen'
>;

const CompleteProfileScreen: React.FC = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const inset = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { showErrorToast } = useCommonToast();

  const currentLanguage = i18n.language;
  const translationCacheRef = useRef<Map<string, any>>(new Map());

  const { phoneNumber } = route.params;

  const [formData, setFormData] = useState<FormData>({
    phoneNumber: phoneNumber || '',
    email: '',
    firstName: '',
    lastName: '',
    dob: '',
    city: '',
    caste: '',
    subCaste: '',
    gotra: '',
    address: '',
    profile_img: {
      uri: '',
      type: '',
      name: '',
    },
  });
  console.log('dob :: ', formData.dob);

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [cityData, setCityData] = useState<any[]>([]);
  const [casteData, setCasteData] = useState<any[]>([]);
  const [subCasteData, setSubCasteData] = useState<any[]>([]);
  const [gotraData, setGotraData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDobPicker, setShowDobPicker] = useState(false);

  useEffect(() => {
    fetchCityData();
    fetchCasteData();
  }, []);

  useEffect(() => {
    if (formData.caste) {
      fetchSubCasteData(formData.caste);
      setFormData(prev => ({ ...prev, subCaste: '', gotra: '' }));
      setErrors(prev => ({ ...prev, subCaste: '', gotra: '' }));
    } else {
      setSubCasteData([]);
      setGotraData([]);
      setFormData(prev => ({ ...prev, subCaste: '', gotra: '' }));
      setErrors(prev => ({ ...prev, subCaste: '', gotra: '' }));
    }
  }, [formData.caste]);

  useEffect(() => {
    if (formData.subCaste) {
      fetchGotraData(formData.subCaste);
      setFormData(prev => ({ ...prev, gotra: '' }));
      setErrors(prev => ({ ...prev, gotra: '' }));
    } else {
      setGotraData([]);
      setFormData(prev => ({ ...prev, gotra: '' }));
      setErrors(prev => ({ ...prev, gotra: '' }));
    }
  }, [formData.subCaste]);

  const fetchCityData = useCallback(async () => {
    setIsLoading(true);
    try {
      const cacheKey = `city_${currentLanguage}`;
      if (translationCacheRef.current.has(cacheKey)) {
        setCityData(translationCacheRef.current.get(cacheKey));
        setIsLoading(false);
        return;
      }

      const response = (await getCity()) as DropdownResponse;
      const cityList = Array.isArray(response?.data) ? response.data : [];

      const mapped: any = cityList.map((item: any) => ({
        label: item.name || item.title,
        value: item.id,
      }));

      const translated: any = await translateData(mapped, currentLanguage, [
        'label',
      ]);
      setCityData(translated);
      translationCacheRef.current.set(cacheKey, translated);
    } catch (error: any) {
      showErrorToast(error?.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage, showErrorToast]);

  const fetchCasteData = useCallback(async () => {
    setIsLoading(true);
    try {
      const cacheKey = `caste_${currentLanguage}`;
      if (translationCacheRef.current.has(cacheKey)) {
        setCasteData(translationCacheRef.current.get(cacheKey));
        setIsLoading(false);
        return;
      }

      const response = (await getCaste()) as DropdownResponse;
      const casteList = Array.isArray(response?.data) ? response.data : [];

      const mapped = casteList.map((item: any) => ({
        label: item.name || item.title,
        value: item.id,
      }));

      const translated: any = await translateData(mapped, currentLanguage, [
        'label',
      ]);
      setCasteData(translated);
      translationCacheRef.current.set(cacheKey, translated);
    } catch (error: any) {
      showErrorToast(error?.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage, showErrorToast]);

  const fetchSubCasteData = useCallback(
    async (casteId: string) => {
      setIsLoading(true);
      try {
        const cacheKey = `subcaste_${casteId}_${currentLanguage}`;
        if (translationCacheRef.current.has(cacheKey)) {
          setSubCasteData(translationCacheRef.current.get(cacheKey));
          setIsLoading(false);
          return;
        }

        const response = (await getSubCaste(casteId)) as DropdownResponse;
        const list = Array.isArray(response?.data) ? response.data : [];

        const mapped = list.map((item: any) => ({
          label: item.name || item.title,
          value: item.id,
        }));

        const translated: any = await translateData(mapped, currentLanguage, [
          'label',
        ]);
        setSubCasteData(translated);
        translationCacheRef.current.set(cacheKey, translated);
      } catch (error: any) {
        showErrorToast(error?.message);
      } finally {
        setIsLoading(false);
      }
    },
    [currentLanguage, showErrorToast],
  );

  const fetchGotraData = useCallback(
    async (subCasteId: string) => {
      setIsLoading(true);
      try {
        const cacheKey = `gotra_${subCasteId}_${currentLanguage}`;
        if (translationCacheRef.current.has(cacheKey)) {
          setGotraData(translationCacheRef.current.get(cacheKey));
          setIsLoading(false);
          return;
        }

        const response = (await getGotra(subCasteId)) as DropdownResponse;
        const list = Array.isArray(response?.data) ? response.data : [];

        const mapped = list.map((item: any) => ({
          label: item.name || item.title,
          value: item.id,
        }));

        const translated: any = await translateData(mapped, currentLanguage, [
          'label',
        ]);
        setGotraData(translated);
        translationCacheRef.current.set(cacheKey, translated);
      } catch (error: any) {
        showErrorToast(error?.message);
      } finally {
        setIsLoading(false);
      }
    },
    [currentLanguage, showErrorToast],
  );

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const validateField = (field: keyof FormData, value: string) => {
    if (field === 'phoneNumber') {
      if (!value) return 'phone number is required';
    }
    if (field === 'email') {
      if (!value) return 'email is required';
      if (!validateEmail(value)) return 'invalid email address';
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
    if (field === 'dob') {
      if (!value) return 'date of birth is required';
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
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
  };
  const handleDobChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      // US/ISO format for storage and passing to API
      const formatted = `${year}-${month}-${day}`;
      handleInputChange('dob', formatted);
    }

    if (Platform.OS === 'android') {
      setShowDobPicker(false);
    }
  };

  const closeDobPicker = () => setShowDobPicker(false);

  // Show Indian format only in UI ("dd-mm-yyyy")
  const formatDob = (dateString: string) => {
    if (!dateString) return '';
    // Expecting dateString as yyyy-mm-dd
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`; // dd-mm-yyyy
    }
    return dateString;
  };

  const dobDateValue = (() => {
    // Expect yyyy-mm-dd
    if (formData.dob) {
      // Split manually to avoid timezone issues with Date("yyyy-mm-dd")
      const [year, month, day] = formData.dob.split('-');
      if (year && month && day) {
        return new Date(Number(year), Number(month) - 1, Number(day));
      }
    }
    return new Date();
  })();

  // ======== END DOB FORMAT LOGIC ========

  const handlePhotoSelect = () => {
    Keyboard.dismiss();
    Alert.alert(t('select_profile_picture'), t('choose_an_option'), [
      { text: t('take_photo'), onPress: () => openCamera() },
      { text: t('choose_from_gallery'), onPress: () => openGallery() },
      { text: t('cancel'), style: 'cancel' },
    ]);
  };

  const openCamera = async () => {
    try {
      const image = await ImagePicker.openCamera({
        width: 300,
        height: 300,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.7,
      });
      await processImage(image);
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log('Error accessing camera:', error);
        showErrorToast(t('camera_access_failed'));
      }
    }
  };

  const openGallery = async () => {
    try {
      // Step 1: Pick image without cropping
      const pickedImage = await ImagePicker.openPicker({
        mediaType: 'photo',
        compressImageQuality: 0.7,
      });

      // Step 2: Open cropper
      if (pickedImage && pickedImage.path) {
        try {
          const croppedImage = await ImagePicker.openCropper({
            path: pickedImage.path,
            width: 300,
            height: 300,
            cropping: true,
            cropperCircleOverlay: true,
            compressImageQuality: 0.7,
            mediaType: 'photo',
            freeStyleCropEnabled: true,
          });
          await processImage(croppedImage);
        } catch (cropError: any) {
             if (cropError.code !== 'E_PICKER_CANCELLED') {
            console.log('Error cropping image:', cropError);
            showErrorToast(t('image_processing_failed'));
          }
        }
      }
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log('Error accessing gallery:', error);
        showErrorToast(t('gallery_access_failed'));
      }
    }
  };

  const processImage = async (image: any) => {
    try {
      const imageData: any = {
        uri:
          Platform.OS === 'ios'
            ? image.path.replace('file://', '')
            : image.path,
        type: image.mime,
        name: `profile_${Date.now()}.${image.mime.split('/')[1]}`,
      };
      handleInputChange('profile_img', imageData);
    } catch (error) {
      console.log('Error processing image:', error);
      showErrorToast(t('image_processing_failed'));
    }
  };

  const handleNext = () => {
    const newErrors: Partial<FormData> = {};
    let firstError = '';

    for (const field in formData) {
      const error = validateField(
        field as keyof FormData,
        formData[field as keyof FormData] as string,
      );
      if (error) {
        if (field !== 'profile_img') {
          newErrors[field as Exclude<keyof FormData, 'profile_img'>] =
            error as string;
          if (!firstError) firstError = error;
        } else if (!firstError) {
          firstError = error;
        }
      }
    }
    setErrors(newErrors);
    if (firstError) {
      return;
    }
    navigation.navigate('SelectCityScreen', {
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      city: formData.city,
      caste: formData.caste,
      subCaste: formData.subCaste,
      gotra: formData.gotra,
      dob: formData.dob, // Pass in yyyy-mm-dd (US) format!
      address: formData.address,
      profile_img: formData.profile_img,
    });
  };

  useEffect(() => {
    fetchCityData();
    fetchCasteData();
    if (formData.caste) fetchSubCasteData(formData.caste);
    if (formData.subCaste) fetchGotraData(formData.subCaste);
  }, [
    currentLanguage,
    fetchCityData,
    fetchCasteData,
    fetchSubCasteData,
    fetchGotraData,
    formData.caste,
    formData.subCaste,
  ]);

  return (
    <View style={[styles.mainContainer, { paddingTop: inset.top }]}>
      <CustomeLoader loading={isLoading} />
      <View style={styles.container}>
        <CustomHeader
          title={t('complete_your_profile')}
          showBackButton={true}
        />
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        >
          <View style={styles.flexGrow}>
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.formContainer}>
                {/* Photo Picker */}
                <View style={styles.photoSection}>
                  <TouchableOpacity
                    style={styles.photoPicker}
                    onPress={handlePhotoSelect}
                    activeOpacity={0.7}
                    testID="photo-picker"
                  >
                    {formData.profile_img && formData.profile_img.uri ? (
                      <Image
                        source={{ uri: formData.profile_img.uri }}
                        style={styles.photo}
                      />
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <Feather name="camera" size={30} color={COLORS.gray} />
                        <Text style={styles.photoPlaceholderText}>
                          {t('select_photo')}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <Text style={styles.photoLabel}>
                    {t('profile_photo') || 'Profile Photo'}
                  </Text>
                </View>
                <CustomTextInput
                  label={t('phone_number')}
                  value={formData.phoneNumber}
                  onChangeText={value =>
                    handleInputChange('phoneNumber', value)
                  }
                  placeholder={t('enter_phone_number')}
                  keyboardType="phone-pad"
                  error={errors.phoneNumber}
                  required={true}
                />
                <CustomTextInput
                  label={t('email')}
                  value={formData.email}
                  onChangeText={value => handleInputChange('email', value)}
                  placeholder={t('enter_email')}
                  keyboardType="email-address"
                  error={errors.email}
                  required={true}
                />
                <CustomTextInput
                  label={t('first_name')}
                  value={formData.firstName}
                  onChangeText={value => handleInputChange('firstName', value)}
                  placeholder={t('enter_first_name')}
                  error={errors.firstName}
                  required={true}
                />
                <CustomTextInput
                  label={t('last_name')}
                  value={formData.lastName}
                  onChangeText={value => handleInputChange('lastName', value)}
                  placeholder={t('enter_last_name')}
                  error={errors.lastName}
                  required={true}
                />
                <View>
                  <Text style={styles.dateLabel}>
                    {t('date_of_birth') || 'Date of Birth'}
                    <Text style={{color: COLORS.error}}> *</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowDobPicker(true);
                    }}
                    activeOpacity={0.8}
                    style={[
                      styles.datePickerField,
                      errors.dob ? styles.datePickerFieldError : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dateValue,
                        !formData.dob ? styles.placeholderText : null,
                      ]}
                    >
                      {formData.dob
                        ? formatDob(formData.dob)
                        : t('select_date') || 'Select Date'}
                    </Text>
                  </TouchableOpacity>
                  {!!errors.dob && (
                    <Text style={styles.errorText}>{errors.dob}</Text>
                  )}
                </View>
                <CustomDropdown
                  label={t('city')}
                  items={cityData}
                  selectedValue={formData.city}
                  onSelect={value => handleInputChange('city', value)}
                  placeholder={t('select_your_city')}
                  error={errors.city}
                  required={true}
                />
                <CustomDropdown
                  label={t('caste')}
                  items={casteData}
                  selectedValue={formData.caste}
                  onSelect={value => handleInputChange('caste', value)}
                  placeholder={t('select_your_caste')}
                  error={errors.caste}
                  required={true}
                />
                <CustomDropdown
                  label={t('sub_caste')}
                  items={subCasteData}
                  selectedValue={formData.subCaste}
                  onSelect={value => handleInputChange('subCaste', value)}
                  placeholder={t('select_your_sub_caste')}
                  error={errors.subCaste}
                  required={true}
                />
                <CustomDropdown
                  label={t('gotra')}
                  items={gotraData}
                  selectedValue={formData.gotra}
                  onSelect={value => handleInputChange('gotra', value)}
                  placeholder={t('select_your_gotra')}
                  error={errors.gotra}
                  required={true}
                />
                <CustomTextInput
                  label={t('address')}
                  value={formData.address}
                  onChangeText={value => handleInputChange('address', value)}
                  placeholder={t('enter_address')}
                  error={errors.address}
                  required={true}
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.text}>{t('address_desc')}</Text>
              </View>
              {/* Remove button from scrollable area */}
            </ScrollView>
            {/* Fixed button at bottom */}
            <View
              style={[
                styles.fixedButtonContainer,
                // { paddingBottom: inset.bottom || 16 },
              ]}
            >
              <PrimaryButton
                title={t('next')}
                onPress={handleNext}
                style={styles.buttonContainer}
                textStyle={styles.buttonText}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
      {showDobPicker &&
        (Platform.OS === 'ios' ? (
          <View style={styles.iosPickerWrapper}>
            <View style={styles.iosPickerToolbar}>
              <TouchableOpacity onPress={closeDobPicker}>
                <Text style={styles.doneText}>{t('done') || 'Done'}</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={dobDateValue}
              mode="date"
              maximumDate={new Date()}
              onChange={handleDobChange}
              display="spinner"
              style={styles.iosPicker}
            />
          </View>
        ) : (
          <DateTimePicker
            value={dobDateValue}
            mode="date"
            maximumDate={new Date()}
            onChange={handleDobChange}
          />
        ))}
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
  flexGrow: {
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
    // paddingBottom: 20,
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
    marginBottom: moderateScale(24),
  },
  buttonText: {
    fontSize: 15,
    fontFamily: Fonts.Sen_Medium,
  },
  fixedButtonContainer: {
    backgroundColor: COLORS.white,
    paddingTop: 10,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  photoPicker: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border || '#ddd',
  },
  photo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  photoPlaceholderText: {
    color: COLORS.lighttext,
    fontSize: 10,
    textAlign: 'center',
    fontFamily: Fonts.Sen_Regular,
  },
  photoLabel: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.lighttext,
    fontFamily: Fonts.Sen_Regular,
  },
  dateLabel: {
    fontSize: 14,
    color: COLORS.lighttext,
    marginBottom: 6,
    fontFamily: Fonts.Sen_Medium,
  },
  datePickerField: {
    borderWidth: 1,
    borderColor: COLORS.border || '#ddd',
    borderRadius: moderateScale(12),
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.white,
  },
  datePickerFieldError: {
    borderColor: COLORS.error || '#FF5D5D',
  },
  dateValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontFamily: Fonts.Sen_Regular,
  },
  placeholderText: {
    color: COLORS.lighttext,
  },
  errorText: {
    color: COLORS.error || '#FF5D5D',
    fontSize: 12,
    marginTop: 4,
    fontFamily: Fonts.Sen_Regular,
  },
  iosPickerWrapper: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: moderateScale(16),
    borderTopRightRadius: moderateScale(16),
    borderTopWidth: 1,
    borderColor: COLORS.border || '#ddd',
  },
  iosPickerToolbar: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: COLORS.border || '#ddd',
    alignItems: 'flex-end',
  },
  doneText: {
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: Fonts.Sen_SemiBold,
  },
  iosPicker: {
    backgroundColor: COLORS.white,
  },
});

export default CompleteProfileScreen;
