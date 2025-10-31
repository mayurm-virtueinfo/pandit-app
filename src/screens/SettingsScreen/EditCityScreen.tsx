import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {COLORS, wp} from '../../theme/theme';
import Fonts from '../../theme/fonts';
import PrimaryButton from '../../components/PrimaryButton';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {moderateScale} from 'react-native-size-matters';
import CustomHeader from '../../components/CustomHeader';
import {useTranslation} from 'react-i18next';
import {CustomeSelectorDataOption} from '../../types/cityTypes';
import CustomSelector from '../../components/CustomeSelector';
import {getCity, getServiceArea} from '../../api/apiService';
import {useCommonToast} from '../../common/CommonToast';
import {StackNavigationProp} from '@react-navigation/stack';
import {SettingsStackParamList} from '../../navigation/SettingsStack/SettingsStack';
import CustomeLoader from '../../components/CustomLoader';
import {translateData} from '../../utils/TranslateData';

type ScreenNavigationProp = StackNavigationProp<
  SettingsStackParamList,
  'EditCityScreen'
>;

const EditCityScreen: React.FC = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const {t, i18n} = useTranslation();
  const currentLanguage = i18n.language;
  const {showErrorToast} = useCommonToast();

  const [cities, setCities] = useState<CustomeSelectorDataOption[]>([]);
  const [originalCities, setOriginalCities] = useState<
    CustomeSelectorDataOption[]
  >([]);
  const [data, setData] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [filteredCities, setFilteredCities] = useState<
    CustomeSelectorDataOption[]
  >([]);

  const translationCacheRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredCities(cities);
    } else {
      const lowerSearch = searchText.toLowerCase();
      setFilteredCities(
        cities.filter(city => city.name.toLowerCase().includes(lowerSearch)),
      );
    }
  }, [searchText, cities]);

  const fetchCityAndServiceArea = useCallback(async () => {
    setIsLoading(true);
    try {
      const cachedData = translationCacheRef.current.get(currentLanguage);
      if (cachedData) {
        setCities(cachedData);
        setFilteredCities(cachedData);
        setIsLoading(false);
        return;
      }

      const cityResponse = await getCity();
      const cityData = Array.isArray(cityResponse)
        ? cityResponse
        : cityResponse && Array.isArray((cityResponse as any).data)
        ? (cityResponse as any).data
        : [];
      const mappedData: CustomeSelectorDataOption[] = cityData.map(
        (item: any) => ({
          id: item.id,
          name: item.name,
        }),
      );
      setOriginalCities(mappedData);
      const translatedData: any = await translateData(
        mappedData,
        currentLanguage,
        ['name'],
      );
      translationCacheRef.current.set(currentLanguage, translatedData);
      setCities(translatedData);
      setFilteredCities(translatedData);

      // Fetch current service area to get city_id
      const serviceAreaResponse: any = await getServiceArea();
      console.log(
        'serviceAreaResponse :: ',
        serviceAreaResponse?.data?.service_areas,
      );
      const serviceAreaData =
        serviceAreaResponse?.data?.service_areas || serviceAreaResponse || [];
      setData(serviceAreaData);
      let cityId = null;
      if (Array.isArray(serviceAreaData) && serviceAreaData.length > 0) {
        cityId = serviceAreaData[0]?.city ?? null;
      }
      if (cityId) {
        setSelectedCityId(cityId);
      }
    } catch (error: any) {
      showErrorToast(error?.message || 'Failed to load city data');
      setCities([]);
      setOriginalCities([]);
      setFilteredCities([]);
      setData([]);
      setSelectedCityId(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage, translationCacheRef]);

  const handleCitySelect = (cityId: number) => {
    if (selectedCityId === cityId) {
      setSelectedCityId(null);
    } else {
      setSelectedCityId(cityId);
    }
  };

  useEffect(() => {
    fetchCityAndServiceArea();
  }, [fetchCityAndServiceArea]);

  const handleNext = () => {
    const selectedCity = cities.find(city => city.id === selectedCityId);
    if (selectedCity) {
      navigation.navigate('EditAreaScreen', {
        selectCityId: selectedCityId ?? '',
        area: data,
      });
    } else {
      showErrorToast('Please select city');
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <CustomeLoader loading={isLoading} />
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={[styles.container]}>
        <CustomHeader title={t('edit_city')} showBackButton={true} />
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
                  data={filteredCities}
                  selectedDataId={selectedCityId || null}
                  onDataSelect={handleCitySelect}
                  searchPlaceholder={t('search_city')}
                  onSearch={handleSearch}
                />
                {filteredCities.length === 0 && searchText.trim() !== '' && (
                  <Text style={styles.noResultText}>
                    {t('no_city_found') || 'No city found'}
                  </Text>
                )}
              </View>
            </ScrollView>
            {/* Button fixed at bottom */}
            <View
              style={[
                styles.bottomButtonContainer,
                {paddingBottom: moderateScale(16)},
              ]}>
              <PrimaryButton
                title={t('next')}
                onPress={handleNext}
                style={styles.nextButton}
                disabled={!selectedCityId}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
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
    // Remove bottom padding here, handled by bottomButtonContainer
    paddingBottom: 0,
  },
  mainContent: {
    paddingHorizontal: wp(6.5),
    paddingVertical: moderateScale(24),
    // Remove flex: 1 to allow ScrollView to size naturally
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
    // marginTop: moderateScale(24), // Remove marginTop, handled by bottomButtonContainer
  },
  noResultText: {
    color: COLORS.lighttext,
    fontSize: moderateScale(14),
    fontFamily: Fonts.Sen_Regular,
    marginTop: moderateScale(30),
    textAlign: 'center',
  },
  bottomButtonContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(6.5),
    paddingTop: moderateScale(6),
    // paddingBottom handled inline for safe area
  },
});

export default EditCityScreen;
