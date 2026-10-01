import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import UserCustomHeader from '../../components/CustomHeader';
import { COLORS, THEMESHADOW } from '../../theme/theme';
import Fonts from '../../theme/fonts';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from 'react-i18next';
import {
  getPandingPuja,
  getUpcomingPuja,
  getCompletedPuja,
  getInProgressPuja,
  getCompletePujaList,
} from '../../api/apiService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import CustomeLoader from '../../components/CustomLoader';
import { translateData } from '../../utils/TranslateData';
import { useWebSocket } from '../../context/WebSocketContext';

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
  [key: string]: any;
}

interface InProgressPujaItem {
  id: string | number;
  pooja_name: string;
  when_is_pooja?: string;
  pooja_image_url?: string;
  booking_date: string;
}

const HomeScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation: any = useNavigation();
  const inset = useSafeAreaInsets();

  const [upcomingPujas, setUpcomingPujas] = useState<PujaItem[]>([]);
  const [completedPujas, setCompletedPujas] = useState<PujaItem[]>([]);
  const [pendingPujas, setPendingPujas] = useState<PendingPujaItem[]>([]);
  const [inProgressPujas, setInProgressPujas] = useState<InProgressPujaItem[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingLoading, setPendingLoading] = useState<boolean>(true);
  const [inProgressLoading, setInProgressLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);
  const currentLanguage = i18n.language;

  const { messages } = useWebSocket();

  console.log('WebSocket Messages in HomeScreen :: ', messages);

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
      ]: any = await Promise.all([
        getPandingPuja(),
        getUpcomingPuja(),
        getCompletePujaList(),
        getInProgressPuja(),
      ]);

      // Utility to extract array safely from various response formats
      const getArray = (res: any) => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.data?.results)) return res.data.results;
        if (Array.isArray(res?.results)) return res.results;
        if (Array.isArray(res?.data?.bookings)) return res.data.bookings;
        if (Array.isArray(res?.bookings)) return res.bookings;
        return [];
      };

      let pendingList = getArray(pendingResponse);
      let upcomingList = getArray(upcomingResponse);
      let completedList = getArray(completedResponse);
      let inProgressList = getArray(inProgressResponse);

      const [
        translatedPending,
        translatedUpcoming,
        translatedCompleted,
        translatedInProgress,
      ] = await Promise.all([
        translateData(pendingList, currentLanguage, [
          'pooja_name',
          'when_is_pooja',
        ]),
        translateData(upcomingList, currentLanguage, [
          'pooja_name',
          'when_is_pooja',
        ]),
        translateData(completedList, currentLanguage, ['pooja_name']),
        translateData(inProgressList, currentLanguage, ['pooja_name']),
      ]);

      // 1. Determine IDs that are already upcoming, completed, or in-progress
      const nonPendingIds = new Set<number>([
        ...upcomingList.map((p: any) => Number(p.id)),
        ...completedList.map((p: any) => Number(p.id ?? p.booking_id)),
        ...inProgressList.map((p: any) => Number(p.id)),
      ]);

      // 2. Filter out anything from translatedPending that is already resolved
      const validPending = (translatedPending as PendingPujaItem[]).filter(
        item => {
          const itemId = Number(item.id);
          const status = (item.booking_status || '').toLowerCase();
          return (
            !nonPendingIds.has(itemId) &&
            status !== 'accepted' &&
            status !== 'completed' &&
            status !== 'cancelled' &&
            status !== 'rejected'
          );
        },
      );

      // 3. Merge with prev state to keep ephemeral WS items, strictly excluding nonPendingIds
      setPendingPujas(prev => {
        const apiMap = new Map(validPending.map(p => [Number(p.id), p]));
        const merged = [...validPending];

        prev.forEach(item => {
          const itemId = Number(item.id);
          const status = (item.booking_status || '').toLowerCase();
          if (
            !apiMap.has(itemId) &&
            !nonPendingIds.has(itemId) &&
            status !== 'accepted' &&
            status !== 'completed' &&
            status !== 'cancelled' &&
            status !== 'rejected'
          ) {
            merged.unshift(item);
          }
        });
        return merged;
      });
      setUpcomingPujas(translatedUpcoming as PujaItem[]);
      setCompletedPujas(translatedCompleted as PujaItem[]);
      setInProgressPujas(translatedInProgress as InProgressPujaItem[]);
    } catch (error) {
      console.error('Error in fetchAllPujas:', error);
    } finally {
      setPendingLoading(false);
      setLoading(false);
      setInProgressLoading(false);
    }
  }, [currentLanguage]);

  useFocusEffect(
    useCallback(() => {
      fetchAllPujas();
    }, [fetchAllPujas]),
  );

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const latest = messages[messages.length - 1];
    if (!latest) return;

    console.log(
      '🔔 WS message received in HomeScreen:',
      latest.type,
      latest.action,
    );

    // 1. Initial list from socket on connect
    if (latest.type === 'initial_list' && Array.isArray(latest.bookings)) {
      if (latest.bookings.length > 0) {
        setPendingPujas(prev => {
          const existingIds = new Set(prev.map(p => Number(p.id)));
          const newItems = latest.bookings
            .filter((b: any) => !existingIds.has(Number(b.id)))
            .map((b: any) => ({
              id: b.id,
              pooja_name: b.pooja_name,
              when_is_pooja: b.when_is_pooja || 'Today',
              pooja_image_url: b.pooja_image_url,
              ...b,
            }));
          return [...newItems, ...prev];
        });
      }
      return;
    }

    // 2. Real-time booking request events
    if (latest.type === 'booking_request') {
      const bookingId = Number(latest.booking_id || latest.booking?.id);

      if (latest.action === 'created' && latest.booking) {
        const newBooking: PendingPujaItem = {
          id: latest.booking.id,
          pooja_name: latest.booking.pooja_name,
          when_is_pooja: latest.booking.when_is_pooja || 'Today',
          pooja_image_url: latest.booking.pooja_image_url,
          ...latest.booking,
        };

        setPendingPujas(prev => {
          if (prev.some(p => Number(p.id) === Number(newBooking.id))) {
            return prev;
          }
          console.log(
            '✅ Added real-time booking request to pendingPujas:',
            newBooking.id,
          );
          return [newBooking, ...prev];
        });
      } else if (
        ['accepted', 'rejected', 'expired', 'cancelled'].includes(latest.action)
      ) {
        console.log(
          '🗑️ Removing resolved booking from pendingPujas:',
          bookingId,
        );
        setPendingPujas(prev => prev.filter(p => Number(p.id) !== bookingId));

        if (latest.action === 'accepted' && latest.booking) {
          setUpcomingPujas(prev => {
            if (prev.some(p => Number(p.id) === bookingId)) return prev;
            return [latest.booking, ...prev];
          });
        }
      }

      // Background refresh all lists (e.g. upcoming after accept)
      clearTimeout((HomeScreen as any)._pujaTimeout);
      (HomeScreen as any)._pujaTimeout = setTimeout(() => {
        fetchAllPujas();
      }, 500);
    }
  }, [messages, fetchAllPujas]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllPujas();
    setRefreshing(false);
  };

  // upcoming pujas
  const renderPujaItem = (
    item: PujaItem,
    isLast: boolean,
    index: number,
  ) => (
    <TouchableOpacity
      key={item.id ? `upcoming-${item.id}` : `upcoming-${index}`}
      onPress={() => navigation.navigate('PujaDetailsScreen', { id: item.id })}
    >
      <View style={styles.pujaItem}>
        <Image
          source={{ uri: item.pooja_image_url }}
          style={styles.pujaImage}
        />
        <View style={styles.pujaContent}>
          <Text style={styles.pujaName}>{item.pooja_name}</Text>
          <Text style={styles.pujaDate}>
            {t('scheduled_on')} {item.when_is_pooja}
          </Text>
        </View>
      </View>
      {!isLast && <View style={styles.separator} />}
    </TouchableOpacity>
  );

  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'],
      v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const formatDateWithOrdinal = (dateString: string) => {
    if (!dateString) return '';
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return dateString;
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('default', { month: 'long' });
    return `${getOrdinal(day)} ${month}`;
  };

  const renderCompletedPuja = (
    item: any,
    isLast: boolean,
    index: number,
  ) => (
    <TouchableOpacity
      key={
        item.booking_id ?? item.id
          ? `completed-${item.booking_id ?? item.id}`
          : `completed-${index}`
      }
      onPress={() =>
        navigation.navigate('CompletePujaDetailsScreen', {
          booking_id: item.booking_id,
          completed: true,
        })
      }
    >
      <View style={styles.pujaItem}>
        <Image source={{ uri: item.image_url }} style={styles.pujaImage} />
        <View style={styles.pujaContent}>
          <Text style={styles.pujaName}>{item.title}</Text>
          <Text style={styles.pujaDate}>
            {t('scheduled_on')} {formatDateWithOrdinal(item.booking_date)}
          </Text>
        </View>
      </View>
      {!isLast && <View style={styles.separator} />}
    </TouchableOpacity>
  );

  const renderPendingPujaItem = (
    item: PendingPujaItem,
    isLast: boolean,
    index: number,
  ) => (
    <TouchableOpacity
      key={item.id ? `pending-${item.id}` : `pending-${index}`}
      onPress={() =>
        navigation.navigate('WaitingApprovalPujaScreen', {
          booking_id: item.id,
        })
      }
    >
      <View style={styles.pujaItem}>
        <View style={styles.pujaContent}>
          <View style={{ flexDirection: 'row' }}>
            <Image
              source={{ uri: item.pooja_image_url }}
              style={styles.pujaImage}
            />
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={styles.pujaName}>{item.pooja_name}</Text>
              <Text style={styles.pujaDate}>
                {t('scheduled_on')} {item.when_is_pooja}
              </Text>
            </View>
          </View>
        </View>
      </View>
      {!isLast && <View style={styles.separator} />}
    </TouchableOpacity>
  );

  const renderInProgressPujaItem = (
    item: InProgressPujaItem,
    isLast: boolean,
    index: number,
  ) => (
    <TouchableOpacity
      key={item.id ? `in-progress-${item.id}` : `in-progress-${index}`}
      onPress={() =>
        navigation.navigate('PujaDetailsScreen', {
          progress: true,
          id: item.id,
        })
      }
    >
      <View style={styles.pujaItem}>
        <Image
          source={{ uri: item.pooja_image_url }}
          style={styles.pujaImage}
        />
        <View style={styles.pujaContent}>
          <Text style={styles.pujaName}>{item.pooja_name}</Text>
          <Text style={styles.pujaDate}>
            {item.when_is_pooja
              ? `${t('scheduled_on')} ${item.when_is_pooja}`
              : `${t('scheduled_on')} ${formatDateWithOrdinal(
                  item.booking_date,
                )}`}
          </Text>
        </View>
      </View>
      {!isLast && <View style={styles.separator} />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: inset.top }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <UserCustomHeader title={t('home')} />

      <View style={styles.contentContainer}>
        {loading || pendingLoading || inProgressLoading ? (
          <CustomeLoader
            loading={loading || pendingLoading || inProgressLoading}
          />
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
          >
            {/* In Progress */}
            {inProgressPujas.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('in_progress_puja')}</Text>
                <View style={[styles.pujaCard, THEMESHADOW.shadow]}>
                  {inProgressPujas.map((item, index) =>
                    renderInProgressPujaItem(
                      item,
                      index === inProgressPujas.length - 1,
                      index,
                    ),
                  )}
                </View>
              </View>
            )}

            {/* waiting for approval */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('pending_puja')}</Text>
              <View style={[styles.pujaCard, THEMESHADOW.shadow]}>
                {pendingPujas.length === 0 ? (
                  <Text style={styles.emptyText}>{t('no_pending_puja')}</Text>
                ) : (
                  pendingPujas.map((item, index) =>
                    renderPendingPujaItem(
                      item,
                      index === pendingPujas.length - 1,
                      index,
                    ),
                  )
                )}
              </View>
            </View>

            {/* Upcoming */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('upcoming_puja')}</Text>
              <View style={[styles.pujaCard, THEMESHADOW.shadow]}>
                {upcomingPujas.length === 0 ? (
                  <Text style={styles.emptyText}>{t('no_upcoming_puja')}</Text>
                ) : (
                  upcomingPujas.map((item, index) =>
                    renderPujaItem(
                      item,
                      index === upcomingPujas.length - 1,
                      index,
                    ),
                  )
                )}
              </View>
            </View>

            {/* Completed */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('completed_puja')}</Text>
              <View style={[styles.pujaCard, THEMESHADOW.shadow]}>
                {completedPujas.length === 0 ? (
                  <Text style={styles.emptyText}>{t('no_completed_puja')}</Text>
                ) : (
                  completedPujas.map((item, index) =>
                    renderCompletedPuja(
                      item,
                      index === completedPujas.length - 1,
                      index,
                    ),
                  )
                )}
              </View>
            </View>
          </ScrollView>
        )}
      </View>
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
    flexGrow: 1,
    fontSize: moderateScale(18),
    fontFamily: Fonts.Sen_SemiBold,
    color: COLORS.primaryTextDark,
    marginBottom: verticalScale(12),
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
  },
  pujaDate: {
    fontSize: moderateScale(13),
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.pujaCardSubtext,
    fontWeight: '500',
    marginTop: verticalScale(4),
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
  emptyText: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Sen_Medium,
    color: COLORS.primaryTextDark,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default HomeScreen;
