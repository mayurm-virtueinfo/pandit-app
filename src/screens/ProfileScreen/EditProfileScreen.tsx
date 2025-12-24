import React, { useState, useEffect, useRef } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import CustomHeader from '../../components/CustomHeader';
import { COLORS } from '../../theme/theme';
import CustomTextInput from '../../components/CustomTextInput';
import PrimaryButton from '../../components/PrimaryButton';
import Fonts from '../../theme/fonts';
import { moderateScale } from 'react-native-size-matters';
import CustomDropdown from '../../components/CustomDropdown';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getCaste,
  getCity,
  getGotra,
  getSubCaste,
  getProfileData,
  putUpdateProfile,
} from '../../api/apiService';
import CustomeLoader from '../../components/CustomLoader';
import { useCommonToast } from '../../common/CommonToast';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import ImagePicker from 'react-native-image-crop-picker';
import Feather from 'react-native-vector-icons/Feather';
import { DropdownResponse } from '../Auth/type';
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

type ScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'CompleteProfileScreen'
>;

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const inset = useSafeAreaInsets();
  const { t } = useTranslation();
  const { showErrorToast, showSuccessToast } = useCommonToast();

  const [formData, setFormData] = useState<FormData>({
    phoneNumber: '',
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
  // Track the original image URI to detect if user changed image
  const [originalProfileImgUri, setOriginalProfileImgUri] =
    useState<string>('');
  const [isImageChanged, setIsImageChanged] = useState<boolean>(false);

  console.log('formData', formData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [cityData, setCityData] = useState<any[]>([]);
  const [casteData, setCasteData] = useState<any[]>([]);
  const [subCasteData, setSubCasteData] = useState<any[]>([]);
  const [gotraData, setGotraData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // To prevent double fetch of subcaste/gotra on initial profile load
  const isProfileLoaded = useRef(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Listen for keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Fetch profile and dropdown data on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch all dropdowns and profile, then set selected values
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch all dropdowns in parallel
      const [cityRes, casteRes, profileRes]: any = await Promise.all([
        getCity(),
        getCaste(),
        getProfileData(),
      ]);

      // Set cityData
      if (Array.isArray(cityRes?.data)) {
        const cities = cityRes.data.map((item: any) => ({
          label: 'name' in item ? item.name : item.title,
          value: item.id?.toString?.() ?? item.id,
        }));
        setCityData(cities);
      } else {
        setCityData([]);
      }

      // Set casteData
      if (Array.isArray(casteRes?.data)) {
        const castes = casteRes.data.map((item: any) => ({
          label: 'name' in item ? item.name : item.title,
          value: item.id?.toString?.() ?? item.id,
        }));
        setCasteData(castes);
      } else {
        setCasteData([]);
      }

      // Set formData from profile
      const data: any = profileRes?.data ?? profileRes;
      console.log('Data :::: >>>', data);
      if (data && typeof data === 'object') {
        const cityValue =
          data.address?.city !== undefined && data.address?.city !== null
            ? data.address.city.toString()
            : '';
        const casteValue =
          data.caste !== undefined && data.caste !== null
            ? data.caste.toString()
            : '';
        const subCasteValue =
          data.subcaste !== undefined && data.subcaste !== null
            ? data.subcaste.toString()
            : '';
        const gotraValue =
          data.gotra !== undefined && data.gotra !== null
            ? data.gotra.toString()
            : '';
        const profileImgUri =
          data.profile_img && typeof data.profile_img === 'string'
            ? data.profile_img
            : '';
        setFormData(prev => ({
          ...prev,
          phoneNumber: data.mobile || '',
          email: data.email || '',
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          dob: data.dob || '',
          city: cityValue,
          caste: casteValue,
          subCaste: subCasteValue,
          gotra: gotraValue,
          address: data.address?.address_line1,
          profile_img: data.profile_img
            ? {
                uri: profileImgUri,
                type: '', // Type is not provided in API response
                name: '', // Name is not provided in API response
              }
            : { uri: '', type: '', name: '' },
        }));
        setOriginalProfileImgUri(profileImgUri);
        setIsImageChanged(false);

        // Fetch subcaste and gotra dropdowns if values exist
        if (casteValue) {
          await fetchSubCasteData(casteValue, subCasteValue, gotraValue);
        }
        if (subCasteValue) {
          await fetchGotraData(subCasteValue, gotraValue);
        }
        isProfileLoaded.current = true;
      }
    } catch (error: any) {
      showErrorToast(error?.message || 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch subcaste data and optionally set selected subcaste/gotra
  const fetchSubCasteData = async (
    casteId: string,
    selectedSubCaste: string = '',
    selectedGotra: string = '',
  ) => {
    setIsLoading(true);
    try {
      const response = (await getSubCaste(casteId)) as DropdownResponse;
      if (Array.isArray(response?.data)) {
        const subCastes = response.data.map(item => ({
          label: 'name' in item ? item.name : item.title,
          value: item.id?.toString?.() ?? item.id,
        }));
        setSubCasteData(subCastes);

        // If a selected subcaste is provided, set it and fetch gotra
        if (selectedSubCaste) {
          setFormData(prev => ({
            ...prev,
            subCaste: selectedSubCaste,
          }));
          if (selectedGotra) {
            await fetchGotraData(selectedSubCaste, selectedGotra);
          }
        } else {
          setFormData(prev => ({
            ...prev,
            subCaste: '',
            gotra: '',
          }));
        }
      } else {
        setSubCasteData([]);
        setFormData(prev => ({
          ...prev,
          subCaste: '',
          gotra: '',
        }));
      }
    } catch (error: any) {
      showErrorToast(error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch gotra data and optionally set selected gotra
  const fetchGotraData = async (
    subCasteId: string,
    selectedGotra: string = '',
  ) => {
    setIsLoading(true);
    try {
      const response = (await getGotra(subCasteId)) as DropdownResponse;
      if (Array.isArray(response?.data)) {
        const gotras = response.data.map(item => ({
          label: 'name' in item ? item.name : item.title,
          value: item.id?.toString?.() ?? item.id,
        }));
        setGotraData(gotras);

        if (selectedGotra) {
          setFormData(prev => ({
            ...prev,
            gotra: selectedGotra,
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            gotra: '',
          }));
        }
      } else {
        setGotraData([]);
        setFormData(prev => ({
          ...prev,
          gotra: '',
        }));
      }
    } catch (error: any) {
      showErrorToast(error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  // When caste changes, fetch subcaste and reset subCaste/gotra
  useEffect(() => {
    if (!isProfileLoaded.current) return;
    if (formData.caste) {
      fetchSubCasteData(formData.caste);
    } else {
      setSubCasteData([]);
      setGotraData([]);
      setFormData(prev => ({ ...prev, subCaste: '', gotra: '' }));
      setErrors(prev => ({ ...prev, subCaste: '', gotra: '' }));
    }
  }, [formData.caste]);

  // When subCaste changes, fetch gotra and reset gotra
  useEffect(() => {
    if (!isProfileLoaded.current) return;
    if (formData.subCaste) {
      fetchGotraData(formData.subCaste);
    } else {
      setGotraData([]);
      setFormData(prev => ({ ...prev, gotra: '' }));
      setErrors(prev => ({ ...prev, gotra: '' }));
    }
  }, [formData.subCaste]);

  const validateEmail = (email: string) => {
    // Simple email regex
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
    if (field === 'dob') {
      if (!value) return 'date of birth is required';
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

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
    if (field === 'profile_img') {
      // If user selects a new image, mark as changed
      setIsImageChanged(true);
    }
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

  // Fixed photo selection logic: set profile_img, not photoUri
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
        mediaType: 'photo',
        forceJpg: true,
      });
      await processImage(image);
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.warn('Error accessing camera:', error.code, error.message);
        showErrorToast(t('camera_access_failed'));
      }
    }
  };

  const openGallery = async () => {
    try {
      // Step 1: Pick the image from gallery without cropping
      const pickedImage = await ImagePicker.openPicker({
        mediaType: 'photo',
        forceJpg: true,
      });

      // Step 2: Open cropper with the picked image
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
            console.warn('Error cropping image:', cropError);
             // Use a distinct error message or fallback to generic
            showErrorToast(t('image_processing_failed')); 
          }
        }
      }
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.warn('Error accessing gallery:', error.code, error.message);
        showErrorToast(t('gallery_access_failed'));
      }
    }
  };

  const processImage = async (image: any) => {
    try {
      const imageData = {
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

  const handleInputFocus = (yOffset: number) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: yOffset,
        animated: true,
      });
    }, 100);
  };

  const handleNext = async () => {
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

    setIsLoading(true);
    try {
      let payload: any;
      let isMultipart = false;

      // Convert string IDs to numbers for city, caste, subcaste, gotra
      const cityNum = formData.city ? Number(formData.city) : '';
      const casteNum = formData.caste ? Number(formData.caste) : '';
      const subCasteNum = formData.subCaste ? Number(formData.subCaste) : '';
      const gotraNum = formData.gotra ? Number(formData.gotra) : '';

      // Only include profile_img if user changed the image
      if (isImageChanged && formData.profile_img && formData.profile_img.uri) {
        isMultipart = true;
        payload = new FormData();
        payload.append('first_name', formData.firstName);
        payload.append('last_name', formData.lastName);
        payload.append('dob', formData.dob);
        payload.append('address.city', cityNum);
        payload.append('caste', casteNum);
        payload.append('sub_caste', subCasteNum);
        payload.append('gotra', gotraNum);
        payload.append('address.address_line1', formData.address);
        payload.append('profile_img', {
          uri: formData.profile_img.uri,
          type: formData.profile_img.type,
          name: formData.profile_img.name,
        });
      } else {
        // If image not changed, send as JSON (not multipart) and don't include profile_img
        payload = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          dob: formData.dob,
          address: {
            city: cityNum,
            address_line1: formData.address,
          },
          caste: casteNum,
          sub_caste: subCasteNum,
          gotra: gotraNum,
        };
      }

      console.log('payload', payload);
      const response = await putUpdateProfile(payload);
      console.log('response', response);
      if (response) {
        showSuccessToast(
          t('profile_updated_successfully') || 'Profile updated successfully',
        );
        navigation.goBack();
      } else {
        showErrorToast(
          response?.data?.message ||
            t('failed_to_update_profile') ||
            'Failed to update profile',
        );
      }
    } catch (error: any) {
      showErrorToast(
        error?.response?.data?.message ||
          error?.message ||
          t('failed_to_update_profile') ||
          'Failed to update profile',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.mainContainer, { paddingTop: inset.top }]}>
      <CustomeLoader loading={isLoading} />
      <View style={styles.container}>
        <CustomHeader title={t('edit_profile')} showBackButton={true} />
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.content}>
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[
                styles.scrollContent,
                isKeyboardVisible && { paddingBottom: moderateScale(100) },
              ]}
            >
              <View style={styles.formContainer}>
                {/* Photo Picker */}
                <View style={styles.photoSection}>
                  <TouchableOpacity
                    style={styles.photoPicker}
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
                        {/* <Text style={styles.photoPlaceholderText}>
                          <Feather
                            name="camera"
                            size={32}
                            color={COLORS.gray}
                          />
                          <Text>{t('select_photo')}</Text>
                        </Text> */}
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handlePhotoSelect}
                    activeOpacity={0.7}
                  >
                    <Feather name="edit" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                  <Text style={styles.photoLabel}>
                    {t('profile_photo') || 'Profile Photo'}
                  </Text>
                </View>
                <CustomTextInput
                  label={t('phone_number')}
                  value={formData.phoneNumber}
                  onChangeText={() => {}}
                  placeholder={t('enter_phone_number')}
                  keyboardType="phone-pad"
                  error={errors.phoneNumber}
                  editable={false}
                  style={styles.disabledInput}
                  textColor={COLORS.gray}
                />
                <CustomTextInput
                  label={t('email')}
                  value={formData.email}
                  onChangeText={() => {}}
                  placeholder={t('enter_email')}
                  keyboardType="email-address"
                  error={errors.email}
                  editable={false}
                  style={styles.disabledInput}
                  textColor={COLORS.gray}
                />
                <CustomTextInput
                  label={t('first_name')}
                  value={formData.firstName}
                  onChangeText={value => handleInputChange('firstName', value)}
                  placeholder={t('enter_first_name')}
                  error={errors.firstName}
                  onFocus={() => handleInputFocus(200)}
                  required={true}
                />
                <CustomTextInput
                  label={t('last_name')}
                  value={formData.lastName}
                  onChangeText={value => handleInputChange('lastName', value)}
                  placeholder={t('enter_last_name')}
                  error={errors.lastName}
                  onFocus={() => handleInputFocus(250)}
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
                    <Feather name="calendar" size={20} color={COLORS.lighttext} />
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
                  onFocus={() => handleInputFocus(600)}
                  required={true}
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.text}>{t('address_desc')}</Text>
              </View>
              <View
                style={[
                  styles.buttonFixedContainer,
                  { paddingBottom: inset.bottom || 16 },
                ]}
              >
                <PrimaryButton
                  title={t('update')}
                  onPress={handleNext}
                  style={styles.buttonContainer}
                  textStyle={styles.buttonText}
                />
              </View>
            </ScrollView>
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
              display="inline"
              themeVariant="light"
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
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
  },
  scrollContent: {
    flexGrow: 1,
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
  buttonFixedContainer: {
    backgroundColor: COLORS.white,
    paddingTop: 8,
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
    marginBottom: 5,
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
    fontSize: 13,
    textAlign: 'center',
    fontFamily: Fonts.Sen_Regular,
  },
  photoLabel: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.lighttext,
    fontFamily: Fonts.Sen_Regular,
  },
  disabledInput: {
    backgroundColor: COLORS.lightGray,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: 'center', // Center the picker
    paddingBottom: 20, // Add some bottom padding
  },
  iosPickerToolbar: {
    width: '100%', // Ensure toolbar takes full width
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
    // width: '100%', // Remove width 100% to let it size naturally or center it
    marginTop: 10,
  },
});

export default EditProfileScreen;
