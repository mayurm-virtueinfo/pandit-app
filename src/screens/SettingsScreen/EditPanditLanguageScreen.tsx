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
import CustomeMultiSelector from '../../components/CustomeMultiSelector';
import {
  getLanguage,
  getPanditLanguage,
  putPanditLanguage,
} from '../../api/apiService';
import CustomeLoader from '../../components/CustomLoader';
import {useCommonToast} from '../../common/CommonToast';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../../navigation/AuthNavigator';

type ScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'SelectLanguageScreen'
>;

const EditPanditLanguageScreen: React.FC = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();
  const {showErrorToast, showSuccessToast} = useCommonToast();

  const [languages, setLanguages] = useState<CustomeSelectorDataOption[]>([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState<string>('');
  const [filteredLanguages, setFilteredLanguages] = useState<
    CustomeSelectorDataOption[]
  >([]);

  // Fetch all languages and user's selected languages
  useEffect(() => {
    fetchAllLanguages();
    fetchSelectedLanguages();
  }, []);

  // Fetch all available languages
  const fetchAllLanguages = async () => {
    setIsLoading(true);
    try {
      const response: any = await getLanguage();
      const data = response && response.data ? response.data : [];
      const mappedData: CustomeSelectorDataOption[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
      }));
      setLanguages(mappedData);
      setFilteredLanguages(mappedData);
    } catch (error: any) {
      showErrorToast(error?.message || 'Failed to fetch languages');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's selected languages
  const fetchSelectedLanguages = async () => {
    setIsLoading(true);
    try {
      const response: any = await getPanditLanguage();
      const data =
        response && response?.data?.languages ? response?.data?.languages : [];
      const selectedIds = Array.isArray(data)
        ? data.map((item: any) => item.language_id)
        : [];
      setSelectedLanguageId(selectedIds);
    } catch (error: any) {
      showErrorToast(error?.message || 'Failed to fetch selected languages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageSelect = (languageId: number) => {
    setSelectedLanguageId(prev =>
      prev.includes(languageId)
        ? prev.filter(id => id !== languageId)
        : [...prev, languageId],
    );
  };

  const handleNext = async () => {
    if (!selectedLanguageId.length) return;
    setIsLoading(true);
    try {
      await putPanditLanguage({language_ids: selectedLanguageId});
      showSuccessToast(
        t('language_updated_successfully') || 'Languages updated successfully',
      );
      navigation.goBack();
    } catch (error: any) {
      showErrorToast(error?.message || 'Failed to update languages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (!text.trim()) {
      setFilteredLanguages(languages);
    } else {
      const lowerText = text.toLowerCase();
      setFilteredLanguages(
        languages.filter(lang => lang.name.toLowerCase().includes(lowerText)),
      );
    }
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
        <CustomHeader title={t('edit_language')} showBackButton={true} />
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
                <Text style={styles.selectCityTitle}>
                  {t('select_language')}
                </Text>
                <Text style={styles.description}>
                  {t('select_language_desc')}
                </Text>
                <CustomeMultiSelector
                  data={filteredLanguages}
                  selectedDataIds={selectedLanguageId}
                  onDataSelect={handleLanguageSelect}
                  searchPlaceholder={t('select_language')}
                  isMultiSelect={true}
                  onSearch={handleSearch}
                />
                {filteredLanguages.length === 0 && searchText.trim() !== '' && (
                  <Text style={styles.noResultText}>
                    {t('no_language_found') || 'No language found'}
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
                title={t('update')}
                onPress={handleNext}
                style={styles.nextButton}
                disabled={!selectedLanguageId.length}
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
    paddingTop: moderateScale(6),
  },
  noResultText: {
    color: COLORS.lighttext,
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_Regular,
    marginTop: moderateScale(16),
    textAlign: 'center',
  },
});

export default EditPanditLanguageScreen;
