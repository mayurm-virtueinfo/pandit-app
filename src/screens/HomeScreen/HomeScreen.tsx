import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Button,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import UserCustomHeader from '../../components/CustomHeader';
import {COLORS, THEMESHADOW} from '../../theme/theme';
import Fonts from '../../theme/fonts';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {useTranslation} from 'react-i18next';
import {
  getPandingPuja,
  getUpcomingPuja,
  getCompletedPuja,
  postUpdateStatus,
  getInProgressPuja,
} from '../../api/apiService';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {HomeStackParamList} from '../../navigation/HomeStack/HomeStack';
import CustomModal from '../../components/CustomModal';
import {useCommonToast} from '../../common/CommonToast';

const {width: screenWidth} = Dimensions.get('window');

interface PujaItem {
  id: string | number;
  pooja_name: string;
  when_is_pooja?: string;
  pooja_image_url?: string;
  booking_date: string;
}

interface PendingPujaItem {
  id: number;
  pooja_name: string;
  when_is_pooja?: string;
  pooja_image_url?: string;
  // Add other fields as needed from the API response
}

interface InProgressPujaItem {
  id: string | number;
  pooja_name: string;
  when_is_pooja?: string;
  pooja_image_url?: string;
  booking_date: string;
  // Add other fields as needed from the API response
}

type ModalType = 'accept' | 'reject' | null;

