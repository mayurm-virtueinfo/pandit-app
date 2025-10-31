import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import UserCustomHeader from '../../components/CustomHeader';
import {getPastBookings} from '../../api/apiService';
import {useNavigation} from '@react-navigation/native';
import {COLORS, THEMESHADOW} from '../../theme/theme';
import Fonts from '../../theme/fonts';
import {useTranslation} from 'react-i18next';
import {moderateScale} from 'react-native-size-matters';
import {translateData} from '../../utils/TranslateData';

type PastBookingType = {
  id: number;
  pooja_name: string;
  pooja_image_url: string;
  booking_status: string;
  booking_date: string;
};

const PastPujaScreen: React.FC = () => {
  const {t, i18n} = useTranslation();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const currentLanguage = i18n.language || 'en';
  const [pastBookings, setPastBookings] = useState<PastBookingType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // 🧠 cache translation per language
  const translationCacheRef = useRef<Map<string, any>>(new Map());

  // 🛠 Fetch and translate past bookings
  const fetchPastBookings = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      try {
        if (!forceRefresh) {
          const cached = translationCacheRef.current.get(currentLanguage);
          if (cached) {
            setPastBookings(cached);
            return;
          }
        }

        const response: any = await getPastBookings();
        const rawData = Array.isArray(response?.data) ? response.data : [];

        console.log('rawData :: ', rawData);

        // 🌍 translate fields
        const translated: any = await translateData(rawData, currentLanguage, [
          'pooja_name',
          'booking_status',
        ]);

        // 🧠 cache result
        translationCacheRef.current.set(currentLanguage, translated);

        setPastBookings(translated);
      } catch (error) {
        console.log('Error fetching past bookings:', error);
        setPastBookings([]);
      } finally {
        setLoading(false);
      }
    },
    [currentLanguage],
  );

  // 🔁 Run on mount + when language changes
  useEffect(() => {
    fetchPastBookings(true);
  }, [fetchPastBookings, currentLanguage]);

  // 🔄 Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPastBookings(true);
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '#00A40E';
      case 'cancelled':
        return '#E5AA0E';
      case 'rejected':
        return '#FA1927';
      case 'pending':
      case 'panding':
        return COLORS.gray;
      default:
        return COLORS.gray;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', {month: 'long'});
    const year = date.getFullYear();
    const suffix =
      day === 1 || day === 21 || day === 31
        ? 'st'
        : day === 2 || day === 22
        ? 'nd'
        : day === 3 || day === 23
        ? 'rd'
        : 'th';
    return `Scheduled for ${day}${suffix} ${month} ${year}`;
  };

  const renderBookingItem = ({item}: {item: PastBookingType}) => (
    <TouchableOpacity
      style={styles.bookingItem}
      activeOpacity={0.7}
      onPress={() =>
        navigation.navigate('CompletePujaDetailsScreen', {
          booking_id: item.id,
        })
      }>
      <Image source={{uri: item.pooja_image_url}} style={styles.bookingImage} />
      <View style={styles.bookingInfo}>
        <View style={styles.bookingHeader}>
          <Text style={styles.bookingTitle} numberOfLines={1}>
            {item.pooja_name}
          </Text>
          <Text
            style={[
              styles.statusText,
              {color: getStatusColor(item.booking_status)},
            ]}>
            {item.booking_status.charAt(0).toUpperCase() +
              item.booking_status.slice(1)}
          </Text>
        </View>
        <Text style={styles.bookingDate}>{formatDate(item.booking_date)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <UserCustomHeader title={t('past_bookings')} showBackButton={true} />

      <View style={styles.contentContainer}>
        <View style={[styles.listContainer, THEMESHADOW.shadow]}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <FlatList
              data={pastBookings}
              renderItem={renderBookingItem}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              ItemSeparatorComponent={renderSeparator}
              contentContainerStyle={styles.flatListContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={COLORS.primary}
                  colors={[COLORS.primary]}
                />
              }
              ListEmptyComponent={
                <View style={{alignItems: 'center', margin: 20}}>
                  <Text style={styles.emptyText}>{t('no_item_available')}</Text>
                </View>
              }
            />
          )}
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
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },
  listContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
  },
  loaderContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  bookingItem: {flexDirection: 'row', alignItems: 'flex-start', minHeight: 52},
  bookingImage: {
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: 10,
    marginRight: 9,
  },
  bookingInfo: {flex: 1, justifyContent: 'center'},
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
    gap: 20,
  },
  bookingTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: COLORS.primaryTextDark,
    fontFamily: Fonts.Sen_SemiBold,
    flex: 1,
  },
  statusText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    fontFamily: Fonts.Sen_SemiBold,
  },
  bookingDate: {
    fontSize: moderateScale(13),
    fontWeight: '500',
    color: COLORS.pujaCardSubtext,
    fontFamily: Fonts.Sen_Medium,
    lineHeight: 16,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.separatorColor,
    marginVertical: 13,
  },
  flatListContent: {},
  emptyText: {
    color: COLORS.gray,
    fontFamily: Fonts.Sen_Medium,
    fontSize: 16,
  },
});

export default PastPujaScreen;
