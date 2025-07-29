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
import {poojaDataOption} from '../../types/cityTypes';
import CustomeMultiSelector from '../../components/CustomeMultiSelector';
import {
  getPandingPuja,
  getPanditPooja,
  getPooja,
  putPanditPooja,
} from '../../api/apiService';
import {useCommonToast} from '../../common/CommonToast';
import CustomeLoader from '../../components/CustomLoader';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../../navigation/AuthNavigator';
import {SelectorDataOption} from '../Auth/type';

type ScreenNavigation = StackNavigationProp<
  AuthStackParamList,
  'SelectPoojaScreen'
>;

const EditPanditPoojaScreen: React.FC = () => {
  const navigation = useNavigation<ScreenNavigation>();
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();
  const {showErrorToast, showSuccessToast} = useCommonToast();

  const [poojaData, setPoojaData] = useState<poojaDataOption[]>([]);
  const [selectedPoojaId, setSelectedPoojaId] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all puja list and selected puja list on mount
  useEffect(() => {
    fetchAllPujaAndSelected();
  }, []);

  const fetchAllPujaAndSelected = async () => {
    setIsLoading(true);
    try {
      // Fetch all puja list
      const allPujaResponse = await getPooja();
      const allPujaData = Array.isArray(allPujaResponse)
        ? allPujaResponse
        : Array.isArray((allPujaResponse as any)?.data)
        ? (allPujaResponse as any).data
        : [];
      const mappedAllPuja: poojaDataOption[] = allPujaData.map((item: any) => ({
        id: item.id,
        title: item.title,
        short_description: item.short_description,
      }));
      setPoojaData(mappedAllPuja);

      // Fetch selected puja ids
      const selectedPujaResponse = await getPanditPooja();
      // Try to get the array of selected pujas from either .data.poojas or .poojas, fallback to []
      const selectedPujaData = Array.isArray(
        (selectedPujaResponse as any)?.data?.poojas,
      )
        ? (selectedPujaResponse as any).data.poojas
        : Array.isArray((selectedPujaResponse as any)?.poojas)
        ? (selectedPujaResponse as any).poojas
        : [];
      // Extract the "pooja" field from each object in the array
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
      showErrorToast(error?.message || 'Failed to fetch puja list');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePoojaSelect = (poojaId: number) => {
    setSelectedPoojaId(prev =>
      prev.includes(poojaId)
        ? prev.filter(id => id !== poojaId)
        : [...prev, poojaId],
    );
  };

  const handleNext = async () => {
    const selectedPooja = poojaData.filter(area =>
      selectedPoojaId.includes(area.id),
    );
    if (selectedPooja.length === 0) {
      showErrorToast(t('please_select_pooja') || 'Please select Puja');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {pooja_ids: selectedPoojaId};
      await putPanditPooja(payload);
      showSuccessToast(
        t('puja_updated_successfully') || 'Puja updated successfully',
      );
      navigation.goBack();
    } catch (error: any) {
      showErrorToast(error?.message || 'Failed to update puja');
    } finally {
      setIsLoading(false);
    }
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
                  data={poojaData}
                  selectedDataIds={selectedPoojaId}
                  onDataSelect={handlePoojaSelect}
                  searchPlaceholder={t('select_pooja')}
                  isMultiSelect={true}
                />
                <PrimaryButton
                  title={t('update')}
                  onPress={handleNext}
                  style={styles.nextButton}
                  disabled={selectedPoojaId.length === 0}
                />
              </View>
            </ScrollView>
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

export default EditPanditPoojaScreen;
