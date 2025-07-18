import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {COLORS, wp, hp} from '../../theme/theme';
import Fonts from '../../theme/fonts';
import PrimaryButton from '../../components/PrimaryButton';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {moderateScale} from 'react-native-size-matters';
import CustomHeader from '../../components/CustomHeader';
import {useTranslation} from 'react-i18next';
import {CustomeSelectorDataOption} from '../../types/cityTypes';
import CustomSelector from '../../components/CustomeSelector';
import {getCity} from '../../api/apiService';
import {SelectorDataOption} from './type';
import {useCommonToast} from '../../common/CommonToast';
import CustomeLoader from '../../components/CustomLoader';
import {AuthStackParamList} from '../../navigation/AuthNavigator';
import {StackNavigationProp} from '@react-navigation/stack';

type RouteParams = {
  action?: string;
  phoneNumber?: string;
  email: string;
  profile_img: any;
  firstName?: string;
  lastName?: string;
  city?: string;
  caste?: string;
  subCaste?: string;
  gotra?: string;
  address?: string;
};

type ScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'SelectCityScreen'
>;

const SelectCityScreen: React.FC = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const {t} = useTranslation();
  const {showErrorToast} = useCommonToast();

  const {
    phoneNumber,
    email,
    firstName,
    lastName,
    city,
    caste,
    subCaste,
    gotra,
    address,
    profile_img,
  } = route.params || {};

  const [cities, setCities] = useState<CustomeSelectorDataOption[]>([]);

  const [selectedCityId, setSelectedCityId] = useState<number | null>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchCityData();
  }, []);

  const fetchCityData = async () => {
    setIsLoading(true);
    try {
      const response = (await getCity()) as SelectorDataOption;
      const data = response?.data || [];
      const mappedData: CustomeSelectorDataOption[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
      }));
      setCities(mappedData);
    } catch (error: any) {
      showErrorToast(error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const action = route.params?.action;

  console.log('selectedCityId :: ', selectedCityId);

  const handleCitySelect = (cityId: number) => {
    if (selectedCityId === cityId) {
      setSelectedCityId(null);
    } else {
      setSelectedCityId(cityId);
    }
  };

  const handleNext = () => {
    const selectedCity = cities.find(city => city.id === selectedCityId);
    if (selectedCity) {
      navigation.navigate('SelectAreaScreen', {
        phoneNumber: phoneNumber ?? '',
        email: email,
        firstName: firstName ?? '',
        lastName: lastName ?? '',
        city: city ?? '',
        caste: caste ?? '',
        subCaste: subCaste ?? '',
        gotra: gotra ?? '',
        address: address ?? '',
        selectCityId: selectedCityId ?? '',
        profile_img: profile_img,
      });
    } else {
      showErrorToast('Please select city');
    }
  };

  const buttonText = action === 'Update' ? t('update') : t('next');

  return (
    <View style={styles.container}>
      <CustomeLoader loading={isLoading} />
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <SafeAreaView style={[styles.container, {paddingTop: insets.top}]}>
        <CustomHeader
          title={t('complete_your_profile')}
          showBackButton={true}
        />
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <View style={styles.contentContainer}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContentContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <View style={styles.mainContent}>
                <Text style={styles.selectCityTitle}>{t('select_city')}</Text>
                <Text style={styles.description}>
                  {t('select_city_description')}
                </Text>
                <CustomSelector
                  data={cities}
                  selectedDataId={selectedCityId || null}
                  onDataSelect={handleCitySelect}
                  searchPlaceholder={t('search_city')}
                />
                <PrimaryButton
                  title={buttonText}
                  onPress={handleNext}
                  style={styles.nextButton}
                  disabled={!selectedCityId}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
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
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: moderateScale(20),
  },
  mainContent: {
    paddingHorizontal: wp(6.5),
    paddingVertical: moderateScale(24),
    flex: 1,
  },
  selectCityTitle: {
    color: COLORS.primaryTextDark,
    fontSize: moderateScale(18),
    fontFamily: Fonts.Sen_SemiBold,
    marginBottom: moderateScale(8),
  },
  description: {
    color: COLORS.lighttext,
    fontSize: moderateScale(14),
    fontFamily: Fonts.Sen_Regular,
    marginBottom: moderateScale(18),
  },
  nextButton: {
    height: moderateScale(46),
    marginTop: moderateScale(24),
  },
});

export default SelectCityScreen;
