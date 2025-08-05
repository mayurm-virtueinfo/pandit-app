import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Keyboard,
  Alert,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
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
import CustomeLoader from '../../components/CustomLoader';
import {useCommonToast} from '../../common/CommonToast';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../../navigation/AuthNavigator';
import ImagePicker from 'react-native-image-crop-picker';
import Feather from 'react-native-vector-icons/Feather';
import {DropdownResponse} from '../Auth/type';

interface FormData {
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
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

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const inset = useSafeAreaInsets();
  const {t} = useTranslation();
  const {showErrorToast} = useCommonToast();

  const [formData, setFormData] = useState<FormData>({
    phoneNumber: '',
    email: '',
    firstName: '',
    lastName: '',
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

  // Fixed photo selection logic: set profile_img, not photoUri
  const handlePhotoSelect = () => {
    Keyboard.dismiss();
    Alert.alert(t('select_profile_picture'), t('choose_an_option'), [
      {text: t('take_photo'), onPress: () => openCamera()},
      {text: t('choose_from_gallery'), onPress: () => openGallery()},
      {text: t('cancel'), style: 'cancel'},
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
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.7,
      });
      await processImage(image);
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log('Error accessing gallery:', error);
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

  const handleNext = () => {
    const newErrors: Partial<FormData> = {};
    let firstError = '';

    for (const field in formData) {
      // Don't validate photoUri (no longer in formData)
      const error = validateField(
        field as keyof FormData,
        formData[field as keyof FormData] as string,
      );
      if (error) {
        // Only assign error string to fields that expect a string, not to profile_img (which expects an object)
        if (field !== 'profile_img') {
          newErrors[field as Exclude<keyof FormData, 'profile_img'>] =
            error as string;
          if (!firstError) firstError = error;
        }
        // Do not assign error to profile_img, but still capture the first error if not set
        else if (!firstError) {
          firstError = error;
        }
      }
    }
    setErrors(newErrors);
    if (firstError) {
      return;
    }
    navigation.goBack();
  };

  return (
    <View style={[styles.mainContainer, {paddingTop: inset.top}]}>
      <CustomeLoader loading={isLoading} />
      <View style={styles.container}>
        <CustomHeader title={t('edit_profile')} showBackButton={true} />
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}>
          <View style={styles.content}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}>
              <View style={styles.formContainer}>
                {/* Photo Picker */}
                <View style={styles.photoSection}>
                  <TouchableOpacity
                    style={styles.photoPicker}
                    onPress={handlePhotoSelect}
                    activeOpacity={0.7}
                    testID="photo-picker">
                    {formData.profile_img ? (
                      <Image
                        source={{uri: formData.profile_img.uri}}
                        style={styles.photo}
                      />
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <Text style={styles.photoPlaceholderText}>
                          <Feather
                            name="camera"
                            size={32}
                            color={COLORS.gray}
                          />
                          <Text>{t('select_photo')}</Text>
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
                />
                <CustomTextInput
                  label={t('email')}
                  value={formData.email}
                  onChangeText={value => handleInputChange('email', value)}
                  placeholder={t('enter_email')}
                  keyboardType="email-address"
                  error={errors.email}
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
            </ScrollView>
            <View
              style={[
                styles.buttonFixedContainer,
                {paddingBottom: inset.bottom || 16},
              ]}>
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
    paddingBottom: 0, // Remove padding to avoid extra space at bottom
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
});

export default EditProfileScreen;
