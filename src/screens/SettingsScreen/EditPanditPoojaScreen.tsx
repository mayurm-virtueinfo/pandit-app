import React, {useEffect, useState, useRef, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
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

type ScreenNavigation = StackNavigationProp<
  AuthStackParamList,
  'SelectPoojaScreen'
>;

const PAGE_SIZE = 10;

const EditPanditPoojaScreen: React.FC = () => {
  const navigation = useNavigation<ScreenNavigation>();
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();
  const {showErrorToast, showSuccessToast} = useCommonToast();

  /* ------------------- STATE ------------------- */
  const [poojaData, setPoojaData] = useState<poojaDataOption[]>([]);
  const [selectedPoojaId, setSelectedPoojaId] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchText, setSearchText] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [hasNext, setHasNext] = useState<boolean>(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /* ------------------- INITIAL FETCH ------------------- */
  useEffect(() => {
    fetchAllPujaAndSelected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------- DEBOUNCED SEARCH ------------------- */
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      resetAndSearch();
    }, 350);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  /* ------------------- FETCH ALL + SELECTED ------------------- */
  const fetchAllPujaAndSelected = async () => {
    setIsLoading(true);
    try {
      const first = await getPooja({page: 1});
      const firstList: poojaDataOption[] = (first?.data?.results || []).map(
        (item: any) => ({
          id: item.id,
          title: item.title,
          short_description: item.short_description,
        }),
      );
      setPoojaData(firstList);
      setPage(1);
      setHasNext(!!first?.data?.next);

      const selectedResp = await getPanditPooja();
      const raw =
        (selectedResp as any)?.data?.poojas ??
        (selectedResp as any)?.poojas ??
        [];
      const selectedIds: number[] = Array.isArray(raw)
        ? raw
            .filter((i: any) => typeof i === 'object' && i.pooja != null)
            .map((i: any) => i.pooja)
        : [];
      setSelectedPoojaId(selectedIds);
    } catch (e: any) {
      showErrorToast(e?.message ?? 'Failed to load pooja list');
      setPoojaData([]);
    } finally {
      setIsLoading(false);
      setInitialLoad(false);
    }
  };

  /* ------------------- SEARCH / RESET ------------------- */
  const resetAndSearch = async () => {
    setIsLoading(true);
    setPage(1);
    setHasNext(true);
    try {
      const params: any = {page: 1};
      if (searchText.trim()) params.search = searchText.trim();

      const res = await getPooja(params);
      const items: poojaDataOption[] = (res?.data?.results || []).map(
        (i: any) => ({
          id: i.id,
          title: i.title,
          short_description: i.short_description,
        }),
      );
      setPoojaData(items);
      setHasNext(!!res?.data?.next);
    } catch {
      setPoojaData([]);
      setHasNext(false);
    } finally {
      setIsLoading(false);
    }
  };

  /* ------------------- LOAD MORE ------------------- */
  const handleLoadMore = useCallback(async () => {
    if (!hasNext || isLoadingMore || isLoading) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const params: any = {page: nextPage};
      if (searchText.trim()) params.search = searchText.trim();

      const res = await getPooja(params);
      const newItems: poojaDataOption[] = (res?.data?.results || []).map(
        (i: any) => ({
          id: i.id,
          title: i.title,
          short_description: i.short_description,
        }),
      );

      if (newItems.length) {
        setPoojaData(prev => [...prev, ...newItems]);
        setPage(nextPage);
        setHasNext(!!res?.data?.next);
      } else {
        setHasNext(false);
      }
    } catch (e) {
      console.error(e);
      setHasNext(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasNext, isLoadingMore, isLoading, page, searchText]);

  /* ------------------- SELECTION ------------------- */
  const handlePoojaSelect = (poojaId: number) => {
    setSelectedPoojaId(prev =>
      prev.includes(poojaId)
        ? prev.filter(id => id !== poojaId)
        : [...prev, poojaId],
    );
  };

  const handleSearch = (text: string) => setSearchText(text);

  /* ------------------- SUBMIT ------------------- */
  const handleNext = async () => {
    if (!selectedPoojaId.length) {
      showErrorToast(t('please_select_pooja') || 'Please select pooja');
      return;
    }
    setIsLoading(true);
    try {
      await putPanditPooja({pooja_ids: selectedPoojaId});
      showSuccessToast(
        t('puja_updated_successfully') || 'Pooja updated successfully',
      );
      navigation.goBack();
    } catch (e: any) {
      showErrorToast(e?.message || 'Failed to update pooja');
    } finally {
      setIsLoading(false);
    }
  };

  /* ------------------- SELECTOR PROPS ------------------- */
  const selectorProps = useMemo(
    () => ({
      data: poojaData,
      selectedDataIds: selectedPoojaId,
      onDataSelect: handlePoojaSelect,
      searchPlaceholder: t('select_pooja'),
      onSearch: handleSearch,
      onEndReached: handleLoadMore,
      onEndReachedThreshold: 0.3,
      loadingMore: isLoadingMore,
    }),
    [
      poojaData,
      selectedPoojaId,
      handlePoojaSelect,
      handleSearch,
      handleLoadMore,
      isLoadingMore,
      t,
    ],
  );

  /* ------------------- RENDER ------------------- */
  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <CustomeLoader loading={isLoading && !initialLoad} />
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <CustomHeader title={t('edit_puja_list')} showBackButton={true} />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <View style={styles.contentContainer}>
          {/* TITLE + DESC */}
          <View style={styles.header}>
            <Text style={styles.selectCityTitle}>{t('select_pooja')}</Text>
            <Text style={styles.description}>{t('select_pooja_desc')}</Text>
          </View>

          {/* LIST – fills remaining space */}
          <View style={styles.listWrapper}>
            <CustomeMultiSelector {...selectorProps} />
          </View>

          {/* NO RESULT */}
          {poojaData.length === 0 && searchText.trim() ? (
            <Text style={styles.noResultText}>
              {t('no_pooja_found') || 'No Pooja found'}
            </Text>
          ) : null}
        </View>
      </KeyboardAvoidingView>

      {/* FIXED UPDATE BUTTON */}
      <View style={styles.bottomButtonContainer}>
        <PrimaryButton
          title={t('update')}
          onPress={handleNext}
          style={styles.nextButton}
          disabled={selectedPoojaId.length === 0}
        />
      </View>
    </View>
  );
};

/* ------------------- STYLES ------------------- */
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
  header: {
    paddingHorizontal: wp(6.5),
    paddingTop: moderateScale(24),
    paddingBottom: moderateScale(12),
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
  listWrapper: {
    flex: 1,
    paddingHorizontal: wp(6.5),
    marginBottom: moderateScale(12),
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
    paddingHorizontal: wp(6.5),
  },
  bottomButtonContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(6.5),
    paddingVertical: moderateScale(12),
    borderTopWidth: 1,
    borderTopColor: COLORS.separatorColor,
  },
});

export default EditPanditPoojaScreen;
