import React, {useEffect, useState, useRef, useCallback} from 'react';
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
import {poojaDataOption} from '../../types/cityTypes';
import CustomeMultiSelector from '../../components/CustomeMultiSelector';
import {getPanditPooja, getPooja, putPanditPooja} from '../../api/apiService';
import {useCommonToast} from '../../common/CommonToast';
import CustomeLoader from '../../components/CustomLoader';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../../navigation/AuthNavigator';
import {translateData} from '../../utils/TranslateData';

type ScreenNavigation = StackNavigationProp<
  AuthStackParamList,
  'SelectPoojaScreen'
>;

const EditPanditPoojaScreen: React.FC = () => {
  const navigation = useNavigation<ScreenNavigation>();
  const insets = useSafeAreaInsets();
  const {t, i18n} = useTranslation();
  const {showErrorToast, showSuccessToast} = useCommonToast();

  const [originalPoojaData, setOriginalPoojaData] = useState<poojaDataOption[]>(
    [],
  );
  const [poojaData, setPoojaData] = useState<poojaDataOption[]>([]);
  const [filteredPoojaData, setFilteredPoojaData] = useState<poojaDataOption[]>(
    [],
  );
  const [selectedPoojaId, setSelectedPoojaId] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState<string>('');

  const currentLanguage = i18n.language;
  const translationCacheRef = useRef<Map<string, any>>(new Map());

  // Fetch all puja list and selected puja list on mount
  useEffect(() => {
    fetchAllPujaAndSelected();
  }, [currentLanguage]);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredPoojaData(poojaData);
    } else {
      const lower = searchText.toLowerCase();

      setFilteredPoojaData(
        poojaData.filter((item: any) => {
          const titleMatch = item.title?.toLowerCase().includes(lower);
          const originalMatch = item.originalTitle
            ?.toLowerCase()
            .includes(lower);
          return titleMatch || originalMatch;
        }),
      );
    }
  }, [searchText, poojaData]);

  const fetchAllPujaAndSelected = useCallback(async () => {
    setIsLoading(true);
    try {
      const cachedData = translationCacheRef.current.get(currentLanguage);
      if (cachedData) {
        setPoojaData(cachedData);
        setFilteredPoojaData(cachedData);
      } else {
        // 🔹 Fetch all puja list
        const allPujaResponse = await getPooja();
        const allPujaData = Array.isArray(allPujaResponse)
          ? allPujaResponse
          : Array.isArray((allPujaResponse as any)?.data)
          ? (allPujaResponse as any).data
          : [];

        const mappedAllPuja: poojaDataOption[] = allPujaData.map(
          (item: any) => ({
            id: item.id,
            title: item.title,
            short_description: item.short_description,
          }),
        );

        // 🧠 Store original un-translated data for English search
        setOriginalPoojaData(mappedAllPuja);

        // 🌍 Translate puja data fields
        const translatedData: any = await translateData(
          mappedAllPuja,
          currentLanguage,
          ['title', 'short_description'],
        );

        // 🪄 Add English fallback (dual titles) for search
        const finalData = translatedData.map((item: any, index: number) => ({
          ...item,
          originalTitle: mappedAllPuja[index].title, // for English search
        }));

        translationCacheRef.current.set(currentLanguage, finalData);
        setPoojaData(finalData);
        setFilteredPoojaData(finalData);
      }

      // 🔹 Fetch selected puja ids
      const selectedPujaResponse = await getPanditPooja();
      const selectedPujaData = Array.isArray(
        (selectedPujaResponse as any)?.data?.poojas,
      )
        ? (selectedPujaResponse as any).data.poojas
        : Array.isArray((selectedPujaResponse as any)?.poojas)
        ? (selectedPujaResponse as any).poojas
        : [];

      const selectedIds: number[] = Array.isArray(selectedPujaData)
        ? selectedPujaData
            .filter(
              (item: any) =>
                typeof item === 'object' && item !== null && 'pooja' in item,
            )
            .map((item: any) => item.pooja)
        : [];

      setSelectedPoojaId(selectedIds);
    } catch (error: any) {
      showErrorToast(error?.message || 'Failed to fetch pooja list');
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage, translationCacheRef]);

  const handlePoojaSelect = (poojaId: number) => {
    setSelectedPoojaId(prev =>
      prev.includes(poojaId)
        ? prev.filter(id => id !== poojaId)
        : [...prev, poojaId],
    );
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  const handleNext = async () => {
    const selectedPooja = originalPoojaData.filter(area =>
      selectedPoojaId.includes(area.id),
    );

    if (selectedPooja.length === 0) {
      showErrorToast(t('please_select_pooja') || 'Please select pooja');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {pooja_ids: selectedPoojaId};
      await putPanditPooja(payload);
      showSuccessToast(
        t('puja_updated_successfully') || 'Pooja updated successfully',
      );
      navigation.goBack();
    } catch (error: any) {
      showErrorToast(error?.message || 'Failed to update pooja');
    } finally {
      setIsLoading(false);
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
        <CustomHeader title={t('edit_puja_list')} showBackButton={true} />

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
                <Text style={styles.selectCityTitle}>{t('select_pooja')}</Text>
                <Text style={styles.description}>{t('select_pooja_desc')}</Text>
                <CustomeMultiSelector
                  data={filteredPoojaData}
                  selectedDataIds={selectedPoojaId}
                  onDataSelect={handlePoojaSelect}
                  searchPlaceholder={t('select_pooja')}
                  isMultiSelect={true}
                  onSearch={handleSearch}
                />
                {filteredPoojaData.length === 0 && searchText.trim() !== '' && (
                  <Text style={styles.noResultText}>
                    {t('no_pooja_found') || 'No Pooja found'}
                  </Text>
                )}
              </View>
            </ScrollView>
            <View
              style={[
                styles.bottomButtonContainer,
                {paddingBottom: moderateScale(16)},
              ]}>
              <PrimaryButton
                title={t('update')}
                onPress={handleNext}
                style={styles.nextButton}
                disabled={selectedPoojaId.length === 0}
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
  },
});

export default EditPanditPoojaScreen;
