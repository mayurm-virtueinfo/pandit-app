import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS, wp } from '../../theme/theme';
import Fonts from '../../theme/fonts';
import PrimaryButton from '../../components/PrimaryButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import CustomHeader from '../../components/CustomHeader';
import { useTranslation } from 'react-i18next';
import { poojaDataOption } from '../../types/cityTypes';
import CustomeMultiSelector from '../../components/CustomeMultiSelector';
import { getPooja } from '../../api/apiService';
import { SelectorDataOption } from './type';
import { useCommonToast } from '../../common/CommonToast';
import CustomeLoader from '../../components/CustomLoader';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

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

const PAGE_SIZE = 20;

const SelectPoojaScreen: React.FC = () => {
  const navigation = useNavigation<ScreenNavigation>();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const { t } = useTranslation();
  const { showErrorToast } = useCommonToast();

  const [poojaData, setPoojaData] = useState<poojaDataOption[]>([]);
  const [selectedPoojaId, setSelectedPoojaId] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredPoojaData, setFilteredPoojaData] = useState<poojaDataOption[]>(
    [],
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const firstMountRef = useRef(true);

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

  const fetchPoojaData = useCallback(
    async (fetchPage: number, reset: boolean = false) => {
      if (reset) {
        setIsLoading(true);
      } else {
        setLoadingMore(true);
      }
      try {
        const params: any = { page: fetchPage };
        if (searchText.trim()) params.search = searchText.trim();

        const response = await getPooja(params);
        const data = response && response.data ? response.data : response;

        // Support .results (paginated) and [] in .data fallback
        const mappedData: poojaDataOption[] = (data.results || []).map(
          (item: any) => ({
            id: item.id,
            title: item.title,
            short_description: item.short_description,
            image_url: item.image_url,
          }),
        );

        if (reset) {
          setPoojaData(mappedData);
          setFilteredPoojaData(mappedData);
        } else {
          setPoojaData(prev => [...prev, ...mappedData]);
          setFilteredPoojaData(prev => [...prev, ...mappedData]);
        }

        setTotalPages(
          data.total_pages ?? Math.ceil((data.count || 0) / PAGE_SIZE),
        );
        setHasMore(
          data.next !== null ||
            !!(data.total_pages && fetchPage < data.total_pages),
        );
      } catch (error: any) {
        showErrorToast(error?.message);
      } finally {
        setIsLoading(false);
        setLoadingMore(false);
      }
    },
    [showErrorToast, searchText],
  );

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setTotalPages(1);
    setPoojaData([]);
    setFilteredPoojaData([]);
    fetchPoojaData(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || isLoading) return;
    if (!hasMore || page >= totalPages) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPoojaData(nextPage);
  }, [fetchPoojaData, hasMore, isLoading, loadingMore, page, totalPages]);

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
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
                onEndReached={handleLoadMore}
                loadingMore={loadingMore}
                onEndReachedThreshold={0.2}
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
            { paddingBottom: insets.bottom + moderateScale(12) },
          ]}
        >
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
