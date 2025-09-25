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
  email?: string;
  profile_img?: any;
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
  const [searchText, setSearchText] = useState('');
  const [filteredAreas, setFilteredAreas] = useState<
    CustomeSelectorDataOption[]
  >([]);

  const {
    phoneNumber,
    email,
    firstName,
    lastName,
    city,
    caste,
    subCaste,
    gotra,
    address,
    selectCityId,
    profile_img,
  } = route.params || {};

  const action = route.params?.action;

  useEffect(() => {
    fetchAreaData();
  }, [selectCityId]);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredAreas(areas);
    } else {
      const lower = searchText.toLowerCase();
      setFilteredAreas(
        areas.filter(area => area.name.toLowerCase().includes(lower)),
      );
    }
  }, [searchText, areas]);

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
      setFilteredAreas(mappedData);
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
        email: email ?? '',
        profile_img: profile_img,
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

  // For debugging
  // console.log('selectedAreaIds :: ', selectedAreaIds);

  const buttonText = action === 'Update' ? t('update') : t('next');

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <CustomeLoader loading={isLoading} />
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={[styles.container]}>
        <CustomHeader
          title={t('complete_your_profile')}
          showBackButton={true}
        />

        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <View style={styles.contentContainer}>
            <View style={styles.mainContent}>
              <Text style={styles.selectCityTitle}>{t('select_area')}</Text>
              <Text style={styles.description}>
                {t('select_area_description')}
              </Text>
              <CustomeMultiSelector
                data={filteredAreas}
                selectedDataIds={selectedAreaIds}
                onDataSelect={handleAreaSelect}
                searchPlaceholder={t('search_area')}
                isMultiSelect={true}
                onSearch={setSearchText}
              />
              {filteredAreas.length === 0 && searchText.trim() !== '' && (
                <Text style={styles.noDataText}>
                  {t('no_area_found') || 'No area found'}
                </Text>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
        <View
          style={[
            styles.buttonContainer,
            {paddingBottom: insets.bottom + moderateScale(12)},
          ]}>
          <PrimaryButton
            title={buttonText}
            onPress={handleNext}
            style={styles.nextButton}
            disabled={selectedAreaIds.length === 0}
          />
        </View>
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
  noDataText: {
    color: COLORS.lighttext,
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_Regular,
    marginTop: moderateScale(16),
    textAlign: 'center',
  },
  buttonContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(6.5),
    paddingTop: moderateScale(8),
  },
  nextButton: {
    height: moderateScale(46),
    marginTop: 0,
  },
});

export default SelectAreaScreen;
