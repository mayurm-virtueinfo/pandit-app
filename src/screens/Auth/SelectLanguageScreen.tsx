import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {COLORS, wp} from '../../theme/theme';
import Fonts from '../../theme/fonts';
import PrimaryButton from '../../components/PrimaryButton';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {moderateScale} from 'react-native-size-matters';
import CustomHeader from '../../components/CustomHeader';
import {useTranslation} from 'react-i18next';
import {CustomeSelectorDataOption} from '../../types/cityTypes';
import CustomeMultiSelector from '../../components/CustomeMultiSelector';
import {getLanguage} from '../../api/apiService';
import CustomeLoader from '../../components/CustomLoader';
import {useCommonToast} from '../../common/CommonToast';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../../navigation/AuthNavigator';
import {translateData} from '../../utils/TranslateData';

type RouteParams = {
  action?: string;
  phoneNumber?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  city?: string;
  caste?: string;
  subCaste?: string;
  gotra?: string;
  address?: string;
  profile_img?: any;
  selectCityId?: number | string;
  selectedAreasId?: number[];
  selectedPoojaId?: number[];
};

type ScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'SelectLanguageScreen'
>;

const SelectLanguageScreen: React.FC = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const {t, i18n} = useTranslation();
  const {showErrorToast} = useCommonToast();

  const [languages, setLanguages] = useState<CustomeSelectorDataOption[]>([]);
  const [originalLanguages, setOriginalLanguages] = useState<
    CustomeSelectorDataOption[]
  >([]);
  const [filteredLanguages, setFilteredLanguages] = useState<
    CustomeSelectorDataOption[]
  >([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState<string>('');

  const currentLanguage = i18n.language;
  const translationCacheRef = useRef<Map<string, any>>(new Map());
  const action = route.params?.action;

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
    selectCityId,
    selectedAreasId,
    selectedPoojaId,
  } = route.params || {};

  /** ✅ Fetch all languages with translation and caching */
  const fetchLanguageData = useCallback(async () => {
    setIsLoading(true);
    try {
      const cachedData = translationCacheRef.current.get(currentLanguage);

      if (cachedData) {
        setLanguages(cachedData);
        setFilteredLanguages(cachedData);
      } else {
        const response: any = await getLanguage();
        const data = response?.data ?? [];

        const mappedData: CustomeSelectorDataOption[] = data.map(
          (item: any) => ({
            id: item.id,
            name: item.name,
          }),
        );

        setOriginalLanguages(mappedData);

        const translatedData: any = await translateData(
          mappedData,
          currentLanguage,
          ['name'],
        );

        translationCacheRef.current.set(currentLanguage, translatedData);
        setLanguages(translatedData);
        setFilteredLanguages(translatedData);
      }
    } catch (error: any) {
      showErrorToast(error?.message || 'Failed to fetch languages');
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage]);

  useEffect(() => {
    fetchLanguageData();
  }, [fetchLanguageData]);

  /** ✅ Dual-language search (original + translated) */
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredLanguages(languages);
    } else {
      const lowerText = searchText.toLowerCase();
      setFilteredLanguages(
        languages.filter(lang => {
          const translatedMatch = lang.name?.toLowerCase()?.includes(lowerText);
          const originalMatch = originalLanguages
            .find(orig => orig.id === lang.id)
            ?.name?.toLowerCase()
            ?.includes(lowerText);
          return translatedMatch || originalMatch;
        }),
      );
    }
  }, [searchText, languages, originalLanguages]);

  const handleLanguageSelect = (languageId: number) => {
    setSelectedLanguageId(prev =>
      prev.includes(languageId)
        ? prev.filter(id => id !== languageId)
        : [...prev, languageId],
    );
  };

  const handleNext = () => {
    if (!selectedLanguageId.length) {
      showErrorToast(t('please_select_language') || 'Please select a language');
      return;
    }

    navigation.navigate('DocumentUploadScreen', {
      phoneNumber: phoneNumber ?? '',
      email: email ?? '',
      firstName: firstName ?? '',
      lastName: lastName ?? '',
      city: city ?? '',
      caste: caste ?? '',
      subCaste: subCaste ?? '',
      gotra: gotra ?? '',
      address: address ?? '',
      profile_img: profile_img ?? '',
      selectCityId: selectCityId ?? '',
      selectedAreasId: selectedAreasId ?? [],
      selectedPoojaId: selectedPoojaId ?? [],
      selectedLanguageId: selectedLanguageId ?? [],
      dob: dob ?? '',
    });
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  const buttonText = action === 'Update' ? t('update') : t('next');
  const showNoResult =
    searchText.trim().length > 0 && filteredLanguages.length === 0;

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <CustomeLoader loading={isLoading} />
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <CustomHeader title={t('complete_your_profile')} showBackButton={true} />

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
              <Text style={styles.selectCityTitle}>{t('select_language')}</Text>
              <Text style={styles.description}>
                {t('select_language_desc')}
              </Text>

              <CustomeMultiSelector
                data={filteredLanguages}
                selectedDataIds={selectedLanguageId}
                onDataSelect={handleLanguageSelect}
                searchPlaceholder={t('search_language')}
                isMultiSelect={true}
                onSearch={handleSearch}
              />

              {showNoResult && (
                <Text style={styles.noResultText}>
                  {t('no_language_found') || 'No language found'}
                </Text>
              )}
            </View>
          </ScrollView>

          <View style={styles.bottomButtonContainer}>
            <PrimaryButton
              title={buttonText}
              onPress={handleNext}
              style={styles.nextButton}
              disabled={!selectedLanguageId.length}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.primaryBackground},
  keyboardAvoidingView: {flex: 1},
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
  },
  scrollView: {flex: 1},
  scrollContentContainer: {flexGrow: 1, paddingBottom: 0},
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
  nextButton: {height: moderateScale(46)},
  bottomButtonContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(6.5),
    paddingTop: moderateScale(8),
    paddingBottom: moderateScale(16),
  },
  noResultText: {
    color: COLORS.lighttext,
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_Regular,
    marginTop: moderateScale(16),
    textAlign: 'center',
  },
});

export default SelectLanguageScreen;
