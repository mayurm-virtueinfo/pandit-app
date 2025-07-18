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

  console.log('route.params : ', route.params);

  const [poojaData, setPoojaData] = useState<poojaDataOption[]>([]);

  const [selectedPoojaId, setSelectedPoojaId] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  console.log('selectedPoojaId :: ', selectedPoojaId);

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
                  title={buttonText}
                  onPress={handleNext}
                  style={styles.nextButton}
                  disabled={!selectedPoojaId}
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

export default SelectPoojaScreen;
