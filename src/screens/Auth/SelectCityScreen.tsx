import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS, wp } from '../../theme/theme';
import Fonts from '../../theme/fonts';
import PrimaryButton from '../../components/PrimaryButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import CustomHeader from '../../components/CustomHeader';
import { useTranslation } from 'react-i18next';
import { CustomeSelectorDataOption } from '../../types/cityTypes';
import CustomSelector from '../../components/CustomeSelector';
import { getCity } from '../../api/apiService';
import { SelectorDataOption } from './type';
import { useCommonToast } from '../../common/CommonToast';
import CustomeLoader from '../../components/CustomLoader';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { translateData } from '../../utils/TranslateData';

type RouteParams = {
  action?: string;
  phoneNumber?: string;
  email: string;
  profile_img: any;
  firstName?: string;
  lastName?: string;
  dob?: string;
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
  const { t, i18n } = useTranslation();
  const { showErrorToast } = useCommonToast();
  const currentLanguage = i18n.language;

  const {
    phoneNumber,
    email,
    firstName,
    lastName,
    dob,
    city,
    caste,
    subCaste,
    gotra,
    address,
    profile_img,
  } = route.params || {};

  const [cities, setCities] = useState<CustomeSelectorDataOption[]>([]);
  const [originalCities, setOriginalCities] = useState<
    CustomeSelectorDataOption[]
  >([]);
  const [filteredCities, setFilteredCities] = useState<
    CustomeSelectorDataOption[]
  >([]);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const translationCacheRef = useRef<Map<string, any>>(new Map());

  const fetchCityData = useCallback(async () => {
    setIsLoading(true);
    try {
      const cachedData = translationCacheRef.current.get(currentLanguage);
      if (cachedData) {
        setCities(cachedData);
        setFilteredCities(cachedData);
        setIsLoading(false);
        return;
      }

      const response = (await getCity()) as SelectorDataOption;
      const data = response?.data || [];

      const mappedData: CustomeSelectorDataOption[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
      }));

      setOriginalCities(mappedData);

      // 🌍 Translate city names
      const translatedData: any = await translateData(
        mappedData,
        currentLanguage,
        ['name'],
      );

      translationCacheRef.current.set(currentLanguage, translatedData);

      setCities(translatedData);
      setFilteredCities(translatedData);
    } catch (error: any) {
      showErrorToast(error?.message || 'Failed to fetch cities');
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage]);

  useEffect(() => {
    fetchCityData();
  }, [fetchCityData]);

  // ✅ Search filter (handles English + Translated)
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredCities(cities);
    } else {
      const lower = searchText.toLowerCase();

      setFilteredCities(
        cities.filter(city => {
          const translatedMatch = city.name?.toLowerCase()?.includes(lower);
          const originalMatch = originalCities
            .find(orig => orig.id === city.id)
            ?.name?.toLowerCase()
            ?.includes(lower);
          return translatedMatch || originalMatch;
        }),
      );
    }
  }, [searchText, cities, originalCities]);

  const action = route.params?.action;

  const handleCitySelect = (cityId: number) => {
    setSelectedCityId(prev => (prev === cityId ? null : cityId));
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  const handleNext = () => {
    const selectedCity = cities.find(city => city.id === selectedCityId);
    if (selectedCity) {
      navigation.navigate('SelectAreaScreen', {
        phoneNumber: phoneNumber ?? '',
        email: email,
        firstName: firstName ?? '',
        lastName: lastName ?? '',
        dob: dob ?? '',
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
  const showNoResult = searchText.length > 0 && filteredCities.length === 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <CustomeLoader loading={isLoading} />
      <CustomHeader title={t('complete_your_profile')} showBackButton={true} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        // behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.contentContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.mainContent}>
              <Text style={styles.selectCityTitle}>{t('select_city')}</Text>
              <Text style={styles.description}>
                {t('select_city_description')}
              </Text>
              <CustomSelector
                data={filteredCities}
                selectedDataId={selectedCityId || null}
                onDataSelect={handleCitySelect}
                searchPlaceholder={t('search_city')}
                onSearch={handleSearch}
              />
              {showNoResult && (
                <Text style={styles.noResultText}>{t('no_city_found')}</Text>
              )}
            </View>
          </ScrollView>
          <View
            style={[
              styles.bottomButtonContainer,
              { paddingBottom: insets.bottom || moderateScale(16) },
            ]}
          >
            <PrimaryButton
              title={buttonText}
              onPress={handleNext}
              style={styles.nextButton}
              disabled={!selectedCityId}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
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
    paddingBottom: 0,
  },
  mainContent: {
    paddingHorizontal: wp(6.5),
    paddingVertical: moderateScale(24),
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
    marginTop: moderateScale(0),
  },
  bottomButtonContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(6.5),
    paddingTop: moderateScale(8),
  },
  noResultText: {
    color: COLORS.lighttext,
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_Regular,
    textAlign: 'center',
    marginTop: moderateScale(24),
  },
});

export default SelectCityScreen;
