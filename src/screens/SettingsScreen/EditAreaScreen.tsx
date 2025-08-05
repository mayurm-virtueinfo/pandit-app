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
import {getAreas, putServiceArea} from '../../api/apiService';
import CustomeLoader from '../../components/CustomLoader';
import {StackNavigationProp} from '@react-navigation/stack';
import {SettingsStackParamList} from '../../navigation/SettingsStack/SettingsStack';
import {SelectorDataOption} from '../Auth/type';

type AreaItem = {
  area: number;
  area_name: string;
  city: number;
  city_name: string;
};

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
  selectCityId?: number;
  email?: string;
  profile_img?: any;
  area?: AreaItem[];
};

type ScreenNavigationProp = StackNavigationProp<
  SettingsStackParamList,
  'EditAreaScreen'
>;

const EditAreaScreen: React.FC = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();

  const {showErrorToast, showSuccessToast} = useCommonToast();
  const [areas, setAreas] = useState<CustomeSelectorDataOption[]>([]);
  const [selectedAreaIds, setSelectedAreaIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredAreas, setFilteredAreas] = useState<
    CustomeSelectorDataOption[]
  >([]);

  const {selectCityId, area} = route.params || {};
  // area is expected to be AreaItem[] or undefined

  // Set selectedAreaIds from area prop after areas are loaded
  useEffect(() => {
    if (area && Array.isArray(area) && areas.length > 0) {
      // area is an array of { area: number, ... }
      const areaIds = area.map((a: AreaItem) => a.area);
      // Only set those areaIds that exist in the loaded areas
      const validAreaIds = areas
        .map(a => a.id)
        .filter(id => areaIds.includes(id));
      setSelectedAreaIds(validAreaIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area, areas]);

  useEffect(() => {
    fetchAreaData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectCityId]);

  useEffect(() => {
    // Filter areas based on searchText
    if (searchText.trim() === '') {
      setFilteredAreas(areas);
    } else {
      setFilteredAreas(
        areas.filter(area =>
          area.name.toLowerCase().includes(searchText.trim().toLowerCase()),
        ),
      );
    }
  }, [areas, searchText]);

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

  const handleNext = async () => {
    const selectedAreas = areas.filter(area =>
      selectedAreaIds.includes(area.id),
    );
    if (selectedAreas.length === 0) {
      showErrorToast('Please select Area');
      return;
    }

    setIsLoading(true);
    try {
      // Prepare data for putServiceArea as { service_areas: [{city, area}, ...] }
      // selectCityId is always a number here
      const service_areas = selectedAreaIds.map(areaId => ({
        city: Number(selectCityId),
        area: areaId,
      }));
      const payload = {service_areas};
      await putServiceArea(payload);
      // Optionally, show a success toast or navigate back
      showSuccessToast(t('area_updated_successfully'));
      navigation.replace('SettingsScreen');
    } catch (error: any) {
      showErrorToast(error?.message || 'Failed to update area');
    } finally {
      setIsLoading(false);
    }
  };

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
        <CustomHeader title={t('edit_area')} showBackButton={true} />

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
                  data={filteredAreas}
                  selectedDataIds={selectedAreaIds}
                  onDataSelect={handleAreaSelect}
                  searchPlaceholder={t('search_area')}
                  isMultiSelect={true}
                  onSearch={handleSearch}
                />
                {filteredAreas.length === 0 && searchText.trim() !== '' && (
                  <Text style={styles.noResultText}>
                    {t('no_area_found') || 'No area found'}
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
                title={t('update')}
                onPress={handleNext}
                style={styles.nextButton}
                disabled={selectedAreaIds.length === 0}
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
    marginTop: moderateScale(0),
  },
  bottomButtonContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(6.5),
    paddingTop: moderateScale(8),
    // paddingBottom handled inline for safe area
  },
  noResultText: {
    color: COLORS.lighttext,
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_Regular,
    textAlign: 'center',
    marginTop: moderateScale(24),
  },
});

export default EditAreaScreen;
