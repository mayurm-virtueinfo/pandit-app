import React, {useEffect, useState} from 'react';
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

type ScreenNavigationProp = StackNavigationProp<
  SettingsStackParamList,
  'EditCityScreen'
>;

const EditCityScreen: React.FC = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();
  const {showErrorToast} = useCommonToast();

  const [cities, setCities] = useState<CustomeSelectorDataOption[]>([]);
  const [data, setData] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [filteredCities, setFilteredCities] = useState<
    CustomeSelectorDataOption[]
  >([]);

  useEffect(() => {
    fetchCityAndServiceArea();
  }, []);

  useEffect(() => {
    // Filter cities based on searchText
    if (searchText.trim() === '') {
      setFilteredCities(cities);
    } else {
      const lowerSearch = searchText.toLowerCase();
      setFilteredCities(
        cities.filter(city => city.name.toLowerCase().includes(lowerSearch)),
      );
    }
  }, [searchText, cities]);

  const fetchCityAndServiceArea = async () => {
    setIsLoading(true);
    try {
      // Fetch all cities
      const cityResponse = await getCity();
      // Defensive: cityResponse may be array or object with .data, or fallback to []
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
      setCities(mappedData);
      setFilteredCities(mappedData);

      // Fetch current service area to get city_id
      const serviceAreaResponse = await getServiceArea();
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
    } finally {
      setIsLoading(false);
    }
  };

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
      navigation.navigate('EditAreaScreen', {
        selectCityId: selectedCityId ?? '',
        area: data,
      });
    } else {
      showErrorToast('Please select city');
    }
  };

  // Custom search handler for CustomSelector
  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  return (
    <View style={styles.container}>
      <CustomeLoader loading={isLoading} />
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={[styles.container, {paddingTop: insets.top}]}>
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
                {paddingBottom: insets.bottom || moderateScale(16)},
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
    paddingTop: moderateScale(12),
    // paddingBottom handled inline for safe area
  },
});

export default EditCityScreen;
