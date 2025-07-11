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
import {SelectorDataOption} from './type';
import CustomeLoader from '../../components/CustomLoader';
import {useCommonToast} from '../../common/CommonToast';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../../navigation/AuthNavigator';

type RouteParams = {
  action?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  caste?: string;
  subCaste?: string;
  gotra?: string;
  address?: string;
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
  const {t} = useTranslation();
  const {showErrorToast} = useCommonToast();

  const [languages, setLanguages] = useState<CustomeSelectorDataOption[]>([]);

  const [selectedLanguageId, setSelectedLanguageId] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const action = route.params?.action;

  const {
    phoneNumber,
    firstName,
    lastName,
    city,
    caste,
    subCaste,
    gotra,
    address,
    selectCityId,
    selectedAreasId,
    selectedPoojaId,
  } = route.params || {};

  useEffect(() => {
    fetchPoojaData();
  }, []);

  const fetchPoojaData = async () => {
    setIsLoading(true);
    try {
      const response = (await getLanguage()) as SelectorDataOption;
      const data = response?.data || [];
      const mappedData: CustomeSelectorDataOption[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
      }));
      setLanguages(mappedData);
    } catch (error: any) {
      showErrorToast(error?.message);
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

  const handleNext = () => {
    const selectedLanguage = languages.filter(language =>
      selectedLanguageId.includes(language.id),
    );
    if (selectedLanguage.length > 0) {
      navigation.navigate('DocumentUploadScreen', {
        phoneNumber: phoneNumber ?? '',
        firstName: firstName ?? '',
        lastName: lastName ?? '',
        city: city ?? '',
        caste: caste ?? '',
        subCaste: subCaste ?? '',
        gotra: gotra ?? '',
        address: address ?? '',
        selectCityId: selectCityId ?? '',
        selectedAreasId: selectedAreasId ?? [],
        selectedPoojaId: selectedPoojaId ?? [],
        selectedLanguageId: selectedLanguageId ?? [],
      });
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
                <Text style={styles.selectCityTitle}>
                  {t('select_language')}
                </Text>
                <Text style={styles.description}>
                  {t('select_language_desc')}
                </Text>
                <CustomeMultiSelector
                  data={languages}
                  selectedDataIds={selectedLanguageId}
                  onDataSelect={handleLanguageSelect}
                  searchPlaceholder={t('select_language')}
                  isMultiSelect={true}
                />
                <PrimaryButton
                  title={buttonText}
                  onPress={handleNext}
                  style={styles.nextButton}
                  disabled={!selectedLanguageId}
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

export default SelectLanguageScreen;
