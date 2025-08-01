import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import UserCustomHeader from '../../components/CustomHeader';
import {apiService, getPastBookings} from '../../api/apiService';
import {useNavigation} from '@react-navigation/native';
import {COLORS, THEMESHADOW} from '../../theme/theme';
import Fonts from '../../theme/fonts';
import {useTranslation} from 'react-i18next';
import {moderateScale} from 'react-native-size-matters';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// Type for a booking item as per API response
type PastBookingType = {
  id: number;
  pooja_name: string;
  pooja_image_url: string;
  booking_status: string;
  booking_date: string;
  // ...other fields as needed
};

const PastPujaScreen: React.FC = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [pastBookings, setPastBookings] = useState<PastBookingType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Fetch bookings from API
  const fetchPastBookings = useCallback(async () => {
    setLoading(true);
    try {
      const bookings: any = await getPastBookings();
      // bookings.data is expected to be an array of booking objects
      setPastBookings(Array.isArray(bookings?.data) ? bookings.data : []);
    } catch (error) {
      setPastBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPastBookings();
  }, [fetchPastBookings]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPastBookings();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '#00A40E'; // Green
      case 'cancelled':
        return '#E5AA0E'; // Orange
      case 'rejected':
        return '#FA1927'; // Red
      case 'pending':
      case 'panding':
        return COLORS.gray;
      default:
        return COLORS.gray;
    }
  };

  const formatDate = (dateString: string) => {
    // Format date to match design: "Scheduled for 6th September 2024"
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

  // Render a single booking item
  const renderBookingItem = ({item}: {item: PastBookingType}) => {
    return (
      <TouchableOpacity style={styles.bookingItem} activeOpacity={0.7}>
        <Image
          source={{uri: item.pooja_image_url}}
          style={styles.bookingImage}
        />
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
          <Text style={styles.bookingDate}>
            {formatDate(item.booking_date)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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
        <ScrollView>
          <View style={[styles.listContainer, THEMESHADOW.shadow]}>
            {loading ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : (
              <FlatList
                data={pastBookings}
                renderItem={renderBookingItem}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                ItemSeparatorComponent={renderSeparator}
                contentContainerStyle={[styles.flatListContent]}
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
                  <View style={{alignItems: 'center', marginTop: 40}}>
                    <Text
                      style={{
                        color: COLORS.gray,
                        fontFamily: Fonts.Sen_Medium,
                        fontSize: 16,
                      }}>
                      {t('no_item_available')}
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </ScrollView>
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
  },
  listContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    margin: 24,
  },
  flatListContent: {
    // flexGrow: 1,
  },
  bookingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 0,
    minHeight: 52,
  },
  bookingImage: {
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: 10,
    marginRight: 9,
    flexShrink: 0,
  },
  bookingInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 7,
    gap: 20,
  },
  bookingTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: COLORS.primaryTextDark,
    fontFamily: Fonts.Sen_SemiBold,
    letterSpacing: -0.33,
    flex: 1,
    flexShrink: 1,
  },
  statusText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    fontFamily: Fonts.Sen_SemiBold,
    textAlign: 'right',
    flexShrink: 0,
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
    flexShrink: 0,
  },
});

export default PastPujaScreen;
