import React, {useState} from 'react';
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

type RouteParams = {
  action?: string;
};

const SelectLanguageScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const {t} = useTranslation();

  const [languages] = useState<CustomeSelectorDataOption[]>([
    {
      id: 37,
      name: 'English',
    },
    {
      id: 39,
      name: 'Gujarati',
    },
    {
      id: 38,
      name: 'Hindi',
    },
  ]);

  const [selectedLanguageId, setSelectedLanguageId] = useState<number[]>([]);

  // Get action from route params if present
  const action = route.params?.action;

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
      console.log(
        'Selected language:',
        selectedLanguage.map(language => language.name).join(', '),
      );
    }
  };

  console.log('selectedLanguageId :: ', selectedLanguageId);

  // Set button text based on action
  const buttonText = action === 'Update' ? t('update') : t('next');

  return (
    <View style={styles.container}>
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
