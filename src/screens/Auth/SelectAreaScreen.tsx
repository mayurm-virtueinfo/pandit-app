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
import CustomeMultiSelector from '../../components/CustomeMultiSelector';
import {useCommonToast} from '../../common/CommonToast';
import {getAreas} from '../../api/apiService';
import {SelectorDataOption} from './type';
import CustomeLoader from '../../components/CustomLoader';
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
};

type ScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'SelectAreaScreen'
>;

const SelectAreaScreen: React.FC = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();

  const {showErrorToast} = useCommonToast();
  const [areas, setAreas] = useState<CustomeSelectorDataOption[]>([]);
  const [selectedAreaIds, setSelectedAreaIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
  } = route.params || {};

  const action = route.params?.action;

  useEffect(() => {
    fetchAreaData();
  }, [selectCityId]);

  const fetchAreaData = async () => {
    setIsLoading(true);
    try {
      const response = (await getAreas(selectCityId)) as SelectorDataOption;
      const data = response?.data || [];
      const mappedData: CustomeSelectorDataOption[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
      }));
      setAreas(mappedData);
    } catch (error: any) {
      showErrorToast(error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAreaSelect = (areaId: number) => {
    setSelectedAreaIds(prev =>
      prev.includes(areaId)
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId],
    );
  };

  const handleNext = () => {
    const selectedAreas = areas.filter(area =>
      selectedAreaIds.includes(area.id),
    );
    if (selectedAreas.length > 0) {
      navigation.navigate('SelectPoojaScreen', {
        phoneNumber: phoneNumber ?? '',
        firstName: firstName ?? '',
        lastName: lastName ?? '',
        city: city ?? '',
        caste: caste ?? '',
        subCaste: subCaste ?? '',
        gotra: gotra ?? '',
        address: address ?? '',
        selectCityId: selectCityId ?? '',
        selectedAreasId: selectedAreaIds ?? [],
      });
    } else {
      showErrorToast('Please select Area');
    }
  };

  console.log('selectedAreaIds :: ', selectedAreaIds);

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
                <Text style={styles.selectCityTitle}>{t('select_area')}</Text>
                <Text style={styles.description}>
                  {t('select_area_description')}
                </Text>
                <CustomeMultiSelector
                  data={areas}
                  selectedDataIds={selectedAreaIds}
                  onDataSelect={handleAreaSelect}
                  searchPlaceholder={t('search_area')}
                  isMultiSelect={true}
                />
                <PrimaryButton
                  title={buttonText}
                  onPress={handleNext}
                  style={styles.nextButton}
                  disabled={selectedAreaIds.length === 0}
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

export default SelectAreaScreen;