const HomeScreen: React.FC = () => {
  const {t} = useTranslation();
  const navigation = useNavigation<HomeStackParamList>();
  const inset = useSafeAreaInsets();
  const {showErrorToast} = useCommonToast();
  const [upcomingPujas, setUpcomingPujas] = useState<PujaItem[]>([]);
  const [completedPujas, setCompletedPujas] = useState<PujaItem[]>([]);
  const [pendingPujas, setPendingPujas] = useState<PendingPujaItem[]>([]);
  const [inProgressPujas, setInProgressPujas] = useState<InProgressPujaItem[]>(
    [],
  );
  console.log('pendingPujas', pendingPujas);
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingLoading, setPendingLoading] = useState<boolean>(true);
  const [inProgressLoading, setInProgressLoading] = useState<boolean>(true);
  // Modal state
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedPendingPuja, setSelectedPendingPuja] =
    useState<PendingPujaItem | null>(null);
  // For accept/reject loading
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Refactored: fetchAllPujas as a stable function for reuse
  const fetchAllPujas = useCallback(async () => {
    setLoading(true);
    setPendingLoading(true);
    setInProgressLoading(true);
    try {
      const [
        pendingResponse,
        upcomingResponse,
        completedResponse,
        inProgressResponse,
      ] = await Promise.all([
        getPandingPuja(),
        getUpcomingPuja(),
        getCompletedPuja(),
        getInProgressPuja(),
      ]);

      // Pending Puja
      let pendingList: PendingPujaItem[] = [];
      if (
        pendingResponse &&
        typeof pendingResponse === 'object' &&
        'data' in pendingResponse
      ) {
        const data = (pendingResponse as {data?: unknown}).data;
        pendingList = Array.isArray(data) ? (data as PendingPujaItem[]) : [];
      } else if (Array.isArray(pendingResponse)) {
        pendingList = pendingResponse;
      }
      setPendingPujas(pendingList);

      // Upcoming Puja
      let upcomingList: PujaItem[] = [];
      if (
        upcomingResponse &&
        typeof upcomingResponse === 'object' &&
        'data' in upcomingResponse
      ) {
        const data = (upcomingResponse as {data?: unknown}).data;
        upcomingList = Array.isArray(data) ? (data as PujaItem[]) : [];
      } else if (Array.isArray(upcomingResponse)) {
        upcomingList = upcomingResponse;
      }
      setUpcomingPujas(upcomingList);

      // Completed Puja
      let completedList: PujaItem[] = [];
      if (
        completedResponse &&
        typeof completedResponse === 'object' &&
        'data' in completedResponse
      ) {
        const data = (completedResponse as {data?: unknown}).data;
        completedList = Array.isArray(data) ? (data as PujaItem[]) : [];
      } else if (Array.isArray(completedResponse)) {
        completedList = completedResponse;
      }
      setCompletedPujas(completedList);

      // In-Progress Puja
      let inProgressList: InProgressPujaItem[] = [];
      if (
        inProgressResponse &&
        typeof inProgressResponse === 'object' &&
        'data' in inProgressResponse
      ) {
        const data = (inProgressResponse as {data?: unknown}).data;
        inProgressList = Array.isArray(data)
          ? (data as InProgressPujaItem[])
          : [];
      } else if (Array.isArray(inProgressResponse)) {
        inProgressList = inProgressResponse;
      }
      setInProgressPujas(inProgressList);
    } catch (error) {
      setPendingPujas([]);
      setUpcomingPujas([]);
      setCompletedPujas([]);
      setInProgressPujas([]);
    } finally {
      setPendingLoading(false);
      setLoading(false);
      setInProgressLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchAllPujas();
    }, []),
  );

  // Modal handlers
  const openModal = (type: ModalType, item: PendingPujaItem) => {
    setModalType(type);
    setSelectedPendingPuja(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalType(null);
    setSelectedPendingPuja(null);
    setActionLoading(false);
  };

  const handleAccept = (item: PendingPujaItem) => {
    openModal('accept', item);
  };

  const handleReject = (item: PendingPujaItem) => {
    openModal('reject', item);
  };
  // After accept/reject, set loading and reload all API
  const confirmModalAction = async () => {
    if (!selectedPendingPuja) return;
    setActionLoading(true);
    setLoading(true); // Show loading page
    setPendingLoading(true);
    setInProgressLoading(true);
    try {
      const status =
        modalType === 'accept'
          ? 'accept'
          : modalType === 'reject'
          ? 'reject'
          : '';
      await postUpdateStatus({
        booking_id: selectedPendingPuja.id,
        action: status,
      });
      // Instead of just removing from pending, reload all data
      await fetchAllPujas();
    } catch (error) {
      // Extract error message from API response
      let errorMsg = 'Something went wrong';
      if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      showErrorToast(errorMsg);
      // setPendingPujas([]);
      // setUpcomingPujas([]);
      // setCompletedPujas([]);
      // setInProgressPujas([]);
      setLoading(false);
      setActionLoading(false);
      setPendingLoading(false);
      setInProgressLoading(false);
    } finally {
      setLoading(false);
      setActionLoading(false);
      setPendingLoading(false);
      setInProgressLoading(false);
      closeModal();
    }
  };

  const renderPujaItem = (item: PujaItem, isLast: boolean) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('PujaDetailsScreen', {id: item.id})}>
      <View style={styles.pujaItem}>
        <Image source={{uri: item.pooja_image_url}} style={styles.pujaImage} />
        <View style={styles.pujaContent}>
          <Text style={styles.pujaName}>{item.pooja_name}</Text>
          <Text
            style={
              styles.pujaDate
            }>{`Scheduled on ${item.when_is_pooja}`}</Text>
        </View>
      </View>
      {!isLast && <View style={styles.separator} />}
    </TouchableOpacity>
  );

  // Helper to get ordinal suffix for a day
  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'],
      v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // Format date as "19th September"
  const formatDateWithOrdinal = (dateString: string) => {
    if (!dateString) return '';
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return dateString; // fallback if invalid
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('default', {month: 'long'});
    return `${getOrdinal(day)} ${month}`;
  };

  const renderCompletedPuja = (item: PujaItem, isLast: boolean) => (
    <View>
      <View style={styles.pujaItem}>
        <Image source={{uri: item.pooja_image_url}} style={styles.pujaImage} />
        <View style={styles.pujaContent}>
          <Text style={styles.pujaName}>{item.pooja_name}</Text>
          <Text style={styles.pujaDate}>
            {`Scheduled on ${formatDateWithOrdinal(item.booking_date)}`}
          </Text>
        </View>
      </View>
      {!isLast && <View style={styles.separator} />}
    </View>
  );

  const renderPendingPujaItem = (item: PendingPujaItem, isLast: boolean) => (
    <View key={item.id}>
      <View style={styles.pujaItem}>
        <View style={styles.pujaContent}>
          <View style={{flexDirection: 'row'}}>
            <Image
              source={{uri: item.pooja_image_url}}
              style={styles.pujaImage}
            />
            <View>
              <Text style={styles.pujaName}>{item.pooja_name}</Text>
              <Text
                style={
                  styles.pujaDate
                }>{`Scheduled on ${item.when_is_pooja}`}</Text>
            </View>
          </View>
          <View style={styles.pendingButtonRow}>
            <TouchableOpacity
              style={[styles.pendingButton, {backgroundColor: COLORS.success}]}
              onPress={() => handleAccept(item)}
              disabled={actionLoading}>
              <Text style={styles.pendingButtonText}>
                {t('accept') || 'Accept'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pendingButton, {backgroundColor: COLORS.error}]}
              onPress={() => handleReject(item)}
              disabled={actionLoading}>
              <Text style={styles.pendingButtonText}>
                {t('reject') || 'Reject'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {!isLast && <View style={styles.separator} />}
    </View>
  );

  // Render In-Progress Puja Item
  const renderInProgressPujaItem = (
    item: InProgressPujaItem,
    isLast: boolean,
  ) => (
    <TouchableOpacity
      key={item.id}
      onPress={() =>
        navigation.navigate('PujaDetailsScreen', {progress: true})
      }>
      <View style={styles.pujaItem}>
        <Image source={{uri: item.pooja_image_url}} style={styles.pujaImage} />
        <View style={styles.pujaContent}>
          <Text style={styles.pujaName}>{item.pooja_name}</Text>
          <Text style={styles.pujaDate}>
            {item.when_is_pooja
              ? `Scheduled on ${item.when_is_pooja}`
              : item.booking_date
              ? `Scheduled on ${formatDateWithOrdinal(item.booking_date)}`
              : ''}
          </Text>
        </View>
      </View>
      {!isLast && <View style={styles.separator} />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, {paddingTop: inset.top}]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Custom Header */}
      <UserCustomHeader
        title={t('home')}
        showBellButton={true}
        onNotificationPress={() => navigation.navigate('NotificationScreen')}
      />

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {loading || pendingLoading || inProgressLoading ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color={COLORS.primaryTextDark} />
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* In-Progress Puja's Section (at the top) */}
            {inProgressPujas && inProgressPujas.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {t('in_progress_puja') || 'In-Progress Puja'}
                </Text>
                <View style={[styles.pujaCard, THEMESHADOW.shadow]}>
                  {inProgressPujas.map((item, index) =>
                    renderInProgressPujaItem(
                      item,
                      index === inProgressPujas.length - 1,
                    ),
                  )}
                </View>
              </View>
            )}

            {/* Pending Puja's Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('pending_puja')}</Text>
              <View style={[styles.pujaCard, THEMESHADOW.shadow]}>
                {pendingPujas.length === 0 ? (
                  <Text
                    style={{
                      color: COLORS.pujaCardSubtext,
                      textAlign: 'center',
                      padding: 10,
                    }}>
                    {t('no_pending_puja')}
                  </Text>
                ) : (
                  pendingPujas.map((item, index) =>
                    renderPendingPujaItem(
                      item,
                      index === pendingPujas.length - 1,
                    ),
                  )
                )}
              </View>
            </View>

            {/* Upcoming Puja's Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('upcoming_puja')}</Text>
              <View style={[styles.pujaCard, THEMESHADOW.shadow]}>
                {upcomingPujas.length === 0 ? (
                  <Text
                    style={{
                      color: COLORS.pujaCardSubtext,
                      textAlign: 'center',
                      padding: 10,
                    }}>
                    {t('no_upcoming_puja')}
                  </Text>
                ) : (
                  upcomingPujas.map((item, index) =>
                    renderPujaItem(item, index === upcomingPujas.length - 1),
                  )
                )}
              </View>
            </View>

            {/* Completed Puja's Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('completed_puja')}</Text>
              <View style={[styles.pujaCard, THEMESHADOW.shadow]}>
                {completedPujas.length === 0 ? (
                  <Text
                    style={{
                      color: COLORS.pujaCardSubtext,
                      textAlign: 'center',
                      padding: 10,
                    }}>
                    {t('no_completed_puja')}
                  </Text>
                ) : (
                  completedPujas.map((item, index) =>
                    renderCompletedPuja(
                      item,
                      index === completedPujas.length - 1,
                    ),
                  )
                )}
              </View>
            </View>
          </ScrollView>
        )}
      </View>
      {/* Accept/Reject Modal */}
      <CustomModal
        visible={modalVisible}
        title={
          modalType === 'accept'
            ? t('accept_puja_title') || 'Accept Puja'
            : modalType === 'reject'
            ? t('reject_puja_title') || 'Reject Puja'
            : ''
        }
        message={
          modalType === 'accept'
            ? t('accept_puja_message', {
                pujaName: selectedPendingPuja
                  ? `: ${selectedPendingPuja.pooja_name}`
                  : '',
              })
            : modalType === 'reject'
            ? t('reject_puja_message', {
                pujaName: selectedPendingPuja
                  ? `: ${selectedPendingPuja.pooja_name}`
                  : '',
              })
            : ''
        }
        confirmText={
          modalType === 'accept'
            ? t('accept') || 'Accept'
            : modalType === 'reject'
            ? t('reject') || 'Reject'
            : ''
        }
        cancelText={t('cancel') || 'Cancel'}
        onConfirm={confirmModalAction}
        onCancel={closeModal}
        loading={actionLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.pujaBackground,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: moderateScale(24),
    paddingTop: verticalScale(24),
  },
  section: {
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.Sen_SemiBold,
    color: COLORS.primaryTextDark,
    marginBottom: verticalScale(12),
    fontWeight: '600',
  },
  pujaCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(10),
    padding: moderateScale(14),
    width: '100%',
  },
  pujaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(2),
  },
  pujaImage: {
    width: moderateScale(52),
    height: moderateScale(50),
    borderRadius: moderateScale(8),
    marginRight: moderateScale(12),
    resizeMode: 'cover',
  },
  pujaContent: {
    flex: 1,
    justifyContent: 'center',
  },
  pujaName: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Sen_SemiBold,
    color: COLORS.primaryTextDark,
    fontWeight: '600',
    letterSpacing: -0.33,
    lineHeight: moderateScale(20),
  },
  pujaDate: {
    fontSize: moderateScale(13),
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.pujaCardSubtext,
    fontWeight: '500',
    marginTop: verticalScale(4),
    lineHeight: moderateScale(18),
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.separatorColor,
    marginVertical: verticalScale(13),
    marginHorizontal: 0,
  },
  bottomPadding: {
    height: verticalScale(100),
  },
  pendingButtonRow: {
    flexDirection: 'row',
    marginTop: verticalScale(14),
    gap: moderateScale(10),
  },
  pendingButton: {
    flex: 1,
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(6),
    alignItems: 'center',
    marginHorizontal: moderateScale(2),
  },
  pendingButtonText: {
    color: COLORS.white,
    fontFamily: Fonts.Sen_SemiBold,
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
});

export default HomeScreen;
