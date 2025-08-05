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
import {
  CustomeSelectorDataOption,
  poojaDataOption,
} from '../../types/cityTypes';
import CustomeMultiSelector from '../../components/CustomeMultiSelector';
import {getPooja} from '../../api/apiService';
import {SelectorDataOption} from './type';
import {useCommonToast} from '../../common/CommonToast';
import CustomeLoader from '../../components/CustomLoader';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../../navigation/AuthNavigator';

type RouteParams = {
  action?: string;
  phoneNumber?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  caste?: string;
  subCaste?: string;
  gotra?: string;
  address?: string;
  selectCityId?: number | string;
  selectedAreasId?: number[];
  profile_img?: any;
};

type ScreenNavigation = StackNavigationProp<
  AuthStackParamList,
  'SelectPoojaScreen'
>;

const SelectPoojaScreen: React.FC = () => {
  const navigation = useNavigation<ScreenNavigation>();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const {t} = useTranslation();
  const {showErrorToast} = useCommonToast();

  const [poojaData, setPoojaData] = useState<poojaDataOption[]>([]);
  const [selectedPoojaId, setSelectedPoojaId] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredPoojaData, setFilteredPoojaData] = useState<poojaDataOption[]>(
    [],
  );

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
    profile_img,
    selectCityId,
    selectedAreasId,
  } = route.params || {};

  const action = route.params?.action;

  useEffect(() => {
    fetchPoojaData();
  }, []);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredPoojaData(poojaData);
    } else {
      const lowerSearch = searchText.toLowerCase();
      setFilteredPoojaData(
        poojaData.filter(
          item =>
            item.title?.toLowerCase().includes(lowerSearch) ||
            item.short_description?.toLowerCase().includes(lowerSearch),
        ),
      );
    }
  }, [searchText, poojaData]);

  const fetchPoojaData = async () => {
    setIsLoading(true);
    try {
      const response = (await getPooja()) as SelectorDataOption;
      const data = response?.data || [];
      const mappedData: poojaDataOption[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        short_description: item.short_description,
      }));
      setPoojaData(mappedData);
      setFilteredPoojaData(mappedData);
    } catch (error: any) {
      showErrorToast(error?.message);
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

  const handleNext = () => {
    const selectedPooja = poojaData.filter(area =>
      selectedPoojaId.includes(area.id),
    );
    if (selectedPooja.length > 0) {
      navigation.navigate('SelectLanguageScreen', {
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
      <View style={[styles.container, {paddingTop: insets.top}]}>
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
              <Text style={styles.selectCityTitle}>{t('select_pooja')}</Text>
              <Text style={styles.description}>{t('select_pooja_desc')}</Text>
              <CustomeMultiSelector
                data={filteredPoojaData}
                selectedDataIds={selectedPoojaId}
                onDataSelect={handlePoojaSelect}
                searchPlaceholder={t('select_pooja')}
                isMultiSelect={true}
                onSearch={setSearchText}
              />
              {filteredPoojaData.length === 0 && searchText.trim() !== '' && (
                <Text style={styles.noDataText}>
                  {t('no_pooja_found') || 'No pooja found'}
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
            disabled={selectedPoojaId.length === 0}
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
  buttonContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(6.5),
  },
  noDataText: {
    color: COLORS.lighttext,
    fontSize: moderateScale(14),
    fontFamily: Fonts.Sen_Regular,
    marginTop: moderateScale(12),
    textAlign: 'center',
  },
});

export default SelectPoojaScreen;
